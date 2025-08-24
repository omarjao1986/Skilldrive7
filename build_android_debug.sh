#!/usr/bin/env bash
set -e
npm install
npx expo prebuild -p android || npx expo prebuild --platform android
cd android && ./gradlew assembleDebug
