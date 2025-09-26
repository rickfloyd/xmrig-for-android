import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, Alert, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { Algorithm, Algorithems } from '../../core/settings/settings.interface';
import { useBenchmark } from '../../core/hooks/use-benchmark.hook';
import { BenchmarkResult, BenchmarkStatus } from '../../core/benchmark/benchmark.interface';

const { width } = Dimensions.get('window');

const BenchmarkDemo: React.FC = () => {
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<Algorithm>(Algorithm.RX_0);
  const [benchmarkDuration, setBenchmarkDuration] = useState<number>(60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [results, setResults] = useState<BenchmarkResult[]>([]);
  const [progress, setProgress] = useState<number>(0);
  
  const { startBenchmark, stopBenchmark } = useBenchmark();

  const handleStartBenchmark = useCallback(async () => {
    setIsRunning(true);
    setProgress(0);

    try {
      const result = await startBenchmark({
        algorithm: selectedAlgorithm,
        duration: benchmarkDuration,
        onProgress: (progressPercent: number) => {
          setProgress(progressPercent);
        }
      });

      setResults(prev => [...prev, result]);
    } catch (error) {
      Alert.alert('Benchmark Error', error instanceof Error ? error.message : 'Unknown error occurred');
    } finally {
      setIsRunning(false);
      setProgress(0);
    }
  }, [selectedAlgorithm, benchmarkDuration, startBenchmark]);

  const handleStopBenchmark = useCallback(async () => {
    await stopBenchmark();
    setIsRunning(false);
    setProgress(0);
  }, [stopBenchmark]);

  const clearResults = useCallback(() => {
    Alert.alert(
      'Clear Results',
      'Are you sure you want to clear all benchmark results?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear', 
          style: 'destructive',
          onPress: () => setResults([])
        }
      ]
    );
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>📊 XMRig Benchmark</Text>
        <Text style={styles.subtitle}>Professional Mining Performance Testing</Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* Configuration Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>⚙️ Benchmark Configuration</Text>
          
          <View style={styles.configSection}>
            <Text style={styles.label}>Algorithm: {selectedAlgorithm.toUpperCase()}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.algorithmScroll}>
              {Algorithems.slice(0, 10).map((algo) => (
                <TouchableOpacity
                  key={algo}
                  style={[
                    styles.algorithmButton,
                    selectedAlgorithm === algo && styles.algorithmButtonSelected
                  ]}
                  onPress={() => setSelectedAlgorithm(algo)}
                  disabled={isRunning}
                >
                  <Text style={[
                    styles.algorithmButtonText,
                    selectedAlgorithm === algo && styles.algorithmButtonTextSelected
                  ]}>
                    {algo.replace(/[\/\_]/g, ' ').toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.configSection}>
            <Text style={styles.label}>Duration: {benchmarkDuration}s</Text>
            <View style={styles.durationButtons}>
              {[30, 60, 120, 300].map(duration => (
                <TouchableOpacity
                  key={duration}
                  style={[
                    styles.durationButton,
                    benchmarkDuration === duration && styles.durationButtonSelected
                  ]}
                  onPress={() => setBenchmarkDuration(duration)}
                  disabled={isRunning}
                >
                  <Text style={styles.durationButtonText}>{duration}s</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.buttonRow}>
            {!isRunning ? (
              <TouchableOpacity 
                style={[styles.button, styles.startButton]} 
                onPress={handleStartBenchmark}
              >
                <Text style={styles.buttonText}>🚀 Start Benchmark</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity 
                style={[styles.button, styles.stopButton]} 
                onPress={handleStopBenchmark}
              >
                <Text style={styles.buttonText}>⏹️ Stop Benchmark</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity 
              style={[styles.button, styles.clearButton]} 
              onPress={clearResults}
              disabled={isRunning}
            >
              <Text style={styles.buttonText}>🗑️ Clear</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Progress Card */}
        {isRunning && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>⏳ Benchmarking in Progress...</Text>
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${progress}%` }]} />
              </View>
              <Text style={styles.progressText}>{Math.round(progress)}% Complete</Text>
            </View>
          </View>
        )}

        {/* Results */}
        {results.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>📈 Benchmark Results ({results.length} tests)</Text>
            
            {/* Summary Stats */}
            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>
                  {results.filter(r => r.status === BenchmarkStatus.COMPLETED).length}
                </Text>
                <Text style={styles.statLabel}>Completed</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>
                  {results.length > 0 ? Math.max(...results.map(r => r.hashrate)).toFixed(0) : '0'}
                </Text>
                <Text style={styles.statLabel}>Best H/s</Text>
              </View>
            </View>

            {/* Detailed Results */}
            {results.slice().reverse().map((result, index) => (
              <View key={`${result.algorithm}-${result.timestamp}`} style={styles.resultItem}>
                <View style={styles.resultHeader}>
                  <Text style={styles.resultAlgorithm}>{result.algorithm.toUpperCase()}</Text>
                  <View style={[
                    styles.resultStatus,
                    result.status === BenchmarkStatus.COMPLETED ? styles.statusCompleted : styles.statusFailed
                  ]}>
                    <Text style={styles.resultStatusText}>{result.status}</Text>
                  </View>
                </View>
                
                <View style={styles.resultDetails}>
                  <View style={styles.resultMetric}>
                    <Text style={styles.resultMetricLabel}>Hashrate</Text>
                    <Text style={styles.resultMetricValue}>{result.hashrate.toFixed(2)} H/s</Text>
                  </View>
                  <View style={styles.resultMetric}>
                    <Text style={styles.resultMetricLabel}>Efficiency</Text>
                    <Text style={styles.resultMetricValue}>{result.efficiency.toFixed(2)} H/W</Text>
                  </View>
                  <View style={styles.resultMetric}>
                    <Text style={styles.resultMetricLabel}>Max Temp</Text>
                    <Text style={styles.resultMetricValue}>{result.maxTemperature.toFixed(1)}°C</Text>
                  </View>
                  <View style={styles.resultMetric}>
                    <Text style={styles.resultMetricLabel}>Duration</Text>
                    <Text style={styles.resultMetricValue}>{result.duration}s</Text>
                  </View>
                </View>

                {/* Performance Bar */}
                <View style={styles.performanceBarContainer}>
                  <View style={styles.performanceBar}>
                    <View style={[
                      styles.performanceBarFill,
                      { width: `${Math.min((result.hashrate / 2000) * 100, 100)}%` }
                    ]} />
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {results.length === 0 && !isRunning && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateTitle}>🎯 Ready to Benchmark</Text>
            <Text style={styles.emptyStateText}>
              Select an algorithm and duration, then tap "Start Benchmark" to test your device's mining performance.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#2c3e50',
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#bdc3c7',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
  },
  configSection: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#34495e',
    marginBottom: 10,
  },
  algorithmScroll: {
    marginVertical: 10,
  },
  algorithmButton: {
    backgroundColor: '#ecf0f1',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
  },
  algorithmButtonSelected: {
    backgroundColor: '#3498db',
  },
  algorithmButtonText: {
    color: '#2c3e50',
    fontSize: 12,
    fontWeight: '500',
  },
  algorithmButtonTextSelected: {
    color: 'white',
  },
  durationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  durationButton: {
    backgroundColor: '#ecf0f1',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  durationButtonSelected: {
    backgroundColor: '#e74c3c',
  },
  durationButtonText: {
    color: '#2c3e50',
    fontWeight: '600',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  startButton: {
    backgroundColor: '#27ae60',
  },
  stopButton: {
    backgroundColor: '#e74c3c',
  },
  clearButton: {
    backgroundColor: '#f39c12',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  progressContainer: {
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#ecf0f1',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#27ae60',
  },
  progressText: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ecf0f1',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  statLabel: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 5,
  },
  resultItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
    paddingVertical: 15,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  resultAlgorithm: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  resultStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusCompleted: {
    backgroundColor: '#d5f5d5',
  },
  statusFailed: {
    backgroundColor: '#f5d5d5',
  },
  resultStatusText: {
    fontSize: 12,
    color: '#2c3e50',
    fontWeight: '600',
  },
  resultDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  resultMetric: {
    flex: 1,
    alignItems: 'center',
  },
  resultMetricLabel: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  resultMetricValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginTop: 2,
  },
  performanceBarContainer: {
    marginTop: 10,
  },
  performanceBar: {
    width: '100%',
    height: 6,
    backgroundColor: '#ecf0f1',
    borderRadius: 3,
    overflow: 'hidden',
  },
  performanceBarFill: {
    height: '100%',
    backgroundColor: '#3498db',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default BenchmarkDemo;