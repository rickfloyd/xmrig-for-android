# Charity Mode Architecture

**Phase 1 Status:** Foundation and Integration Points  
**Implementation Target:** Phase 2-3 Full Feature Development

## Overview

The charity mode architecture enables users to dedicate a portion of their mining power to charitable causes while maintaining transparency and user control. This document outlines the design for integrating charity mining with the existing donation system.

## Architecture Goals

### 1. User Choice and Transparency
- Clear display of charity allocation in notifications and UI
- User-controlled percentage splits between personal and charity mining
- Transparent reporting of contributions and impact

### 2. Seamless Integration
- Builds upon existing donation infrastructure
- Minimal impact on mining performance
- Compatible with all mining modes and backends

### 3. Extensibility
- Support for multiple charity organizations
- Flexible allocation algorithms
- Integration with external charity tracking systems

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    User Interface Layer                     │
├─────────────────────────────────────────────────────────────┤
│  Charity Settings  │  Impact Dashboard  │  Allocation View  │
└─────────────────────┬───────────────────┬─────────────────┘
                      │                   │
┌─────────────────────┴───────────────────┴─────────────────┐
│                 Charity Management Layer                   │
├─────────────────────────────────────────────────────────────┤
│  Allocation Engine  │  Impact Tracker  │  Reporting System │
└─────────────────────┬───────────────────┬─────────────────┘
                      │                   │
┌─────────────────────┴───────────────────┴─────────────────┐
│                   Mining Integration                       │
├─────────────────────────────────────────────────────────────┤
│  Time-based Split  │  Pool Management  │  Statistics Agg   │
└─────────────────────┬───────────────────┬─────────────────┘
                      │                   │
┌─────────────────────┴───────────────────┴─────────────────┐
│              Existing XMRig Infrastructure                 │
└─────────────────────────────────────────────────────────────┘
```

## Phase 1 Implementation (Current)

### Notification Integration

The current implementation includes placeholder charity display in the notification system:

```java
// In MiningService.java
private String getDonationDisplayText() {
    // TODO PHASE2: Integrate with React Native settings context
    int donationPercent = 5; // Placeholder - should come from settings
    
    if (donationPercent > 0) {
        return "Charity " + donationPercent + "%";
    }
    
    return "";
}
```

### Settings Foundation

The settings interface supports the charity percentage:

```typescript
// In settings.interface.tsx
export interface ISettings {
    // ... existing properties
    donation: number; // Current donation percentage
    // TODO PHASE2: Add charity-specific settings
}
```

## Phase 2 Implementation Plan

### Charity Configuration Interface

```typescript
export interface ICharitySettings {
    enabled: boolean;
    selectedCharity: string;
    allocationPercentage: number; // 0-100% of total mining time
    displayInNotification: boolean;
    trackingEnabled: boolean;
    reportingInterval: 'daily' | 'weekly' | 'monthly';
}

export interface ICharityOrganization {
    id: string;
    name: string;
    description: string;
    walletAddress: string;
    poolConfiguration: {
        url: string;
        port: number;
        tls: boolean;
    };
    website: string;
    impactMetrics: {
        currency: string;
        conversionRate: number; // XMR to impact unit
        impactUnit: string; // e.g., "meals", "vaccines", "trees"
    };
}
```

### Allocation Strategies

#### 1. Time-Based Allocation
Mining alternates between personal and charity pools based on percentage allocation.

```typescript
class TimeBasedAllocation {
    private charityPercentage: number;
    private personalTime: number = 0;
    private charityTime: number = 0;
    
    getCurrentTarget(): 'personal' | 'charity' {
        const totalTime = this.personalTime + this.charityTime;
        const charityRatio = this.charityTime / totalTime;
        const targetRatio = this.charityPercentage / 100;
        
        return charityRatio < targetRatio ? 'charity' : 'personal';
    }
}
```

#### 2. Hash-Based Allocation
Dedicates specific mining threads or hash power to charity.

```typescript
class HashBasedAllocation {
    private totalThreads: number;
    private charityThreads: number;
    
    calculateAllocation(charityPercentage: number): {
        personalThreads: number;
        charityThreads: number;
    } {
        const charityCount = Math.floor(this.totalThreads * charityPercentage / 100);
        return {
            personalThreads: this.totalThreads - charityCount,
            charityThreads: charityCount
        };
    }
}
```

## Mining Integration Architecture

### Pool Management

```typescript
class CharityPoolManager {
    private personalPools: PoolConfig[];
    private charityPools: PoolConfig[];
    private currentTarget: 'personal' | 'charity';
    
    async switchTarget(target: 'personal' | 'charity'): Promise<void> {
        if (this.currentTarget === target) return;
        
        const targetPools = target === 'charity' 
            ? this.charityPools 
            : this.personalPools;
            
        // Graceful transition between pools
        await this.miner.updatePools(targetPools);
        this.currentTarget = target;
    }
}
```

### Statistics Tracking

```typescript
interface CharityMiningStats {
    personalStats: {
        hashrate: number;
        shares: number;
        uptime: number;
        estimated_earnings: number;
    };
    charityStats: {
        hashrate: number;
        shares: number;
        uptime: number;
        estimated_donation: number;
        impact_estimate: {
            value: number;
            unit: string;
        };
    };
    allocation: {
        target_percentage: number;
        actual_percentage: number;
        efficiency: number;
    };
}
```

## User Interface Design

### Settings Screen Integration

```tsx
const CharitySettingsCard: React.FC = () => {
    const { settings, updateSettings } = useSettings();
    
    return (
        <Card>
            <CardHeader>
                <Text>Charity Mining</Text>
                <Switch 
                    value={settings.charity.enabled}
                    onValueChange={(enabled) => 
                        updateSettings({
                            charity: { ...settings.charity, enabled }
                        })
                    }
                />
            </CardHeader>
            
            {settings.charity.enabled && (
                <CardContent>
                    <CharitySelector 
                        selected={settings.charity.selectedCharity}
                        onChange={(charity) => 
                            updateSettings({
                                charity: { ...settings.charity, selectedCharity: charity }
                            })
                        }
                    />
                    
                    <AllocationSlider
                        value={settings.charity.allocationPercentage}
                        onChange={(percentage) =>
                            updateSettings({
                                charity: { ...settings.charity, allocationPercentage: percentage }
                            })
                        }
                    />
                </CardContent>
            )}
        </Card>
    );
};
```

### Impact Dashboard

```tsx
const CharityImpactDashboard: React.FC = () => {
    const { charityStats } = useCharityStats();
    
    return (
        <View>
            <Text>Your Charity Impact</Text>
            
            <MetricCard
                title="Total Contribution"
                value={`${charityStats.estimated_donation} XMR`}
                subtitle="This month"
            />
            
            <MetricCard
                title="Impact Generated"
                value={`${charityStats.impact_estimate.value} ${charityStats.impact_estimate.unit}`}
                subtitle="Estimated impact"
            />
            
            <AllocationChart
                personal={charityStats.personalStats.uptime}
                charity={charityStats.charityStats.uptime}
            />
        </View>
    );
};
```

## Notification Enhancement

### Dynamic Content Based on Mode

```java
private String getCharityDisplayText() {
    CharitySettings charitySettings = getCharitySettings(); // TODO: Implement
    
    if (!charitySettings.enabled || charitySettings.allocationPercentage == 0) {
        return "";
    }
    
    String currentMode = getCurrentMiningMode(); // personal/charity
    String percentage = String.valueOf(charitySettings.allocationPercentage);
    
    if ("charity".equals(currentMode)) {
        return "Mining for " + charitySettings.selectedCharityName + " (" + percentage + "%)";
    } else {
        return "Charity " + percentage + "% (" + charitySettings.selectedCharityName + ")";
    }
}
```

## Backend Integration

### Charity Organization Registry

```typescript
class CharityRegistry {
    private static readonly BUILT_IN_CHARITIES: ICharityOrganization[] = [
        {
            id: 'doctors-without-borders',
            name: 'Doctors Without Borders',
            description: 'Medical humanitarian aid worldwide',
            walletAddress: 'charity-wallet-address-here',
            poolConfiguration: {
                url: 'charity.pool.com',
                port: 4444,
                tls: true
            },
            website: 'https://doctorswithoutborders.org',
            impactMetrics: {
                currency: 'XMR',
                conversionRate: 0.1, // 0.1 XMR = 1 meal
                impactUnit: 'meals'
            }
        },
        // Additional charities...
    ];
    
    async getAvailableCharities(): Promise<ICharityOrganization[]> {
        // TODO PHASE3: Add remote charity registry support
        return CharityRegistry.BUILT_IN_CHARITIES;
    }
}
```

### Impact Calculation Engine

```typescript
class ImpactCalculator {
    calculateImpact(
        donation: number, 
        charity: ICharityOrganization
    ): { value: number; unit: string } {
        const impactValue = donation / charity.impactMetrics.conversionRate;
        return {
            value: Math.floor(impactValue * 100) / 100, // Round to 2 decimals
            unit: charity.impactMetrics.impactUnit
        };
    }
    
    async getRealtimeImpact(charityId: string): Promise<number> {
        // TODO PHASE3: Integrate with charity APIs for real-time impact data
        return 0;
    }
}
```

## Security and Trust

### Wallet Verification

```typescript
class CharityVerification {
    async verifyCharityWallet(charity: ICharityOrganization): Promise<boolean> {
        // Verify wallet address belongs to legitimate charity
        // Check against known charity addresses
        // Validate through blockchain explorer APIs
        return true; // TODO: Implement verification logic
    }
    
    async validatePoolConfiguration(pool: PoolConfig): Promise<boolean> {
        // Ensure pool is legitimate and operational
        // Check for proper TLS certificates
        // Validate pool operator reputation
        return true; // TODO: Implement validation logic
    }
}
```

### Transparency Features

```typescript
interface CharityTransparencyReport {
    period: {
        start: Date;
        end: Date;
    };
    contributions: {
        total_xmr: number;
        total_usd_equivalent: number;
        transaction_hashes: string[];
    };
    impact: {
        calculated_impact: number;
        impact_unit: string;
        verification_status: 'verified' | 'estimated' | 'pending';
    };
    charity_confirmation?: {
        received_amount: number;
        receipt_url: string;
        confirmation_date: Date;
    };
}
```

## Performance Considerations

### Mining Efficiency

1. **Pool Switching Overhead**: Minimize disruption during charity/personal transitions
2. **Connection Management**: Maintain warm connections to both pool types
3. **Statistics Accuracy**: Ensure accurate allocation tracking without performance impact

### Resource Usage

1. **Memory**: Lightweight charity tracking with minimal additional memory
2. **CPU**: Efficient allocation algorithms with sub-1% CPU overhead
3. **Network**: Batch charity verification requests to minimize data usage

## Privacy Considerations

### User Privacy
- Optional charity participation with full user control
- Local storage of charity preferences
- No external tracking without explicit user consent

### Charity Privacy
- Support for anonymous donations
- Optional donation attribution
- Respect for charity privacy policies

## Phase 3 Enhancements

### Advanced Features
- Multi-charity allocation (split between multiple charities)
- Dynamic allocation based on external factors
- Integration with charity APIs for real-time impact
- Social features (sharing impact with friends)

### External Integrations
- Charity verification through third-party services
- Impact tracking through charity APIs
- Tax reporting integration for applicable jurisdictions
- Donation receipt generation

## Phase 4 Cloud Integration

### Centralized Coordination
- Global charity impact tracking
- Coordinated charity mining campaigns
- Community-driven charity selection
- Cross-device charity contribution aggregation

## Implementation Roadmap

### Phase 1 (Current)
- ✅ Notification placeholder integration
- ✅ Settings foundation
- ✅ Architecture documentation

### Phase 2 (Next Release)
- [ ] Charity settings UI implementation
- [ ] Time-based allocation engine
- [ ] Basic charity organization registry
- [ ] Enhanced notification display

### Phase 3 (Future)
- [ ] Impact calculation and dashboard
- [ ] Multiple charity support
- [ ] External verification systems
- [ ] Advanced allocation strategies

### Phase 4 (Long-term)
- [ ] Cloud-based charity coordination
- [ ] Real-time impact tracking
- [ ] Community features
- [ ] Tax reporting integration

## Testing Strategy

### Unit Testing
- Allocation algorithm accuracy
- Impact calculation correctness
- Pool switching reliability
- Statistics tracking precision

### Integration Testing
- End-to-end charity mining flows
- UI component integration
- Notification system integration
- Settings persistence testing

### Performance Testing
- Pool switching performance impact
- Memory usage with charity features
- Battery impact assessment
- Long-term allocation accuracy

## Compliance and Legal

### Regulatory Considerations
- Compliance with local donation regulations
- Tax implications for users
- Anti-money laundering considerations
- Cross-border donation restrictions

### Documentation Requirements
- Clear terms of service for charity features
- Privacy policy updates for charity data
- Donation receipt generation capabilities
- Audit trail maintenance

## TODO Items

- **PHASE2**: Implement charity settings UI components
- **PHASE2**: Create time-based allocation engine
- **PHASE2**: Build charity organization registry
- **PHASE2**: Enhance notification display with charity info
- **PHASE3**: Develop impact calculation dashboard
- **PHASE3**: Add external charity verification
- **PHASE3**: Implement advanced allocation strategies
- **PHASE4**: Build cloud-based charity coordination
- **PHASE4**: Add real-time impact tracking APIs

## Related Documentation

- `/docs/architecture.md` - Overall system architecture
- `/docs/config-schema.md` - Configuration schema documentation
- `/packages/core-miner/README.md` - Core mining interfaces

## Community Involvement

The charity mode implementation should involve:
- Community input on charity selection criteria
- Feedback from charity organizations
- User testing for UI/UX optimization
- External security audits for trust verification

This architecture provides a foundation for meaningful charitable impact while maintaining the core mining functionality and user experience of XMRig for Android.