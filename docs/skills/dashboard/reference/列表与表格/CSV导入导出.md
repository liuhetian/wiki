# CSV 导入导出

表格数据要出去（给 Excel、给同事）或成批进来（历史数据、别的系统的导出）时的标准形状：**导出**把当前行按 RFC 4180 序列化成 CSV 下载；**导入**先解析预览、逐行校验，确认后只把合法行交给批量创建。核心是三个纯粹的工具函数：`toCsv` / `downloadCsv` / `parseCsv`。

<iframe src="/skills/dashboard/assets/demo-export-import.html"
        style="width:100%;height:660px;border:1px solid #8884;border-radius:10px"
        loading="lazy" title="形状 demo：CSV 导入导出"></iframe>

试这几下：

- 切换状态筛选再点**导出 CSV** —— 导出的永远是筛选后的行；展开「预览 CSV 文本」不用下载也能看到产物
- 点**导入 CSV → 填入示例 CSV** —— 示例里埋了三个转义坑（引号内逗号、翻倍引号、引号内换行）和几条坏行：合法行绿、非法行红并给出行级错误（ID 非数字、状态非枚举、缺值）
- 点**导入 n 行** —— 只入合法行，重复 id（表里已有的 3 号）跳过，toast 分类报数
- 也可以选本地 .csv 文件或直接粘贴 CSV 文本，预览随输入实时刷新；导出的 CSV 粘回去能无损往返

## 规矩

- **转义交给 `toCsv`，别手拼字符串**：字段含逗号/引号/CR/LF 才裹双引号，内嵌引号翻倍（RFC 4180）；`parseCsv` 反向同样处理引号内的逗号与换行，往返不丢字
- **`downloadCsv` 只在浏览器跑**：函数内守卫 `document`，服务端调用是 no-op；`parseCsv` 是纯函数，服务端安全
- **导入只预览，落库前必须校验**：解析出的每行过资源的 schema（demo 用表头映射 + 行级规则代替 Zod），确认后只提交合法行，成败都用 toast 报数。demo 写内存；真实版把合法行交给 bulk-create mutation（server fn 里先 `requireUser()`）
- **导出喂真实数据源**：demo 序列化内存里筛选后的行，真实版从 `Repository.list()` 拿全部匹配行再 `downloadCsv`

> 蓝本：[`add-export-import.md`](https://github.com/ahpxex/open-dashboard/blob/aa9815f426e9520841c4aa15a341bfd9f866091f/.claude/skills/add-component/references/add-export-import.md)（open-dashboard @ `aa9815f`，MIT，Invariants 已消化进上面「规矩」）

??? abstract "demo 源码：`assets/demo-export-import.html`（自包含、未压缩）"

    ```html
    --8<-- "skills/dashboard/assets/demo-export-import.html"
    ```
