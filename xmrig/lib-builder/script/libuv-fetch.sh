#!/usr/bin/env bash
#
# Trading Anarchy - Android Compute Engine
# libuv Dependency Fetcher - Retrieves libuv library for asynchronous I/O operations
# Copyright (c) 2025 Trading Anarchy. All rights reserved.
#

set -e

source script/env.sh

cd $EXTERNAL_LIBS_BUILD_ROOT

version="v1.43.0"

if [ ! -d "libuv" ]; then
  git clone https://github.com/libuv/libuv.git -b ${version}
else
  cd libuv
  git checkout ${version}
fi
