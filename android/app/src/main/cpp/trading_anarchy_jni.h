/**
 * Trading Anarchy Android Compute Engine - JNI Bridge Header
 * 2025 Professional Version with Enhanced Development Support
 * 
 * This header provides the complete JNI interface for the Trading Anarchy
 * Android Compute Engine, enabling seamless communication between
 * React Native and native C++ mining functionality.
 */

#ifndef TRADING_ANARCHY_JNI_H
#define TRADING_ANARCHY_JNI_H

#include <jni.h>
#include <string>
#include <vector>
#include <memory>
#include <mutex>
#include <atomic>
#include <unordered_map>
#include <thread>
#include <functional>

// Android logging for development
#ifdef ANDROID
#include <android/log.h>
#define LOGI(...) __android_log_print(ANDROID_LOG_INFO, "TradingAnarchy", __VA_ARGS__)
#define LOGW(...) __android_log_print(ANDROID_LOG_WARN, "TradingAnarchy", __VA_ARGS__)
#define LOGE(...) __android_log_print(ANDROID_LOG_ERROR, "TradingAnarchy", __VA_ARGS__)
#else
#define LOGI(...) printf("INFO: " __VA_ARGS__); printf("\n")
#define LOGW(...) printf("WARN: " __VA_ARGS__); printf("\n")
#define LOGE(...) printf("ERROR: " __VA_ARGS__); printf("\n")
#endif

namespace TradingAnarchy {

// Forward declarations
class MiningEngine;
class ConfigurationManager;
class PerformanceMonitor;
class SecurityManager;

/**
 * Mining configuration structure
 */
struct MiningConfig {
    std::string poolUrl;
    std::string walletAddress;
    std::string workerName;
    std::string algorithm;
    int threads = 0;
    int cpuUsage = 80;
    bool hardwareAcceleration = true;
    bool tlsEnabled = false;
    std::string tlsFingerprint;
};

/**
 * Mining statistics structure
 */
struct MiningStats {
    double currentHashrate = 0.0;
    double averageHashrate = 0.0;
    double peakHashrate = 0.0;
    uint64_t totalHashes = 0;
    uint32_t validShares = 0;
    uint32_t invalidShares = 0;
    uint32_t rejectedShares = 0;
    uint64_t sessionDuration = 0;
    bool connected = false;
    double difficulty = 0.0;
    int latency = 0;
    double cpuTemperature = 0.0;
    int cpuUsage = 0;
    int memoryUsage = 0;
    int batteryLevel = 100;
    bool thermalThrottling = false;
};

/**
 * Device information structure
 */
struct DeviceInfo {
    std::string cpuBrand;
    std::string architecture;
    int cores = 0;
    int threads = 0;
    uint64_t l2Cache = 0;
    uint64_t l3Cache = 0;
    uint64_t totalMemory = 0;
    uint64_t availableMemory = 0;
    std::vector<std::string> cpuFeatures;
    std::vector<std::string> supportedAlgorithms;
    bool hugePagesSupport = false;
    bool aesNiSupport = false;
    bool avx2Support = false;
    std::string androidVersion;
    int apiLevel = 0;
    std::string manufacturer;
    std::string model;
};

/**
 * Main JNI Bridge Class
 * Handles all communication between Java/Kotlin and C++ code
 */
class JNIBridge {
public:
    static JNIBridge& getInstance();
    
    // Lifecycle management
    bool initialize(JNIEnv* env, jobject context);
    void cleanup();
    
    // Mining operations
    bool startMining(const MiningConfig& config);
    bool stopMining();
    bool pauseMining();
    bool resumeMining();
    MiningStats getMiningStats() const;
    bool updateConfiguration(const MiningConfig& config);
    
    // Device information
    DeviceInfo getDeviceInfo() const;
    std::vector<std::string> getSupportedAlgorithms() const;
    double benchmarkAlgorithm(const std::string& algorithm, int duration = 60);
    
    // Configuration management
    bool validateConfiguration(const MiningConfig& config) const;
    MiningConfig getOptimalConfiguration(const std::string& algorithm) const;
    bool saveConfiguration(const std::string& name, const MiningConfig& config);
    MiningConfig loadConfiguration(const std::string& name);
    std::vector<std::string> listConfigurations() const;
    
    // Event handling
    using EventCallback = std::function<void(const std::string&, const std::string&)>;
    void setEventCallback(EventCallback callback);
    void removeEventCallback();
    
    // Security features
    bool enableSecureMode(bool encryptTraffic, bool validateCerts, bool hideFromTaskManager);
    bool verifyIntegrity() const;
    std::string getSecurityFingerprint() const;
    
    // Performance monitoring
    void setThermalLimits(double maxTemp, double throttleTemp);
    void setBatteryLimits(int minBatteryLevel, bool pauseOnBattery);
    double getCurrentPowerUsage() const;
    
    // Logging and debugging
    std::vector<std::string> getLogs(int lines = 100) const;
    void setLogLevel(const std::string& level);
    bool exportStats(const std::string& format, const std::string& filepath);

private:
    JNIBridge() = default;
    ~JNIBridge() = default;
    JNIBridge(const JNIBridge&) = delete;
    JNIBridge& operator=(const JNIBridge&) = delete;
    
    // Internal state
    std::unique_ptr<MiningEngine> m_engine;
    std::unique_ptr<ConfigurationManager> m_configManager;
    std::unique_ptr<PerformanceMonitor> m_perfMonitor;
    std::unique_ptr<SecurityManager> m_securityManager;
    
    std::atomic<bool> m_initialized{false};
    std::atomic<bool> m_mining{false};
    std::atomic<bool> m_paused{false};
    
    mutable std::mutex m_statsMutex;
    mutable std::mutex m_configMutex;
    mutable std::mutex m_eventMutex;
    
    EventCallback m_eventCallback;
    JavaVM* m_jvm = nullptr;
    jobject m_context = nullptr;
    
    // Internal methods
    void fireEvent(const std::string& event, const std::string& data);
    bool validateJNIEnvironment(JNIEnv* env) const;
    std::string getConfigurationPath() const;
    void updatePerformanceMetrics();
    bool checkSecurityConstraints() const;
};

/**
 * Utility functions for JNI conversion
 */
namespace JNIUtils {
    // String conversions
    std::string jstringToString(JNIEnv* env, jstring jstr);
    jstring stringToJstring(JNIEnv* env, const std::string& str);
    
    // Array conversions
    std::vector<std::string> jstringArrayToVector(JNIEnv* env, jobjectArray jarray);
    jobjectArray vectorToJstringArray(JNIEnv* env, const std::vector<std::string>& vec);
    
    // Object conversions
    jobject configToJobject(JNIEnv* env, const MiningConfig& config);
    MiningConfig jobjectToConfig(JNIEnv* env, jobject jconfig);
    jobject statsToJobject(JNIEnv* env, const MiningStats& stats);
    jobject deviceInfoToJobject(JNIEnv* env, const DeviceInfo& deviceInfo);
    
    // Exception handling
    void throwJavaException(JNIEnv* env, const std::string& className, const std::string& message);
    bool checkAndClearException(JNIEnv* env);
    
    // Threading utilities
    JNIEnv* getJNIEnv(JavaVM* jvm);
    void detachCurrentThread(JavaVM* jvm);
}

} // namespace TradingAnarchy

// JNI Method Declarations
extern "C" {

// Native method signatures for React Native integration
JNIEXPORT jboolean JNICALL
Java_com_tradinganarchy_computeengine_TradingAnarchyEngine_nativeInitialize(
    JNIEnv *env, jobject thiz, jobject context);

JNIEXPORT jboolean JNICALL
Java_com_tradinganarchy_computeengine_TradingAnarchyEngine_nativeStartMining(
    JNIEnv *env, jobject thiz, jobject config);

JNIEXPORT jboolean JNICALL
Java_com_tradinganarchy_computeengine_TradingAnarchyEngine_nativeStopMining(
    JNIEnv *env, jobject thiz);

JNIEXPORT jboolean JNICALL
Java_com_tradinganarchy_computeengine_TradingAnarchyEngine_nativePauseMining(
    JNIEnv *env, jobject thiz);

JNIEXPORT jboolean JNICALL
Java_com_tradinganarchy_computeengine_TradingAnarchyEngine_nativeResumeMining(
    JNIEnv *env, jobject thiz);

JNIEXPORT jobject JNICALL
Java_com_tradinganarchy_computeengine_TradingAnarchyEngine_nativeGetMiningStats(
    JNIEnv *env, jobject thiz);

JNIEXPORT jobject JNICALL
Java_com_tradinganarchy_computeengine_TradingAnarchyEngine_nativeGetDeviceInfo(
    JNIEnv *env, jobject thiz);

JNIEXPORT jboolean JNICALL
Java_com_tradinganarchy_computeengine_TradingAnarchyEngine_nativeUpdateConfiguration(
    JNIEnv *env, jobject thiz, jobject config);

JNIEXPORT jboolean JNICALL
Java_com_tradinganarchy_computeengine_TradingAnarchyEngine_nativeValidateConfiguration(
    JNIEnv *env, jobject thiz, jobject config);

JNIEXPORT jobject JNICALL
Java_com_tradinganarchy_computeengine_TradingAnarchyEngine_nativeGetOptimalConfiguration(
    JNIEnv *env, jobject thiz, jstring algorithm);

JNIEXPORT jdouble JNICALL
Java_com_tradinganarchy_computeengine_TradingAnarchyEngine_nativeBenchmarkDevice(
    JNIEnv *env, jobject thiz, jstring algorithm, jint duration);

JNIEXPORT jobjectArray JNICALL
Java_com_tradinganarchy_computeengine_TradingAnarchyEngine_nativeGetSupportedAlgorithms(
    JNIEnv *env, jobject thiz);

JNIEXPORT jboolean JNICALL
Java_com_tradinganarchy_computeengine_TradingAnarchyEngine_nativeSaveConfiguration(
    JNIEnv *env, jobject thiz, jstring name, jobject config);

JNIEXPORT jobject JNICALL
Java_com_tradinganarchy_computeengine_TradingAnarchyEngine_nativeLoadConfiguration(
    JNIEnv *env, jobject thiz, jstring name);

JNIEXPORT jobjectArray JNICALL
Java_com_tradinganarchy_computeengine_TradingAnarchyEngine_nativeListConfigurations(
    JNIEnv *env, jobject thiz);

JNIEXPORT void JNICALL
Java_com_tradinganarchy_computeengine_TradingAnarchyEngine_nativeSetThermalLimits(
    JNIEnv *env, jobject thiz, jdouble maxTemp, jdouble throttleTemp);

JNIEXPORT void JNICALL
Java_com_tradinganarchy_computeengine_TradingAnarchyEngine_nativeSetBatteryLimits(
    JNIEnv *env, jobject thiz, jint minBatteryLevel, jboolean pauseOnBattery);

JNIEXPORT jdouble JNICALL
Java_com_tradinganarchy_computeengine_TradingAnarchyEngine_nativeGetPowerUsage(
    JNIEnv *env, jobject thiz);

JNIEXPORT jboolean JNICALL
Java_com_tradinganarchy_computeengine_TradingAnarchyEngine_nativeEnableSecureMode(
    JNIEnv *env, jobject thiz, jboolean encryptTraffic, jboolean validateCerts, jboolean hideFromTaskManager);

JNIEXPORT jboolean JNICALL
Java_com_tradinganarchy_computeengine_TradingAnarchyEngine_nativeVerifyIntegrity(
    JNIEnv *env, jobject thiz);

JNIEXPORT jobjectArray JNICALL
Java_com_tradinganarchy_computeengine_TradingAnarchyEngine_nativeGetLogs(
    JNIEnv *env, jobject thiz, jint lines);

JNIEXPORT jboolean JNICALL
Java_com_tradinganarchy_computeengine_TradingAnarchyEngine_nativeExportStats(
    JNIEnv *env, jobject thiz, jstring format, jstring filepath);

// Benchmark Functions
JNIEXPORT jobject JNICALL
Java_com_tradinganarchy_xmrig_TradingAnarchyModule_nativeBenchmarkAlgorithm(
    JNIEnv *env, jobject thiz, jstring algorithm, jint duration, jint threads);

JNIEXPORT jboolean JNICALL
Java_com_tradinganarchy_xmrig_TradingAnarchyModule_nativeStopBenchmark(
    JNIEnv *env, jobject thiz);

JNIEXPORT jdouble JNICALL
Java_com_tradinganarchy_xmrig_TradingAnarchyModule_nativeGetCpuTemperature(
    JNIEnv *env, jobject thiz);

JNIEXPORT void JNICALL
Java_com_tradinganarchy_computeengine_TradingAnarchyEngine_nativeCleanup(
    JNIEnv *env, jobject thiz);

} // extern "C"

#endif // TRADING_ANARCHY_JNI_H