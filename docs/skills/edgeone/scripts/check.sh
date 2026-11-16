#!/usr/bin/env bash
# 验收：bash scripts/check.sh <域名> <COS_HOST> [一个存在的路径，默认 /]
# 密码从 SITE_PASSWORD 读，经 curl --config - 走标准输入，不进 argv、不打印
# 本机 DNS 有负缓存（绑域名前查过它）时，RESOLVE=<边缘节点 IP> 钉住
set -u
HOST=$1 COS=$2 P=${3:-/}
BASE=https://$HOST
OBJ=$P; [[ $OBJ == */ ]] && OBJ=${OBJ}index.html
R=(); [ -n "${RESOLVE:-}" ] && R=(--resolve "$HOST:443:$RESOLVE" --resolve "$HOST:80:$RESOLVE")
JAR=$(mktemp); OUT=$(mktemp); HDR=$(mktemp); trap 'rm -f "$JAR" "$OUT" "$HDR"' EXIT
FAIL=0
pw() { printf 'header = "X-Password: %s"\n' "$1"; }
show() { # 标签 实际 期望
  local mark=✅; [[ "$2" =~ ^($3)$ ]] || { mark=❌; FAIL=1; }
  printf '%s %s：%s（期望 %s）\n' "$mark" "$1" "$2" "$3"
}

c=$(curl -s "${R[@]}" -o "$OUT" -w '%{http_code}' "$BASE$P")
show '匿名 curl' "$c" 401; grep -q 'X-Password' "$OUT" || { echo '   └ ❌ 没看到给 AI 的提示'; FAIL=1; }
c=$(curl -s "${R[@]}" -o "$OUT" -w '%{http_code}' -H 'Accept: text/html,*/*;q=0.8' "$BASE$P")
show '匿名浏览器' "$c" 401; grep -q '<form' "$OUT" || { echo '   └ ❌ 没看到登录页'; FAIL=1; }
c=$(pw wrong-password | curl -s "${R[@]}" --config - -o /dev/null -w '%{http_code}' "$BASE$P")
show 'X-Password 错' "$c" 401
c=$(pw "$SITE_PASSWORD" | curl -s "${R[@]}" --config - -c "$JAR" -D "$HDR" -o /dev/null -w '%{http_code}' "$BASE$P")
show 'X-Password 对' "$c" 200
grep -qi '^cache-control: private, no-store' "$HDR" || { echo '   └ ❌ 缺 Cache-Control: private, no-store'; FAIL=1; }
grep -qi '^cdn-cache-control: no-store' "$HDR" || { echo '   └ ❌ 缺 CDN-Cache-Control: no-store'; FAIL=1; }
grep -qi '^content-disposition' "$HDR" && { echo '   └ ❌ 带了 Content-Disposition，浏览器会下载'; FAIL=1; }
c=$(curl -s "${R[@]}" -b "$JAR" -o /dev/null -w '%{http_code}' "$BASE$P")
show 'cookie 复用' "$c" 200
: > "$JAR"
c=$(curl -s "${R[@]}" -o /dev/null -w '%{http_code}' --data-urlencode 'password=wrong' --data-urlencode "next=$P" "$BASE/__login")
show '表单登录 错密码' "$c" 401
c=$(printf 'data-urlencode = "password=%s"\n' "$SITE_PASSWORD" |
  curl -s "${R[@]}" --config - --data-urlencode "next=$P" -c "$JAR" -o /dev/null -w '%{http_code}' "$BASE/__login")
show '表单登录 对密码' "$c" 303
c=$(curl -s "${R[@]}" -b "$JAR" -o /dev/null -w '%{http_code}' "$BASE$P")
show '登录后带 cookie' "$c" 200
c=$(curl -s "${R[@]}" -o /dev/null -w '%{http_code}' "$BASE$P")
show '登录后再匿名' "$c" 401
c=$(curl -s -o /dev/null -w '%{http_code}' "https://$COS$OBJ")
show '直连私有 COS' "$c" 403
c=$(curl -s "${R[@]}" -o /dev/null -w '%{http_code}' "http://$HOST$P")
show 'HTTP 入口' "$c" 308
exit $FAIL
