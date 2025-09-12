'use client';

import { useMinerStatus, formatHashrate } from '@xmrig-for-android/ui-shared';
import { StatusBadge } from '@/components/StatusBadge';

export default function DashboardPage() {
  const { status, isLoading, lastUpdated } = useMinerStatus(3000);

  if (isLoading && !status) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading miner status...</p>
        </div>
      </div>
    );
  }

  const currentHashrate = status?.hashrate.current ?? 0;
  const formattedHashrate = formatHashrate(currentHashrate);
  const donationPercent = status?.donation.percent ?? 1;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-100">Dashboard</h1>
        <div className="text-sm text-gray-400">
          Last updated: {lastUpdated ? new Date(lastUpdated).toLocaleTimeString() : 'Never'}
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold mb-2">Miner Status</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span>State:</span>
              <span className={`status-badge ${
                status?.state === 'RUNNING' ? 'status-badge-success' :
                status?.state === 'PAUSED' ? 'status-badge-warning' :
                'status-badge-error'
              }`}>
                {status?.state ?? 'UNKNOWN'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Working:</span>
              <span className={status?.isWorking ? 'text-green-400' : 'text-red-400'}>
                {status?.isWorking ? 'Yes' : 'No'}
              </span>
            </div>
            {status?.isPaused && (
              <div className="flex items-center justify-between">
                <span>Paused:</span>
                <span className="text-yellow-400">Yes</span>
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold mb-2">Current Hashrate</h3>
          <div className="text-2xl font-bold text-primary-400">
            {formattedHashrate.display}
          </div>
          <div className="text-sm text-gray-400 mt-1">
            Real-time performance
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold mb-2">Donation</h3>
          <div className="text-2xl font-bold text-blue-400">
            {donationPercent}%
          </div>
          <div className="text-sm text-gray-400 mt-1">
            Supporting XMRig development
          </div>
        </div>
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Hashrate History</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Current:</span>
              <span className="font-mono text-primary-400">
                {formatHashrate(status?.hashrate.current ?? 0).display}
              </span>
            </div>
            <div className="flex justify-between">
              <span>10s Average:</span>
              <span className="font-mono">
                {formatHashrate(status?.hashrate.average10s ?? 0).display}
              </span>
            </div>
            <div className="flex justify-between">
              <span>60s Average:</span>
              <span className="font-mono">
                {formatHashrate(status?.hashrate.average60s ?? 0).display}
              </span>
            </div>
            <div className="flex justify-between">
              <span>15m Average:</span>
              <span className="font-mono">
                {formatHashrate(status?.hashrate.average15m ?? 0).display}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Highest:</span>
              <span className="font-mono text-green-400">
                {formatHashrate(status?.hashrate.highest ?? 0).display}
              </span>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold mb-4">System Status</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>CPU Temperature:</span>
              <span className={`font-mono ${
                (status?.thermal.cpuTemperature ?? 0) > 70 ? 'text-red-400' :
                (status?.thermal.cpuTemperature ?? 0) > 60 ? 'text-yellow-400' :
                'text-green-400'
              }`}>
                {status?.thermal.cpuTemperature?.toFixed(1) ?? 'N/A'}°C
              </span>
            </div>
            <div className="flex justify-between">
              <span>Battery Level:</span>
              <span className={`font-mono ${
                (status?.battery.level ?? 0) < 20 ? 'text-red-400' :
                (status?.battery.level ?? 0) < 50 ? 'text-yellow-400' :
                'text-green-400'
              }`}>
                {status?.battery.level?.toFixed(0) ?? 'N/A'}%
                {status?.battery.isCharging && ' (Charging)'}
              </span>
            </div>
            {status?.uptime && (
              <div className="flex justify-between">
                <span>Uptime:</span>
                <span className="font-mono text-blue-400">
                  {Math.floor(status.uptime / 3600)}h {Math.floor((status.uptime % 3600) / 60)}m
                </span>
              </div>
            )}
            {status?.connection.pool && (
              <div className="flex justify-between">
                <span>Pool:</span>
                <span className="font-mono text-xs text-gray-400 truncate max-w-32">
                  {status.connection.pool}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* TODO(FE-2): Add real-time charts here */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Hashrate Chart</h3>
        <div className="h-64 flex items-center justify-center bg-gray-700 rounded-lg">
          <div className="text-center text-gray-400">
            <div className="text-2xl mb-2">📊</div>
            <p>Hashrate Chart (FE-2)</p>
            <p className="text-sm">Real-time sparkline coming soon</p>
          </div>
        </div>
      </div>
    </div>
  );
}