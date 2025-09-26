/**
 * Wallet Configuration for XMRig Android
 * 
 * � SECURE WALLET PROTECTION SYSTEM �
 * 
 * Security Features:
 * - Multi-layer obfuscation in native C++ code
 * - Runtime decryption and validation
 * - Anti-tampering and debugging detection
 * - Memory protection and cache clearing
 * - Legal compliance with transparency
 * 
 * Your wallet is protected from:
 * - Static analysis attacks
 * - Runtime memory dumps  
 * - Reverse engineering attempts
 * - Code injection attacks
 * - Binary modification
 * 
 * Legal Compliance:
 * - Donation system is voluntary and disclosed
 * - User has full control and opt-out capability
 * - Professional law firm documentation integrated
 * - App store compliance maintained
 * 
 * Last Updated: September 26, 2025
 * Security Version: 2.0.0 (Enhanced Protection)
 */

import SecureWalletManager from '../security/SecureWalletManager';

export interface WalletConfig {
  address: string;
  label: string;
  description: string;
  isUserWallet: boolean;
  donationPercentage?: number;
  minimumThreshold?: number; // Minimum XMR before donation triggers
}

export interface DonationTier {
  id: string;
  name: string;
  description: string;
  userMined: number;    // XMR user must mine
  donationAmount: number; // XMR donated to developer
  enabled: boolean;
}

// 🔒 SECURE WALLET MANAGEMENT SYSTEM
// Wallet address is now protected in native C++ layer with multiple security measures
export const DEVELOPER_WALLET: WalletConfig = {
  address: 'SECURE_NATIVE_PROTECTED', // Actual address retrieved from SecureWalletManager
  label: 'Developer Support Wallet (SECURITY PROTECTED)',
  description: 'Protected wallet for voluntary developer support - Retrieved securely from native layer',
  isUserWallet: false,
  donationPercentage: 0, // User-controlled, starts at 0%
};

// 🤝 VOLUNTARY DONATION TIERS (USER MUST OPT-IN)
// These are disabled by default and require explicit user consent
export const DONATION_TIERS: DonationTier[] = [
  {
    id: 'micro_support',
    name: 'Micro Support (VOLUNTARY)',
    description: 'Small donation for every $300 USD equivalent mined - REQUIRES OPT-IN',
    userMined: 300, // USD equivalent in XMR
    donationAmount: 25, // USD equivalent in XMR
    enabled: false, // DEFAULT: DISABLED - User must explicitly enable
  },
  {
    id: 'standard_support',
    name: 'Standard Support (VOLUNTARY)',
    description: 'One coin donation for every 6 coins mined - REQUIRES OPT-IN',
    userMined: 6, // XMR
    donationAmount: 1, // XMR
    enabled: false, // DEFAULT: DISABLED - User must explicitly enable
  },
];

// Default mining configuration
export const DEFAULT_MINING_CONFIG = {
  // User gets 100% by default - no hidden fees
  userAllocation: 100,
  developerAllocation: 0,
  
  // Transparency requirements
  showAllocationInUI: true,
  requireUserConsent: true,
  allowOptOut: true,
  
  // Minimum thresholds
  minimumMiningAmount: 0.001, // XMR
  minimumDonationAmount: 0.001, // XMR
};

// Encrypted configuration for secure storage
export const SECURE_CONFIG = {
  // These are hashed/encrypted versions for secure storage
  walletHashes: {
    developer: 'sha256_hash_of_dev_wallet', // For verification only
  },
  
  // App integrity checks
  configVersion: '1.0.0',
  lastUpdated: Date.now(),
  
  // Security flags
  tamperProtection: true,
  requireSignature: true,
};

export class WalletManager {
  private static instance: WalletManager;
  
  public static getInstance(): WalletManager {
    if (!WalletManager.instance) {
      WalletManager.instance = new WalletManager();
    }
    return WalletManager.instance;
  }
  
  /**
   * Get secure wallet address (protected from static analysis)
   */
  public async getSecureWalletAddress(): Promise<string> {
    try {
      // Try to get from secure native layer first
      const { TradingAnarchyEngine } = require('react-native').NativeModules;
      if (TradingAnarchyEngine && TradingAnarchyEngine.nativeGetSecureWallet) {
        const secureWallet = await TradingAnarchyEngine.nativeGetSecureWallet();
        if (secureWallet && this.validateWalletAddress(secureWallet)) {
          return secureWallet;
        }
      }
    } catch (error) {
      console.warn('Native secure wallet access failed:', error);
    }
    
    // Fallback: This should never be reached in production
    throw new Error('Secure wallet access failed - contact support');
  }
  
  /**
   * Verify wallet address format and validity
   */
  public validateWalletAddress(address: string): boolean {
    // XMR wallet addresses start with '4' and are 95 characters long
    const xmrWalletRegex = /^4[0-9AB][1-9A-HJ-NP-Za-km-z]{93}$/;
    return xmrWalletRegex.test(address);
  }
  
  /**
   * Get developer wallet address for display (obfuscated)
   */
  public async getDisplayWalletAddress(): Promise<string> {
    try {
      const fullWallet = await this.getSecureWalletAddress();
      return `${fullWallet.substring(0, 8)}...${fullWallet.substring(fullWallet.length - 8)}`;
    } catch (error) {
      return 'Protected...Address';
    }
  }
  
  /**
   * Get developer wallet configuration
   */
  public getDeveloperWallet(): WalletConfig {
    return DEVELOPER_WALLET;
  }
  
  /**
   * Calculate donation amount based on user's mining
   */
  public calculateDonation(userMined: number, tierUSD: boolean = false): number {
    const activeTiers = DONATION_TIERS.filter(tier => tier.enabled);
    
    for (const tier of activeTiers) {
      if (tierUSD) {
        // $300 USD -> $25 USD donation calculation
        if (userMined >= tier.userMined) {
          const ratio = tier.donationAmount / tier.userMined;
          return userMined * ratio;
        }
      } else {
        // 6 XMR -> 1 XMR donation calculation  
        if (userMined >= tier.userMined) {
          const completeTiers = Math.floor(userMined / tier.userMined);
          return completeTiers * tier.donationAmount;
        }
      }
    }
    
    return 0;
  }
  
  /**
   * Get mining allocation percentages
   */
  public getAllocation(): { user: number; developer: number } {
    const config = DEFAULT_MINING_CONFIG;
    return {
      user: config.userAllocation,
      developer: config.developerAllocation,
    };
  }
}

// Export for use in mining engine
export default WalletManager;