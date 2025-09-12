import { useEffect, useState, useRef, useCallback } from 'react';

/**
 * Telemetry event types for the streaming hook
 */
export interface TelemetryEvent {
  id: string;
  timestamp: number;
  type: 'HASHRATE_SAMPLE' | 'POLICY_DECISION' | 'THERMAL_LEVEL' | 'BATTERY_LEVEL' | 'MINER_STATUS';
  data: any;
}

interface HashrateSampleData {
  current: number;
  average10s: number;
  average60s: number;
  average15m: number;
  highest: number;
}

interface PolicyDecisionData {
  action: 'PAUSE' | 'RESUME' | 'STOP' | 'START';
  reason: string;
  conditions: Record<string, any>;
}

interface ThermalLevelData {
  temperature: number;
  level: 'NORMAL' | 'WARNING' | 'CRITICAL';
  threshold: number;
}

interface BatteryLevelData {
  level: number;
  isCharging: boolean;
  isLow: boolean;
}

interface MinerStatusData {
  isWorking: boolean;
  isPaused: boolean;
  uptime: number;
  state: string;
}

/**
 * Ring buffer implementation for telemetry events
 */
class TelemetryRingBuffer {
  private buffer: TelemetryEvent[];
  private maxSize: number;
  private head: number = 0;
  private size: number = 0;

  constructor(maxSize: number) {
    this.maxSize = maxSize;
    this.buffer = new Array(maxSize);
  }

  add(event: TelemetryEvent): void {
    this.buffer[this.head] = event;
    this.head = (this.head + 1) % this.maxSize;
    if (this.size < this.maxSize) {
      this.size++;
    }
  }

  getAll(): TelemetryEvent[] {
    if (this.size < this.maxSize) {
      return this.buffer.slice(0, this.size);
    }
    
    // Return in chronological order
    return [
      ...this.buffer.slice(this.head),
      ...this.buffer.slice(0, this.head),
    ];
  }

  getLatest(count: number): TelemetryEvent[] {
    const all = this.getAll();
    return all.slice(-count);
  }

  clear(): void {
    this.head = 0;
    this.size = 0;
  }
}

/**
 * Hook for streaming telemetry events with ring buffer
 * 
 * @param maxEvents - Maximum number of events to keep in buffer (default: 512)
 * @returns Object with events array and utility functions
 */
export function useTelemetryStream(maxEvents: number = 512) {
  const [events, setEvents] = useState<TelemetryEvent[]>([]);
  const [forceUpdate, setForceUpdate] = useState(0);
  const bufferRef = useRef<TelemetryRingBuffer>(new TelemetryRingBuffer(maxEvents));

  const addEvent = useCallback((type: TelemetryEvent['type'], data: any) => {
    const event: TelemetryEvent = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      type,
      data,
    };

    bufferRef.current.add(event);
    setEvents(bufferRef.current.getAll());
    
    // Force re-render for real-time updates
    setForceUpdate(prev => prev + 1);
  }, []);

  const clearEvents = useCallback(() => {
    bufferRef.current.clear();
    setEvents([]);
    setForceUpdate(prev => prev + 1);
  }, []);

  const getEventsByType = useCallback((type: TelemetryEvent['type']) => {
    return events.filter(event => event.type === type);
  }, [events]);

  const getLatestEvent = useCallback((type?: TelemetryEvent['type']) => {
    const filtered = type ? getEventsByType(type) : events;
    return filtered[filtered.length - 1] || null;
  }, [events, getEventsByType]);

  // TODO(PHASE2): Replace simulation with real event listeners
  // Simulation mode for FE-1 - remove when native event binding is ready
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate hashrate samples
      addEvent('HASHRATE_SAMPLE', {
        current: Math.random() * 1000 + 500,
        average10s: Math.random() * 900 + 400,
        average60s: Math.random() * 800 + 350,
        average15m: Math.random() * 750 + 300,
        highest: Math.random() * 1200 + 800,
      } as HashrateSampleData);

      // Occasionally simulate other events
      if (Math.random() < 0.1) {
        addEvent('THERMAL_LEVEL', {
          temperature: Math.random() * 30 + 40,
          level: Math.random() > 0.8 ? 'WARNING' : 'NORMAL',
          threshold: 70,
        } as ThermalLevelData);
      }

      if (Math.random() < 0.05) {
        addEvent('BATTERY_LEVEL', {
          level: Math.random() * 100,
          isCharging: Math.random() > 0.5,
          isLow: Math.random() > 0.8,
        } as BatteryLevelData);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [addEvent]);

  return {
    events,
    addEvent,
    clearEvents,
    getEventsByType,
    getLatestEvent,
    forceUpdate, // For components that need to force re-render
  };
}

// Export type helpers
export type {
  HashrateSampleData,
  PolicyDecisionData,
  ThermalLevelData,
  BatteryLevelData,
  MinerStatusData,
};