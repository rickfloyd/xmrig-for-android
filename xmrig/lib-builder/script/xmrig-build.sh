#!/usr/bin/env bash
#
# Trading Anarchy - Android Compute Engine
# Advanced XMRig Builder - Professional build system with 2025 optimizations
# Copyright (c) 2025 Trading Anarchy. All rights reserved.
# Version: 2025.1.0 - Enhanced Performance, Security & Modern Standards
#

# Professional error handling and debugging for 2025
set -euo pipefail
set -o posix

# Performance and build monitoring
BUILD_START_TIME=$(date +%s)
export MAKEFLAGS="-j${TA_BUILD_THREADS:-$(nproc 2>/dev/null || echo 4)}"

# Source enhanced environment configuration
source script/env.sh

log_info "Starting Trading Anarchy XMRig Compute Engine Build..."

# Professional build environment validation
if [[ ! -d "$EXTERNAL_LIBS_BUILD_ROOT/xmrig" ]]; then
    log_error "XMRig source not found at: $EXTERNAL_LIBS_BUILD_ROOT/xmrig"
    log_info "Please run fetch script first to download XMRig source"
fi

cd "$EXTERNAL_LIBS_BUILD_ROOT/xmrig"

# Enhanced CMakeLists.txt modification with backup for 2025
log_info "Configuring XMRig for Android compatibility..."
if [[ ! -f "CMakeLists.txt.ta-backup" ]]; then
    cp CMakeLists.txt CMakeLists.txt.ta-backup
    log_info "Created backup of original CMakeLists.txt"
fi

# Professional sed replacement with validation
sed -e "s/pthread rt dl log/dl/g" CMakeLists.txt.ta-backup > CMakeLists.txt.tmp
if [[ -f "CMakeLists.txt.tmp" ]]; then
    mv CMakeLists.txt.tmp CMakeLists.txt
    log_success "Successfully configured CMakeLists.txt for Android"
else
    log_error "Failed to modify CMakeLists.txt"
fi

# Enhanced build directory management
mkdir -p build && cd build

# Advanced CMake and toolchain detection with 2025 standards
TOOLCHAIN="$ANDROID_HOME/ndk/$NDK_VERSION/build/cmake/android.toolchain.cmake"
if [[ ! -f "$TOOLCHAIN" ]]; then
    log_error "Android CMake toolchain not found: $TOOLCHAIN"
fi

log_info "Detecting optimal CMake installation..."
CMAKE=""

# Professional CMake detection with version preference
CMAKE_CANDIDATES=(
    "$ANDROID_HOME/cmake/3.28.1/bin/cmake"  # Latest 2025 version
    "$ANDROID_HOME/cmake/3.27.1/bin/cmake"  # Fallback 2024 version  
    "$ANDROID_HOME/cmake/3.22.1/bin/cmake"  # Minimum supported
    "$ANDROID_HOME/cmake/3.18.1/bin/cmake"  # Legacy support
)

for candidate in "${CMAKE_CANDIDATES[@]}"; do
    if [[ -f "$candidate" ]]; then
        CMAKE="$candidate"
        log_success "Found CMake: $CMAKE"
        break
    fi
done

# Fallback to system-wide search
if [[ -z "$CMAKE" ]]; then
    log_warn "Predefined CMake not found, searching system-wide..."
    CMAKE_DIR=$(find "$ANDROID_HOME/cmake" -name "cmake" -type f 2>/dev/null | head -1)
    if [[ -n "$CMAKE_DIR" ]]; then
        CMAKE="$CMAKE_DIR"
        log_info "Using discovered CMake: $CMAKE"
    else
        log_error "No CMake installation found in Android SDK"
    fi
fi

# Validate CMake version for 2025 compatibility
CMAKE_VERSION=$("$CMAKE" --version | head -n1 | grep -o '[0-9]\+\.[0-9]\+\.[0-9]\+' || echo "0.0.0")
CMAKE_VERSION_NUM=$(echo "$CMAKE_VERSION" | awk -F. '{print $1*10000 + $2*100 + $3}')
MIN_CMAKE_VERSION=31800  # 3.18.0

if [[ "$CMAKE_VERSION_NUM" -lt "$MIN_CMAKE_VERSION" ]]; then
    log_error "CMake version $CMAKE_VERSION is too old. Minimum required: 3.18.0"
fi

log_success "Using CMake $CMAKE_VERSION for professional build"

# Professional Android platform configuration for 2025
ANDROID_PLATFORM="android-35"  # Updated to Android 15 (API 35) for 2025
MIN_API_LEVEL=29  # Maintain backward compatibility

log_info "Build Configuration:"
log_info "  - Android Platform: $ANDROID_PLATFORM"
log_info "  - CMake: $CMAKE_VERSION"
log_info "  - NDK: $NDK_VERSION"
log_info "  - Build Threads: $TA_BUILD_THREADS"
log_info "  - Toolchain: $TOOLCHAIN"

# Enhanced architecture configuration with 2025 optimizations
declare -A ARCH_CONFIG=(
    ["arm"]="arm-linux-androideabi armeabi-v7a 7"
    ["arm64"]="aarch64-linux-android arm64-v8a 8" 
    ["x86"]="i686-linux-android x86 0"
    ["x86_64"]="x86_64-linux-android x86_64 0"
)

SUPPORTED_ARCHS=(arm arm64 x86 x86_64)
BUILD_ARCHS=("${TA_BUILD_ARCHS[@]:-"${SUPPORTED_ARCHS[@]}"}")

# Professional build tracking
BUILD_MANIFEST="$EXTERNAL_LIBS_BUILD/xmrig_build_manifest.json"
echo "{\"timestamp\": \"$(date -Iseconds)\", \"cmake_version\": \"$CMAKE_VERSION\", \"ndk_version\": \"$NDK_VERSION\", \"builds\": []}" > "$BUILD_MANIFEST"

# Enhanced build function with comprehensive error handling
build_architecture() {
    local arch=$1
    local config=(${ARCH_CONFIG[$arch]})
    local target_host=${config[0]}
    local android_abi=${config[1]}
    local arm_target=${config[2]}
    
    local build_start=$(date +%s)
    log_info "🔨 Building XMRig compute engine for $arch ($android_abi)..."
    
    # Professional build directory management
    local build_dir="$EXTERNAL_LIBS_BUILD_ROOT/xmrig/build/$android_abi"
    local target_dir="$EXTERNAL_LIBS_ROOT/xmrig/$android_abi"
    
    mkdir -p "$build_dir" "$target_dir"
    cd "$build_dir"
    
    # Skip if already built and caching enabled
    if [[ "$TA_ENABLE_BUILD_CACHE" == "true" && -f "$target_dir/lib/xmrig" ]]; then
        local existing_size=$(stat -f%z "$target_dir/lib/xmrig" 2>/dev/null || stat -c%s "$target_dir/lib/xmrig" 2>/dev/null || echo 0)
        if [[ "$existing_size" -gt 0 ]]; then
            log_info "⚡ Using cached build for $arch ($(numfmt --to=iec "$existing_size"))"
            return 0
        fi
    fi
    
    # Professional CMake configuration with 2025 optimizations
    local cmake_args=(
        -DCMAKE_TOOLCHAIN_FILE="$TOOLCHAIN"
        -DANDROID_ABI="$android_abi"
        -DANDROID_PLATFORM="$ANDROID_PLATFORM"
        -DANDROID_NDK="$ANDROID_NDK_HOME"
        -DCMAKE_INSTALL_PREFIX="$target_dir"
        -DCMAKE_BUILD_TYPE=Release
        -DANDROID_CROSS_COMPILE=ON
        -DBUILD_SHARED_LIBS=OFF
        -DBUILD_STATIC=OFF
        -DWITH_OPENCL=OFF
        -DWITH_CUDA=OFF
        -DWITH_TLS=ON
        -DWITH_ASM=ON
        -DWITH_SECURE_JIT=ON
        -DWITH_PROFILING=OFF
        # Enhanced dependency linking
        -DHWLOC_LIBRARY="$EXTERNAL_LIBS_ROOT/hwloc/$android_abi/lib/libhwloc.a"
        -DHWLOC_INCLUDE_DIR="$EXTERNAL_LIBS_ROOT/hwloc/$android_abi/include"
        -DUV_LIBRARY="$EXTERNAL_LIBS_ROOT/libuv/$android_abi/lib/libuv_a.a"
        -DUV_INCLUDE_DIR="$EXTERNAL_LIBS_ROOT/libuv/$android_abi/include"
        -DOPENSSL_SSL_LIBRARY="$EXTERNAL_LIBS_ROOT/openssl/$android_abi/lib/libssl.a"
        -DOPENSSL_CRYPTO_LIBRARY="$EXTERNAL_LIBS_ROOT/openssl/$android_abi/lib/libcrypto.a"
        -DOPENSSL_INCLUDE_DIR="$EXTERNAL_LIBS_ROOT/openssl/$android_abi/include"
        # 2025 optimization flags
        -DCMAKE_CXX_FLAGS="-O3 -DNDEBUG -flto -ffunction-sections -fdata-sections"
        -DCMAKE_C_FLAGS="-O3 -DNDEBUG -flto -ffunction-sections -fdata-sections"
        -DCMAKE_EXE_LINKER_FLAGS="-Wl,--gc-sections -Wl,--strip-all"
    )
    
    # Execute professional build process
    log_info "⚙️ Configuring build for $arch..."
    if ! "$CMAKE" "${cmake_args[@]}" ../../; then
        log_error "CMake configuration failed for $arch"
        return 1
    fi
    
    log_info "🏗️ Compiling for $arch with $TA_BUILD_THREADS threads..."
    if ! make -j "$TA_BUILD_THREADS"; then
        log_error "Compilation failed for $arch"
        return 1
    fi
    
    log_info "📦 Installing $arch build..."
    if ! make install; then
        log_error "Installation failed for $arch"
        return 1
    fi
    
    # Professional cleanup and validation
    make clean || log_warn "Build cleanup failed for $arch"
    
    # Validate build output
    if [[ -f "$target_dir/bin/xmrig" ]]; then
        local binary_size=$(stat -f%z "$target_dir/bin/xmrig" 2>/dev/null || stat -c%s "$target_dir/bin/xmrig" 2>/dev/null || echo 0)
        local build_time=$(($(date +%s) - build_start))
        
        log_success "✅ Successfully built $arch in ${build_time}s ($(numfmt --to=iec "$binary_size"))"
        
        # Update build manifest
        local temp_manifest=$(mktemp)
        jq --arg arch "$android_abi" --arg size "$binary_size" --arg time "$build_time" \
           '.builds += [{"arch": $arch, "size": ($size | tonumber), "build_time": ($time | tonumber), "success": true}]' \
           "$BUILD_MANIFEST" > "$temp_manifest"
        mv "$temp_manifest" "$BUILD_MANIFEST"
        
        return 0
    else
        log_error "Build output not found for $arch"
        return 1
    fi
}

# Professional parallel build execution with 2025 optimizations
if [[ "$TA_ENABLE_PARALLEL_BUILDS" == "true" && ${#BUILD_ARCHS[@]} -gt 1 ]]; then
    log_info "🚀 Starting parallel build for ${#BUILD_ARCHS[@]} architectures..."
    
    # Background job management for parallel builds
    declare -a BUILD_PIDS=()
    
    for arch in "${BUILD_ARCHS[@]}"; do
        if [[ -v ARCH_CONFIG[$arch] ]]; then
            (
                build_architecture "$arch"
                echo $? > "/tmp/build_result_$arch"
            ) &
            BUILD_PIDS+=($!)
            log_info "Started background build for $arch (PID: $!)"
        else
            log_error "Unsupported architecture: $arch"
        fi
    done
    
    # Monitor parallel builds with progress reporting
    local completed_builds=0
    local failed_builds=()
    
    for i in "${!BUILD_PIDS[@]}"; do
        local pid=${BUILD_PIDS[$i]}
        local arch=${BUILD_ARCHS[$i]}
        
        log_info "Waiting for $arch build completion..."
        
        if wait "$pid"; then
            local result_code=$(cat "/tmp/build_result_$arch" 2>/dev/null || echo 1)
            if [[ "$result_code" -eq 0 ]]; then
                completed_builds=$((completed_builds + 1))
                log_success "✅ Parallel build completed successfully for $arch ($completed_builds/${#BUILD_ARCHS[@]})"
            else
                failed_builds+=("$arch")
                log_error "❌ Parallel build failed for $arch"
            fi
        else
            failed_builds+=("$arch")
            log_error "❌ Parallel build process failed for $arch"
        fi
        
        # Cleanup temp files
        rm -f "/tmp/build_result_$arch"
    done
    
    # Report parallel build results
    if [[ ${#failed_builds[@]} -gt 0 ]]; then
        log_error "Failed parallel builds: ${failed_builds[*]}"
    fi
    
else
    # Sequential build for maximum reliability
    log_info "🔄 Starting sequential build process..."
    
    local completed_builds=0
    local failed_builds=()
    
    for arch in "${BUILD_ARCHS[@]}"; do
        if [[ -v ARCH_CONFIG[$arch] ]]; then
            if build_architecture "$arch"; then
                completed_builds=$((completed_builds + 1))
                log_success "✅ Sequential build completed for $arch ($completed_builds/${#BUILD_ARCHS[@]})"
            else
                failed_builds+=("$arch")
                log_error "❌ Sequential build failed for $arch"
            fi
        else
            log_error "Unsupported architecture: $arch"
        fi
    done
    
    # Report sequential build results
    if [[ ${#failed_builds[@]} -gt 0 ]]; then
        log_error "Failed sequential builds: ${failed_builds[*]}"
    fi
fi

# Professional build summary and validation
log_info "🔍 Validating build artifacts..."

TOTAL_BUILT=0
TOTAL_SIZE=0
BUILD_SUMMARY=""

for arch in "${BUILD_ARCHS[@]}"; do
    if [[ -v ARCH_CONFIG[$arch] ]]; then
        local config=(${ARCH_CONFIG[$arch]})
        local android_abi=${config[1]}
        local binary_path="$EXTERNAL_LIBS_ROOT/xmrig/$android_abi/bin/xmrig"
        
        if [[ -f "$binary_path" ]]; then
            local size=$(stat -f%z "$binary_path" 2>/dev/null || stat -c%s "$binary_path" 2>/dev/null || echo 0)
            TOTAL_BUILT=$((TOTAL_BUILT + 1))
            TOTAL_SIZE=$((TOTAL_SIZE + size))
            BUILD_SUMMARY+="  ✅ $android_abi: $(numfmt --to=iec "$size")\n"
        else
            BUILD_SUMMARY+="  ❌ $android_abi: Build failed or missing\n"
        fi
    fi
done

# Update final build manifest
local temp_manifest=$(mktemp)
local total_time=$(($(date +%s) - BUILD_START_TIME))
jq --arg total "$TOTAL_BUILT" --arg size "$TOTAL_SIZE" --arg time "$total_time" \
   '.summary = {"total_successful": ($total | tonumber), "total_size": ($size | tonumber), "total_build_time": ($time | tonumber)}' \
   "$BUILD_MANIFEST" > "$temp_manifest"
mv "$temp_manifest" "$BUILD_MANIFEST"

# Professional build completion report
log_success "🎯 Trading Anarchy XMRig Build Summary:"
log_success "  - Successful Builds: $TOTAL_BUILT/${#BUILD_ARCHS[@]}"
log_success "  - Total Binary Size: $(numfmt --to=iec "$TOTAL_SIZE")"
log_success "  - Total Build Time: $((total_time / 60))m $((total_time % 60))s"
log_success "  - Build Manifest: $BUILD_MANIFEST"
echo -e "  - Architecture Details:\n$BUILD_SUMMARY"

if [[ "$TOTAL_BUILT" -eq ${#BUILD_ARCHS[@]} ]]; then
    log_success "🚀 All XMRig compute engines built successfully!"
    exit 0
else
    log_error "⚠️ Some builds failed. Check logs above for details."
    exit 1
fi
