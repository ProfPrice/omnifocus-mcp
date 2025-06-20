#!/bin/bash
# Get the directory where the script is located
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# 1. Request OmniFocus permission (only needed once).
# If you encounter permission issues, uncomment these lines temporarily, run the server once,
# then comment them out again to avoid the dialog on every startup.
#
# osascript -e 'tell application "System Events" to display dialog "Requesting permission to automate OmniFocus." buttons {"OK"} default button "OK" giving up after 1' >/dev/null 2>&1
# osascript -e 'try' -e 'tell application "OmniFocus" to get the name of the default document' -e 'end try' >/dev/null 2>&1

# 2. Launch the Node.js server using the direct binary (bypassing asdf shim)
# The shebang approach does not work in Claude's sandboxed environment.
# Using the direct, absolute path to the Node.js binary is the most reliable method.
# TODO: 
exec /Users/mdoel/.asdf/installs/nodejs/23.10.0/bin/node "$DIR/dist/index.js" 
