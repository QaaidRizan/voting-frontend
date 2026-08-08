import { BrowserProvider, Contract } from 'ethers';
import VotingSystemAbi from '../contracts/VotingSystem.abi.json';

const CONTRACT_ADDRESS = import.meta.env?.VITE_VOTING_CONTRACT_ADDRESS || '';
const EXPECTED_CHAIN_ID = import.meta.env?.VITE_CHAIN_ID
  ? BigInt(import.meta.env.VITE_CHAIN_ID)
  : 31337n;

const HARDHAT_NETWORK = {
  chainId: `0x${EXPECTED_CHAIN_ID.toString(16)}`, // 0x7a69 = 31337
  chainName: 'Hardhat Local',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: ['http://127.0.0.1:8545'],
};

/**
 * Ensure MetaMask is on the local Hardhat chain (31337).
 * Prompts the user to switch, or adds the network if missing.
 */
async function ensureHardhatNetwork() {
  const ethereum = window.ethereum;
  const currentHex = await ethereum.request({ method: 'eth_chainId' });
  const currentId = BigInt(currentHex);

  if (currentId === EXPECTED_CHAIN_ID) return;

  try {
    await ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: HARDHAT_NETWORK.chainId }],
    });
  } catch (err) {
    // 4902 = chain not added to MetaMask yet
    if (err?.code === 4902 || err?.error?.code === 4902) {
      await ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [HARDHAT_NETWORK],
      });
      return;
    }
    if (err?.code === 4001) {
      throw new Error('Please approve the network switch to Hardhat Local (chain 31337) in MetaMask.');
    }
    throw new Error(
      `Wrong network (chain ${currentId}). Switch MetaMask to Hardhat Local (chain ID ${EXPECTED_CHAIN_ID}).`,
    );
  }
}

/**
 * Casts an on-chain vote via the voter's MetaMask wallet.
 * VotingSystem.castVote requires msg.sender === voter.
 */
export async function castVoteOnChain(onChainElectionId, onChainCandidateId) {
  if (!CONTRACT_ADDRESS) {
    throw new Error('VITE_VOTING_CONTRACT_ADDRESS is not set in the frontend .env');
  }
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error('MetaMask is not available. Please install or unlock MetaMask.');
  }
  if (onChainElectionId == null || onChainCandidateId == null) {
    throw new Error('Missing on-chain election or candidate ID. Re-sync this election from admin.');
  }

  await ensureHardhatNetwork();

  const provider = new BrowserProvider(window.ethereum);
  const network = await provider.getNetwork();
  if (network.chainId !== EXPECTED_CHAIN_ID) {
    throw new Error(
      `Still on chain ${network.chainId}. Approve switching to Hardhat Local (${EXPECTED_CHAIN_ID}) in MetaMask.`,
    );
  }

  const signer = await provider.getSigner();
  const contract = new Contract(CONTRACT_ADDRESS, VotingSystemAbi, signer);
  try {
    const tx = await contract.castVote(onChainElectionId, onChainCandidateId);
    const receipt = await tx.wait();
    return {
      transactionHash: receipt.hash,
      from: await signer.getAddress(),
    };
  } catch (err) {
    const raw = `${err?.data || err?.info?.error?.data || err?.error?.data || ''}`.toLowerCase();
    const msg = `${err?.shortMessage || err?.reason || err?.message || ''}`.toLowerCase();
    if (raw.includes('797fd49b') || msg.includes('beforeelectionstarttime')) {
      throw new Error(
        'Voting has not started yet. The on-chain startTime is still in the future. Create/open an election whose Start is now (or earlier).',
      );
    }
    if (raw.includes('6278fb6a') || msg.includes('beyondelectionendtime')) {
      throw new Error('The election deadline has passed. Votes are locked on-chain.');
    }
    if (raw.includes('fdf6acd2') || msg.includes('notwhitelisted')) {
      throw new Error('This wallet is not whitelisted for this election on-chain.');
    }
    if (raw.includes('9caf0552') || msg.includes('electionmustbeopen')) {
      throw new Error('This election is not OPEN on-chain.');
    }
    throw err;
  }
}
