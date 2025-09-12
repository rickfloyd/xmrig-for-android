/**
 * Utility for parsing hashrate values from miner output.
 * Extracts numeric values and units from hashrate strings.
 */
export interface ParsedHashrate {
  value: number;
  unit: string;
  raw: string;
}

export class HashrateParser {
  private static readonly HASHRATE_REGEX = /(\d+\.?\d*)\s*(H\/s|kH\/s|MH\/s|GH\/s)/i;

  /**
   * Parses a hashrate string and extracts the numeric value and unit.
   *
   * @param hashrateString - Raw hashrate string from miner output
   * @returns ParsedHashrate object with value, unit, and raw string
   */
  static parse(hashrateString: string): ParsedHashrate {
    if (!hashrateString || typeof hashrateString !== 'string') {
      return { value: 0, unit: 'H/s', raw: hashrateString || '' };
    }

    const match = hashrateString.match(this.HASHRATE_REGEX);
    if (!match) {
      return { value: 0, unit: 'H/s', raw: hashrateString };
    }

    const [, valueStr, unit] = match;
    const value = parseFloat(valueStr);

    if (Number.isNaN(value)) {
      return { value: 0, unit: 'H/s', raw: hashrateString };
    }

    return {
      value: this.normalizeToHashPerSecond(value, unit),
      unit: unit.toLowerCase(),
      raw: hashrateString,
    };
  }

  /**
   * Normalizes different hashrate units to base H/s for consistent processing.
   *
   * @param value - Numeric hashrate value
   * @param unit - Unit string (H/s, kH/s, MH/s, etc.)
   * @returns Normalized value in H/s
   */
  private static normalizeToHashPerSecond(value: number, unit: string): number {
    const normalizedUnit = unit.toLowerCase();

    switch (normalizedUnit) {
      case 'kh/s':
        return value * 1000;
      case 'mh/s':
        return value * 1000000;
      case 'gh/s':
        return value * 1000000000;
      case 'h/s':
      default:
        return value;
    }
  }

  /**
   * Extracts hashrate from a typical miner log line.
   * Handles various miner output formats.
   *
   * @param logLine - Single line from miner output
   * @returns ParsedHashrate or null if no hashrate found
   */
  static parseFromLogLine(logLine: string): ParsedHashrate | null {
    if (!logLine) return null;

    // Common patterns in XMRig output
    const patterns = [
      /speed\s+(\d+\.?\d*\s*[a-zA-Z/]+)/i,
      /(\d+\.?\d*\s*[a-zA-Z/]+)\s+H\/s/i,
      /hashrate.*?(\d+\.?\d*\s*[a-zA-Z/]+)/i,
    ];

    // Use for...of for better readability than forEach
    // eslint-disable-next-line no-restricted-syntax
    for (const pattern of patterns) {
      const match = logLine.match(pattern);
      if (match) {
        const hashrateStr = match[1];
        const parsed = this.parse(hashrateStr);
        if (parsed.value > 0) {
          return parsed;
        }
      }
    }

    return null;
  }
}
