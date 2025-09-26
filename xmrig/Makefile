# Trading Anarchy - Android Compute Engine Build System
# Professional build environment for cross-platform compute libraries  
# Copyright (c) 2025 Trading Anarchy. All rights reserved.

all: toolchain libuv hwloc openssl compute install

toolchain:
script/toolchain-build.sh

libuv: toolchain libuv_dl
script/libuv-build.sh

libuv_dl:
script/libuv-fetch.sh

openssl: toolchain openssl_dl
script/openssl-build.sh

openssl_dl:
script/openssl-fetch.sh

compute: toolchain compute_dl
script/xmrig-build.sh

compute_dl:
script/xmrig-fetch.sh

hwloc: toolchain hwloc_dl
script/hwloc-build.sh

hwloc_dl:
script/hwloc-fetch.sh

install:
script/install.sh

clean:
script/clean.sh
