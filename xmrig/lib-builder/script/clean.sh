#!/usr/bin/env bash
#
# Trading Anarchy - Android Compute Engine
# Advanced Build Cleaner - Intelligent cleanup with 2025 optimizations
# Copyright (c) 2025 Trading Anarchy. All rights reserved.
# Version: 2025.1.0 - Smart Cleanup, Cache Management & Performance Monitoring
#

# Professional error handling and debugging for 2025
set -euo pipefail
set -o posix

# Performance monitoring
CLEAN_START_TIME=$(date +%s)

# Source enhanced environment configuration
source script/env.sh

log_info "Starting Trading Anarchy Build Environment Cleanup..."

# Professional cleanup options with 2025 intelligence
CLEANUP_MODE="${1:-standard}"
PRESERVE_CACHE="${TA_PRESERVE_BUILD_CACHE:-false}"
PRESERVE_DOWNLOADS="${TA_PRESERVE_DOWNLOADS:-false}"

case "$CLEANUP_MODE" in
    "standard")
        log_info "Performing standard cleanup (preserves cache and downloads)"
        PRESERVE_CACHE="true"
        PRESERVE_DOWNLOADS="true"
        ;;
    "deep")
        log_info "Performing deep cleanup (removes cache but preserves downloads)"
        PRESERVE_CACHE="false"
        PRESERVE_DOWNLOADS="true"
        ;;
    "full")
        log_info "Performing full cleanup (removes everything including downloads)"
        PRESERVE_CACHE="false"
        PRESERVE_DOWNLOADS="false"
        ;;
    *)
        log_error "Invalid cleanup mode: $CLEANUP_MODE. Use: standard, deep, or full"
        ;;
esac

# Calculate cleanup scope and disk space recovery
calculate_cleanup_size() {
    local dir="$1"
    if [[ -d "$dir" ]]; then
        local size=$(du -sb "$dir" 2>/dev/null | cut -f1 || echo 0)
        echo "$size"
    else
        echo "0"
    fi
}

# Professional directory size calculation
BUILD_SIZE=$(calculate_cleanup_size "$EXTERNAL_LIBS_BUILD")
CACHE_SIZE=0
DOWNLOADS_SIZE=0

if [[ "$PRESERVE_CACHE" == "false" && -d "$TA_BUILD_CACHE_DIR" ]]; then
    CACHE_SIZE=$(calculate_cleanup_size "$TA_BUILD_CACHE_DIR")
fi

if [[ "$PRESERVE_DOWNLOADS" == "false" ]]; then
    DOWNLOADS_SIZE=$(calculate_cleanup_size "$EXTERNAL_LIBS_BUILD_ROOT")
fi

TOTAL_CLEANUP_SIZE=$((BUILD_SIZE + CACHE_SIZE + DOWNLOADS_SIZE))

log_info "Cleanup Analysis:"
log_info "  - Build artifacts: $(numfmt --to=iec "$BUILD_SIZE")"
log_info "  - Cache data: $(numfmt --to=iec "$CACHE_SIZE")"
log_info "  - Downloads: $(numfmt --to=iec "$DOWNLOADS_SIZE")"
log_info "  - Total recovery: $(numfmt --to=iec "$TOTAL_CLEANUP_SIZE")"

# Enhanced cleanup execution with progress tracking
cleanup_directory() {
    local dir="$1"
    local description="$2"
    local preserve="$3"
    
    if [[ "$preserve" == "true" ]]; then
        log_info "⚡ Preserving $description: $dir"
        return 0
    fi
    
    if [[ -d "$dir" ]]; then
        local size=$(calculate_cleanup_size "$dir")
        log_info "🧹 Cleaning $description ($dir)..."
        
        # Smart cleanup with error handling
        if rm -rf "$dir" 2>/dev/null; then
            log_success "✅ Cleaned $description (recovered $(numfmt --to=iec "$size"))"
        else
            log_warn "⚠️ Partial cleanup of $description (some files may be in use)"
            # Try to clean individual components
            find "$dir" -type f -delete 2>/dev/null || true
        fi
    else
        log_info "💨 $description already clean: $dir"
    fi
}

# Professional cleanup execution
log_info "🚀 Executing intelligent cleanup process..."

# Clean build artifacts (always cleaned)
cleanup_directory "$EXTERNAL_LIBS_BUILD" "build artifacts" "false"

# Clean cache if requested
if [[ -n "${TA_BUILD_CACHE_DIR:-}" ]]; then
    cleanup_directory "$TA_BUILD_CACHE_DIR" "build cache" "$PRESERVE_CACHE"
fi

# Clean temporary files
if [[ -n "${TA_BUILD_TEMP_DIR:-}" ]]; then
    cleanup_directory "$TA_BUILD_TEMP_DIR" "temporary files" "false"
fi

# Clean downloads if requested (deep cleanup)
if [[ "$PRESERVE_DOWNLOADS" == "false" ]]; then
    cleanup_directory "$EXTERNAL_LIBS_BUILD_ROOT" "source downloads" "false"
fi

# Recreate essential build directory structure
log_info "🏗️ Recreating build directory structure..."
mkdir -p "$EXTERNAL_LIBS_BUILD/src"

# Professional cache management for 2025
if [[ "$TA_ENABLE_BUILD_CACHE" == "true" && "$PRESERVE_CACHE" == "true" ]]; then
    mkdir -p "$TA_BUILD_CACHE_DIR" "$TA_BUILD_TEMP_DIR"
    log_info "📦 Build cache preserved for faster rebuilds"
fi

# Clean system temporary files related to Trading Anarchy
log_info "🧽 Cleaning system temporary files..."
find /tmp -name "ta_*" -type f -mtime +1 -delete 2>/dev/null || true
find /tmp -name "*_ta_*" -type f -mtime +1 -delete 2>/dev/null || true
find /tmp -name "build_result_*" -type f -delete 2>/dev/null || true
find /tmp -name "*_result_*" -type f -delete 2>/dev/null || true

# Cleanup log files older than 7 days
if [[ -d "/tmp" ]]; then
    find /tmp -name "ta_build_*.log" -type f -mtime +7 -delete 2>/dev/null || true
fi

# Validate cleanup success
log_info "🔍 Validating cleanup results..."
REMAINING_BUILD_SIZE=$(calculate_cleanup_size "$EXTERNAL_LIBS_BUILD")
RECOVERED_SPACE=$((TOTAL_CLEANUP_SIZE - REMAINING_BUILD_SIZE))

# Professional cleanup summary
CLEANUP_TIME=$(($(date +%s) - CLEAN_START_TIME))
log_success "🎯 Trading Anarchy Cleanup Summary:"
log_success "  - Cleanup Mode: $CLEANUP_MODE"
log_success "  - Space Recovered: $(numfmt --to=iec "$RECOVERED_SPACE")"
log_success "  - Remaining Build Data: $(numfmt --to=iec "$REMAINING_BUILD_SIZE")"
log_success "  - Cache Preserved: $PRESERVE_CACHE"
log_success "  - Downloads Preserved: $PRESERVE_DOWNLOADS"
log_success "  - Cleanup Time: ${CLEANUP_TIME}s"
log_success "  - Build Structure: Ready for next build"

log_success "✨ Trading Anarchy build environment cleaned and prepared for 2025 development!"

exit 0
