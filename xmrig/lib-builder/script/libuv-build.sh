#!/bin/bash
#
# Trading Anarchy - Android Compute Engine
# libuv Builder - Compiles libuv library for Android platforms
# Copyright (c) 2025 Trading Anarchy. All rights reserved.
#

set -e

source script/env.sh

cd $EXTERNAL_LIBS_BUILD_ROOT/libuv
mkdir -p build && cd build

TOOLCHAIN=$ANDROID_HOME/ndk/$NDK_VERSION/build/cmake/android.toolchain.cmake

# Try to find cmake in different locations
if [ -f "$ANDROID_HOME/cmake/3.18.1/bin/cmake" ]; then
    CMAKE=$ANDROID_HOME/cmake/3.18.1/bin/cmake
elif [ -f "$ANDROID_HOME/cmake/3.22.1/bin/cmake" ]; then
    CMAKE=$ANDROID_HOME/cmake/3.22.1/bin/cmake
else
    # Try to find any cmake version
    CMAKE_DIR=$(find "$ANDROID_HOME/cmake" -name "cmake" -type f | head -1)
    if [ -n "$CMAKE_DIR" ]; then
        CMAKE="$CMAKE_DIR"
    else
        echo "Error: Could not find cmake in Android SDK"
        exit 1
    fi
fi

echo "Using cmake: $CMAKE"
ANDROID_PLATFORM=android-29

#if [ ! -f "configure" ]; then
#  ./autogen.sh
#fi

archs=(arm arm64 x86 x86_64)
for arch in ${archs[@]}; do
    case ${arch} in
        "arm")
            target_host=arm-linux-androideabi
            ANDROID_ABI="armeabi-v7a"
            ;;
        "arm64")
            target_host=aarch64-linux-android
            ANDROID_ABI="arm64-v8a"
            ;;
        "x86")
            target_host=i686-linux-android
            ANDROID_ABI="x86"
            ;;
        "x86_64")
            target_host=x86_64-linux-android
            ANDROID_ABI="x86_64"
            ;;
        *)
            exit 16
            ;;
    esac

    mkdir -p $EXTERNAL_LIBS_BUILD_ROOT/libuv/build/$ANDROID_ABI
    cd $EXTERNAL_LIBS_BUILD_ROOT/libuv/build/$ANDROID_ABI
    
    TARGET_DIR=$EXTERNAL_LIBS_ROOT/libuv/$ANDROID_ABI

    if [ -f "$TARGET_DIR/lib/libuv.la" ]; then
      continue
    fi

    mkdir -p $TARGET_DIR
    echo "- Building for ${arch} (${ANDROID_ABI})"

    $CMAKE -DCMAKE_TOOLCHAIN_FILE=$TOOLCHAIN \
        -DANDROID_ABI="$ANDROID_ABI" \
        -DANDROID_PLATFORM=$ANDROID_PLATFORM \
        -DCMAKE_INSTALL_PREFIX=$TARGET_DIR \
        -DBUILD_SHARED_LIBS=OFF \
        ../../ \
        && make -j 4 \
        && make install \
        && make clean

done

exit 0
