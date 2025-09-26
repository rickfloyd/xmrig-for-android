@echo off
echo ================================
echo XMRig Mining APK Installer
echo Trading Anarchy Compute Engine
echo ================================
echo.

set ADB_PATH=C:\Users\forex\AppData\Local\Android\Sdk\platform-tools\adb.exe
set APK_PATH=android\app\build\outputs\apk\debug\app-debug.apk

echo Checking for connected Android devices...
"%ADB_PATH%" devices

echo.
echo Make sure your Android phone has:
echo 1. Developer Options enabled
echo 2. USB Debugging enabled
echo 3. USB cable connected
echo.

pause

echo Installing XMRig Mining APK...
"%ADB_PATH%" install "%APK_PATH%"

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ SUCCESS! XMRig Mining App installed successfully!
    echo.
    echo Next steps:
    echo 1. Open "Trading Anarchy Compute Engine" on your phone
    echo 2. Configure your mining pool and wallet address
    echo 3. Start mining and test functionality
    echo.
    echo Mining API will be available at: http://localhost:50080
    echo.
) else (
    echo.
    echo ❌ Installation failed. Please check:
    echo 1. USB Debugging is enabled
    echo 2. Phone is connected and authorized
    echo 3. Unknown sources installation is allowed
    echo.
)

pause