'use client';

import { useTelemetryStream, formatHashrate } from '@xmrig-for-android/ui-shared';
import { useMemo } from 'react';

export default function HashratePage() {
  const { events, getEventsByType } = useTelemetryStream();
  
  const hashrateEvents = getEventsByType('HASHRATE_SAMPLE');
  
  const stats = useMemo(() => {
    if (!hashrateEvents.length) return null;
    
    const values = hashrateEvents.map(e => e.data.current).filter(v => v > 0);
    if (!values.length) return null;
    
    const current = values[values.length - 1];
    const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
    const max = Math.max(...values);
    const min = Math.min(...values);
    
    return { current, avg, max, min, samples: values.length };
  }, [hashrateEvents]);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-100">Hashrate Analytics</h1>
        <div className="text-sm text-gray-400">
          {hashrateEvents.length} samples collected
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold mb-2">Current</h3>
          <div className="text-2xl font-bold text-primary-400">
            {stats ? formatHashrate(stats.current).display : 'N/A'}
          </div>
        </div>
        
        <div className="card">
          <h3 className="text-lg font-semibold mb-2">Average</h3>
          <div className="text-2xl font-bold text-blue-400">
            {stats ? formatHashrate(stats.avg).display : 'N/A'}
          </div>
        </div>
        
        <div className="card">
          <h3 className="text-lg font-semibold mb-2">Maximum</h3>
          <div className="text-2xl font-bold text-green-400">
            {stats ? formatHashrate(stats.max).display : 'N/A'}
          </div>
        </div>
        
        <div className="card">
          <h3 className="text-lg font-semibold mb-2">Minimum</h3>
          <div className="text-2xl font-bold text-yellow-400">
            {stats ? formatHashrate(stats.min).display : 'N/A'}
          </div>
        </div>
      </div>

      {/* TODO(FE-2): Advanced charts and analytics */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Hashrate Timeline</h3>
        <div className="h-96 flex items-center justify-center bg-gray-700 rounded-lg">
          <div className="text-center text-gray-400">
            <div className="text-4xl mb-4">📈</div>
            <p className="text-xl mb-2">Advanced Charts (FE-2)</p>
            <p>Victory-native & Recharts/Visx integration</p>
            <p className="text-sm mt-2">Interactive timeline, performance analysis, efficiency metrics</p>
          </div>
        </div>
      </div>

      {/* Recent Samples */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Recent Samples</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="border-b border-gray-600">
              <tr>
                <th className="text-left py-2">Time</th>
                <th className="text-left py-2">Current</th>
                <th className="text-left py-2">10s Avg</th>
                <th className="text-left py-2">60s Avg</th>
                <th className="text-left py-2">15m Avg</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-600">
              {hashrateEvents.slice(-10).reverse().map((event) => (
                <tr key={event.id} className="hover:bg-gray-700">
                  <td className="py-2 font-mono text-xs">
                    {new Date(event.timestamp).toLocaleTimeString()}
                  </td>
                  <td className="py-2 font-mono text-primary-400">
                    {formatHashrate(event.data.current).display}
                  </td>
                  <td className="py-2 font-mono">
                    {formatHashrate(event.data.average10s).display}
                  </td>
                  <td className="py-2 font-mono">
                    {formatHashrate(event.data.average60s).display}
                  </td>
                  <td className="py-2 font-mono">
                    {formatHashrate(event.data.average15m).display}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!hashrateEvents.length && (
            <div className="text-center py-8 text-gray-400">
              No hashrate samples available yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
}