import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Modal,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import WalletManager, { DEVELOPER_WALLET } from '../../core/wallet/wallet.config';

interface DonationSettingsProps {
  visible: boolean;
  onClose: () => void;
  onSettingsChanged: (settings: DonationSettings) => void;
}

interface DonationSettings {
  microSupportEnabled: boolean;
  standardSupportEnabled: boolean;
  customDonationPercentage: number;
  showTransparencyInfo: boolean;
}

const DONATION_SETTINGS_KEY = '@TradingAnarchy:donation_settings';

const DonationSettingsModal: React.FC<DonationSettingsProps> = ({
  visible,
  onClose,
  onSettingsChanged
}) => {
  const [settings, setSettings] = useState<DonationSettings>({
    microSupportEnabled: false,
    standardSupportEnabled: false,
    customDonationPercentage: 0,
    showTransparencyInfo: true,
  });

  const [showTransparencyModal, setShowTransparencyModal] = useState(false);
  const walletManager = WalletManager.getInstance();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem(DONATION_SETTINGS_KEY);
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        setSettings(parsed);
      }
    } catch (error) {
      console.error('Failed to load donation settings:', error);
    }
  };

  const saveSettings = async (newSettings: DonationSettings) => {
    try {
      await AsyncStorage.setItem(DONATION_SETTINGS_KEY, JSON.stringify(newSettings));
      setSettings(newSettings);
      onSettingsChanged(newSettings);
    } catch (error) {
      console.error('Failed to save donation settings:', error);
      Alert.alert('Error', 'Failed to save settings');
    }
  };

  const handleMicroSupportToggle = (enabled: boolean) => {
    if (enabled) {
      Alert.alert(
        'Enable Micro Support',
        'This will donate $25 USD equivalent in XMR for every $300 USD equivalent you mine. You can disable this at any time.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Enable',
            onPress: () => {
              const newSettings = { ...settings, microSupportEnabled: true };
              saveSettings(newSettings);
            }
          }
        ]
      );
    } else {
      const newSettings = { ...settings, microSupportEnabled: false };
      saveSettings(newSettings);
    }
  };

  const handleStandardSupportToggle = (enabled: boolean) => {
    if (enabled) {
      Alert.alert(
        'Enable Standard Support',
        'This will donate 1 XMR for every 6 XMR you mine. You can disable this at any time.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Enable',
            onPress: () => {
              const newSettings = { ...settings, standardSupportEnabled: true };
              saveSettings(newSettings);
            }
          }
        ]
      );
    } else {
      const newSettings = { ...settings, standardSupportEnabled: false };
      saveSettings(newSettings);
    }
  };

  const getCurrentAllocation = () => {
    const allocation = walletManager.getAllocation();
    let donationPercent = 0;
    
    if (settings.microSupportEnabled) donationPercent += 8.33; // 25/300 * 100
    if (settings.standardSupportEnabled) donationPercent += 16.67; // 1/6 * 100
    
    return {
      user: 100 - donationPercent,
      developer: donationPercent
    };
  };

  const allocation = getCurrentAllocation();

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Developer Support</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeText}>Done</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          {/* Transparency Notice */}
          <View style={styles.transparencyCard}>
            <Text style={styles.transparencyTitle}>🔒 Full Transparency</Text>
            <Text style={styles.transparencyText}>
              This app is free to use with no hidden fees. All donation options are voluntary 
              and clearly disclosed. You maintain full control of your mining proceeds.
            </Text>
            <TouchableOpacity
              style={styles.transparencyButton}
              onPress={() => setShowTransparencyModal(true)}
            >
              <Text style={styles.transparencyButtonText}>View Technical Details</Text>
            </TouchableOpacity>
          </View>

          {/* Current Allocation */}
          <View style={styles.allocationCard}>
            <Text style={styles.cardTitle}>Current Mining Allocation</Text>
            <View style={styles.allocationRow}>
              <Text style={styles.allocationLabel}>You receive:</Text>
              <Text style={styles.allocationValue}>{allocation.user.toFixed(1)}%</Text>
            </View>
            <View style={styles.allocationRow}>
              <Text style={styles.allocationLabel}>Developer support:</Text>
              <Text style={styles.allocationValue}>{allocation.developer.toFixed(1)}%</Text>
            </View>
          </View>

          {/* Donation Options */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Voluntary Support Options</Text>
            
            {/* Micro Support */}
            <View style={styles.optionContainer}>
              <View style={styles.optionHeader}>
                <View style={styles.optionInfo}>
                  <Text style={styles.optionTitle}>Micro Support</Text>
                  <Text style={styles.optionDescription}>
                    Donate $25 USD for every $300 USD mined (8.3%)
                  </Text>
                </View>
                <Switch
                  value={settings.microSupportEnabled}
                  onValueChange={handleMicroSupportToggle}
                  trackColor={{ false: '#767577', true: '#03DAC6' }}
                  thumbColor={settings.microSupportEnabled ? '#FFFFFF' : '#f4f3f4'}
                />
              </View>
            </View>

            {/* Standard Support */}
            <View style={styles.optionContainer}>
              <View style={styles.optionHeader}>
                <View style={styles.optionInfo}>
                  <Text style={styles.optionTitle}>Standard Support</Text>
                  <Text style={styles.optionDescription}>
                    Donate 1 XMR for every 6 XMR mined (16.7%)
                  </Text>
                </View>
                <Switch
                  value={settings.standardSupportEnabled}
                  onValueChange={handleStandardSupportToggle}
                  trackColor={{ false: '#767577', true: '#03DAC6' }}
                  thumbColor={settings.standardSupportEnabled ? '#FFFFFF' : '#f4f3f4'}
                />
              </View>
            </View>
          </View>

          {/* Developer Info */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Developer Information</Text>
            <View style={styles.walletInfo}>
              <Text style={styles.walletLabel}>Support Wallet:</Text>
              <Text style={styles.walletAddress} numberOfLines={2}>
                {DEVELOPER_WALLET.address}
              </Text>
              <Text style={styles.walletDescription}>
                {DEVELOPER_WALLET.description}
              </Text>
            </View>
          </View>

          {/* Benefits */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Why Support Development?</Text>
            <Text style={styles.benefitText}>• Regular app updates and improvements</Text>
            <Text style={styles.benefitText}>• New algorithm support</Text>
            <Text style={styles.benefitText}>• Performance optimizations</Text>
            <Text style={styles.benefitText}>• Bug fixes and security updates</Text>
            <Text style={styles.benefitText}>• Free app with no ads</Text>
          </View>
        </ScrollView>

        {/* Transparency Modal */}
        <Modal visible={showTransparencyModal} animationType="slide" presentationStyle="fullScreen">
          <View style={styles.transparencyModalContainer}>
            <View style={styles.header}>
              <Text style={styles.title}>Technical Transparency</Text>
              <TouchableOpacity onPress={() => setShowTransparencyModal(false)}>
                <Text style={styles.closeText}>Close</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.transparencyModalContent}>
              <Text style={styles.technicalTitle}>🔍 Complete Disclosure</Text>
              
              <Text style={styles.technicalSection}>Wallet Addresses:</Text>
              <Text style={styles.technicalText}>
                Developer Wallet: {DEVELOPER_WALLET.address}
              </Text>
              
              <Text style={styles.technicalSection}>Donation Logic:</Text>
              <Text style={styles.technicalText}>
                • Micro Support: For every $300 USD equivalent mined, $25 USD equivalent donated
              </Text>
              <Text style={styles.technicalText}>
                • Standard Support: For every 6 XMR mined, 1 XMR donated
              </Text>
              
              <Text style={styles.technicalSection}>User Controls:</Text>
              <Text style={styles.technicalText}>• All donations require explicit opt-in</Text>
              <Text style={styles.technicalText}>• Can be disabled at any time</Text>
              <Text style={styles.technicalText}>• No hidden fees or backdoors</Text>
              <Text style={styles.technicalText}>• Source code is reviewable</Text>
              
              <Text style={styles.technicalSection}>Data Storage:</Text>
              <Text style={styles.technicalText}>
                Settings stored locally on device in: {DONATION_SETTINGS_KEY}
              </Text>
            </ScrollView>
          </View>
        </Modal>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
    backgroundColor: '#1E1E1E',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  closeButton: {
    padding: 8,
  },
  closeText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#03DAC6',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  transparencyCard: {
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#03DAC6',
  },
  transparencyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#03DAC6',
    marginBottom: 8,
  },
  transparencyText: {
    fontSize: 14,
    color: '#FFFFFF',
    lineHeight: 20,
    marginBottom: 12,
  },
  transparencyButton: {
    backgroundColor: '#03DAC6',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  transparencyButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000000',
  },
  allocationCard: {
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#BB86FC',
    marginBottom: 12,
  },
  allocationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  allocationLabel: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  allocationValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#03DAC6',
  },
  card: {
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  optionContainer: {
    marginBottom: 16,
  },
  optionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  optionInfo: {
    flex: 1,
    marginRight: 16,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 12,
    color: '#AAAAAA',
    lineHeight: 16,
  },
  walletInfo: {
    backgroundColor: '#2E2E2E',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#444',
  },
  walletLabel: {
    fontSize: 12,
    color: '#BB86FC',
    marginBottom: 4,
  },
  walletAddress: {
    fontSize: 10,
    fontFamily: 'monospace',
    color: '#03DAC6',
    marginBottom: 8,
  },
  walletDescription: {
    fontSize: 12,
    color: '#AAAAAA',
  },
  benefitText: {
    fontSize: 14,
    color: '#FFFFFF',
    marginBottom: 6,
    paddingLeft: 8,
  },
  transparencyModalContainer: {
    flex: 1,
    backgroundColor: '#121212',
  },
  transparencyModalContent: {
    flex: 1,
    padding: 16,
  },
  technicalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#03DAC6',
    marginBottom: 16,
  },
  technicalSection: {
    fontSize: 16,
    fontWeight: '600',
    color: '#BB86FC',
    marginTop: 16,
    marginBottom: 8,
  },
  technicalText: {
    fontSize: 14,
    color: '#FFFFFF',
    marginBottom: 8,
    lineHeight: 20,
  },
});

export default DonationSettingsModal;