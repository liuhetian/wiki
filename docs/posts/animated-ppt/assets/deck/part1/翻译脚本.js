// ============= 配置区 =============
const DEEPSEEK_API_KEY = 'sk-xxxx'; // 请替换为你的实际 API Key
const API_URL = 'https://api.deepseek.com/chat/completions';
const MODEL_NAME = 'deepseek-chat'; 

// 目标语言字典配置
const lang_dict = {
  "cn": "简体中文",
  "en": "英文",
  "fr": "法语",
  "de": "德语",
  "po": "葡萄牙语",
  "zh": "繁体中文",
  "id": "印尼语",
  "th": "泰语",
  "sp": "西班牙语",
  "ru": "俄语",
  "tr": "土耳其语",
  "vi": "越南语",
  "it": "意大利语",
  "pl": "波兰语",
  "ar": "阿拉伯语",
  "jp": "日语",
  "kr": "韩语"
};

// ============= UI 初始化 =============
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('🌍 一键多语言翻译')
    .addItem('开始翻译选中内容 (支持上下文/多列)', 'translateSelectedRange')
    .addToUi();
}

// 兼容旧版本的函数名（防止旧按钮或旧菜单报错）
function translateSelectedCell() {
  translateSelectedRange();
}

// ============= 核心批量翻译逻辑 =============
function translateSelectedRange() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const ui = SpreadsheetApp.getUi();

  // 获取用户所有的选择区域 (可能是不连续的多行)
  const rangeList = sheet.getActiveRangeList().getRanges();
  
  let headerRange = null;  // 备注上下文
  let contentRange = null; // 实际要翻译的内容

  // ============= 智能选区解析 =============
  if (rangeList.length === 1) {
    const r = rangeList[0];
    if (r.getNumRows() === 1) {
      // 仅选中了1行：无上下文，正常翻译
      contentRange = r;
    } else if (r.getNumRows() === 2) {
      // 选中了连续的2行：第1行作上下文，第2行作内容
      headerRange = sheet.getRange(r.getRow(), r.getColumn(), 1, r.getNumColumns());
      contentRange = sheet.getRange(r.getRow() + 1, r.getColumn(), 1, r.getNumColumns());
    } else {
      ui.alert('提示', '请选中 1 行，或 2 行 (作为上下文和内容)！', ui.ButtonSet.OK);
      return;
    }
  } else if (rangeList.length === 2) {
    // 选中了不连续的 2 个区域
    const r1 = rangeList[0];
    const r2 = rangeList[1];
    
    if (r1.getNumRows() !== 1 || r2.getNumRows() !== 1) {
      ui.alert('提示', '如果不连续选择，每个区域必须只有 1 行！', ui.ButtonSet.OK);
      return;
    }
    if (r1.getColumn() !== r2.getColumn() || r1.getNumColumns() !== r2.getNumColumns()) {
      ui.alert('提示', '选中的上下两行【列数】和【位置】必须完全对齐（如 B1:D1 和 B5:D5）！', ui.ButtonSet.OK);
      return;
    }
    
    // 智能判断谁在上面 (作为上下文)，谁在下面 (作为翻译主体)
    if (r1.getRow() < r2.getRow()) {
      headerRange = r1;
      contentRange = r2;
    } else {
      headerRange = r2;
      contentRange = r1;
    }
  } else {
    ui.alert('提示', '选区太复杂！请仅选中 1 行，或 2 行 (可以是按住 Ctrl 选中的不连续两行)。', ui.ButtonSet.OK);
    return;
  }

  // 提前提取文本 (在插入列导致列数变化之前获取)
  const sourceTexts = contentRange.getValues()[0]; 
  const headerTexts = headerRange ? headerRange.getValues()[0] : null;

  // 构建要求 AI 返回的语言 key 列表 (排除原语言 cn)
  const targetLangs = Object.keys(lang_dict).filter(k => k !== 'cn');
  const targetLangsPrompt = targetLangs.map(k => `"${k}": ${lang_dict[k]}`).join('\n');

  // 构建 System Prompt (加入了对上下文的处理提示)
  const systemPrompt = `You are a professional video game localization translator. 
The user will provide "[Text to Translate]" in Simplified Chinese. 
Sometimes, the user may also provide a "[Context/Remark]" to give you background information (e.g. "Title", "NPC Name", "Item Description"). 
You MUST USE this context to accurately interpret the text, but DO NOT translate the context itself. ONLY translate the "[Text to Translate]".

CRITICAL RULES:
1. PRESERVE PLACEHOLDERS: Do NOT translate any content inside curly braces { }. Keep them exactly as they are (e.g., { ai_bot_name }, {PlayerName}).
2. JSON OUTPUT ONLY: Your response must be a valid JSON object.
3. KEYS REQUIRED: The JSON keys must exactly match the following language codes:
${targetLangsPrompt}

EXAMPLE OUTPUT FORMAT:
{
  "en": "Dear Player,\\n...",
  "zh": "尊敬的玩家，\\n...",
  "id": "Kepada PEMAIN yang terhormat,\\n..."
}
`;

  // 组装所有并行的 API 请求
  const requests = [];
  const validIndices = []; // 记录哪一列实际上有文本内容

  sourceTexts.forEach((text, index) => {
    if (text && typeof text === 'string' && text.trim() !== '') {
      
      // 组装 User Prompt
      let userPrompt = "";
      if (headerTexts && headerTexts[index] && String(headerTexts[index]).trim() !== "") {
        userPrompt += `[Context/Remark]: ${headerTexts[index]}\n`;
      }
      userPrompt += `[Text to Translate]: ${text}`;

      const payload = {
        model: MODEL_NAME,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        response_format: { type: "json_object" },
        temperature: 0.1
      };

      requests.push({
        url: API_URL,
        method: "post",
        contentType: "application/json",
        headers: {
          "Authorization": "Bearer " + DEEPSEEK_API_KEY
        },
        payload: JSON.stringify(payload),
        muteHttpExceptions: true
      });
      validIndices.push(index);
    }
  });

  if (requests.length === 0) {
    ui.alert('提示', '翻译主体行全为空，没有找到可翻译的内容！', ui.ButtonSet.OK);
    return;
  }

  const contextStr = headerRange ? "(已附加备注上下文) " : "";
  spreadsheet.toast(`正在并行翻译 ${requests.length} 列数据 ${contextStr}，请稍候...`, '🚀 批量翻译中', -1);

  try {
    const responses = UrlFetchApp.fetchAll(requests);
    const translatedDicts = [];

    // 解析并发请求的结果
    for (let i = 0; i < responses.length; i++) {
      const resp = responses[i];
      const responseCode = resp.getResponseCode();
      const json = JSON.parse(resp.getContentText());

      if (responseCode !== 200) {
        throw new Error(`第 ${validIndices[i] + 1} 个任务翻译失败: ` + (json.error ? json.error.message : 'API 异常'));
      }

      let resultContent = json.choices[0].message.content;
      // 防止 AI 输出 markdown 代码块
      resultContent = resultContent.replace(/^```json\s*/i, '').replace(/```\s*$/i, '');
      
      translatedDicts.push(JSON.parse(resultContent));
    }

    // ============= 写入 Google Sheet =============
    let row = contentRange.getRow();     // 目标文本所在的行
    let col = contentRange.getColumn();  // 目标文本所在的起始列
    let numCols = contentRange.getNumColumns();

    const langKeys = Object.keys(lang_dict);
    const numRowsNeeded = langKeys.length;

    // 1. 在文本行下方插入需要的空行数
    sheet.insertRowsAfter(row, numRowsNeeded - 1);

    // 2. 在当前选区的左侧，直接插入一个全新的空白列，用来放 Code。原有数据将被安全向右推
    sheet.insertColumnsBefore(col, 1); 

    const codeArray = [];
    const textArrays = []; 

    for (let i = 0; i < langKeys.length; i++) {
      const langCode = langKeys[i];
      codeArray.push([langCode]); 

      const rowData = [];
      for (let j = 0; j < numCols; j++) {
        const reqIndex = validIndices.indexOf(j);
        if (reqIndex !== -1) {
          if (langCode === 'cn') {
            rowData.push(sourceTexts[j]); 
          } else {
            rowData.push(translatedDicts[reqIndex][langCode] || "");
          }
        } else {
          rowData.push("");
        }
      }
      textArrays.push(rowData);
    }

    // 批量写入表格
    // 因为插入了新列，此时原本的列位置 col 变成了新空白列，原本的文本列被推到了 col + 1
    sheet.getRange(row, col, numRowsNeeded, 1).setValues(codeArray);
    const textRange = sheet.getRange(row, col + 1, numRowsNeeded, numCols);
    textRange.setValues(textArrays);
    
    // 排版优化
    textRange.setWrap(true);
    textRange.setVerticalAlignment('top');
    sheet.getRange(row, col, numRowsNeeded, 1).setVerticalAlignment('top');

    spreadsheet.toast(`已成功写入 ${requests.length} 列的多国语言翻译！`, '🎉 翻译完成', 3);

  } catch (error) {
    ui.alert('发生错误', error.toString(), ui.ButtonSet.OK);
  }
}