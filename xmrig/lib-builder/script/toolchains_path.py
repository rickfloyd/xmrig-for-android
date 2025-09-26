#!/usr/bin/env python3
"""
Trading Anarchy - Android Compute Engine
Advanced Toolchain Path Utility - Professional build system with 2025 optimizations
Copyright (c) 2025 Trading Anarchy. All rights reserved.
Version: 2025.1.0 - Enhanced Detection, Caching & Performance Monitoring
"""

import argparse
import json
import os
import platform
import sys
import tempfile
import time
from pathlib import Path


class ToolchainPathManager:
    """Professional toolchain path manager with 2025 enhancements."""
    
    def __init__(self):
        self.start_time = time.time()
        self.cache_enabled = os.getenv('TA_ENABLE_BUILD_CACHE', 'true').lower() == 'true'
        self.cache_file = os.path.join(tempfile.gettempdir(), 'ta_toolchain_cache.json')
        self.verbose = os.getenv('TA_BUILD_LOG_LEVEL', 'INFO') != 'ERROR'
        
    def log(self, message, level='INFO'):
        """Enhanced logging with timestamp and level."""
        if self.verbose or level == 'ERROR':
            timestamp = time.strftime('%Y-%m-%d %H:%M:%S')
            print(f"[{timestamp}] [{level}] Trading Anarchy Toolchain: {message}", file=sys.stderr)
    
    def get_host_tag(self, ndk_dir=None):
        """Enhanced host tag detection with comprehensive platform support."""
        system = platform.system().lower()
        machine = platform.machine().lower()
        
        self.log(f"Detecting host platform: {system} ({machine})")
        
        # Enhanced platform detection for 2025
        if system == 'linux':
            if machine in ['x86_64', 'amd64']:
                return 'linux-x86_64'
            elif machine in ['aarch64', 'arm64']:
                return 'linux-aarch64'  # Added ARM64 Linux support
            else:
                self.log(f"Unsupported Linux architecture: {machine}", 'ERROR')
                return None
                
        elif system == 'darwin':
            if machine in ['x86_64', 'amd64']:
                return 'darwin-x86_64'
            elif machine in ['arm64', 'aarch64']:
                return 'darwin-arm64'  # Added Apple Silicon support
            else:
                self.log(f"Unsupported macOS architecture: {machine}", 'ERROR')
                return None
                
        elif system in ['windows', 'win32', 'cygwin']:
            # Enhanced Windows detection with fallback
            host_tag = 'windows-x86_64'
            if ndk_dir and not os.path.exists(os.path.join(ndk_dir, 'prebuilt', host_tag)):
                host_tag = 'windows'  # Legacy fallback
                self.log(f"Using legacy Windows host tag: {host_tag}")
            return host_tag
            
        else:
            self.log(f"Unsupported platform: {system}", 'ERROR')
            return None
    
    def validate_ndk_directory(self, ndk_dir):
        """Enhanced NDK directory validation with detailed reporting."""
        if not os.path.isdir(ndk_dir):
            self.log(f"NDK directory does not exist: {ndk_dir}", 'ERROR')
            return False
            
        # Check for essential NDK components
        required_paths = [
            'toolchains/llvm/prebuilt',
            'build/cmake',
            'sources'
        ]
        
        for req_path in required_paths:
            full_path = os.path.join(ndk_dir, req_path)
            if not os.path.exists(full_path):
                self.log(f"Missing required NDK component: {req_path}", 'ERROR')
                return False
                
        self.log(f"NDK directory validated successfully: {ndk_dir}")
        return True
    
    def get_cached_toolchain_path(self, ndk_dir, host_tag):
        """Enhanced caching system with validation and expiration."""
        if not self.cache_enabled:
            return None
            
        try:
            if os.path.exists(self.cache_file):
                with open(self.cache_file, 'r') as f:
                    cache_data = json.load(f)
                    
                # Validate cache entry
                cache_key = f"{ndk_dir}:{host_tag}"
                if cache_key in cache_data:
                    cached_entry = cache_data[cache_key]
                    cached_path = cached_entry.get('path')
                    cache_time = cached_entry.get('timestamp', 0)
                    
                    # Check if cache is still valid (24 hours)
                    if time.time() - cache_time < 86400 and os.path.exists(cached_path):
                        self.log(f"Using cached toolchain path: {cached_path}")
                        return cached_path
                    else:
                        self.log("Cache entry expired or invalid, refreshing...")
                        
        except (json.JSONDecodeError, KeyError, OSError) as e:
            self.log(f"Cache read error: {e}", 'WARN')
            
        return None
    
    def cache_toolchain_path(self, ndk_dir, host_tag, toolchain_path):
        """Enhanced caching with metadata and validation."""
        if not self.cache_enabled:
            return
            
        try:
            cache_data = {}
            if os.path.exists(self.cache_file):
                with open(self.cache_file, 'r') as f:
                    cache_data = json.load(f)
                    
            cache_key = f"{ndk_dir}:{host_tag}"
            cache_data[cache_key] = {
                'path': toolchain_path,
                'timestamp': time.time(),
                'ndk_version': self.detect_ndk_version(ndk_dir),
                'host_tag': host_tag
            }
            
            # Keep only last 10 entries to prevent unlimited growth
            if len(cache_data) > 10:
                # Remove oldest entries
                sorted_entries = sorted(cache_data.items(), 
                                      key=lambda x: x[1].get('timestamp', 0))
                cache_data = dict(sorted_entries[-10:])
            
            with open(self.cache_file, 'w') as f:
                json.dump(cache_data, f, indent=2)
                
            self.log(f"Cached toolchain path for future use")
            
        except (OSError, json.JSONEncodeError) as e:
            self.log(f"Cache write error: {e}", 'WARN')
    
    def detect_ndk_version(self, ndk_dir):
        """Detect NDK version from source.properties file."""
        try:
            source_props = os.path.join(ndk_dir, 'source.properties')
            if os.path.exists(source_props):
                with open(source_props, 'r') as f:
                    for line in f:
                        if line.startswith('Pkg.Revision'):
                            version = line.split('=')[1].strip()
                            return version
        except Exception:
            pass
        return "unknown"
    
    def find_toolchain_path(self, ndk_dir, host_tag):
        """Enhanced toolchain path discovery with comprehensive validation."""
        # Check cache first
        cached_path = self.get_cached_toolchain_path(ndk_dir, host_tag)
        if cached_path:
            return cached_path
            
        # Standard toolchain path
        toolchain_path = os.path.join(ndk_dir, 'toolchains', 'llvm', 'prebuilt', host_tag)
        
        if os.path.exists(toolchain_path):
            # Validate toolchain completeness
            required_tools = ['bin/clang', 'bin/clang++']
            if sys.platform.startswith('win'):
                required_tools = ['bin/clang.exe', 'bin/clang++.exe']
                
            for tool in required_tools:
                tool_path = os.path.join(toolchain_path, tool)
                if not os.path.exists(tool_path):
                    self.log(f"Missing required tool: {tool}", 'ERROR')
                    return None
                    
            self.log(f"Found valid toolchain: {toolchain_path}")
            
            # Cache the result
            self.cache_toolchain_path(ndk_dir, host_tag, toolchain_path)
            return toolchain_path
        else:
            self.log(f"Toolchain not found: {toolchain_path}", 'ERROR')
            return None
    
    def get_toolchain_path(self, ndk_dir):
        """Main entry point with enhanced error handling and reporting."""
        self.log(f"Initializing Trading Anarchy toolchain detection...")
        self.log(f"NDK Directory: {ndk_dir}")
        
        # Validate NDK directory
        if not self.validate_ndk_directory(ndk_dir):
            self.log("NDK validation failed", 'ERROR')
            return None
            
        # Detect host platform
        host_tag = self.get_host_tag(ndk_dir)
        if not host_tag:
            self.log("Host platform detection failed", 'ERROR')
            return None
            
        self.log(f"Host platform: {host_tag}")
        
        # Find toolchain path
        toolchain_path = self.find_toolchain_path(ndk_dir, host_tag)
        if not toolchain_path:
            self.log("Toolchain path discovery failed", 'ERROR')
            return None
            
        # Performance reporting
        elapsed_time = time.time() - self.start_time
        self.log(f"Toolchain detection completed in {elapsed_time:.3f}s")
        
        return toolchain_path


def main():
    """Enhanced main function with professional argument parsing."""
    parser = argparse.ArgumentParser(
        description='Trading Anarchy Android Compute Engine Toolchain Locator',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog='''
Examples:
  %(prog)s --ndk /opt/android-ndk-r27
  %(prog)s --ndk C:\\Android\\ndk\\27.0.10718614 --verbose
        '''
    )
    
    parser.add_argument(
        '--ndk', 
        required=True,
        help='The Android NDK installation directory path'
    )
    
    parser.add_argument(
        '--verbose',
        action='store_true',
        help='Enable verbose logging output'
    )
    
    parser.add_argument(
        '--no-cache',
        action='store_true',
        help='Disable caching of toolchain paths'
    )
    
    parser.add_argument(
        '--version',
        action='version',
        version='Trading Anarchy Toolchain Locator 2025.1.0'
    )
    
    args = parser.parse_args()
    
    # Configure environment based on arguments
    if args.verbose:
        os.environ['TA_BUILD_LOG_LEVEL'] = 'DEBUG'
        
    if args.no_cache:
        os.environ['TA_ENABLE_BUILD_CACHE'] = 'false'
    
    # Initialize toolchain manager and find path
    manager = ToolchainPathManager()
    toolchain_path = manager.get_toolchain_path(args.ndk)
    
    if toolchain_path:
        print(toolchain_path)
        sys.exit(0)
    else:
        manager.log("Toolchain path detection failed", 'ERROR')
        sys.exit(1)


if __name__ == '__main__':
    main()