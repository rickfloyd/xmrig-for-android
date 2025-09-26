import { useState, useCallback } from 'react';
import { Alert, NativeModules } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BenchmarkConfig, BenchmarkResult, BenchmarkStatus, BenchmarkHistory } from '../benchmark/benchmark.interface';
import { Algorithm } from '../settings/settings.interface';

const { TradingAnarchyModule } = NativeModules;

const BENCHMARK_STORAGE_KEY = '@xmrig_benchmark_history';

export const useBenchmark = () => {
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [currentProgress, setCurrentProgress] = useState<number>(0);

  const startBenchmark = useCallback(async (config: BenchmarkConfig): Promise<BenchmarkResult> => {
    if (isRunning) {
      throw new Error('Benchmark is already running');
    }

    setIsRunning(true);
    setCurrentProgress(0);

    try {
      // Generate unique ID for this benchmark
      const benchmarkId = `benchmark_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const startTime = Date.now();
      const startTemp = await getDeviceTemperature();
      
      // Start benchmark through native module
      const result = await new Promise<BenchmarkResult>((resolve, reject) => {
        let progressInterval: NodeJS.Timeout;
        let maxTemp = startTemp;
        let tempCheckInterval: NodeJS.Timeout;

        // Progress tracking
        progressInterval = setInterval(() => {
          const elapsed = Date.now() - startTime;
          const progress = Math.min((elapsed / (config.duration * 1000)) * 100, 100);
          setCurrentProgress(progress);
          
          if (config.onProgress) {
            config.onProgress(progress);
          }
        }, 500);

        // Temperature monitoring
        tempCheckInterval = setInterval(async () => {
          const currentTemp = await getDeviceTemperature();
          maxTemp = Math.max(maxTemp, currentTemp);
          
          // Safety check - stop if too hot
          if (currentTemp > 90) {
            clearInterval(progressInterval);
            clearInterval(tempCheckInterval);
            reject(new Error('Device overheating - benchmark stopped for safety'));
          }
        }, 2000);

        // Start native benchmark
        if (TradingAnarchyModule?.nativeBenchmarkAlgorithm) {
          TradingAnarchyModule.nativeBenchmarkAlgorithm(
            config.algorithm,
            config.duration,
            config.threads || 0
          ).then((nativeResult: any) => {
            clearInterval(progressInterval);
            clearInterval(tempCheckInterval);
            
            const endTime = Date.now();
            const actualDuration = (endTime - startTime) / 1000;
            const avgTemp = (startTemp + maxTemp) / 2;
            
            const benchmarkResult: BenchmarkResult = {
              id: benchmarkId,
              algorithm: config.algorithm,
              hashrate: nativeResult.hashrate || 0,
              duration: actualDuration,
              efficiency: calculateEfficiency(nativeResult.hashrate || 0, nativeResult.powerUsage || 10),
              maxTemperature: maxTemp,
              avgTemperature: avgTemp,
              powerUsage: nativeResult.powerUsage || estimatePowerUsage(nativeResult.hashrate || 0),
              stable: nativeResult.stable || true,
              timestamp: Date.now(),
              status: BenchmarkStatus.COMPLETED,
              deviceInfo: {
                cores: nativeResult.cores || 8,
                architecture: nativeResult.architecture || 'ARM64',
                model: nativeResult.model || 'Android Device',
                ram: nativeResult.ram || 8
              },
              testParams: {
                threads: config.threads || nativeResult.cores || 8,
                priority: 1,
                hugePages: false
              }
            };
            
            resolve(benchmarkResult);
          }).catch((error: any) => {
            clearInterval(progressInterval);
            clearInterval(tempCheckInterval);
            reject(error);
          });
        } else {
          // Fallback - simulate benchmark for development
          setTimeout(() => {
            clearInterval(progressInterval);
            clearInterval(tempCheckInterval);
            
            const simulatedResult: BenchmarkResult = {
              id: benchmarkId,
              algorithm: config.algorithm,
              hashrate: getSimulatedHashrate(config.algorithm as Algorithm),
              duration: config.duration,
              efficiency: 150.0,
              maxTemperature: maxTemp + Math.random() * 10,
              avgTemperature: startTemp + Math.random() * 8,
              powerUsage: 12.5,
              stable: true,
              timestamp: Date.now(),
              status: BenchmarkStatus.COMPLETED,
              deviceInfo: {
                cores: 8,
                architecture: 'ARM64',
                model: 'Android Device',
                ram: 8
              },
              testParams: {
                threads: config.threads || 8,
                priority: 1,
                hugePages: false
              }
            };
            
            resolve(simulatedResult);
          }, config.duration * 1000);
          
          // Simulate progress
          const progressStep = 100 / (config.duration * 2);
          const progressInterval = setInterval(() => {
            setCurrentProgress(prev => {
              const next = prev + progressStep;
              if (config.onProgress) {
                config.onProgress(next);
              }
              return next;
            });
          }, 500);
        }
      });

      // Save result to history
      await saveBenchmarkResult(result);
      
      return result;
    } catch (error) {
      const errorResult: BenchmarkResult = {
        id: `error_${Date.now()}`,
        algorithm: config.algorithm,
        hashrate: 0,
        duration: 0,
        efficiency: 0,
        maxTemperature: await getDeviceTemperature(),
        avgTemperature: await getDeviceTemperature(),
        powerUsage: 0,
        stable: false,
        timestamp: Date.now(),
        status: BenchmarkStatus.FAILED,
        deviceInfo: {
          cores: 0,
          architecture: 'Unknown',
          model: 'Unknown',
          ram: 0
        },
        testParams: {
          threads: 0,
          priority: 0,
          hugePages: false
        },
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      
      await saveBenchmarkResult(errorResult);
      throw error;
    } finally {
      setIsRunning(false);
      setCurrentProgress(0);
    }
  }, [isRunning]);

  const stopBenchmark = useCallback(async (): Promise<void> => {
    if (TradingAnarchyModule?.nativeStopBenchmark) {
      await TradingAnarchyModule.nativeStopBenchmark();
    }
    setIsRunning(false);
    setCurrentProgress(0);
  }, []);

  const getBenchmarkHistory = useCallback(async (): Promise<BenchmarkResult[]> => {
    try {
      const historyJson = await AsyncStorage.getItem(BENCHMARK_STORAGE_KEY);
      if (historyJson) {
        const history: BenchmarkHistory = JSON.parse(historyJson);
        return history.results || [];
      }
      return [];
    } catch (error) {
      console.warn('Failed to load benchmark history:', error);
      return [];
    }
  }, []);

  const clearBenchmarkHistory = useCallback(async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem(BENCHMARK_STORAGE_KEY);
    } catch (error) {
      console.warn('Failed to clear benchmark history:', error);
    }
  }, []);

  const exportBenchmarkResults = useCallback(async (results: BenchmarkResult[]): Promise<string> => {
    const exportData = {
      exportedAt: new Date().toISOString(),
      appVersion: '1.0.0',
      deviceInfo: results[0]?.deviceInfo || {},
      results: results.map(r => ({
        algorithm: r.algorithm,
        hashrate: r.hashrate,
        efficiency: r.efficiency,
        maxTemperature: r.maxTemperature,
        duration: r.duration,
        stable: r.stable,
        timestamp: new Date(r.timestamp).toISOString()
      }))
    };
    
    return JSON.stringify(exportData, null, 2);
  }, []);

  return {
    startBenchmark,
    stopBenchmark,
    getBenchmarkHistory,
    clearBenchmarkHistory,
    exportBenchmarkResults,
    isRunning,
    currentProgress
  };
};

// Helper functions
const getDeviceTemperature = async (): Promise<number> => {
  if (TradingAnarchyModule?.nativeGetCpuTemperature) {
    return await TradingAnarchyModule.nativeGetCpuTemperature();
  }
  // Fallback - simulate temperature
  return 35 + Math.random() * 10;
};

const calculateEfficiency = (hashrate: number, powerUsage: number): number => {
  if (powerUsage <= 0) return 0;
  return hashrate / powerUsage;
};

const estimatePowerUsage = (hashrate: number): number => {
  // Rough estimation based on hashrate
  return Math.max(8.0, hashrate / 100);
};

const getSimulatedHashrate = (algorithm: Algorithm): number => {
  const baselines: Record<Algorithm, number> = {
    [Algorithm.RX_0]: 1200,
    [Algorithm.RX_WOW]: 1150,
    [Algorithm.RX_ARQ]: 1100,
    [Algorithm.RX_SFX]: 1080,
    [Algorithm.CN_R]: 800,
    [Algorithm.CN_FAST]: 1600,
    [Algorithm.CN_HALF]: 1400,
    [Algorithm.CN]: 700,
    [Algorithm.CN_1]: 720,
    [Algorithm.CN_2]: 740,
    [Algorithm.ASTROBWT]: 450,
    [Algorithm.CN_HEAVY]: 400,
    [Algorithm.PANTHERA]: 350,
    // Add more as needed
  } as any;
  
  const baseline = baselines[algorithm] || 800;
  return baseline * (0.8 + Math.random() * 0.4); // ±20% variation
};

const saveBenchmarkResult = async (result: BenchmarkResult): Promise<void> => {
  try {
    const historyJson = await AsyncStorage.getItem(BENCHMARK_STORAGE_KEY);
    let history: BenchmarkHistory;
    
    if (historyJson) {
      history = JSON.parse(historyJson);
    } else {
      history = {
        results: [],
        lastUpdated: Date.now()
      };
    }
    
    // Add new result
    history.results.push(result);
    
    // Keep only last 50 results to prevent storage bloat
    if (history.results.length > 50) {
      history.results = history.results.slice(-50);
    }
    
    history.lastUpdated = Date.now();
    
    await AsyncStorage.setItem(BENCHMARK_STORAGE_KEY, JSON.stringify(history));
  } catch (error) {
    console.warn('Failed to save benchmark result:', error);
  }
};