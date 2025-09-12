/**
 * Simple test utility for validating hashrate formatting and parsing.
 * Can be run in React Native debugger console or Node.js.
 */

import { HashrateFormatter, HashrateParser } from '../utils';

// Test cases for HashrateFormatter
export const testHashrateFormatter = () => {
  console.log('=== Testing HashrateFormatter ===');

  const testCases = [
    { input: 0, expected: '0 H/s' },
    { input: 500, expected: '500 H/s' },
    { input: 950, expected: '950 H/s' },
    { input: 1000, expected: '1.0 kH/s' },
    { input: 1500, expected: '1.5 kH/s' },
    { input: 12400, expected: '12.4 kH/s' },
    { input: 999999, expected: '1000.0 kH/s' },
    { input: 1000000, expected: '1.00 MH/s' },
    { input: 3250000, expected: '3.25 MH/s' },
    { input: 15600000, expected: '15.60 MH/s' },
    { input: -100, expected: '0 H/s' },
    { input: NaN, expected: '0 H/s' },
  ];

  let passed = 0;
  let failed = 0;

  testCases.forEach(({ input, expected }) => {
    const result = HashrateFormatter.format(input);
    if (result === expected) {
      console.log(`✅ ${input} H/s -> ${result}`);
      passed += 1;
    } else {
      console.log(`❌ ${input} H/s -> ${result} (expected: ${expected})`);
      failed += 1;
    }
  });

  console.log(`\nFormatter Results: ${passed} passed, ${failed} failed`);
  return { passed, failed };
};

// Test cases for HashrateParser
export const testHashrateParser = () => {
  console.log('\n=== Testing HashrateParser ===');

  const testCases = [
    { input: '950 H/s', expectedValue: 950, expectedUnit: 'h/s' },
    { input: '12.4 kH/s', expectedValue: 12400, expectedUnit: 'kh/s' },
    { input: '3.25 MH/s', expectedValue: 3250000, expectedUnit: 'mh/s' },
    { input: '1.5 GH/s', expectedValue: 1500000000, expectedUnit: 'gh/s' },
    { input: 'invalid', expectedValue: 0, expectedUnit: 'H/s' },
    { input: '', expectedValue: 0, expectedUnit: 'H/s' },
    { input: 'speed 950.5 H/s', expectedValue: 950.5, expectedUnit: 'h/s' },
  ];

  let passed = 0;
  let failed = 0;

  testCases.forEach(({ input, expectedValue, expectedUnit }) => {
    const result = HashrateParser.parse(input);
    if (result.value === expectedValue && result.unit === expectedUnit) {
      console.log(`✅ "${input}" -> ${result.value} H/s (${result.unit})`);
      passed += 1;
    } else {
      console.log(`❌ "${input}" -> ${result.value} H/s (${result.unit}) expected: ${expectedValue} H/s (${expectedUnit})`);
      failed += 1;
    }
  });

  console.log(`\nParser Results: ${passed} passed, ${failed} failed`);
  return { passed, failed };
};

// Combined test runner
export const runAllTests = () => {
  console.log('🔍 Running Hashrate Utility Tests...\n');

  const formatterResults = testHashrateFormatter();
  const parserResults = testHashrateParser();

  const totalPassed = formatterResults.passed + parserResults.passed;
  const totalFailed = formatterResults.failed + parserResults.failed;

  console.log(`\n🎯 Overall Results: ${totalPassed} passed, ${totalFailed} failed`);

  if (totalFailed === 0) {
    console.log('🎉 All tests passed!');
  } else {
    console.log('💥 Some tests failed. Please review the output above.');
  }

  return { totalPassed, totalFailed };
};

// Export for easy console testing
if (typeof global !== 'undefined') {
  global.testHashrateUtils = runAllTests;
}
