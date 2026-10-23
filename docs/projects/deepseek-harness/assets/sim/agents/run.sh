#!/usr/bin/env bash
# Fork vs spawn on the real dsh headless entry point.
# dsh runs key-less (env -i, dummy key, base URL = local relay); relay.py holds the key.
# Usage: bash run.sh <scratch-dir>   (relay.py must already listen on 127.0.0.1:18766)
set -euo pipefail
DSH=/tmp/dsh-src/deepseek-harness
S=${1:?scratch dir}
mkdir -p "$S/home" "$S/dsh-home" "$S/ws"
here=$(cd "$(dirname "$0")" && pwd)
dsh() {
  (cd "$S/ws" && env -i HOME="$S/home" PATH="$PATH" DSH_HOME="$S/dsh-home" \
    DEEPSEEK_BASE_URL=http://127.0.0.1:18766/anthropic DEEPSEEK_API_KEY=relay-dummy \
    node "$DSH/apps/cli/lib/bin.js" --profile headless --json "$@")
}
doc="$DSH/docs/architecture.md"
turn1() {
  printf 'Read the following design document carefully and keep it in mind for later questions. Reply with the single word OK and stop. Do not use any tools.\n\n<document>\n%s\n</document>\n' "$(cat "$doc")"
}
q="According to the design document, which event lets a listener stop a turn, and what kind of event is it? Answer in one sentence."
for mode in fork spawn; do
  turn1 | dsh - > "$S/$mode.turn1.ndjson"
  sid=$(python3 -c "import json,sys
for l in open(sys.argv[1]):
    d=json.loads(l)
    s=json.dumps(d)
    import re
    m=re.search(r'\"(session-[0-9a-zA-Z_-]+)\"',s)
    if m: print(m.group(1)); break" "$S/$mode.turn1.ndjson")
  echo "$mode session: $sid"
  if [ "$mode" = fork ]; then
    t2="Use the subagent_fork tool exactly once to delegate this question to a forked child agent: '$q' After the child's result arrives, reply with its answer followed by PARENT_DONE."
  else
    t2="Use the subagent tool exactly once to delegate this question to a spawned child agent: '$q' After the child's result arrives, reply with its answer followed by PARENT_DONE."
  fi
  dsh --session-id "$sid" "$t2" > "$S/$mode.turn2.ndjson"
done
