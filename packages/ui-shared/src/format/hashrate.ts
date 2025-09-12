/**
 * Hashrate formatting utilities
 * Consistent with notification logic and existing Phase 1 formatter
 * 
 * TODO(PHASE1): Reconcile with existing hashrate formatting from PR #4 when merging
 */

export interface HashrateFormatResult {
  value: string;
  unit: string;
  display: string;
}

/**
 * Format hashrate value with appropriate units and precision
 * 
 * @param value - Hashrate value in H/s
 * @returns Formatted hashrate with value, unit, and display string
 */
export function formatHashrate(value: number): HashrateFormatResult {
  if (value === 0 || !Number.isFinite(value)) {
    return {
      value: '0',
      unit: 'H/s',
      display: '0 H/s',
    };
  }

  const absValue = Math.abs(value);

  // kH/s threshold: >= 1000 H/s
  if (absValue >= 1000 && absValue < 1000000) {
    const kValue = value / 1000;
    return {
      value: kValue.toFixed(1),
      unit: 'kH/s',
      display: `${kValue.toFixed(1)} kH/s`,
    };
  }

  // MH/s threshold: >= 1,000,000 H/s
  if (absValue >= 1000000) {
    const mValue = value / 1000000;
    return {
      value: mValue.toFixed(2),
      unit: 'MH/s',
      display: `${mValue.toFixed(2)} MH/s`,
    };
  }

  // TODO(FE-2): Add GH/s support for future high-performance scenarios
  // if (absValue >= 1000000000) {
  //   const gValue = value / 1000000000;
  //   return {
  //     value: gValue.toFixed(3),
  //     unit: 'GH/s',
  //     display: `${gValue.toFixed(3)} GH/s`,
  //   };
  // }

  // Base case: H/s
  return {
    value: Math.round(value).toString(),
    unit: 'H/s',
    display: `${Math.round(value)} H/s`,
  };
}

/**
 * Format hashrate for compact display (shorter format)
 * 
 * @param value - Hashrate value in H/s
 * @returns Compact formatted string
 */
export function formatHashrateCompact(value: number): string {
  const result = formatHashrate(value);
  return result.display;
}

/**
 * Parse hashrate from string (reverse of format)
 * Useful for config parsing and validation
 * 
 * @param hashrate - Formatted hashrate string (e.g., "1.5 kH/s")
 * @returns Hashrate value in H/s or null if invalid
 */
export function parseHashrate(hashrate: string): number | null {
  const trimmed = hashrate.trim();
  const match = trimmed.match(/^([0-9]+\.?[0-9]*)\s*(H\/s|kH\/s|MH\/s|GH\/s)$/i);
  
  if (!match) {
    return null;
  }

  const [, valueStr, unit] = match;
  const value = parseFloat(valueStr);

  if (!Number.isFinite(value)) {
    return null;
  }

  switch (unit.toLowerCase()) {
    case 'h/s':
      return value;
    case 'kh/s':
      return value * 1000;
    case 'mh/s':
      return value * 1000000;
    case 'gh/s':
      return value * 1000000000;
    default:
      return null;
  }
}

/**
 * Get hashrate unit for a given value
 * 
 * @param value - Hashrate value in H/s
 * @returns Unit string
 */
export function getHashrateUnit(value: number): string {
  return formatHashrate(value).unit;
}

/**
 * Calculate average hashrate from array of values
 * 
 * @param values - Array of hashrate values
 * @returns Average hashrate or 0 if array is empty
 */
export function calculateAverageHashrate(values: number[]): number {
  if (!values.length) return 0;
  
  const validValues = values.filter(v => Number.isFinite(v) && v >= 0);
  if (!validValues.length) return 0;
  
  return validValues.reduce((sum, val) => sum + val, 0) / validValues.length;
}