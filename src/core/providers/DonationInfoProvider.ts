/**
 * Interface for providing donation information to mining services.
 * Abstracts donation logic to enable future policy-based adjustments.
 */
export interface DonationInfoProvider {
  /**
   * Gets the current donation percentage.
   * @returns Donation percentage (0-100)
   */
  getDonationPercent(): number;
}

/**
 * Default implementation that reads donation settings from application settings.
 * Provides fallback behavior when settings are unavailable.
 */
export class DefaultDonationInfoProvider implements DonationInfoProvider {
  private settings: any;

  constructor(settings: any) {
    this.settings = settings;
  }

  /**
   * Gets the donation percentage from settings or returns 0 if unavailable.
   *
   * @returns Donation percentage (0-100)
   */
  getDonationPercent(): number {
    try {
      if (this.settings && typeof this.settings.donation === 'number') {
        return Math.max(0, Math.min(100, this.settings.donation));
      }
      return 0;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn('DonationInfoProvider: Failed to get donation percent, using fallback', error);
      return 0;
    }
  }

  /**
   * Updates the settings reference for dynamic updates.
   * TODO PHASE2: Hook PolicyOrchestrator for adaptive donation policy
   *
   * @param settings - Updated settings object
   */
  updateSettings(settings: any): void {
    this.settings = settings;
  }
}
