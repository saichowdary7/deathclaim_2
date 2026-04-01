'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import Sidebar from '../components/Sidebar';

// Dynamically import each tab — tabs live in ./Master_death_claim/
const tabComponents: Record<string, React.ComponentType> = {
  'tab-1': dynamic(() => import('./Master_death_claim/checklists')),
  'tab-2': dynamic(() => import('./Master_death_claim/claimparty')),
  'tab-3': dynamic(() => import('./Master_death_claim/Tab3')),
  'tab-4': dynamic(() => import('./Master_death_claim/Tab4')),
  'tab-5': dynamic(() => import('./Master_death_claim/Tab5')),
  'tab-6': dynamic(() => import('./Master_death_claim/Tab6')),
  'tab-7': dynamic(() => import('./Master_death_claim/Tab7')),
  'tab-8': dynamic(() => import('./Master_death_claim/Tab8')),
  'tab-9': dynamic(() => import('./Master_death_claim/Tab9')),
};

const TAB_LABELS: Record<string, string> = {
  'tab-1': 'Claim Registration',
  'tab-2': 'Document Management',
  'tab-3': 'Medical Details',
  'tab-4': 'Policy Details',
  'tab-5': 'Beneficiary Info',
  'tab-6': 'Investigation',
  'tab-7': 'Approval Process',
  'tab-8': 'Payment Details',
  'tab-9': 'Reports & Audit',
};

export default function MasterPage() {
  const [activeTab, setActiveTab] = useState<string | null>('tab-1');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const ActiveComponent = activeTab ? tabComponents[activeTab] : null;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f1f5f9' }}>
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((v) => !v)}
      />

      <main style={{ flex: 1, marginLeft: sidebarCollapsed ? '70px' : '220px', padding: '16px', minHeight: '100vh', background: '#f8fafc' }}>
        {/* Tab Content Wrapper */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          minHeight: 'calc(100vh - 32px)',
          boxShadow: '0 1px 6px rgba(0,0,0,0.05)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {ActiveComponent ? (
            <ActiveComponent />
          ) : (
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', flex: 1, gap: '12px', padding: '40px'
            }}>
              <svg width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="#cbd5e1">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: '#94a3b8' }}>
                No tab selected
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
