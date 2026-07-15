'use client';

import { useEffect, useState } from 'react';
import { useWallet } from '@/components/WalletProvider';
import {
  Activity,
  GitMerge,
  DollarSign,
  Settings,
  Zap,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';

interface Wave {
  id: number;
  totalFunds: string;
  sponsor: string;
  totalPoints: number;
}

export default function WaveDashboard() {
  const { address, connect, isConnected, isLoading, error } = useWallet();
  const [waves, setWaves] = useState<Wave[]>([]);
  const [isLoadingWaves, setIsLoadingWaves] = useState(false);
  const [activeTab, setActiveTab] = useState<'waves' | 'splits' | 'rewards'>('waves');

  useEffect(() => {
    if (isConnected && !isLoadingWaves) {
      // TODO: Fetch Waves from contract
    }
  }, [isConnected, isLoadingWaves]);

  const formatNumber = (num: number | string): string => {
    const n = typeof num === 'string' ? parseFloat(num) : num;
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(2) + 'M';
    if (n >= 1_000) return (n / 1_000).toFixed(2) + 'K';
    return n.toFixed(2);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 text-slate-50">
      <header className="sticky top-0 z-50 backdrop-blur-md border-b border-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Activity className="w-8 h-8 text-aurora-400 animate-pulse-glow" />
              <div className="absolute inset-0 bg-aurora-400/20 blur-lg -z-10" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Borealis Engine</h1>
              <p className="text-xs text-slate-400">Sustainable open-source funding</p>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-sm text-red-400 bg-red-950/30 px-3 py-2 rounded-lg">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          {!isConnected ? (
            <button
              onClick={connect}
              disabled={isLoading}
              className="bg-gradient-to-r from-aurora-500 to-aurora-600 hover:from-aurora-400 hover:to-aurora-500 disabled:from-slate-600 disabled:to-slate-700 text-slate-950 font-semibold px-6 py-2 rounded-full transition-all duration-200 disabled:opacity-50"
            >
              {isLoading ? 'Connecting...' : 'Connect Freighter'}
            </button>
          ) : (
            <div className="flex items-center gap-4">
              <div className="bg-slate-900 border border-slate-700 px-4 py-2 rounded-full font-mono text-sm">
                {address?.slice(0, 6)}...{address?.slice(-4)}
              </div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-400">
                <span className="w-2 h-2 bg-green-400 rounded-full" />
                Connected
              </span>
            </div>
          )}
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {isConnected ? (
          <>
            <div className="flex gap-2 mb-8 border-b border-slate-800">
              {(['waves', 'splits', 'rewards'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-3 font-medium transition-colors capitalize ${
                    activeTab === tab
                      ? 'text-aurora-400 border-b-2 border-aurora-400'
                      : 'text-slate-400 hover:text-slate-300'
                  }`}
                >
                  {tab === 'waves' && '🌊 Waves'}
                  {tab === 'splits' && '🔀 Splits'}
                  {tab === 'rewards' && '💰 Rewards'}
                </button>
              ))}
            </div>

            {activeTab === 'waves' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {waves.length > 0 ? (
                  waves.map((wave) => (
                    <div
                      key={wave.id}
                      className="bg-slate-900 rounded-xl p-6 border border-slate-800 hover:border-slate-700 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-semibold flex items-center gap-2">
                            <DollarSign className="w-5 h-5 text-emerald-400" />
                            Wave #{wave.id}
                          </h3>
                        </div>
                        <button className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
                          <Settings className="w-5 h-5 text-slate-400" />
                        </button>
                      </div>
                      <button className="w-full mt-4 py-2 bg-aurora-600 hover:bg-aurora-500 rounded-lg font-medium transition-colors">
                        View Details
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full bg-slate-900/50 border border-dashed border-slate-700 rounded-xl p-12 text-center">
                    <TrendingUp className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-400">No active Waves yet</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'splits' && (
              <div className="max-w-2xl">
                <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
                  <h2 className="text-lg font-semibold flex items-center gap-2 mb-6">
                    <GitMerge className="w-5 h-5 text-purple-400" />
                    Dependency Splits
                  </h2>
                  <button className="w-full py-3 border-2 border-dashed border-slate-700 rounded-lg text-slate-400 hover:text-slate-300 hover:border-slate-500 transition-colors flex items-center justify-center gap-2">
                    <Zap className="w-4 h-4" />
                    Add Upstream Dependency
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'rewards' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
                  <p className="text-sm text-slate-400">Total Earned</p>
                  <p className="text-2xl font-bold mt-2">0 USDC</p>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-slate-900 rounded-2xl p-12 border border-slate-800">
              <Activity className="w-16 h-16 text-slate-600 mx-auto mb-6" />
              <h2 className="text-2xl font-bold mb-2">Connect Your Wallet</h2>
              <button
                onClick={connect}
                disabled={isLoading}
                className="bg-gradient-to-r from-aurora-500 to-aurora-600 hover:from-aurora-400 hover:to-aurora-500 text-slate-950 font-semibold px-8 py-3 rounded-lg transition-all duration-200"
              >
                {isLoading ? 'Connecting...' : 'Connect Freighter Wallet'}
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
