'use client';

import { useState, useEffect, useCallback } from 'react';

interface UsageData {
  period: {
    start: string;
    end: string;
    days: number;
  };
  thisMonth: {
    total: number;
    limit: number;
    percentUsed: string;
  };
  totalsBySource: Record<string, { requests: number; tilejson: number; errors: number }>;
  grandTotal: { requests: number; tilejson: number; errors: number };
  daily: Array<{
    id: string;
    source: string;
    date: string;
    request_count: number;
    tilejson_count: number;
    error_count: number;
  }>;
  inMemoryCounts: Record<string, { requests: number; tilejson: number; errors: number }>;
}

export default function ApiUsagePage() {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<UsageData | null>(null);
  const [days, setDays] = useState(30);

  const fetchData = useCallback(async () => {
    if (!password) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/usage?days=${days}`, {
        headers: {
          'x-admin-password': password,
        },
      });

      if (response.status === 401) {
        setError('Invalid password');
        setIsAuthenticated(false);
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to fetch data');
        return;
      }

      const result = await response.json();
      setData(result);
      setIsAuthenticated(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error');
    } finally {
      setLoading(false);
    }
  }, [password, days]);

  const handleFlush = async () => {
    if (!password) return;

    try {
      const response = await fetch('/api/admin/usage', {
        method: 'POST',
        headers: {
          'x-admin-password': password,
        },
      });

      if (response.ok) {
        // Refresh data after flush
        await fetchData();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to flush');
    }
  };

  // Auto-refresh every 60 seconds when authenticated
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, [isAuthenticated, fetchData]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    fetchData();
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-gray-800 rounded-lg p-6 w-full max-w-sm">
          <h1 className="text-xl font-bold text-white mb-4">Admin Access</h1>
          <form onSubmit={handleLogin}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 mb-4"
              autoFocus
            />
            <button
              type="submit"
              disabled={loading || !password}
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded text-white font-medium"
            >
              {loading ? 'Loading...' : 'Access Dashboard'}
            </button>
            {error && (
              <p className="mt-3 text-red-400 text-sm">{error}</p>
            )}
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-white">API Usage Dashboard</h1>
          <div className="flex items-center gap-4">
            <select
              value={days}
              onChange={(e) => {
                setDays(Number(e.target.value));
                setTimeout(fetchData, 0);
              }}
              className="px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
            >
              <option value={7}>Last 7 days</option>
              <option value={30}>Last 30 days</option>
              <option value={90}>Last 90 days</option>
            </select>
            <button
              onClick={fetchData}
              disabled={loading}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-white"
            >
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
            <button
              onClick={handleFlush}
              className="px-4 py-2 bg-orange-600 hover:bg-orange-700 rounded text-white"
            >
              Flush Memory
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-900/50 border border-red-700 rounded-lg p-4 mb-6">
            <p className="text-red-300">{error}</p>
          </div>
        )}

        {data && (
          <>
            {/* Monthly Quota Card */}
            <div className="bg-gray-800 rounded-lg p-6 mb-6">
              <h2 className="text-lg font-semibold text-white mb-4">MapTiler Monthly Quota</h2>
              <div className="flex items-end gap-4">
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-400">This Month</span>
                    <span className="text-white font-mono">
                      {data.thisMonth.total.toLocaleString()} / {data.thisMonth.limit.toLocaleString()}
                    </span>
                  </div>
                  <div className="h-4 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        parseFloat(data.thisMonth.percentUsed) > 80
                          ? 'bg-red-500'
                          : parseFloat(data.thisMonth.percentUsed) > 50
                          ? 'bg-yellow-500'
                          : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(100, parseFloat(data.thisMonth.percentUsed))}%` }}
                    />
                  </div>
                </div>
                <div className="text-2xl font-bold text-white">
                  {data.thisMonth.percentUsed}%
                </div>
              </div>
            </div>

            {/* Totals by Source */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {Object.entries(data.totalsBySource).map(([source, stats]) => (
                <div key={source} className="bg-gray-800 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-400 uppercase mb-2">{source}</h3>
                  <div className="text-2xl font-bold text-white mb-2">
                    {stats.requests.toLocaleString()}
                  </div>
                  <div className="flex gap-4 text-sm">
                    <span className="text-gray-400">
                      TileJSON: <span className="text-white">{stats.tilejson}</span>
                    </span>
                    <span className="text-gray-400">
                      Errors: <span className={stats.errors > 0 ? 'text-red-400' : 'text-white'}>{stats.errors}</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Grand Total */}
            <div className="bg-gray-800 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Total Requests ({data.period.days} days)</span>
                <span className="text-xl font-bold text-white">
                  {data.grandTotal.requests.toLocaleString()}
                </span>
              </div>
            </div>

            {/* In-Memory Counts */}
            {Object.keys(data.inMemoryCounts).length > 0 && (
              <div className="bg-yellow-900/30 border border-yellow-700 rounded-lg p-4 mb-6">
                <h3 className="text-sm font-medium text-yellow-400 mb-2">Pending (In Memory)</h3>
                <div className="flex flex-wrap gap-4">
                  {Object.entries(data.inMemoryCounts).map(([key, stats]) => (
                    <div key={key} className="text-sm">
                      <span className="text-gray-400">{key}:</span>
                      <span className="text-white ml-1">{stats.requests}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Daily Breakdown */}
            <div className="bg-gray-800 rounded-lg overflow-hidden">
              <h2 className="text-lg font-semibold text-white p-4 border-b border-gray-700">Daily Breakdown</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-700/50">
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Source</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">Requests</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">TileJSON</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">Errors</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {data.daily.map((row) => (
                      <tr key={row.id} className="hover:bg-gray-700/30">
                        <td className="px-4 py-3 text-sm text-white font-mono">{row.date}</td>
                        <td className="px-4 py-3 text-sm text-gray-300">{row.source}</td>
                        <td className="px-4 py-3 text-sm text-white text-right font-mono">
                          {row.request_count.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-400 text-right font-mono">
                          {row.tilejson_count}
                        </td>
                        <td className={`px-4 py-3 text-sm text-right font-mono ${row.error_count > 0 ? 'text-red-400' : 'text-gray-400'}`}>
                          {row.error_count}
                        </td>
                      </tr>
                    ))}
                    {data.daily.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                          No usage data recorded yet
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
