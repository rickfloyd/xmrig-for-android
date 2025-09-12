import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { useTelemetryStream } from '../hooks/useTelemetryStream';
import { calculateAverageHashrate } from '../format/hashrate';

/**
 * Minimal state management for FE-1
 * TODO(FE-2): Migrate to Zustand for more complex state management
 */

interface MinerUIState {
  // Derived values from hooks
  averageHashrateNSamples: number;
  isSimulationMode: boolean;
  
  // UI preferences
  refreshInterval: number;
  theme: 'dark' | 'light';
  compactMode: boolean;
}

interface MinerUIContextType {
  state: MinerUIState;
  actions: {
    setRefreshInterval: (interval: number) => void;
    setTheme: (theme: 'dark' | 'light') => void;
    setCompactMode: (compact: boolean) => void;
    toggleSimulationMode: () => void;
  };
  
  // Derived values from hooks
  averageHashrateLastN: (samples: number) => number;
}

type MinerUIAction = 
  | { type: 'SET_REFRESH_INTERVAL'; payload: number }
  | { type: 'SET_THEME'; payload: 'dark' | 'light' }
  | { type: 'SET_COMPACT_MODE'; payload: boolean }
  | { type: 'TOGGLE_SIMULATION_MODE' };

const initialState: MinerUIState = {
  averageHashrateNSamples: 10,
  isSimulationMode: true, // Default to simulation for FE-1
  refreshInterval: 2000,
  theme: 'dark',
  compactMode: false,
};

function minerUIReducer(state: MinerUIState, action: MinerUIAction): MinerUIState {
  switch (action.type) {
    case 'SET_REFRESH_INTERVAL':
      return { ...state, refreshInterval: action.payload };
    case 'SET_THEME':
      return { ...state, theme: action.payload };
    case 'SET_COMPACT_MODE':
      return { ...state, compactMode: action.payload };
    case 'TOGGLE_SIMULATION_MODE':
      return { ...state, isSimulationMode: !state.isSimulationMode };
    default:
      return state;
  }
}

const MinerUIContext = createContext<MinerUIContextType | undefined>(undefined);

/**
 * Provider component that wraps the app and provides miner UI state
 */
export interface MinerUIProviderProps {
  children: ReactNode;
}

export const MinerUIProvider: React.FC<MinerUIProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(minerUIReducer, initialState);
  
  // Hooks for derived data
  const { events: telemetryEvents } = useTelemetryStream();
  
  // Derived selector: average hashrate over last N samples
  const averageHashrateLastN = (samples: number): number => {
    const hashrateEvents = telemetryEvents
      .filter(event => event.type === 'HASHRATE_SAMPLE')
      .slice(-samples)
      .map(event => event.data.current);
    
    return calculateAverageHashrate(hashrateEvents);
  };

  // Actions
  const actions = {
    setRefreshInterval: (interval: number) => {
      dispatch({ type: 'SET_REFRESH_INTERVAL', payload: interval });
    },
    
    setTheme: (theme: 'dark' | 'light') => {
      dispatch({ type: 'SET_THEME', payload: theme });
    },
    
    setCompactMode: (compact: boolean) => {
      dispatch({ type: 'SET_COMPACT_MODE', payload: compact });
    },
    
    toggleSimulationMode: () => {
      dispatch({ type: 'TOGGLE_SIMULATION_MODE' });
    },
  };

  const contextValue: MinerUIContextType = {
    state,
    actions,
    averageHashrateLastN,
  };

  return (
    <MinerUIContext.Provider value={contextValue}>
      {children}
    </MinerUIContext.Provider>
  );
};

/**
 * Hook to access miner UI context
 */
export const useMinerUI = (): MinerUIContextType => {
  const context = useContext(MinerUIContext);
  if (context === undefined) {
    throw new Error('useMinerUI must be used within a MinerUIProvider');
  }
  return context;
};

/**
 * Hook for commonly used derived values
 */
export const useMinerUISelectors = () => {
  const { state, averageHashrateLastN } = useMinerUI();
  
  return {
    // Current theme values
    isDarkMode: state.theme === 'dark',
    isCompactMode: state.compactMode,
    isSimulationMode: state.isSimulationMode,
    
    // Derived hashrate values
    averageHashrate10: () => averageHashrateLastN(10),
    averageHashrate30: () => averageHashrateLastN(30),
    averageHashrate60: () => averageHashrateLastN(60),
    
    // Refresh settings
    refreshInterval: state.refreshInterval,
  };
};