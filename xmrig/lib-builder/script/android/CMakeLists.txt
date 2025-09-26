# CMakeLists.txt for Trading Anarchy Android Native Module
# 2025 Modern C++ Build Configuration

cmake_minimum_required(VERSION 3.22.1)

project(trading_anarchy)

# Set C++ standard to C++23 (2025 standard)
set(CMAKE_CXX_STANDARD 23)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)

# Enable modern C++ features and optimizations
set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -std=c++23 -Wall -Wextra -O3")
set(CMAKE_CXX_FLAGS_RELEASE "${CMAKE_CXX_FLAGS_RELEASE} -O3 -DNDEBUG")
set(CMAKE_CXX_FLAGS_DEBUG "${CMAKE_CXX_FLAGS_DEBUG} -g -O0")

# Find required packages
find_package(PkgConfig REQUIRED)
find_library(log-lib log)

# Include directories
include_directories(
    ${CMAKE_CURRENT_SOURCE_DIR}
    ${CMAKE_CURRENT_SOURCE_DIR}/../src
    ${CMAKE_CURRENT_SOURCE_DIR}/../android
    ${ANDROID_NDK}/sources/cxx-stl/llvm-libc++/include
    ${ANDROID_NDK}/toolchains/llvm/prebuilt/${ANDROID_HOST_TAG}/sysroot/usr/include
)

# Source files
set(SOURCES
    trading_anarchy_native_module.cpp
    trading_anarchy_jni_impl.cpp
    log.h
)

# Create shared library
add_library(
    trading_anarchy
    SHARED
    ${SOURCES}
)

# Link libraries
target_link_libraries(
    trading_anarchy
    ${log-lib}
    android
)

# Set properties
set_target_properties(trading_anarchy PROPERTIES
    ANDROID_STL "c++_shared"
    CXX_STANDARD 23
    CXX_STANDARD_REQUIRED ON
)

# Compiler definitions
target_compile_definitions(trading_anarchy PRIVATE
    ANDROID=1
    __ANDROID__=1
    TRADING_ANARCHY_VERSION="2025.1.0"
    MODERN_CPP_23=1
)

# Export symbols for JNI
set_target_properties(trading_anarchy PROPERTIES
    LINK_FLAGS "-Wl,--no-undefined -Wl,--gc-sections"
)