# API Integration Review Report: Frontend vs. Backend

This report details the mismatches between the current frontend implementation in `voting-frontend` and the backend API specification documented in `API_DOCUMENTATION.md` for **Voter Registration** and **Admin Approval** flows.

---

## 1. Authentication Flow Mismatches (Voter & Admin Sign In)

Both Voter and Admin sign-in flows in the frontend (`Login.jsx`) have three critical integration errors:

### Mismatch A: Request Method and URL
- **Frontend calls**: `GET ${baseUrl}/auth/nonce?wallet=${walletAddress}`
- **Backend expects**: `POST /api/auth/nonce` with JSON body `{"walletAddress": "..."}`

### Mismatch B: Nonce Property Key
- **Frontend expects**: `nonceData.data`
- **Backend returns**: `nonceData.nonce`

### Mismatch C: Prefix `/api` Missing
- **Frontend calls**: `${baseUrl}/auth/...`
- **Backend expects**: `${baseUrl}/api/auth/...`

---

## 2. Voter Registration Flow Mismatches

### Mismatch A: JWT Authorization Missing
- **Frontend calls**: `POST ${baseUrl}/voters/register` with no headers.
- **Backend expects**: `POST /api/voters/register` with `Authorization: Bearer <JWT_TOKEN>`.
- *Correction*: The voter must complete the MetaMask signature authentication flow first to get a JWT, then send that token with the registration request.

### Mismatch B: Payload Schema & KYC Fields
- **Frontend sends**:
  ```json
  {
    "name": "Alex Johnson",
    "walletAddress": "0x1234..."
  }
  ```
- **Backend expects**:
  ```json
  {
    "walletAddress": "0x1234...",
    "kycData": {
      "fullName": "Alex Johnson",
      "dateOfBirth": "1990-05-15", // YYYY-MM-DD
      "nationalId": "NAT-123456"
    }
  }
  ```
- *Correction*: The frontend registration form needs input fields for **Date of Birth** and **National ID**, and these must be nested inside a `kycData` object.

---

## 3. Admin Approval & Voter Management Mismatches

In `AdminDashboard.jsx`, the data fetching and approval actions do not match the backend design:

### Mismatch A: Authentication Header Key
- **Frontend sends**: `x-wallet-address: user.walletAddress`
- **Backend expects**: `Authorization: Bearer <JWT_TOKEN>`

### Mismatch B: Endpoint URLs
- **Frontend calls**:
  - `GET /voters/pending`
  - `GET /voters/approved`
  - `GET /voters/stats`
- **Backend expects**:
  - `GET /api/admin/voters?status=PENDING` (returns pending voters)
  - *(Note: approved voters list and overall stats are currently not defined on the backend. The backend expects admins to check individual profiles via `GET /api/voters/:walletAddress`)*

### Mismatch C: Approve / Reject Action Format
- **Frontend calls**: `PATCH /voters/:voterId/approve` and `PATCH /voters/:voterId/reject` (using Database UUID).
- **Backend expects**: 
  - **Approve**: `POST /api/admin/voters/:walletAddress/approve`
  - **Reject**: `POST /api/admin/voters/:walletAddress/reject` with body `{"reason": "..."}`
- *Correction*: Use **`POST`** instead of `PATCH`, use the voter's **`walletAddress`** instead of the SQL UUID in the URL path, and include a rejection reason body for rejections.

---

## Suggested Code Modifications for Frontend Team

### 1. Correcting Registration Flow (in `Login.jsx`)
```javascript
// Step 1: Sign Nonce to get JWT token
// Step 2: Register Voter with JWT token and correct schema
const registerVoterOnBackend = async (walletAddress, fullName, dob, nationalId, token) => {
  const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
  const response = await fetch(`${baseUrl}/api/voters/register`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      walletAddress,
      kycData: {
        fullName,
        dateOfBirth: dob, // format: "YYYY-MM-DD"
        nationalId
      }
    }),
  });
  return response.ok;
};
```

### 2. Correcting Admin Actions (in `AdminDashboard.jsx`)
```javascript
const handleAction = async (voterWalletAddress, action, reason = '') => {
  const headers = { 
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${adminToken}` // Use the JWT token stored at login
  };

  const body = action === 'reject' ? JSON.stringify({ reason }) : undefined;

  const res = await fetch(`${baseUrl}/api/admin/voters/${voterWalletAddress}/${action}`, {
    method: 'POST',
    headers,
    body
  });

  if (res.ok) {
    fetchData();
  }
};
```
