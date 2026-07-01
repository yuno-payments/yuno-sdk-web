#!/bin/bash

# Fix for boost checksum issue in React Native 0.73.0
# This script updates the boost.podspec with the correct URL and checksum

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$( cd "$SCRIPT_DIR/.." && pwd )"
BOOST_PODSPEC="$PROJECT_ROOT/node_modules/react-native/third-party-podspecs/boost.podspec"

if [ -f "$BOOST_PODSPEC" ]; then
    echo "📝 Fixing boost.podspec URL and checksum..."
    
    # Replace the jfrog URL with archives.boost.io
    sed -i '' "s|https://boostorg.jfrog.io/artifactory/main/release/1.83.0/source/boost_1_83_0.tar.bz2|https://archives.boost.io/release/1.83.0/source/boost_1_83_0.tar.bz2|g" "$BOOST_PODSPEC"
    
    # Use the correct checksum for the archives.boost.io URL
    sed -i '' "s/9c2f4b99bc7ddb95a8babff8ba78a4108aa0951243ea919166a7e2e279825502/6478edfe2f3305127cffe8caf73ea0176c53769f4bf1585be237eb30798c3b8e/g" "$BOOST_PODSPEC"
    
    echo "✅ Boost URL and checksum fixed!"
else
    echo "❌ boost.podspec not found at $BOOST_PODSPEC"
    exit 1
fi

