#!/usr/bin/env bash
#
# Trading Anarchy - Android Compute Engine
# Advanced OpenSSL Builder - Professional cryptography library with 2025 security standards
# Copyright (c) 2025 Trading Anarchy. All rights reserved.
# Version: 2025.1.0 - Enhanced Security, Performance & Modern Cryptography
#

# Professional error handling and debugging for 2025
set -euo pipefail
set -o posix

# Performance and security monitoring
BUILD_START_TIME=$(date +%s)
export MAKEFLAGS="-j${TA_BUILD_THREADS:-$(nproc 2>/dev/null || echo 4)}"

# Source enhanced environment configuration
source script/env.sh

log_info "Starting Trading Anarchy OpenSSL Cryptography Build..."

# Professional build environment validation
if [[ ! -d "$EXTERNAL_LIBS_BUILD_ROOT/openssl" ]]; then
    log_error "OpenSSL source not found at: $EXTERNAL_LIBS_BUILD_ROOT/openssl"
    log_info "Please run fetch script first to download OpenSSL source"
fi

cd "$EXTERNAL_LIBS_BUILD_ROOT/openssl"

# Enhanced OpenSSL configuration for Android with 2025 security standards
CC=clang
PATH="$TOOLCHAINS_PATH/bin:$PATH"
export CC PATH

# Professional Android platform configuration for 2025
ANDROID_API=35  # Updated to Android 15 API for 2025
ANDROID_PLATFORM="android-35"
MIN_API_LEVEL=29  # Maintain backward compatibility

log_info "OpenSSL Build Configuration:"
log_info "  - Android API Level: $ANDROID_API"
log_info "  - Compiler: $CC"
log_info "  - Build Threads: $TA_BUILD_THREADS"
log_info "  - Toolchain Path: $TOOLCHAINS_PATH"

# Enhanced architecture configuration with 2025 optimizations  
declare -A OPENSSL_ARCH_CONFIG=(
    ["arm"]="android-arm armeabi-v7a"
    ["arm64"]="android-arm64 arm64-v8a"
    ["x86"]="android-x86 x86" 
    ["x86_64"]="android-x86_64 x86_64"
)

SUPPORTED_ARCHS=(arm arm64 x86 x86_64)
BUILD_ARCHS=("${TA_BUILD_ARCHS[@]:-"${SUPPORTED_ARCHS[@]}"}")

# Professional build tracking
BUILD_MANIFEST="$EXTERNAL_LIBS_BUILD/openssl_build_manifest.json"
echo "{\"timestamp\": \"$(date -Iseconds)\", \"api_level\": $ANDROID_API, \"builds\": []}" > "$BUILD_MANIFEST"

# Enhanced OpenSSL build function with comprehensive security features
build_openssl_architecture() {
    local arch=$1
    local config=(${OPENSSL_ARCH_CONFIG[$arch]})
    local openssl_arch=${config[0]}
    local android_abi=${config[1]}
    
    local build_start=$(date +%s)
    log_info "🔐 Building OpenSSL cryptography library for $arch ($android_abi)..."
    
    local target_dir="$EXTERNAL_LIBS_ROOT/openssl/$android_abi"
    
    # Skip if already built and caching enabled
    if [[ "$TA_ENABLE_BUILD_CACHE" == "true" && -f "$target_dir/lib/libssl.a" && -f "$target_dir/lib/libcrypto.a" ]]; then
        local ssl_size=$(stat -f%z "$target_dir/lib/libssl.a" 2>/dev/null || stat -c%s "$target_dir/lib/libssl.a" 2>/dev/null || echo 0)
        local crypto_size=$(stat -f%z "$target_dir/lib/libcrypto.a" 2>/dev/null || stat -c%s "$target_dir/lib/libcrypto.a" 2>/dev/null || echo 0)
        if [[ "$ssl_size" -gt 0 && "$crypto_size" -gt 0 ]]; then
            log_info "⚡ Using cached OpenSSL build for $arch (SSL: $(numfmt --to=iec "$ssl_size"), Crypto: $(numfmt --to=iec "$crypto_size"))"
            return 0
        fi
    fi
    
    mkdir -p "$target_dir"
    
    log_info "⚙️ Configuring OpenSSL for $arch with 2025 security standards..."
    
    # Professional OpenSSL configuration with enhanced security for 2025
    local configure_args=(
        "$openssl_arch"
        -D__ANDROID_API__="$ANDROID_API"
        --prefix="$target_dir"
        --openssldir="$target_dir"
        -no-shared
        -static
        -no-asm                    # Disable assembly for better compatibility
        -no-zlib                   # Disable zlib compression
        -no-comp                   # Disable compression algorithms
        -no-dgram                  # Disable datagram support
        -no-filenames              # Remove file name strings
        -no-cms                    # Disable CMS support
        -no-capieng               # Disable CAPI engine
        -no-deprecated             # Disable deprecated functions for 2025
        -no-dynamic-engine         # Static linking only
        -no-tests                  # Skip test suite for faster builds
        # 2025 Security enhancements
        -DOPENSSL_TLS_SECURITY_LEVEL=2  # Higher security level
        -DOPENSSL_USE_NODELETE         # Memory security
        # Performance optimizations
        -O3                            # Maximum optimization
        -DNDEBUG                       # Release build
        -ffunction-sections            # Enable dead code elimination
        -fdata-sections
    )
    
    # Execute professional configuration
    if ! ./Configure "${configure_args[@]}"; then
        log_error "OpenSSL configuration failed for $arch"
        return 1
    fi
    
    log_info "🏗️ Compiling OpenSSL for $arch with $TA_BUILD_THREADS threads..."
    if ! make -j "$TA_BUILD_THREADS"; then
        log_error "OpenSSL compilation failed for $arch"
        return 1
    fi
    
    log_info "📦 Installing OpenSSL $arch libraries..."
    if ! make install; then
        log_error "OpenSSL installation failed for $arch"
        return 1
    fi
    
    # Professional cleanup
    make clean || log_warn "OpenSSL build cleanup failed for $arch"
    
    # Validate OpenSSL build output
    if [[ -f "$target_dir/lib/libssl.a" && -f "$target_dir/lib/libcrypto.a" ]]; then
        local ssl_size=$(stat -f%z "$target_dir/lib/libssl.a" 2>/dev/null || stat -c%s "$target_dir/lib/libssl.a" 2>/dev/null || echo 0)
        local crypto_size=$(stat -f%z "$target_dir/lib/libcrypto.a" 2>/dev/null || stat -c%s "$target_dir/lib/libcrypto.a" 2>/dev/null || echo 0)
        local total_size=$((ssl_size + crypto_size))
        local build_time=$(($(date +%s) - build_start))
        
        log_success "✅ Successfully built OpenSSL $arch in ${build_time}s"
        log_success "   - libssl.a: $(numfmt --to=iec "$ssl_size")"
        log_success "   - libcrypto.a: $(numfmt --to=iec "$crypto_size")"
        
        # Update build manifest
        local temp_manifest=$(mktemp)
        jq --arg arch "$android_abi" --arg ssl_size "$ssl_size" --arg crypto_size "$crypto_size" --arg time "$build_time" \
           '.builds += [{"arch": $arch, "ssl_size": ($ssl_size | tonumber), "crypto_size": ($crypto_size | tonumber), "build_time": ($time | tonumber), "success": true}]' \
           "$BUILD_MANIFEST" > "$temp_manifest"
        mv "$temp_manifest" "$BUILD_MANIFEST"
        
        return 0
    else
        log_error "OpenSSL build output not found for $arch"
        return 1
    fi
}

# Professional parallel OpenSSL build execution with 2025 optimizations
if [[ "$TA_ENABLE_PARALLEL_BUILDS" == "true" && ${#BUILD_ARCHS[@]} -gt 1 ]]; then
    log_info "🚀 Starting parallel OpenSSL build for ${#BUILD_ARCHS[@]} architectures..."
    
    # Background job management for parallel builds
    declare -a BUILD_PIDS=()
    
    for arch in "${BUILD_ARCHS[@]}"; do
        if [[ -v OPENSSL_ARCH_CONFIG[$arch] ]]; then
            (
                build_openssl_architecture "$arch"
                echo $? > "/tmp/openssl_result_$arch"
            ) &
            BUILD_PIDS+=($!)
            log_info "Started background OpenSSL build for $arch (PID: $!)"
        else
            log_error "Unsupported architecture for OpenSSL: $arch"
        fi
    done
    
    # Monitor parallel builds with progress reporting
    local completed_builds=0
    local failed_builds=()
    
    for i in "${!BUILD_PIDS[@]}"; do
        local pid=${BUILD_PIDS[$i]}
        local arch=${BUILD_ARCHS[$i]}
        
        log_info "Waiting for OpenSSL $arch build completion..."
        
        if wait "$pid"; then
            local result_code=$(cat "/tmp/openssl_result_$arch" 2>/dev/null || echo 1)
            if [[ "$result_code" -eq 0 ]]; then
                completed_builds=$((completed_builds + 1))
                log_success "✅ Parallel OpenSSL build completed successfully for $arch ($completed_builds/${#BUILD_ARCHS[@]})"
            else
                failed_builds+=("$arch")
                log_error "❌ Parallel OpenSSL build failed for $arch"
            fi
        else
            failed_builds+=("$arch")
            log_error "❌ Parallel OpenSSL build process failed for $arch"
        fi
        
        # Cleanup temp files
        rm -f "/tmp/openssl_result_$arch"
    done
    
    # Report parallel build results
    if [[ ${#failed_builds[@]} -gt 0 ]]; then
        log_error "Failed parallel OpenSSL builds: ${failed_builds[*]}"
    fi
    
else
    # Sequential build for maximum reliability
    log_info "🔄 Starting sequential OpenSSL build process..."
    
    local completed_builds=0
    local failed_builds=()
    
    for arch in "${BUILD_ARCHS[@]}"; do
        if [[ -v OPENSSL_ARCH_CONFIG[$arch] ]]; then
            if build_openssl_architecture "$arch"; then
                completed_builds=$((completed_builds + 1))
                log_success "✅ Sequential OpenSSL build completed for $arch ($completed_builds/${#BUILD_ARCHS[@]})"
            else
                failed_builds+=("$arch")
                log_error "❌ Sequential OpenSSL build failed for $arch"
            fi
        else
            log_error "Unsupported architecture for OpenSSL: $arch"
        fi
    done
    
    # Report sequential build results
    if [[ ${#failed_builds[@]} -gt 0 ]]; then
        log_error "Failed sequential OpenSSL builds: ${failed_builds[*]}"
    fi
fi

# Professional OpenSSL build summary and validation
log_info "🔍 Validating OpenSSL cryptography libraries..."

TOTAL_BUILT=0
TOTAL_SSL_SIZE=0
TOTAL_CRYPTO_SIZE=0
BUILD_SUMMARY=""

for arch in "${BUILD_ARCHS[@]}"; do
    if [[ -v OPENSSL_ARCH_CONFIG[$arch] ]]; then
        local config=(${OPENSSL_ARCH_CONFIG[$arch]})
        local android_abi=${config[1]}
        local ssl_path="$EXTERNAL_LIBS_ROOT/openssl/$android_abi/lib/libssl.a"
        local crypto_path="$EXTERNAL_LIBS_ROOT/openssl/$android_abi/lib/libcrypto.a"
        
        if [[ -f "$ssl_path" && -f "$crypto_path" ]]; then
            local ssl_size=$(stat -f%z "$ssl_path" 2>/dev/null || stat -c%s "$ssl_path" 2>/dev/null || echo 0)
            local crypto_size=$(stat -f%z "$crypto_path" 2>/dev/null || stat -c%s "$crypto_path" 2>/dev/null || echo 0)
            TOTAL_BUILT=$((TOTAL_BUILT + 1))
            TOTAL_SSL_SIZE=$((TOTAL_SSL_SIZE + ssl_size))
            TOTAL_CRYPTO_SIZE=$((TOTAL_CRYPTO_SIZE + crypto_size))
            BUILD_SUMMARY+="  ✅ $android_abi: SSL=$(numfmt --to=iec "$ssl_size"), Crypto=$(numfmt --to=iec "$crypto_size")\n"
        else
            BUILD_SUMMARY+="  ❌ $android_abi: OpenSSL build failed or missing\n"
        fi
    fi
done

# Update final OpenSSL build manifest
local temp_manifest=$(mktemp)
local total_time=$(($(date +%s) - BUILD_START_TIME))
jq --arg total "$TOTAL_BUILT" --arg ssl_size "$TOTAL_SSL_SIZE" --arg crypto_size "$TOTAL_CRYPTO_SIZE" --arg time "$total_time" \
   '.summary = {"total_successful": ($total | tonumber), "total_ssl_size": ($ssl_size | tonumber), "total_crypto_size": ($crypto_size | tonumber), "total_build_time": ($time | tonumber)}' \
   "$BUILD_MANIFEST" > "$temp_manifest"
mv "$temp_manifest" "$BUILD_MANIFEST"

# Professional OpenSSL build completion report
local total_size=$((TOTAL_SSL_SIZE + TOTAL_CRYPTO_SIZE))
log_success "🔐 Trading Anarchy OpenSSL Build Summary:"
log_success "  - Successful Builds: $TOTAL_BUILT/${#BUILD_ARCHS[@]}"
log_success "  - Total SSL Library Size: $(numfmt --to=iec "$TOTAL_SSL_SIZE")"
log_success "  - Total Crypto Library Size: $(numfmt --to=iec "$TOTAL_CRYPTO_SIZE")"
log_success "  - Combined Library Size: $(numfmt --to=iec "$total_size")"
log_success "  - Total Build Time: $((total_time / 60))m $((total_time % 60))s"
log_success "  - Build Manifest: $BUILD_MANIFEST"
echo -e "  - Architecture Details:\n$BUILD_SUMMARY"

if [[ "$TOTAL_BUILT" -eq ${#BUILD_ARCHS[@]} ]]; then
    log_success "🚀 All OpenSSL cryptography libraries built successfully with 2025 security standards!"
    exit 0
else
    log_error "⚠️ Some OpenSSL builds failed. Check logs above for details."
    exit 1
fi
