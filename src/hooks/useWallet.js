import { ethers } from 'ethers';
import { useState } from 'react';

export function useWallet() {
  const [address, setAddress] = useState(null);
  const [error, setError] = useState(null);

  async function connectWallet() {
    if (!window.ethereum) {
      setError('MetaMask not detected. Please install it.');
      return;
    }
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send('eth_requestAccounts', []);
      setAddress(accounts[0]);
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  }

  return { address, error, connectWallet };
}
