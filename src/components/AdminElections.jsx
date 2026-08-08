import { useState, useEffect } from 'react';
import { Plus, Check, X, Trash2, Settings } from 'lucide-react';
import { AdminElectionDetails } from './AdminElectionDetails';

function toLocalInputValue(date) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function defaultElectionDates() {
  const start = new Date();
  const end = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  return {
    startDate: toLocalInputValue(start),
    endDate: toLocalInputValue(end),
  };
}

export function AdminElections({ user }) {
  const [elections, setElections] = useState([]);
  const [error, setError] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [selectedElection, setSelectedElection] = useState(null);
  const [formData, setFormData] = useState({ title: '', description: '', ...defaultElectionDates() });

  const baseUrl = import.meta.env?.VITE_BACKEND_URL || (typeof process !== 'undefined' && process.env && process.env.BACKEND_URL ? process.env.BACKEND_URL : 'http://localhost:3000');

  const fetchElections = async () => {
    try {
      const headers = { 'Authorization': `Bearer ${user.token}` };
      const res = await fetch(`${baseUrl}/api/admin/elections`, { headers });
      if (res.ok) {
        const data = await res.json();
        setElections(data);
      } else {
        const errData = await res.json();
        setError(`Failed to fetch elections: ${errData.error || res.statusText}`);
      }
    } catch (err) {
      setError(`Error: ${err.message}`);
    }
  };

  useEffect(() => {
    fetchElections();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const headers = { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user.token}`
      };
      
      const payload = {
        title: formData.title,
        description: formData.description,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString()
      };

      const res = await fetch(`${baseUrl}/api/admin/elections`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setIsCreating(false);
        setFormData({ title: '', description: '', ...defaultElectionDates() });
        fetchElections();
      } else {
        const errData = await res.json();
        setError(`Failed to create: ${errData.error || res.statusText}`);
      }
    } catch (err) {
      setError(`Error: ${err.message}`);
    }
  };

  const handleUpdateStatus = async (electionId, newStatus) => {
    try {
      const headers = { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user.token}`
      };
      const res = await fetch(`${baseUrl}/api/admin/elections/${electionId}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        fetchElections();
      } else {
        const errData = await res.json();
        setError(`Failed to update status: ${errData.error || res.statusText}`);
      }
    } catch (err) {
      setError(`Error: ${err.message}`);
    }
  };

  if (selectedElection) {
    return <AdminElectionDetails election={selectedElection} user={user} onBack={() => setSelectedElection(null)} />;
  }

  return (
    <div className="admin-elections">
      <div className="admin-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Election Management</h2>
        <button 
          className="admin-btn-primary" 
          onClick={() => {
            if (!isCreating) setFormData((prev) => ({ ...prev, ...defaultElectionDates() }));
            setIsCreating(!isCreating);
          }}
          style={{ padding: '8px 16px', background: 'var(--primary)', color: 'white', borderRadius: '6px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          {isCreating ? <X size={18} /> : <Plus size={18} />}
          {isCreating ? 'Cancel' : 'Create Election'}
        </button>
      </div>

      {error && <div style={{ color: '#f44336', background: 'rgba(244, 67, 54, 0.1)', padding: '12px', border: '1px solid #f44336', borderRadius: '8px', marginBottom: '20px' }}>{error}</div>}

      {isCreating && (
        <div className="admin-panel" style={{ marginBottom: '24px', padding: '20px', background: 'var(--panel-bg)', borderRadius: '12px', border: '1px solid var(--border)' }}>
          <h3 style={{ marginTop: 0, marginBottom: '16px' }}>Create New Election</h3>
          <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--text-secondary)' }}>Title</label>
              <input 
                type="text" 
                required 
                value={formData.title} 
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--input-bg)', color: 'var(--text)', boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--text-secondary)' }}>Description</label>
              <textarea 
                required 
                value={formData.description} 
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--input-bg)', color: 'var(--text)', minHeight: '80px', boxSizing: 'border-box' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--text-secondary)' }}>Start Date</label>
                <input 
                  type="datetime-local" 
                  required 
                  value={formData.startDate} 
                  onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--input-bg)', color: 'var(--text)', boxSizing: 'border-box' }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--text-secondary)' }}>End Date</label>
                <input 
                  type="datetime-local" 
                  required 
                  value={formData.endDate} 
                  onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--input-bg)', color: 'var(--text)', boxSizing: 'border-box' }}
                />
              </div>
            </div>
            <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)' }}>
              Voting is only allowed after the start time (enforced on-chain). For local testing, keep Start at or before now.
            </p>
            <button type="submit" style={{ padding: '12px', background: 'var(--primary)', color: 'white', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 'bold', marginTop: '8px' }}>
              Create Election
            </button>
          </form>
        </div>
      )}

      <div className="admin-table-container">
        <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
              <th style={{ padding: '12px' }}>Title</th>
              <th style={{ padding: '12px' }}>Status</th>
              <th style={{ padding: '12px' }}>Start Date</th>
              <th style={{ padding: '12px' }}>End Date</th>
              <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {elections.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-secondary)' }}>
                  No elections found.
                </td>
              </tr>
            ) : (
              elections.map(election => (
                <tr key={election.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '12px' }}>
                    <div style={{ fontWeight: '500' }}>{election.title}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>{election.description}</div>
                  </td>
                  <td style={{ padding: '12px' }}>
                    <span className={`admin-status-badge status-${election.status.toLowerCase()}`}>
                      <span className="admin-status-dot"></span> {election.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px', color: 'var(--text-secondary)', fontSize: '14px' }}>{new Date(election.startDate).toLocaleString()}</td>
                  <td style={{ padding: '12px', color: 'var(--text-secondary)', fontSize: '14px' }}>{new Date(election.endDate).toLocaleString()}</td>
                  <td style={{ padding: '12px' }}>
                    <div className="admin-table-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                      <button 
                        className="admin-icon-btn" 
                        title="Manage Election"
                        style={{ color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px' }}
                        onClick={() => setSelectedElection(election)}>
                        <Settings size={16} /> <span style={{ fontSize: '14px' }}>Manage</span>
                      </button>
                      {election.status === 'DRAFT' && (
                        <button 
                          className="admin-icon-btn" 
                          title="Open Election"
                          style={{ color: 'var(--text-positive)', display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px' }}
                          onClick={() => handleUpdateStatus(election.id, 'OPEN')}>
                          <Check size={16} /> <span style={{ fontSize: '14px' }}>Open</span>
                        </button>
                      )}
                      {election.status === 'OPEN' && (
                        <button 
                          className="admin-icon-btn" 
                          title="Close Election"
                          style={{ color: '#f44336', display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px' }}
                          onClick={() => handleUpdateStatus(election.id, 'CLOSED')}>
                          <X size={16} /> <span style={{ fontSize: '14px' }}>Close</span>
                        </button>
                      )}
                      {election.status === 'CLOSED' && (
                        <button 
                          className="admin-icon-btn" 
                          title="Archive Election"
                          style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px' }}
                          onClick={() => handleUpdateStatus(election.id, 'ARCHIVED')}>
                          <Trash2 size={16} /> <span style={{ fontSize: '14px' }}>Archive</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
