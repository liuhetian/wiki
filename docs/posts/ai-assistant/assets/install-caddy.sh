#!/usr/bin/env bash
# 装 Caddy ≥ 2.11（Ubuntu / Debian）。两种来源：
#   bash install-caddy.sh                官方 Cloudsmith apt 源，以后跟着 apt upgrade 升级
#   bash install-caddy.sh --deb 2.11.4   GitHub Release 的 .deb，sha512 核对后再装，不会自动升级
# 哪一步没达到预期就停在哪一步，不会悄悄装上 Ubuntu 源里的 2.6.2。
set -euo pipefail

MIN_VERSION=2.11
REPO=https://dl.cloudsmith.io/public/caddy/stable
KEYRING=/usr/share/keyrings/caddy-stable-archive-keyring.gpg
SOURCE=/etc/apt/sources.list.d/caddy-stable.list

die() { echo "install-caddy: $*" >&2; exit 1; }

tmp=$(mktemp -d)
trap 'rm -rf "$tmp"' EXIT
chmod 755 "$tmp"  # apt 以 _apt 用户读本地 .deb，700 的临时目录会让它报读不到

# 先下载到文件再检查，不用 `curl | sudo tee`：管道里 curl 失败了，tee 照样写出一个空文件，
# apt 把空的源文件当成没有这个源，接着就从 Ubuntu 源装上旧包
fetch() {
    curl -1fsSL --retry 3 --connect-timeout 10 --max-time 300 -o "$2" "$1"
    [ -s "$2" ] || die "下载到的是空文件：$1"
}

from_apt() {
    sudo apt-get install -y curl gnupg
    fetch "$REPO/gpg.key" "$tmp/gpg.key"
    fetch "$REPO/debian.deb.txt" "$tmp/caddy.list"
    grep -q '^deb .*dl\.cloudsmith\.io/public/caddy/stable' "$tmp/caddy.list" \
        || die "源文件里没有 Cloudsmith 的 deb 行，内容不对"
    sudo gpg --batch --yes --dearmor -o "$KEYRING" "$tmp/gpg.key"
    sudo install -m 644 "$tmp/caddy.list" "$SOURCE"
    sudo chmod 644 "$KEYRING"
    # 默认模式下签名失败、源下载失败都只算警告，退出码照样是 0
    sudo apt-get update -o APT::Update::Error-Mode=any \
        || die "apt-get update 有源失败。报 EXPKEYSIG 是官方源签名过期，改用 --deb（刚写进去的 $SOURCE 要改名停用），不要关签名校验"
    candidate=$(apt-cache policy caddy | awk '/Candidate:/ {print $2}')
    dpkg --compare-versions "$candidate" ge "$MIN_VERSION" \
        || die "候选版本是 $candidate，低于 $MIN_VERSION：官方源没生效"
    sudo apt-get install -y "caddy=$candidate"
}

from_deb() {
    local version=$1 arch deb sums name
    arch=$(dpkg --print-architecture)
    deb="caddy_${version}_linux_${arch}.deb"
    sums="caddy_${version}_checksums.txt"
    # curl 以当前用户跑，开发环境第 0 步 export 的 SOCKS5 代理照常生效；sudo 只用来装本地文件
    for name in "$deb" "$sums"; do
        fetch "https://github.com/caddyserver/caddy/releases/download/v$version/$name" "$tmp/$name"
    done
    (cd "$tmp" && sha512sum --ignore-missing --strict -c "$sums") || die "sha512 核对失败：$deb"
    chmod 644 "$tmp/$deb"
    sudo apt-get install -y "$tmp/$deb"
    if [ -e "$SOURCE" ]; then
        echo "install-caddy: $SOURCE 还在。它签名失败时 apt-get update 会一直报错，可以先 sudo mv 成 .disabled" >&2
    fi
}

case "${1:-}" in
    "") from_apt ;;
    --deb) [ -n "${2:-}" ] || die "用法：bash install-caddy.sh --deb <版本号>，例如 --deb 2.11.4"
           from_deb "$2" ;;
    *) die "用法：bash install-caddy.sh [--deb <版本号>]" ;;
esac

# 验收三件事一起看：版本、包来源、服务状态
installed=$(dpkg-query -W -f='${Version}' caddy)
dpkg --compare-versions "$installed" ge "$MIN_VERSION" || die "装上的是 $installed，低于 $MIN_VERSION"
caddy version
apt-cache policy caddy
systemctl is-active caddy
