# =============================================
# Trading Anarchy Android Compute Engine
# Professional CMake Build System - Android Native Libraries with 2025 Standards
# Copyright (c) 2025 Trading Anarchy. All rights reserved.
# Version: 2025.1.0 - Enhanced Security, Performance & Modern Standards
# =============================================

cmake_minimum_required(VERSION 3.28.0)

# Professional project configuration with 2025 standards
project(TradingAnarchyComputeEngine
    VERSION 2.0.0
    DESCRIPTION "Trading Anarchy Professional Android Compute Engine"
    LANGUAGES C CXX
)

# Enhanced CMake policies for 2025 compatibility
cmake_policy(SET CMP0077 NEW)  # option() honors normal variables
cmake_policy(SET CMP0048 NEW)  # project() command manages VERSION variables
cmake_policy(SET CMP0063 NEW)  # Honor visibility properties for all targets
cmake_policy(SET CMP0069 NEW)  # INTERPROCEDURAL_OPTIMIZATION is enforced when enabled

# Professional build configuration
set(CMAKE_CXX_STANDARD 23)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)
set(CMAKE_C_STANDARD 17)
set(CMAKE_C_STANDARD_REQUIRED ON)

# Enhanced Android-specific configurations
if(ANDROID)
    set(CMAKE_ANDROID_ARCH_ABI ${ANDROID_ABI})
    set(CMAKE_ANDROID_NDK ${ANDROID_NDK})
    set(CMAKE_TOOLCHAIN_FILE ${ANDROID_NDK}/build/cmake/android.toolchain.cmake)
    set(CMAKE_ANDROID_STL_TYPE c++_shared)
    
    # Professional Android platform validation
    if(ANDROID_PLATFORM_LEVEL LESS 24)
        message(FATAL_ERROR "Minimum Android API level 24 required for 2025 standards")
    endif()
    
    # Enhanced security and performance flags for Android
    add_compile_definitions(
        ANDROID_PLATFORM_LEVEL=${ANDROID_PLATFORM_LEVEL}
        TRADING_ANARCHY_VERSION="2.0.0"
        TRADING_ANARCHY_BUILD_DATE="${CMAKE_CURRENT_DATE}"
    )
endif()

# Professional compiler flags with 2025 optimizations
set(CMAKE_CXX_FLAGS_RELEASE "-O3 -DNDEBUG -flto -ffunction-sections -fdata-sections")
set(CMAKE_C_FLAGS_RELEASE "-O3 -DNDEBUG -flto -ffunction-sections -fdata-sections")
set(CMAKE_EXE_LINKER_FLAGS_RELEASE "-Wl,--gc-sections -Wl,--strip-all")

# Enhanced security flags
add_compile_options(
    -fstack-protector-strong
    -D_FORTIFY_SOURCE=2
    -fPIE
    -Wformat-security
    -Werror=format-security
)

if(CMAKE_BUILD_TYPE STREQUAL "Release")
    add_compile_options(
        -fvisibility=hidden
        -fvisibility-inlines-hidden
    )
endif()

# Professional library path configuration
set(EXTERNAL_LIBS_ROOT ${CMAKE_CURRENT_SOURCE_DIR}/xmrig/lib-builder/build/build)
set(NATIVE_LIBS_ROOT ${CMAKE_CURRENT_SOURCE_DIR}/android/app/src/main/jniLibs)

# Enhanced architecture-specific library paths with validation
if(ANDROID_ABI STREQUAL "armeabi-v7a")
    set(ARCH_LIBS_PATH ${EXTERNAL_LIBS_ROOT}/armeabi-v7a)
elseif(ANDROID_ABI STREQUAL "arm64-v8a")
    set(ARCH_LIBS_PATH ${EXTERNAL_LIBS_ROOT}/arm64-v8a)
elseif(ANDROID_ABI STREQUAL "x86")
    set(ARCH_LIBS_PATH ${EXTERNAL_LIBS_ROOT}/x86)
elseif(ANDROID_ABI STREQUAL "x86_64")
    set(ARCH_LIBS_PATH ${EXTERNAL_LIBS_ROOT}/x86_64)
else()
    message(FATAL_ERROR "Unsupported Android ABI: ${ANDROID_ABI}")
endif()

# Professional dependency validation with detailed error reporting
function(validate_library LIB_NAME LIB_PATH)
    if(NOT EXISTS ${LIB_PATH})
        message(FATAL_ERROR "Required library not found: ${LIB_NAME} at ${LIB_PATH}")
    endif()
    message(STATUS "Found required library: ${LIB_NAME} at ${LIB_PATH}")
endfunction()

# Enhanced external library configuration with 2025 standards
set(OPENSSL_ROOT_DIR ${ARCH_LIBS_PATH}/openssl)
set(HWLOC_ROOT_DIR ${ARCH_LIBS_PATH}/hwloc)
set(UV_ROOT_DIR ${ARCH_LIBS_PATH}/libuv)
set(XMRIG_ROOT_DIR ${ARCH_LIBS_PATH}/xmrig)

# Professional library validation
validate_library("OpenSSL SSL" ${OPENSSL_ROOT_DIR}/lib/libssl.a)
validate_library("OpenSSL Crypto" ${OPENSSL_ROOT_DIR}/lib/libcrypto.a)
validate_library("hwloc" ${HWLOC_ROOT_DIR}/lib/libhwloc.a)
validate_library("libuv" ${UV_ROOT_DIR}/lib/libuv_a.a)

# Enhanced imported library definitions with comprehensive error handling
add_library(ssl STATIC IMPORTED)
set_target_properties(ssl PROPERTIES
    IMPORTED_LOCATION ${OPENSSL_ROOT_DIR}/lib/libssl.a
    INTERFACE_INCLUDE_DIRECTORIES ${OPENSSL_ROOT_DIR}/include
)

add_library(crypto STATIC IMPORTED)
set_target_properties(crypto PROPERTIES
    IMPORTED_LOCATION ${OPENSSL_ROOT_DIR}/lib/libcrypto.a
    INTERFACE_INCLUDE_DIRECTORIES ${OPENSSL_ROOT_DIR}/include
)

add_library(hwloc STATIC IMPORTED)
set_target_properties(hwloc PROPERTIES
    IMPORTED_LOCATION ${HWLOC_ROOT_DIR}/lib/libhwloc.a
    INTERFACE_INCLUDE_DIRECTORIES ${HWLOC_ROOT_DIR}/include
)

add_library(uv STATIC IMPORTED)
set_target_properties(uv PROPERTIES
    IMPORTED_LOCATION ${UV_ROOT_DIR}/lib/libuv_a.a
    INTERFACE_INCLUDE_DIRECTORIES ${UV_ROOT_DIR}/include
)

# Professional React Native integration with new architecture support
find_library(REACT_NATIVE_JNI_LIB reactnativejni)
find_library(TURBO_MODULE_CORE_LIB turbomodulejsijni)
find_library(FABRIC_JNI_LIB fabricjni)

# Enhanced JNI source files configuration
set(JNI_SOURCES
    android/app/src/main/cpp/trading_anarchy_jni.cpp
    android/app/src/main/cpp/compute_engine_bridge.cpp
    android/app/src/main/cpp/crypto_utils.cpp
    android/app/src/main/cpp/performance_monitor.cpp
    android/app/src/main/cpp/security_manager.cpp
)

# Professional native library target with comprehensive configuration
add_library(tradingAnarchyComputeEngine SHARED
    ${JNI_SOURCES}
)

# Enhanced target properties with 2025 optimizations
set_target_properties(tradingAnarchyComputeEngine PROPERTIES
    CXX_STANDARD 23
    CXX_STANDARD_REQUIRED ON
    CXX_EXTENSIONS OFF
    POSITION_INDEPENDENT_CODE ON
    INTERPROCEDURAL_OPTIMIZATION TRUE
    LINK_WHAT_YOU_USE ON
)

# Professional include directories with proper organization
target_include_directories(tradingAnarchyComputeEngine PRIVATE
    android/app/src/main/cpp/include
    ${OPENSSL_ROOT_DIR}/include
    ${HWLOC_ROOT_DIR}/include
    ${UV_ROOT_DIR}/include
    ${CMAKE_CURRENT_SOURCE_DIR}/src/core
)

# Enhanced library linking with dependency management
target_link_libraries(tradingAnarchyComputeEngine
    ssl
    crypto
    hwloc
    uv
    log
    android
    ${REACT_NATIVE_JNI_LIB}
)

# Professional compiler definitions with feature flags
target_compile_definitions(tradingAnarchyComputeEngine PRIVATE
    TRADING_ANARCHY_VERSION="2.0.0"
    TRADING_ANARCHY_ANDROID=1
    ANDROID_PLATFORM_LEVEL=${ANDROID_PLATFORM_LEVEL}
    OPENSSL_API_COMPAT=0x10100000L
    _GNU_SOURCE=1
)

# Enhanced build optimization flags
if(CMAKE_BUILD_TYPE STREQUAL "Release")
    target_compile_definitions(tradingAnarchyComputeEngine PRIVATE
        NDEBUG=1
        TRADING_ANARCHY_OPTIMIZED=1
    )
    
    target_compile_options(tradingAnarchyComputeEngine PRIVATE
        -Oz  # Optimize for size in mobile context
        -fomit-frame-pointer
        -fmerge-all-constants
    )
endif()

# Professional debug configuration for development
if(CMAKE_BUILD_TYPE STREQUAL "Debug")
    target_compile_definitions(tradingAnarchyComputeEngine PRIVATE
        DEBUG=1
        TRADING_ANARCHY_DEBUG=1
        TRADING_ANARCHY_LOGGING=1
    )
    
    target_compile_options(tradingAnarchyComputeEngine PRIVATE
        -g3
        -O0
        -fno-omit-frame-pointer
    )
endif()

# Enhanced security hardening for production builds
if(CMAKE_BUILD_TYPE STREQUAL "Release")
    set_target_properties(tradingAnarchyComputeEngine PROPERTIES
        LINK_FLAGS "-Wl,-z,relro,-z,now,-z,noexecstack"
    )
endif()

# Professional installation configuration
install(TARGETS tradingAnarchyComputeEngine
    LIBRARY DESTINATION ${NATIVE_LIBS_ROOT}/${ANDROID_ABI}
    ARCHIVE DESTINATION ${NATIVE_LIBS_ROOT}/${ANDROID_ABI}
)

# Enhanced build summary and validation
message(STATUS "=== Trading Anarchy Android Compute Engine Build Configuration ===")
message(STATUS "Version: ${PROJECT_VERSION}")
message(STATUS "Build Type: ${CMAKE_BUILD_TYPE}")
message(STATUS "Android ABI: ${ANDROID_ABI}")
message(STATUS "Android Platform: ${ANDROID_PLATFORM}")
message(STATUS "NDK Version: ${ANDROID_NDK}")
message(STATUS "C++ Standard: C++${CMAKE_CXX_STANDARD}")
message(STATUS "Architecture Libraries: ${ARCH_LIBS_PATH}")
message(STATUS "Target Output: ${NATIVE_LIBS_ROOT}/${ANDROID_ABI}")
message(STATUS "================================================================")