/**
 * Core Miner Package for XMRig for Android
 * PHASE 1: Interface definitions and placeholder implementations
 */

// PHASE1: Core miner configuration interface
export interface MinerConfig {
  pools: Array<{
    url: string;
    user: string;
    pass?: string;
    tls?: boolean;
  }>;
  cpu?: {
    enabled?: boolean;
    threads?: number;
    priority?: number;
    yield?: boolean;
  };
  donateLevel?: number;
  printTime?: number;
  simulation?: {
    enabled: boolean;
    baseHashrate?: number;
    variability?: number;
  };
}

// PHASE1: Miner status and metrics interface
export interface MinerStatus {
  state: 'idle' | 'starting' | 'running' | 'paused' | 'stopped' | 'error';
  hashrate: {
    current: number;
    average: number;
    highest: number;
  };
  uptime: number;
  acceptedShares: number;
  rejectedShares: number;
  pool?: {
    url: string;
    connected: boolean;
    latency?: number;
  };
  cpu?: {
    threads: number;
    usage: number;
    temperature?: number;
  };
  errors?: string[];
}

// PHASE1: Event callback interface for miner updates
export interface MinerEventCallbacks {
  onStatusUpdate?: (status: MinerStatus) => void;
  onHashrateUpdate?: (hashrate: number) => void;
  onPoolConnect?: (poolUrl: string) => void;
  onPoolDisconnect?: (poolUrl: string) => void;
  onError?: (error: string) => void;
  onLog?: (level: 'debug' | 'info' | 'warn' | 'error', message: string) => void;
}

// PHASE1: Main miner controller interface
export interface MinerController {
  start(config: MinerConfig): Promise<void>;
  stop(): Promise<void>;
  pause(): Promise<void>;
  resume(): Promise<void>;
  getStatus(): Promise<MinerStatus>;
  updateConfig(config: Partial<MinerConfig>): Promise<void>;
  setEventCallbacks(callbacks: MinerEventCallbacks): void;
  destroy(): Promise<void>;
}

// PHASE1: Factory function for creating miner controller instances
export function createMinerController(
  type: 'native' | 'simulation' = 'native'
): MinerController {
  if (type === 'simulation') {
    // TODO PHASE2: Import actual simulation implementation
    return createSimulationController();
  }
  
  // TODO PHASE2: Import actual native XMRig controller
  throw new Error('Native miner controller not yet implemented - use simulation mode');
}

// PHASE1: Placeholder simulation controller implementation
function createSimulationController(): MinerController {
  let currentStatus: MinerStatus = {
    state: 'idle',
    hashrate: { current: 0, average: 0, highest: 0 },
    uptime: 0,
    acceptedShares: 0,
    rejectedShares: 0
  };
  
  let callbacks: MinerEventCallbacks = {};
  let simulationTimer: NodeJS.Timer | null = null;
  let config: MinerConfig | null = null;

  return {
    async start(minerConfig: MinerConfig): Promise<void> {
      config = minerConfig;
      currentStatus.state = 'starting';
      callbacks.onStatusUpdate?.(currentStatus);
      
      // Simulate startup delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      currentStatus.state = 'running';
      currentStatus.pool = {
        url: config.pools[0]?.url || 'simulation.pool',
        connected: true,
        latency: 50 + Math.random() * 100
      };
      
      callbacks.onStatusUpdate?.(currentStatus);
      callbacks.onPoolConnect?.(currentStatus.pool.url);
      
      // Start hashrate simulation if enabled
      if (config.simulation?.enabled) {
        startHashrateSimulation();
      }
    },

    async stop(): Promise<void> {
      if (simulationTimer) {
        clearInterval(simulationTimer);
        simulationTimer = null;
      }
      
      currentStatus.state = 'stopped';
      currentStatus.hashrate = { current: 0, average: 0, highest: 0 };
      callbacks.onStatusUpdate?.(currentStatus);
    },

    async pause(): Promise<void> {
      if (currentStatus.state === 'running') {
        currentStatus.state = 'paused';
        callbacks.onStatusUpdate?.(currentStatus);
      }
    },

    async resume(): Promise<void> {
      if (currentStatus.state === 'paused') {
        currentStatus.state = 'running';
        callbacks.onStatusUpdate?.(currentStatus);
      }
    },

    async getStatus(): Promise<MinerStatus> {
      return { ...currentStatus };
    },

    async updateConfig(newConfig: Partial<MinerConfig>): Promise<void> {
      if (config) {
        config = { ...config, ...newConfig };
      }
    },

    setEventCallbacks(newCallbacks: MinerEventCallbacks): void {
      callbacks = { ...callbacks, ...newCallbacks };
    },

    async destroy(): Promise<void> {
      await this.stop();
      callbacks = {};
    }
  };

  function startHashrateSimulation(): void {
    const baseRate = config?.simulation?.baseHashrate || 1000;
    const variability = config?.simulation?.variability || 0.2;
    let time = 0;
    
    simulationTimer = setInterval(() => {
      if (currentStatus.state !== 'running') return;
      
      time += 1;
      const sine = Math.sin(time * 0.1) * 0.3;
      const noise = (Math.random() - 0.5) * variability;
      const hashrate = Math.max(0, baseRate * (1 + sine + noise));
      
      currentStatus.hashrate.current = Math.round(hashrate);
      currentStatus.hashrate.average = Math.round(
        (currentStatus.hashrate.average * 0.95) + (hashrate * 0.05)
      );
      currentStatus.hashrate.highest = Math.max(
        currentStatus.hashrate.highest,
        currentStatus.hashrate.current
      );
      
      currentStatus.uptime += 1;
      currentStatus.acceptedShares += Math.random() < 0.1 ? 1 : 0;
      
      callbacks.onHashrateUpdate?.(currentStatus.hashrate.current);
      callbacks.onStatusUpdate?.(currentStatus);
    }, 1000);
  }
}

// PHASE1: Export default controller creation
export default createMinerController;