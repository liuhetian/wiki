<!-- 中译自 alexgreensh/anidoodle@25aae33 的 skills/anidoodle/references/music/theory/README.md -->
# 写给作曲者的乐理

这几页是 [../compose.md](../compose.md) 背后的手艺：是什么让一条旋律线优美、让一个和弦进行有推动力、让一段律动听着舒服、让一种情绪传达得准确。每页都注明出处，并以可以直接套用的规则收尾。例子用音级（scale degree）和形状来写，绝不给可以照抄的现成曲调。

| 页面 | 什么时候读 |
|---|---|
| [melody.md](melody.md) | 写动机（motif）和乐句时：动机发展、旋律轮廓、高潮、跳进、和弦外音 |
| [harmony.md](harmony.md) | 写和弦和低音时：和声功能、终止式、声部进行、调式色彩、张力 |
| [rhythm.md](rhythm.md) | 写律动和旋律线时：节拍、切分、摇摆、加花、密度 |
| [mood.md](mood.md) | 为某种感觉选择速度、调式、音区和密度时（相关研究，以及 21 种情绪的对照表） |
| [form.md](form.md) | 安排段落时：歌曲曲式（form）与 cue 曲式、推进、配器的频段槽位、对位 |
| [sound.md](sound.md) | 为清晰的混音做声部排布和编曲时：临界频带、掩蔽、低音区音程下限、空间 |

`node tools/music.mjs craft <score.ts#export>` 能在几毫秒内检测这些规则，不需要渲染；`check` 也会打印同一份报告。分数从 0 到 1，仅供参考。每条 `CRAFT` 行都会写明它看到了什么、在哪里、怎么改。只有原声乐器演奏不出来的音才算错误。其余的由你判断：故意打破一条规则是风格，无意中打破则是毛病。
