#!/usr/bin/env bash
# docs/ 下的重资源 <-> 备份 COS：仅镜像二进制媒体（不含 md/svg，svg 是文本进 git）
#
# 用法：
#   scripts/backup-media.sh              # up：上传（同名 MD5 一致跳过，不删远端）
#   scripts/backup-media.sh up
#   scripts/backup-media.sh down         # 下载：默认跳过本地已存在的文件
#   scripts/backup-media.sh down --force # 下载：覆盖本地
#   scripts/backup-media.sh list         # 打印 本地↔cos://... 映射
#
# 桶名从 .env 的 COS_BACKUP_BUCKET 读；region 复用主桶 COS_REGION。
# 备份桶策略与主桶不同：不 --delete，桶里的历史文件永远保留（同名才覆盖）。
set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_DIR"

set -a; source .env; set +a
COSCMD="$PROJECT_DIR/.venv/bin/coscmd"
BUCKET="${COS_BACKUP_BUCKET:-}"

# 备份的扩展名：图/视频/3D/音频/pdf；svg 排除（文本，进 git）
INCLUDES=(--include='*/'
  --include='*.png' --include='*.jpg' --include='*.jpeg'
  --include='*.webp' --include='*.gif' --include='*.avif'
  --include='*.mp4' --include='*.webm' --include='*.mov'
  --include='*.glb' --include='*.gltf'
  --include='*.mp3' --include='*.wav' --include='*.pdf'
  --exclude='*')

configure_bucket() {
  # coscmd 一份 config 只能记一个桶：每次切到备份桶（不影响 deploy.sh，它会再切回）
  [ -n "$BUCKET" ] || { echo "请在 .env 里设置 COS_BACKUP_BUCKET=你的备份桶名（如 wiki-backup-1307341066）" >&2; exit 1; }
  "$COSCMD" config -a "$COS_SECRET_ID" -s "$COS_SECRET_KEY" -b "$BUCKET" -r "$COS_REGION" >/dev/null
}

cmd_up() {
  configure_bucket
  # 用 rsync 摘出媒体到临时目录，避免把 md 一起传上去
  STAGE=$(mktemp -d); trap 'rm -rf "$STAGE"' RETURN
  rsync -am "${INCLUDES[@]}" docs/ "$STAGE/"
  [ -z "$(ls -A "$STAGE")" ] && { echo "docs/ 里没有可备份的媒体"; return 0; }
  cd "$STAGE"
  # -rs：递归 + MD5 一致跳过；无 --delete → 桶里旧文件保留
  "$COSCMD" upload -rs ./ /
  echo "✅ 备份完成 → cos://$BUCKET/"
}

cmd_down() {
  # 方案 B：按"本地活着的目录"作白名单，过滤桶清单；父目录本地不存在的对象一律跳过
  # 保证："删掉的文章"里的历史资源留在桶里做归档、但不会被 down 拉回来污染 docs/
  configure_bucket
  local force="${1:-}"

  local STAGE
  STAGE=$(mktemp -d); trap 'rm -rf "$STAGE"' RETURN

  # 拿桶里全部对象路径。coscmd list -ra 每行格式："<path> <size> <storage> <date> <time>"，
  # path 里可能含空格（如"录屏2026-05-20 17.19.22.mp4"），故用 sed 反向剥掉末尾固定结构取 path
  "$COSCMD" list -ra / 2>/dev/null \
    | sed -nE 's/^ +(.*[^ ]) +[0-9]+ +[A-Z_]+ +[0-9]{4}-[0-9]{2}-[0-9]{2} +[0-9]{2}:[0-9]{2}:[0-9]{2} *$/\1/p' \
    > "$STAGE/bucket-keys"

  local total=0 to_pull=0 skipped=0
  local pull_list="$STAGE/pull-list"; : > "$pull_list"

  while IFS= read -r key; do
    total=$((total+1))
    local parent="docs"
    case "$key" in
      */*) parent="docs/${key%/*}" ;;
    esac
    if [ -d "$parent" ]; then
      echo "$key" >> "$pull_list"; to_pull=$((to_pull+1))
    else
      skipped=$((skipped+1))
    fi
  done < "$STAGE/bucket-keys"

  echo "桶里共 $total 个对象；本地目录存在 → 拉 $to_pull 个；已删目录 → 跳 $skipped 个"

  if [ "$to_pull" -eq 0 ]; then
    echo "无可下载对象，退出"; return 0
  fi

  # 逐个 download 到 STAGE/pulled，然后合并到 docs/（--ignore-existing 或强覆盖）
  mkdir -p "$STAGE/pulled"
  local n=0
  while IFS= read -r key; do
    n=$((n+1))
    mkdir -p "$STAGE/pulled/$(dirname "$key")"
    "$COSCMD" download "$key" "$STAGE/pulled/$key" >/dev/null 2>&1 \
      || echo "  ! 下载失败：$key"
  done < "$pull_list"

  if [ "$force" = "--force" ]; then
    rsync -a "$STAGE/pulled/" "$PROJECT_DIR/docs/"
    echo "✅ 已从 cos://$BUCKET/ 覆盖复原（拉 $to_pull 个，跳过桶里 $skipped 个已删目录的历史）"
  else
    rsync -a --ignore-existing "$STAGE/pulled/" "$PROJECT_DIR/docs/"
    echo "✅ 已从 cos://$BUCKET/ 补齐 docs/（本地已有的未动；桶里 $skipped 个已删目录历史未拉；覆盖用 down --force）"
  fi
}

cmd_list() {
  # 列本地和远端各有哪些媒体、算出对应 URL；不改动任何文件
  echo "== 本地 docs/ 下的媒体 =="
  find docs -type f \( \
      -name '*.png' -o -name '*.jpg' -o -name '*.jpeg' \
      -o -name '*.webp' -o -name '*.gif' -o -name '*.avif' \
      -o -name '*.mp4' -o -name '*.webm' -o -name '*.mov' \
      -o -name '*.glb' -o -name '*.gltf' \
      -o -name '*.mp3' -o -name '*.wav' -o -name '*.pdf' \
    \) | sort | while read -r f; do
      rel="${f#docs/}"
      printf "  %-60s  →  cos://%s/%s\n" "$f" "$BUCKET" "$rel"
    done
  echo
  echo "== 桶里现有对象 =="
  configure_bucket
  "$COSCMD" list -r / 2>/dev/null | sed 's/^/  /' || true
}

case "${1:-up}" in
  up)   cmd_up ;;
  down) shift || true; cmd_down "${1:-}" ;;
  list) cmd_list ;;
  -h|--help|help) sed -n '2,10p' "$0" ;;
  *)    echo "未知子命令：$1"; echo "用法：$0 [up|down [--force]|list]"; exit 2 ;;
esac
