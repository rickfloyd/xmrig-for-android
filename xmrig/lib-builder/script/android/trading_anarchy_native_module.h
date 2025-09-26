/**
 * Trading Anarchy Native Module Interface
 * 2025 Professional React Native Integration  
 * Modern C++23 with comprehensive Android support
 */

#ifndef TRADING_ANARCHY_NATIVE_MODULE_H
#define TRADING_ANARCHY_NATIVE_MODULE_H

// Use comprehensive system mocks for development IntelliSense
#include "system_mock.h"
#include "log.h"

#ifdef __cplusplus
// 2025 Modern C++23 Implementation
namespace TradingAnarchy {

/**
 * Professional React Native TurboModule Implementation
 * Provides seamless JavaScript ↔ C++ bridge for mining operations
 */
class NativeModule : public facebook::react::TurboModule {
private:
    std::shared_ptr<facebook::react::ReactApplicationContext> context_;
    
public:
    explicit NativeModule(std::shared_ptr<facebook::react::ReactApplicationContext> context);
    virtual ~NativeModule() = default;
    
    // TurboModule interface implementation
    facebook::jsi::Value invoke(
        facebook::jsi::Runtime& runtime,
        const std::string& methodName,
        const facebook::jsi::Value* args,
        size_t count) override;
    
    // Mining operations
    bool startMining(const std::string& poolUrl, const std::string& walletAddress);
    void stopMining();
    bool isMining() const;
    
    // Performance monitoring
    double getHashrate() const;
    uint64_t getAcceptedShares() const;
    uint64_t getRejectedShares() const;
    
    // Device information
    std::string getDeviceInfo() const;
    int getCpuCores() const;
    
    // Secure wallet operations
    std::string getSecureWallet() const;
    bool validateWallet(const std::string& wallet) const;
    bool configureSecureMining(const std::string& userWallet, double donationPercentage);
    
    // Configuration management
    bool setThreads(int threadCount);
    bool setIntensity(int intensity);
    
    // Security features
    std::string getSecurityToken() const;
    bool validateConfig(const std::string& configJson) const;
};

/**
 * Module Factory for React Native Integration
 */
class NativeModuleFactory {
public:
    static std::shared_ptr<NativeModule> create(
        std::shared_ptr<facebook::react::ReactApplicationContext> context);
};

} // namespace TradingAnarchy

// C interface for React Native registration
extern "C" {
    
// Module registration functions
void registerTradingAnarchyModule();
void unregisterTradingAnarchyModule();

} // extern "C"

#endif // __cplusplus

#endif // TRADING_ANARCHY_NATIVE_MODULE_H