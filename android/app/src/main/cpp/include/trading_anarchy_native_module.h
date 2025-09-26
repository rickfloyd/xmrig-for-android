/*
 * =============================================
 * Trading Anarchy Android Compute Engine
 * Native Module - React Native Turbo Module Implementation
 * Copyright (c) 2025 Trading Anarchy. All rights reserved.
 * Version: 2025.1.0 - New Architecture Compatible
 * =============================================
 */

#pragma once

// Mock React Native headers for development IntelliSense
// These will be replaced with actual React Native headers during build
#include <jni.h>
#include <memory>
#include <string>

// Mock TurboModule interface for development
namespace facebook {
namespace react {
class TurboModule {
public:
    virtual ~TurboModule() = default;
};
class ReadableNativeMap {
public:
    virtual ~ReadableNativeMap() = default;
};
class WritableNativeMap {
public:
    virtual ~WritableNativeMap() = default;
};
} // namespace react
} // namespace facebook

#include "trading_anarchy_jni.h"

namespace TradingAnarchy {
namespace NativeModule {

/**
 * Professional React Native Turbo Module for Android Compute Engine
 * Compatible with React Native 0.76+ New Architecture
 */
class TradingAnarchyComputeEngineModule : public facebook::react::TurboModule {
private:
    static std::shared_ptr<TradingAnarchyComputeEngineModule> instance_;
    static std::mutex module_mutex_;
    
    // Enhanced callback management
    std::unordered_map<std::string, facebook::react::Promise> pending_promises_;
    std::mutex promises_mutex_;
    
    // Performance monitoring
    struct ModuleMetrics {
        std::atomic<uint64_t> method_calls{0};
        std::atomic<uint64_t> successful_operations{0};
        std::atomic<uint64_t> failed_operations{0};
        std::chrono::steady_clock::time_point start_time;
        
        ModuleMetrics() : start_time(std::chrono::steady_clock::now()) {}
    };
    
    mutable ModuleMetrics metrics_;

public:
    explicit TradingAnarchyComputeEngineModule(
        std::shared_ptr<facebook::react::CallInvoker> jsInvoker);
    
    virtual ~TradingAnarchyComputeEngineModule();

    /**
     * Professional Turbo Module interface methods
     */
    static facebook::react::jsi::Value getConstants(facebook::react::jsi::Runtime& rt);
    
    /**
     * Enhanced compute engine lifecycle management
     */
    void initializeEngine(
        facebook::react::jsi::Runtime& rt,
        const facebook::react::jsi::Value& config,
        facebook::react::Promise promise);
    
    void startEngine(
        facebook::react::jsi::Runtime& rt,
        facebook::react::Promise promise);
    
    void stopEngine(
        facebook::react::jsi::Runtime& rt,
        facebook::react::Promise promise);
    
    void pauseEngine(
        facebook::react::jsi::Runtime& rt,
        facebook::react::Promise promise);
    
    void resumeEngine(
        facebook::react::jsi::Runtime& rt,
        facebook::react::Promise promise);
    
    /**
     * Professional performance monitoring
     */
    facebook::react::jsi::Value getEngineStatus(facebook::react::jsi::Runtime& rt);
    
    facebook::react::jsi::Value getPerformanceMetrics(facebook::react::jsi::Runtime& rt);
    
    facebook::react::jsi::Value getSystemInfo(facebook::react::jsi::Runtime& rt);
    
    /**
     * Enhanced configuration management
     */
    void updateEngineConfig(
        facebook::react::jsi::Runtime& rt,
        const facebook::react::jsi::Value& config,
        facebook::react::Promise promise);
    
    facebook::react::jsi::Value getCurrentConfig(facebook::react::jsi::Runtime& rt);
    
    /**
     * Professional callback registration
     */
    void setStatusCallback(
        facebook::react::jsi::Runtime& rt,
        const facebook::react::jsi::Value& callback);
    
    void setPerformanceCallback(
        facebook::react::jsi::Runtime& rt,
        const facebook::react::jsi::Value& callback);
    
    void setErrorCallback(
        facebook::react::jsi::Runtime& rt,
        const facebook::react::jsi::Value& callback);
    
    /**
     * Enhanced security operations
     */
    void generateSecureKey(
        facebook::react::jsi::Runtime& rt,
        const facebook::react::jsi::Value& length,
        facebook::react::Promise promise);
    
    void deriveKey(
        facebook::react::jsi::Runtime& rt,
        const facebook::react::jsi::Value& password,
        const facebook::react::jsi::Value& salt,
        const facebook::react::jsi::Value& iterations,
        facebook::react::Promise promise);
    
    void computeHash(
        facebook::react::jsi::Runtime& rt,
        const facebook::react::jsi::Value& data,
        const facebook::react::jsi::Value& algorithm,
        facebook::react::Promise promise);
    
    /**
     * Professional diagnostic operations
     */
    void runDiagnostics(
        facebook::react::jsi::Runtime& rt,
        facebook::react::Promise promise);
    
    void exportLogs(
        facebook::react::jsi::Runtime& rt,
        const facebook::react::jsi::Value& level,
        facebook::react::Promise promise);
    
    void clearCache(
        facebook::react::jsi::Runtime& rt,
        facebook::react::Promise promise);
    
    /**
     * Enhanced module interface implementation
     */
    static std::shared_ptr<TradingAnarchyComputeEngineModule> getInstance(
        std::shared_ptr<facebook::react::CallInvoker> jsInvoker);
    
    static void cleanup();
    
    // Turbo Module interface
    static facebook::react::jsi::Value get(
        facebook::react::jsi::Runtime& rt,
        const facebook::react::jsi::PropNameID& propName);

private:
    /**
     * Professional utility methods
     */
    facebook::react::jsi::Value convertToJSI(
        facebook::react::jsi::Runtime& rt,
        const PerformanceMetrics& metrics) const;
    
    facebook::react::jsi::Value convertToJSI(
        facebook::react::jsi::Runtime& rt,
        const ComputeEngineStatus& status) const;
    
    void resolvePromise(
        const std::string& promiseId,
        const facebook::react::jsi::Value& result);
    
    void rejectPromise(
        const std::string& promiseId,
        const std::string& error,
        const std::string& message);
    
    std::string generatePromiseId() const;
    
    /**
     * Enhanced callback invocation
     */
    void invokeStatusCallback(const ComputeEngineStatus& status);
    void invokePerformanceCallback(const PerformanceMetrics& metrics);
    void invokeErrorCallback(const std::string& error, const std::string& message);
    
    // Professional callback storage
    facebook::react::jsi::Function status_callback_;
    facebook::react::jsi::Function performance_callback_;
    facebook::react::jsi::Function error_callback_;
    
    std::mutex callbacks_mutex_;
    std::shared_ptr<facebook::react::CallInvoker> js_invoker_;
    
    // Enhanced validation
    bool validateConfig(const facebook::react::jsi::Value& config) const;
    bool isInitialized() const;
    
    void updateMetrics(bool success);
};

} // namespace NativeModule
} // namespace TradingAnarchy