#!/bin/bash
# Trading Anarchy Android Compute Engine - Build and Package Script
# 2025 Professional Version - Complete Android App Development Pipeline
# 
# This script provides comprehensive build, package, and deployment capabilities
# for the Trading Anarchy Android Compute Engine with XMRig integration.

set -e  # Exit on any error

# Configuration
PROJECT_NAME="Trading Anarchy Android Compute Engine"
PACKAGE_NAME="com.tradinganarchy.computeengine"
VERSION_MAJOR=2025
VERSION_MINOR=1
VERSION_PATCH=0
BUILD_DIR="build"
OUTPUT_DIR="output"
ANDROID_DIR="android"
KEYSTORE_DIR="keystores"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Print banner
print_banner() {
    echo -e "${BLUE}"
    echo "=========================================="
    echo "  Trading Anarchy Android Build System"
    echo "        2025 Professional Edition"
    echo "=========================================="
    echo -e "${NC}"
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking build prerequisites..."
    
    local missing_tools=()
    
    # Check Node.js and npm
    if ! command -v node &> /dev/null; then
        missing_tools+=("node")
    fi
    
    if ! command -v npm &> /dev/null; then
        missing_tools+=("npm")
    fi
    
    # Check Android SDK
    if [[ -z "$ANDROID_SDK_ROOT" && -z "$ANDROID_HOME" ]]; then
        log_warning "ANDROID_SDK_ROOT or ANDROID_HOME not set"
        missing_tools+=("Android SDK")
    fi
    
    # Check Java
    if ! command -v java &> /dev/null; then
        missing_tools+=("java")
    fi
    
    # Check Gradle
    if ! command -v gradle &> /dev/null && [[ ! -f "./gradlew" ]]; then
        missing_tools+=("gradle")
    fi
    
    # Check CMake for native builds
    if ! command -v cmake &> /dev/null; then
        missing_tools+=("cmake")
    fi
    
    # Check Android NDK
    if [[ -n "$ANDROID_SDK_ROOT" ]]; then
        if [[ ! -d "$ANDROID_SDK_ROOT/ndk" ]]; then
            missing_tools+=("Android NDK")
        fi
    fi
    
    if [[ ${#missing_tools[@]} -gt 0 ]]; then
        log_error "Missing required tools: ${missing_tools[*]}"
        log_info "Please install the missing tools and try again."
        exit 1
    fi
    
    log_success "All prerequisites satisfied"
}

# Setup build environment
setup_environment() {
    log_info "Setting up build environment..."
    
    # Create directories
    mkdir -p "$BUILD_DIR"
    mkdir -p "$OUTPUT_DIR"
    mkdir -p "$KEYSTORE_DIR"
    
    # Set environment variables
    export NODE_ENV=production
    export ANDROID_COMPILE_SDK=35
    export ANDROID_BUILD_TOOLS_VERSION=35.0.0
    export ANDROID_TARGET_SDK=35
    export ANDROID_MIN_SDK=24
    export NDK_VERSION=27.2.12479018
    
    # Create version file
    cat > "$BUILD_DIR/version.properties" << EOF
versionMajor=$VERSION_MAJOR
versionMinor=$VERSION_MINOR
versionPatch=$VERSION_PATCH
versionCode=$((VERSION_MAJOR * 1000 + VERSION_MINOR * 100 + VERSION_PATCH))
versionName=$VERSION_MAJOR.$VERSION_MINOR.$VERSION_PATCH
buildDate=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
gitCommit=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")
buildNumber=${BUILD_NUMBER:-1}
EOF
    
    log_success "Environment configured"
}

# Install dependencies
install_dependencies() {
    log_info "Installing dependencies..."
    
    # Install npm dependencies
    if [[ -f "package.json" ]]; then
        npm install --production=false
        log_success "Node.js dependencies installed"
    fi
    
    # Install React Native dependencies
    if command -v npx &> /dev/null; then
        npx react-native doctor || true
    fi
    
    log_success "Dependencies installed"
}

# Build native libraries
build_native_libraries() {
    log_info "Building native libraries..."
    
    # Create CMake build directory
    mkdir -p "$BUILD_DIR/cmake"
    cd "$BUILD_DIR/cmake"
    
    # Configure CMake for Android
    cmake ../../ \
        -DCMAKE_TOOLCHAIN_FILE="$ANDROID_SDK_ROOT/ndk/$NDK_VERSION/build/cmake/android.toolchain.cmake" \
        -DANDROID_ABI=arm64-v8a \
        -DANDROID_NATIVE_API_LEVEL=24 \
        -DCMAKE_BUILD_TYPE=Release \
        -DBUILD_SHARED_LIBS=ON
    
    # Build native libraries
    cmake --build . --config Release --parallel $(nproc)
    
    cd ../..
    log_success "Native libraries built successfully"
}

# Build React Native bundle
build_react_native_bundle() {
    log_info "Building React Native bundle..."
    
    # Build JavaScript bundle
    npx react-native bundle \
        --platform android \
        --dev false \
        --entry-file index.js \
        --bundle-output "$BUILD_DIR/index.android.bundle" \
        --assets-dest "$BUILD_DIR/drawable-*"
    
    log_success "React Native bundle created"
}

# Generate keystore for release builds
generate_keystore() {
    local keystore_file="$KEYSTORE_DIR/trading-anarchy-release.keystore"
    local keystore_password="TradingAnarchy2025!"
    
    if [[ ! -f "$keystore_file" ]]; then
        log_info "Generating release keystore..."
        
        keytool -genkeypair \
            -alias trading-anarchy-key \
            -keyalg RSA \
            -keysize 4096 \
            -validity 36500 \
            -keystore "$keystore_file" \
            -storepass "$keystore_password" \
            -keypass "$keystore_password" \
            -dname "CN=Trading Anarchy, OU=Development, O=Trading Anarchy Ltd, L=Global, ST=Digital, C=WW"
        
        log_success "Release keystore generated: $keystore_file"
        log_warning "Store keystore password securely: $keystore_password"
    else
        log_info "Using existing keystore: $keystore_file"
    fi
}

# Build Android APK
build_apk() {
    local build_type=${1:-debug}
    log_info "Building Android APK ($build_type)..."
    
    cd "$ANDROID_DIR"
    
    if [[ "$build_type" == "release" ]]; then
        # Build release APK
        ./gradlew assembleRelease \
            -PMYAPP_UPLOAD_STORE_FILE="../$KEYSTORE_DIR/trading-anarchy-release.keystore" \
            -PMYAPP_UPLOAD_KEY_ALIAS=trading-anarchy-key \
            -PMYAPP_UPLOAD_STORE_PASSWORD="TradingAnarchy2025!" \
            -PMYAPP_UPLOAD_KEY_PASSWORD="TradingAnarchy2025!"
        
        # Copy APK to output directory
        cp app/build/outputs/apk/release/app-release.apk "../$OUTPUT_DIR/TradingAnarchy-$VERSION_MAJOR.$VERSION_MINOR.$VERSION_PATCH-release.apk"
        
    else
        # Build debug APK
        ./gradlew assembleDebug
        cp app/build/outputs/apk/debug/app-debug.apk "../$OUTPUT_DIR/TradingAnarchy-$VERSION_MAJOR.$VERSION_MINOR.$VERSION_PATCH-debug.apk"
    fi
    
    cd ..
    log_success "APK built successfully: $OUTPUT_DIR/"
}

# Build Android App Bundle (AAB)
build_aab() {
    log_info "Building Android App Bundle (AAB)..."
    
    cd "$ANDROID_DIR"
    
    # Build AAB
    ./gradlew bundleRelease \
        -PMYAPP_UPLOAD_STORE_FILE="../$KEYSTORE_DIR/trading-anarchy-release.keystore" \
        -PMYAPP_UPLOAD_KEY_ALIAS=trading-anarchy-key \
        -PMYAPP_UPLOAD_STORE_PASSWORD="TradingAnarchy2025!" \
        -PMYAPP_UPLOAD_KEY_PASSWORD="TradingAnarchy2025!"
    
    # Copy AAB to output directory
    cp app/build/outputs/bundle/release/app-release.aab "../$OUTPUT_DIR/TradingAnarchy-$VERSION_MAJOR.$VERSION_MINOR.$VERSION_PATCH-release.aab"
    
    cd ..
    log_success "AAB built successfully: $OUTPUT_DIR/"
}

# Run tests
run_tests() {
    log_info "Running tests..."
    
    # Run Jest tests
    if [[ -f "package.json" ]] && grep -q "test" package.json; then
        npm test
    fi
    
    # Run Android unit tests
    if [[ -d "$ANDROID_DIR" ]]; then
        cd "$ANDROID_DIR"
        ./gradlew testDebugUnitTest
        cd ..
    fi
    
    log_success "Tests completed"
}

# Generate documentation
generate_docs() {
    log_info "Generating documentation..."
    
    mkdir -p "$OUTPUT_DIR/docs"
    
    # Generate TypeScript documentation
    if command -v typedoc &> /dev/null; then
        npx typedoc --out "$OUTPUT_DIR/docs/api" src/
    fi
    
    # Create build information
    cat > "$OUTPUT_DIR/BUILD_INFO.md" << EOF
# Trading Anarchy Android Compute Engine - Build Information

## Version
- **Version**: $VERSION_MAJOR.$VERSION_MINOR.$VERSION_PATCH
- **Version Code**: $((VERSION_MAJOR * 1000 + VERSION_MINOR * 100 + VERSION_PATCH))
- **Build Date**: $(date -u +"%Y-%m-%d %H:%M:%S UTC")
- **Git Commit**: $(git rev-parse --short HEAD 2>/dev/null || echo "unknown")

## Features
- XMRig-based cryptocurrency mining engine
- React Native 0.76.5 with New Architecture
- Android API Level 35 target
- Native C++ libraries with CMake
- Hardware acceleration support
- Thermal and battery management
- Secure mining protocols (SSL/TLS)

## Build Configuration
- **NDK Version**: $NDK_VERSION
- **Compile SDK**: $ANDROID_COMPILE_SDK
- **Target SDK**: $ANDROID_TARGET_SDK
- **Min SDK**: $ANDROID_MIN_SDK
- **Build Tools**: $ANDROID_BUILD_TOOLS_VERSION

## Output Files
- **Debug APK**: TradingAnarchy-$VERSION_MAJOR.$VERSION_MINOR.$VERSION_PATCH-debug.apk
- **Release APK**: TradingAnarchy-$VERSION_MAJOR.$VERSION_MINOR.$VERSION_PATCH-release.apk
- **Release AAB**: TradingAnarchy-$VERSION_MAJOR.$VERSION_MINOR.$VERSION_PATCH-release.aab

## Security
- Release builds are signed with 4096-bit RSA key
- Native libraries are stripped of debug symbols
- ProGuard/R8 code obfuscation enabled
- Network security config enforced

## Installation
\`\`\`bash
# Install debug APK
adb install TradingAnarchy-$VERSION_MAJOR.$VERSION_MINOR.$VERSION_PATCH-debug.apk

# Install release APK
adb install TradingAnarchy-$VERSION_MAJOR.$VERSION_MINOR.$VERSION_PATCH-release.apk
\`\`\`

## Development
Built with Trading Anarchy Android Build System 2025
EOF
    
    log_success "Documentation generated"
}

# Deploy to device/emulator
deploy() {
    local apk_file="$OUTPUT_DIR/TradingAnarchy-$VERSION_MAJOR.$VERSION_MINOR.$VERSION_PATCH-debug.apk"
    
    if [[ ! -f "$apk_file" ]]; then
        log_error "APK file not found: $apk_file"
        exit 1
    fi
    
    log_info "Deploying to connected device/emulator..."
    
    # Check if device is connected
    if ! adb devices | grep -q "device$"; then
        log_error "No Android device/emulator connected"
        exit 1
    fi
    
    # Uninstall previous version
    adb uninstall "$PACKAGE_NAME" 2>/dev/null || true
    
    # Install new APK
    adb install "$apk_file"
    
    log_success "App deployed successfully"
}

# Clean build artifacts
clean() {
    log_info "Cleaning build artifacts..."
    
    rm -rf "$BUILD_DIR"
    rm -rf "$OUTPUT_DIR"
    
    if [[ -d "$ANDROID_DIR" ]]; then
        cd "$ANDROID_DIR"
        ./gradlew clean
        cd ..
    fi
    
    if [[ -f "package.json" ]]; then
        npm run clean 2>/dev/null || true
    fi
    
    log_success "Build artifacts cleaned"
}

# Main build function
build_all() {
    local build_type=${1:-debug}
    
    print_banner
    check_prerequisites
    setup_environment
    install_dependencies
    build_native_libraries
    build_react_native_bundle
    
    if [[ "$build_type" == "release" ]]; then
        generate_keystore
        run_tests
        build_apk release
        build_aab
    else
        build_apk debug
    fi
    
    generate_docs
    
    log_success "Build completed successfully!"
    log_info "Output files are in: $OUTPUT_DIR/"
}

# Command line interface
case "${1:-}" in
    "clean")
        clean
        ;;
    "debug")
        build_all debug
        ;;
    "release")
        build_all release
        ;;
    "deploy")
        deploy
        ;;
    "test")
        run_tests
        ;;
    "docs")
        generate_docs
        ;;
    *)
        echo "Usage: $0 {clean|debug|release|deploy|test|docs}"
        echo ""
        echo "Commands:"
        echo "  clean     - Clean all build artifacts"
        echo "  debug     - Build debug APK"
        echo "  release   - Build release APK and AAB with signing"
        echo "  deploy    - Deploy debug APK to connected device"
        echo "  test      - Run all tests"
        echo "  docs      - Generate documentation"
        echo ""
        echo "Examples:"
        echo "  $0 debug    # Build debug version"
        echo "  $0 release  # Build production version"
        echo "  $0 clean && $0 release  # Clean build"
        exit 1
        ;;
esac