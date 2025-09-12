import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { 
  useMinerStatus, 
  formatHashrate, 
  tokens, 
  StatusBadge,
  type MinerStatus 
} from '@xmrig-for-android/ui-shared';

/**
 * Action button component with consistent styling
 */
interface ActionButtonProps {
  title: string;
  onPress: () => void;
  variant: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
}

const ActionButton: React.FC<ActionButtonProps> = ({ 
  title, 
  onPress, 
  variant, 
  disabled = false 
}) => {
  const getButtonStyle = () => {
    if (disabled) return styles.buttonDisabled;
    
    switch (variant) {
      case 'primary':
        return styles.buttonPrimary;
      case 'danger':
        return styles.buttonDanger;
      case 'secondary':
      default:
        return styles.buttonSecondary;
    }
  };

  const getTextColor = () => {
    if (disabled) return tokens.colors.text.tertiary;
    return tokens.colors.text.inverse;
  };

  return (
    <TouchableOpacity
      style={[styles.actionButton, getButtonStyle()]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <Text style={[styles.actionButtonText, { color: getTextColor() }]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

/**
 * Status card showing current miner state
 */
interface StatusCardProps {
  status: MinerStatus | null;
  isLoading: boolean;
}

const StatusCard: React.FC<StatusCardProps> = ({ status, isLoading }) => {
  if (isLoading) {
    return (
      <View style={styles.statusCard}>
        <Text style={styles.statusCardTitle}>Miner Status</Text>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (!status) {
    return (
      <View style={styles.statusCard}>
        <Text style={styles.statusCardTitle}>Miner Status</Text>
        <Text style={styles.errorText}>Status unavailable</Text>
      </View>
    );
  }

  return (
    <View style={styles.statusCard}>
      <Text style={styles.statusCardTitle}>Miner Status</Text>
      
      <View style={styles.statusRow}>
        <StatusBadge
          status={status.isWorking ? 'success' : 'error'}
          label="State"
          value={status.state}
          size="medium"
        />
      </View>

      <View style={styles.statusRow}>
        <Text style={styles.statusLabel}>Current Hashrate:</Text>
        <Text style={styles.hashrateText}>
          {formatHashrate(status.hashrate.current).display}
        </Text>
      </View>

      <View style={styles.statusRow}>
        <Text style={styles.statusLabel}>60s Average:</Text>
        <Text style={styles.statusValue}>
          {formatHashrate(status.hashrate.average60s).display}
        </Text>
      </View>

      {status.uptime > 0 && (
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Uptime:</Text>
          <Text style={styles.statusValue}>
            {Math.floor(status.uptime / 3600)}h {Math.floor((status.uptime % 3600) / 60)}m
          </Text>
        </View>
      )}
    </View>
  );
};

/**
 * Placeholder for hashrate sparkline chart
 * TODO(FE-2): Replace with actual Victory Native chart
 */
const HashrateSparkline: React.FC = () => {
  return (
    <View style={styles.sparklineContainer}>
      <Text style={styles.sparklineTitle}>Hashrate Trend</Text>
      <View style={styles.sparklinePlaceholder}>
        <Text style={styles.placeholderText}>📈</Text>
        <Text style={styles.placeholderLabel}>Sparkline (FE-2)</Text>
        <Text style={styles.placeholderSubtext}>Victory Native charts coming soon</Text>
      </View>
    </View>
  );
};

/**
 * Mini stats row showing thermal and battery status
 */
interface MiniStatsProps {
  status: MinerStatus | null;
}

const MiniStats: React.FC<MiniStatsProps> = ({ status }) => {
  if (!status) return null;

  const thermalStatus = status.thermal.cpuTemperature > 70 ? 'warning' : 'success';
  const batteryStatus = status.battery.level < 20 ? 'error' : 
                       status.battery.level < 50 ? 'warning' : 'success';

  return (
    <View style={styles.miniStatsContainer}>
      <StatusBadge
        status={thermalStatus}
        label="CPU"
        value={`${status.thermal.cpuTemperature.toFixed(1)}°C`}
        size="small"
        style={styles.miniStatBadge}
      />
      
      <StatusBadge
        status={batteryStatus}
        label="Battery"
        value={`${status.battery.level.toFixed(0)}%${status.battery.isCharging ? ' ⚡' : ''}`}
        size="small"
        style={styles.miniStatBadge}
      />
      
      <StatusBadge
        status="info"
        label="Donation"
        value={`${status.donation.percent}%`}
        size="small"
        style={styles.miniStatBadge}
      />
    </View>
  );
};

/**
 * Main Dashboard screen component
 */
export const Dashboard: React.FC = () => {
  const { status, isLoading, refresh } = useMinerStatus(2000);

  // TODO(PHASE2): Replace with actual miner control methods
  const handleStart = () => {
    console.log('TODO: Implement start mining');
    // Call existing miner core methods or show TODO if missing
  };

  const handlePause = () => {
    console.log('TODO: Implement pause mining');
  };

  const handleResume = () => {
    console.log('TODO: Implement resume mining');
  };

  const handleStop = () => {
    console.log('TODO: Implement stop mining');
  };

  const isWorking = status?.isWorking ?? false;
  const isPaused = status?.isPaused ?? false;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Status Card */}
      <StatusCard status={status} isLoading={isLoading} />

      {/* Hashrate Sparkline Placeholder */}
      <HashrateSparkline />

      {/* Action Buttons Row */}
      <View style={styles.actionsContainer}>
        <Text style={styles.sectionTitle}>Controls</Text>
        <View style={styles.buttonsRow}>
          {!isWorking ? (
            <ActionButton
              title="Start"
              onPress={handleStart}
              variant="primary"
            />
          ) : isPaused ? (
            <ActionButton
              title="Resume"
              onPress={handleResume}
              variant="primary"
            />
          ) : (
            <ActionButton
              title="Pause"
              onPress={handlePause}
              variant="secondary"
            />
          )}
          
          <ActionButton
            title="Stop"
            onPress={handleStop}
            variant="danger"
            disabled={!isWorking}
          />
        </View>
      </View>

      {/* Mini Stats Row */}
      <View style={styles.statsContainer}>
        <Text style={styles.sectionTitle}>System Status</Text>
        <MiniStats status={status} />
      </View>

      {/* Refresh Button */}
      <View style={styles.refreshContainer}>
        <ActionButton
          title="Refresh Status"
          onPress={refresh}
          variant="secondary"
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.colors.background,
  },
  
  contentContainer: {
    padding: tokens.spacing[4],
    paddingBottom: tokens.spacing[8],
  },

  statusCard: {
    backgroundColor: tokens.colors.surface,
    borderRadius: tokens.borderRadius.lg,
    padding: tokens.spacing[5],
    marginBottom: tokens.spacing[4],
    borderWidth: 1,
    borderColor: tokens.colors.border.default,
  },

  statusCardTitle: {
    fontSize: tokens.typography.fontSize.lg,
    fontWeight: tokens.typography.fontWeight.semibold,
    color: tokens.colors.text.primary,
    marginBottom: tokens.spacing[4],
  },

  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: tokens.spacing[2],
  },

  statusLabel: {
    fontSize: tokens.typography.fontSize.sm,
    color: tokens.colors.text.secondary,
  },

  statusValue: {
    fontSize: tokens.typography.fontSize.sm,
    fontWeight: tokens.typography.fontWeight.medium,
    color: tokens.colors.text.primary,
  },

  hashrateText: {
    fontSize: tokens.typography.fontSize.base,
    fontWeight: tokens.typography.fontWeight.bold,
    color: tokens.colors.primary,
  },

  loadingText: {
    fontSize: tokens.typography.fontSize.base,
    color: tokens.colors.text.secondary,
    textAlign: 'center',
    marginVertical: tokens.spacing[4],
  },

  errorText: {
    fontSize: tokens.typography.fontSize.base,
    color: tokens.colors.error,
    textAlign: 'center',
    marginVertical: tokens.spacing[4],
  },

  sparklineContainer: {
    backgroundColor: tokens.colors.surface,
    borderRadius: tokens.borderRadius.lg,
    padding: tokens.spacing[5],
    marginBottom: tokens.spacing[4],
    borderWidth: 1,
    borderColor: tokens.colors.border.default,
  },

  sparklineTitle: {
    fontSize: tokens.typography.fontSize.lg,
    fontWeight: tokens.typography.fontWeight.semibold,
    color: tokens.colors.text.primary,
    marginBottom: tokens.spacing[4],
  },

  sparklinePlaceholder: {
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: tokens.colors.surfaceVariant,
    borderRadius: tokens.borderRadius.base,
  },

  placeholderText: {
    fontSize: 32,
    marginBottom: tokens.spacing[2],
  },

  placeholderLabel: {
    fontSize: tokens.typography.fontSize.base,
    fontWeight: tokens.typography.fontWeight.medium,
    color: tokens.colors.text.primary,
  },

  placeholderSubtext: {
    fontSize: tokens.typography.fontSize.xs,
    color: tokens.colors.text.tertiary,
    marginTop: tokens.spacing[1],
  },

  actionsContainer: {
    marginBottom: tokens.spacing[5],
  },

  sectionTitle: {
    fontSize: tokens.typography.fontSize.lg,
    fontWeight: tokens.typography.fontWeight.semibold,
    color: tokens.colors.text.primary,
    marginBottom: tokens.spacing[3],
  },

  buttonsRow: {
    flexDirection: 'row',
    gap: tokens.spacing[3],
  },

  actionButton: {
    flex: 1,
    paddingVertical: tokens.spacing[3],
    paddingHorizontal: tokens.spacing[4],
    borderRadius: tokens.borderRadius.base,
    alignItems: 'center',
    justifyContent: 'center',
  },

  buttonPrimary: {
    backgroundColor: tokens.colors.primary,
  },

  buttonSecondary: {
    backgroundColor: tokens.colors.surfaceVariant,
    borderWidth: 1,
    borderColor: tokens.colors.border.default,
  },

  buttonDanger: {
    backgroundColor: tokens.colors.error,
  },

  buttonDisabled: {
    backgroundColor: tokens.colors.surfaceVariant,
    opacity: 0.5,
  },

  actionButtonText: {
    fontSize: tokens.typography.fontSize.sm,
    fontWeight: tokens.typography.fontWeight.semibold,
  },

  statsContainer: {
    marginBottom: tokens.spacing[5],
  },

  miniStatsContainer: {
    flexDirection: 'row',
    gap: tokens.spacing[2],
  },

  miniStatBadge: {
    flex: 1,
  },

  refreshContainer: {
    marginTop: tokens.spacing[2],
  },
});