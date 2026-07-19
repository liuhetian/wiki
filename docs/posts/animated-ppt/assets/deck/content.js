window.CONTENT = {
  meta: {
    title: 'AI 工具实践分享 · v0.3',
    version: 'v0.3',
    date: '2026.05.21',
    logo: 'Tap4Fun.BI',
  },

  media: [
    { type: 'image', id: 's0', src: './素材/scene0.webp' },
    { type: 'video', id: 'v0_1', src: './素材/trans0to1.mp4' },
    { type: 'video', id: 's1', src: './素材/trans1to2.mp4', loop: true },
    { type: 'video', id: 'v1_2', src: './素材/trans2to3.mp4' },
    { type: 'image', id: 's2', src: './素材/scene3.webp' },
    { type: 'video', id: 'v2_3', src: './素材/trans3to4.mp4' },
    { type: 'image', id: 's3', src: './素材/scene4.webp' },
    { type: 'image', id: 's4', src: './素材/scene4.webp' },
    { type: 'image', id: 's5', src: './素材/scene4.webp' },
    { type: 'image', id: 's6', src: './素材/scene4.webp' },
    { type: 'video', id: 'v6_7', src: './素材/trans4to5.mp4' },
    { type: 'image', id: 's7', src: './素材/scene5.webp' },
    { type: 'video', id: 'v7_8', src: './素材/trans5to6.mp4' },
    { type: 'image', id: 's8', src: './素材/scene6.webp' },
    { type: 'image', id: 's9', src: './素材/scene6.webp' },
    { type: 'image', id: 's10', src: './素材/scene6.webp' },
    { type: 'video', id: 'v10_11', src: './素材/trans6to7.mp4' },
    { type: 'image', id: 's11', src: './素材/scene7.webp' },
    { type: 'video', id: 'v11_12', src: './素材/trans7to8.mp4' },
    { type: 'image', id: 's12', src: './素材/scene8.webp' },
    { type: 'video', id: 'v12_13', src: './素材/trans8to9.mp4' },
    { type: 'image', id: 's13', src: './素材/scene9.webp' },
    { type: 'video', id: 'v13_14', src: './素材/trans9to10.mp4' },
    { type: 'image', id: 's14', src: './素材/scene10.webp' },
    { type: 'image', id: 's15', src: './素材/scene10.webp' },
    { type: 'video', id: 'v15_16', src: './素材/trans10to11.mp4' },
    { type: 'video', id: 's16', src: './素材/trans11to11.mp4', loop: true },
  ],

  nav: [
    { label: 'Prologue', jump: 0 },
    { label: 'Title', jump: 1 },
    { label: 'Part 1', jump: 2 },
    { label: 'Part 2', jump: 7 },
    { label: 'Part 3', jump: 11 },
    { label: 'Part 4', jump: 14 },
    { label: 'Fin', jump: 16 },
  ],

  chapters: [
    { mark: 'circle', label: 'Prologue' },
    { mark: 'square', label: 'Part 1' },
    { mark: 'tri', label: 'Part 2' },
    { mark: 'bar', label: 'Part 3' },
    { mark: 'dot', label: 'Part 4' },
    { mark: 'circle', label: 'Fin' },
  ],

  scenes: [
    {
      layout: 'blank',
      chapter: 0,
    },

    {
      layout: 'hero',
      chapter: 0,
      classes: ['scene-title'],
      kicker: 'AI 工具实践分享',
      headlineMid: '今天到底该',
      headline: '用什么&nbsp;<span class="accent">AI</span>&nbsp;工具',
      subhead: '从日常提效到 Agent 工程化探索',
    },

    {
      layout: 'anchor',
      chapter: 1,
      kicker: 'Part 01 · Quick Tricks',
      headline: '看了就能<br><span class="accent">变强</span>的小技巧',
      subhead: '<strong>技多不压身，学到就是赚到。</strong><br><span style="color: var(--muted);">目标：会后就能拿走几个真实可用的方法。</span>',
      modules: [
        { num: '4-1', name: 'Google Sheet', tag: '脚本 · 节假日 · 翻译' },
        { num: '4-2', name: '网页 AI', tag: 'DeepSeek · AI Studio · GPT' },
        { num: '4-3', name: 'AI PPT', tag: '工作流 · Skill · 美术' },
        { num: '4-4', name: '浏览器 / 电脑', tag: 'Browser Use · Computer Use' },
      ],
    },

    {
      layout: 'accordion',
      chapter: 1,
      accId: 'acc-1',
      coverImg: './part1/app脚本.jpg',
      overview: {
        kicker: '4-1 · Google Sheet · 小技巧',
        title: '第一部分<br><span class="accent">Google Sheet</span> 小技巧',
        lead: '围绕 Google Sheet 的自定义 App 脚本，解决日常小痛点。',
        note: '<span style="color:var(--accent); font-weight:600;">→ 点击此处展开案例</span>',
      },
      cases: [
        {
          tag: 'Case 01',
          title: '翻译脚本',
          summary: '翻译脚本与结果对照',
          detail: {
            title: '翻译脚本与<span class="accent">结果对照</span>',
            paragraphs: [
              '<video src="./part1/翻译脚本效果.mp4" controls playsinline class="detail-media"></video>',
            ],
            codeFile: './part1/翻译脚本.js',
            aside: [
              { kicker: '类型', text: 'Google Sheet <strong>App 脚本</strong>' },
            ],
          },
        },
        {
          tag: 'Case 02',
          title: '节假日统计',
          summary: '节假日统计脚本',
          detail: {
            title: '节假日<span class="accent">统计</span>',
            paragraphs: [
              '<img src="./part1/节假日.jpg" class="detail-media">',
            ],
            codeFile: './part1/节假日.js',
            aside: [
              { kicker: '类型', text: 'Google Sheet <strong>App 脚本</strong>' },
            ],
          },
        },
        {
          tag: 'Case 03',
          title: '更新通知整理',
          summary: '更新通知整理',
          detail: {
            title: '更新通知<span class="accent">整理</span>',
            paragraphs: [
              '<img src="./part1/app脚本.jpg" class="detail-media">',
            ],
            aside: [
              { kicker: '类型', text: 'Google Sheet <strong>App 脚本</strong>' },
            ],
          },
        },
      ],
    },

    {
      layout: 'accordion',
      chapter: 1,
      accId: 'acc-2',
      coverImg: './part1/网页端占比.png',
      overview: {
        kicker: '4-2 · 网页 AI',
        title: '不同任务<br>选不同<span class="accent">工具</span>',
        lead: '每个 AI 产品都有擅长的边界，挑对工具效率翻倍。',
        note: '<span style="color:var(--accent); font-weight:600;">→ 点击此处展开案例</span>',
      },
      cases: [
        {
          tag: 'Case 01',
          title: 'DeepSeek',
          summary: 'RP 特定提示词',
          detail: {
            title: 'DeepSeek V4 <span class="accent">RP</span> 思考模式切换',
            paragraphs: [
              '<strong>三种模式：</strong>默认（自动选择）/ <span class="accent-text">角色沉浸</span>（带内心独白）/ 纯分析（冷静规划）',
              '<code class="detail-code">角色沉浸模式：                        纯分析模式：\n&lt;think&gt;                              &lt;think&gt;\n（他跟我打招呼了……心跳加速。）        场景：用户打招呼，角色是傲娇属性。\n我要装作不在意的样子回应。             回复策略：先嫌弃，身体语言暴露真情。\n（不能让他看出来我很高兴！）           控制150字，先动作描写再对话。\n&lt;/think&gt;                             &lt;/think&gt;</code>',
              '<strong>用法：</strong>在第一条消息末尾粘贴指令，后续正常聊天即可全程生效。',
            ],
            aside: [
              { kicker: '仓库', text: '<a href="https://github.com/victorchen96/deepseek_v4_rolepaly_instruct/tree/main" target="_blank" style="color:var(--accent);font-weight:600;">deepseek_v4_roleplay_instruct →</a>' },
              { kicker: '适用', text: 'DeepSeek 官方 APP / 网页<strong>专家模式</strong>，及 deepseek-v4-flash / pro API' },
              { kicker: '注意', text: '概率输出，无法 100% 触发，可多 roll 几次' },
            ],
          },
        },
        {
          tag: 'Case 02',
          title: 'AI Studio',
          summary: '优先于 Gemini 网页',
          detail: {
            title: '<span class="accent">AI Studio</span> 优先于 Gemini 网页',
            paragraphs: [
              '<div class="detail-media-row"><img src="./part1/aistudio.jpg" class="detail-media"><img src="./part1/gemini会员.jpg" class="detail-media"></div>',
            ],
            aside: [
              { kicker: '链接', text: '<a href="https://aistudio.google.com/" target="_blank" style="color:var(--accent);font-weight:600;">aistudio.google.com →</a>' },
              { kicker: '说明', text: 'Gemini Pro 会员可以用<strong>更多功能</strong>' },
            ],
          },
        },
        {
          tag: 'Case 03',
          title: 'GPT',
          summary: '大量 image2 生成',
          detail: {
            title: 'GPT 网页适合<br>大量 <span class="accent">image2</span> 生成',
            paragraphs: [
              '<img src="./part1/gpt网页.jpg" class="detail-media">',
            ],
            aside: [
              { kicker: '适合', text: '大量图片生成场景' },
            ],
          },
        },
        {
          tag: 'Case 04',
          title: 'Claude',
          summary: '',
          detail: {
            title: '<span class="accent">Claude</span>',
            reveal: true,
            paragraphs: [
              '<div class="reveal-wrap"><img src="./part1/claude.webp" class="detail-media reveal-img"></div>',
            ],
            aside: [],
          },
        },
      ],
    },

    {
      layout: 'accordion',
      chapter: 1,
      accId: 'acc-3',
      overview: {
        kicker: '4-3 · AI PPT',
        title: '<span class="accent">AI PPT</span>',
        lead: '工作流平台 + PPT Skill，两条技术路线。',
        note: '<span style="color:var(--accent); font-weight:600;">→ 点击此处展开案例</span>',
      },
      cases: [
        {
          tag: 'Case 01',
          title: '工作流',
          summary: 'Genspark / Coze / LandPPT',
          detail: {
            title: '<span class="accent">工作流</span>',
            paragraphs: [
              '<a href="https://www.genspark.ai/" target="_blank" class="detail-link">Genspark →</a>',
              '<a href="https://www.coze.cn/overview" target="_blank" class="detail-link">Coze →</a>',
              '<a href="https://github.com/sligter/LandPPT" target="_blank" class="detail-link">LandPPT (GitHub) →</a>',
            ],
            aside: [
              { kicker: '类型', text: '端到端 <strong>AI PPT 工作流</strong>平台' },
            ],
          },
        },
        {
          tag: 'Case 02',
          title: 'PPT Skill',
          summary: '越来越流行',
          detail: {
            title: '<span class="accent">PPT Skill</span><br>越来越流行',
            paragraphs: [
              '<a href="https://github.com/mucsbr/ppt-agent-workflow-san" target="_blank" class="detail-link">ppt-agent-workflow-san →</a>',
              '<a href="https://github.com/JuneYaooo/gpt-image2-ppt-skills" target="_blank" class="detail-link">gpt-image2-ppt-skills →</a>',
              '<a href="https://github.com/stevenjinlong/awesome-ppt-skills" target="_blank" class="detail-link">awesome-ppt-skills →</a>',
            ],
            aside: [
              { kicker: '趋势', text: '大模型 + PPT Skill，<strong>越来越流行</strong>' },
            ],
          },
        },
      ],
    },

    {
      layout: 'accordion',
      chapter: 1,
      accId: 'acc-4',
      overview: {
        kicker: '4-4 · 浏览器操作与电脑操作',
        title: '浏览器操作<br>与<span class="accent">电脑</span>操作',
        lead: 'AI 开始能操作界面，但都还在早期。',
        note: '<span style="color:var(--accent); font-weight:600;">→ 点击此处展开案例</span>',
      },
      cases: [
        {
          tag: 'Case 01',
          title: '操作浏览器',
          summary: 'Browser Use',
          detail: {
            title: '操作<span class="accent">浏览器</span>',
            paragraphs: [
              '<a href="https://github.com/iFurySt/open-browser-use" target="_blank" class="detail-link">Codex 浏览器拆解 · open-browser-use →</a>',
            ],
            aside: [
              { kicker: '类型', text: '<strong>Browser Use</strong> 开源拆解' },
            ],
          },
        },
        {
          tag: 'Case 02',
          title: '操作电脑',
          summary: 'Computer Use',
          detail: {
            title: '操作<span class="accent">电脑</span>',
            paragraphs: [
              '<span style="font-weight:600;">perplexity / sonar-pro-search</span>',
              '<a href="https://github.com/iFurySt/open-codex-computer-use" target="_blank" class="detail-link">Codex Computer Use 拆解 · open-codex-computer-use →</a>',
            ],
            aside: [
              { kicker: '类型', text: '<strong>Computer Use</strong> 开源拆解' },
            ],
          },
        },
      ],
    },

    {
      layout: 'anchor',
      chapter: 2,
      kicker: 'Part 02 · OpenClaw',
      headline: '自己养一个<br><span class="accent">Agent</span>',
      subhead: '<strong>Agent 不只是会聊天，而是能稳定接任务、执行任务、反馈状态。</strong><br><span style="color: var(--muted);">长期运行的 Agent，需要边界、维护和监控。</span>',
      modules: [
        { num: '01', name: '运维脚本', tag: '自动化入口' },
        { num: '02', name: '角色扮演', tag: 'RP 实验场' },
        { num: '04', name: '信息收集', tag: '邮件 · 播客 · 摘要' },
        { num: '03', name: '信息输出', tag: 'HTML · 卡片 · 图' },
      ],
    },

    {
      layout: 'accordion',
      chapter: 2,
      classes: ['ov-bottom'],
      accId: 'acc-5',
      overview: {
        kicker: '6-1 · OpenClaw · 实验矩阵',
        title: '功能到<span class="accent">产品</span><br>很远',
        lead: 'AI 能力越强，人越需要做产品判断。',
        note: '图像生成有能力，不等于朋友圈场景、姿势、穿搭、多样性都自动解决。<br><br><span style="color:var(--accent); font-weight:600;">→ 点击此处展开案例</span>',
      },
      cases: [
        {
          tag: 'Exp 01',
          title: '祖师对话',
          summary: 'RP 模拟历史人物',
          detail: {
            title: '佛教<span class="accent">祖师</span>对话',
            paragraphs: [
              '<span class="detail-big">通过聊天框和祖师对话</span>',
              '<span class="detail-mid">比直接进入网页更有<strong>和人对话的感觉</strong></span>',
              '<span class="detail-mid"><strong class="accent-text">14 位祖师</strong> — 慧能 · 玄奘 · 宗喀巴 · 米拉日巴 · 阿姜查 …<br>覆盖汉传 / 藏传 / 南传三大传统</span>',
              '<span class="detail-mid"><strong class="accent-text">503 数据源</strong> · 67.8 万+ 语义向量<br>每条回答必须引用可查证经典，杜绝"编经"</span>',
            ],
            aside: [
              { kicker: '体验', text: '<a href="https://fojin.app/chat" target="_blank" style="color:var(--accent);font-weight:600;">fojin.app/chat →</a>' },
              { kicker: '仓库', text: '<a href="https://github.com/xr843/Master-skill" target="_blank" style="color:var(--accent);font-weight:600;">Master-skill (GitHub) →</a>' },
              { kicker: '接入', text: 'Claude Code / Cursor / Gemini CLI，一条命令安装' },
            ],
          },
        },
        {
          tag: 'Exp 02',
          title: '睡前故事',
          summary: '内容生成',
          detail: {
            
          },
        },
        {
          tag: 'Exp 03',
          title: '塔罗牌',
          summary: '个性化报告',
          detail: {
      
          },
        },
        {
          tag: 'Exp 04',
          title: 'AI 小说',
          summary: '长篇连载',
          detail: {
            
          },
        },
        {
          tag: 'Exp 05',
          title: '自拍',
          summary: '角色自拍图 + 文案',
          detail: {
            title: '角色<span class="accent">朋友圈</span>',
            paragraphs: [
              '生成虚拟角色自拍图和文案，模拟真实社交动态。',
            ],
            aside: [
              { kicker: '暴露', text: '姿势 · 穿搭 · 多样性<strong>全是坑</strong>。' },
            ],
          },
        },
      ],
    },

    {
      layout: 'accordion',
      chapter: 2,
      classes: ['ov-bottom'],
      accId: 'acc-7',
      overview: {
        kicker: '6-3 · 邮件系统 · 信息入口',
        title: '重要的不是<br><span class="accent">全都接收</span>',
        lead: '让 AI 负责信息收集整理，但不要把所有信息直接倒给人。',
        note: '每个人产生的信息越来越多，重要的不是"全都接收"，而是"<strong>哪些值得看</strong>"。<br>筛选能力应该放在上层，而不是把原始信息直接发给上层。<br><br><span style="color:var(--accent); font-weight:600;">→ 点击此处展开案例</span>',
      },
      cases: [
        {
          tag: 'System 01',
          title: '邮件系统',
          summary: '信息入口 + 筛选',
          detail: {
            title: '<span class="accent">邮件</span>系统',
            paragraphs: [
              '<span class="detail-mid">通过 Postfix 接收邮件，使用 <strong>Pipe to Script</strong> 模式</span>',
              '<span class="detail-mid">在 <code class="inline-code">master.cf</code> 注册 Python 脚本，将邮件 JSON 化便于读取</span>',
              '<span class="detail-mid">在 <code class="inline-code">/etc/postfix/transport</code> 注册命中规则，让域名下的邮件都走脚本处理</span>',
              '<span class="detail-mid">收集各渠道推送 → AI 筛选优先级 → 输出可追溯的<strong>结构化摘要</strong></span>',
            ],
            aside: [
              { kicker: '核心', text: '不是"全都接收"，而是<strong>哪些值得看</strong>' },
              { kicker: '可追溯', text: '摘要可回溯原文，不丢信息' },
            ],
          },
        },
        {
          tag: 'System 02',
          title: 'RSS',
          summary: '可控的信息源',
          detail: {
            title: '<span class="accent">RSS</span><br>可控的信息入口',
            paragraphs: [
              '信息源越来越分散 —— 公众号、X、Newsletter、Slack、各种群。需要一个<strong>可控、可订阅、可整理</strong>的入口。',
              'RSS 是经过时间验证的答案。<span class="accent-text">订阅制 + AI 摘要</span>，把信息消费从被动推送变回主动选择。',
            ],
            aside: [
              { kicker: '核心', text: '<strong>可控 · 可订阅 · 可整理</strong>。' },
              { kicker: '关键', text: '从被动推送变回主动选择。' },
            ],
          },
        },
      ],
    },

    {
      layout: 'accordion',
      chapter: 2,
      classes: ['ov-bottom'],
      accId: 'acc-6',
      overview: {
        kicker: '6-2 · 卡片输出 Skill',
        title: '展示形式的<br>成本正在<span class="accent">降低</span>',
        lead: '从卡片到 HTML、从 Markdown 到 HTML，更直观的表达方式越来越便宜。',
        note: '当更好理解的展示形式成本越来越低，人就应该更多使用这种表达。<br>人和 AI 之间的交互不应该永远停留在纯聊天框里。<br><br><a href="https://x.com/trq212/status/2052809885763747935" target="_blank" style="color:var(--accent); font-weight:500; font-size:0.78cqw;">→ 参考原文</a><br><br><span style="color:var(--accent); font-weight:600;">→ 点击此处展开案例</span>',
      },
      cases: [
        {
          tag: 'Skill 01',
          title: '卡片总结',
          summary: 'HTML 卡片',
          detail: {
            title: '<span class="accent">卡片</span>总结',
            paragraphs: [
              '<img src="./part2/卡片总结.webp" class="detail-media">',
            ],
            aside: [
              { kicker: '关键', text: '不只是"好看"，而是<strong>更容易理解</strong>' },
              { kicker: '趋势', text: '生成成本越来越低，应该更多使用' },
            ],
          },
        },
        {
          tag: 'Skill 02',
          title: '音频早报',
          summary: '播客输出',
          detail: {
            title: '音频<span class="accent">早报</span>',
            paragraphs: [
              '<img src="./part2/早报.jpg" class="detail-media">',
            ],
            aside: [
              { kicker: '适合', text: '通勤、碎片时间、<strong>被动消费</strong>场景' },
              { kicker: '关键', text: '内容不变，展示形式匹配场景' },
            ],
          },
        },
        {
          tag: 'Skill 03',
          title: 'MCP 渲染',
          summary: '可交互输出',
          detail: {
            title: 'MCP <span class="accent">可视化</span>渲染',
            paragraphs: [
              '<div class="detail-media-row"><img src="./part2/可视化1.png" class="detail-media"><img src="./part2/可视化2.png" class="detail-media"></div>',
            ],
            aside: [
              { kicker: '本质', text: 'AI 输出从<strong>文本</strong>变为<strong>界面</strong>' },
              { kicker: '方向', text: '交互形式还差一点东西，值得探索' },
            ],
          },
        },
      ],
    },

    

    {
      layout: 'anchor',
      chapter: 3,
      kicker: 'Part 03 · Harness Engineering',
      headline: '用工程化思维<br>驯服 <span class="accent">AI</span>',
      subhead: '<strong>Harness 围绕的是如何让一个项目引入了 AI 仍然能够长期开发维护。</strong><br><span style="color: var(--muted);">怎样设计一个让 Agent 可以稳定执行、可以被纠错、可以被验证的工作环境？</span>',
      modules: [
        { num: '01', name: '定义方式', tag: '是什么 · 4步阶梯' },
        { num: '02', name: '如何实现', tag: '反盘问 · 意图确认' },
        { num: '03', name: '中途接入', tag: 'CLAUDE.md · Git · Hook' },
        { num: '04', name: '协作编排', tag: '多 Agent · 协作编排' },
      ],
    },

    {
      layout: 'steps',
      chapter: 3,
      kicker: '7-1 · Harness 是什么 · 阶梯演进',
      headline: '用<span class="accent">文档</span><br>驯服代码',
      quote: '技术代码是可抛弃的、可重构的。<br><strong>文档规范是固定的唯一事实依据。</strong>',
      steps: [
        { num: '01', title: '需求文档', desc: 'PRD · 目标与边界的源头' },
        { num: '02', title: '架构与系统地图', desc: '<strong>ARCHITECTURE.md</strong> 提供域与包分层的顶层地图，配合 <code class="inline-code">FRONTEND.md</code> / <code class="inline-code">RELIABILITY.md</code> / <code class="inline-code">SECURITY.md</code> / <code class="inline-code">DESIGN.md</code> 等参考文件，让 Agent 直接从代码库推理业务领域' },
        { num: '03', title: '计划与进度日志', desc: '更加具体的执行计划与状态记录，沉淀决策过程' },
        { num: '04', title: '边界与约束', desc: '机械化边界 — <strong>自定义工具与 Linter</strong>；配合<strong>质量追踪与技术债务清单</strong>' },
        { num: '05', title: '精简的 AGENTS.md', desc: '不要塞厚重说明书 — 过多指导让 Agent 针对错误约束优化。提供约 <strong>100 行的 AGENTS.md 作为内容目录和地图</strong>，指引去哪里寻找更深的信息' },
      ],
    },

    {
      layout: 'accordion',
      chapter: 3,
      accId: 'acc-8',
      // 封面原为 star-history 在线图表（superpowers/trellis/OpenSpec/skills 四仓库 star 增长），
      // 该 API 已因 GitHub 限制 star 数据访问而失效，wiki 发布版移除封面、直接展开案例卡片
      overview: {
        kicker: '7-2 · 如何 Harness · 实践工具',
        title: '不是让 AI<br><span class="accent">听话</span>',
        lead: '而是建立一套让 AI 高效执行的协作环境。',
        note: 'Grill-me 前置确认意图，Skills 规范执行边界，Git 追溯变更。<br><br><span style="color:var(--accent); font-weight:600;">→ 点击此处展开案例</span>',
      },
      cases: [
        {
          tag: 'Tool 01',
          title: '头脑风暴与烤打',
          summary: 'grill-me · 让 AI 给自己找茬',
          detail: {
            title: '<span class="accent">Grill-me</span> · 烤打我',
            paragraphs: [
              '<span class="detail-mid">是我用起来<strong>最爽</strong>的一个 skill — 它就是一段话，让 AI 来<strong class="accent-text">给自己找茬</strong>，提出一些可以预见的问题。</span>',
              '<blockquote class="detail-quote">Interview me relentlessly about every aspect of this plan until we reach a shared understanding. Walk down each branch of the design tree, resolving dependencies between decisions one-by-one. For each question, provide your recommended answer.<br><br>Ask the questions one at a time.<br><br>If a question can be answered by exploring the codebase, explore the codebase instead.</blockquote>',
              '<span class="detail-mid">当你提了一个需求，它会围绕这个需求<strong>不断提出问题</strong>来确认意图，更重要的是提出很多可能会遇到的问题。</span>',
              '<span class="detail-mid">这样就预先把很多<span class="accent-text">需要返工、或者开发一半再来问你的问题集中起来</span>，极大避免人必须守在窗口走走停停 — 你的思路也不会被绑架在某个问题上，思考会非常集中。</span>',
              '<span class="detail-mid">不管是<strong>大需求</strong>还是<strong>小 demo</strong> 都非常有效。</span>',
            ],
            aside: [
              { kicker: '对比', text: '原来我用 <strong>Plan Mode</strong> 有点像 — 也是和你确认是不是该这么做，但 Plan Mode 还是<strong>太顺从人</strong>了。' },
              { kicker: '核心', text: '让 AI <strong>给自己找茬</strong>，问题前置。' },
              { kicker: '适合', text: '大需求、小 demo 都有效。' },
            ],
          },
        },
        {
          tag: 'Tool 02',
          title: 'superpowers',
          summary: '',
          detail: {},
        },
        {
          tag: 'Tool 03',
          title: 'trellis',
          summary: '',
          detail: {},
        },
      ],
    },

    {
      layout: 'left',
      chapter: 4,
      kicker: 'Part 04 · 做一个项目吧',
      headline: '做完一次完整项目<br><span class="accent">视角才完整</span>',
      subhead: '<strong>GAL-Git</strong>｜Galgame 叙事 + 多 NPC AI + 云容器<br>把 Git 教学做成职场剧本',
      flow: '立项 → 架构 → 玩法剧情 → UI / 美术',
      bodyNote: '每一步都做着才发现需要什么',
      stats: [
        { num: '2W', note: '行代码' },
        { num: '1+', note: '月业余时间' },
        { num: '已开源', note: 'GitHub' },
      ],
    },

    {
      layout: 'accordion',
      chapter: 4,
      classes: ['acc-reversed'],
      accId: 'acc-galgit',
      coverImg: './part4/gal-git1.jpg',
      overview: {
        kicker: 'Part 04 · GAL-Git 实机展示',
        title: 'Galgame × <span class="accent">Git</span> 教学',
        lead: '把枯燥的 Git 命令包进职场剧本，边玩边学。',
        note: '<span style="color:var(--accent); font-weight:600;">→ 点击展开查看</span>',
      },
      cases: [
        {
          tag: '截图',
          title: '界面一览',
          summary: '5 张核心界面截图',
          detail: {
            title: '界面<span class="accent">一览</span>',
            paragraphs: [
              '<div class="mini-slideshow" data-count="5">'
              + '<div class="ms-track">'
              + '<img src="./part4/gal-git1.jpg" class="ms-slide ms-active" alt="">'
              + '<img src="./part4/gal-git2.jpg" class="ms-slide" alt="">'
              + '<img src="./part4/gal-git3.jpg" class="ms-slide" alt="">'
              + '<img src="./part4/gal-git4.jpg" class="ms-slide" alt="">'
              + '<img src="./part4/gal-git5.jpg" class="ms-slide" alt="">'
              + '</div>'
              + '<div class="ms-nav">'
              + '<button class="ms-prev">‹</button>'
              + '<span class="ms-counter">1 / 5</span>'
              + '<button class="ms-next">›</button>'
              + '</div>'
              + '</div>',
            ],
          },
        },
        {
          tag: '录屏',
          title: '演示视频',
          summary: '完整游玩流程录屏',
          detail: {
            title: '演示<span class="accent">视频</span>',
            paragraphs: [
              '<video src="./part4/录屏2026-05-20 17.19.22.mp4" controls playsinline class="detail-media"></video>',
            ],
          },
        },
        {
          tag: 'LIVE',
          title: '在线试玩',
          summary: '嵌入在线 Demo',
          detail: {
            title: '在线<span class="accent">试玩</span>',
            paragraphs: [
              // 原为公司内网 demo 的 iframe，公开发布版以说明文字替代
              '<span class="detail-mid">在线 Demo 当时部署在公司内网，未随本稿公开发布 —— 完整游玩流程见上一张卡片的<strong>演示录屏</strong>。</span>',
            ],
          },
        },
        {
          tag: '副产品',
          title: 'Lovave',
          summary: '音频版 Lovart · 即听即改',
          detail: {
            title: '音频版 <span class="accent">Lovart</span>',
            paragraphs: [
              '<iframe src="https://lovave.liuhetian.work/#proj=test1" class="detail-iframe" allow="clipboard-write; microphone"></iframe>',
            ],
            aside: [
              { kicker: '灵感', text: '开发中发现的<strong>副产品</strong>，即听即改' },
            ],
          },
        },
      ],
    },

    {
      layout: 'hero',
      chapter: 5,
      classes: ['scene-closing'],
      headline: '感谢<span class="accent">聆听</span>',
    },
  ],
};
