import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeModules } from 'react-native';
import WalletManager from '../wallet/wallet.config';

interface MiningSession {
  id: string;
  startTime: number;
  endTime?: number;
  algorithm: string;
  hashrate: number;
  userWallet: string;
  developerAllocation: number;
  totalEarnings: number;
  donationAmount: number;
  donationTriggers: string[]; // Which tiers triggered
}

interface MiningStats {
  totalMined: number;
  totalDonated: number;
  sessionsCount: number;
  lastDonation: number;
  lifetimeEarnings: number;
}

const MINING_STATS_KEY = '@TradingAnarchy:mining_stats';
const MINING_SESSIONS_KEY = '@TradingAnarchy:mining_sessions';
const DONATION_SETTINGS_KEY = '@TradingAnarchy:donation_settings';

export class MiningEngine {
  private static instance: MiningEngine;
  private walletManager: WalletManager;
  private currentSession: MiningSession | null = null;
  private statsUpdateInterval: NodeJS.Timeout | null = null;

  private constructor() {
    this.walletManager = WalletManager.getInstance();
  }

  public static getInstance(): MiningEngine {
    if (!MiningEngine.instance) {
      MiningEngine.instance = new MiningEngine();
    }
    return MiningEngine.instance;
  }

  /**
   * Start mining session with transparent allocation
   */
  public async startMining(userWallet: string, algorithm: string): Promise<void> {
    if (this.currentSession) {
      throw new Error('Mining session already active');
    }

    // Get current donation settings
    const donationSettings = await this.getDonationSettings();
    const developerAllocation = this.calculateDeveloperAllocation(donationSettings);

    // Validate wallets
    if (!this.walletManager.validateWalletAddress(userWallet)) {
      throw new Error('Invalid user wallet address');
    }

    // Create new mining session
    this.currentSession = {
      id: `mining_${Date.now()}`,
      startTime: Date.now(),
      algorithm,
      hashrate: 0,
      userWallet,
      developerAllocation,
      totalEarnings: 0,
      donationAmount: 0,
      donationTriggers: []
    };

    // Configure native mining engine
    try {
      const { TradingAnarchyEngine } = NativeModules;
      if (TradingAnarchyEngine && TradingAnarchyEngine.configureMining) {
        await TradingAnarchyEngine.configureMining({
          algorithm,
          userWallet,
          developerWallet: this.walletManager.getDeveloperWallet().address,
          userAllocation: 100 - developerAllocation,
          developerAllocation: developerAllocation,
          transparent: true
        });
      }

      // Start stats monitoring
      this.startStatsMonitoring();

    } catch (error) {
      this.currentSession = null;
      throw new Error(`Failed to start mining: ${error}`);
    }
  }

  /**
   * Stop mining and calculate final allocations
   */
  public async stopMining(): Promise<MiningSession> {
    if (!this.currentSession) {
      throw new Error('No active mining session');
    }

    // Stop stats monitoring
    if (this.statsUpdateInterval) {
      clearInterval(this.statsUpdateInterval);
      this.statsUpdateInterval = null;
    }

    // Finalize session
    this.currentSession.endTime = Date.now();
    
    // Calculate final donations
    await this.calculateAndProcessDonations();

    // Save session
    await this.saveMiningSession(this.currentSession);
    
    // Update lifetime stats
    await this.updateLifetimeStats(this.currentSession);

    const completedSession = { ...this.currentSession };
    this.currentSession = null;

    try {
      // Stop native mining
      const { TradingAnarchyEngine } = NativeModules;
      if (TradingAnarchyEngine && TradingAnarchyEngine.stopMining) {
        await TradingAnarchyEngine.stopMining();
      }
    } catch (error) {
      console.warn('Failed to stop native mining:', error);
    }

    return completedSession;
  }

  /**
   * Get current mining status
   */
  public getCurrentSession(): MiningSession | null {
    return this.currentSession;
  }

  /**
   * Get mining statistics
   */
  public async getMiningStats(): Promise<MiningStats> {
    try {
      const storedStats = await AsyncStorage.getItem(MINING_STATS_KEY);
      if (storedStats) {
        return JSON.parse(storedStats);
      }
    } catch (error) {
      console.error('Failed to load mining stats:', error);
    }

    // Default stats
    return {
      totalMined: 0,
      totalDonated: 0,
      sessionsCount: 0,
      lastDonation: 0,
      lifetimeEarnings: 0
    };
  }

  /**
   * Get donation settings from storage
   */
  private async getDonationSettings(): Promise<any> {
    try {
      const settings = await AsyncStorage.getItem(DONATION_SETTINGS_KEY);
      return settings ? JSON.parse(settings) : {
        microSupportEnabled: false,
        standardSupportEnabled: false,
        customDonationPercentage: 0
      };
    } catch (error) {
      console.error('Failed to load donation settings:', error);
      return { microSupportEnabled: false, standardSupportEnabled: false };
    }
  }

  /**
   * Calculate developer allocation percentage based on user settings
   */
  private calculateDeveloperAllocation(donationSettings: any): number {
    let allocation = 0;
    
    if (donationSettings.microSupportEnabled) {
      allocation += 8.33; // 25/300 * 100
    }
    
    if (donationSettings.standardSupportEnabled) {
      allocation += 16.67; // 1/6 * 100
    }
    
    return Math.min(allocation, 25); // Cap at 25% maximum
  }

  /**
   * Start monitoring mining statistics
   */
  private startStatsMonitoring(): void {
    this.statsUpdateInterval = setInterval(async () => {
      if (!this.currentSession) return;

      try {
        // Get current hashrate from native module
        const { TradingAnarchyEngine } = NativeModules;
        if (TradingAnarchyEngine && TradingAnarchyEngine.getCurrentHashrate) {
          const hashrate = await TradingAnarchyEngine.getCurrentHashrate();
          this.currentSession.hashrate = hashrate;
          
          // Estimate earnings (simplified calculation)
          const sessionDuration = (Date.now() - this.currentSession.startTime) / 1000;
          const estimatedXMR = (hashrate * sessionDuration) / 1000000; // Simplified
          this.currentSession.totalEarnings = estimatedXMR;
        }
      } catch (error) {
        console.warn('Failed to update mining stats:', error);
      }
    }, 10000); // Update every 10 seconds
  }

  /**
   * Calculate and process donations based on user settings
   */
  private async calculateAndProcessDonations(): Promise<void> {
    if (!this.currentSession) return;

    const donationSettings = await this.getDonationSettings();
    const stats = await this.getMiningStats();
    
    let donationAmount = 0;
    const triggers: string[] = [];

    // Micro support calculation (USD-based)
    if (donationSettings.microSupportEnabled) {
      const estimatedUSD = this.currentSession.totalEarnings * 150; // Assume $150/XMR
      const newTotalUSD = (stats.lifetimeEarnings * 150) + estimatedUSD;
      
      if (newTotalUSD >= 300 && (stats.lifetimeEarnings * 150) < 300) {
        donationAmount += 25 / 150; // $25 in XMR
        triggers.push('micro_support');
      }
    }

    // Standard support calculation (XMR-based)
    if (donationSettings.standardSupportEnabled) {
      const newTotalXMR = stats.lifetimeEarnings + this.currentSession.totalEarnings;
      const newCompleteTiers = Math.floor(newTotalXMR / 6);
      const previousCompleteTiers = Math.floor(stats.lifetimeEarnings / 6);
      
      if (newCompleteTiers > previousCompleteTiers) {
        donationAmount += (newCompleteTiers - previousCompleteTiers); // 1 XMR per tier
        triggers.push('standard_support');
      }
    }

    this.currentSession.donationAmount = donationAmount;
    this.currentSession.donationTriggers = triggers;
  }

  /**
   * Save mining session to storage
   */
  private async saveMiningSession(session: MiningSession): Promise<void> {
    try {
      const existingSessions = await AsyncStorage.getItem(MINING_SESSIONS_KEY);
      const sessions = existingSessions ? JSON.parse(existingSessions) : [];
      
      sessions.unshift(session);
      
      // Keep only last 50 sessions
      const trimmedSessions = sessions.slice(0, 50);
      
      await AsyncStorage.setItem(MINING_SESSIONS_KEY, JSON.stringify(trimmedSessions));
    } catch (error) {
      console.error('Failed to save mining session:', error);
    }
  }

  /**
   * Update lifetime mining statistics
   */
  private async updateLifetimeStats(session: MiningSession): Promise<void> {
    try {
      const stats = await this.getMiningStats();
      
      const updatedStats: MiningStats = {
        totalMined: stats.totalMined + session.totalEarnings,
        totalDonated: stats.totalDonated + session.donationAmount,
        sessionsCount: stats.sessionsCount + 1,
        lastDonation: session.donationAmount > 0 ? Date.now() : stats.lastDonation,
        lifetimeEarnings: stats.lifetimeEarnings + session.totalEarnings
      };

      await AsyncStorage.setItem(MINING_STATS_KEY, JSON.stringify(updatedStats));
    } catch (error) {
      console.error('Failed to update lifetime stats:', error);
    }
  }

  /**
   * Get mining history
   */
  public async getMiningHistory(): Promise<MiningSession[]> {
    try {
      const sessions = await AsyncStorage.getItem(MINING_SESSIONS_KEY);
      return sessions ? JSON.parse(sessions) : [];
    } catch (error) {
      console.error('Failed to load mining history:', error);
      return [];
    }
  }

  /**
   * Export mining data for transparency
   */
  public async exportMiningData(): Promise<string> {
    const stats = await this.getMiningStats();
    const history = await this.getMiningHistory();
    const donationSettings = await this.getDonationSettings();

    const exportData = {
      exportDate: new Date().toISOString(),
      walletAddress: this.walletManager.getDeveloperWallet().address,
      donationSettings,
      statistics: stats,
      sessions: history,
      transparency: {
        totalDonationPercentage: this.calculateDeveloperAllocation(donationSettings),
        userControlled: true,
        canOptOut: true,
        noHiddenFees: true
      }
    };

    return JSON.stringify(exportData, null, 2);
  }
}

export default MiningEngine;