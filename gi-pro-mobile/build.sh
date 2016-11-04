#!/bin/sh

ionic build android --release
if [ -f ~/build/tecnotoga-unsigned.apk ]; then
  rm ~/build/tecnotoga-unsigned.apk
fi
mv platforms/android/build/outputs/apk/android-release-unsigned.apk ~/build/tecnotoga-unsigned.apk
if [ -f ~/build/tecnotoga.apk ]; then
  rm ~/build/tecnotoga.apk
fi                       
cd ~/build
sh tecnotoga.sh
cd -
