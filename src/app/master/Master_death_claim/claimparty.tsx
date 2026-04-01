'use client';

import { useState, useRef, useEffect } from 'react';
import { getParties, createParty, updateParty, deleteParty, Party } from '@/lib/master/party';

const STATUSES = ['ACTIVE', 'INACTIVE', 'DEPRECATED'];
const PARTY_TYPES = ['Individual', 'Organization', 'Government', 'Trust'];
const GENDERS = ['Male', 'Female', 'Other', 'Prefer not to say'];

const PAGE_SIZE = 10;

const COLUMNS = [
  { key: 'party_id', label: 'Party ID' },
  { key: 'party_type', label: 'Party Type' },
  { key: 'first_name', label: 'First Name' },
  { key: 'last_name', label: 'Last Name' },
  { key: 'gender', label: 'Gender' },
  { key: 'date_of_birth', label: 'Date of Birth' },
  { key: 'contact_number', label: 'Contact' },
  { key: 'national_id', label: 'National ID' },
  { key: 'effective_start_date', label: 'Effective Date' },
  { key: 'effective_end_date', label: 'End Date' },
  { key: 'status', label: 'Status' },
];

const STATUS_STYLES: Record<string, { color: string; bg: string; border: string }> = {
  ACTIVE: { color: '#15803d', bg: '#dcfce7', border: '#bbf7d0' },
  INACTIVE: { color: '#6b7280', bg: '#f3f4f6', border: '#e5e7eb' },
  DEPRECATED: { color: '#b45309', bg: '#fef3c7', border: '#fde68a' },
};

// ── Icons ──────────────────────────────────────────────────────────
const EditIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);
const TrashIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6M14 11v6" />
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
  </svg>
);
const UploadIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);
const TemplateIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <line x1="3" y1="9" x2="21" y2="9" /><line x1="9" y1="21" x2="9" y2="9" />
  </svg>
);
const ExportIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);
const PlusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);
const ChevLeft = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);
const ChevRight = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

export default function PartyTab() {
  const [data, setData] = useState<Party[]>([]);
  const [page, setPage] = useState(1);
  const [toast, setToast] = useState<string | null>(null);
  const [selectedRow, setSelectedRow] = useState<Party | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const result = await getParties();
      setData(Array.isArray(result) ? result : []);
    } catch (err) {
      showToast('Error fetching data');
      setData([]);
    }
  };

  const totalPages = Math.ceil(data.length / PAGE_SIZE);
  const paged = Array.isArray(data) ? data.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE) : [];

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const formatDate = (value?: string | null) => {
    if (!value) return '-';
    const date = new Date(value);
    if (!isNaN(date.getTime())) {
      const mm = String(date.getMonth() + 1).padStart(2, '0');
      const dd = String(date.getDate()).padStart(2, '0');
      const yyyy = date.getFullYear();
      return `${mm}-${dd}-${yyyy}`;
    }
    const parts = value.split('-');
    if (parts.length >= 3) {
      const [y, m, d] = parts;
      const day = d.length > 2 ? d.slice(0, 2) : d;
      return `${m.padStart(2, '0')}-${day.padStart(2, '0')}-${y}`;
    }
    return value;
  };

  const formatGender = (gender?: string | null) => {
    if (!gender) return '-';
    switch (gender) {
      case 'M':
        return 'Male';
      case 'F':
        return 'Female';
      case 'UNKNOWN':
        return 'Other';
      default:
        return gender;
    }
  };

  const formatStatus = (status?: string | null) => {
    if (!status) return '-';
    return `${status.slice(0, 1).toUpperCase()}${status.slice(1).toLowerCase()}`;
  };

  const backendToFrontendGender = (gender?: string | null) => {
    if (!gender) return '';
    switch (gender) {
      case 'M':
        return 'Male';
      case 'F':
        return 'Female';
      case 'UNKNOWN':
        return 'Other';
      default:
        return gender;
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteParty(id);
      setData(prev => prev.filter(r => r.party_id !== id));
      showToast(`Record #${id} deleted successfully.`);
      setConfirmDelete(null);
      if (selectedRow?.party_id === id) setSelectedRow(null);
    } catch (err) {
      showToast('Failed to delete');
    }
  };

  const handleEdit = (row: Party) => setSelectedRow(row);

  const handleSave = async (e: React.FormEvent<HTMLFormElement>, id?: number) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const payload: any = {};
    formData.forEach((value, key) => {
      if (value !== '' && key !== 'party_id') {
        payload[key] = value;
      }
    });

    // Convert gender values to backend format
    if (payload.gender) {
      switch (payload.gender) {
        case 'Male':
          payload.gender = 'M';
          break;
        case 'Female':
          payload.gender = 'F';
          break;
        case 'Other':
        case 'Prefer not to say':
          payload.gender = 'UNKNOWN';
          break;
      }
    }

    console.log('SENDING TO BACKEND:', payload);
    try {
      if (id) {
        await updateParty(id, payload as Partial<Party>);
        showToast('Record updated successfully.');
      } else {
        await createParty(payload as Party);
        showToast('New party added.');
      }
      fetchData();
      setSelectedRow(null);
      setShowAddModal(false);
    } catch (err: any) {
      console.error('API ERROR:', err);
      showToast('Error saving record: ' + (err.message || 'Check terminal'));
    }
  };

  const handleExport = () => {
    const header = COLUMNS.map(c => c.label).join(',');
    const rows = data.map(r =>
      [r.party_id, r.party_type, `"${r.first_name}"`, `"${r.last_name}"`,
        formatGender(r.gender), formatDate(r.date_of_birth), r.contact_number,
        r.email, r.national_id,
        formatDate(r.effective_start_date), formatDate(r.effective_end_date),
        r.version, formatStatus(r.status)].join(',')
    );
    const blob = new Blob([[header, ...rows].join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = Object.assign(document.createElement('a'), { href: url, download: 'party_export.csv' });
    a.click(); URL.revokeObjectURL(url);
    showToast('Export started.');
  };

  const handleTemplate = () => {
    const header = COLUMNS.map(c => c.key).join(',');
    const blob = new Blob([header], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = Object.assign(document.createElement('a'), { href: url, download: 'party_template.csv' });
    a.click(); URL.revokeObjectURL(url);
    showToast('Template downloaded.');
  };

  const ActionBtn = ({
    title, icon, color, bg, border, hoverBg, onClick,
  }: {
    title: string; icon: React.ReactNode;
    color: string; bg: string; border: string; hoverBg: string;
    onClick: () => void;
  }) => (
    <button
      title={title}
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        width: 32, height: 32, color, background: bg,
        border: `1px solid ${border}`, borderRadius: 8,
        cursor: 'pointer', transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)', flexShrink: 0,
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = hoverBg;
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 6px 12px -2px rgba(0,0,0,0.12)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = bg;
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {icon}
    </button>
  );

  const thStyle: React.CSSProperties = {
    padding: '11px 14px', textAlign: 'left',
    fontWeight: 700, color: '#0f172a',
    whiteSpace: 'nowrap', fontSize: 13,
    borderBottom: '2px solid #e2e8f0',
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 14px', fontSize: 13,
    border: '1px solid #cbd5e1', borderRadius: 8, outline: 'none', color: '#1e293b',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 8,
  };

  return (
    <div style={{ padding: '8px 20px 16px', position: 'relative', zIndex: 1 }}>
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        background: '#ffffff', zIndex: -1,
      }} />

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: 24, right: 24, zIndex: 9999,
          background: '#1e293b', color: '#fff',
          padding: '10px 20px', borderRadius: 8, fontSize: 13,
          boxShadow: '0 4px 16px rgba(0,0,0,0.18)',
        }}>
          {toast}
        </div>
      )}

      {/* Page header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', margin: 0 }}>Master Party</h2>
          <p style={{ fontSize: 12, color: '#64748b', margin: '2px 0 0' }}>Manage and review all claim parties</p>
        </div>

        {/* Toolbar */}
        <div style={{ display: 'flex', gap: 10 }}>
          {([
            { label: 'Upload Excel', icon: <UploadIcon />, onClick: () => setShowUploadModal(true), dark: false },
            { label: 'Template', icon: <TemplateIcon />, onClick: handleTemplate, dark: false },
            { label: 'Export', icon: <ExportIcon />, onClick: handleExport, dark: false },
            { label: 'Add New Party', icon: <PlusIcon />, onClick: () => setShowAddModal(true), dark: true },
          ] as const).map(btn => (
            <button
              key={btn.label}
              onClick={btn.onClick}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '8px 14px', fontSize: 13, fontWeight: 500, borderRadius: 6,
                color: btn.dark ? '#fff' : '#1e293b',
                background: btn.dark ? '#0f172a' : '#f1f5f9',
                border: `1px solid ${btn.dark ? '#0f172a' : '#cbd5e1'}`,
                cursor: 'pointer', transition: 'background 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = btn.dark ? '#1e293b' : '#e2e8f0')}
              onMouseLeave={e => (e.currentTarget.style.background = btn.dark ? '#0f172a' : '#f1f5f9')}
            >
              {btn.icon} {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table card */}
      <div style={{ border: '1px solid #e2e8f0', borderRadius: 10, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', background: '#ffffff' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#ffffff' }}>
                {COLUMNS.map(col => <th key={col.key} style={thStyle}>{col.label}</th>)}
                <th style={{ ...thStyle, textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paged.map((row) => {
                const st = (row.status && STATUS_STYLES[row.status]) || STATUS_STYLES['INACTIVE'];
                const rowBg = '#ffffff';
                const tdBase: React.CSSProperties = { padding: '10px 14px', color: '#0f172a', whiteSpace: 'nowrap' };

                return (
                  <tr
                    key={row.party_id}
                    style={{ background: rowBg, borderBottom: '1px solid #e2e8f0', transition: 'background 0.1s' }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#f8fafc')}
                    onMouseLeave={e => (e.currentTarget.style.background = rowBg)}
                  >
                    <td style={tdBase}>{row.party_id}</td>
                    <td style={tdBase}>{row.party_type}</td>
                    <td style={tdBase}>{row.first_name}</td>
                    <td style={tdBase}>{row.last_name}</td>
                    <td style={tdBase}>{formatGender(row.gender)}</td>
                    <td style={tdBase}>{formatDate(row.date_of_birth)}</td>
                    <td style={tdBase}>{row.contact_number}</td>
                    <td style={tdBase}>{row.national_id}</td>
                    <td style={tdBase}>{formatDate(row.effective_start_date)}</td>
                    <td style={tdBase}>{formatDate(row.effective_end_date)}</td>
                    <td style={{ ...tdBase }}>
                      <span style={{
                        display: 'inline-block', padding: '3px 10px',
                        fontSize: 12, fontWeight: 600, borderRadius: 20,
                        color: st.color, background: st.bg, border: `1px solid ${st.border}`,
                      }}>
                        {formatStatus(row.status)}
                      </span>
                    </td>

                    <td style={{ ...tdBase, textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                        <ActionBtn title="Edit / View" icon={<EditIcon />} color="#15803d" bg="#dcfce7" border="#bbf7d0" hoverBg="#bbf7d0" onClick={() => handleEdit(row)} />
                        <ActionBtn title="Delete" icon={<TrashIcon />} color="#b91c1c" bg="#fee2e2" border="#fecaca" hoverBg="#fecaca" onClick={() => row.party_id && setConfirmDelete(row.party_id)} />
                      </div>
                    </td>
                  </tr>
                );
              })}

              {paged.length === 0 && (
                <tr>
                  <td colSpan={COLUMNS.length + 1}
                    style={{ padding: 32, textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>
                    No records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '12px 16px', borderTop: '1px solid #e2e8f0', background: '#f8fafc',
        }}>
          <span style={{ fontSize: 13, color: '#64748b' }}>
            Showing {Math.min((page - 1) * PAGE_SIZE + 1, data.length)}–{Math.min(page * PAGE_SIZE, data.length)} of {data.length} records
          </span>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: 32, height: 32, border: '1px solid #cbd5e1', borderRadius: 6,
                background: page === 1 ? '#f1f5f9' : '#fff', color: page === 1 ? '#94a3b8' : '#0f172a',
                cursor: page === 1 ? 'not-allowed' : 'pointer',
              }}>
              <ChevLeft />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setPage(p)}
                style={{
                  width: 32, height: 32, border: '1px solid',
                  borderColor: p === page ? '#0f172a' : '#cbd5e1',
                  borderRadius: 6, background: p === page ? '#0f172a' : '#fff',
                  color: p === page ? '#fff' : '#0f172a',
                  fontSize: 13, fontWeight: p === page ? 700 : 400, cursor: 'pointer',
                }}>
                {p}
              </button>
            ))}

            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: 32, height: 32, border: '1px solid #cbd5e1', borderRadius: 6,
                background: page === totalPages ? '#f1f5f9' : '#fff',
                color: page === totalPages ? '#94a3b8' : '#0f172a',
                cursor: page === totalPages ? 'not-allowed' : 'pointer',
              }}>
              <ChevRight />
            </button>
          </div>
        </div>
      </div>

      {/* ── Edit Modal ─────────────────────────────────────────────── */}
      {selectedRow && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', zIndex: 99999, backdropFilter: 'blur(3px)',
        }} onClick={() => setSelectedRow(null)}>
          <div style={{
            background: '#fff', width: '90%', maxWidth: 520, borderRadius: 12,
            display: 'flex', flexDirection: 'column', maxHeight: '88vh',
            overflow: 'hidden', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.2)',
          }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '18px 28px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0, background: 'linear-gradient(90deg, #1e40af 0%, #2563eb 100%)' }}>
              <h3 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#fff' }}>Edit Party</h3>
              <button onClick={() => setSelectedRow(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 24, color: '#fff' }}>&times;</button>
            </div>

            <form onSubmit={(e) => handleSave(e, selectedRow.party_id)} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
              <div style={{ padding: '0 32px', flex: 1, overflowY: 'auto', minHeight: 0 }}>
                <div style={{ height: 1.5, background: '#f1f5f9', margin: '0 -32px 24px' }} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px 24px', paddingBottom: 24 }}>

                  {/* Party ID - read only */}
                  <div>
                    <label style={labelStyle}>Party ID</label>
                    <input name="party_id" type="text" defaultValue={String(selectedRow.party_id || '')} readOnly style={{ ...inputStyle, background: '#f8fafc' }} />
                  </div>

                  {/* Party Type */}
                  <div>
                    <label style={labelStyle}>Party Type</label>
                    <div style={{ position: 'relative' }}>
                      <select name="party_type" defaultValue={selectedRow.party_type || ''} style={{ ...inputStyle, appearance: 'none', background: '#fff' }}>
                        <option value="">Select type...</option>
                        {PARTY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                      <div style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#64748b' }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
                      </div>
                    </div>
                  </div>

                  {/* First Name */}
                  <div>
                    <label style={labelStyle}>First Name</label>
                    <input name="first_name" type="text" defaultValue={selectedRow.first_name || ''} style={inputStyle} />
                  </div>

                  {/* Last Name */}
                  <div>
                    <label style={labelStyle}>Last Name</label>
                    <input name="last_name" type="text" defaultValue={selectedRow.last_name || ''} style={inputStyle} />
                  </div>

                  {/* Gender */}
                  <div>
                    <label style={labelStyle}>Gender</label>
                    <div style={{ position: 'relative' }}>
                      <select name="gender" defaultValue={backendToFrontendGender(selectedRow.gender)} style={{ ...inputStyle, appearance: 'none', background: '#fff' }}>
                        <option value="">Select gender...</option>
                        {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
                      </select>
                      <div style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#64748b' }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
                      </div>
                    </div>
                  </div>

                  {/* Date of Birth */}
                  <div>
                    <label style={labelStyle}>Date of Birth</label>
                    <input name="date_of_birth" type="date" defaultValue={selectedRow.date_of_birth || ''} style={inputStyle} />
                  </div>

                  {/* Contact Number */}
                  <div>
                    <label style={labelStyle}>Contact Number</label>
                    <input name="contact_number" type="text" defaultValue={selectedRow.contact_number || ''} style={inputStyle} />
                  </div>

                  {/* Email */}
                  <div>
                    <label style={labelStyle}>Email</label>
                    <input name="email" type="email" defaultValue={selectedRow.email || ''} style={inputStyle} />
                  </div>

                  {/* Address - span 2 */}
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={labelStyle}>Address</label>
                    <textarea name="address" rows={2} defaultValue={selectedRow.address || ''} style={{ ...inputStyle, resize: 'none' }} />
                  </div>

                  {/* National ID */}
                  <div>
                    <label style={labelStyle}>National ID</label>
                    <input name="national_id" type="text" defaultValue={selectedRow.national_id || ''} style={inputStyle} />
                  </div>

                  {/* SSN */}
                  <div>
                    <label style={labelStyle}>SSN</label>
                    <input name="ssn" type="text" defaultValue={selectedRow.ssn || ''} style={inputStyle} />
                  </div>

                  {/* Effective Date */}
                  <div>
                    <label style={labelStyle}>Effective Date</label>
                    <input name="effective_start_date" type="date" defaultValue={selectedRow.effective_start_date || ''} style={inputStyle} />
                  </div>

                  {/* End Date */}
                  <div>
                    <label style={labelStyle}>End Date</label>
                    <input name="effective_end_date" type="date" defaultValue={selectedRow.effective_end_date || ''} style={inputStyle} />
                  </div>

                  {/* Version */}
                  <div>
                    <label style={labelStyle}>Version</label>
                    <input name="version" type="number" defaultValue={selectedRow.version ?? ''} style={inputStyle} />
                  </div>

                  {/* Status */}
                  <div>
                    <label style={labelStyle}>Status</label>
                    <div style={{ position: 'relative' }}>
                      <select name="status" defaultValue={selectedRow.status || ''} style={{ ...inputStyle, appearance: 'none', background: '#fff' }}>
                        {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <div style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#64748b' }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
                      </div>
                    </div>
                  </div>

                  {/* Updated By */}
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={labelStyle}>Updated By</label>
                    <input name="updated_by" type="text" defaultValue={selectedRow.updated_by ?? ''} style={inputStyle} />
                  </div>

                  {/* Deleted By */}
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={labelStyle}>Deleted By</label>
                    <input name="deleted_by" type="text" defaultValue={selectedRow.deleted_by ?? ''} readOnly style={{ ...inputStyle, background: '#f8fafc' }} />
                  </div>

                </div>
              </div>

              <div style={{ padding: '24px 32px 32px', display: 'flex', gap: 16, flexShrink: 0 }}>
                <button type="button" onClick={() => setSelectedRow(null)}
                  style={{ flex: 1, padding: '10px', borderRadius: 8, border: '1px solid #cbd5e1', background: '#f8fafc', fontSize: 14, fontWeight: 600, color: '#1e293b', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit"
                  style={{ flex: 1, padding: '10px', borderRadius: 8, border: 'none', background: '#2563eb', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', boxShadow: '0 5px 10px rgba(37,99,235,0.35)' }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#1d4ed8'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#2563eb'; }}
                >
                  Update Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Add Modal ──────────────────────────────────────────────── */}
      {showAddModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', zIndex: 99999, backdropFilter: 'blur(3px)',
        }} onClick={() => setShowAddModal(false)}>
          <div style={{
            background: '#fff', width: '95%', maxWidth: 520, borderRadius: 16,
            display: 'flex', flexDirection: 'column', maxHeight: '90vh',
            overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
          }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '18px 28px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0, background: 'linear-gradient(90deg, #1e40af 0%, #2563eb 100%)' }}>
              <h3 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#fff' }}>Add New Party</h3>
              <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 24, color: '#fff' }}>&times;</button>
            </div>

            <form onSubmit={(e) => handleSave(e)} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
              <div style={{ padding: '0 32px', flex: 1, overflowY: 'auto', minHeight: 0 }}>
                <div style={{ height: 1.5, background: '#f1f5f9', margin: '0 -32px 24px' }} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px 24px', paddingBottom: 24 }}>

                  {/* Party Type */}
                  <div>
                    <label style={labelStyle}>Party Type</label>
                    <div style={{ position: 'relative' }}>
                      <select name="party_type" style={{ ...inputStyle, appearance: 'none', background: '#fff' }}>
                        <option value="">Select type...</option>
                        {PARTY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                      <div style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#64748b' }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
                      </div>
                    </div>
                  </div>

                  {/* Gender */}
                  <div>
                    <label style={labelStyle}>Gender</label>
                    <div style={{ position: 'relative' }}>
                      <select name="gender" style={{ ...inputStyle, appearance: 'none', background: '#fff' }}>
                        <option value="">Select gender...</option>
                        {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
                      </select>
                      <div style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#64748b' }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
                      </div>
                    </div>
                  </div>

                  {/* First Name */}
                  <div>
                    <label style={labelStyle}>First Name</label>
                    <input name="first_name" type="text" placeholder="Enter first name..." style={inputStyle} />
                  </div>

                  {/* Last Name */}
                  <div>
                    <label style={labelStyle}>Last Name</label>
                    <input name="last_name" type="text" placeholder="Enter last name..." style={inputStyle} />
                  </div>

                  {/* Date of Birth */}
                  <div>
                    <label style={labelStyle}>Date of Birth</label>
                    <input name="date_of_birth" type="date" style={inputStyle} />
                  </div>

                  {/* Contact Number */}
                  <div>
                    <label style={labelStyle}>Contact Number</label>
                    <input name="contact_number" type="text" placeholder="Enter contact..." style={inputStyle} />
                  </div>

                  {/* Email */}
                  <div>
                    <label style={labelStyle}>Email</label>
                    <input name="email" type="email" placeholder="Enter email..." style={inputStyle} />
                  </div>

                  {/* National ID */}
                  <div>
                    <label style={labelStyle}>National ID</label>
                    <input name="national_id" type="text" placeholder="Enter national ID..." style={inputStyle} />
                  </div>

                  {/* SSN */}
                  <div>
                    <label style={labelStyle}>SSN</label>
                    <input name="ssn" type="text" placeholder="Enter SSN..." style={inputStyle} />
                  </div>

                  {/* Version */}
                  <div>
                    <label style={labelStyle}>Version</label>
                    <input name="version" type="number" placeholder="1" style={inputStyle} />
                  </div>

                  {/* Address - span 2 */}
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={labelStyle}>Address</label>
                    <textarea name="address" rows={2} placeholder="Enter address..." style={{ ...inputStyle, resize: 'none' }} />
                  </div>

                  {/* Effective Date */}
                  <div>
                    <label style={labelStyle}>Effective Date</label>
                    <input name="effective_start_date" type="date" style={inputStyle} />
                  </div>

                  {/* End Date */}
                  <div>
                    <label style={labelStyle}>End Date</label>
                    <input name="effective_end_date" type="date" style={inputStyle} />
                  </div>

                  {/* Status */}
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={labelStyle}>Status</label>
                    <div style={{ position: 'relative' }}>
                      <select name="status" style={{ ...inputStyle, appearance: 'none', background: '#fff' }}>
                        {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <div style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#64748b' }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              <div style={{ padding: '24px 32px 32px', display: 'flex', gap: 16, flexShrink: 0 }}>
                <button type="button" onClick={() => setShowAddModal(false)}
                  style={{ flex: 1, padding: '10px', borderRadius: 8, border: '1px solid #cbd5e1', background: '#f8fafc', fontSize: 14, fontWeight: 600, color: '#1e293b', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit"
                  style={{ flex: 1, padding: '10px', borderRadius: 8, border: 'none', background: '#2563eb', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', boxShadow: '0 5px 10px rgba(37,99,235,0.35)' }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#1d4ed8'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#2563eb'; }}
                >
                  Save Party
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Modal ───────────────────────────────── */}
      {confirmDelete && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', zIndex: 99999, backdropFilter: 'blur(3px)',
        }} onClick={() => setConfirmDelete(null)}>
          <div style={{
            background: '#fff', width: '90%', maxWidth: 400, borderRadius: 12,
            padding: 24, boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', textAlign: 'center',
          }} onClick={e => e.stopPropagation()}>
            <div style={{
              width: 50, height: 50, borderRadius: '50%', background: '#fee2e2', color: '#b91c1c',
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 24,
            }}>!</div>
            <h3 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 700, color: '#0f172a' }}>Confirm Deletion</h3>
            <p style={{ margin: '0 0 24px', fontSize: 14, color: '#64748b' }}>Are you sure you want to delete this record? This action cannot be undone.</p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button onClick={() => setConfirmDelete(null)}
                style={{ flex: 1, padding: '10px', borderRadius: 6, border: '1px solid #cbd5e1', background: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                Cancel
              </button>
              <button onClick={() => handleDelete(confirmDelete)}
                style={{ flex: 1, padding: '10px', borderRadius: 6, border: 'none', background: '#b91c1c', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                Delete Record
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Upload Excel Modal ─────────────────────────────────────── */}
      {showUploadModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', zIndex: 99999, backdropFilter: 'blur(3px)',
        }} onClick={() => setShowUploadModal(false)}>
          <div style={{
            background: '#fff', width: '95%', maxWidth: 560, borderRadius: 16,
            boxShadow: '0 20px 35px -10px rgba(0,0,0,0.2)', overflow: 'hidden',
          }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '24px 28px 20px', borderBottom: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#0f172a' }}>Upload Excel File</h3>
                <button onClick={() => setShowUploadModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 21, color: '#64748b' }}>&times;</button>
              </div>
            </div>

            <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" style={{ display: 'none' }}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) { setUploadedFile(file); showToast(`Selected file: ${file.name}`); }
              }}
            />

            <div
              onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
              onDrop={(e) => {
                e.preventDefault(); setDragActive(false);
                const file = e.dataTransfer.files?.[0];
                if (file) { setUploadedFile(file); showToast(`Selected file: ${file.name}`); }
              }}
              onClick={() => fileRef.current?.click()}
              style={{
                margin: '22px', padding: '26px',
                border: `2px dashed ${dragActive ? '#22c55e' : '#9ca3af'}`,
                borderRadius: 12, background: dragActive ? '#f0fdf4' : '#f8fafc',
                cursor: 'pointer', textAlign: 'center',
              }}
            >
              <div style={{ fontSize: 32, marginBottom: 10, color: '#60a5fa' }}><UploadIcon /></div>
              <div style={{ fontSize: 17, fontWeight: 700, color: '#0f172a' }}>Drop files here or click to browse</div>
              <div style={{ marginTop: 6, fontSize: 13, color: '#64748b' }}>Supports .xlsx, .xls, .csv</div>
              {uploadedFile && (
                <div style={{ marginTop: 10, fontSize: 13, color: '#0f172a' }}><strong>{uploadedFile.name}</strong> selected</div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, padding: '14px 22px 20px', borderTop: '1px solid #e2e8f0' }}>
              <button onClick={() => { setUploadedFile(null); setShowUploadModal(false); }}
                style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid #0f172a', background: '#fff', color: '#0f172a', fontWeight: 700, cursor: 'pointer' }}>
                Cancel
              </button>
              <button onClick={() => {
                if (!uploadedFile) { showToast('Please choose a file first'); return; }
                showToast(`Uploading ${uploadedFile.name}...`);
                // TODO: add actual upload API call here
                setShowUploadModal(false);
                setUploadedFile(null);
              }}
                style={{ padding: '10px 14px', borderRadius: 8, border: 'none', background: '#22c55e', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>
                Upload File
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}