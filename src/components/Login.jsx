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
  Calendar: () => (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '20px', height: '20px' }}>
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  IdCard: () => (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '20px', height: '20px' }}>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="7" y1="8" x2="17" y2="8" />
      <line x1="7" y1="12" x2="17" y2="12" />
      <line x1="7" y1="16" x2="11" y2="16" />
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
   Enforces: Connect -> Nonce -> Sign -> Verify -> Register
═══════════════════════════════════════════════ */
function VoterTab({ onLoginSuccess }) {
  const [voterName, setVoterName] = useState('');
  const [voterDob, setVoterDob] = useState('');
  const [voterNationalId, setVoterNationalId] = useState('');
  const [subMode, setSubMode] = useState('register'); // 'register' | 'login'
  const [regStatus, setRegStatus] = useState(null); // { type, text }
  const [loginStatus, setLoginStatus] = useState(null);
  const [copiedAddr, setCopiedAddr] = useState(false);
  const [registeredAddress, setRegisteredAddress] = useState(null);
  const [loading, setLoading] = useState(false);

  const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

  // ── Register flow: Request Nonce -> Sign Nonce -> Verify -> Register ──
  const handleRegister = async () => {
    if (!voterName.trim()) {
      setRegStatus({ type: 'error', text: 'Please enter your full name.' });
      return;
    }
    if (!voterDob.trim()) {
      setRegStatus({ type: 'error', text: 'Please enter your date of birth.' });
      return;
    }
    if (!voterNationalId.trim()) {
      setRegStatus({ type: 'error', text: 'Please enter your national ID.' });
      return;
    }
    if (!window.ethereum) {
      setRegStatus({ type: 'error', text: 'MetaMask not detected. Please install it.' });
      return;
    }

    setLoading(true);
    setRegStatus({ type: 'info', text: 'Connecting wallet…' });

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send('eth_requestAccounts', []);
      const walletAddress = accounts[0];

      setRegStatus({ type: 'info', text: 'Requesting verification challenge…' });
      const nonceRes = await fetch(`${baseUrl}/api/auth/nonce`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress }),
      });
      if (!nonceRes.ok) {
        const err = await nonceRes.json();
        throw new Error(err.error || 'Failed to get nonce.');
      }
      const { nonce } = await nonceRes.json();

      setRegStatus({ type: 'info', text: 'Please sign the challenge in MetaMask…' });
      const signer = await provider.getSigner();
      const message = `Sign this nonce to authenticate: ${nonce}`;
      const signature = await signer.signMessage(message);

      setRegStatus({ type: 'info', text: 'Verifying signature & obtaining registration session…' });
      const verifyRes = await fetch(`${baseUrl}/api/auth/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress, signature }),
      });
      if (!verifyRes.ok) {
        const err = await verifyRes.json();
        throw new Error(err.error || 'Signature verification failed.');
      }
      const { token } = await verifyRes.json();

      setRegStatus({ type: 'info', text: 'Submitting registration & KYC to secure database…' });
      const regRes = await fetch(`${baseUrl}/api/voters/register`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          walletAddress,
          kycData: {
            fullName: voterName.trim(),
            dateOfBirth: voterDob,
            nationalId: voterNationalId.trim(),
            documents: {}
          }
        }),
      });

      if (regRes.ok) {
        setRegisteredAddress(walletAddress);
        setRegStatus({ type: 'success', text: 'Wallet registered successfully! Your status is pending review.' });
      } else {
        const errData = await regRes.json();
        if (regRes.status === 409) {
          setRegStatus({ type: 'warning', text: 'This wallet or national identity is already registered. Please sign in.' });
        } else {
          setRegStatus({ type: 'error', text: `Registration failed: ${errData.error || 'Unknown error'}` });
        }
      }
    } catch (err) {
      console.error(err);
      setRegStatus({ type: 'error', text: err.message || 'Registration failed. Please check MetaMask and try again.' });
    } finally {
      setLoading(false);
    }
  };

  // ── Login flow: Request Nonce -> Sign Nonce -> Verify -> Fetch User Info ──
  const handleLogin = async () => {
    if (!window.ethereum) {
      setLoginStatus({ type: 'error', text: 'MetaMask not detected. Please install it.' });
      return;
    }

    setLoading(true);
    setLoginStatus({ type: 'info', text: 'Connecting wallet…' });

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send('eth_requestAccounts', []);
      const walletAddress = accounts[0];

      setLoginStatus({ type: 'info', text: 'Fetching challenge nonce…' });
      const nonceRes = await fetch(`${baseUrl}/api/auth/nonce`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress }),
      });
      if (!nonceRes.ok) {
        const err = await nonceRes.json();
        throw new Error(err.error || 'Failed to get nonce.');
      }
      const { nonce } = await nonceRes.json();

      setLoginStatus({ type: 'info', text: 'Please sign the challenge in MetaMask…' });
      const signer = await provider.getSigner();
      const message = `Sign this nonce to authenticate: ${nonce}`;
      const signature = await signer.signMessage(message);

      setLoginStatus({ type: 'info', text: 'Verifying signature…' });
      const verifyRes = await fetch(`${baseUrl}/api/auth/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress, signature }),
      });
      if (!verifyRes.ok) {
        const err = await verifyRes.json();
        throw new Error(err.error || 'Signature verification failed.');
      }
      const verifyData = await verifyRes.json();

      setLoginStatus({ type: 'info', text: 'Retrieving your profile…' });
      const meRes = await fetch(`${baseUrl}/api/voters/me`, {
        headers: { 'Authorization': `Bearer ${verifyData.token}` }
      });
      
      if (meRes.ok) {
        const meData = await meRes.json();
        setLoginStatus({ type: 'success', text: 'Verified! Signing you in…' });
        
        onLoginSuccess({
          walletAddress: verifyData.walletAddress,
          role: verifyData.role.toUpperCase(),
          name: meData.name,
          status: meData.status,
          token: verifyData.token
        });
      } else {
        const errData = await meRes.json();
        throw new Error(errData.error || 'Voter profile not found. Please register first.');
      }
    } catch (err) {
      console.error(err);
      setLoginStatus({ type: 'error', text: err.message || 'Login failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedAddr(true);
      setTimeout(() => setCopiedAddr(false), 2000);
    });
  };

  return (
    <div className="vc-step">
      {subMode === 'register' ? (
        <>
          <p className="vc-section-title">Create Your Voter Wallet</p>
          <p className="vc-section-subtitle">
            Enter your details and sign the MetaMask challenge to register.
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
                disabled={loading || !!registeredAddress}
                autoComplete="name"
              />
            </div>
          </div>

          <div className="vc-field" style={{ marginTop: '12px' }}>
            <label className="vc-label" htmlFor="voter-dob">Date of Birth</label>
            <div className="vc-input-wrap">
              <Icon.Calendar className="vc-input-icon" />
              <input
                id="voter-dob"
                type="date"
                className="vc-input"
                value={voterDob}
                onChange={(e) => setVoterDob(e.target.value)}
                disabled={loading || !!registeredAddress}
              />
            </div>
          </div>

          <div className="vc-field" style={{ marginTop: '12px' }}>
            <label className="vc-label" htmlFor="voter-national-id">National ID Number</label>
            <div className="vc-input-wrap">
              <Icon.IdCard className="vc-input-icon" />
              <input
                id="voter-national-id"
                type="text"
                className="vc-input"
                placeholder="e.g. NAT-12345678"
                value={voterNationalId}
                onChange={(e) => setVoterNationalId(e.target.value)}
                disabled={loading || !!registeredAddress}
              />
            </div>
          </div>

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
                <p>Your KYC registration is now pending review by election admins.</p>
              </div>
            </div>
          )}

          {!registeredAddress && (
            <button
              id="voter-connect-btn"
              className="vc-btn-primary"
              onClick={handleRegister}
              disabled={loading}
              style={{ marginTop: '16px' }}
            >
              {loading ? (
                <><div className="vc-spinner" /> Processing registration…</>
              ) : (
                <><Icon.Wallet /> Sign &amp; Register Wallet</>
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
              Already registered? Sign in here →
            </button>
          </div>
        </>
      ) : (
        /* ── Voter Login sub-mode ── */
        <>
          <p className="vc-section-title">Voter Sign In</p>
          <p className="vc-section-subtitle">
            Prove ownership of your registered voter wallet via challenge-handshake.
          </p>

          {loginStatus && <Status type={loginStatus.type}>{loginStatus.text}</Status>}

          <button
            id="voter-login-btn"
            className="vc-btn-primary"
            onClick={handleLogin}
            disabled={loading}
            style={{ marginTop: '16px' }}
          >
            {loading ? (
              <><div className="vc-spinner" /> Authenticating…</>
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
   Enforces: Connect -> Nonce -> Sign -> Verify
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
      const res = await fetch(`${baseUrl}/api/auth/nonce`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress: walletAddr.trim() })
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus({ type: 'error', text: data.error || "Failed to fetch challenge." });
        setLoading(false);
        return;
      }
      setNonce(data.nonce);
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
      setStatus({ type: 'error', text: 'MetaMask not detected. Please install it.' });
      return;
    }
    setLoading(true);
    setStatus({ type: 'info', text: 'Waiting for MetaMask signature…' });
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const message = `Sign this nonce to authenticate: ${nonce}`;
      const sig = await signer.signMessage(message);
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
      const res = await fetch(`${baseUrl}/api/auth/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress: walletAddr.trim(), signature: signature.trim() }),
      });

      const verifyData = await res.json();
      if (res.ok) {
        setStatus({ type: 'success', text: 'Signature verified! Signing you in…' });
        
        // Admin user session object
        onLoginSuccess({
          walletAddress: verifyData.walletAddress,
          role: verifyData.role.toUpperCase(), // 'ADMIN'
          name: 'Election Admin',
          token: verifyData.token
        });
      } else {
        if (verifyData.error?.includes('not admin') || verifyData.error?.includes('allowlist')) {
          setStatus({ type: 'error', text: "This wallet isn't registered as an admin." });
        } else {
          setStatus({ type: 'error', text: verifyData.error || `Signature doesn't match this address. Try again.` });
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
            <div className="vc-nonce-value">Sign this nonce to authenticate: {nonce}</div>
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
export function Login({ onLoginSuccess, onOpenResults }) {
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
            {onOpenResults ? (
              <button
                type="button"
                onClick={onOpenResults}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  color: 'inherit',
                  textDecoration: 'underline',
                  cursor: 'pointer',
                  font: 'inherit',
                }}
              >
                View public results &amp; audit ↗
              </button>
            ) : (
              <a href="/" aria-label="Back to VoteChain marketing page">Learn more ↗</a>
            )}
          </footer>

        </div>
      </main>
    </div>
  );
}

