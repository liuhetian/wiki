---
description: "东方仙侠视觉导演的维护记录：吸纳自 liyue-aigc/xianxia-visual-director（未附许可证），钉在 bd88617；SKILL.md 和 8 篇 reference 全文中译，放进新建的抽象 skill 视频生成，直接出图接 agent-io"
---

# 东方仙侠视觉导演（xianxia-visual-director）

[东方仙侠视觉导演](../../skills/video-gen/xianxia-visual-director/index.md)的维护记录。

- **上游**：liyue-aigc/xianxia-visual-director[^repo]，作者 liyue-aigc。仓库没附许可证，README 写明「仓库公开可见不等于授予复制、修改或再分发许可」。同一作者另有配套的运镜导演 xianxia-cinematic-video-director[^video]，管多镜头视频的运镜、节奏、连续性和逐镜头提示词，这次没收；以后要收，作为[视频生成](../../skills/video-gen/index.md)下的兄弟子 skill
- **commit**：钉在 `bd88617`[^commit]（2026-08-08，上游唯一的提交），2026-10-20 读
- **跳过**：
    - `README.md`：安装命令、最小和完整调用示例、目录结构、License 一节。开头两段的定位并进入口的领域建模，「注意事项」里只有一条 `SKILL.md` 没写的规矩收了（见下）
    - README「与运镜导演配合」一节：两套同时用时画幅、尺度、饱和、建筑、人物、服装、材质、天气、光线方向只锁一次。运镜导演没收，这条跟着不收
    - `agents/openai.yaml`：Codex 的界面元数据；`display_name` 拿来当了能力名，`short_description`、`default_prompt` 没收
    - `.gitignore`
- **翻译之外的改动**：
    - **结构**：`SKILL.md` → `skills/video-gen/xianxia-visual-director/index.md`，放在新建的抽象 skill 视频生成下面，那一层是本站自己建的归类，以后同类的 skill 都放进去；`references/` → `reference/`，8 个文件名照旧
    - **frontmatter**：`name` 改成 `东方仙侠视觉导演`（取自 `openai.yaml` 的 `display_name`），`description` 改写成什么时候用、用了做什么
    - **入口**：开头补领域建模，取自 README 开头两段；上游的「Required loading order」改成「加载顺序」，链接文字换成各篇中文标题，兼作 reference 目录，入口不另列一遍
    - **自定义枚举值**：README「注意事项」写着 `柔和鲜明`、`静谧朝圣` 这类非内置参数可以当用户自定义意图保留，但要说明对应到哪个内置逻辑；`SKILL.md` 只写了「不要悄悄取近似」。两句不冲突，并进入口的[参数锁定](../../skills/video-gen/xianxia-visual-director/index.md#parameter-lock)
    - **直接出图**：上游写「调用可用的生图能力」，不绑平台。改成接 [生成、编辑图片](../../skills/agent-io/reference/image.md) 的 gpt-image-2.5：接口没有负面字段，负面约束接在 prompt 末尾；`size` 写锁定的画幅。2026-10-20 六种画幅各实测出过一张，像素和耗时记在[图片生成的维护记录](../image.md#tests)；21:9 一张 438 秒，顺带把 agent-io 的超时从 400 秒改成 600 秒，补了同时最多两个请求
    - **链接**：`visual-dna.md`、`composition-color-light.md` 里「读它的专篇」没给链接，补成链到[东方苍穹巨构](../../skills/video-gen/xianxia-visual-director/reference/eastern-sky-megastructure-style.md)
    - **不译的词**：画幅一篇的「Prompt cue」译成「提示语」，后面的中文提示语原样；`visual-dna.md` 里的 6 条英文配色措辞、提示词示例里的 `text` 代码块原样 —— 都是直接写进 prompt 的词，中英混写是上游有意的
    - **锚点和目录**：各篇二级标题加英文锚点，超过 100 行的在一级标题下加目录；原典一篇上游自带的 Contents 改成真链接

[^repo]: [liyue-aigc/xianxia-visual-director](https://github.com/liyue-aigc/xianxia-visual-director)，2026-10-20 读。
[^commit]: [`bd88617`](https://github.com/liyue-aigc/xianxia-visual-director/tree/bd886174f4d84659f2381c4f5baa610003c5bdda)，2026-10-20 读。
[^video]: [liyue-aigc/xianxia-cinematic-video-director](https://github.com/liyue-aigc/xianxia-cinematic-video-director)，2026-10-20 只确认了仓库存在（HEAD `e196200`），没读内容；它管什么取自本仓库 README。
