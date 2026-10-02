#!/usr/bin/env python3
from pathlib import Path
import subprocess

env = dict(line.split('=', 1) for line in Path('/etc/caddy/gateway.env').read_text().splitlines())
journal = subprocess.run(['journalctl', '-u', 'caddy', '--since', '30 minutes ago', '--no-pager'], capture_output=True, check=True, text=True).stdout
assert all(secret not in journal for secret in env.values())
print('Caddy journal contains neither upstream key nor gateway token: passed')
assert (Path('/var/lib/caddy/.config/caddy/autosave.json').stat().st_mode & 0o777) == 0o600
print('Adapted runtime configuration permissions 0600: passed')
