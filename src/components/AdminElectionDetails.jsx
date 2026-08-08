import { useState, useEffect } from 'react';
import { ArrowLeft, UserPlus, Users, Trash2, Plus, Check } from 'lucide-react';

export function AdminElectionDetails({ election, user, onBack }) {
  const [activeTab, setActiveTab] = useState('candidates'); // 'candidates' or 'voters'
  const [candidates, setCandidates] = useState([]);
  const [assignedVoters, setAssignedVoters] = useState([]);
  const [eligiblePool, setEligiblePool] = useState([]);

  const [error, setError] = useState('');

  // Forms
  const [isAddingCandidate, setIsAddingCandidate] = useState(false);
  const [candidateForm, setCandidateForm] = useState({ name: '', party: '', bio: '' });
  const [selectedEligible, setSelectedEligible] = useState('');

  const baseUrl = import.meta.env?.VITE_BACKEND_URL || (typeof process !== 'undefined' && process.env && process.env.BACKEND_URL ? process.env.BACKEND_URL : 'http://localhost:3000');
  const headers = { 'Authorization': `Bearer ${user.token}` };

  const fetchCandidates = async () => {
    try {
      // Public endpoint for candidates
      const res = await fetch(`${baseUrl}/api/elections/${election.id}/candidates`);
      if (res.ok) {
        setCandidates(await res.json());
      } else {
        const errData = await res.json();
        setError(`Failed to fetch candidates: ${errData.error}`);
      }
    } catch (err) {
      setError(`Error: ${err.message}`);
    }
  };

  const fetchAssignedVoters = async () => {
    try {
      const res = await fetch(`${baseUrl}/api/admin/elections/${election.id}/voters`, { headers });
      if (res.ok) {
        setAssignedVoters(await res.json());
      }
    } catch (err) {
      setError(`Error fetching assigned voters: ${err.message}`);
    }
  };

  const fetchEligiblePool = async () => {
    try {
      const res = await fetch(`${baseUrl}/api/admin/elections/${election.id}/voters/eligible-pool`, { headers });
      if (res.ok) {
        setEligiblePool(await res.json());
      }
    } catch (err) {
      setError(`Error fetching eligible pool: ${err.message}`);
    }
  };

  useEffect(() => {
    fetchCandidates();
    if (activeTab === 'voters') {
      fetchAssignedVoters();
      fetchEligiblePool();
    }
  }, [election.id, activeTab]);

  const handleAddCandidate = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${baseUrl}/api/admin/elections/${election.id}/candidates`, {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify(candidateForm)
      });
      if (res.ok) {
        setIsAddingCandidate(false);
        setCandidateForm({ name: '', party: '', bio: '' });
        fetchCandidates();
      } else {
        const errData = await res.json();
        setError(`Failed to add candidate: ${errData.error}`);
      }
    } catch (err) {
      setError(`Error: ${err.message}`);
    }
  };

  const handleRemoveCandidate = async (candidateId) => {
    try {
      const res = await fetch(`${baseUrl}/api/admin/elections/${election.id}/candidates/${candidateId}`, {
        method: 'DELETE',
        headers
      });
      if (res.ok) {
        fetchCandidates();
      } else {
        const errData = await res.json();
        setError(`Failed to remove candidate: ${errData.error}`);
      }
    } catch (err) {
      setError(`Error: ${err.message}`);
    }
  };

  const handleAssignVoter = async () => {
    if (!selectedEligible) return;
    try {
      const res = await fetch(`${baseUrl}/api/admin/elections/${election.id}/voters`, {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddresses: [selectedEligible] })
      });
      if (res.ok) {
        setSelectedEligible('');
        fetchAssignedVoters();
        fetchEligiblePool();
      } else {
        const errData = await res.json();
        setError(`Failed to assign voter: ${errData.error}`);
      }
    } catch (err) {
      setError(`Error: ${err.message}`);
    }
  };

  const handleUnassignVoter = async (walletAddress) => {
    try {
      const res = await fetch(`${baseUrl}/api/admin/elections/${election.id}/voters/${walletAddress}`, {
        method: 'DELETE',
        headers
      });
      if (res.ok) {
        fetchAssignedVoters();
        fetchEligiblePool();
      } else {
        const errData = await res.json();
        setError(`Failed to unassign voter: ${errData.error}`);
      }
    } catch (err) {
      setError(`Error: ${err.message}`);
    }
  };

  return (
    <div className="admin-election-details">
      <div className="admin-header-row" style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '8px' }}>
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 style={{ margin: 0 }}>{election.title}</h2>
          <span className={`admin-status-badge status-${election.status.toLowerCase()}`} style={{ marginTop: '8px', display: 'inline-block' }}>
            <span className="admin-status-dot"></span> {election.status}
          </span>
        </div>
      </div>

      <div className="admin-tabs" style={{ marginBottom: '24px' }}>
        <button className={`admin-tab ${activeTab === 'candidates' ? 'active' : ''}`} onClick={() => setActiveTab('candidates')}>
          Candidates
        </button>
        <button className={`admin-tab ${activeTab === 'voters' ? 'active' : ''}`} onClick={() => setActiveTab('voters')}>
          Assigned Voters
        </button>
      </div>

      {error && <div style={{ color: '#f44336', background: 'rgba(244, 67, 54, 0.1)', padding: '12px', border: '1px solid #f44336', borderRadius: '8px', marginBottom: '20px' }}>{error}</div>}

      {activeTab === 'candidates' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0 }}>Candidates</h3>
            {election.status === 'DRAFT' && (
              <button
                className="admin-btn-primary"
                onClick={() => setIsAddingCandidate(!isAddingCandidate)}
                style={{ padding: '8px 16px', background: 'var(--primary)', color: 'white', borderRadius: '6px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                {isAddingCandidate ? 'Cancel' : <><Plus size={16} /> Add Candidate</>}
              </button>
            )}
          </div>

          {isAddingCandidate && election.status === 'DRAFT' && (
            <div className="admin-panel" style={{ marginBottom: '24px', padding: '20px', background: 'var(--panel-bg)', borderRadius: '12px', border: '1px solid var(--border)' }}>
              <form onSubmit={handleAddCandidate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--text-secondary)' }}>Name</label>
                  <input type="text" required value={candidateForm.name} onChange={(e) => setCandidateForm({ ...candidateForm, name: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--input-bg)', color: 'var(--text)', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--text-secondary)' }}>Party</label>
                  <input type="text" required value={candidateForm.party} onChange={(e) => setCandidateForm({ ...candidateForm, party: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--input-bg)', color: 'var(--text)', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--text-secondary)' }}>Bio</label>
                  <textarea required value={candidateForm.bio} onChange={(e) => setCandidateForm({ ...candidateForm, bio: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--input-bg)', color: 'var(--text)', minHeight: '80px', boxSizing: 'border-box' }} />
                </div>
                <button type="submit" style={{ padding: '12px', background: 'var(--primary)', color: 'white', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
                  Add Candidate
                </button>
              </form>
            </div>
          )}

          <div className="admin-table-container">
            <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                  <th style={{ padding: '12px' }}>Candidate Name</th>
                  <th style={{ padding: '12px' }}>Party</th>
                  <th style={{ padding: '12px' }}>Bio</th>
                  {election.status === 'DRAFT' && <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {candidates.length === 0 ? (
                  <tr>
                    <td colSpan={election.status === 'DRAFT' ? "4" : "3"} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-secondary)' }}>
                      No candidates added yet.
                    </td>
                  </tr>
                ) : (
                  candidates.map(c => (
                    <tr key={c.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '12px', fontWeight: '500' }}>{c.name}</td>
                      <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>{c.party}</td>
                      <td style={{ padding: '12px', color: 'var(--text-secondary)', fontSize: '14px' }}>{c.bio}</td>
                      {election.status === 'DRAFT' && (
                        <td style={{ padding: '12px' }}>
                          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <button className="admin-icon-btn" title="Remove Candidate" onClick={() => handleRemoveCandidate(c.id)} style={{ color: '#f44336', background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'voters' && (
        <div>
          <h3 style={{ marginBottom: '16px' }}>Voter Assignment</h3>

          {election.status === 'DRAFT' && (
            <div className="admin-panel" style={{ marginBottom: '24px', padding: '20px', background: 'var(--panel-bg)', borderRadius: '12px', border: '1px solid var(--border)', display: 'flex', gap: '16px', alignItems: 'flex-end' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--text-secondary)' }}>Assign Eligible Voter</label>
                <select
                  value={selectedEligible}
                  onChange={(e) => setSelectedEligible(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--input-bg)', color: 'var(--text)', boxSizing: 'border-box' }}
                >
                  <option value="">-- Select Voter --</option>
                  {eligiblePool.map(v => (
                    <option key={v.id || v.walletAddress} value={v.walletAddress}>
                      {v.walletAddress}
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={handleAssignVoter}
                disabled={!selectedEligible}
                style={{ padding: '10px 16px', background: 'var(--primary)', color: 'white', borderRadius: '6px', border: 'none', cursor: selectedEligible ? 'pointer' : 'not-allowed', opacity: selectedEligible ? 1 : 0.5, fontWeight: 'bold' }}>
                Assign Voter
              </button>
            </div>
          )}

          <div className="admin-table-container">
            <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                  <th style={{ padding: '12px' }}>Wallet Address</th>
                  <th style={{ padding: '12px' }}>Assigned By</th>
                  {election.status === 'DRAFT' && <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {assignedVoters.length === 0 ? (
                  <tr>
                    <td colSpan={election.status === 'DRAFT' ? "3" : "2"} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-secondary)' }}>
                      No voters assigned yet.
                    </td>
                  </tr>
                ) : (
                  assignedVoters.map(v => (
                    <tr key={v.voterId || v.walletAddress} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '12px', fontFamily: 'monospace' }}>{v.voterId || v.walletAddress}</td>
                      <td style={{ padding: '12px', color: 'var(--text-secondary)', fontSize: '12px' }}>{v.assignedBy}</td>
                      {election.status === 'DRAFT' && (
                        <td style={{ padding: '12px' }}>
                          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <button className="admin-icon-btn" title="Unassign Voter" onClick={() => handleUnassignVoter(v.voterId || v.walletAddress)} style={{ color: '#f44336', background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
