import { useState, useEffect } from 'react';
import { 
  Search, Bell, LayoutDashboard, Users, UserCheck, 
  UserX, Clock, Settings, LogOut, Check, X,
  MoreHorizontal, Vote, FileSpreadsheet, ShieldAlert
} from 'lucide-react';
import './AdminDashboard.css';

export function AdminDashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [pendingVoters, setPendingVoters] = useState([]);
  const [approvedVoters, setApprovedVoters] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [error, setError] = useState('');

  const baseUrl = typeof process !== 'undefined' && process.env && process.env.BACKEND_URL ? process.env.BACKEND_URL : 'http://localhost:3000';

  const fetchData = async () => {
    try {
      const headers = { 'x-wallet-address': user.walletAddress };
      
      const [pendingRes, approvedRes, statsRes] = await Promise.all([
        fetch(`${baseUrl}/voters/pending`, { headers }),
        fetch(`${baseUrl}/voters/approved`, { headers }),
        fetch(`${baseUrl}/voters/stats`, { headers })
      ]);
      
      if (pendingRes.ok && approvedRes.ok && statsRes.ok) {
        const pendingData = await pendingRes.json();
        const approvedData = await approvedRes.json();
        const statsData = await statsRes.json();
        setPendingVoters(pendingData);
        setApprovedVoters(approvedData);
        setStats(statsData);
      } else {
        setError(`Failed to fetch data from server.`);
      }
    } catch (err) {
      setError(`Error: ${err.message}`);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAction = async (id, action) => {
    try {
      const res = await fetch(`${baseUrl}/voters/${id}/${action}`, {
        method: 'PATCH',
        headers: { 'x-wallet-address': user.walletAddress }
      });
      if (res.ok) {
        fetchData(); // refresh lists and stats
      } else {
        const errData = await res.json();
        setError(`Action failed: ${errData.message}`);
      }
    } catch (err) {
      setError(`Error: ${err.message}`);
    }
  };

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <Vote className="admin-brand-icon" size={32} />
          <div className="admin-brand-text">
            SECURE
            <span className="admin-brand-subtitle">VOTING SYSTEM</span>
          </div>
        </div>

        <nav className="admin-nav">
          <button 
            className={`admin-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}>
            <LayoutDashboard size={20} /> <span>Dashboard</span>
          </button>
          <button 
            className={`admin-nav-item ${activeTab === 'voters' ? 'active' : ''}`}
            onClick={() => setActiveTab('voters')}>
            <Users size={20} /> <span>Voters</span>
          </button>
          <button className="admin-nav-item"><UserCheck size={20} /> <span>Candidates</span></button>
          <button className="admin-nav-item"><Vote size={20} /> <span>Elections</span></button>
          <button className="admin-nav-item"><FileSpreadsheet size={20} /> <span>Results</span></button>
          <button className="admin-nav-item"><ShieldAlert size={20} /> <span>Audit Logs</span></button>
          <button className="admin-nav-item"><Settings size={20} /> <span>Settings</span></button>
        </nav>

        <button className="admin-nav-item admin-logout" onClick={onLogout}>
          <LogOut size={20} /> <span>Log Out</span>
        </button>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        {/* Topbar */}
        <header className="admin-topbar">
          <div className="admin-search">
            <Search size={20} color="var(--text-secondary)" />
            <input type="text" placeholder="Search Dashboard" />
          </div>
          <div className="admin-top-right">
            <button className="admin-bell">
              <Bell size={20} />
            </button>
            <div className="admin-profile">
              <div className="admin-avatar">
                {user.name ? user.name.charAt(0).toUpperCase() : 'A'}
              </div>
              <div className="admin-profile-info">
                <span className="admin-profile-name">{user.name || 'Admin User'}</span>
                <span className="admin-profile-email">{user.walletAddress.substring(0, 6)}...{user.walletAddress.substring(38)}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="admin-content">
          {error && <div style={{ color: '#f44336', background: 'rgba(244, 67, 54, 0.1)', padding: '12px', border: '1px solid #f44336', borderRadius: '8px' }}>{error}</div>}
          
          <div className="admin-header-row">
            <h1>{activeTab === 'dashboard' ? 'Admin Dashboard' : 'Approved Voters'}</h1>
            {activeTab === 'dashboard' && (
              <div className="admin-tabs">
                <button className="admin-tab active">Overview</button>
                <button className="admin-tab">Elections</button>
                <button className="admin-tab" onClick={() => setActiveTab('voters')}>Voters</button>
                <button className="admin-tab">Candidates</button>
              </div>
            )}
          </div>

          {activeTab === 'dashboard' && (
            <>
              <div className="admin-stats-grid">
                <div className="admin-stat-card stat-bg-1">
                  <div className="admin-stat-icon-wrapper"><Users size={20} /></div>
                  <div className="admin-stat-label">Total Voters</div>
                  <div className="admin-stat-value">{stats.total}</div>
                </div>
                <div className="admin-stat-card stat-bg-2">
                  <div className="admin-stat-icon-wrapper"><Clock size={20} /></div>
                  <div className="admin-stat-label">Pending Approval</div>
                  <div className="admin-stat-value">{stats.pending}</div>
                </div>
                <div className="admin-stat-card stat-bg-3">
                  <div className="admin-stat-icon-wrapper"><UserCheck size={20} /></div>
                  <div className="admin-stat-label">Approved Voters</div>
                  <div className="admin-stat-value">{stats.approved}</div>
                </div>
                <div className="admin-stat-card stat-bg-4">
                  <div className="admin-stat-icon-wrapper"><UserX size={20} /></div>
                  <div className="admin-stat-label">Rejected Voters</div>
                  <div className="admin-stat-value">{stats.rejected}</div>
                </div>
              </div>

              <div className="admin-recent-grid">
                <div className="admin-panel">
                  <h3>Recent Registrations</h3>
                  <div className="admin-panel-list">
                    <div className="admin-panel-item">
                      <span className="admin-panel-item-name">Alice Cooper</span>
                      <span className="admin-status-badge status-active"><span className="admin-status-dot"></span> Approved</span>
                    </div>
                    <div className="admin-panel-item">
                      <span className="admin-panel-item-name">John Doe</span>
                      <span className="admin-status-badge status-pending"><span className="admin-status-dot"></span> Pending</span>
                    </div>
                    <div className="admin-panel-item">
                      <span className="admin-panel-item-name">Eve Smith</span>
                      <span className="admin-status-badge status-inactive"><span className="admin-status-dot"></span> Rejected</span>
                    </div>
                  </div>
                </div>
                <div className="admin-panel">
                  <h3>Active Elections</h3>
                  <div className="admin-panel-list">
                    <div className="admin-panel-item">
                      <span className="admin-panel-item-name">Board of Directors 2026</span>
                      <span className="admin-status-badge status-active"><span className="admin-status-dot"></span> Active</span>
                    </div>
                    <div className="admin-panel-item">
                      <span className="admin-panel-item-name">Community Grant</span>
                      <span className="admin-status-badge status-active"><span className="admin-status-dot"></span> Active</span>
                    </div>
                    <div className="admin-panel-item">
                      <span className="admin-panel-item-name">Protocol Upgrade v2</span>
                      <span className="admin-status-badge status-pending"><span className="admin-status-dot"></span> Upcoming</span>
                    </div>
                  </div>
                </div>
                <div className="admin-panel">
                  <h3>System Logs</h3>
                  <div className="admin-panel-list">
                    <div className="admin-panel-item">
                      <span className="admin-panel-item-name">New voter approved</span>
                      <span className="admin-status-badge status-active"><span className="admin-status-dot"></span> Success</span>
                    </div>
                    <div className="admin-panel-item">
                      <span className="admin-panel-item-name">Invalid signature attempt</span>
                      <span className="admin-status-badge status-inactive"><span className="admin-status-dot"></span> Warning</span>
                    </div>
                    <div className="admin-panel-item">
                      <span className="admin-status-badge status-active"><span className="admin-status-dot"></span> Info</span>
                      <span className="admin-panel-item-name">Election concluded</span>
                    </div>
                  </div>
                </div>
              </div>

              <h3>Pending Approvals</h3>
              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Voter Name</th>
                      <th>Wallet Address</th>
                      <th>Registration Date</th>
                      <th>Status</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingVoters.length === 0 ? (
                      <tr>
                        <td colSpan="5" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-secondary)' }}>
                          No pending voters found.
                        </td>
                      </tr>
                    ) : (
                      pendingVoters.map(v => (
                        <tr key={v.id}>
                          <td>{v.name}</td>
                          <td style={{ fontFamily: 'monospace' }}>{v.walletAddress}</td>
                          <td style={{ color: 'var(--text-secondary)' }}>Just now</td>
                          <td>
                            <span className="admin-status-badge status-pending"><span className="admin-status-dot"></span> Pending</span>
                          </td>
                          <td>
                            <div className="admin-table-actions">
                              <button 
                                className="admin-icon-btn" 
                                title="Approve"
                                style={{ color: 'var(--text-positive)' }}
                                onClick={() => handleAction(v.id, 'approve')}>
                                <Check size={18} />
                              </button>
                              <button 
                                className="admin-icon-btn" 
                                title="Reject"
                                style={{ color: '#f44336' }}
                                onClick={() => handleAction(v.id, 'reject')}>
                                <X size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {activeTab === 'voters' && (
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Voter ID</th>
                    <th>Voter Name</th>
                    <th>Wallet Address</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {approvedVoters.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-secondary)' }}>
                        No approved voters found.
                      </td>
                    </tr>
                  ) : (
                    approvedVoters.map(v => (
                      <tr key={v.id}>
                        <td style={{ color: 'var(--text-secondary)' }}>#{v.id}</td>
                        <td>{v.name}</td>
                        <td style={{ fontFamily: 'monospace' }}>{v.walletAddress}</td>
                        <td>
                          <span className="admin-status-badge status-active"><span className="admin-status-dot"></span> Approved</span>
                        </td>
                        <td>
                          <div className="admin-table-actions">
                            <button 
                              className="admin-icon-btn" 
                              title="Reject / Revoke"
                              style={{ color: '#f44336' }}
                              onClick={() => handleAction(v.id, 'reject')}>
                              <X size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
