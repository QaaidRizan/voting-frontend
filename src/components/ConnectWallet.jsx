import { useWallet } from '../hooks/useWallet';
import { useEffect } from 'react';

export function ConnectWallet({ onConnected }) {
  const { address, error, connectWallet } = useWallet();

  const handleClick = async () => {
    await connectWallet();
  };

  // Trigger callback when address is set
  useEffect(() => {
    if (address && onConnected) {
      onConnected(address);
    }
  }, [address, onConnected]);

  return (
    <div className="connect-wallet-container">
      {!address ? (
        <button className="connect-btn" onClick={handleClick}>Connect Wallet</button>
      ) : (
        <p className="connected-text">Connected: {address}</p>
      )}
      {error && <p className="error-text" style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}
