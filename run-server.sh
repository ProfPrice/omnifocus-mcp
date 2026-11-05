#!/bin/bash
# Get the directory where the script is located
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# 1. Request OmniFocus permission (only needed once).
# If you encounter permission issues, uncomment these lines temporarily, run the server once,
# then comment them out again to avoid the dialog on every startup.
#
# osascript -e 'tell application "System Events" to display dialog "Requesting permission to automate OmniFocus." buttons {"OK"} default button "OK" giving up after 1' >/dev/null 2>&1
# osascript -e 'try' -e 'tell application "OmniFocus" to get the name of the default document' -e 'end try' >/dev/null 2>&1

# 2. Locate a Node.js binary (>= 23.10, per the upstream README). MCP hosts such as
# Claude Desktop launch this script with a minimal environment, so don't rely on
# shims or a hardcoded user path. Override with NODE_BIN=/path/to/node in the MCP
# server's "env" config if needed.
MIN_MAJOR=23
MIN_MINOR=10

node_ok() {
  [ -x "$1" ] || return 1
  local v major minor
  v="$("$1" -v 2>/dev/null)" || return 1
  v="${v#v}"; major="${v%%.*}"; minor="${v#*.}"; minor="${minor%%.*}"
  [ "$major" -gt "$MIN_MAJOR" ] || { [ "$major" -eq "$MIN_MAJOR" ] && [ "$minor" -ge "$MIN_MINOR" ]; }
}

NODE=""
if [ -n "${NODE_BIN:-}" ]; then
  NODE="$NODE_BIN"
else
  # Every node on PATH, then common install locations (newest nvm versions first).
  IFS=: read -ra path_dirs <<< "$PATH"
  candidates=()
  for d in "${path_dirs[@]}"; do candidates+=("$d/node"); done
  candidates+=(/opt/homebrew/bin/node /usr/local/bin/node)
  while IFS= read -r n; do candidates+=("$n"); done < <(ls -d "$HOME"/.nvm/versions/node/*/bin/node 2>/dev/null | sort -rV)
  candidates+=("$HOME/.asdf/shims/node")
  for c in "${candidates[@]}"; do
    if node_ok "$c"; then NODE="$c"; break; fi
  done
fi

if [ -z "$NODE" ] || [ ! -x "$NODE" ]; then
  echo "run-server.sh: no node >= $MIN_MAJOR.$MIN_MINOR found (install one or set NODE_BIN)" >&2
  exit 1
fi

if [ ! -f "$DIR/dist/index.js" ]; then
  echo "run-server.sh: $DIR/dist/index.js not found - run 'npm install && npm run build' first" >&2
  exit 1
fi

exec "$NODE" "$DIR/dist/index.js"
