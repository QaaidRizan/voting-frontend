import { useState, useEffect } from 'react';
import { castVoteOnChain } from '../lib/castVote';

export function VoterDashboard({ user, onLogout, onOpenResults }) {
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [votingKey, setVotingKey] = useState(null);

  const baseUrl = import.meta.env?.VITE_BACKEND_URL || (typeof process !== 'undefined' && process.env && process.env.BACKEND_URL ? process.env.BACKEND_URL : 'http://localhost:3000');

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      const electionsRes = await fetch(`${baseUrl}/api/elections`);
      if (!electionsRes.ok) throw new Error('Failed to fetch elections');
      const electionsData = await electionsRes.json();

      const enrichedElections = await Promise.all(electionsData.map(async (election) => {
        const [candidatesRes, eligibilityRes] = await Promise.all([
          fetch(`${baseUrl}/api/elections/${election.id}/candidates`),
          fetch(`${baseUrl}/api/elections/${election.id}/my-eligibility`, {
            headers: { 'Authorization': `Bearer ${user.token}` }
          }).catch(() => ({ ok: false }))
        ]);

        let candidates = [];
        if (candidatesRes.ok) {
          candidates = await candidatesRes.json();
        }

        let eligibility = {
          eligible: false,
          voterStatus: 'UNKNOWN',
          hasVoted: false,
          onChainVoteChoice: null,
          canChangeVote: false,
        };
        if (eligibilityRes && eligibilityRes.ok) {
          eligibility = await eligibilityRes.json();
        }

        const pastDeadline = election.endDate
          ? Date.now() > new Date(election.endDate).getTime()
          : false;

        return {
          ...election,
          candidates,
          eligibility: {
            ...eligibility,
            canChangeVote: Boolean(eligibility.canChangeVote) && !pastDeadline,
            pastDeadline,
          },
        };
      }));

      setElections(enrichedElections);
    } catch (err) {
      setError(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCastVote = async (election, candidate, isUpdate) => {
    setError('');
    setSuccess('');

    if (!election.eligibility?.eligible) {
      setError('You are not eligible to vote in this election.');
      return;
    }
    if (election.eligibility?.pastDeadline) {
      setError('The election deadline has passed. Your vote is locked.');
      return;
    }
    if (isUpdate && !election.eligibility?.canChangeVote) {
      setError('Vote changes are no longer allowed for this election.');
      return;
    }
    if (election.onChainElectionId == null || candidate.onChainCandidateId == null) {
      setError('This election is not fully synced on-chain yet. Ask an admin to recreate it after EVM wiring.');
      return;
    }

    const confirmed = window.confirm(
      isUpdate
        ? `Change your vote to ${candidate.name}?\n\nThis submits an on-chain VoteUpdated transaction. You can change again until the deadline.`
        : `Cast your vote for ${candidate.name}?\n\nThis submits an on-chain transaction. You can change your choice until the election deadline.`,
    );
    if (!confirmed) return;

    const key = `${election.id}:${candidate.id}`;
    setVotingKey(key);

    try {
      const { transactionHash } = await castVoteOnChain(
        election.onChainElectionId,
        candidate.onChainCandidateId,
      );

      const recordRes = await fetch(`${baseUrl}/api/elections/${election.id}/votes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          candidateId: candidate.id,
          transactionHash,
          updated: Boolean(isUpdate),
        }),
      });

      if (!recordRes.ok) {
        const body = await recordRes.json().catch(() => ({}));
        throw new Error(body.error || 'Vote was cast on-chain but failed to record on the API.');
      }

      setSuccess(
        isUpdate
          ? `Vote updated to ${candidate.name}. Tx: ${transactionHash.slice(0, 10)}…`
          : `Vote cast for ${candidate.name}. Tx: ${transactionHash.slice(0, 10)}…`,
      );
      await fetchData();
    } catch (err) {
      const message = err?.shortMessage || err?.reason || err?.message || String(err);
      setError(message);
    } finally {
      setVotingKey(null);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: '#0b1120',
      fontFamily: "'Inter', system-ui, sans-serif",
      color: '#f0fdfb'
    }}>
      <header style={{
        padding: '20px 40px',
        background: 'rgba(255,255,255,0.02)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36,
            background: 'linear-gradient(135deg,#14b8a6,#0d9488)',
            borderRadius: 10,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg viewBox="0 0 24 24" width="20" height="20" stroke="#fff" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 11l3 3L22 4" />
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
            </svg>
          </div>
          <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 20, letterSpacing: '-0.4px' }}>VoteChain</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          {onOpenResults && (
            <button
              type="button"
              onClick={onOpenResults}
              style={{
                padding: '8px 16px',
                background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.25)',
                borderRadius: 8, color: '#7dd3fc',
                fontFamily: "'Space Grotesk',sans-serif", fontSize: 14, fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Results & Audit
            </button>
          )}
          <div style={{ fontSize: 14, color: 'rgba(148,163,184,0.8)' }}>
            Welcome, <strong style={{ color: '#14b8a6' }}>{user.name}</strong>
          </div>
          <button
            onClick={onLogout}
            style={{
              padding: '8px 16px',
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
              borderRadius: 8, color: '#fca5a5',
              fontFamily: "'Space Grotesk',sans-serif", fontSize: 14, fontWeight: 600,
              cursor: 'pointer', transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.18)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)' }}
          >
            Sign Out
          </button>
        </div>
      </header>

      <main style={{ flex: 1, padding: '40px', maxWidth: '1200px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
        <h1 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 32, fontWeight: 600, margin: '0 0 8px', letterSpacing: '-0.5px' }}>
          Active Elections
        </h1>
        <p style={{ color: 'rgba(148,163,184,0.8)', marginBottom: 40, fontSize: 16 }}>
          Cast or change your vote on-chain until the deadline. After that, your choice is locked forever.
        </p>

        {error && (
          <div style={{ padding: '16px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 12, color: '#fca5a5', marginBottom: 24 }}>
            {error}
          </div>
        )}

        {success && (
          <div style={{ padding: '16px', background: 'rgba(20,184,166,0.1)', border: '1px solid rgba(20,184,166,0.2)', borderRadius: 12, color: '#5eead4', marginBottom: 24 }}>
            {success}
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: 'rgba(148,163,184,0.8)' }}>Loading elections...</div>
        ) : elections.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', background: 'rgba(255,255,255,0.02)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.05)' }}>
            <h3 style={{ margin: '0 0 8px', color: '#f0fdfb' }}>No Active Elections</h3>
            <p style={{ margin: 0, color: 'rgba(148,163,184,0.8)' }}>There are currently no open elections. Please check back later.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {elections.map(election => {
              const hasVoted = Boolean(election.eligibility?.hasVoted);
              const eligible = Boolean(election.eligibility?.eligible);
              const canChange = Boolean(election.eligibility?.canChangeVote);
              const pastDeadline = Boolean(election.eligibility?.pastDeadline);
              const currentChoiceId = election.eligibility?.onChainVoteChoice ?? null;

              return (
              <div key={election.id} style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 16,
                overflow: 'hidden'
              }}>
                <div style={{ padding: '24px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h2 style={{ margin: '0 0 8px', fontSize: 24, color: '#f0fdfb' }}>{election.title}</h2>
                    <div style={{ fontSize: 14, color: 'rgba(148,163,184,0.8)', display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                      <span>Start: {new Date(election.startDate).toLocaleDateString()}</span>
                      <span>End: {new Date(election.endDate).toLocaleDateString()}</span>
                      {election.onChainElectionId != null && (
                        <span>On-chain ID: {election.onChainElectionId}</span>
                      )}
                    </div>
                  </div>
                  <div>
                    {pastDeadline && hasVoted ? (
                      <span style={{ display: 'inline-block', padding: '6px 12px', background: 'rgba(148,163,184,0.12)', color: '#cbd5e1', border: '1px solid rgba(148,163,184,0.25)', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
                        VOTE LOCKED
                      </span>
                    ) : hasVoted ? (
                      <span style={{ display: 'inline-block', padding: '6px 12px', background: 'rgba(56,189,248,0.1)', color: '#7dd3fc', border: '1px solid rgba(56,189,248,0.2)', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
                        {canChange ? 'VOTED · CAN CHANGE' : 'VOTE RECORDED'}
                      </span>
                    ) : eligible ? (
                      <span style={{ display: 'inline-block', padding: '6px 12px', background: 'rgba(20,184,166,0.1)', color: '#2dd4bf', border: '1px solid rgba(20,184,166,0.2)', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
                        ELIGIBLE TO VOTE
                      </span>
                    ) : (
                      <span style={{ display: 'inline-block', padding: '6px 12px', background: 'rgba(245,158,11,0.1)', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
                        NOT ELIGIBLE
                      </span>
                    )}
                  </div>
                </div>

                <div style={{ padding: '24px' }}>
                  <h3 style={{ margin: '0 0 16px', fontSize: 16, color: '#e2e8f0' }}>Candidates</h3>
                  {election.candidates.length === 0 ? (
                    <div style={{ color: 'rgba(148,163,184,0.6)', fontStyle: 'italic' }}>No candidates available.</div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
                      {election.candidates.map(candidate => {
                        const key = `${election.id}:${candidate.id}`;
                        const isSubmitting = votingKey === key;
                        const isCurrent =
                          hasVoted &&
                          currentChoiceId != null &&
                          Number(candidate.onChainCandidateId) === Number(currentChoiceId);
                        const busy = votingKey != null;

                        let action = null;
                        if (eligible && !pastDeadline) {
                          if (!hasVoted) {
                            action = { label: `Vote for ${candidate.name.split(' ')[0]}`, isUpdate: false, disabled: busy };
                          } else if (canChange && !isCurrent) {
                            action = { label: `Change vote to ${candidate.name.split(' ')[0]}`, isUpdate: true, disabled: busy };
                          }
                        }

                        return (
                        <div key={candidate.id} style={{
                          background: isCurrent ? 'rgba(20,184,166,0.08)' : 'rgba(0,0,0,0.2)',
                          border: isCurrent ? '1px solid rgba(20,184,166,0.35)' : '1px solid rgba(255,255,255,0.05)',
                          borderRadius: 12,
                          padding: '16px'
                        }}>
                          <div style={{ fontWeight: 600, fontSize: 18, color: '#f0fdfb', marginBottom: 4 }}>{candidate.name}</div>
                          <div style={{ fontSize: 13, color: '#38bdf8', marginBottom: 12 }}>{candidate.party}</div>
                          <div style={{ fontSize: 14, color: 'rgba(148,163,184,0.9)', lineHeight: 1.5 }}>{candidate.bio}</div>

                          {isCurrent && (
                            <div style={{ marginTop: 16, fontSize: 13, color: '#5eead4', fontWeight: 600 }}>
                              {pastDeadline ? 'Your locked choice' : 'Your current on-chain choice'}
                            </div>
                          )}

                          {action && (
                            <button
                              type="button"
                              disabled={action.disabled}
                              onClick={() => handleCastVote(election, candidate, action.isUpdate)}
                              style={{
                              width: '100%',
                              marginTop: 16,
                              padding: '10px',
                              background: action.disabled ? '#0f766e' : (action.isUpdate ? '#0ea5e9' : '#14b8a6'),
                              color: '#fff',
                              border: 'none',
                              borderRadius: 8,
                              fontWeight: 600,
                              cursor: action.disabled ? 'not-allowed' : 'pointer',
                              opacity: action.disabled && !isSubmitting ? 0.7 : 1,
                              transition: 'background 0.2s'
                            }}
                            >
                              {isSubmitting ? (action.isUpdate ? 'Updating vote…' : 'Submitting vote…') : action.label}
                            </button>
                          )}

                          {hasVoted && pastDeadline && !isCurrent && (
                            <div style={{ marginTop: 16, fontSize: 13, color: 'rgba(148,163,184,0.7)' }}>
                              Voting period ended — changes locked.
                            </div>
                          )}
                        </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
