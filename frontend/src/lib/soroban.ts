import {
  Contract,
  Networks,
  TransactionBuilder,
  Server,
  StrKey,
  Address as SorobanAddress,
} from '@stellar/js-sdk';

export const NETWORK_PASSPHRASE = Networks.TESTNET_PASSPHRASE;
export const CONTRACT_ID = process.env.NEXT_PUBLIC_CONTRACT_ID || '';
export const STELLAR_RPC_URL = process.env.NEXT_PUBLIC_STELLAR_RPC_URL || 
  'https://soroban-testnet.stellar.org';

export const USDC_CONTRACT_ID = process.env.NEXT_PUBLIC_USDC_CONTRACT_ID || '';
export const NETWORK_BASE_FEE = 100;

export function getBorealisContract() {
  if (!CONTRACT_ID) {
    throw new Error('CONTRACT_ID not configured');
  }
  return new Contract(CONTRACT_ID);
}

export function getStellarServer() {
  return new Server(STELLAR_RPC_URL);
}

export async function verifyContractDeployment(): Promise<boolean> {
  try {
    const server = getStellarServer();
    const contract = getBorealisContract();
    return true;
  } catch (error) {
    console.error('Contract verification failed:', error);
    return false;
  }
}

export function formatTokenAmount(amount: number | string, decimals: number = 6): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  const divisor = Math.pow(10, decimals);
  return (num / divisor).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  });
}

export function toContractAmount(amount: number, decimals: number = 6): string {
  return Math.floor(amount * Math.pow(10, decimals)).toString();
}

export class SorobanError extends Error {
  constructor(
    public code: string,
    public details: unknown,
    message: string
  ) {
    super(message);
    this.name = 'SorobanError';
  }
}

export interface WaveData {
  id: number;
  sponsor: string;
  token: string;
  totalFunds: string;
  totalPoints: number;
  isDistributed: boolean;
  createdAt: number;
}

export function isValidStellarAddress(address: string): boolean {
  try {
    return StrKey.isValidEd25519PublicKey(address);
  } catch {
    return false;
  }
}

export const contractMethods = {
  initialize: (adminAddress: string) => ({
    admin: new SorobanAddress(adminAddress),
  }),
  
  createWave: (
    sponsorAddress: string,
    tokenAddress: string,
    amount: string,
    description: string
  ) => ({
    sponsor: new SorobanAddress(sponsorAddress),
    token: new SorobanAddress(tokenAddress),
    amount: amount,
    metadata: {
      description: description,
      duration_seconds: 604800,
      project_ref: 'borealis-wave',
    },
  }),

  allocatePoints: (waveId: number, contributor: string, points: number) => ({
    wave_id: waveId,
    contributor: new SorobanAddress(contributor),
    points: points,
  }),

  setSplits: (contributor: string, splits: Record<string, number>) => ({
    contributor: new SorobanAddress(contributor),
    splits: splits,
  }),
};

export default {
  NETWORK_PASSPHRASE,
  CONTRACT_ID,
  STELLAR_RPC_URL,
  USDC_CONTRACT_ID,
  getBorealisContract,
  getStellarServer,
  verifyContractDeployment,
  formatTokenAmount,
  toContractAmount,
  isValidStellarAddress,
  contractMethods,
};
