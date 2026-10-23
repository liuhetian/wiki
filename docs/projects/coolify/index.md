---
description: "Coolify 粗讲：和 Podman 不在一层，它不是容器引擎，是坐在 Docker 之上的自托管 Heroku；主路径是 SSH 进目标机起 helper 容器构建镜像，用带 Traefik label 的 compose 拉起"
---

# Coolify：不是容器引擎，是用 SSH 驱动 Docker 的部署平台

它和 Podman 不在一层。Podman 是容器引擎，管一台机器上的容器怎么跑；Coolify 是自托管的 Heroku，坐在 Docker 之上，管 git 仓库怎么变成带域名和 HTTPS 的线上服务。它也换不成 Podman：源码里没有 podman，目标机缺 Docker Engine 就判为不可用[^repo]。

主路径靠 SSH 发 shell 命令，连本机也 SSH 进去管。部署时它在目标机起一个 helper 容器，挂上宿主的 docker.sock，在里面 clone 代码、默认用 Railpack 推断出镜像，再生成带 Traefik label 的 compose 文件拉起新容器；Traefik 读 label 把域名指过去，新容器健康了才停旧的。

构建、备份归它；HTTPS 它只把域名写成 label，证书由它起的 Traefik 去签，可换成 Caddy。容器怎么跑、挂了怎么重启交给 Docker，所以 Coolify 停了服务照跑。服务器、Docker、DNS 由用的人准备，仓库认不出来就得自己写 Dockerfile。

[^repo]: [coollabsio/coolify](https://github.com/coollabsio/coolify/tree/2ade6963758266a244fe787152b79ecd35e8849d)，读的是 commit `2ade696`，2026-10-20 读。
