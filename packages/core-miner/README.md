# Core Miner Package

**Version:** 0.1.0 (Phase 1 - Skeleton Implementation)

## Overview

The `@xmrig-for-android/core-miner` package provides TypeScript interfaces and implementations for controlling XMRig mining operations within the XMRig for Android application. This package serves as the foundational abstraction layer for mining operations.

## Phase 1 Features (Current)

- **Interface Definitions**: Complete TypeScript interfaces for miner configuration, status, and control
- **Simulation Backend**: Realistic hashrate simulation for testing and development
- **Event System**: Callback-based event handling for mining status updates
- **Modular Architecture**: Pluggable controller system supporting multiple backends

## Installation

```bash
npm install @xmrig-for-android/core-miner
```

## Quick Start

### Basic Usage with Simulation

```typescript
import { createMinerController, MinerConfig } from '@xmrig-for-android/core-miner';

const controller = createMinerController('simulation');

const config: MinerConfig = {
  pools: [
    {
      url: 'pool.monero.com:4444',
      user: 'your-wallet-address',
      pass: 'worker-name'
    }
  ],
  simulation: {
    enabled: true,
    baseHashrate: 1500,
    variability: 0.2
  }
};

// Set up event callbacks
controller.setEventCallbacks({
  onHashrateUpdate: (hashrate) => {
    console.log(`Current hashrate: ${hashrate} H/s`);
  },
  onStatusUpdate: (status) => {
    console.log(`Mining state: ${status.state}`);
  },
  onError: (error) => {
    console.error('Mining error:', error);
  }
});

// Start mining
await controller.start(config);

// Control mining
await controller.pause();
await controller.resume();
await controller.stop();
```

### Hashrate Simulation

```typescript
import { createHashrateSimulator } from '@xmrig-for-android/core-miner/simulation';

const simulator = createHashrateSimulator({
  baseHashrate: 2000,
  variability: 0.15,
  updateInterval: 1000,
  rampUpTime: 30000
});

simulator.onUpdate((hashrate, timestamp) => {
  console.log(`${new Date(timestamp).toISOString()}: ${hashrate} H/s`);
});

simulator.start();

// Stop simulation after 60 seconds
setTimeout(() => {
  simulator.stop();
}, 60000);
```

## API Reference

### MinerController Interface

```typescript
interface MinerController {
  start(config: MinerConfig): Promise<void>;
  stop(): Promise<void>;
  pause(): Promise<void>;
  resume(): Promise<void>;
  getStatus(): Promise<MinerStatus>;
  updateConfig(config: Partial<MinerConfig>): Promise<void>;
  setEventCallbacks(callbacks: MinerEventCallbacks): void;
  destroy(): Promise<void>;
}
```

### Configuration Schema

The package uses the JSON schema defined in `/schemas/miner.config.schema.json` for configuration validation.

Key configuration properties:
- `pools`: Array of mining pool configurations
- `cpu`: CPU mining settings (threads, priority, yield)
- `donateLevel`: Donation percentage (1-25%)
- `simulation`: Simulation-specific settings

### Event Callbacks

```typescript
interface MinerEventCallbacks {
  onStatusUpdate?: (status: MinerStatus) => void;
  onHashrateUpdate?: (hashrate: number) => void;
  onPoolConnect?: (poolUrl: string) => void;
  onPoolDisconnect?: (poolUrl: string) => void;
  onError?: (error: string) => void;
  onLog?: (level: 'debug' | 'info' | 'warn' | 'error', message: string) => void;
}
```

## Roadmap

### Phase 2 (Planned)
- **Native XMRig Integration**: Direct bindings to XMRig process
- **Advanced Configuration**: Support for all XMRig configuration options
- **Performance Metrics**: Detailed CPU and thermal monitoring
- **Pool Management**: Automatic failover and load balancing

### Phase 3 (Planned)
- **Policy Engine Integration**: Battery and thermal management
- **Background Mining**: Intelligent background/foreground switching
- **Remote Management**: Web-based configuration and monitoring

### Phase 4 (Future)
- **Multi-Algorithm Support**: Beyond RandomX/CryptoNote
- **GPU Mining**: Android GPU mining capabilities
- **Cloud Integration**: Remote monitoring and control

## Development

### Building

```bash
npm run build
```

### Development Mode

```bash
npm run dev
```

### Testing

The simulation backend can be tested independently:

```bash
node -e "
  const { simulateHashrate } = require('./dist/simulation.js');
  const cleanup = simulateHashrate((hashrate, timestamp) => {
    console.log(\`\${new Date(timestamp).toISOString()}: \${hashrate} H/s\`);
  }, { baseHashrate: 1000, variability: 0.2 });
  
  setTimeout(cleanup, 30000);
"
```

## Contributing

This package is part of the XMRig for Android project. Please see the main repository for contribution guidelines.

## License

MIT License - see the main project LICENSE file for details.

## Phase Implementation Notes

**Current Status: Phase 1 Complete**
- ✅ Interface definitions
- ✅ Simulation backend
- ✅ Event system
- ✅ Basic configuration support

**Phase 1 Limitations:**
- Native XMRig integration not yet implemented
- Simulation mode only
- Basic event handling

The package is designed to be extended in future phases while maintaining backward compatibility with existing integrations.