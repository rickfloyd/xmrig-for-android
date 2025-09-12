/**
 * Utility for formatting hashrate values with appropriate units and thresholds.
 * Provides consistent hashrate display across the application.
 */
export class HashrateFormatter {
  private static readonly KILO_THRESHOLD = 1000;

  private static readonly MEGA_THRESHOLD = 1000000;

  /**
   * Formats a hashrate value with appropriate units and decimal places.
   *
   * Thresholds:
   * - < 1,000: raw H/s
   * - < 1,000,000: kH/s (one decimal place)
   * - >= 1,000,000: MH/s (two decimal places)
   *
   * @param hashrate - The raw hashrate value in H/s
   * @returns Formatted string with unit
   */
  static format(hashrate: number): string {
    try {
      if (Number.isNaN(hashrate) || hashrate < 0) {
        return '0 H/s';
      }

      if (hashrate < this.KILO_THRESHOLD) {
        return `${Math.round(hashrate)} H/s`;
      }
      if (hashrate < this.MEGA_THRESHOLD) {
        const kHashrate = hashrate / this.KILO_THRESHOLD;
        return `${kHashrate.toFixed(1)} kH/s`;
      }
      const mHashrate = hashrate / this.MEGA_THRESHOLD;
      return `${mHashrate.toFixed(2)} MH/s`;
    } catch (error) {
      // Graceful fallback if formatting fails
      // eslint-disable-next-line no-console
      console.warn('HashrateFormatter: Failed to format hashrate, using fallback', error);
      return '0 H/s';
    }
  }

  /**
   * Formats hashrate for notification display with thread safety considerations.
   * This method is safe to call from background threads.
   *
   * @param hashrate - The raw hashrate value in H/s
   * @returns Formatted string with unit
   */
  static formatForNotification(hashrate: number): string {
    return this.format(hashrate);
  }
}
