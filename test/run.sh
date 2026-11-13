#!/bin/sh
# Runs the plugin tests against the built plugin, in a throwaway home directory.
#
# The plugin writes under ~/.config/opencode and calls the OS scheduler. HOME points at a temporary
# directory, and stand-ins for the scheduler commands and for `opencode` come first on PATH, so the
# tests cannot register a real job or read your OpenCode files.
set -eu

root=$(cd "$(dirname "$0")/.." && pwd)
sandbox=$(mktemp -d "${TMPDIR:-/tmp}/opencode-scheduler-test.XXXXXX")
sandbox=$(cd "$sandbox" && pwd -P)
trap 'rm -rf "$sandbox"' EXIT

mkdir -p "$sandbox/bin" "$sandbox/home/project-a" "$sandbox/home/project-b" "$sandbox/xdg-data"

stub() {
  printf '#!/bin/sh\n%s\n' "$2" >"$sandbox/bin/$1"
  chmod +x "$sandbox/bin/$1"
}
for command in launchctl systemctl schtasks; do
  stub "$command" 'exit 0'
done
# No crontab for this user, and installing one is a no-op.
stub crontab 'case "$1" in -l) echo "no crontab for test" >&2; exit 1 ;; esac; cat >/dev/null; exit 0'
# A machine that still has OpenCode 1 as `opencode`, with OpenCode 2 beside it as `opencode2`.
stub opencode 'echo 1.19.5'
stub opencode2 'echo "opencode v2.2.7"'

cd "$root"
bun_path=$(command -v bun)
env -i \
  HOME="$sandbox/home" \
  PATH="$sandbox/bin:$(dirname "$bun_path"):/usr/bin:/bin:/usr/sbin:/sbin" \
  XDG_DATA_HOME="$sandbox/xdg-data" \
  SCHEDULER_TEST_SANDBOX="$sandbox" \
  "$bun_path" test test/plugin.test.ts
