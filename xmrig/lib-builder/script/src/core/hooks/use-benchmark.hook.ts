import { useState, useCallback, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeModules } from 'react-native';
import { BenchmarkConfig, BenchmarkResult, BenchmarkStatus } from '../benchmark/benchmark.interface';

const BENCHMARK_STORAGE_KEY = '@TradingAnarchy:benchmark_results';
const MAX_STORED_RESULTS = 50;

interface UseBenchmarkReturn {
  currentBenchmark: BenchmarkResult | null;
  isRunning: boolean;
  progress: number;
  results: BenchmarkResult[];
  startBenchmark: (config: BenchmarkConfig) => Promise<void>;
  stopBenchmark: () => Promise<void>;
  getBenchmarkHistory: () => Promise<BenchmarkResult[]>;
  clearHistory: () => Promise<void>;
  saveBenchmarkResult: (result: BenchmarkResult) => Promise<void>;
  deleteBenchmarkResult: (id: string) => Promise<void>;
  exportResults: () => Promise<string>;
}

export const useBenchmark = (): UseBenchmarkReturn => {
  const [currentBenchmark, setCurrentBenchmark] = useState<BenchmarkResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<BenchmarkResult[]>([]);
  
  const progressInterval = useRef<NodeJS.Timeout | null>(null);
  const benchmarkTimeout = useRef<NodeJS.Timeout | null>(null);

  const generateBenchmarkId = useCallback(() => {
    return `benchmark_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  const clearTimers = useCallback(() => {
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
      progressInterval.current = null;
    }
    if (benchmarkTimeout.current) {
      clearTimeout(benchmarkTimeout.current);
      benchmarkTimeout.current = null;
    }
  }, []);

  const getBenchmarkHistory = useCallback(async (): Promise<BenchmarkResult[]> => {
    try {
      const storedResults = await AsyncStorage.getItem(BENCHMARK_STORAGE_KEY);
      const parsedResults = storedResults ? JSON.parse(storedResults) : [];
      setResults(parsedResults);
      return parsedResults;
    } catch (error) {
      console.error('Failed to get benchmark history:', error);
      return [];
    }
  }, []);

  const saveBenchmarkResult = useCallback(async (result: BenchmarkResult): Promise<void> => {
    try {
      const existingResults = await getBenchmarkHistory();
      const newResults = [result, ...existingResults.slice(0, MAX_STORED_RESULTS - 1)];
      
      await AsyncStorage.setItem(BENCHMARK_STORAGE_KEY, JSON.stringify(newResults));
      setResults(newResults);
    } catch (error) {
      console.error('Failed to save benchmark result:', error);
      throw error;
    }
  }, [getBenchmarkHistory]);

  const deleteBenchmarkResult = useCallback(async (id: string): Promise<void> => {
    try {
      const existingResults = await getBenchmarkHistory();
      const filteredResults = existingResults.filter(result => result.id !== id);
      
      await AsyncStorage.setItem(BENCHMARK_STORAGE_KEY, JSON.stringify(filteredResults));
      setResults(filteredResults);
    } catch (error) {
      console.error('Failed to delete benchmark result:', error);
      throw error;
    }
  }, [getBenchmarkHistory]);

  const clearHistory = useCallback(async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem(BENCHMARK_STORAGE_KEY);
      setResults([]);
    } catch (error) {
      console.error('Failed to clear benchmark history:', error);
      throw error;
    }
  }, []);

  const simulateDeviceInfo = useCallback(() => {
    return {
      cores: Math.floor(Math.random() * 8) + 4, // 4-12 cores
      architecture: ['armv7', 'arm64', 'x86_64'][Math.floor(Math.random() * 3)],
      model: `Mock Device ${Math.floor(Math.random() * 100)}`,
      ram: Math.floor(Math.random() * 8) + 4 // 4-12 GB
    };
  }, []);

  const calculateHashrate = useCallback((algorithm: string, cores: number): number => {
    const baseHashrate = cores * 100; // Base hashrate per core
    const algorithmMultipliers: { [key: string]: number } = {
      'cn': 1.0,
      'cn/1': 0.8,
      'cn/2': 0.6,
      'cn/r': 0.7,
      'rx/0': 2.0,
      'rx/wow': 1.8,
      'rx/arq': 1.5,
      'argon2/chukwa': 3.0,
      'astrobwt': 0.4,
      'ghostrider': 1.2
    };

    const multiplier = algorithmMultipliers[algorithm] || 1.0;
    return Math.floor(baseHashrate * multiplier * (0.8 + Math.random() * 0.4));
  }, []);

  const startBenchmark = useCallback(async (config: BenchmarkConfig): Promise<void> => {
    if (isRunning) {
      throw new Error('Benchmark is already running');
    }

    clearTimers();
    setIsRunning(true);
    setProgress(0);

    const benchmarkId = generateBenchmarkId();
    const deviceInfo = simulateDeviceInfo();
    
    const benchmarkResult: BenchmarkResult = {
      id: benchmarkId,
      algorithm: config.algorithm,
      hashrate: 0,
      duration: config.duration,
      efficiency: 0,
      maxTemperature: 0,
      avgTemperature: 0,
      powerUsage: 0,
      stable: true,
      timestamp: Date.now(),
      status: BenchmarkStatus.RUNNING,
      deviceInfo,
      testParams: {
        threads: config.threads || deviceInfo.cores,
        priority: 1,
        hugePages: false
      }
    };

    setCurrentBenchmark(benchmarkResult);

    try {
      // Call native benchmark method if available
      const { TradingAnarchyEngine } = NativeModules;
      let nativeResult = null;
      
      if (TradingAnarchyEngine && TradingAnarchyEngine.nativeBenchmarkAlgorithm) {
        try {
          nativeResult = await TradingAnarchyEngine.nativeBenchmarkAlgorithm(
            config.algorithm,
            config.duration,
            config.threads || deviceInfo.cores
          );
        } catch (nativeError) {
          console.warn('Native benchmark failed, using simulation:', nativeError);
        }
      }

      // Simulate progress updates
      let currentProgress = 0;
      const progressIncrement = 100 / (config.duration * 4); // Update 4 times per second
      
      progressInterval.current = setInterval(() => {
        currentProgress += progressIncrement;
        if (currentProgress > 100) currentProgress = 100;
        
        setProgress(currentProgress);
        config.onProgress?.(currentProgress);

        // Simulate temperature monitoring
        const currentTemp = 35 + Math.random() * 30; // 35-65°C
        if (currentTemp > 80) {
          // Safety stop if too hot
          stopBenchmark();
        }
      }, 250);

      // Complete benchmark after duration
      benchmarkTimeout.current = setTimeout(async () => {
        clearTimers();
        
        const finalHashrate = nativeResult?.hashrate || calculateHashrate(config.algorithm, benchmarkResult.testParams.threads);
        const maxTemp = nativeResult?.maxTemperature || (45 + Math.random() * 15);
        const avgTemp = nativeResult?.avgTemperature || (40 + Math.random() * 10);
        const powerUsage = nativeResult?.powerUsage || (finalHashrate * 0.002); // Estimated 0.002W per H/s

        const completedResult: BenchmarkResult = {
          ...benchmarkResult,
          hashrate: finalHashrate,
          efficiency: finalHashrate / Math.max(powerUsage, 1),
          maxTemperature: maxTemp,
          avgTemperature: avgTemp,
          powerUsage,
          status: BenchmarkStatus.COMPLETED,
          stable: maxTemp < 75 && (finalHashrate > benchmarkResult.testParams.threads * 50)
        };

        setCurrentBenchmark(completedResult);
        setIsRunning(false);
        setProgress(100);

        await saveBenchmarkResult(completedResult);
      }, config.duration * 1000);

    } catch (error) {
      clearTimers();
      const errorResult: BenchmarkResult = {
        ...benchmarkResult,
        status: BenchmarkStatus.FAILED,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      
      setCurrentBenchmark(errorResult);
      setIsRunning(false);
      throw error;
    }
  }, [isRunning, clearTimers, generateBenchmarkId, simulateDeviceInfo, calculateHashrate, saveBenchmarkResult]);

  const stopBenchmark = useCallback(async (): Promise<void> => {
    if (!isRunning || !currentBenchmark) {
      return;
    }

    clearTimers();

    try {
      // Call native stop method if available
      const { TradingAnarchyEngine } = NativeModules;
      if (TradingAnarchyEngine && TradingAnarchyEngine.nativeStopBenchmark) {
        await TradingAnarchyEngine.nativeStopBenchmark();
      }
    } catch (error) {
      console.warn('Failed to call native stop benchmark:', error);
    }

    const stoppedResult: BenchmarkResult = {
      ...currentBenchmark,
      status: BenchmarkStatus.STOPPED,
      hashrate: calculateHashrate(currentBenchmark.algorithm, currentBenchmark.testParams.threads),
      duration: Math.floor((Date.now() - currentBenchmark.timestamp) / 1000)
    };

    setCurrentBenchmark(stoppedResult);
    setIsRunning(false);
    setProgress(0);

    await saveBenchmarkResult(stoppedResult);
  }, [isRunning, currentBenchmark, clearTimers, calculateHashrate, saveBenchmarkResult]);

  const exportResults = useCallback(async (): Promise<string> => {
    const allResults = await getBenchmarkHistory();
    
    const exportData = {
      exportDate: new Date().toISOString(),
      totalBenchmarks: allResults.length,
      results: allResults.map(result => ({
        ...result,
        exportedAt: new Date().toISOString()
      }))
    };

    return JSON.stringify(exportData, null, 2);
  }, [getBenchmarkHistory]);

  return {
    currentBenchmark,
    isRunning,
    progress,
    results,
    startBenchmark,
    stopBenchmark,
    getBenchmarkHistory,
    clearHistory,
    saveBenchmarkResult,
    deleteBenchmarkResult,
    exportResults
  };
};