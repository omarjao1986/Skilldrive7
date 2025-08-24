#!/usr/bin/env bash
set -e
APK=android/app/build/outputs/apk/debug/app-debug.apk
adb install -r "$APK"
