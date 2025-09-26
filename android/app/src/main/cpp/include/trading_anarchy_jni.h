/*
 * =============================================
 * Trading Anarchy Android Compute Engine
 * Professional JNI Bridge - Native Library Interface with 2025 Standards
 * Copyright (c) 2025 Trading Anarchy. All rights reserved.
 * Version: 2025.1.0 - Enhanced Performance, Security & Modern Architecture
 * =============================================
 */

#ifndef TRADING_ANARCHY_JNI_H
#define TRADING_ANARCHY_JNI_H

#include <jni.h>
#include <android/log.h>
#include <string>
#include <memory>
#include <atomic>
#include <mutex>
#include <thread>
#include <functional>

// Professional logging system with 2025 optimizations
#define TRADING_ANARCHY_LOG_TAG "TradingAnarchy"

#ifdef TRADING_ANARCHY_DEBUG
#define TA_LOGD(...) __android_log_print(ANDROID_LOG_DEBUG, TRADING_ANARCHY_LOG_TAG, __VA_ARGS__)
#define TA_LOGI(...) __android_log_print(ANDROID_LOG_INFO, TRADING_ANARCHY_LOG_TAG, __VA_ARGS__)
#define TA_LOGW(...) __android_log_print(ANDROID_LOG_WARN, TRADING_ANARCHY_LOG_TAG, __VA_ARGS__)
#define TA_LOGE(...) __android_log_print(ANDROID_LOG_ERROR, TRADING_ANARCHY_LOG_TAG, __VA_ARGS__)
#else
#define TA_LOGD(...) ((void)0)
#define TA_LOGI(...) ((void)0)
#define TA_LOGW(...) ((void)0)
#define TA_LOGE(...) __android_log_print(ANDROID_LOG_ERROR, TRADING_ANARCHY_LOG_TAG, __VA_ARGS__)
#endif

namespace TradingAnarchy {

/**
 * Professional compute engine status enumeration
 */
enum class ComputeEngineStatus : int32_t {
    STOPPED = 0,
    STARTING = 1,
    RUNNING = 2,
    PAUSED = 3,
    STOPPING = 4,
    ERROR = -1
};

/**
 * Enhanced performance metrics structure with 2025 standards
 */
struct PerformanceMetrics {
    double hashrate;
    double power_usage;
    double temperature;
    uint64_t accepted_shares;
    uint64_t rejected_shares;
    uint64_t total_hashes;
    uint32_t threads_active;
    std::chrono::steady_clock::time_point last_update;
};

/**
 * Professional security configuration with enhanced protection
 */
struct SecurityConfig {
    bool enable_secure_connection = true;
    bool validate_certificates = true;
    bool enable_encryption = true;
    std::string certificate_fingerprint;
    std::atomic<bool> security_enabled{true};
};

/**
 * Enhanced compute configuration structure
 */
struct ComputeConfig {
    std::string pool_url;
    std::string username;
    std::string password;
    uint32_t threads = 0;  // 0 = auto-detect
    uint32_t priority = 1;
    bool huge_pages = false;
    bool background_mode = true;
    SecurityConfig security;
};

/**
 * Professional JNI Bridge Class with 2025 Architecture
 */
class JNIBridge {
private:
    static std::unique_ptr<JNIBridge> instance_;
    static std::mutex instance_mutex_;
    
    JavaVM* jvm_;
    jobject java_callback_object_;
    jmethodID status_callback_method_;
    jmethodID performance_callback_method_;
    jmethodID error_callback_method_;
    
    std::atomic<ComputeEngineStatus> current_status_{ComputeEngineStatus::STOPPED};
    std::atomic<bool> shutdown_requested_{false};
    
    mutable std::mutex config_mutex_;
    mutable std::mutex performance_mutex_;
    
    ComputeConfig current_config_;
    PerformanceMetrics current_metrics_;
    
    std::unique_ptr<std::thread> compute_thread_;
    std::unique_ptr<std::thread> monitoring_thread_;
    
    // Professional callback system
    using StatusCallback = std::function<void(ComputeEngineStatus)>;
    using PerformanceCallback = std::function<void(const PerformanceMetrics&)>;
    using ErrorCallback = std::function<void(const std::string&)>;
    
    StatusCallback status_callback_;
    PerformanceCallback performance_callback_;
    ErrorCallback error_callback_;

public:
    /**
     * Enhanced singleton instance management with thread safety
     */
    static JNIBridge& getInstance();
    
    /**
     * Professional JNI environment initialization
     */
    bool initialize(JNIEnv* env, jobject callback_object);
    
    /**
     * Enhanced compute engine lifecycle management
     */
    bool startComputeEngine(const ComputeConfig& config);
    bool stopComputeEngine();
    bool pauseComputeEngine();
    bool resumeComputeEngine();
    
    /**
     * Professional configuration management
     */
    bool updateConfiguration(const ComputeConfig& config);
    ComputeConfig getCurrentConfiguration() const;
    
    /**
     * Enhanced performance monitoring
     */
    PerformanceMetrics getCurrentMetrics() const;
    bool enablePerformanceMonitoring(bool enabled);
    
    /**
     * Professional status management
     */
    ComputeEngineStatus getStatus() const;
    std::string getStatusString() const;
    
    /**
     * Enhanced security management
     */
    bool validateSecurityConfiguration(const SecurityConfig& config) const;
    bool enableSecureMode(bool enabled);
    
    /**
     * Professional error handling
     */
    void reportError(const std::string& error);
    std::string getLastError() const;
    
    /**
     * Enhanced callback management
     */
    void setStatusCallback(StatusCallback callback);
    void setPerformanceCallback(PerformanceCallback callback);
    void setErrorCallback(ErrorCallback callback);
    
    /**
     * Professional resource cleanup
     */
    void cleanup();
    
    /**
     * Enhanced thread management
     */
    bool isComputeThreadRunning() const;
    bool isMonitoringThreadRunning() const;
    
    /**
     * Professional native library integration
     */
    bool loadNativeLibraries();
    std::string getNativeLibraryVersion() const;
    
    // Prevent copy construction and assignment
    JNIBridge(const JNIBridge&) = delete;
    JNIBridge& operator=(const JNIBridge&) = delete;

private:
    JNIBridge() = default;
    ~JNIBridge();
    
    /**
     * Enhanced internal compute engine implementation
     */
    void computeEngineWorker();
    void performanceMonitorWorker();
    
    /**
     * Professional Java callback invocation
     */
    void invokeStatusCallback(ComputeEngineStatus status);
    void invokePerformanceCallback(const PerformanceMetrics& metrics);
    void invokeErrorCallback(const std::string& error);
    
    /**
     * Enhanced utility functions
     */
    JNIEnv* getJNIEnvironment() const;
    void releaseJNIEnvironment(JNIEnv* env) const;
    
    /**
     * Professional security validation
     */
    bool validatePoolConnection(const std::string& url) const;
    bool validateCredentials(const std::string& username, const std::string& password) const;
};

} // namespace TradingAnarchy

// Professional C-style JNI function declarations for Android runtime
extern "C" {

/**
 * Enhanced JNI library initialization
 */
JNIEXPORT jint JNICALL JNI_OnLoad(JavaVM* vm, void* reserved);
JNIEXPORT void JNICALL JNI_OnUnload(JavaVM* vm, void* reserved);

/**
 * Professional compute engine lifecycle methods
 */
JNIEXPORT jboolean JNICALL
Java_com_tradinganarchy_computeengine_ComputeEngine_nativeInitialize(
    JNIEnv* env, jobject thiz, jobject callback);

JNIEXPORT jboolean JNICALL
Java_com_tradinganarchy_computeengine_ComputeEngine_nativeStart(
    JNIEnv* env, jobject thiz, jstring poolUrl, jstring username, 
    jstring password, jint threads, jint priority);

JNIEXPORT jboolean JNICALL
Java_com_tradinganarchy_computeengine_ComputeEngine_nativeStop(
    JNIEnv* env, jobject thiz);

JNIEXPORT jboolean JNICALL
Java_com_tradinganarchy_computeengine_ComputeEngine_nativePause(
    JNIEnv* env, jobject thiz);

JNIEXPORT jboolean JNICALL
Java_com_tradinganarchy_computeengine_ComputeEngine_nativeResume(
    JNIEnv* env, jobject thiz);

/**
 * Enhanced status and performance monitoring
 */
JNIEXPORT jint JNICALL
Java_com_tradinganarchy_computeengine_ComputeEngine_nativeGetStatus(
    JNIEnv* env, jobject thiz);

JNIEXPORT jstring JNICALL
Java_com_tradinganarchy_computeengine_ComputeEngine_nativeGetStatusString(
    JNIEnv* env, jobject thiz);

JNIEXPORT jobject JNICALL
Java_com_tradinganarchy_computeengine_ComputeEngine_nativeGetMetrics(
    JNIEnv* env, jobject thiz);

/**
 * Professional configuration management
 */
JNIEXPORT jboolean JNICALL
Java_com_tradinganarchy_computeengine_ComputeEngine_nativeUpdateConfig(
    JNIEnv* env, jobject thiz, jobject config);

JNIEXPORT jobject JNICALL
Java_com_tradinganarchy_computeengine_ComputeEngine_nativeGetConfig(
    JNIEnv* env, jobject thiz);

/**
 * Enhanced security and validation
 */
JNIEXPORT jboolean JNICALL
Java_com_tradinganarchy_computeengine_ComputeEngine_nativeValidateConfig(
    JNIEnv* env, jobject thiz, jobject config);

JNIEXPORT jstring JNICALL
Java_com_tradinganarchy_computeengine_ComputeEngine_nativeGetVersion(
    JNIEnv* env, jobject thiz);

/**
 * Professional cleanup and resource management
 */
JNIEXPORT void JNICALL
Java_com_tradinganarchy_computeengine_ComputeEngine_nativeCleanup(
    JNIEnv* env, jobject thiz);

} // extern "C"

#endif // TRADING_ANARCHY_JNI_H