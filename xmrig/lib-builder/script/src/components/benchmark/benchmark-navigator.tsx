import React from 'react';
import BenchmarkScreen from './screens/benchmark.screen';

export interface BenchmarkNavigatorProps {}

export const BenchmarkNavigator: React.FC<BenchmarkNavigatorProps> = () => {
  return <BenchmarkScreen />;
};

export default BenchmarkNavigator;