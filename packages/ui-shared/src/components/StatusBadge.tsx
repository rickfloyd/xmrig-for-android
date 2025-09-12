import React from 'react';
import { tokens } from '../tokens';

export interface StatusBadgeProps {
  status: 'success' | 'warning' | 'error' | 'info' | 'neutral';
  label: string;
  value?: string | number;
  size?: 'small' | 'medium' | 'large';
  style?: any;
}

/**
 * StatusBadge component for displaying miner status, thermal levels, etc.
 * Web-compatible version using CSS-in-JS for cross-platform support
 */
export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  label,
  value,
  size = 'medium',
  style,
}) => {
  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return tokens.colors.success;
      case 'warning':
        return tokens.colors.warning;
      case 'error':
        return tokens.colors.error;
      case 'info':
        return tokens.colors.info;
      case 'neutral':
      default:
        return tokens.colors.text.secondary;
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          container: { ...styles.containerSmall },
          text: { ...styles.textSmall },
        };
      case 'large':
        return {
          container: { ...styles.containerLarge },
          text: { ...styles.textLarge },
        };
      case 'medium':
      default:
        return {
          container: { ...styles.containerMedium },
          text: { ...styles.textMedium },
        };
    }
  };

  const statusColor = getStatusColor();
  const sizeStyles = getSizeStyles();

  const containerStyle = {
    ...styles.container,
    ...sizeStyles.container,
    borderColor: statusColor,
    ...style,
  };

  const indicatorStyle = {
    ...styles.indicator,
    backgroundColor: statusColor,
  };

  const valueStyle = {
    ...styles.value,
    ...sizeStyles.text,
    color: statusColor,
  };

  return (
    <div style={containerStyle}>
      <div style={indicatorStyle} />
      <div style={styles.content}>
        <span style={{ ...styles.label, ...sizeStyles.text }}>
          {label}
        </span>
        {value !== undefined && (
          <span style={valueStyle}>
            {value}
          </span>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'row' as const,
    alignItems: 'center',
    backgroundColor: tokens.colors.surface,
    borderWidth: 1,
    borderStyle: 'solid' as const,
    borderRadius: tokens.borderRadius.base,
    paddingLeft: tokens.spacing[3],
    paddingRight: tokens.spacing[3],
    paddingTop: tokens.spacing[2],
    paddingBottom: tokens.spacing[2],
  },
  
  containerSmall: {
    paddingLeft: tokens.spacing[2],
    paddingRight: tokens.spacing[2],
    paddingTop: tokens.spacing[1],
    paddingBottom: tokens.spacing[1],
  },
  
  containerMedium: {
    paddingLeft: tokens.spacing[3],
    paddingRight: tokens.spacing[3],
    paddingTop: tokens.spacing[2],
    paddingBottom: tokens.spacing[2],
  },
  
  containerLarge: {
    paddingLeft: tokens.spacing[4],
    paddingRight: tokens.spacing[4],
    paddingTop: tokens.spacing[3],
    paddingBottom: tokens.spacing[3],
  },
  
  indicator: {
    width: tokens.spacing[2],
    height: tokens.spacing[2],
    borderRadius: tokens.borderRadius.full,
    marginRight: tokens.spacing[2],
  },
  
  content: {
    flex: 1,
    display: 'flex',
    flexDirection: 'row' as const,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  label: {
    color: tokens.colors.text.primary,
    fontWeight: tokens.typography.fontWeight.medium,
  },
  
  value: {
    fontWeight: tokens.typography.fontWeight.semibold,
  },
  
  textSmall: {
    fontSize: tokens.typography.fontSize.xs,
  },
  
  textMedium: {
    fontSize: tokens.typography.fontSize.sm,
  },
  
  textLarge: {
    fontSize: tokens.typography.fontSize.base,
  },
};