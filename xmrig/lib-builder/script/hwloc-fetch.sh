#!/usr/bin/env bash
#
# Trading Anarchy - Android Compute Engine
# hwloc Dependency Fetcher - Retrieves hardware locality library for system topology detection
# Copyright (c) 2025 Trading Anarchy. All rights reserved.
#

set -e

source script/env.sh

cd $EXTERNAL_LIBS_BUILD_ROOT

version=v2.7

if [ ! -d "hwloc" ]; then
  git clone https://github.com/open-mpi/hwloc.git -b ${version}
else
  cd hwloc
  git checkout ${version}
fi
