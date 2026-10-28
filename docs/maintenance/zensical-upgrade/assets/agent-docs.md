<!-- 存档：Zensical 官方对「给 AI 发 Markdown」的表态，2026-10-28 抓取，只留升级评估引到的部分。issue #859：https://github.com/zensical/zensical/issues/859 ；路线图：https://zensical.org/roadmap/ 。原文放在代码块里，不渲染。 -->

# Zensical 官方对给 AI 发 Markdown 的表态（存档）

## issue #859：Support `.md` URL suffix to serve raw Markdown for docs pages

<https://github.com/zensical/zensical/issues/859>，2026-08-13 提，2026-08-14 关闭。下面是维护者 squidfunk 的两条回复。

<https://github.com/zensical/zensical/issues/859#issuecomment-5291561058>（2026-08-14）

````markdown
Thanks for suggesting. We've written an [entire proposal](https://zensical.org/spark/proposals/zap-009-structured-docs-for-the-agentic-era/) on this topic.

__TL;DR: Serving Markdown to agents is currently non-standardized, and there is no proof that agents actually use it.__ Additionally, serving the raw Markdown sources is not enough, because includes (snippets, directives, mkdocstrings) and potentially other constructs would be missing from the source. The only way to sensibly serve Markdown is to go through rendering, then convert HTML to CommonMark. I'm linking this as a feature request to the backlog item that tracks our work on this topic.
````

<https://github.com/zensical/zensical/issues/859#issuecomment-5368088325>（2026-08-21）

````markdown
Sure. Understood. We'll provide it once we work on this topic, [but as mentioned](https://github.com/zensical/zensical/issues/859#issuecomment-5291561058) – it's not an easy "Just serve the original Markdown".
````

回复里链的提案 ZAP-009 已经下线，地址跳转到路线图。

## 路线图（节选）

<https://zensical.org/roadmap/>。网页上的状态表转成了列表，每项是「名称 · 分类 · 说明」。

````text
Status

Now available
- Directives · Spark early access · Content reuse · Assemble focused documentation from shared Markdown sources.
- MkDocs privacy plugin replacement · MkDocs compatibility · Download external assets for local hosting.
- MkDocs include-markdown plugin replacement · MkDocs compatibility · Include shared Markdown files in pages.
- MkDocs llmstxt plugin replacement · MkDocs compatibility · Publish an llms.txt index and Markdown exports.
- （其余 12 项是 MkDocs 插件替代，略）

In development
- MkDocs optimize plugin replacement · MkDocs compatibility · Optimize media files during site builds.
- Zensical Markdown · Spark first · Markdown toolchain · Reimplement Python Markdown for faster builds and easier extensions.

Up next
- Project model for your agents · Agentic workflows · Give agents CLI access to the project model.
- Migration readiness · Migration and import · Assess a project before moving it to Zensical.
- Module API for Python · Spark first · Module system · Extend Zensical by writing modules in Python.

Agentic workflows

Agents need access to Studio's project model and workspace intelligence. Command-line tools make those capabilities available for understanding and changing projects. Documentation builds can also make project knowledge available to users and agents.

- Project model for your agents: Give agents CLI access to the project model.
- Rule checks for your agents: Check whether agent changes follow organization-owned rules.
- Agent-ready documentation: Build documentation for users and agents.
````
