'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import * as FreighterAPI from '@stellar/freighter-api';

interface WalletContextType {
  address: string | null;
  publicKey: string | null;
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
}

const WalletContext = createContext<WalletContextType>({
  address: null,
  publicKey: null,
  isConnected: false,
  isLoading: false,
  error: null,
  connect: async () => {},
  disconnect: () => {},
});

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const [address, setAddress] = useState<string | null>(null);
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkConnection = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const connected = await FreighterAPI.isConnected();
      if (connected) {
        const publicKey = await FreighterAPI.getPublicKey();
        const address = FreighterAPI.getAddress ? 
          await FreighterAPI.getAddress() : 
          publicKey;
        
        setPublicKey(publicKey);
        setAddress(address);
        setIsConnected(true);
      } else {
        setIsConnected(false);
      }
    } catch (err) {
      console.error('Failed to check wallet connection:', err);
      setError('Failed to check wallet connection');
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  const connect = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const allowed = await FreighterAPI.setAllowed();
      if (allowed) {
        await checkConnection();
      } else {
        setError('Wallet connection was denied');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Connection failed';
      console.error('Wallet connection error:', err);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const disconnect = () => {
    setAddress(null);
    setPublicKey(null);
    setIsConnected(false);
    setError(null);
  };

  useEffect(() => {
    checkConnection();

    const interval = setInterval(checkConnection, 30000);
    return () => clearInterval(interval);
  }, []);

  const value: WalletContextType = {
    address,
    publicKey,
    isConnected,
    isLoading,
    error,
    connect,
    disconnect,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = (): WalletContextType => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within WalletProvider');
  }
  return context;
};

export default WalletProvider;
