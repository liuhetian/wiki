#!/usr/bin/env python3
"""Aggregate privacy-filtered access records using dates in Asia/Shanghai."""
from collections import defaultdict
from datetime import datetime
from pathlib import Path
from zoneinfo import ZoneInfo
import gzip
import json

rows = defaultdict(lambda: {'attempts': 0, 'successful': 0, 'status_401': 0, 'other_errors': 0})
for path in Path('/var/log/caddy/deepseek-proxy').glob('access*'):
    if not path.is_file():
        continue
    read = gzip.open if path.suffix == '.gz' else open
    with read(path, 'rt') as stream:
        for line in stream:
            try:
                record = json.loads(line)
                date = datetime.fromtimestamp(record['ts'], ZoneInfo('Asia/Shanghai')).date().isoformat()
                status = int(record['status'])
            except (ValueError, KeyError, TypeError):
                continue
            row = rows[(date, record.get('caller', 'personal'), record.get('vendor', 'deepseek'))]
            row['attempts'] += 1
            if 200 <= status < 300:
                row['successful'] += 1
            elif status == 401:
                row['status_401'] += 1
            else:
                row['other_errors'] += 1
print(json.dumps([dict(date=date, caller=caller, vendor=vendor, **counts) for (date, caller, vendor), counts in sorted(rows.items())], indent=2))
