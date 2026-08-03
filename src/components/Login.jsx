import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useWallet } from '../hooks/useWallet';
import './Login.css';

/* ─── Lucide-style inline SVG icons ─── */
const Icon = {
  Vote: () => (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M9 11l3 3L22 4" />
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  ),
  Shield: () => (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  User: () => (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  Wallet: () => (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="M16 13a1 1 0 1 0 2 0 1 1 0 0 0-2 0" />
      <path d="M2 10h20" />
    </svg>
  ),
  Key: () => (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="7.5" cy="15.5" r="5.5" />
      <path d="M21 2l-9.6 9.6" />
      <path d="M15.5 7.5l3 3L22 7l-3-3" />
    </svg>
  ),
  Copy: () => (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  ),
  Check: () => (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  AlertTriangle: () => (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  AlertCircle: () => (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),
  Info: () => (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  ),
  CheckCircle: () => (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
  Link: () => (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  ),
  ArrowRight: () => (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  ),
  Fingerprint: () => (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M2 12C2 6.5 6.5 2 12 2a10 10 0 0 1 8 4" />
      <path d="M5 19.5C5.5 18 6 15 6 12c0-3.5 2.5-6 6-6 3 0 4.5 2 5 4" />
      <path d="M20 20c0-3-1.5-6-3-8" />
      <path d="M12 12c0 3-1 5.5-2 7" />
    </svg>
  ),
};

/* ─── Status component ─── */
function Status({ type, icon, children }) {
  const IconComp = icon || (type === 'error' ? Icon.AlertCircle : type === 'success' ? Icon.CheckCircle : type === 'warning' ? Icon.AlertTriangle : Icon.Info);
  return (
    <div className={`vc-status ${type}`} role="alert">
      <IconComp className="vc-status-icon" />
      <span>{children}</span>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   TAB 1 — Voter Registration
═══════════════════════════════════════════════ */
function VoterTab({ onLoginSuccess }) {
  const [voterName, setVoterName] = useState('');
  const [subMode, setSubMode] = useState('register'); // 'register' | 'login'
  const [regStatus, setRegStatus] = useState(null); // { type, text }
  const [loginStatus, setLoginStatus] = useState(null);
  const [copiedAddr, setCopiedAddr] = useState(false);
  const [registeredAddress, setRegisteredAddress] = useState(null);

  // Use the existing useWallet hook for the register flow
  const { address, error: walletError, connectWallet } = useWallet();

  // Separate wallet hook for the "already have a wallet / login" sub-mode
  const { address: loginAddress, error: loginWalletError, connectWallet: connectLoginWallet } = useWallet();

  // ── Register flow: connect then POST /voters/register ──
  useEffect(() => {
    if (!address) return;
    if (subMode !== 'register') return;

    const register = async () => {
      if (!voterName.trim()) {
        setRegStatus({ type: 'error', text: 'Please enter your name before connecting your wallet.' });
        return;
      }
      try {
        setRegStatus({ type: 'info', text: 'Registering your wallet…' });
        const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
        const response = await fetch(`${baseUrl}/voters/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: voterName.trim(), walletAddress: address }),
        });

        if (response.ok) {
          setRegisteredAddress(address);
          setRegStatus({ type: 'success', text: 'Wallet registered successfully! Your status is pending review.' });
        } else if (response.status === 409) {
          setRegStatus({ type: 'warning', text: 'This wallet is already registered. Use the login option instead.' });
        } else {
          const errData = await response.json();
          setRegStatus({ type: 'error', text: `Registration failed: ${errData.message || 'Unknown error'}` });
        }
      } catch (err) {
        setRegStatus({ type: 'error', text: `Wallet creation failed — check your connection and try again.` });
      }
    };

    register();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address]);

  // ── Login flow: connect MetaMask then call /auth/nonce + /auth/verify ──
  useEffect(() => {
    if (!loginAddress) return;
    if (subMode !== 'login') return;

    const login = async () => {
      try {
        setLoginStatus({ type: 'info', text: 'Fetching challenge nonce…' });
        const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();

        const nonceRes = await fetch(`${baseUrl}/auth/nonce?wallet=${loginAddress}`);
        const nonceData = await nonceRes.json();

        setLoginStatus({ type: 'info', text: 'Please sign the message in MetaMask…' });
        const signature = await signer.signMessage(nonceData.data);

        setLoginStatus({ type: 'info', text: 'Verifying signature…' });
        const res = await fetch(`${baseUrl}/auth/verify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ walletAddress: loginAddress, signature }),
        });

        if (res.ok) {
          const user = await res.json();
          setLoginStatus({ type: 'success', text: 'Verified! Signing you in…' });
          onLoginSuccess(user);
        } else {
          const errData = await res.json();
          setLoginStatus({ type: 'error', text: `Login failed: ${errData.message || 'Unknown error'}` });
        }
      } catch (err) {
        setLoginStatus({ type: 'error', text: `Error: ${err.message}` });
      }
    };

    login();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loginAddress]);

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedAddr(true);
      setTimeout(() => setCopiedAddr(false), 2000);
    });
  };

  const isRegistering = regStatus?.type === 'info';
  const isLoggingIn = loginStatus?.type === 'info';

  return (
    <div className="vc-step">
      {subMode === 'register' ? (
        <>
          <p className="vc-section-title">Create Your Voter Wallet</p>
          <p className="vc-section-subtitle">
            Enter your name and connect your MetaMask wallet to register as a voter.
          </p>

          <div className="vc-field">
            <label className="vc-label" htmlFor="voter-name">Full Name</label>
            <div className="vc-input-wrap">
              <Icon.User className="vc-input-icon" />
              <input
                id="voter-name"
                type="text"
                className="vc-input"
                placeholder="e.g. Alex Johnson"
                value={voterName}
                onChange={(e) => setVoterName(e.target.value)}
                disabled={isRegistering || !!registeredAddress}
                autoComplete="name"
              />
            </div>
          </div>

          {walletError && (
            <Status type="error"><Icon.AlertCircle className="vc-status-icon" />{walletError}</Status>
          )}

          {address && !registeredAddress && !regStatus && (
            <div className="vc-connected-badge">
              <Icon.Check />
              <span>Connected: {address}</span>
            </div>
          )}

          {regStatus && <Status type={regStatus.type}>{regStatus.text}</Status>}

          {/* Wallet receipt after success */}
          {registeredAddress && (
            <div className="vc-receipt">
              <div className="vc-receipt-header">
                <Icon.Wallet />
                <span className="vc-receipt-title">Wallet Registered</span>
              </div>
              <div className="vc-receipt-row">
                <div className="vc-receipt-row-label">Wallet Address</div>
                <div className="vc-receipt-row-value">
                  <span>{registeredAddress}</span>
                  <button
                    className="vc-copy-btn"
                    onClick={() => handleCopy(registeredAddress)}
                    title="Copy address"
                    aria-label="Copy wallet address"
                  >
                    {copiedAddr ? <Icon.Check /> : <Icon.Copy />}
                  </button>
                </div>
              </div>
              <div className="vc-receipt-warning">
                <Icon.AlertTriangle />
                <p>Save your wallet's recovery phrase in a secure location. It cannot be recovered if lost.</p>
              </div>
            </div>
          )}

          {!registeredAddress && (
            <button
              id="voter-connect-btn"
              className="vc-btn-primary"
              onClick={connectWallet}
              disabled={isRegistering}
            >
              {isRegistering ? (
                <><div className="vc-spinner" /> Connecting wallet…</>
              ) : (
                <><Icon.Wallet /> Connect Wallet &amp; Register</>
              )}
            </button>
          )}

          <div className="vc-divider">
            <div className="vc-divider-line" />
            <span className="vc-divider-text">already registered?</span>
            <div className="vc-divider-line" />
          </div>

          <div className="vc-link-row">
            <button className="vc-link" onClick={() => { setSubMode('login'); setRegStatus(null); }}>
              Already have a wallet? Sign in instead →
            </button>
          </div>
        </>
      ) : (
        /* ── Voter Login sub-mode ── */
        <>
          <p className="vc-section-title">Voter Sign In</p>
          <p className="vc-section-subtitle">
            Connect your previously registered wallet to verify your identity.
          </p>

          {loginWalletError && <Status type="error">{loginWalletError}</Status>}

          {loginAddress && (
            <div className="vc-connected-badge">
              <Icon.Check />
              <span>Connected: {loginAddress}</span>
            </div>
          )}

          {loginStatus && <Status type={loginStatus.type}>{loginStatus.text}</Status>}

          <button
            id="voter-login-btn"
            className="vc-btn-primary"
            onClick={connectLoginWallet}
            disabled={isLoggingIn}
            style={{ marginTop: '8px' }}
          >
            {isLoggingIn ? (
              <><div className="vc-spinner" /> Verifying…</>
            ) : (
              <><Icon.Wallet /> Connect Wallet &amp; Sign In</>
            )}
          </button>

          <div className="vc-link-row">
            <button className="vc-link" onClick={() => { setSubMode('register'); setLoginStatus(null); }}>
              ← New voter? Register your wallet
            </button>
          </div>
        </>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════
   TAB 2 — Admin Wallet Verification
═══════════════════════════════════════════════ */
function AdminTab({ onLoginSuccess }) {
  const [step, setStep] = useState(1); // 1 = enter address | 2 = sign challenge
  const [walletAddr, setWalletAddr] = useState('');
  const [nonce, setNonce] = useState('');
  const [signature, setSignature] = useState('');
  const [status, setStatus] = useState(null); // { type, text }
  const [loading, setLoading] = useState(false);

  const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

  // ── Step 1: Request challenge nonce ──
  const handleRequestChallenge = async () => {
    if (!walletAddr.trim()) {
      setStatus({ type: 'error', text: 'Please enter your wallet address.' });
      return;
    }
    setLoading(true);
    setStatus({ type: 'info', text: 'Fetching challenge from server…' });
    try {
      const res = await fetch(`${baseUrl}/auth/nonce?wallet=${walletAddr.trim()}`);
      const data = await res.json();
      if (!res.ok) {
        setStatus({ type: 'error', text: data.message === 'Not registered as admin' ? "This wallet isn't registered as an admin." : `Error: ${data.message}` });
        setLoading(false);
        return;
      }
      setNonce(data.data);
      setStatus(null);
      setStep(2);
    } catch (err) {
      setStatus({ type: 'error', text: `Network error: ${err.message}` });
    } finally {
      setLoading(false);
    }
  };

  // ── MetaMask auto-sign via extension ──
  const handleMetaMaskSign = async () => {
    if (!window.ethereum) {
      setStatus({ type: 'error', text: 'MetaMask not detected. Please install it or paste your signature manually.' });
      return;
    }
    setLoading(true);
    setStatus({ type: 'info', text: 'Waiting for MetaMask signature…' });
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const sig = await signer.signMessage(nonce);
      setSignature(sig);
      setStatus({ type: 'success', text: 'Signature captured. Click Verify & Sign In.' });
    } catch (err) {
      setStatus({ type: 'error', text: `Signing cancelled: ${err.message}` });
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: Verify signature ──
  const handleVerify = async () => {
    if (!signature.trim()) {
      setStatus({ type: 'error', text: 'Please provide a signature.' });
      return;
    }
    setLoading(true);
    setStatus({ type: 'info', text: 'Verifying signature on-chain…' });
    try {
      const res = await fetch(`${baseUrl}/auth/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress: walletAddr.trim(), signature: signature.trim() }),
      });

      if (res.ok) {
        const user = await res.json();
        setStatus({ type: 'success', text: 'Signature verified! Signing you in…' });
        onLoginSuccess(user);
      } else {
        const errData = await res.json();
        const msg = errData.message || '';
        if (msg.toLowerCase().includes('not admin') || msg.toLowerCase().includes('not registered')) {
          setStatus({ type: 'error', text: "This wallet isn't registered as an admin." });
        } else {
          setStatus({ type: 'error', text: `Signature doesn't match this address. Try again?` });
        }
      }
    } catch (err) {
      setStatus({ type: 'error', text: `Verification error: ${err.message}` });
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setStep(1);
    setNonce('');
    setSignature('');
    setStatus(null);
  };

  return (
    <div className="vc-step">
      <p className="vc-section-title">Admin Sign In</p>
      <p className="vc-section-subtitle">
        Prove ownership of your admin wallet via a cryptographic challenge. No password required.
      </p>

      {step === 1 && (
        <>
          <div className="vc-field">
            <label className="vc-label" htmlFor="admin-wallet">Wallet Address</label>
            <div className="vc-input-wrap">
              <Icon.Wallet className="vc-input-icon" />
              <input
                id="admin-wallet"
                type="text"
                className="vc-input"
                placeholder="0x…"
                value={walletAddr}
                onChange={(e) => setWalletAddr(e.target.value)}
                disabled={loading}
                spellCheck={false}
                autoComplete="off"
              />
            </div>
          </div>

          {status && <Status type={status.type}>{status.text}</Status>}

          <button
            id="admin-request-challenge-btn"
            className="vc-btn-primary"
            onClick={handleRequestChallenge}
            disabled={loading}
          >
            {loading ? (
              <><div className="vc-spinner" /> Requesting challenge…</>
            ) : (
              <><Icon.Key /> Request Challenge</>
            )}
          </button>
        </>
      )}

      {step === 2 && (
        <>
          {/* Nonce display */}
          <div className="vc-nonce-box">
            <div className="vc-nonce-label">Sign this message</div>
            <div className="vc-nonce-value">{nonce}</div>
          </div>

          {/* MetaMask quick-sign button */}
          <button
            id="admin-metamask-sign-btn"
            className="vc-btn-secondary"
            onClick={handleMetaMaskSign}
            disabled={loading}
          >
            {loading && status?.text?.includes('MetaMask') ? (
              <><div className="vc-spinner vc-spinner-teal" /> Waiting for MetaMask…</>
            ) : (
              <><Icon.Fingerprint /> Sign with connected wallet (MetaMask)</>
            )}
          </button>

          <div className="vc-divider">
            <div className="vc-divider-line" />
            <span className="vc-divider-text">or paste manually</span>
            <div className="vc-divider-line" />
          </div>

          <div className="vc-field">
            <label className="vc-label" htmlFor="admin-signature">Signature</label>
            <textarea
              id="admin-signature"
              className="vc-input vc-textarea"
              placeholder="Paste your 0x… signature here"
              value={signature}
              onChange={(e) => setSignature(e.target.value)}
              disabled={loading}
              spellCheck={false}
              rows={3}
            />
          </div>

          {status && <Status type={status.type}>{status.text}</Status>}

          <button
            id="admin-verify-btn"
            className="vc-btn-primary"
            onClick={handleVerify}
            disabled={loading || !signature.trim()}
          >
            {loading && status?.text?.includes('Verifying') ? (
              <><div className="vc-spinner" /> Verifying signature…</>
            ) : (
              <><Icon.Shield /> Verify &amp; Sign In</>
            )}
          </button>

          <div className="vc-link-row" style={{ marginTop: '12px' }}>
            <button className="vc-link" onClick={handleBack}>← Back to wallet address</button>
          </div>
        </>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════
   Main Login Page  –  split layout on desktop
═══════════════════════════════════════════════ */
export function Login({ onLoginSuccess }) {
  const [activeTab, setActiveTab] = useState('voter');

  return (
    <div className="vc-login-page">

      {/* ════ LEFT — Branding panel (desktop only) ════ */}
      <aside className="vc-panel-left" aria-hidden="true">
        <div className="vc-panel-left-top">
          {/* Logo */}
          <div className="vc-panel-brand">
            <div className="vc-panel-brand-icon">
              <Icon.Vote />
            </div>
            <span className="vc-panel-brand-name">VoteChain</span>
          </div>

          {/* Headline */}
          <h1 className="vc-panel-headline">
            Democracy,<br />
            secured by the<br />
            <em>blockchain.</em>
          </h1>
          <p className="vc-panel-subline">
            Tamper-proof elections for organizations of any size.
            Every vote cryptographically signed, every result publicly verifiable.
          </p>

          {/* Feature list */}
          <ul className="vc-feature-list">
            <li className="vc-feature-item">
              <div className="vc-feature-icon-wrap">
                <Icon.Shield />
              </div>
              <div className="vc-feature-text">
                <strong>On-chain immutability</strong>
                <span>Votes are recorded on a public ledger and cannot be altered.</span>
              </div>
            </li>
            <li className="vc-feature-item">
              <div className="vc-feature-icon-wrap">
                <Icon.Key />
              </div>
              <div className="vc-feature-text">
                <strong>Wallet-based identity</strong>
                <span>No passwords. Prove who you are with a cryptographic signature.</span>
              </div>
            </li>
            <li className="vc-feature-item">
              <div className="vc-feature-icon-wrap">
                <Icon.Vote />
              </div>
              <div className="vc-feature-text">
                <strong>Privacy by design</strong>
                <span>Your personal data stays off-chain. Only your address is public.</span>
              </div>
            </li>
          </ul>
        </div>

        {/* Stats row at the bottom */}
        <div className="vc-panel-left-bottom">
          <div className="vc-panel-stat-row">
            <div className="vc-stat">
              <span className="vc-stat-value">100%</span>
              <span className="vc-stat-label">Transparent</span>
            </div>
            <div className="vc-stat">
              <span className="vc-stat-value">0</span>
              <span className="vc-stat-label">Passwords stored</span>
            </div>
            <div className="vc-stat">
              <span className="vc-stat-value">∞</span>
              <span className="vc-stat-label">Audit trail</span>
            </div>
          </div>
        </div>
      </aside>

      {/* ════ RIGHT — Form panel ════ */}
      <main className="vc-panel-right">
        <div className="vc-card">

          {/* ── Card header ── */}
          <header className="vc-card-header">

            {/* Brand shown only on tablet / mobile (CSS hides on desktop) */}
            <div className="vc-card-brand">
              <div className="vc-card-brand-icon">
                <Icon.Vote />
              </div>
              <span className="vc-card-brand-name">VoteChain</span>
            </div>

            {/* Tab switcher */}
            <div className="vc-tabs" role="tablist" aria-label="Select login type">
              <button
                id="tab-voter"
                role="tab"
                aria-selected={activeTab === 'voter'}
                aria-controls="panel-voter"
                className={`vc-tab-btn ${activeTab === 'voter' ? 'active' : ''}`}
                onClick={() => setActiveTab('voter')}
              >
                <Icon.User /> I'm a Voter
              </button>
              <button
                id="tab-admin"
                role="tab"
                aria-selected={activeTab === 'admin'}
                aria-controls="panel-admin"
                className={`vc-tab-btn ${activeTab === 'admin' ? 'active' : ''}`}
                onClick={() => setActiveTab('admin')}
              >
                <Icon.Shield /> I'm an Admin
              </button>
            </div>
          </header>

          {/* ── Tab panels ── */}
          <div className="vc-card-body">
            {activeTab === 'voter' ? (
              <div id="panel-voter" role="tabpanel" aria-labelledby="tab-voter">
                <VoterTab onLoginSuccess={onLoginSuccess} />
              </div>
            ) : (
              <div id="panel-admin" role="tabpanel" aria-labelledby="tab-admin">
                <AdminTab onLoginSuccess={onLoginSuccess} />
              </div>
            )}
          </div>

          {/* ── Trust footer ── */}
          <footer className="vc-trust">
            Your identity is never stored on-chain. Only your wallet address is public.{' '}
            <a href="/" aria-label="Back to VoteChain marketing page">Learn more ↗</a>
          </footer>

        </div>
      </main>
    </div>
  );
}

