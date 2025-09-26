# 📱 Private Android Installation Guide
## XMRig for Android - Complete Setup Instructions

### 🔧 **Prerequisites Setup**

**Step 1: Install Required Development Tools**
```bash
# Install Node.js (if not already installed)
# Download from: https://nodejs.org/
# Choose LTS version for stability

# Install Java Development Kit 17
# Download from: https://adoptium.net/temurin/releases/
# Choose JDK 17 (LTS) for your OS

# Install Android Studio
# Download from: https://developer.android.com/studio
# Include Android SDK and build tools
```

**Step 2: Setup Android SDK Environment**
```bash
# Add to your system PATH (Windows PowerShell):
$env:ANDROID_HOME = "C:\Users\$env:USERNAME\AppData\Local\Android\Sdk"
$env:PATH += ";$env:ANDROID_HOME\platform-tools;$env:ANDROID_HOME\tools"

# For Linux/Mac (add to ~/.bashrc or ~/.zshrc):
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

### 📦 **Project Setup**

**Step 3: Clone and Setup Project**
```bash
# Navigate to your desired directory
cd C:\Users\forex\OneDrive\Documents\GitHub\xmrig-for-android

# Install project dependencies
npm install

# Install React Native CLI globally (if not installed)
npm install -g @react-native-community/cli

# Install required packages
npm install @react-native-async-storage/async-storage react-native-ui-lib victory-native react-native-svg
npm install react-native-share react-native-fs react-native-device-info
npm install --save-dev @types/react-native

# Link native dependencies (React Native 0.60+)
cd android
./gradlew clean
cd ..
npx react-native-asset
```

**Step 4: Android Project Configuration**
```bash
# Generate Android keystore for signing (KEEP THIS SECURE!)
cd android/app
keytool -genkeypair -v -storetype PKCS12 -keystore xmrig-release-key.keystore -alias xmrig-key -keyalg RSA -keysize 2048 -validity 10000

# When prompted, enter:
# - Password: [Choose a strong password - WRITE THIS DOWN]
# - First and Last Name: Your Name
# - Organization: Your Company
# - Country: Your Country Code

# Move keystore to secure location
move xmrig-release-key.keystore ../..
cd ../..
```

### 🔑 **Security Configuration**

**Step 5: Configure Signing and Security**
```bash
# Create gradle.properties file for signing
# Create: android/gradle.properties (if doesn't exist)
```

Add this content to `android/gradle.properties`:
```properties
XMRIG_UPLOAD_STORE_FILE=xmrig-release-key.keystore
XMRIG_UPLOAD_KEY_ALIAS=xmrig-key
XMRIG_UPLOAD_STORE_PASSWORD=YOUR_KEYSTORE_PASSWORD
XMRIG_UPLOAD_KEY_PASSWORD=YOUR_KEY_PASSWORD
```

**Step 6: Update Build Configuration**
Edit `android/app/build.gradle` - add this to the android block:
```gradle
android {
    ...
    signingConfigs {
        release {
            if (project.hasProperty('XMRIG_UPLOAD_STORE_FILE')) {
                storeFile file(XMRIG_UPLOAD_STORE_FILE)
                storePassword XMRIG_UPLOAD_STORE_PASSWORD
                keyAlias XMRIG_UPLOAD_KEY_ALIAS
                keyPassword XMRIG_UPLOAD_KEY_PASSWORD
            }
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}
```

### 🏗️ **Build the APK**

**Step 7: Build Release APK**
```bash
# Clean previous builds
cd android
./gradlew clean
cd ..

# Build the release APK
cd android
./gradlew assembleRelease

# Your APK will be created at:
# android/app/build/outputs/apk/release/app-release.apk
```

**Step 8: Verify Build Success**
```bash
# Check if APK was created successfully
ls android/app/build/outputs/apk/release/

# You should see: app-release.apk (approximately 20-50MB)
```

### 📱 **Install on Android Device**

**Step 9: Prepare Android Device**
```
1. Enable Developer Options:
   - Go to Settings > About Phone
   - Tap "Build Number" 7 times
   - Go back to Settings > Developer Options

2. Enable USB Debugging:
   - In Developer Options, turn ON "USB Debugging"
   - Turn ON "Install via USB"

3. Enable Unknown Sources:
   - Settings > Security > Unknown Sources (turn ON)
   OR
   - Settings > Apps > Special Access > Install Unknown Apps
```

**Step 10: Install APK on Device**

**Method A - USB Installation:**
```bash
# Connect phone via USB cable
# Make sure USB Debugging is enabled

# Install APK directly
adb install android/app/build/outputs/apk/release/app-release.apk

# If you get device unauthorized error:
adb devices
# Accept the USB debugging prompt on your phone
# Run install command again
```

**Method B - Direct File Transfer:**
```bash
# Copy APK to phone storage
# Connect phone to computer
# Copy android/app/build/outputs/apk/release/app-release.apk to phone's Download folder

# On phone:
# 1. Open File Manager
# 2. Go to Downloads folder  
# 3. Tap app-release.apk
# 4. Tap "Install" 
# 5. Accept permissions
```

### 🚀 **Launch and Test**

**Step 11: Launch Application**
```
1. Find "XMRig" app icon on your phone
2. Tap to open
3. Grant any requested permissions
4. Test benchmark functionality first
5. Configure your mining wallet in settings
```

**Step 12: Verify Security Features**
```
1. Open app settings/about section
2. Verify developer wallet is shown as protected
3. Test donation settings (should be disabled by default)
4. Run a benchmark test to verify functionality
5. Check that all features work without crashes
```

### 🔒 **Security Best Practices**

**Step 13: Secure Your Installation**
```
✅ KEEP SECURE:
- Your keystore file (xmrig-release-key.keystore)
- Your keystore passwords
- Your wallet private keys

✅ PRIVATE INSTALLATION TIPS:
- Don't upload APK to public sources
- Only install on devices you trust
- Keep source code private
- Use secure wallet addresses
- Test thoroughly before production use
```

### 🎯 **Quick Commands Summary**

**Full Build Command (Copy & Paste):**
```bash
# Complete build process in one go:
cd C:\Users\forex\OneDrive\Documents\GitHub\xmrig-for-android
npm install
cd android && ./gradlew clean && cd ..
cd android && ./gradlew assembleRelease && cd ..
echo "✅ Build complete! APK located at: android/app/build/outputs/apk/release/app-release.apk"
```

**Quick Install Command:**
```bash
# Install to connected Android device:
adb install android/app/build/outputs/apk/release/app-release.apk
```

### 📱 **Troubleshooting**

**Common Issues & Solutions:**
```bash
# Issue: Gradle build fails
./gradlew --version
# Make sure Gradle 7.0+ and JDK 17 are installed

# Issue: ADB not recognized
# Add Android SDK platform-tools to PATH

# Issue: Keystore errors
# Recreate keystore with correct parameters

# Issue: App crashes on startup
adb logcat | grep XMRig
# Check logs for specific errors
```

### 🎉 **Success!**

Your XMRig Android app is now:
- ✅ Built with secure wallet protection
- ✅ Signed with your private certificate  
- ✅ Ready for private installation
- ✅ Fully functional with benchmark features
- ✅ Protected from reverse engineering

**Final APK Location:** 
`android/app/build/outputs/apk/release/app-release.apk`

**Keep this file secure and only distribute privately!** 🔐