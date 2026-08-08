import { useState, useEffect, useCallback } from 'react';
import './ResultsDashboard.css';

const baseUrl =
  import.meta.env?.VITE_BACKEND_URL ||
  (typeof process !== 'undefined' && process.env?.BACKEND_URL) ||
  'http://localhost:3000';

function shortHash(hash) {
  if (!hash) return '—';
  return `${hash.slice(0, 10)}…${hash.slice(-6)}`;
}

function formatTs(unixSec) {
  if (!unixSec) return '—';
  return new Date(Number(unixSec) * 1000).toLocaleString();
}

function formatEventArgs(args = {}) {
  return Object.entries(args)
    .map(([k, v]) => `${k}=${typeof v === 'string' && v.startsWith('0x') ? shortHash(v) : v}`)
    .join(' · ');
}

export function ResultsDashboard({ onBack, embedded = false }) {
  const [elections, setElections] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [results, setResults] = useState(null);
  const [audit, setAudit] = useState(null);
  const [tab, setTab] = useState('results');
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState('');

  const loadBoard = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${baseUrl}/api/elections/results-board`);
      if (!res.ok) throw new Error('Failed to load elections for results.');
      const data = await res.json();
      setElections(data);
      if (data.length > 0) {
        setSelectedId((prev) => prev || data[0].id);
      }
    } catch (err) {
      setError(err.message || String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  const loadDetail = useCallback(async (electionId) => {
    if (!electionId) return;
    setDetailLoading(true);
    setError('');
    try {
      const [resultsRes, auditRes] = await Promise.all([
        fetch(`${baseUrl}/api/elections/${electionId}/results`),
        fetch(`${baseUrl}/api/elections/${electionId}/audit`),
      ]);
      if (!resultsRes.ok) {
        const body = await resultsRes.json().catch(() => ({}));
        throw new Error(body.error || 'Failed to load on-chain results.');
      }
      const resultsData = await resultsRes.json();
      setResults(resultsData);

      if (auditRes.ok) {
        setAudit(await auditRes.json());
      } else {
        setAudit({ events: [], eventCount: 0 });
      }
    } catch (err) {
      setResults(null);
      setAudit(null);
      setError(err.message || String(err));
    } finally {
      setDetailLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBoard();
  }, [loadBoard]);

  useEffect(() => {
    if (selectedId) loadDetail(selectedId);
  }, [selectedId, loadDetail]);

  useEffect(() => {
    if (!selectedId || !results || results.resultsFinal) return undefined;
    const id = setInterval(() => loadDetail(selectedId), 8000);
    return () => clearInterval(id);
  }, [selectedId, results?.resultsFinal, loadDetail]);

  const selected = elections.find((e) => e.id === selectedId);

  return (
    <div className={`results-page ${embedded ? 'results-page--embedded' : ''}`}>
      {!embedded && (
        <header className="results-topbar">
          <div className="results-brand">
            <div className="results-brand-mark" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="20" height="20" stroke="#fff" fill="none" strokeWidth="2">
                <path d="M9 11l3 3L22 4" />
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
              </svg>
            </div>
            <div>
              <div className="results-brand-title">VoteChain</div>
              <div className="results-brand-sub">Public results & audit</div>
            </div>
          </div>
          {onBack && (
            <button type="button" className="results-back" onClick={onBack}>
              Back
            </button>
          )}
        </header>
      )}

      <main className="results-main">
        <div className="results-intro">
          <h1>Election Results</h1>
          <p>
            Tallies are counted automatically by the smart contract. Live counts update while voting is open;
            final results lock after the voting period ends. Anyone can verify using on-chain data.
          </p>
        </div>

        {error && <div className="results-error">{error}</div>}

        {loading ? (
          <div className="results-empty">Loading elections…</div>
        ) : elections.length === 0 ? (
          <div className="results-empty">
            <h3>No published elections yet</h3>
            <p>Open or closed elections with an on-chain ID will appear here.</p>
          </div>
        ) : (
          <div className="results-layout">
            <aside className="results-list">
              <div className="results-list-head">Elections</div>
              {elections.map((e) => (
                <button
                  key={e.id}
                  type="button"
                  className={`results-list-item ${selectedId === e.id ? 'active' : ''}`}
                  onClick={() => setSelectedId(e.id)}
                >
                  <span className="results-list-title">{e.title}</span>
                  <span className={`results-pill status-${String(e.status).toLowerCase()}`}>{e.status}</span>
                </button>
              ))}
            </aside>

            <section className="results-detail">
              {detailLoading && !results ? (
                <div className="results-empty">Loading on-chain tallies…</div>
              ) : !results ? (
                <div className="results-empty">Select an election to view results.</div>
              ) : (
                <>
                  <div className="results-detail-head">
                    <div>
                      <h2>{results.title || selected?.title}</h2>
                      <div className="results-meta">
                        <span className={`results-pill mode-${results.mode?.toLowerCase()}`}>
                          {results.mode === 'FINAL' ? 'Final results' : 'Live tallies'}
                        </span>
                        <span>On-chain #{results.onChainElectionId}</span>
                        <span>{results.totalVotes} total votes</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="results-refresh"
                      onClick={() => loadDetail(selectedId)}
                      disabled={detailLoading}
                    >
                      {detailLoading ? 'Refreshing…' : 'Refresh'}
                    </button>
                  </div>

                  <div className="results-verify">
                    <strong>Independent verification</strong>
                    <div>Contract: <code>{results.contractAddress}</code></div>
                    <div>
                      Views: <code>{results.verification?.viewCall}</code>
                      {' · '}
                      <code>{results.verification?.transparencyCall}</code>
                    </div>
                    <div className="results-verify-hint">{results.verification?.rpcHint}</div>
                  </div>

                  <div className="results-tabs">
                    <button
                      type="button"
                      className={tab === 'results' ? 'active' : ''}
                      onClick={() => setTab('results')}
                    >
                      Results
                    </button>
                    <button
                      type="button"
                      className={tab === 'audit' ? 'active' : ''}
                      onClick={() => setTab('audit')}
                    >
                      Audit log ({audit?.eventCount ?? 0})
                    </button>
                  </div>

                  {tab === 'results' ? (
                    <div className="results-bars">
                      {(results.results || []).length === 0 ? (
                        <div className="results-empty">No candidates on-chain yet.</div>
                      ) : (
                        results.results.map((r) => (
                          <div key={r.onChainCandidateId} className="results-bar-row">
                            <div className="results-bar-label">
                              <span>{r.name || `Candidate #${r.onChainCandidateId}`}</span>
                              <span>{r.party || '—'}</span>
                            </div>
                            <div className="results-bar-track">
                              <div
                                className="results-bar-fill"
                                style={{ width: `${Math.max(r.share || 0, r.voteCount > 0 ? 4 : 0)}%` }}
                              />
                            </div>
                            <div className="results-bar-stats">
                              <strong>{r.voteCount}</strong>
                              <span>{r.share}%</span>
                            </div>
                          </div>
                        ))
                      )}
                      <div className="results-window">
                        <div>Voting open: {results.votingOpen ? 'Yes' : 'No'}</div>
                        <div>Start: {formatTs(results.startTime)}</div>
                        <div>End: {formatTs(results.endTime)}</div>
                      </div>
                    </div>
                  ) : (
                    <div className="results-audit">
                      {(audit?.events || []).length === 0 ? (
                        <div className="results-empty">No on-chain events for this election yet.</div>
                      ) : (
                        <table>
                          <thead>
                            <tr>
                              <th>Block</th>
                              <th>Event</th>
                              <th>Details</th>
                              <th>Tx</th>
                            </tr>
                          </thead>
                          <tbody>
                            {audit.events.map((ev, idx) => (
                              <tr key={`${ev.transactionHash}-${idx}`}>
                                <td>{ev.blockNumber}</td>
                                <td><code>{ev.type}</code></td>
                                <td>{formatEventArgs(ev.args)}</td>
                                <td title={ev.transactionHash}>{shortHash(ev.transactionHash)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  )}
                </>
              )}
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
