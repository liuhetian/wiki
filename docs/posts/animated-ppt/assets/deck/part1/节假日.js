/**
 * 为菜单栏添加一个快捷运行按钮
 */
function onOpen() {
    const ui = SpreadsheetApp.getUi();
    ui.createMenu('🌟 节假日工具')
        .addItem('为第一列日期染色', 'colorizeHolidays')
        .addToUi();
  }
  
  
  /**
   * 核心配置：根据你的表格实际情况修改
   */
  const START_ROW = 4;    // 如果前3行是表头或杂质，请设为 4（从第4行开始处理）
  const DATE_COLUMN = 1;  // 日期所在的列号，1 代表 A 列
  
  function colorizeHolidays() {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const lastRow = sheet.getLastRow();
    
    if (lastRow < START_ROW) {
      console.log("没有检测到有效数据行。");
      return;
    }
  
    // 只获取从起始行开始到最后的范围
    const numRows = lastRow - START_ROW + 1;
    const range = sheet.getRange(START_ROW, DATE_COLUMN, numRows, 1); 
    const values = range.getValues();
    
    // 1. 自动提取年份
    const years = new Set();
    values.forEach(row => {
      const d = parseAnyDate(row[0]);
      if (d) years.add(d.getFullYear());
    });
    
    // 2. 拉取节假日数据
    const holidayMap = {};
    years.forEach(year => {
      const url = `https://raw.githubusercontent.com/NateScarlet/holiday-cn/master/${year}.json`;
      try {
        const response = UrlFetchApp.fetch(url, {muteHttpExceptions: true});
        if (response.getResponseCode() === 200) {
          const data = JSON.parse(response.getContentText());
          data.days.forEach(day => { holidayMap[day.date] = day.isOffDay; });
        }
      } catch (e) { console.warn(`无法获取 ${year} 年数据`); }
    });
    
    // 3. 准备染色数据
    const backgrounds = [];
    const timeZone = Session.getScriptTimeZone();
    
    // 颜色定义
    const COLORS = {
      HOLIDAY: "#f4cccc", // 节假日 (红)
      MAKEUP:  "#cfe2f3", // 调休上班 (浅蓝色)
      WEEKEND: "#ffffff", // 正常周末 (白)
      WORKDAY: "#d9ead3"  // 正常工作日 (绿)
    };
  
    for (let i = 0; i < values.length; i++) {
      const cellValue = values[i][0];
      const d = parseAnyDate(cellValue);
      let color = "#ffffff"; // 默认白色
  
      if (d) {
        const dateStr = Utilities.formatDate(d, timeZone, "yyyy-MM-dd");
        const dayOfWeek = d.getDay(); // 0是周日
  
        if (holidayMap.hasOwnProperty(dateStr)) {
          color = holidayMap[dateStr] ? COLORS.HOLIDAY : COLORS.MAKEUP;
        } else {
          color = (dayOfWeek === 0 || dayOfWeek === 6) ? COLORS.WEEKEND : COLORS.WORKDAY;
        }
      }
      backgrounds.push([color]);
    }
    
    // 4. 一次性应用染色（效率最高）
    range.setBackgrounds(backgrounds);
    SpreadsheetApp.getUi().alert("染色完成！已跳过前 " + (START_ROW - 1) + " 行。");
  }
  
  /**
   * 强力日期解析器：支持 Date对象、字符串、数字格式
   */
  function parseAnyDate(val) {
    if (!val) return null;
    if (val instanceof Date && !isNaN(val.getTime())) return val;
    
    // 如果是字符串，尝试转换
    if (typeof val === 'string') {
      const d = new Date(val.replace(/-/g, "/")); // 兼容 iOS/Safari 格式
      if (!isNaN(d.getTime())) return d;
    }
    
    // 如果是 Google Sheets 的数字日期格式
    if (typeof val === 'number' && val > 30000) {
      return new Date((val - 25569) * 86400000);
    }
    
    return null;
  }