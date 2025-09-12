'use client';

import { useTelemetryStream } from '@xmrig-for-android/ui-shared';

export default function PoliciesPage() {
  const { events, getEventsByType } = useTelemetryStream();
  
  const policyEvents = getEventsByType('POLICY_DECISION');

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-100">Policy Management</h1>
        <div className="text-sm text-gray-400">
          {policyEvents.length} policy decisions recorded
        </div>
      </div>

      {/* TODO(PHASE2): Policy engine integration */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Policy Engine Status</h3>
        <div className="space-y-4">
          <div className="p-4 bg-yellow-900 border border-yellow-600 rounded-lg">
            <div className="flex items-center">
              <div className="text-yellow-400 mr-3">⚠️</div>
              <div>
                <h4 className="font-semibold">Policy Engine Integration Pending</h4>
                <p className="text-sm text-yellow-200 mt-1">
                  TODO(PHASE2): Connect to policy orchestration engine for automated mining decisions
                </p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-700 rounded-lg">
              <h4 className="font-semibold mb-2">Thermal Policies</h4>
              <p className="text-sm text-gray-400">CPU temperature monitoring and auto-pause</p>
            </div>
            <div className="p-4 bg-gray-700 rounded-lg">
              <h4 className="font-semibold mb-2">Power Policies</h4>
              <p className="text-sm text-gray-400">Battery level and charging state management</p>
            </div>
            <div className="p-4 bg-gray-700 rounded-lg">
              <h4 className="font-semibold mb-2">Performance Policies</h4>
              <p className="text-sm text-gray-400">Hashrate optimization and efficiency rules</p>
            </div>
          </div>
        </div>
      </div>

      {/* TODO(FE-2): Policy feed UI */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Policy Decision Feed</h3>
        <div className="h-64 flex items-center justify-center bg-gray-700 rounded-lg">
          <div className="text-center text-gray-400">
            <div className="text-3xl mb-2">🤖</div>
            <p className="text-xl mb-2">Policy Feed UI (FE-2)</p>
            <p>Real-time policy decisions with reason codes</p>
            <p className="text-sm mt-2">Interactive list showing why policies triggered actions</p>
          </div>
        </div>
      </div>

      {/* Placeholder for existing policies */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Active Policies</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
            <div>
              <h4 className="font-medium">Thermal Protection</h4>
              <p className="text-sm text-gray-400">Pause mining when CPU &gt; 75°C</p>
            </div>
            <span className="status-badge status-badge-success">Active</span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
            <div>
              <h4 className="font-medium">Battery Conservation</h4>
              <p className="text-sm text-gray-400">Pause mining when battery &lt; 20%</p>
            </div>
            <span className="status-badge status-badge-success">Active</span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
            <div>
              <h4 className="font-medium">Power Management</h4>
              <p className="text-sm text-gray-400">Resume mining when charger connected</p>
            </div>
            <span className="status-badge status-badge-success">Active</span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg opacity-50">
            <div>
              <h4 className="font-medium">Performance Optimization</h4>
              <p className="text-sm text-gray-400">Adjust threads based on system load</p>
            </div>
            <span className="status-badge status-badge-error">Disabled</span>
          </div>
        </div>
      </div>

      {/* Recent Policy Events */}
      {policyEvents.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Recent Policy Decisions</h3>
          <div className="space-y-2">
            {policyEvents.slice(-5).reverse().map((event) => (
              <div key={event.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                <div>
                  <span className={`status-badge ${
                    event.data.action === 'START' || event.data.action === 'RESUME' 
                      ? 'status-badge-success' 
                      : 'status-badge-warning'
                  }`}>
                    {event.data.action}
                  </span>
                  <span className="ml-3 text-sm">{event.data.reason}</span>
                </div>
                <span className="text-xs text-gray-400 font-mono">
                  {new Date(event.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}