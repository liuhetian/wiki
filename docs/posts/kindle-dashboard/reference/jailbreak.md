# PW4 / 5.12.4 越狱与显示通道实操

!!! abstract "这是落地篇"
    本篇是[《让 Kindle 常显一块 Token 看板》](../index.md)的实操手册。主文讲清楚了**为什么这么设计** —— 五条达标线、上报而非拉取、数据指纹去重、一份契约两个渲染端；本篇只管把"显示通道"打通：让一张 PNG 能稳定地出现在这块屏上。

    **越狱不是项目目标**，只是稳定刷新屏幕与接通 USB 网络的手段。它整个落在数据采集层的边界之外。

    [← 回到主文：设计](../index.md)

- 最后验证：2026-07-25
- 验证设备：Kindle Paperwhite 4（第 10 代，Moonshine / Rex）
- 序列号前缀：`G000T6` / `0T6`
- 验证固件：`5.12.4`

## 先判断要不要越狱 { #要不要 }

**如果只是偶尔查看网页，用 Kindle 自带浏览器就行，不必越狱。**

以下情况都没有必要越狱：只想手动打开一个网页；更新频率很低；可以接受锁屏、浏览器退出或网络断开后手动恢复；设备固件没有成熟明确的越狱方法；这台 Kindle 仍是主要阅读设备，不能接受更新、保修或变砖风险。

要长期无人值守地常显，候选方案是这几种：

| 方案 | 是否越狱 | 优点 | 主要问题 | 适合场景 |
|---|---:|---|---|---|
| Kindle 自带浏览器打开仪表盘 | 否 | 上手最快；服务端可随时改版 | 浏览器稳定性、休眠和全屏控制较弱；依赖 Wi-Fi | 偶尔查看、先验证界面 |
| 定期生成电子书或图片后手动同步 | 否 | 风险最低；无需改系统 | 不能真正无人值守；刷新链路绕 | 日报、周报 |
| Kindle 自己采集数据并渲染 | 是 | 不需要外部主机 | Kindle 运行环境老旧；密钥、联网、依赖和日志都难维护 | 单机实验 |
| 树莓派提供网页，Kindle 浏览器显示 | 可选 | 数据端清晰；开发简单 | 仍受浏览器与 Wi-Fi 影响 | 局域网原型 |
| **树莓派渲染图片，经 USB 推给 FBInk** | 是 | 链路可控；无需 Kindle Wi-Fi；密钥隔离；易自动恢复 | 初次安装步骤较多；需要 USBNetwork | 长期固定信息屏 |
| 拆机接串口或直接驱动屏幕 | 是/硬件改造 | 控制最底层 | 风险、成本和工作量最高 | 研究与救砖，不适合本项目 |

本项目选最后一条粗体的那种。**浏览器方案最适合做第一版原型，却不适合作为最终运行方式** —— 它把长期稳定性寄托在浏览器、前台页面、Wi-Fi、休眠策略和页面自动刷新上，任何一个环节退出都会停止更新。让 Kindle 自己采集数据同样不划算：它的优势是屏幕，不是通用计算环境，一旦丢失或恢复出厂，密钥管理会变得麻烦。

## 推荐实施顺序 { #顺序 }

不要一开始就接入所有真实 API。最短、最容易排错的顺序是：

1. 备份 Kindle 用户存储；
2. 核对机型和固件，确认对应越狱方法；
3. 完成越狱、Hotfix、KUAL 和 MRPI；
4. 屏蔽 OTA 更新；
5. 安装 USBNetwork 和 FBInk；
6. 在电脑上手动推送一张固定图片；
7. 在树莓派上建立独立 SSH 密钥并再次手动推送；
8. 使用模拟 JSON 完成渲染和每分钟定时任务；
9. 测试拔线、重插、重启和采集失败；
10. 最后接入一个真实数据源，再逐个增加其他来源。

**这个顺序让每一步只引入一个主要变量。**

## 已验证的设备参数 { #参数 }

| 项目 | 验证值 |
|---|---|
| Kindle 地址 | `192.168.15.244` |
| 主机端地址 | `192.168.15.201/24` |
| SSH 用户 | `root` |
| Framebuffer | `1072 × 1448`，8 bpp |
| 屏幕密度 | 300 dpi |
| 已验证旋转 | 顺时针 90°（framebuffer 记录为 270°） |
| 远端目录 | `/mnt/us/token-dashboard/` |
| 当前图片 | `/mnt/us/token-dashboard/dashboard.png` |
| FBInk 路径 | `/mnt/us/usbnet/bin/fbink` |
| USBNetwork | `0.22.N-r19297` |
| MRPI | `1.7.N r19303` |

`192.168.15.x` 是 USBNetwork 的默认网段，不是私密信息。

## 越狱：仅适用于本次 PW4 / 5.12.4 { #越狱 }

!!! warning "开始前必须逐条确认"
    1. 在 Kindle 的"设备信息"中再次确认型号与固件；
    2. 开启飞行模式并忘记已保存的 Wi-Fi；
    3. 用可传数据的 USB 线连接电脑；
    4. 备份整个可见 USB 存储区；
    5. 保证电量充足；
    6. 阅读当前维护的 [Kindle Modding Wiki](https://kindlemodding.org/) 和对应方法页面；
    7. **若机型或固件与本文不同，立即停止并重新选方法。**

    不要假设"固件更高只是数字不同"。越狱利用的是特定漏洞，错误版本通常不会成功，严重时可能导致设备无法正常启动。原厂固件通常也不能在未越狱状态下自行降级。

### 为什么这台设备选 KindleBreak

PW4 在固件 `5.12.4` 上位于 KindleBreak 的已知适用范围内。本地保存的 `jb-kindlebreak.zip` 的 MD5 为：

```text
0215C36CC1E3AD8136A67DAEBE369452
```

这个值与旧版 KindleBreak 指南公布的包一致。**哈希只能证明文件与该版本包一致，不能代替机型和固件兼容性检查。**

### 备份

本次操作前分别保留了普通备份和越狱前备份。至少需要备份：`documents/`、字典、字体、阅读进度与 `.sdr` 目录、其他自己放入 Kindle 的文件。

备份用户存储不能保证可以救回损坏的系统分区，但可以避免丢失个人内容。

### 运行 KindleBreak

从 `jb-kindlebreak.zip` 解压得到四个文件：`jb`、`jb.sh`、`kindlebreak.html`、`kindlebreak.jxr`。

1. 把四个文件复制到 Kindle USB 存储的根目录，也就是与 `documents` 同级的位置；
2. 安全弹出并拔掉 Kindle；
3. 打开 Kindle 的实验性浏览器；
4. 在地址栏准确输入 `file:///mnt/us/kindlebreak.html`（**三个斜杠**）；
5. 等待浏览器冻结、退出或出现应用错误；
6. 等待 Kindle 自动重启，**不要在执行过程中强制断电**；
7. 重启后检查根目录中的 `kindlebreak_log.txt`，确认脚本已经写入开发者密钥并完成。

浏览器报错或卡住是这条利用链的预期现象之一，最终以重启和日志为准。

### 安装并运行 Hotfix

越狱成功后**立刻**安装 Hotfix，使开发者密钥在后续系统变化后有恢复路径。本次使用的文件名是 `Update_hotfix_universal.bin`。

1. 保持飞行模式；
2. 将 Hotfix `.bin` 放到 Kindle USB 存储根目录；
3. 安全弹出并拔线；
4. 进入设置菜单，选择"更新您的 Kindle"；
5. 等待更新和重启完成；
6. 在书库中打开 `Run Hotfix`，让 Hotfix 真正执行。

如果"更新您的 Kindle"不可用，依次检查：文件是否仍在根目录；是否已经提前屏蔽了 OTA；根目录是否存在其他残留 `.bin` 或 `update.bin.tmp.partial`；下载包是否适用于当前方法。

**安装 Hotfix 应早于 Rename OTA Binaries。**若已经执行 Rename，需要先在 KUAL 中 Restore，装完 Hotfix 后再 Rename。

### 安装 KUAL 与 MRPI

KUAL 是图形入口，MRPI 用于安装 MobileRead 格式的更新包。本次本地包：`kual-mrinstaller-khf.zip`、`PEKI.zip`。

1. 解压 MRPI 包；
2. 将解压得到的 `extensions` 和 `mrpackages` 目录复制到 Kindle USB 根目录；
3. 解压 `PEKI.zip`；
4. 将 `KUAL.sh` 和 `KUAL.jar` 复制到 Kindle 的 `documents/`；
5. 安全弹出并拔线；
6. 等待书库出现 KUAL 项目并打开；
7. 确认 KUAL 中可以看到 MR Installer/Helper 相关入口。

若 KUAL 不出现或无法启动：确认文件没有被解压出多余的一层目录；确认 Kindle 至少保留约 220 MB 可用空间；重启后再试；确认 Hotfix 已安装并运行；不要混用针对其他代际设备的旧版 KUAL 包。

### 屏蔽 OTA 更新

本机固件高于 5.10，使用 KUAL 的 Rename OTA Binaries 扩展：

1. 解压 `renameotabin.zip`；
2. 找到最内层、直接包含 `menu.json`、`config.xml` 和 `bin/` 的 `renameotabin` 目录；
3. 将这个目录复制到 Kindle 的 `extensions/`；
4. 删除 Kindle USB 根目录中残留的官方更新 `.bin` 或 `update.bin.tmp.partial`；
5. 安全弹出并拔线；
6. 打开 KUAL → `Rename OTA Binaries` → `Rename`；
7. 等待设备自动重启。

以后若要恢复官方更新、更新 Hotfix、恢复出厂或降级，**先在 KUAL 中选择 `Restore`**。不要在 Rename 状态下直接恢复出厂设置。

## 接通 USB 网络 { #usbnet }

本次验证版本：

```text
kindle-usbnet-0.22.N-r19297
Update_usbnet_0.22.N_install_pw2_and_up.bin
```

PW4 应使用 `pw2_and_up` 安装包，**不使用** `touch_pw` 包。

1. 把 `Update_usbnet_0.22.N_install_pw2_and_up.bin` 放入 Kindle 根目录的 `mrpackages/`；
2. 安全弹出并拔线；
3. 打开 KUAL 的 MR Installer，执行 `Install MR Packages`；
4. 等待安装和界面恢复，必要时完整重启一次；
5. 在 KUAL → USBNetwork 中选择 OpenSSH；
6. 启用 USB 网络；
7. 初次调试阶段先不要启用 Wi-Fi SSH 或无条件开机 SSH。

USBNetwork 的默认参数是 Kindle `192.168.15.244`、主机 `192.168.15.201/24`。Windows 通常还需要给 RNDIS/Ethernet Gadget 安装合适的驱动，并给对应网卡手动设置上述主机地址；Linux 一般使用 `rndis_host` 或 `cdc_ether`。

### 公钥登录

不要长期依赖空密码或通用密码，也不要把测试私钥提交到 Git。在控制端生成专用 Ed25519 密钥，只把公钥**追加**（不是覆盖）到 `/mnt/us/usbnet/etc/authorized_keys`，每个公钥完整占一行。验证新密钥能登录后，再移除旧测试公钥。

```bash
ssh -i /path/to/kindle_ed25519 root@192.168.15.244 "uname -a"
```

## 验证 FBInk 显示 { #fbink }

先确认程序版本：

```bash
ssh -i /path/to/kindle_ed25519 root@192.168.15.244 \
  "/mnt/us/usbnet/bin/fbink -V"
```

再上传一张已经旋转为 `1072 × 1448` 的 PNG。**用临时文件 + 原子替换**，避免 FBInk 读到写了一半的图：

```bash
scp -i /path/to/kindle_ed25519 \
  dashboard-kindle.png \
  root@192.168.15.244:/mnt/us/token-dashboard/dashboard.next.png

ssh -i /path/to/kindle_ed25519 \
  root@192.168.15.244 \
  "mv /mnt/us/token-dashboard/dashboard.next.png \
      /mnt/us/token-dashboard/dashboard.png && \
   /mnt/us/usbnet/bin/fbink -c -f -i \
      /mnt/us/token-dashboard/dashboard.png"
```

首次测试用 `-c -f` 做完整清屏，便于判断方向和残影。正式运行时可减少全刷频率 —— 普通变化用较温和的刷新，每 20～60 次实际变化再全刷一次。

!!! warning "方向坑：`fbink -i` 自己不转图"
    它按 framebuffer 的原生方向（竖屏 `1072 × 1448`）贴图，喂横图会被裁掉右边。所以渲染端产出横屏 `1448 × 1072`（Web 预览可读），推送前再转成竖屏。主文里[把旋转角一并计入了推送指纹](../index.md#视觉)，改方向能立刻重推，不会被"内容没变"挡掉。

Windows 原型已经验证过完整的最短链路：生成模拟 PNG → 旋转为 Kindle 尺寸 → 比较本地和远端 SHA-256 → SCP 上传 `dashboard.next.png` → `mv` 原子替换 → `fbink -c -f -i` 显示。

## 迁移到树莓派 { #迁移 }

越狱与显示链路验证完成后，再迁移控制端。

**网络**：给 Kindle 对应的 USB 网卡设置固定地址 `192.168.15.201/24`，同时确保该连接**不成为默认路由** —— 否则 Kindle 的 USB 网卡会抢走树莓派原有的互联网出口。

**身份隔离**：为看板创建独立系统用户，并在树莓派上生成一把新的专用密钥。不要复制 Windows 原型使用的私钥。

**数据隔离**：采集器只负责写入统一的数据层（本项目是 SQLite），渲染器只读统一数据，不直接了解各 API 的鉴权方式。采集失败时保留上一版有效数据并记录问题 —— **不要把"请求失败"解释成"用量为 0"**。

**进程形态**：本项目最终用 systemd 托管一个常驻的 FastAPI 服务（`asyncio` 循环挂在 lifespan 上，部署只有 uvicorn 一个入口）。如果走脚本 + 定时任务的路线，定时任务应该是短时运行的 oneshot，而不是在脚本里无限等待 Kindle —— Kindle 未连接时快速失败，下一次定时任务再重试。

刷新的判定逻辑不在这里展开，它是设计的一部分：见主文的[数据指纹去重](../index.md#指纹)。

## 安全、维护与回退 { #安全 }

必须保留的边界：

- API 密钥只留在树莓派，权限设为最小；
- SSH 私钥不进入 Kindle，不进入 Git；
- 不在仓库提交真实用量数据、设备序列号全文或个人书籍；
- Kindle 只开放 USB 侧 SSH，除非确实需要 Wi-Fi SSH；
- 自动任务使用专用用户，不使用树莓派的日常登录账户；
- 首次长期运行前测试断电、拔线、重插和两端重启。

计划恢复出厂、安装官方固件或更新 Hotfix 前：KUAL → Rename OTA Binaries → `Restore` → 确认更新文件可以被系统识别 → 备份用户数据 → 明确接受越狱或第三方组件可能失效。

!!! danger "不要做的事情"
    - 不要在 OTA binaries 仍被 Rename 时恢复出厂；
    - 不要覆盖整个 `authorized_keys`；
    - 不要把其他型号的 `.bin` 当作"差不多"使用；
    - 不要在越狱执行或系统更新过程中强制断电；
    - 不要把测试私钥上传到 wiki；
    - 不要把本文当成 2026 年以后所有固件的通用教程。

## 验收清单 { #验收 }

越狱与显示链路：

- [ ] 已核对设备是 PW4、固件是 5.12.4；
- [ ] 已备份 Kindle 用户存储；
- [ ] KindleBreak 日志确认完成；
- [ ] Hotfix 已安装并运行；
- [ ] KUAL 和 MRPI 可正常打开；
- [ ] Rename OTA Binaries 已执行；
- [ ] USBNetwork 使用正确的 `pw2_and_up` 包；
- [ ] 主机能 ping `192.168.15.244`；
- [ ] 能用专用公钥 SSH 登录；
- [ ] FBInk 能显示方向正确的 PNG。

长期运行：

- [ ] 树莓派重启后服务自动恢复；
- [ ] Kindle 重启后 USB 网络与 SSH 能恢复；
- [ ] 拔线重插后下一轮任务能恢复推送；
- [ ] 全刷频率不会造成过度闪屏；
- [ ] 日志能区分采集失败、网络失败、上传失败和显示失败；
- [ ] 原型阶段的测试公钥在迁移完成后已按计划撤销。

## 资料来源 { #资料 }

越狱方法和兼容范围会变化，操作前应以当前维护页面为准：

- [Kindle Modding Wiki](https://kindlemodding.org/)
- [KindleBreak 旧版方法说明（5.10.3–5.13.3，含例外）](https://kindlemodding.gitbook.io/kindlemodding/jailbreak-software/kindlebreak-5.10.3-5.13.3)
- [安装与运行 Hotfix](https://kindlemodding.org/jailbreaking/post-jailbreak/setting-up-a-hotfix/)
- [安装 KUAL 与 MRPI](https://kindlemodding.org/jailbreaking/post-jailbreak/installing-kual-mrpi/)
- [屏蔽 OTA 更新](https://kindlemodding.org/jailbreaking/post-jailbreak/disable-ota.html)
- [MobileRead：USBNetwork](https://wiki.mobileread.com/wiki/USBNetwork)
- [MobileRead：MRPI](https://wiki.mobileread.com/wiki/MobileRead_Package_Installer)

本机验证依据来自同级工作目录中的备份、KindleBreak、Hotfix、KUAL/MRPI、Rename OTA、USBNetwork、RNDIS 驱动、渲染与推送脚本。二进制安装包、个人电子书和 SSH 私钥都不提交到 wiki 仓库。
