/**
 * Simulation Backend for XMRig Mining
 * PHASE 1: Hashrate simulation with realistic patterns
 */

export interface SimulationConfig {
  baseHashrate: number;
  variability: number;
  updateInterval: number;
  rampUpTime: number;
}

export interface HashrateCallback {
  (hashrate: number, timestamp: number): void;
}

/**
 * Generate realistic hashrate simulation using sine wave patterns with jitter
 * Mimics real mining behavior with gradual ramp-up and realistic fluctuations
 */
export class HashrateSimulator {
  private config: SimulationConfig;
  private callbacks: HashrateCallback[] = [];
  private timer: NodeJS.Timer | null = null;
  private startTime: number = 0;
  private isRunning: boolean = false;

  constructor(config: Partial<SimulationConfig> = {}) {
    this.config = {
      baseHashrate: 1000,
      variability: 0.15,
      updateInterval: 1000,
      rampUpTime: 30000,
      ...config
    };
  }

  /**
   * Start the hashrate simulation
   */
  start(): void {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.startTime = Date.now();
    
    this.timer = setInterval(() => {
      const hashrate = this.calculateHashrate();
      const timestamp = Date.now();
      
      this.callbacks.forEach(callback => {
        try {
          callback(hashrate, timestamp);
        } catch (error) {
          console.warn('Simulation callback error:', error);
        }
      });
    }, this.config.updateInterval);
  }

  /**
   * Stop the hashrate simulation
   */
  stop(): void {
    if (!this.isRunning) return;
    
    this.isRunning = false;
    
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  /**
   * Add a callback for hashrate updates
   */
  onUpdate(callback: HashrateCallback): void {
    this.callbacks.push(callback);
  }

  /**
   * Remove a callback
   */
  removeCallback(callback: HashrateCallback): void {
    const index = this.callbacks.indexOf(callback);
    if (index > -1) {
      this.callbacks.splice(index, 1);
    }
  }

  /**
   * Update simulation configuration
   */
  updateConfig(newConfig: Partial<SimulationConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Calculate current hashrate based on elapsed time and patterns
   */
  private calculateHashrate(): number {
    const elapsed = Date.now() - this.startTime;
    const { baseHashrate, variability, rampUpTime } = this.config;
    
    // Ramp-up factor (0 to 1 over rampUpTime)
    const rampUp = Math.min(1, elapsed / rampUpTime);
    const rampFactor = this.smoothStep(rampUp);
    
    // Base sine wave for natural fluctuation
    const sineComponent = Math.sin(elapsed * 0.0001) * 0.1;
    
    // Secondary wave for more complex patterns
    const secondaryWave = Math.sin(elapsed * 0.00025) * 0.05;
    
    // Random jitter for realistic noise
    const jitter = (Math.random() - 0.5) * variability;
    
    // Occasional "spikes" or "dips"
    const spikeChance = Math.random();
    let spikeFactor = 1;
    if (spikeChance < 0.005) { // 0.5% chance of spike
      spikeFactor = 1.3 + Math.random() * 0.4;
    } else if (spikeChance < 0.01) { // 0.5% chance of dip
      spikeFactor = 0.7 - Math.random() * 0.2;
    }
    
    // Combine all factors
    const totalFactor = rampFactor * (1 + sineComponent + secondaryWave + jitter) * spikeFactor;
    
    // Ensure non-negative result
    return Math.max(0, Math.round(baseHashrate * totalFactor));
  }

  /**
   * Smooth step function for realistic ramp-up
   */
  private smoothStep(x: number): number {
    // Hermite interpolation for smooth curve
    return x * x * (3 - 2 * x);
  }

  /**
   * Get current simulation status
   */
  getStatus(): {
    isRunning: boolean;
    elapsed: number;
    currentHashrate: number;
    config: SimulationConfig;
  } {
    const elapsed = this.isRunning ? Date.now() - this.startTime : 0;
    return {
      isRunning: this.isRunning,
      elapsed,
      currentHashrate: this.isRunning ? this.calculateHashrate() : 0,
      config: { ...this.config }
    };
  }
}

/**
 * Factory function to create a new hashrate simulator instance
 */
export function createHashrateSimulator(config?: Partial<SimulationConfig>): HashrateSimulator {
  return new HashrateSimulator(config);
}

/**
 * Utility function for simple callback-based simulation
 * For quick integration without class instantiation
 */
export function simulateHashrate(
  callback: HashrateCallback,
  config?: Partial<SimulationConfig>
): () => void {
  const simulator = createHashrateSimulator(config);
  simulator.onUpdate(callback);
  simulator.start();
  
  // Return cleanup function
  return () => simulator.stop();
}