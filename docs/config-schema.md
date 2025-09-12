# Configuration Schema Documentation

**Schema Version:** 1.0.0  
**Schema File:** `/schemas/miner.config.schema.json`

## Overview

The XMRig for Android configuration schema provides structured validation and documentation for all mining configuration options. The schema ensures consistency, prevents configuration errors, and enables intelligent defaults.

## Schema Design Principles

### 1. Backward Compatibility
- Incremental schema versioning
- Graceful handling of unknown properties
- Migration paths for configuration updates

### 2. Validation First
- Strong typing for all configuration values
- Range validation for numeric properties
- Format validation for URLs and addresses

### 3. Documentation Embedded
- Comprehensive descriptions for all properties
- Default values clearly specified
- Usage examples and recommendations

## Schema Structure

### Top-Level Properties

```json
{
  "version": "1.0.0",
  "api": { ... },
  "pools": [ ... ],
  "cpu": { ... },
  "donate-level": 5,
  "print-time": 60,
  "randomx": { ... },
  "log-level": 1,
  "background": false,
  "title": "XMRig for Android",
  "user-agent": "XMRig for Android/1.0"
}
```

## Detailed Property Reference

### API Configuration

Controls the HTTP API server for monitoring and control.

```json
{
  "api": {
    "enabled": true,
    "host": "127.0.0.1",
    "port": 50080,
    "access-token": "XMRigForAndroid"
  }
}
```

**Properties:**
- `enabled` (boolean): Enable HTTP API server
- `host` (string): Bind address for API server
- `port` (integer): Port number (1-65535)
- `access-token` (string): Bearer token for authentication

**Security Note:** The API should only bind to localhost for security.

### Pool Configuration

Defines mining pool connections with failover support.

```json
{
  "pools": [
    {
      "url": "pool.monero.com:4444",
      "user": "wallet-address-or-username",
      "pass": "worker-name",
      "rig-id": "android-device-01",
      "tls": false
    }
  ]
}
```

**Properties:**
- `url` (string, required): Pool URL in format `hostname:port`
- `user` (string, required): Wallet address or pool username
- `pass` (string): Pool password or worker identifier (default: "x")
- `rig-id` (string): Unique identifier for this mining rig
- `tls` (boolean): Enable TLS/SSL connection (default: false)

**Multiple Pools:** Configure multiple pools for automatic failover.

### CPU Mining Configuration

Controls CPU mining behavior and performance tuning.

```json
{
  "cpu": {
    "enabled": true,
    "threads": 4,
    "max-threads-hint": 75,
    "priority": 2,
    "yield": true
  }
}
```

**Properties:**
- `enabled` (boolean): Enable CPU mining
- `threads` (integer): Specific number of mining threads
- `max-threads-hint` (integer): Percentage of available CPU threads (1-100)
- `priority` (integer): Thread priority level (0-5)
- `yield` (boolean): Yield CPU time to other processes

**Performance Notes:**
- Use `max-threads-hint` for automatic thread count
- Lower priority reduces system impact
- Enable `yield` for better device responsiveness

### Donation Configuration

Controls the built-in donation mining to XMRig developers.

```json
{
  "donate-level": 5
}
```

**Properties:**
- `donate-level` (integer): Donation percentage (1-25%)

**Charity Integration:** The donation level is displayed in notifications and can be integrated with charity mining modes in future phases.

### Print Time Configuration

Controls mining statistics reporting frequency.

```json
{
  "print-time": 60
}
```

**Properties:**
- `print-time` (integer): Report interval in seconds (10-3600)

**Impact:** Lower values provide more frequent updates but increase CPU overhead.

### RandomX Algorithm Configuration

Specific settings for RandomX mining algorithm.

```json
{
  "randomx": {
    "mode": "light",
    "init": -1
  }
}
```

**Properties:**
- `mode` (enum): RandomX mode - "auto", "fast", "light"
- `init` (integer): Dataset initialization threads (-1 for auto)

**Mode Selection:**
- `auto`: Automatic mode selection
- `fast`: High memory usage, better performance
- `light`: Low memory usage, suitable for mobile devices

### Logging Configuration

Controls application logging verbosity.

```json
{
  "log-level": 1
}
```

**Properties:**
- `log-level` (integer): Verbosity level (0-5)
  - 0: Emergency only
  - 1: Errors and warnings
  - 2: Informational messages
  - 3: Debug information
  - 4: Verbose debugging
  - 5: Trace level debugging

### Background Mining

Controls background operation behavior.

```json
{
  "background": false
}
```

**Properties:**
- `background` (boolean): Allow background mining when app is not visible

**Integration:** This setting works with the `allowBackgroundMining` user preference.

### Process Identification

Customize process identification for monitoring.

```json
{
  "title": "XMRig for Android",
  "user-agent": "XMRig for Android/1.0"
}
```

**Properties:**
- `title` (string): Process title for system monitoring
- `user-agent` (string): HTTP User-Agent for pool connections

## Schema Versioning Strategy

### Version Format
- Semantic versioning: `MAJOR.MINOR.PATCH`
- Schema version stored in `$schemaVersion` property
- Configuration version in `version` property

### Migration Strategy

1. **Major Version**: Breaking changes requiring migration
2. **Minor Version**: New optional properties
3. **Patch Version**: Documentation or validation updates

### Validation Process

1. **Schema Validation**: JSON Schema validation against current schema
2. **Migration Check**: Compare configuration version with current
3. **Default Application**: Apply defaults for missing properties
4. **Upgrade Path**: Automatic migration for compatible versions

## Integration with React Native

### Settings Context Integration

```typescript
interface ISettings {
  // ... existing properties
  minerConfig?: MinerConfig; // JSON schema validated
}
```

### Validation in Code

```typescript
import Ajv from 'ajv';
import schema from '../schemas/miner.config.schema.json';

const ajv = new Ajv();
const validate = ajv.compile(schema);

function validateConfig(config: any): boolean {
  const valid = validate(config);
  if (!valid) {
    console.error('Configuration validation errors:', validate.errors);
  }
  return valid;
}
```

## Example Configurations

### Minimal Configuration

```json
{
  "pools": [
    {
      "url": "pool.example.com:4444",
      "user": "your-wallet-address"
    }
  ]
}
```

### Performance Optimized

```json
{
  "pools": [
    {
      "url": "pool.example.com:4444",
      "user": "your-wallet-address",
      "tls": true
    }
  ],
  "cpu": {
    "max-threads-hint": 50,
    "priority": 1,
    "yield": true
  },
  "randomx": {
    "mode": "light"
  },
  "print-time": 30,
  "log-level": 1
}
```

### Development Configuration

```json
{
  "pools": [
    {
      "url": "testnet.pool.com:4444",
      "user": "test-wallet"
    }
  ],
  "api": {
    "enabled": true,
    "port": 50080,
    "access-token": "dev-token"
  },
  "print-time": 10,
  "log-level": 3
}
```

## Future Schema Enhancements

### Phase 2 Additions
- GPU mining configuration
- Advanced pool management
- Performance monitoring settings

### Phase 3 Additions
- Policy engine configuration
- Thermal management settings
- Power optimization options

### Phase 4 Additions
- Remote management configuration
- Cloud integration settings
- Multi-device coordination

## Validation Tools

### Command Line Validation

```bash
# Using ajv-cli
npm install -g ajv-cli
ajv validate -s schemas/miner.config.schema.json -d config.json
```

### Integration Testing

```typescript
describe('Configuration Schema', () => {
  it('should validate minimal configuration', () => {
    const config = {
      pools: [{ url: 'pool.com:4444', user: 'wallet' }]
    };
    expect(validateConfig(config)).toBe(true);
  });

  it('should reject invalid donation level', () => {
    const config = {
      pools: [{ url: 'pool.com:4444', user: 'wallet' }],
      'donate-level': 50 // Invalid: exceeds maximum of 25
    };
    expect(validateConfig(config)).toBe(false);
  });
});
```

## Error Handling

### Validation Errors
- Clear error messages with property paths
- Suggested corrections for common mistakes
- Fallback to defaults for non-critical errors

### Schema Migration
- Automatic backup of original configuration
- Step-by-step migration logging
- Rollback capability for failed migrations

## Security Considerations

### Sensitive Information
- Pool passwords should be handled securely
- API tokens require proper storage
- Configuration files should have restricted permissions

### Input Validation
- All external input validated against schema
- Protection against injection attacks
- Sanitization of user-provided values

## Performance Impact

### Validation Cost
- Schema validation performed once at startup
- Cached validation results for repeated checks
- Minimal runtime overhead

### Memory Usage
- Schema loaded once and reused
- Efficient JSON parsing and validation
- Garbage collection friendly patterns

## TODO Items

- **PHASE2**: Add GPU mining configuration schema
- **PHASE2**: Implement configuration migration utilities
- **PHASE3**: Add policy engine configuration options
- **PHASE3**: Enhance validation error reporting
- **PHASE4**: Add remote management schema extensions
- **PHASE5**: Implement configuration encryption support

## Related Documentation

- `/docs/architecture.md` - Overall system architecture
- `/packages/core-miner/README.md` - Core mining interfaces
- `/docs/charity-mode-architecture.md` - Donation system design

## Schema File Location

The complete JSON schema is available at:
`/schemas/miner.config.schema.json`

This schema is the authoritative source for configuration validation and should be updated whenever new configuration options are added.