---
name: 吸纳子 wiki
description: "把一个项目写好的子 wiki 收进本 wiki 时用：核对约定、把 docs/ 整个拷进 projects/<目录名>/、照它的 nav 注册、在项目索引挂「自有：」钩子、跑 check-links；目录归项目，问题退回项目改"
---

# 吸纳子 wiki

把 <input name="项目路径" placeholder="项目仓库的本地路径" required> 的子 wiki 收进本 wiki 的 `docs/projects/` 下，目录名用 <input name="目录名" placeholder="项目的仓库目录名" required>。

你当前的工作区就是本 wiki 的仓库。先读 `docs/skills/wiki-guide/index.md`。

**`projects/<目录名>/` 整个归项目**：这里的文件每次吸纳都被覆盖，发现的问题一律退回项目改，不在本 wiki 里改。

## 步骤

1. **看目标目录**：不存在就新建。已存在的，项目索引里它那行钩子以「自有：」开头才能覆盖；否则是手写的项目页，停下问我
2. **核对[共同约定](index.md#contract)**：逐条看项目的 `docs/`。不符合的列出来交给我，到此为止
3. **拷**：

    ```bash
    rsync -a --delete --exclude='.*/' --exclude='javascripts/' <项目路径>/docs/ docs/projects/<目录名>/
    ```

4. **注册 nav**：在 `mkdocs.yml` 的「项目」下找对应的领域组，建一组，条目和顺序照项目 `zensical.toml` 的 `nav`，路径加 `projects/<目录名>/` 前缀；`index.md` 放组的第一条。重新吸纳时整组照新的重写
5. **挂钩子**：`docs/projects/index.md` 对应领域下加一行，以「自有：」开头，后面照抄 `index.md` 的 `description`。重新吸纳时两边对一遍
6. **跑 `python3 scripts/check-links.py`**：报在 `projects/<目录名>/` 里的，退回项目改完再从第 3 步来；报在别处的，在本 wiki 改
7. **交付**：说明拷了几页、nav 挂在哪一组、有没有 `.meta.yml` 的 `api_base`。不提交、不部署，等我说

项目的文档后来只改了内容，重跑第 3、6 步；增删了页面，从第 3 步走到底。
