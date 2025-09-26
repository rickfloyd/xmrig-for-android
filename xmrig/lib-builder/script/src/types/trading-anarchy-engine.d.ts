/**
 * Trading Anarchy Android Compute Engine - Native Module TypeScript Definitions
 * 2025 Professional Version with React Native New Architecture Support
 * 
 * Provides comprehensive TypeScript definitions for XMRig-based cryptocurrency
 * mining operations optimized for Android devices with modern React Native
 * turbo modules and Java Script Interface (JSI).
 */

// Core Types and Interfaces

/**
 * Mining configuration parameters with 2025 security enhancements
 */
export interface MiningConfig {
    /** Mining pool URL with SSL/TLS support */
    poolUrl: string;
    /** Wallet address for mining rewards */
    walletAddress: string;
    /** Worker name identifier */
    workerName?: string;
    /** Mining algorithm (rx/0, cn/r, etc.) */
    algorithm: string;
    /** Number of mining threads (auto-detected if not specified) */
    threads?: number;
    /** CPU usage percentage limit (1-100) */
    cpuUsage?: number;
    /** Enable hardware acceleration if available */
    hardwareAcceleration?: boolean;
    /** SSL/TLS configuration for secure connections */
    tls?: {
      enabled: boolean;
      fingerprint?: string;
      version?: string;
    };
    /** Proxy configuration for network routing */
    proxy?: {
      url: string;
      username?: string;
      password?: string;
    };
    /** Advanced tuning parameters */
    tuning?: {
      hugePages?: boolean;
      cpuAffinity?: number[];
      priority?: number;
      assembly?: boolean;
    };
  }

  /**
   * Real-time mining statistics and performance metrics
   */
  export interface MiningStats {
    /** Current hash rate in H/s */
    hashrate: {
      current: number;
      average10s: number;
      average60s: number;
      average15m: number;
      highest: number;
    };
    /** Mining session statistics */
    session: {
      duration: number; // seconds
      totalHashes: number;
      validShares: number;
      invalidShares: number;
      rejectedShares: number;
      difficulty: number;
    };
    /** Network and connection status */
    network: {
      connected: boolean;
      latency: number;
      uptime: number;
      reconnects: number;
      lastError?: string;
    };
    /** Hardware performance metrics */
    hardware: {
      cpuTemperature?: number;
      cpuUsage: number;
      memoryUsage: number;
      batteryLevel?: number;
      thermalThrottling: boolean;
    };
    /** Mining pool statistics */
    pool: {
      url: string;
      algorithm: string;
      workers: number;
      lastJobTime: number;
    };
  }

  /**
   * Device capabilities and hardware information
   */
  export interface DeviceInfo {
    /** CPU architecture and specifications */
    cpu: {
      brand: string;
      architecture: string;
      cores: number;
      threads: number;
      l2Cache: number;
      l3Cache: number;
      features: string[];
      instructions: string[]; // AES-NI, AVX2, etc.
    };
    /** Memory information */
    memory: {
      total: number; // bytes
      available: number;
      huge: boolean;
      pages: number;
    };
    /** Android system information */
    system: {
      version: string;
      apiLevel: number;
      kernel: string;
      manufacturer: string;
      model: string;
      thermal: boolean;
    };
    /** Mining capabilities assessment */
    mining: {
      recommended: boolean;
      algorithms: string[];
      expectedHashrate: number;
      powerEfficiency: number;
      thermalRating: 'excellent' | 'good' | 'fair' | 'poor';
    };
  }

  /**
   * Mining event types for callback notifications
   */
  export type MiningEvent = 
    | 'started'
    | 'stopped' 
    | 'paused'
    | 'resumed'
    | 'connected'
    | 'disconnected'
    | 'share_accepted'
    | 'share_rejected'
    | 'job_received'
    | 'hashrate_update'
    | 'error'
    | 'thermal_throttling'
    | 'battery_low'
    | 'network_changed';

  /**
   * Event callback data structures
   */
  export interface MiningEventData {
    timestamp: number;
    event: MiningEvent;
    data?: {
      hashrate?: number;
      difficulty?: number;
      error?: string;
      share?: {
        id: string;
        result: string;
        time: number;
      };
      job?: {
        id: string;
        target: string;
        algorithm: string;
      };
      network?: {
        type: 'wifi' | 'cellular' | 'none';
        strength: number;
      };
      thermal?: {
        temperature: number;
        throttled: boolean;
      };
      battery?: {
        level: number;
        charging: boolean;
      };
    };
  }

  /**
   * Configuration validation result
   */
  export interface ValidationResult {
    valid: boolean;
    errors: Array<{
      field: string;
      message: string;
      severity: 'error' | 'warning';
    }>;
    warnings: string[];
    recommendations: string[];
  }

  /**
   * Mining operation result
   */
  export interface OperationResult {
    success: boolean;
    message?: string;
    code?: number;
    details?: Record<string, any>;
  }

  // Main Native Module Interface

  /**
   * Trading Anarchy Android Compute Engine Native Module
   * React Native New Architecture Compatible with JSI Integration
   */
  export interface TradingAnarchyEngine {
    // Core Mining Operations
    
    /**
     * Initialize the mining engine with configuration
     * @param config Mining configuration parameters
     * @returns Promise resolving to initialization result
     */
    initialize(config: MiningConfig): Promise<OperationResult>;

    /**
     * Start mining operations with current configuration
     * @returns Promise resolving to start operation result
     */
    startMining(): Promise<OperationResult>;

    /**
     * Stop mining operations gracefully
     * @returns Promise resolving to stop operation result
     */
    stopMining(): Promise<OperationResult>;

    /**
     * Pause mining operations temporarily
     * @returns Promise resolving to pause operation result
     */
    pauseMining(): Promise<OperationResult>;

    /**
     * Resume paused mining operations
     * @returns Promise resolving to resume operation result
     */
    resumeMining(): Promise<OperationResult>;

    /**
     * Get current mining status and statistics
     * @returns Promise resolving to current mining stats
     */
    getMiningStats(): Promise<MiningStats>;

    /**
     * Update mining configuration without restarting
     * @param config Updated configuration parameters
     * @returns Promise resolving to update result
     */
    updateConfiguration(config: Partial<MiningConfig>): Promise<OperationResult>;

    // Device and System Information

    /**
     * Get comprehensive device hardware information
     * @returns Promise resolving to device capabilities
     */
    getDeviceInfo(): Promise<DeviceInfo>;

    /**
     * Benchmark device mining performance
     * @param algorithm Mining algorithm to benchmark
     * @param duration Benchmark duration in seconds (default: 60)
     * @returns Promise resolving to benchmark results
     */
    benchmarkDevice(algorithm: string, duration?: number): Promise<{
      algorithm: string;
      hashrate: number;
      duration: number;
      efficiency: number;
      temperature: number;
      stable: boolean;
    }>;

    // Configuration Management

    /**
     * Validate mining configuration before use
     * @param config Configuration to validate
     * @returns Promise resolving to validation result
     */
    validateConfiguration(config: MiningConfig): Promise<ValidationResult>;

    /**
     * Get optimal configuration for current device
     * @param algorithm Target mining algorithm
     * @returns Promise resolving to optimized configuration
     */
    getOptimalConfiguration(algorithm: string): Promise<MiningConfig>;

    /**
     * Save configuration to persistent storage
     * @param name Configuration profile name
     * @param config Configuration to save
     * @returns Promise resolving to save operation result
     */
    saveConfiguration(name: string, config: MiningConfig): Promise<OperationResult>;

    /**
     * Load saved configuration from storage
     * @param name Configuration profile name
     * @returns Promise resolving to loaded configuration
     */
    loadConfiguration(name: string): Promise<MiningConfig>;

    /**
     * List all saved configuration profiles
     * @returns Promise resolving to array of profile names
     */
    listConfigurations(): Promise<string[]>;

    // Event Management

    /**
     * Register event listener for mining events
     * @param event Event type to listen for
     * @param callback Function to call when event occurs
     */
    addEventListener(
      event: MiningEvent, 
      callback: (data: MiningEventData) => void
    ): void;

    /**
     * Remove specific event listener
     * @param event Event type
     * @param callback Function to remove
     */
    removeEventListener(
      event: MiningEvent, 
      callback: (data: MiningEventData) => void
    ): void;

    /**
     * Remove all event listeners for specific event type
     * @param event Event type to clear
     */
    removeAllEventListeners(event?: MiningEvent): void;

    // Advanced Features

    /**
     * Get detailed mining logs for debugging
     * @param lines Number of recent log lines to retrieve
     * @returns Promise resolving to log entries
     */
    getLogs(lines?: number): Promise<Array<{
      timestamp: number;
      level: 'debug' | 'info' | 'warn' | 'error';
      message: string;
      context?: string;
    }>>;

    /**
     * Export mining statistics to file
     * @param format Export format ('json' | 'csv' | 'txt')
     * @param filepath Target file path
     * @returns Promise resolving to export result
     */
    exportStats(format: 'json' | 'csv' | 'txt', filepath: string): Promise<OperationResult>;

    /**
     * Test network connectivity to mining pool
     * @param poolUrl Pool URL to test
     * @returns Promise resolving to connectivity test result
     */
    testPoolConnection(poolUrl: string): Promise<{
      reachable: boolean;
      latency: number;
      ssl: boolean;
      error?: string;
    }>;

    /**
     * Get recommended mining pools for algorithm
     * @param algorithm Target mining algorithm
     * @returns Promise resolving to recommended pools
     */
    getRecommendedPools(algorithm: string): Promise<Array<{
      name: string;
      url: string;
      fee: number;
      location: string;
      rating: number;
      features: string[];
    }>>;

    // Power and Thermal Management

    /**
     * Set thermal protection limits
     * @param maxTemp Maximum CPU temperature in Celsius
     * @param throttleTemp Temperature to start throttling
     * @returns Promise resolving to thermal config result
     */
    setThermalLimits(maxTemp: number, throttleTemp: number): Promise<OperationResult>;

    /**
     * Set battery usage limits for mining
     * @param minBatteryLevel Minimum battery level to continue mining
     * @param pauseOnBattery Whether to pause mining when on battery
     * @returns Promise resolving to battery config result
     */
    setBatteryLimits(minBatteryLevel: number, pauseOnBattery: boolean): Promise<OperationResult>;

    /**
     * Get current power consumption estimate
     * @returns Promise resolving to power usage data
     */
    getPowerUsage(): Promise<{
      estimated: number; // watts
      batteryDrain: number; // mA
      efficiency: number; // H/W
      sustainable: boolean;
    }>;

    // Security Features

    /**
     * Enable secure mining mode with enhanced protections
     * @param options Security options
     * @returns Promise resolving to security mode result
     */
    enableSecureMode(options: {
      encryptTraffic: boolean;
      validateCertificates: boolean;
      hideFromTaskManager: boolean;
      secureStorage: boolean;
    }): Promise<OperationResult>;

    /**
     * Verify integrity of mining executable and libraries
     * @returns Promise resolving to integrity check result
     */
    verifyIntegrity(): Promise<{
      valid: boolean;
      checksums: Record<string, string>;
      modified: string[];
      threats: string[];
    }>;
  }

// React Native Module Export
declare const TradingAnarchyEngine: TradingAnarchyEngine;
export default TradingAnarchyEngine;

  // Utility Types for Advanced Usage

  /**
   * Mining algorithm configurations with optimizations
   */
  export interface AlgorithmConfig {
    name: string;
    variants: string[];
    memory: number; // MB required
    threads: {
      min: number;
      max: number;
      recommended: number;
    };
    features: {
      aesni: boolean;
      avx2: boolean;
      hugepages: boolean;
    };
    performance: {
      hashrate: number; // estimated H/s
      power: number; // estimated watts
      efficiency: number; // H/W
    };
  }

  /**
   * Pool connection strategies and failover
   */
  export interface PoolStrategy {
    primary: string;
    fallback: string[];
    retryInterval: number;
    maxRetries: number;
    healthCheck: boolean;
    loadBalancing: 'round_robin' | 'latency_based' | 'hashrate_based';
  }

  /**
   * Advanced mining session configuration
   */
  export interface SessionConfig {
    autoStart: boolean;
    restartOnError: boolean;
    sessionTimeout: number;
    statsSaveInterval: number;
    logLevel: 'debug' | 'info' | 'warn' | 'error';
    notifications: {
      hashrate: boolean;
      shares: boolean;
      errors: boolean;
      thermal: boolean;
    };
  }

  // Constants and Enums

  export const ALGORITHMS: Record<string, AlgorithmConfig>;
  export const DEFAULT_POOLS: Record<string, string[]>;
  export const DEVICE_RATINGS: Record<string, number>;
  export const ERROR_CODES: Record<string, number>;

  // Version Information
  export const VERSION: string;
  export const BUILD_DATE: string;
  export const NATIVE_VERSION: string;
  export const XMRIG_VERSION: string;