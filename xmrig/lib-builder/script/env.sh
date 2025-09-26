#!/usr/bin/env bash
#
# Trading Anarchy - Android Compute Engine
# Advanced Environment Configuration - Professional build environment with 2025 optimizations
# Copyright (c) 2025 Trading Anarchy. All rights reserved.
# Version: 2025.1.0 - Enhanced Performance & Security
#

# Strict error handling and debugging for 2025
set -euo pipefail
set -o posix

# Enhanced logging and performance monitoring
export TA_SCRIPT_START_TIME=$(date +%s)
export TA_BUILD_LOG_LEVEL=${TA_BUILD_LOG_LEVEL:-"INFO"}
export TA_ENABLE_BUILD_CACHE=${TA_ENABLE_BUILD_CACHE:-"true"}
export TA_ENABLE_PARALLEL_BUILDS=${TA_ENABLE_PARALLEL_BUILDS:-"true"}
export TA_BUILD_THREADS=${TA_BUILD_THREADS:-$(nproc 2>/dev/null || echo 4)}

# Professional logging system for 2025
log() {
    local level=$1
    shift
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo "[$timestamp] [$level] Trading Anarchy Build System: $*" >&2
}

log_info() { [[ "$TA_BUILD_LOG_LEVEL" != "ERROR" ]] && log "INFO" "$@"; }
log_warn() { log "WARN" "$@"; }
log_error() { log "ERROR" "$@"; exit 1; }
log_success() { log "SUCCESS" "$@"; }

# Enhanced realpath with validation
realpath() {
    local path="$1"
    if [[ $path = /* ]]; then
        echo "$path"
    else
        echo "$PWD/${path#./}"
    fi
    
    # Validate path exists for critical paths
    if [[ "$2" == "--validate" ]] && [[ ! -e "$path" ]]; then
        log_error "Critical path does not exist: $path"
    fi
}

# Advanced Android SDK and NDK validation with 2025 standards
log_info "Initializing Trading Anarchy Android Build Environment..."

# Validate ANDROID_HOME with enhanced error reporting
if [[ -z "${ANDROID_HOME:-}" ]]; then
    log_error "ANDROID_HOME environment variable is not set. Please configure your Android SDK path."
fi

if [[ ! -d "$ANDROID_HOME" ]]; then
    log_error "ANDROID_HOME directory does not exist: $ANDROID_HOME"
fi

log_info "Android SDK located at: $ANDROID_HOME"

# Enhanced Android CLI tools detection with fallback support
ANDROID_CLI_TOOLS_PATH=""
if [[ -d "$ANDROID_HOME/cmdline-tools/latest" ]]; then
    ANDROID_CLI_TOOLS_PATH="$ANDROID_HOME/cmdline-tools/latest"
elif [[ -d "$ANDROID_HOME/cmdline-tools" ]]; then
    # Find latest version automatically
    ANDROID_CLI_TOOLS_PATH=$(find "$ANDROID_HOME/cmdline-tools" -maxdepth 1 -type d -name "[0-9]*" | sort -V | tail -1)
    if [[ -n "$ANDROID_CLI_TOOLS_PATH" ]]; then
        log_warn "Using CLI tools from: $ANDROID_CLI_TOOLS_PATH"
    fi
fi

if [[ -z "$ANDROID_CLI_TOOLS_PATH" || ! -d "$ANDROID_CLI_TOOLS_PATH" ]]; then
    log_error "Android command-line tools not found. Please install Android command-line tools via SDK Manager."
fi

# Professional NDK version detection with caching
NDK_VERSION_CACHE_FILE="/tmp/ta_ndk_version_cache"
if [[ "$TA_ENABLE_BUILD_CACHE" == "true" && -f "$NDK_VERSION_CACHE_FILE" ]]; then
    NDK_VERSION=$(cat "$NDK_VERSION_CACHE_FILE")
    log_info "Using cached NDK version: $NDK_VERSION"
else
    log_info "Detecting NDK version..."
    NDK_VERSION=$("$ANDROID_CLI_TOOLS_PATH/bin/sdkmanager" --list_installed | grep "ndk;" | head -n 1 | sed -E 's/(.*)(ndk\/)([0-9\.]+)/\3/' | xargs)
    
    if [[ -z "$NDK_VERSION" ]]; then
        log_error "No Android NDK found. Please install Android NDK using SDK Manager (minimum NDK r27 required for 2025 standards)."
    fi
    
    # Cache NDK version for performance
    if [[ "$TA_ENABLE_BUILD_CACHE" == "true" ]]; then
        echo "$NDK_VERSION" > "$NDK_VERSION_CACHE_FILE"
    fi
fi

log_success "Using NDK version: $NDK_VERSION"

# Validate minimum NDK version for 2025 standards
NDK_VERSION_NUM=$(echo "$NDK_VERSION" | cut -d. -f1)
if [[ "$NDK_VERSION_NUM" -lt 27 ]]; then
    log_warn "NDK version $NDK_VERSION is older than recommended NDK r27 for 2025 standards"
fi

# Professional NDK and toolchain configuration with 2025 optimizations
export NDK_VERSION
export ANDROID_NDK_HOME="${ANDROID_HOME}/ndk/${NDK_VERSION}"
export ANDROID_NDK_ROOT="${ANDROID_HOME}/ndk/${NDK_VERSION}"

# Validate NDK installation
if [[ ! -d "$ANDROID_NDK_HOME" ]]; then
    log_error "NDK directory not found: $ANDROID_NDK_HOME"
fi

# Enhanced toolchain path detection with caching
TOOLCHAIN_CACHE_FILE="/tmp/ta_toolchain_cache"
if [[ "$TA_ENABLE_BUILD_CACHE" == "true" && -f "$TOOLCHAIN_CACHE_FILE" ]]; then
    TOOLCHAINS_PATH=$(cat "$TOOLCHAIN_CACHE_FILE")
    log_info "Using cached toolchain path"
else
    log_info "Configuring toolchain paths..."
    TOOLCHAINS_PATH=$(python script/toolchains_path.py --ndk "${ANDROID_NDK_HOME}")
    
    if [[ "$TA_ENABLE_BUILD_CACHE" == "true" ]]; then
        echo "$TOOLCHAINS_PATH" > "$TOOLCHAIN_CACHE_FILE"
    fi
fi

export TOOLCHAINS_PATH
export ANDROID_NDK_ROOT=$(realpath "$ANDROID_NDK_ROOT" --validate)

log_info "Toolchain path: $TOOLCHAINS_PATH"

# Professional build directory configuration with 2025 structure
DEFAULT_EXTERNAL_LIBS_BUILD=$(pwd)/build/
EXTERNAL_LIBS_BUILD="${EXTERNAL_LIBS_BUILD:-${DEFAULT_EXTERNAL_LIBS_BUILD}}"
export EXTERNAL_LIBS_BUILD=${EXTERNAL_LIBS_BUILD%/}

DEFAULT_EXTERNAL_LIBS_BUILD_ROOT=${EXTERNAL_LIBS_BUILD}/src/
EXTERNAL_LIBS_BUILD_ROOT="${EXTERNAL_LIBS_BUILD_ROOT:-${DEFAULT_EXTERNAL_LIBS_BUILD_ROOT}}"
export EXTERNAL_LIBS_BUILD_ROOT=${EXTERNAL_LIBS_BUILD_ROOT%/}

DEFAULT_EXTERNAL_LIBS_ROOT=${EXTERNAL_LIBS_BUILD}/build/
EXTERNAL_LIBS_ROOT="${EXTERNAL_LIBS_ROOT:-${DEFAULT_EXTERNAL_LIBS_ROOT}}"
export EXTERNAL_LIBS_ROOT=${EXTERNAL_LIBS_ROOT%/}

DEFAULT_NDK_TOOL_DIR=${EXTERNAL_LIBS_BUILD}/tool/
NDK_TOOL_DIR="${NDK_TOOL_DIR:-${DEFAULT_NDK_TOOL_DIR}}"
export NDK_TOOL_DIR=${NDK_TOOL_DIR%/}

# Enhanced build cache configuration for 2025
export TA_BUILD_CACHE_DIR="${EXTERNAL_LIBS_BUILD}/cache"
export TA_BUILD_TEMP_DIR="${EXTERNAL_LIBS_BUILD}/temp"

# Create essential directories with proper permissions
mkdir -p "$EXTERNAL_LIBS_BUILD" "$EXTERNAL_LIBS_BUILD_ROOT" "$EXTERNAL_LIBS_ROOT" "$NDK_TOOL_DIR"
if [[ "$TA_ENABLE_BUILD_CACHE" == "true" ]]; then
    mkdir -p "$TA_BUILD_CACHE_DIR" "$TA_BUILD_TEMP_DIR"
fi

# Professional environment validation and reporting
log_info "Build Environment Configuration:"
log_info "  - Android SDK: $ANDROID_HOME"
log_info "  - NDK Version: $NDK_VERSION"
log_info "  - NDK Path: $ANDROID_NDK_HOME"
log_info "  - Build Directory: $EXTERNAL_LIBS_BUILD"
log_info "  - Source Directory: $EXTERNAL_LIBS_BUILD_ROOT"
log_info "  - Output Directory: $EXTERNAL_LIBS_ROOT"
log_info "  - Build Threads: $TA_BUILD_THREADS"
log_info "  - Build Cache: $TA_ENABLE_BUILD_CACHE"
log_info "  - Parallel Builds: $TA_ENABLE_PARALLEL_BUILDS"

# Performance monitoring export
export TA_ENV_SETUP_TIME=$(($(date +%s) - TA_SCRIPT_START_TIME))
log_success "Trading Anarchy build environment initialized successfully in ${TA_ENV_SETUP_TIME}s"

# Professional cleanup function for 2025
cleanup_build_environment() {
    local exit_code=$?
    log_info "Cleaning up build environment..."
    
    # Remove temporary files if enabled
    if [[ "$TA_ENABLE_BUILD_CACHE" == "true" && -d "$TA_BUILD_TEMP_DIR" ]]; then
        find "$TA_BUILD_TEMP_DIR" -type f -mtime +1 -delete 2>/dev/null || true
    fi
    
    if [[ $exit_code -eq 0 ]]; then
        log_success "Build environment cleanup completed successfully"
    else
        log_error "Build environment cleanup completed with errors (exit code: $exit_code)"
    fi
}

# Register cleanup function
trap cleanup_build_environment EXIT
