#!/usr/bin/env bash
#
# Trading Anarchy - Android Compute Engine
# Source Fetcher - Professional build system for cross-platform compute libraries
# Copyright (c) 2025 Trading Anarchy. All rights reserved.
#

set -e

source script/env.sh

cd $EXTERNAL_LIBS_BUILD_ROOT

version="v6.17.0"

if [ ! -d "xmrig" ]; then
  git clone https://github.com/xmrig/xmrig.git -b ${version}
else
  cd xmrig
  git checkout ${version}
fi
