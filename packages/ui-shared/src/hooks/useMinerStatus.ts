import { useEffect, useState, useCallback, useRef } from 'react';

/**
 * Miner status interface matching existing core types
 * TODO(PHASE2): Import from @xmrig-for-android/core-miner when available
 */
export interface MinerStatus {
  isWorking: boolean;
  isPaused: boolean;
  uptime: number;
  state: 'STOPPED' | 'STARTING' | 'RUNNING' | 'PAUSED' | 'STOPPING' | 'ERROR';
  lastError?: string;
  
  // Extended status for FE-1
  hashrate: {
    current: number;
    average10s: number;
    average60s: number;
    average15m: number;
    highest: number;
  };
  
  thermal: {
    cpuTemperature: number;
    level: 'NORMAL' | 'WARNING' | 'CRITICAL';
  };
  
  battery: {
    level: number;
    isCharging: boolean;
    isLow: boolean;
  };
  
  donation: {
    percent: number;
  };
  
  connection: {
    pool?: string;
    difficulty?: number;
    ping?: number;
  };
}

/**
 * Hook for miner status with polling or event-driven updates
 * 
 * @param pollMs - Polling interval in milliseconds (default: 2000)
 * @returns Miner status object and control functions
 */
export function useMinerStatus(pollMs: number = 2000) {
  const [status, setStatus] = useState<MinerStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<number>(0);
  const intervalRef = useRef<number | null>(null);

  // Simulation function - TODO(PHASE2): Replace with actual API calls
  const fetchMinerStatus = useCallback(async (): Promise<MinerStatus> => {
    // Simulate network delay
    await new Promise<void>(resolve => setTimeout(() => resolve(), 50 + Math.random() * 100));
    
    // TODO(PHASE2): Replace with actual native module calls
    // const { XMRigForAndroid } = NativeModules;
    // return XMRigForAndroid.getMinerStatus();
    
    // Simulation for FE-1
    const isWorking = Math.random() > 0.3; // 70% chance of working
    const isPaused = isWorking && Math.random() > 0.8; // 20% chance of paused when working
    
    return {
      isWorking,
      isPaused,
      uptime: isWorking ? Math.floor(Date.now() / 1000) - 3600 + Math.random() * 7200 : 0,
      state: !isWorking ? 'STOPPED' : isPaused ? 'PAUSED' : 'RUNNING',
      
      hashrate: {
        current: isWorking && !isPaused ? Math.random() * 1000 + 500 : 0,
        average10s: isWorking ? Math.random() * 900 + 400 : 0,
        average60s: isWorking ? Math.random() * 800 + 350 : 0,
        average15m: isWorking ? Math.random() * 750 + 300 : 0,
        highest: isWorking ? Math.random() * 1200 + 800 : 0,
      },
      
      thermal: {
        cpuTemperature: Math.random() * 30 + 40,
        level: Math.random() > 0.9 ? 'WARNING' : 'NORMAL',
      },
      
      battery: {
        level: Math.random() * 100,
        isCharging: Math.random() > 0.5,
        isLow: Math.random() > 0.9,
      },
      
      donation: {
        percent: 1, // Default 1% donation
      },
      
      connection: isWorking ? {
        pool: 'pool.xmr.pt:4444',
        difficulty: Math.floor(Math.random() * 100000) + 50000,
        ping: Math.floor(Math.random() * 100) + 20,
      } : {},
    };
  }, []);

  const updateStatus = useCallback(async () => {
    try {
      setIsLoading(true);
      const newStatus = await fetchMinerStatus();
      setStatus(newStatus);
      setLastUpdated(Date.now());
    } catch (error) {
      console.error('Failed to fetch miner status:', error);
      // Keep existing status on error
    } finally {
      setIsLoading(false);
    }
  }, [fetchMinerStatus]);

  // Start polling
  const startPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    intervalRef.current = setInterval(updateStatus, pollMs) as unknown as number;
    updateStatus(); // Initial fetch
  }, [updateStatus, pollMs]);

  // Stop polling
  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Manual refresh
  const refresh = useCallback(() => {
    updateStatus();
  }, [updateStatus]);

  // Auto-start polling on mount
  useEffect(() => {
    startPolling();
    return stopPolling;
  }, [startPolling, stopPolling]);

  // Update polling interval when changed
  useEffect(() => {
    if (intervalRef.current) {
      startPolling();
    }
  }, [pollMs, startPolling]);

  return {
    status,
    isLoading,
    lastUpdated,
    refresh,
    startPolling,
    stopPolling,
  };
}

/**
 * Helper hook to get specific miner status values with fallbacks
 */
export function useMinerStatusValue<T>(
  selector: (status: MinerStatus | null) => T,
  fallback: T,
) {
  const { status } = useMinerStatus();
  
  return status ? selector(status) : fallback;
}

// Export useful selectors
export const minerStatusSelectors = {
  isWorking: (status: MinerStatus | null) => status?.isWorking ?? false,
  isPaused: (status: MinerStatus | null) => status?.isPaused ?? false,
  currentHashrate: (status: MinerStatus | null) => status?.hashrate.current ?? 0,
  averageHashrate: (status: MinerStatus | null) => status?.hashrate.average60s ?? 0,
  cpuTemperature: (status: MinerStatus | null) => status?.thermal.cpuTemperature ?? 0,
  batteryLevel: (status: MinerStatus | null) => status?.battery.level ?? 0,
  donationPercent: (status: MinerStatus | null) => status?.donation.percent ?? 1,
  uptime: (status: MinerStatus | null) => status?.uptime ?? 0,
  state: (status: MinerStatus | null) => status?.state ?? 'STOPPED',
};