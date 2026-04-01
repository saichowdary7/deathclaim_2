'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const TABS = [
  { id: 'tab-1', label: 'Checklists' },
  { id: 'tab-2', label: 'Claim Party' },
  // { id: 'tab-3', label: 'Medical Details' },
  // { id: 'tab-4', label: 'Policy Details' },
  // { id: 'tab-5', label: 'Beneficiary Info' },
  // { id: 'tab-6', label: 'Investigation' },
  // { id: 'tab-7', label: 'Approval Process' },
  // { id: 'tab-8', label: 'Payment Details' },
  // { id: 'tab-9', label: 'Reports & Audit' },
];

interface SidebarProps {
  activeTab: string | null;
  onSelectTab: (tabId: string) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export default function Sidebar({ activeTab, onSelectTab, collapsed, onToggleCollapse }: SidebarProps) {
  const [masterOpen, setMasterOpen] = useState(true);
  const router = useRouter();

  const handleMasterClick = () => {
    setMasterOpen((prev) => !prev);
  };

  const handleLogout = () => {
    router.push('/login');
  };

  const sidebarWidth = collapsed ? 70 : 220;

  return (
    <div
      style={{
        width: `${sidebarWidth}px`,
        minWidth: `${sidebarWidth}px`,
        background: '#0f172a',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        left: 0,
        top: 0,
        height: '100vh',
        boxShadow: '2px 0 16px rgba(0,0,0,0.25)',
        zIndex: 100,
        transition: 'width 0.2s ease',
      }}
    >
      {/* Admin Header */}
      <div style={{ padding: '14px 10px', borderBottom: '1px solid #1e293b' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '36px', height: '36px', borderRadius: '50%',
                background: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <svg width="18" height="18" fill="none" stroke="white" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M5.121 17.804A13.937 13.937 0 0112 15c2.515 0 4.87.69 6.879 1.804M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            {!collapsed && (
              <div>
                <p style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: '#f1f5f9' }}>Admin</p>
                <p style={{ margin: 0, fontSize: '11px', color: '#64748b' }}>Death Claim</p>
              </div>
            )}
          </div>
          <button
            onClick={onToggleCollapse}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            style={{
              border: 'none', background: 'transparent', color: '#94a3b8', cursor: 'pointer',
              width: '24px', height: '24px', borderRadius: '6px', display: 'grid', placeItems: 'center',
            }}
          >
            <span style={{ fontSize: '14px', fontWeight: 700, display: 'block' }}>
              {collapsed ? '☰' : '⏶'}
            </span>
          </button>
        </div>
      </div>

      {/* Nav */}
      <div style={{ flex: 1, padding: '12px 0', overflowY: 'auto' }}>

        {/* Master Death Claim toggle */}
        <button
          onClick={handleMasterClick}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: collapsed ? '9px' : '9px 16px', background: masterOpen ? '#1e293b' : 'transparent',
            border: 'none', cursor: 'pointer', borderLeft: masterOpen ? '3px solid #3b82f6' : '3px solid transparent',
            transition: 'all 0.2s',
          }}
          title="Toggle Master Death Claim"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: collapsed ? '0px' : '8px' }}>
            <svg width="15" height="15" fill="none" stroke={masterOpen ? '#3b82f6' : '#94a3b8'} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {!collapsed && (
              <span style={{ fontSize: '13px', fontWeight: 600, color: masterOpen ? '#f1f5f9' : '#94a3b8' }}>
                Master Death Claim
              </span>
            )}
          </div>
          <svg
            width="12" height="12" fill="none" stroke="#64748b" viewBox="0 0 24 24"
            style={{ transform: masterOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* 9 sub-tabs — shown when masterOpen */}
        {masterOpen && (
          <div style={{ paddingLeft: '0', marginTop: '2px' }}>
            {TABS.map((tab, idx) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onSelectTab(tab.id)}
                  title={tab.label}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: collapsed ? '8px 8px' : '8px 16px 8px 32px',
                    border: 'none',
                    borderLeft: isActive ? '3px solid #3b82f6' : '3px solid transparent',
                    background: isActive ? '#1e3a5f' : 'transparent',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    gap: '8px',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = '#1e293b'; }}
                  onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
                >
                  <span style={{
                    width: '20px', height: '20px', borderRadius: '50%', flexShrink: 0,
                    background: isActive ? '#3b82f6' : '#334155',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '10px', fontWeight: 700, color: isActive ? 'white' : '#94a3b8',
                  }}>
                    {idx + 1}
                  </span>
                  {!collapsed && (
                    <span style={{ fontSize: '12px', fontWeight: isActive ? 600 : 400, color: isActive ? '#f1f5f9' : '#94a3b8' }}>
                      {tab.label}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Sign Out */}
      <div style={{ padding: '12px 10px', borderTop: '1px solid #1e293b' }}>
        <button
          onClick={handleLogout}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: '6px', padding: '9px', borderRadius: '8px',
            background: '#dc2626', border: 'none', cursor: 'pointer',
            color: 'white', fontSize: '13px', fontWeight: 600,
            transition: 'background 0.2s',
          }}
          onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.background = '#b91c1c')}
          onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.background = '#dc2626')}
        >
          <svg width="15" height="15" fill="none" stroke="white" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Sign Out
        </button>
      </div>
    </div>
  );
}
