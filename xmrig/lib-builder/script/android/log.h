/**
 * Trading Anarchy Android Logging System
 * 2025 Professional Edition - Modern C++23 Implementation
 */

#ifndef TRADING_ANARCHY_LOG_H
#define TRADING_ANARCHY_LOG_H

#ifdef __cplusplus
extern "C" {
#endif

// Log priority values - 2025 Android API
typedef enum android_LogPriority {
    ANDROID_LOG_UNKNOWN = 0,
    ANDROID_LOG_DEFAULT,
    ANDROID_LOG_VERBOSE,
    ANDROID_LOG_DEBUG,
    ANDROID_LOG_INFO,
    ANDROID_LOG_WARN,
    ANDROID_LOG_ERROR,
    ANDROID_LOG_FATAL,
    ANDROID_LOG_SILENT,
} android_LogPriority;

// Mock function declarations for IntelliSense
int __android_log_print(int prio, const char *tag, const char *fmt, ...);
int __android_log_write(int prio, const char *tag, const char *text);

#ifdef __cplusplus
}
#endif

// 2025 Modern Logging Macros
#define LOG_TAG "TradingAnarchy2025"

// Professional logging levels
#define LOG_VERBOSE(fmt, ...) __android_log_print(ANDROID_LOG_VERBOSE, LOG_TAG, fmt, ##__VA_ARGS__)
#define LOG_DEBUG(fmt, ...)   __android_log_print(ANDROID_LOG_DEBUG, LOG_TAG, fmt, ##__VA_ARGS__)
#define LOG_INFO(fmt, ...)    __android_log_print(ANDROID_LOG_INFO, LOG_TAG, fmt, ##__VA_ARGS__)
#define LOG_WARN(fmt, ...)    __android_log_print(ANDROID_LOG_WARN, LOG_TAG, fmt, ##__VA_ARGS__)
#define LOG_ERROR(fmt, ...)   __android_log_print(ANDROID_LOG_ERROR, LOG_TAG, fmt, ##__VA_ARGS__)
#define LOG_FATAL(fmt, ...)   __android_log_print(ANDROID_LOG_FATAL, LOG_TAG, fmt, ##__VA_ARGS__)

// Legacy compatibility
#define LOGV(...) __android_log_print(ANDROID_LOG_VERBOSE, LOG_TAG, __VA_ARGS__)
#define LOGD(...) __android_log_print(ANDROID_LOG_DEBUG, LOG_TAG, __VA_ARGS__)
#define LOGI(...) __android_log_print(ANDROID_LOG_INFO, LOG_TAG, __VA_ARGS__)
#define LOGW(...) __android_log_print(ANDROID_LOG_WARN, LOG_TAG, __VA_ARGS__)
#define LOGE(...) __android_log_print(ANDROID_LOG_ERROR, LOG_TAG, __VA_ARGS__)
#define LOGF(...) __android_log_print(ANDROID_LOG_FATAL, LOG_TAG, __VA_ARGS__)

#ifdef __cplusplus
// 2025 Modern C++23 Stream-based Logging
#include <string>
#include <sstream>

namespace TradingAnarchy {
namespace Logging {

class LogStream {
private:
    std::ostringstream stream_;
    int priority_;

public:
    explicit LogStream(int priority) : priority_(priority) {}
    
    ~LogStream() {
        __android_log_print(priority_, LOG_TAG, "%s", stream_.str().c_str());
    }
    
    template<typename T>
    LogStream& operator<<(const T& value) {
        stream_ << value;
        return *this;
    }
};

// Modern C++23 logging interface
inline LogStream verbose() { return LogStream(ANDROID_LOG_VERBOSE); }
inline LogStream debug() { return LogStream(ANDROID_LOG_DEBUG); }
inline LogStream info() { return LogStream(ANDROID_LOG_INFO); }
inline LogStream warn() { return LogStream(ANDROID_LOG_WARN); }
inline LogStream error() { return LogStream(ANDROID_LOG_ERROR); }
inline LogStream fatal() { return LogStream(ANDROID_LOG_FATAL); }

} // namespace Logging
} // namespace TradingAnarchy

// Convenience macros for C++23 style logging
#define LOG_STREAM_VERBOSE() TradingAnarchy::Logging::verbose()
#define LOG_STREAM_DEBUG()   TradingAnarchy::Logging::debug()
#define LOG_STREAM_INFO()    TradingAnarchy::Logging::info()
#define LOG_STREAM_WARN()    TradingAnarchy::Logging::warn()
#define LOG_STREAM_ERROR()   TradingAnarchy::Logging::error()
#define LOG_STREAM_FATAL()   TradingAnarchy::Logging::fatal()
#endif // __cplusplus

#endif // TRADING_ANARCHY_LOG_H