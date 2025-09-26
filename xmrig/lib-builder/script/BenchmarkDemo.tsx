import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
  Modal,
  FlatList
} from 'react-native';
import { Algorithm } from './src/core/settings/settings.interface';
import { useBenchmark } from './src/core/hooks/use-benchmark.hook';
import { BenchmarkConfig, BenchmarkResult } from './src/core/benchmark/benchmark.interface';

const { width, height } = Dimensions.get('window');

interface AlgorithmOption {
  value: Algorithm;
  label: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  description: string;
}

const algorithmOptions: AlgorithmOption[] = [
  { value: Algorithm.CN, label: 'CryptoNight', difficulty: 'Easy', description: 'Original CryptoNight algorithm' },
  { value: Algorithm.CN_1, label: 'CryptoNight v1', difficulty: 'Easy', description: 'CryptoNight variant 1' },
  { value: Algorithm.CN_2, label: 'CryptoNight v2', difficulty: 'Medium', description: 'CryptoNight variant 2' },
  { value: Algorithm.CN_R, label: 'CryptoNight R', difficulty: 'Medium', description: 'CryptoNight Random' },
  { value: Algorithm.RX_0, label: 'RandomX', difficulty: 'Hard', description: 'CPU-optimized RandomX' },
  { value: Algorithm.RX_WOW, label: 'RandomWOW', difficulty: 'Hard', description: 'Wownero RandomX variant' },
  { value: Algorithm.RX_ARQ, label: 'RandomARQ', difficulty: 'Hard', description: 'ArQmA RandomX variant' },
  { value: Algorithm.ARGON2_CHUKWA, label: 'Argon2 Chukwa', difficulty: 'Medium', description: 'Memory-hard Argon2' },
  { value: Algorithm.ASTROBWT, label: 'AstroBWT', difficulty: 'Hard', description: 'Dero AstroBWT algorithm' },
  { value: Algorithm.GHOSTRIDER, label: 'GhostRider', difficulty: 'Hard', description: 'Raptoreum GhostRider' }
];

const durationOptions = [
  { value: 30, label: '30 seconds', description: 'Quick test' },
  { value: 60, label: '1 minute', description: 'Standard test' },
  { value: 180, label: '3 minutes', description: 'Extended test' },
  { value: 300, label: '5 minutes', description: 'Comprehensive test' }
];

const BenchmarkDemo: React.FC = () => {
  const {
    currentBenchmark,
    isRunning,
    progress,
    results,
    startBenchmark,
    stopBenchmark,
    getBenchmarkHistory,
    clearHistory
  } = useBenchmark();

  const [selectedAlgorithm, setSelectedAlgorithm] = useState<Algorithm>(Algorithm.CN);
  const [selectedDuration, setSelectedDuration] = useState<number>(60);
  const [showAlgorithmModal, setShowAlgorithmModal] = useState(false);
  const [showDurationModal, setShowDurationModal] = useState(false);
  const [showResultsModal, setShowResultsModal] = useState(false);

  useEffect(() => {
    getBenchmarkHistory();
  }, [getBenchmarkHistory]);

  const handleStartBenchmark = async () => {
    if (isRunning) return;

    try {
      const config: BenchmarkConfig = {
        algorithm: selectedAlgorithm,
        duration: selectedDuration,
        threads: 4, // Default threads
        onProgress: (progressValue: number) => {
          console.log(`Benchmark progress: ${progressValue}%`);
        }
      };

      await startBenchmark(config);
      Alert.alert('Benchmark Started', `Testing ${selectedAlgorithm} for ${selectedDuration} seconds`);
    } catch (error) {
      Alert.alert('Error', `Failed to start benchmark: ${error}`);
    }
  };

  const handleStopBenchmark = async () => {
    try {
      await stopBenchmark();
      Alert.alert('Benchmark Stopped', 'Benchmark has been stopped');
    } catch (error) {
      Alert.alert('Error', `Failed to stop benchmark: ${error}`);
    }
  };

  const handleClearHistory = async () => {
    Alert.alert(
      'Clear History',
      'Are you sure you want to clear all benchmark results?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            await clearHistory();
            Alert.alert('Success', 'Benchmark history cleared');
          }
        }
      ]
    );
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return '#4CAF50';
      case 'Medium': return '#FF9800';
      case 'Hard': return '#F44336';
      default: return '#757575';
    }
  };

  const formatHashrate = (hashrate: number): string => {
    if (hashrate >= 1000000) return `${(hashrate / 1000000).toFixed(2)} MH/s`;
    if (hashrate >= 1000) return `${(hashrate / 1000).toFixed(2)} KH/s`;
    return `${hashrate.toFixed(2)} H/s`;
  };

  const renderAlgorithmItem = ({ item }: { item: AlgorithmOption }) => (
    <TouchableOpacity
      style={[
        styles.modalItem,
        selectedAlgorithm === item.value && styles.selectedModalItem
      ]}
      onPress={() => {
        setSelectedAlgorithm(item.value);
        setShowAlgorithmModal(false);
      }}
    >
      <View style={styles.modalItemHeader}>
        <Text style={styles.modalItemLabel}>{item.label}</Text>
        <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(item.difficulty) }]}>
          <Text style={styles.difficultyText}>{item.difficulty}</Text>
        </View>
      </View>
      <Text style={styles.modalItemDescription}>{item.description}</Text>
    </TouchableOpacity>
  );

  const renderDurationItem = ({ item }: { item: typeof durationOptions[0] }) => (
    <TouchableOpacity
      style={[
        styles.modalItem,
        selectedDuration === item.value && styles.selectedModalItem
      ]}
      onPress={() => {
        setSelectedDuration(item.value);
        setShowDurationModal(false);
      }}
    >
      <Text style={styles.modalItemLabel}>{item.label}</Text>
      <Text style={styles.modalItemDescription}>{item.description}</Text>
    </TouchableOpacity>
  );

  const renderResultItem = ({ item }: { item: BenchmarkResult }) => (
    <View style={styles.resultItem}>
      <View style={styles.resultHeader}>
        <Text style={styles.resultAlgorithm}>{item.algorithm}</Text>
        <Text style={styles.resultHashrate}>{formatHashrate(item.hashrate)}</Text>
      </View>
      <View style={styles.resultDetails}>
        <Text style={styles.resultDetail}>Duration: {item.duration}s</Text>
        <Text style={styles.resultDetail}>Efficiency: {item.efficiency.toFixed(2)} H/W</Text>
        <Text style={styles.resultDetail}>Max Temp: {item.maxTemperature.toFixed(1)}°C</Text>
        <Text style={styles.resultDetail}>Status: {item.status}</Text>
      </View>
      <Text style={styles.resultTimestamp}>
        {new Date(item.timestamp).toLocaleDateString()} {new Date(item.timestamp).toLocaleTimeString()}
      </Text>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>XMRig Benchmark</Text>
        <Text style={styles.subtitle}>Device Performance Testing</Text>
      </View>

      {/* Current Status */}
      {currentBenchmark && (
        <View style={styles.statusCard}>
          <Text style={styles.statusTitle}>
            {isRunning ? 'Running Benchmark' : 'Last Benchmark'}
          </Text>
          <Text style={styles.statusAlgorithm}>{currentBenchmark.algorithm}</Text>
          {isRunning && (
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${progress}%` }]} />
              </View>
              <Text style={styles.progressText}>{progress.toFixed(1)}%</Text>
            </View>
          )}
          {!isRunning && currentBenchmark.hashrate > 0 && (
            <Text style={styles.statusHashrate}>
              {formatHashrate(currentBenchmark.hashrate)}
            </Text>
          )}
        </View>
      )}

      {/* Algorithm Selection */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Algorithm</Text>
        <TouchableOpacity
          style={styles.selector}
          onPress={() => setShowAlgorithmModal(true)}
          disabled={isRunning}
        >
          <View>
            <Text style={styles.selectorLabel}>
              {algorithmOptions.find(opt => opt.value === selectedAlgorithm)?.label}
            </Text>
            <Text style={styles.selectorDescription}>
              {algorithmOptions.find(opt => opt.value === selectedAlgorithm)?.description}
            </Text>
          </View>
          <View style={[
            styles.difficultyBadge,
            { backgroundColor: getDifficultyColor(algorithmOptions.find(opt => opt.value === selectedAlgorithm)?.difficulty || 'Easy') }
          ]}>
            <Text style={styles.difficultyText}>
              {algorithmOptions.find(opt => opt.value === selectedAlgorithm)?.difficulty}
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Duration Selection */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Test Duration</Text>
        <TouchableOpacity
          style={styles.selector}
          onPress={() => setShowDurationModal(true)}
          disabled={isRunning}
        >
          <View>
            <Text style={styles.selectorLabel}>
              {durationOptions.find(opt => opt.value === selectedDuration)?.label}
            </Text>
            <Text style={styles.selectorDescription}>
              {durationOptions.find(opt => opt.value === selectedDuration)?.description}
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Control Buttons */}
      <View style={styles.buttonContainer}>
        {!isRunning ? (
          <TouchableOpacity style={styles.startButton} onPress={handleStartBenchmark}>
            <Text style={styles.startButtonText}>Start Benchmark</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.stopButton} onPress={handleStopBenchmark}>
            <Text style={styles.stopButtonText}>Stop Benchmark</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => setShowResultsModal(true)}
        >
          <Text style={styles.secondaryButtonText}>View History ({results.length})</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={handleClearHistory}
          disabled={results.length === 0}
        >
          <Text style={[styles.secondaryButtonText, results.length === 0 && styles.disabledText]}>
            Clear History
          </Text>
        </TouchableOpacity>
      </View>

      {/* Algorithm Selection Modal */}
      <Modal visible={showAlgorithmModal} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Algorithm</Text>
            <TouchableOpacity onPress={() => setShowAlgorithmModal(false)}>
              <Text style={styles.modalClose}>Done</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={algorithmOptions}
            renderItem={renderAlgorithmItem}
            keyExtractor={(item) => item.value}
            style={styles.modalList}
          />
        </View>
      </Modal>

      {/* Duration Selection Modal */}
      <Modal visible={showDurationModal} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Duration</Text>
            <TouchableOpacity onPress={() => setShowDurationModal(false)}>
              <Text style={styles.modalClose}>Done</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={durationOptions}
            renderItem={renderDurationItem}
            keyExtractor={(item) => item.value.toString()}
            style={styles.modalList}
          />
        </View>
      </Modal>

      {/* Results History Modal */}
      <Modal visible={showResultsModal} animationType="slide" presentationStyle="fullScreen">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Benchmark History</Text>
            <TouchableOpacity onPress={() => setShowResultsModal(false)}>
              <Text style={styles.modalClose}>Done</Text>
            </TouchableOpacity>
          </View>
          {results.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No benchmark results yet</Text>
              <Text style={styles.emptyStateSubtext}>Run your first benchmark to see results here</Text>
            </View>
          ) : (
            <FlatList
              data={results}
              renderItem={renderResultItem}
              keyExtractor={(item) => item.id}
              style={styles.modalList}
            />
          )}
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    padding: 20,
    paddingTop: 50,
    backgroundColor: '#1E1E1E',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#BB86FC',
    textAlign: 'center',
    marginTop: 5,
  },
  statusCard: {
    margin: 16,
    padding: 16,
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#BB86FC',
    marginBottom: 8,
  },
  statusAlgorithm: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  statusHashrate: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#03DAC6',
  },
  progressContainer: {
    marginVertical: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#333',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#03DAC6',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 4,
  },
  card: {
    margin: 16,
    marginTop: 8,
    padding: 16,
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#BB86FC',
    marginBottom: 12,
  },
  selector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#2E2E2E',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#444',
  },
  selectorLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  selectorDescription: {
    fontSize: 12,
    color: '#AAAAAA',
    marginTop: 2,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultyText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  buttonContainer: {
    margin: 16,
    gap: 12,
  },
  startButton: {
    backgroundColor: '#03DAC6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
  },
  stopButton: {
    backgroundColor: '#CF6679',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  stopButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  secondaryButton: {
    backgroundColor: '#2E2E2E',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#444',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#BB86FC',
  },
  disabledText: {
    color: '#666',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#121212',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
    backgroundColor: '#1E1E1E',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  modalClose: {
    fontSize: 16,
    fontWeight: '500',
    color: '#BB86FC',
  },
  modalList: {
    flex: 1,
  },
  modalItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  selectedModalItem: {
    backgroundColor: '#2E2E2E',
  },
  modalItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  modalItemLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    flex: 1,
  },
  modalItemDescription: {
    fontSize: 14,
    color: '#AAAAAA',
  },
  resultItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  resultAlgorithm: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  resultHashrate: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#03DAC6',
  },
  resultDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 8,
  },
  resultDetail: {
    fontSize: 12,
    color: '#AAAAAA',
  },
  resultTimestamp: {
    fontSize: 11,
    color: '#666',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#AAAAAA',
    textAlign: 'center',
  },
});

export default BenchmarkDemo;