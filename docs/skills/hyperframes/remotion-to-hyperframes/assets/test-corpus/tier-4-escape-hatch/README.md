<!-- 中译自 heygen-com/hyperframes@46f6cb3 的 skills/remotion-to-hyperframes/assets/test-corpus/tier-4-escape-hatch/README.md（Apache-2.0）；改动说明见 skills/hyperframes/MIRROR.md -->

# Tier 4 — escape-hatch

## 测试内容

T4 是**只做 lint** 的层级。没有需要对比 diff 的渲染 —— 评判本 skill 的标准是：它是否正确地对每个案例*拒绝*翻译（并转而推荐 PR #214 中的 runtime 互操作模式），或者在合适的情况下，去掉警告级别的修饰之后再翻译。

每个 `cases/*.tsx` 文件都是一个最小的 Remotion composition，演示一种特定的模式。本 skill 应当：

1. 对源码运行 `scripts/lint_source.py`。
2. 把 JSON 输出与该案例的 `expected.json` 进行比对。
3. 采取文档规定的 `skill_action`：
   - `refuse_translation_recommend_interop` —— 打印理由 + 指向 PR #214 互操作指南的链接；不要产出 HF 输出。
   - `drop_lambda_code_translate_remainder_if_clean` —— 去掉 `@remotion/lambda` 代码并附上说明；只有在不存在其他阻断项时，才翻译其余部分。
   - `translate_after_dropping_wrappers` —— 正常翻译；去掉 `useCallback` / `useMemo` / `delayRender` 包装。
   - `inline_hook_body_if_pure` —— 如果自定义 hook 的函数体是 `useCurrentFrame` 的纯推导，就把它内联；否则退出不做。

## 案例

| # | 文件 | 预期发现 | 备注 |
| --- | --- | --- | --- |
| 01 | `01-use-state.tsx` | blocker `r2hf/use-state` | 用 useState 驱动动画 |
| 02 | `02-use-effect-deps.tsx` | blocker `r2hf/use-effect-deps` | 依赖数组非空的 useEffect/useLayoutEffect |
| 03 | `03-async-metadata.tsx` | blocker `r2hf/async-metadata` | calculateMetadata 返回一个 Promise |
| 04 | `04-third-party-react.tsx` | blocker `r2hf/third-party-react-ui` | 导入了 `@mui/material` |
| 05 | `05-lambda-config.tsx` | warning `r2hf/lambda-import` | 导入了 `@remotion/lambda` —— 去掉它，照常翻译 |
| 06 | `06-warnings-only.tsx` | 只有 warning | delayRender / useCallback / useMemo |
| 07 | `07-custom-hook.tsx` | warning `r2hf/custom-hook` | 在本地定义的 `useFadeIn`（export const 形式） |
| 08 | `08-mixed.tsx` | 3 个 blocker + 1 个 warning | 汇总多项发现的测试 |

## 校验

```bash
./validate.sh
```

该脚本对每个案例运行 `lint_source.py`，并断言：

- 每条预期的阻断规则都以 severity `blocker` 触发。
- 每条预期的警告规则都以 severity `warning`（或更高）触发。
- 预期有阻断项时，`lint_source.py` 的退出码为 1，否则为 0。

每个案例都与其预期输出相符时，T4 即通过。不涉及任何渲染。
