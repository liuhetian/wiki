---
description: "新 Ubuntu 机器从零配到能写代码：按顺序复制粘贴装 zsh、uv、Node.js；装完 zsh 必须手动改 $SHELL，否则 nvm 会写进 ~/.bashrc，zsh 里找不到 node"
---

# 新机器配开发环境：zsh、uv、Node.js

新 Ubuntu 机器从零配到能写代码：按顺序装 zsh、uv、Node.js，每一步都是复制粘贴到终端里跑。**最容易错的是第 3 步**：装完 zsh 不改 `$SHELL` 就装 nvm，nvm 会把自己写进 `~/.bashrc`，打开 zsh 就找不到 `nvm` 和 `node`。

下载基本都走 GitHub，uv 的安装包也放在 GitHub Releases 上。机器访问不了 GitHub 就先做第 0 步，借外网服务器开 SSH 代理；这里没写镜像方案。

## 0. 访问不了 GitHub 就先开 SSH 代理 { #proxy }

??? note "能直连 GitHub 就跳过，展开看命令"

    用 SSH 连一台外网服务器，在本机 1080 端口开一个 SOCKS5 代理，再让当前 shell 的下载都走它：

    ```bash
    # -D 在本机 1080 端口开 SOCKS5 代理，-N 不开远程 shell，-f 登录完转后台
    ssh -fN -D 1080 ubuntu@age:YWdlLWVuY3J5cHRpb24ub3JnL3YxCi0+IFgyNTUxOSBRTEVLYmxwc0pLSXFVNFlpOVdkandrY3hYOGlsck1VMzVKbnpHVDBwM1FRCktKWFg1MDlGb3pudjRzMjNTWnVvWVBxaWdJeDd2UFZmZEtWN2RsYWpBMVEKLS0tIFluNVo3dmhDMWxadW0wSlEyblZEQkhyNVYybWJvWTZzVTlQa1pUTUV4NWcKOxFlU2JmfvCeqFHSUE2BMsrnO/mct5r3MbNWiC1oJIFXLFDn3/a/SDx29OE=

    export ALL_PROXY=socks5h://127.0.0.1:1080
    export HTTP_PROXY=socks5h://127.0.0.1:1080
    export HTTPS_PROXY=socks5h://127.0.0.1:1080
    ```

    ssh 问密码时填 `age:YWdlLWVuY3J5cHRpb24ub3JnL3YxCi0+IFgyNTUxOSBlbVdTNGk1MFNZWWIzZWdhckcvT21kRDM3ZVVVVjJxU1gzdGtaSnB6MlNNCnMyb1BTaE5EODdmK2xYYmd5UURLK2xDNE5GZExpSGFQZmtqVzBSV2pEclUKLS0tIGFrcXFrdjRqKzVaUGpBcXNqUHNYY21ZOHJaWUVMYk84UTNrMXJ0UkpkSU0KWPtwciteS4n+zH7vUW5e5Mkvf39C+JXmBGhbCaBbGXv5I2aEdp8hqNR+Q7h7fu68WA==`。服务器地址和密码都打了码，点马赛克解锁，规矩见[写作规范的打码一节](../../skills/wiki-guide/mkdocs-wiki/index.md#age-mosaic)。

    验收：`curl -sI https://github.com | head -1` 打印 `HTTP/2 200`。

    - `socks5h` 的 `h` 表示域名也交给服务器解析——本机 DNS 查到的 GitHub 地址可能本身就不通。
    - 变量只在当前 shell 里有效：第 3 步的 `exec zsh` 会原样继承，断开 SSH 重新登录就要再 export 一遍。
    - `sudo` 默认清掉环境变量，第 1 步的 `apt-get` 照旧直连。
    - 后面的下载全靠 curl 和 git，两者都认 `socks5h://`；wget 不支持 SOCKS，好在 uv 和 nvm 的安装脚本有 curl 时都优先用 curl。

## 1. 装 zsh { #zsh }

```bash
sudo apt-get update && sudo apt-get install -y zsh git curl wget
```

## 2. 装 Oh My Zsh 和插件 { #oh-my-zsh }

!!! warning "只在新机器上跑"
    第一行会删掉 `~/.oh-my-zsh` 重装，里面自己加的主题和插件会丢。旧的 `~/.zshrc` 不用管，安装器会自己把它备份成 `~/.zshrc.pre-oh-my-zsh`。

```bash
# ~/.oh-my-zsh 已存在时安装器会直接退出，所以先删
rm -rf ~/.oh-my-zsh
sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)" "" --unattended

# 自动补全、语法高亮两个插件
ZSH_CUSTOM=${ZSH_CUSTOM:-~/.oh-my-zsh/custom}
git clone https://github.com/zsh-users/zsh-autosuggestions $ZSH_CUSTOM/plugins/zsh-autosuggestions
git clone https://github.com/zsh-users/zsh-syntax-highlighting.git $ZSH_CUSTOM/plugins/zsh-syntax-highlighting
sed -i 's/plugins=(git)/plugins=(git zsh-autosuggestions zsh-syntax-highlighting)/' ~/.zshrc
```

## 3. 设成默认 shell，改 `$SHELL` 再进 zsh { #shell }

```bash
sudo chsh -s "$(command -v zsh)" "$USER"
export SHELL="$(command -v zsh)" && exec zsh
```

验收：`echo $SHELL` 的结果以 `zsh` 结尾。

第二行不能省。`$SHELL` 是登录那一刻从 `/etc/passwd` 抄进环境变量的，之后没有任何东西会更新它：

- `chsh` 只改 `/etc/passwd`，当前会话不受影响。
- 单独跑 `exec zsh` 只是换了进程，环境变量原样继承，`echo $SHELL` 仍然是 `/bin/bash`。

所以要先 export 再 exec。断开 SSH 重新登录也行，登录时会重新读 `/etc/passwd`。

这一步只影响按 `$SHELL` 挑 rc 文件的安装器。2026-09-30 读了下面两个安装脚本：

| 安装器 | 往哪写 PATH | `$SHELL` 还是 bash 时 |
|---|---|---|
| uv 0.12.21 | 不看 `$SHELL`：`.profile`、`.bashrc` 这类 bash 文件存在的都写，`.zshrc`/`.zshenv` 写第一个存在的 | 没影响 |
| nvm v0.40.3 | [`nvm_detect_profile`](https://github.com/nvm-sh/nvm/blob/v0.40.3/install.sh#L278-L317) 先认 `$PROFILE`，再看 `$SHELL` 里含 bash 还是 zsh | 只写 `~/.bashrc` |

## 4. 装 uv { #uv }

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
# 代替重启 shell
source $HOME/.local/bin/env
```

验收：`uv --version` 能打印版本号。

## 5. 装 Node.js { #node }

nodejs.org 下载页给的命令，原样照抄：

```bash
# 下载并安装 nvm：
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
# 代替重启 shell
\. "$HOME/.nvm/nvm.sh"
# 下载并安装 Node.js：
nvm install 26
# 验证 Node.js 版本：
node -v    # v26.x.x
# 验证 npm 版本：
npm -v     # 11.x.x
```

验收：

```bash
grep -c NVM_DIR ~/.zshrc     # 非 0
grep -c NVM_DIR ~/.bashrc    # 0；不是 0 说明第 3 步漏了
```

漏了第 3 步，就指定 `PROFILE` 重跑一遍安装命令。nvm 看到 `.zshrc` 里还没有自己，就会补写进去：

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | PROFILE="$HOME/.zshrc" bash
```

## 6. 装 Caddy（要做反向代理的机器才装） { #caddy }

版本必须 ≥ 2.11，装完用 `caddy version` 确认——Ubuntu 自带源里的只有 2.6.2。用 apt 装，不用 docker：Caddy 要占宿主机的 80/443，放进容器也得用 host 网络。

## 没做的

- 只写了 Ubuntu（apt），其他发行版和 macOS 没写。
