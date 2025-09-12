'use client';

import { useEffect, useState } from 'react';

// TODO(FE-2): Import actual schema and metadata when available
const mockSchema = {
  pools: {
    type: 'array',
    items: {
      hostname: { type: 'string' },
      port: { type: 'number' },
      username: { type: 'string' },
      password: { type: 'string' },
    },
  },
  cpu: {
    threads: { type: 'number' },
    yield: { type: 'boolean' },
    priority: { type: 'number' },
  },
  policies: {
    thermal: {
      enabled: { type: 'boolean' },
      threshold: { type: 'number' },
    },
    battery: {
      enabled: { type: 'boolean' },
      lowLevel: { type: 'number' },
    },
  },
  telemetry: {
    enabled: { type: 'boolean' },
    interval: { type: 'number' },
  },
  donationPercent: {
    type: 'number',
    minimum: 0,
    maximum: 100,
  },
};

const mockMetadata = {
  groups: [
    {
      name: 'pools',
      title: 'Mining Pools',
      description: 'Configure mining pool connections',
      order: 1,
    },
    {
      name: 'cpu',
      title: 'CPU Settings',
      description: 'CPU mining configuration',
      order: 2,
    },
    {
      name: 'policies',
      title: 'Automation Policies',
      description: 'Automated mining behavior rules',
      order: 3,
    },
    {
      name: 'telemetry',
      title: 'Telemetry',
      description: 'Data collection and reporting',
      order: 4,
    },
    {
      name: 'donationPercent',
      title: 'Donation Settings',
      description: 'Support XMRig development',
      order: 5,
    },
  ],
  fields: {
    'pools.hostname': {
      title: 'Pool Hostname',
      placeholder: 'pool.xmr.pt',
      hint: 'Mining pool server address',
    },
    'pools.port': {
      title: 'Port',
      placeholder: '4444',
      hint: 'Mining pool port number',
    },
    'cpu.threads': {
      title: 'Thread Count',
      hint: 'Number of CPU threads to use (0 = auto)',
    },
    'policies.thermal.threshold': {
      title: 'Temperature Threshold',
      hint: 'Pause mining when CPU exceeds this temperature (°C)',
    },
    'donationPercent': {
      title: 'Donation Percentage',
      hint: 'Percentage of hashrate donated to XMRig development',
    },
  },
};

export default function ConfigPage() {
  const [schema, setSchema] = useState<any>(null);
  const [metadata, setMetadata] = useState<any>(null);

  useEffect(() => {
    // TODO(FE-2): Load actual schema from repository path
    // import schema from '../../../../../../schemas/xmrig.schema.json';
    // import metadata from '../../../../../../schemas/ui.schema-metadata.json';
    
    // Simulate loading for FE-1
    console.log('TODO(FE-2): Load JSON schema from repository path');
    console.log('Schema structure:', mockSchema);
    console.log('UI metadata:', mockMetadata);
    
    setSchema(mockSchema);
    setMetadata(mockMetadata);
  }, []);

  const renderSchemaPreview = (obj: any, depth = 0) => {
    const indent = '  '.repeat(depth);
    
    if (typeof obj === 'object' && obj !== null) {
      if (Array.isArray(obj)) {
        return (
          <div>
            <span className="text-yellow-400">[</span>
            {obj.map((item, index) => (
              <div key={index} className="ml-4">
                {renderSchemaPreview(item, depth + 1)}
                {index < obj.length - 1 && <span className="text-gray-400">,</span>}
              </div>
            ))}
            <span className="text-yellow-400">]</span>
          </div>
        );
      } else {
        return (
          <div>
            <span className="text-yellow-400">{'{'}</span>
            {Object.entries(obj).map(([key, value], index, arr) => (
              <div key={key} className="ml-4">
                <span className="text-blue-300">"{key}"</span>
                <span className="text-gray-400">: </span>
                {renderSchemaPreview(value, depth + 1)}
                {index < arr.length - 1 && <span className="text-gray-400">,</span>}
              </div>
            ))}
            <span className="text-yellow-400">{'}'}</span>
          </div>
        );
      }
    } else {
      const color = typeof obj === 'string' ? 'text-green-300' : 
                   typeof obj === 'number' ? 'text-purple-300' :
                   typeof obj === 'boolean' ? 'text-red-300' : 'text-gray-300';
      
      return (
        <span className={color}>
          {typeof obj === 'string' ? `"${obj}"` : String(obj)}
        </span>
      );
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-100">Configuration</h1>
        <div className="text-sm text-gray-400">
          Schema-driven configuration editor
        </div>
      </div>

      {/* TODO(FE-2): Dynamic form generation */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Configuration Editor</h3>
        <div className="h-64 flex items-center justify-center bg-gray-700 rounded-lg">
          <div className="text-center text-gray-400">
            <div className="text-3xl mb-2">⚙️</div>
            <p className="text-xl mb-2">Dynamic Config Forms (FE-2)</p>
            <p>Schema-driven form rendering with diff preview</p>
            <p className="text-sm mt-2">Auto-generated forms from JSON schema + UI metadata</p>
          </div>
        </div>
      </div>

      {/* Schema Structure Display */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">JSON Schema Structure</h3>
          <div className="bg-gray-900 p-4 rounded-lg overflow-auto max-h-96">
            <pre className="text-xs font-mono">
              {schema ? renderSchemaPreview(schema) : 'Loading schema...'}
            </pre>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold mb-4">UI Metadata</h3>
          <div className="space-y-4">
            {metadata?.groups.map((group: any) => (
              <div key={group.name} className="p-3 bg-gray-700 rounded-lg">
                <h4 className="font-semibold text-primary-400">{group.title}</h4>
                <p className="text-sm text-gray-400 mt-1">{group.description}</p>
                <div className="text-xs text-gray-500 mt-1">
                  Order: {group.order} | Group: {group.name}
                </div>
              </div>
            )) || 'Loading metadata...'}
          </div>
        </div>
      </div>

      {/* Console Output */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Console Output</h3>
        <div className="bg-black p-4 rounded-lg text-green-400 font-mono text-sm">
          <div>TODO(FE-2): Load JSON schema from repository path</div>
          <div>Schema structure: {schema ? 'Loaded' : 'Loading...'}</div>
          <div>UI metadata: {metadata ? 'Loaded' : 'Loading...'}</div>
          <div className="mt-2 text-yellow-400">
            → Check browser console for detailed schema and metadata logs
          </div>
        </div>
      </div>

      {/* Placeholder Configuration Groups */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Current Configuration Groups</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-700 rounded-lg border-l-4 border-blue-500">
            <h4 className="font-semibold">Mining Pools</h4>
            <p className="text-sm text-gray-400 mt-1">2 pools configured</p>
          </div>
          <div className="p-4 bg-gray-700 rounded-lg border-l-4 border-green-500">
            <h4 className="font-semibold">CPU Settings</h4>
            <p className="text-sm text-gray-400 mt-1">Auto threads, normal priority</p>
          </div>
          <div className="p-4 bg-gray-700 rounded-lg border-l-4 border-yellow-500">
            <h4 className="font-semibold">Policies</h4>
            <p className="text-sm text-gray-400 mt-1">3 policies active</p>
          </div>
          <div className="p-4 bg-gray-700 rounded-lg border-l-4 border-purple-500">
            <h4 className="font-semibold">Telemetry</h4>
            <p className="text-sm text-gray-400 mt-1">Enabled, 2s interval</p>
          </div>
          <div className="p-4 bg-gray-700 rounded-lg border-l-4 border-red-500">
            <h4 className="font-semibold">Donation</h4>
            <p className="text-sm text-gray-400 mt-1">1% to XMRig development</p>
          </div>
        </div>
      </div>
    </div>
  );
}