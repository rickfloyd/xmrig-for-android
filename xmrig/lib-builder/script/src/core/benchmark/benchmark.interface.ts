export enum BenchmarkStatus {
  RUNNING = 'RUNNING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  STOPPED = 'STOPPED'
}

export interface BenchmarkConfig {
  algorithm: string;
  duration: number; // seconds
  threads?: number;
  onProgress?: (progress: number) => void;
}

export interface BenchmarkResult {
  id: string;
  algorithm: string;
  hashrate: number; // H/s
  duration: number; // seconds
  efficiency: number; // H/W
  maxTemperature: number; // Celsius
  avgTemperature: number; // Celsius
  powerUsage: number; // Watts (estimated)
  stable: boolean;
  timestamp: number;
  status: BenchmarkStatus;
  deviceInfo: {
    cores: number;
    architecture: string;
    model: string;
    ram: number;
  };
  testParams: {
    threads: number;
    priority: number;
    hugePages: boolean;
  };
  error?: string;
}