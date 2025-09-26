import React, { useState, useCallback, useEffect } from 'react';
import { ScrollView, Alert } from 'react-native';
import {
  View, Text, Colors, Button, Card, Picker, Slider, 
  Assets, GridView, ProgressBar, Switch
} from 'react-native-ui-lib';
import { SessionDataContext } from '../../../core/session-data/session-data.context';
import { Algorithm, Algorithems } from '../../../core/settings/settings.interface';
import { useBenchmark } from '../../../core/hooks/use-benchmark.hook';
import { BenchmarkResult, BenchmarkStatus } from '../../../core/benchmark/benchmark.interface';

export interface BenchmarkScreenProps {}

const BenchmarkScreen: React.FC<BenchmarkScreenProps> = () => {
  const { CPUTemp } = React.useContext(SessionDataContext);
  
  // Benchmark state
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<Algorithm>(Algorithm.RX_0);
  const [benchmarkDuration, setBenchmarkDuration] = useState<number>(60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [results, setResults] = useState<BenchmarkResult[]>([]);
  const [currentResult, setCurrentResult] = useState<BenchmarkResult | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [includeAllAlgorithms, setIncludeAllAlgorithms] = useState<boolean>(false);
  
  const { startBenchmark, stopBenchmark, getBenchmarkHistory } = useBenchmark();

  // Load previous results on mount
  useEffect(() => {
    const loadHistory = async () => {
      const history = await getBenchmarkHistory();
      setResults(history);
    };
    loadHistory();
  }, []);

  const handleStartBenchmark = useCallback(async () => {
    if (CPUTemp > 80) {
      Alert.alert(
        'Temperature Warning',
        'CPU temperature is too high for benchmarking. Please wait for device to cool down.',
        [{ text: 'OK' }]
      );
      return;
    }

    setIsRunning(true);
    setProgress(0);
    setCurrentResult(null);

    try {
      const algorithmsToTest = includeAllAlgorithms 
        ? Algorithems.filter(algo => algo !== Algorithm.CN_GPU) // Skip GPU algorithms on mobile
        : [selectedAlgorithm];

      for (let i = 0; i < algorithmsToTest.length; i++) {
        const algorithm = algorithmsToTest[i];
        
        const result = await startBenchmark({
          algorithm,
          duration: benchmarkDuration,
          onProgress: (progressPercent: number) => {
            const totalProgress = ((i * 100) + progressPercent) / algorithmsToTest.length;
            setProgress(totalProgress);
          }
        });

        setResults(prev => [...prev, result]);
        setCurrentResult(result);

        // Small delay between algorithms to prevent overheating
        if (i < algorithmsToTest.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
    } catch (error) {
      Alert.alert('Benchmark Error', error instanceof Error ? error.message : 'Unknown error occurred');
    } finally {
      setIsRunning(false);
      setProgress(0);
    }
  }, [selectedAlgorithm, benchmarkDuration, includeAllAlgorithms, CPUTemp, startBenchmark]);

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

  // Prepare chart data
  const chartData = results
    .filter(r => r.status === BenchmarkStatus.COMPLETED)
    .map(r => ({
      algorithm: r.algorithm.replace(/[\/\_]/g, '\n'),
      hashrate: r.hashrate,
      efficiency: r.efficiency,
      temperature: r.maxTemperature
    }));

  const algorithmOptions = Algorithems.map(algo => ({
    label: algo.toUpperCase().replace(/[\/\_]/g, ' '),
    value: algo
  }));

  return (
    <View bg-screenBG flex>
      {/* Header */}
      <View paddingH-20 paddingV-15 bg-$backgroundDefault>
        <Text text50 $textDefault>Device Benchmark</Text>
        <Text text70 $textNeutral>Test your device mining performance</Text>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }}>
        {/* Configuration Card */}
        <Card enableShadow marginB-15>
          <View padding-20>
            <Text text60 marginB-15>Benchmark Configuration</Text>
            
            {/* Algorithm Selection */}
            <View marginB-15>
              <Text text70 marginB-5>Algorithm</Text>
              <Picker
                value={selectedAlgorithm}
                onChange={(value) => setSelectedAlgorithm(value as Algorithm)}
                items={algorithmOptions}
              />
            </View>

            {/* Duration Slider */}
            <View marginB-15>
              <Text text70 marginB-5>Duration: {benchmarkDuration}s</Text>
              <Slider
                value={benchmarkDuration}
                onValueChange={setBenchmarkDuration}
                minimumValue={30}
                maximumValue={300}
                step={15}
                disabled={isRunning}
              />
            </View>

            {/* All Algorithms Toggle */}
            <View row spread centerV marginB-15>
              <Text text70>Test All Algorithms</Text>
              <Switch
                value={includeAllAlgorithms}
                onValueChange={setIncludeAllAlgorithms}
                disabled={isRunning}
              />
            </View>

            {/* Control Buttons */}
            <View row spread>
              {!isRunning ? (
                <Button
                  label="Start Benchmark"
                  backgroundColor={Colors.$backgroundSuccessHeavy}
                  onPress={handleStartBenchmark}
                  iconSource={Assets.icons.start}
                  flex
                  marginR-10
                />
              ) : (
                <Button
                  label="Stop Benchmark"
                  backgroundColor={Colors.$backgroundDangerHeavy}
                  onPress={handleStopBenchmark}
                  iconSource={Assets.icons.stop}
                  flex
                  marginR-10
                />
              )}
              
              <Button
                label="Clear Results"
                backgroundColor={Colors.$backgroundWarningHeavy}
                onPress={clearResults}
                disabled={isRunning}
                iconSource={Assets.icons.trash}
                flex
                marginL-10
              />
            </View>
          </View>
        </Card>

        {/* Progress Card */}
        {isRunning && (
          <Card enableShadow marginB-15>
            <View padding-20>
              <Text text60 marginB-10>Benchmarking in Progress...</Text>
              <ProgressBar 
                progress={progress} 
                progressColor={Colors.$backgroundSuccessHeavy}
              />
              <Text text80 marginT-5 center>{Math.round(progress)}% Complete</Text>
              
              {currentResult && (
                <View marginT-15 paddingT-15 style={{ borderTopWidth: 1, borderTopColor: Colors.$outlineDefault }}>
                  <Text text70>Current: {currentResult.algorithm.toUpperCase()}</Text>
                  <Text text80>Hashrate: {currentResult.hashrate.toFixed(2)} H/s</Text>
                  <Text text80>Temperature: {currentResult.maxTemperature.toFixed(1)}°C</Text>
                </View>
              )}
            </View>
          </Card>
        )}

        {/* Results Overview */}
        {results.length > 0 && (
          <Card enableShadow marginB-15>
            <View padding-20>
              <Text text60 marginB-15>Benchmark Results</Text>
              
              {/* Summary Stats */}
              <GridView
                items={[
                  {
                    renderCustomItem: () => (
                      <View center padding-10 bg-$backgroundSuccessLight style={{ borderRadius: 8 }}>
                        <Text text50 $textDefault>{results.filter(r => r.status === BenchmarkStatus.COMPLETED).length}</Text>
                        <Text text80 $textNeutral>Tests Completed</Text>
                      </View>
                    )
                  },
                  {
                    renderCustomItem: () => (
                      <View center padding-10 bg-$backgroundPrimaryLight style={{ borderRadius: 8 }}>
                        <Text text50 $textDefault>
                          {results.length > 0 ? Math.max(...results.map(r => r.hashrate)).toFixed(0) : '0'}
                        </Text>
                        <Text text80 $textNeutral>Best H/s</Text>
                      </View>
                    )
                  }
                ]}
                numColumns={2}
              />
            </View>
          </Card>
        )}

        {/* Performance Chart */}
        {chartData.length > 0 && (
          <Card enableShadow marginB-15>
            <View padding-20>
              <Text text60 marginB-15>Performance Comparison</Text>
              
              <View>
                {chartData.map((data, index) => {
                  const maxHashrate = Math.max(...chartData.map(d => d.hashrate));
                  const barWidth = maxHashrate > 0 ? (data.hashrate / maxHashrate) * 100 : 0;
                  
                  return (
                    <View key={index} marginB-10>
                      <View row spread marginB-5>
                        <Text text80 $textDefault>{data.algorithm.replace('\n', '/')}</Text>
                        <Text text80 $textNeutral>{data.hashrate.toFixed(0)} H/s</Text>
                      </View>
                      <View 
                        height={8} 
                        bg-$backgroundNeutralLight 
                        style={{ borderRadius: 4 }}
                      >
                        <View 
                          height={8} 
                          bg-$backgroundSuccessHeavy
                          style={{ 
                            width: `${barWidth}%`, 
                            borderRadius: 4 
                          }}
                        />
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          </Card>
        )}

        {/* Detailed Results */}
        {results.length > 0 && (
          <Card enableShadow marginB-20>
            <View padding-20>
              <Text text60 marginB-15>Detailed Results</Text>
              
              {results.slice().reverse().map((result, index) => (
                <View 
                  key={`${result.algorithm}-${result.timestamp}`}
                  paddingV-10
                  style={{
                    borderBottomWidth: index < results.length - 1 ? 1 : 0,
                    borderBottomColor: Colors.$outlineDefault
                  }}
                >
                  <View row spread centerV marginB-5>
                    <Text text70 $textDefault>{result.algorithm.toUpperCase()}</Text>
                    <View 
                      paddingH-8 
                      paddingV-2 
                      style={{ 
                        borderRadius: 4,
                        backgroundColor: result.status === BenchmarkStatus.COMPLETED 
                          ? Colors.$backgroundSuccessLight 
                          : Colors.$backgroundDangerLight
                      }}
                    >
                      <Text text90 $textDefault>{result.status}</Text>
                    </View>
                  </View>
                  
                  <GridView
                    items={[
                      {
                        renderCustomItem: () => (
                          <View>
                            <Text text80 $textNeutral>Hashrate</Text>
                            <Text text70 $textDefault>{result.hashrate.toFixed(2)} H/s</Text>
                          </View>
                        )
                      },
                      {
                        renderCustomItem: () => (
                          <View>
                            <Text text80 $textNeutral>Efficiency</Text>
                            <Text text70 $textDefault>{result.efficiency.toFixed(2)} H/W</Text>
                          </View>
                        )
                      },
                      {
                        renderCustomItem: () => (
                          <View>
                            <Text text80 $textNeutral>Max Temp</Text>
                            <Text text70 $textDefault>{result.maxTemperature.toFixed(1)}°C</Text>
                          </View>
                        )
                      },
                      {
                        renderCustomItem: () => (
                          <View>
                            <Text text80 $textNeutral>Duration</Text>
                            <Text text70 $textDefault>{result.duration}s</Text>
                          </View>
                        )
                      }
                    ]}
                    numColumns={2}
                  />
                </View>
              ))}
            </View>
          </Card>
        )}
      </ScrollView>
    </View>
  );
};

export default BenchmarkScreen;