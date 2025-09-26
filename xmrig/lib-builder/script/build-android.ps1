# Trading Anarchy Android Compute Engine - Build and Package Script (Windows)
# 2025 Professional Version - Complete Android App Development Pipeline
# PowerShell version for Windows development environments

param(
    [Parameter(Position=0)]
    [ValidateSet('clean', 'debug', 'release', 'deploy', 'test', 'docs', 'help')]
    [string]$Command = 'help',
    
    [switch]$Verbose,
    [switch]$SkipTests
)

# Configuration
$Script:Config = @{
    ProjectName = "Trading Anarchy Android Compute Engine"
    PackageName = "com.tradinganarchy.computeengine"
    VersionMajor = 2025
    VersionMinor = 1
    VersionPatch = 0
    BuildDir = "build"
    OutputDir = "output"
    AndroidDir = "android"
    KeystoreDir = "keystores"
    KeystorePassword = "TradingAnarchy2025!"
}

# Error handling
$ErrorActionPreference = "Stop"

# Logging functions
function Write-Info {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

function Write-Banner {
    Write-Host @"
==========================================
  Trading Anarchy Android Build System
        2025 Professional Edition
==========================================
"@ -ForegroundColor Blue
}

function Test-Prerequisites {
    Write-Info "Checking build prerequisites..."
    
    $missingTools = @()
    
    # Check Node.js and npm
    if (!(Get-Command node -ErrorAction SilentlyContinue)) {
        $missingTools += "node"
    }
    
    if (!(Get-Command npm -ErrorAction SilentlyContinue)) {
        $missingTools += "npm"
    }
    
    # Check Android SDK
    if (!($env:ANDROID_SDK_ROOT -or $env:ANDROID_HOME)) {
        Write-Warning "ANDROID_SDK_ROOT or ANDROID_HOME not set"
        $missingTools += "Android SDK"
    }
    
    # Check Java
    if (!(Get-Command java -ErrorAction SilentlyContinue)) {
        $missingTools += "java"
    }
    
    # Check Gradle
    if (!(Get-Command gradle -ErrorAction SilentlyContinue) -and !(Test-Path "./gradlew.bat")) {
        $missingTools += "gradle"
    }
    
    # Check CMake for native builds
    if (!(Get-Command cmake -ErrorAction SilentlyContinue)) {
        $missingTools += "cmake"
    }
    
    # Check Android NDK
    $androidSdk = $env:ANDROID_SDK_ROOT ?? $env:ANDROID_HOME
    if ($androidSdk -and !(Test-Path "$androidSdk\ndk")) {
        $missingTools += "Android NDK"
    }
    
    if ($missingTools.Count -gt 0) {
        Write-Error "Missing required tools: $($missingTools -join ', ')"
        Write-Info "Please install the missing tools and try again."
        exit 1
    }
    
    Write-Success "All prerequisites satisfied"
}

function Initialize-Environment {
    Write-Info "Setting up build environment..."
    
    # Create directories
    @($Config.BuildDir, $Config.OutputDir, $Config.KeystoreDir) | ForEach-Object {
        if (!(Test-Path $_)) {
            New-Item -ItemType Directory -Path $_ -Force | Out-Null
        }
    }
    
    # Set environment variables
    $env:NODE_ENV = "production"
    $env:ANDROID_COMPILE_SDK = "35"
    $env:ANDROID_BUILD_TOOLS_VERSION = "35.0.0"
    $env:ANDROID_TARGET_SDK = "35"
    $env:ANDROID_MIN_SDK = "24"
    $env:NDK_VERSION = "27.2.12479018"
    
    # Create version file
    $versionCode = $Config.VersionMajor * 1000 + $Config.VersionMinor * 100 + $Config.VersionPatch
    $versionName = "$($Config.VersionMajor).$($Config.VersionMinor).$($Config.VersionPatch)"
    $buildDate = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
    
    try {
        $gitCommit = (git rev-parse --short HEAD 2>$null) ?? "unknown"
    } catch {
        $gitCommit = "unknown"
    }
    
    $buildNumber = $env:BUILD_NUMBER ?? 1
    
    $versionContent = @"
versionMajor=$($Config.VersionMajor)
versionMinor=$($Config.VersionMinor)
versionPatch=$($Config.VersionPatch)
versionCode=$versionCode
versionName=$versionName
buildDate=$buildDate
gitCommit=$gitCommit
buildNumber=$buildNumber
"@
    
    $versionContent | Out-File -FilePath "$($Config.BuildDir)\version.properties" -Encoding UTF8
    
    Write-Success "Environment configured"
}

function Install-Dependencies {
    Write-Info "Installing dependencies..."
    
    # Install npm dependencies
    if (Test-Path "package.json") {
        npm install --production=false
        Write-Success "Node.js dependencies installed"
    }
    
    # Run React Native doctor
    if (Get-Command npx -ErrorAction SilentlyContinue) {
        try {
            npx react-native doctor
        } catch {
            Write-Warning "React Native doctor completed with warnings"
        }
    }
    
    Write-Success "Dependencies installed"
}

function Build-NativeLibraries {
    Write-Info "Building native libraries..."
    
    $cmakeBuildDir = "$($Config.BuildDir)\cmake"
    if (!(Test-Path $cmakeBuildDir)) {
        New-Item -ItemType Directory -Path $cmakeBuildDir -Force | Out-Null
    }
    
    Push-Location $cmakeBuildDir
    
    try {
        $androidSdk = $env:ANDROID_SDK_ROOT ?? $env:ANDROID_HOME
        $ndkVersion = $env:NDK_VERSION
        
        # Configure CMake for Android
        cmake ..\..\ `
            -DCMAKE_TOOLCHAIN_FILE="$androidSdk\ndk\$ndkVersion\build\cmake\android.toolchain.cmake" `
            -DANDROID_ABI=arm64-v8a `
            -DANDROID_NATIVE_API_LEVEL=24 `
            -DCMAKE_BUILD_TYPE=Release `
            -DBUILD_SHARED_LIBS=ON
        
        # Build native libraries
        $processorCount = (Get-WmiObject Win32_ComputerSystem).NumberOfLogicalProcessors
        cmake --build . --config Release --parallel $processorCount
        
        Write-Success "Native libraries built successfully"
    }
    finally {
        Pop-Location
    }
}

function Build-ReactNativeBundle {
    Write-Info "Building React Native bundle..."
    
    $bundleOutput = "$($Config.BuildDir)\index.android.bundle"
    $assetsOutput = "$($Config.BuildDir)\drawable-*"
    
    npx react-native bundle `
        --platform android `
        --dev false `
        --entry-file index.js `
        --bundle-output $bundleOutput `
        --assets-dest $assetsOutput
    
    Write-Success "React Native bundle created"
}

function New-Keystore {
    $keystoreFile = "$($Config.KeystoreDir)\trading-anarchy-release.keystore"
    
    if (!(Test-Path $keystoreFile)) {
        Write-Info "Generating release keystore..."
        
        keytool -genkeypair `
            -alias trading-anarchy-key `
            -keyalg RSA `
            -keysize 4096 `
            -validity 36500 `
            -keystore $keystoreFile `
            -storepass $Config.KeystorePassword `
            -keypass $Config.KeystorePassword `
            -dname "CN=Trading Anarchy, OU=Development, O=Trading Anarchy Ltd, L=Global, ST=Digital, C=WW"
        
        Write-Success "Release keystore generated: $keystoreFile"
        Write-Warning "Store keystore password securely: $($Config.KeystorePassword)"
    } else {
        Write-Info "Using existing keystore: $keystoreFile"
    }
}

function Build-APK {
    param([string]$BuildType = "debug")
    
    Write-Info "Building Android APK ($BuildType)..."
    
    if (!(Test-Path $Config.AndroidDir)) {
        Write-Warning "Android directory not found, creating basic structure..."
        New-Item -ItemType Directory -Path $Config.AndroidDir -Force | Out-Null
    }
    
    Push-Location $Config.AndroidDir
    
    try {
        $gradleWrapper = if (Test-Path "gradlew.bat") { ".\gradlew.bat" } else { "gradle" }
        
        if ($BuildType -eq "release") {
            # Build release APK
            $keystoreFile = "..\$($Config.KeystoreDir)\trading-anarchy-release.keystore"
            
            & $gradleWrapper assembleRelease `
                "-PMYAPP_UPLOAD_STORE_FILE=$keystoreFile" `
                "-PMYAPP_UPLOAD_KEY_ALIAS=trading-anarchy-key" `
                "-PMYAPP_UPLOAD_STORE_PASSWORD=$($Config.KeystorePassword)" `
                "-PMYAPP_UPLOAD_KEY_PASSWORD=$($Config.KeystorePassword)"
            
            $sourceApk = "app\build\outputs\apk\release\app-release.apk"
            $targetApk = "..\$($Config.OutputDir)\TradingAnarchy-$($Config.VersionMajor).$($Config.VersionMinor).$($Config.VersionPatch)-release.apk"
            
            if (Test-Path $sourceApk) {
                Copy-Item $sourceApk $targetApk -Force
            }
        } else {
            # Build debug APK
            & $gradleWrapper assembleDebug
            
            $sourceApk = "app\build\outputs\apk\debug\app-debug.apk"
            $targetApk = "..\$($Config.OutputDir)\TradingAnarchy-$($Config.VersionMajor).$($Config.VersionMinor).$($Config.VersionPatch)-debug.apk"
            
            if (Test-Path $sourceApk) {
                Copy-Item $sourceApk $targetApk -Force
            }
        }
        
        Write-Success "APK built successfully: $($Config.OutputDir)\"
    }
    finally {
        Pop-Location
    }
}

function Build-AAB {
    Write-Info "Building Android App Bundle (AAB)..."
    
    Push-Location $Config.AndroidDir
    
    try {
        $gradleWrapper = if (Test-Path "gradlew.bat") { ".\gradlew.bat" } else { "gradle" }
        $keystoreFile = "..\$($Config.KeystoreDir)\trading-anarchy-release.keystore"
        
        # Build AAB
        & $gradleWrapper bundleRelease `
            "-PMYAPP_UPLOAD_STORE_FILE=$keystoreFile" `
            "-PMYAPP_UPLOAD_KEY_ALIAS=trading-anarchy-key" `
            "-PMYAPP_UPLOAD_STORE_PASSWORD=$($Config.KeystorePassword)" `
            "-PMYAPP_UPLOAD_KEY_PASSWORD=$($Config.KeystorePassword)"
        
        $sourceAab = "app\build\outputs\bundle\release\app-release.aab"
        $targetAab = "..\$($Config.OutputDir)\TradingAnarchy-$($Config.VersionMajor).$($Config.VersionMinor).$($Config.VersionPatch)-release.aab"
        
        if (Test-Path $sourceAab) {
            Copy-Item $sourceAab $targetAab -Force
        }
        
        Write-Success "AAB built successfully: $($Config.OutputDir)\"
    }
    finally {
        Pop-Location
    }
}

function Invoke-Tests {
    if ($SkipTests) {
        Write-Warning "Skipping tests as requested"
        return
    }
    
    Write-Info "Running tests..."
    
    # Run Jest tests
    if (Test-Path "package.json") {
        $packageJson = Get-Content "package.json" | ConvertFrom-Json
        if ($packageJson.scripts.test) {
            npm test
        }
    }
    
    # Run Android unit tests
    if (Test-Path $Config.AndroidDir) {
        Push-Location $Config.AndroidDir
        try {
            $gradleWrapper = if (Test-Path "gradlew.bat") { ".\gradlew.bat" } else { "gradle" }
            & $gradleWrapper testDebugUnitTest
        }
        finally {
            Pop-Location
        }
    }
    
    Write-Success "Tests completed"
}

function New-Documentation {
    Write-Info "Generating documentation..."
    
    $docsDir = "$($Config.OutputDir)\docs"
    if (!(Test-Path $docsDir)) {
        New-Item -ItemType Directory -Path $docsDir -Force | Out-Null
    }
    
    # Generate TypeScript documentation
    if (Get-Command npx -ErrorAction SilentlyContinue) {
        try {
            npx typedoc --out "$docsDir\api" src\
        } catch {
            Write-Warning "TypeDoc documentation generation failed"
        }
    }
    
    # Create build information
    $buildInfo = @"
# Trading Anarchy Android Compute Engine - Build Information

## Version
- **Version**: $($Config.VersionMajor).$($Config.VersionMinor).$($Config.VersionPatch)
- **Version Code**: $($Config.VersionMajor * 1000 + $Config.VersionMinor * 100 + $Config.VersionPatch)
- **Build Date**: $((Get-Date).ToUniversalTime().ToString("yyyy-MM-dd HH:mm:ss UTC"))
- **Git Commit**: $(try { git rev-parse --short HEAD } catch { "unknown" })

## Features
- XMRig-based cryptocurrency mining engine
- React Native 0.76.5 with New Architecture
- Android API Level 35 target
- Native C++ libraries with CMake
- Hardware acceleration support
- Thermal and battery management
- Secure mining protocols (SSL/TLS)

## Build Configuration
- **NDK Version**: $($env:NDK_VERSION)
- **Compile SDK**: $($env:ANDROID_COMPILE_SDK)
- **Target SDK**: $($env:ANDROID_TARGET_SDK)
- **Min SDK**: $($env:ANDROID_MIN_SDK)
- **Build Tools**: $($env:ANDROID_BUILD_TOOLS_VERSION)

## Output Files
- **Debug APK**: TradingAnarchy-$($Config.VersionMajor).$($Config.VersionMinor).$($Config.VersionPatch)-debug.apk
- **Release APK**: TradingAnarchy-$($Config.VersionMajor).$($Config.VersionMinor).$($Config.VersionPatch)-release.apk
- **Release AAB**: TradingAnarchy-$($Config.VersionMajor).$($Config.VersionMinor).$($Config.VersionPatch)-release.aab

## Security
- Release builds are signed with 4096-bit RSA key
- Native libraries are stripped of debug symbols
- ProGuard/R8 code obfuscation enabled
- Network security config enforced

## Installation
``````powershell
# Install debug APK
adb install TradingAnarchy-$($Config.VersionMajor).$($Config.VersionMinor).$($Config.VersionPatch)-debug.apk

# Install release APK
adb install TradingAnarchy-$($Config.VersionMajor).$($Config.VersionMinor).$($Config.VersionPatch)-release.apk
``````

## Development
Built with Trading Anarchy Android Build System 2025 (PowerShell Edition)
"@
    
    $buildInfo | Out-File -FilePath "$($Config.OutputDir)\BUILD_INFO.md" -Encoding UTF8
    
    Write-Success "Documentation generated"
}

function Deploy-App {
    $apkFile = "$($Config.OutputDir)\TradingAnarchy-$($Config.VersionMajor).$($Config.VersionMinor).$($Config.VersionPatch)-debug.apk"
    
    if (!(Test-Path $apkFile)) {
        Write-Error "APK file not found: $apkFile"
        exit 1
    }
    
    Write-Info "Deploying to connected device/emulator..."
    
    # Check if device is connected
    $devices = adb devices | Select-String "device$"
    if (!$devices) {
        Write-Error "No Android device/emulator connected"
        exit 1
    }
    
    # Uninstall previous version
    try {
        adb uninstall $Config.PackageName 2>$null
    } catch {
        # Ignore if app wasn't installed
    }
    
    # Install new APK
    adb install $apkFile
    
    Write-Success "App deployed successfully"
}

function Remove-BuildArtifacts {
    Write-Info "Cleaning build artifacts..."
    
    @($Config.BuildDir, $Config.OutputDir) | ForEach-Object {
        if (Test-Path $_) {
            Remove-Item $_ -Recurse -Force
        }
    }
    
    if (Test-Path $Config.AndroidDir) {
        Push-Location $Config.AndroidDir
        try {
            $gradleWrapper = if (Test-Path "gradlew.bat") { ".\gradlew.bat" } else { "gradle" }
            & $gradleWrapper clean
        }
        finally {
            Pop-Location
        }
    }
    
    if (Test-Path "package.json") {
        try {
            npm run clean
        } catch {
            # Ignore if clean script doesn't exist
        }
    }
    
    Write-Success "Build artifacts cleaned"
}

function Build-All {
    param([string]$BuildType = "debug")
    
    Write-Banner
    Test-Prerequisites
    Initialize-Environment
    Install-Dependencies
    Build-NativeLibraries
    Build-ReactNativeBundle
    
    if ($BuildType -eq "release") {
        New-Keystore
        Invoke-Tests
        Build-APK "release"
        Build-AAB
    } else {
        Build-APK "debug"
    }
    
    New-Documentation
    
    Write-Success "Build completed successfully!"
    Write-Info "Output files are in: $($Config.OutputDir)\"
}

function Show-Help {
    Write-Host @"
Trading Anarchy Android Build System 2025 (PowerShell Edition)

USAGE:
    .\build-android.ps1 [COMMAND] [OPTIONS]

COMMANDS:
    clean       Clean all build artifacts
    debug       Build debug APK
    release     Build release APK and AAB with signing
    deploy      Deploy debug APK to connected device
    test        Run all tests
    docs        Generate documentation
    help        Show this help message

OPTIONS:
    -Verbose    Enable verbose output
    -SkipTests  Skip running tests during build

EXAMPLES:
    .\build-android.ps1 debug
    .\build-android.ps1 release -SkipTests
    .\build-android.ps1 clean
    .\build-android.ps1 deploy -Verbose
"@ -ForegroundColor Cyan
}

# Main execution
switch ($Command) {
    'clean' { Remove-BuildArtifacts }
    'debug' { Build-All "debug" }
    'release' { Build-All "release" }
    'deploy' { Deploy-App }
    'test' { Invoke-Tests }
    'docs' { New-Documentation }
    'help' { Show-Help }
    default { Show-Help }
}