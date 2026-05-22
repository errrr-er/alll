// ==UserScript==
// @name         测试
// @author       3987681449
// @version      0.0.0
// @description  回头这边记得全改掉
// @timestamp    1779421395
// 2026-05-21 04:25:18
// @license      Apache-2
// @homepageURL  https://github.com/errrr-er/alll/tree/main
// ==/UserScript==

let ext = seal.ext.find('只是测试');
if (!ext) {
  ext = seal.ext.new('只是测试', 'er', '0.0.0');
  seal.ext.register(ext);
}

// ======================
// 清洗
// ======================
function cleanText(text) {
  return (text || '')
    .replace(/<[^>]*>/g, '')   // 去掉 <任意内容>
    .replace(/【|】/g, '')      // 去掉 【 和 】
    .replace(/\s+/g, ' ')       // 多个空白合并为一个空格
    .trim();
}

// ======================
// 结果等级标准
// ======================
const rankPriority = [
  "大成功",
  "极难成功",
  "困难成功",
  "成功",
  "大失败",
  "失败"
];

const rankDB = {
  大成功: ["大成功"],
  极难成功: ["极难成功"],
  困难成功: ["困难成功"],
  成功: ["成功"],
  失败: ["失败"],
  大失败: ["大失败"]
};

function normalizeRank(text) {
  text = cleanText(text);
  if (!text) return "未知结果";

  for (let r of rankPriority) {
    let keys = rankDB[r] || [];
    for (let k of keys) {
      if (text === k || text.startsWith(k + '！') || text.startsWith(k + '!')) return r;
    }
  }
  return "未知结果";
}

// ======================
// 技能名标准
// ======================
const skillAlias = {
  // 属性
  "力量": ["str", "STR"],
  "敏捷": ["dex", "DEX"],
  "意志": ["pow", "POW"],
  "体质": ["con", "CON"],
  "外貌": ["app", "APP"],
  "教育": ["edu", "EDU"],
  "体型": ["siz", "SIZ"],
  "智力": ["灵感", "int", "INT"],
  "理智": ["san", "san值", "理智值", "SAN"],
  "幸运": ["运气"],
  "魔法": ["mp", "MP"],
  "体力": ["hp", "HP"],

  // 技能
  "会计": [],
  "人类学": [],
  "估价": [],
  "考古学": [],
  "表演": [],
  "美术": [],
  "摄影": [],
  "伪造": [],
  "写作": [],
  "书法": [],
  "乐理": [],
  "厨艺": [],
  "裁缝": [],
  "理发": [],
  "建筑": [],
  "舞蹈": [],
  "酿酒": [],
  "捕鱼": [],
  "歌唱": [],
  "制陶": [],
  "雕塑": [],
  "杂技": [],
  "风水": [],
  "技术制图": [],
  "耕作": [],
  "打字": [],
  "速记": [],
  "木匠": [],
  "莫里斯舞蹈": [],
  "歌剧歌唱": [],
  "粉刷匠与油漆工": [],
  "吹真空管": [],
  "取悦": ["魅惑"],
  "攀爬": [],
  "计算机使用": ["计算机", "电脑"],
  "信用": ["信誉", "信用评级"],
  "克苏鲁神话": ["克苏鲁", "cm"],
  "乔装": [],
  "闪避": [],
  "汽车驾驶": ["驾驶", "汽车"],
  "电气维修": [],
  "电子学": [],
  "话术": [],
  "斗殴": [],
  "手枪": [],
  "急救": [],
  "历史": [],
  "恐吓": [],
  "跳跃": [],
  "母语": [],
  "法律": [],
  "图书馆使用": ["图书馆"],
  "聆听": [],
  "开锁": ["撬锁", "锁匠"],
  "机械维修": [],
  "医学": [],
  "博物学": ["自然学"],
  "导航": ["领航"],
  "神秘学": [],
  "重型机械": ["重型操作", "重型", "操作重型机械"],
  "说服": [],
  "精神分析": [],
  "心理学": [],
  "骑术": [],
  "地质学": [],
  "化学": [],
  "生物学": [],
  "数学": [],
  "天文学": [],
  "物理学": [],
  "药学": [],
  "植物学": [],
  "动物学": [],
  "密码学": [],
  "工程学": [],
  "气象学": [],
  "司法科学": [],
  "妙手": [],
  "侦查": [],
  "潜行": [],
  "生存": [],
  "游泳": [],
  "投掷": [],
  "追踪": [],
  "动物驯养": [],
  "潜水": [],
  "爆破": [],
  "读唇": [],
  "催眠": [],
  "炮术": [],
};

function normalizeSkill(name) {
  if (!name) return '未知检定';
  let cleaned = cleanText(name).replace(/\s*\d+$/, '');
  if (!cleaned) cleaned = '检定';

  for (let [standard, aliases] of Object.entries(skillAlias)) {
    if (cleaned === standard) return standard;
    if (aliases.includes(cleaned)) return standard;
  }
  return cleaned;
}

// ======================
// 导出记录文本
// ======================
function getExportText(ctx) {
  let varName = `$m跑团记录_${ctx.group.groupId}_${ctx.player.userId}`;
  let records = seal.vars.strGet(ctx, varName)[0] || '';
  let lines = records.trim().split('\n').filter(l => l.trim());

  if (lines.length === 0) return '暂无记录';

  let stats = {};
  let rawLines = [];

  lines.forEach(line => {
    let match = line.match(/^(.+?)：(.+?) \(D100=(\d+)\/(\d+)\)$/);
    if (match) {
      let skill = match[1];
      let level = match[2];
      let key = `${skill}::${level}`;
      stats[key] = (stats[key] || 0) + 1;
    } else {
      rawLines.push(line);
    }
  });

  let skillMap = {};
  for (let [key, count] of Object.entries(stats)) {
    let [skill, level] = key.split('::');
    if (!skillMap[skill]) skillMap[skill] = [];
    skillMap[skill].push({ level, count });
  }

  let outputLines = [];
  for (let skill of Object.keys(skillMap).sort()) {
    skillMap[skill].sort((a, b) => {
      return rankPriority.indexOf(a.level) - rankPriority.indexOf(b.level);
    });
    let parts = skillMap[skill].map(item => {
      return item.count > 1 ? `${item.level}×${item.count}` : item.level;
    });
    outputLines.push(`${skill}：${parts.join('，')}`);
  }

  if (rawLines.length > 0) {
    outputLines.push('');
    outputLines.push('以下记录格式异常，已保留原始内容：');
    outputLines = outputLines.concat(rawLines);
  }

  let playerName = ctx.player.name || '未知玩家';
  let totalThrows = lines.length;
  return `【${playerName}】 共 ${totalThrows} 次投掷\n` + outputLines.join('\n');
}

// ======================
// 监听发送的消息
// ======================
ext.onMessageSend = (ctx, msg, flag) => {
  if (!ctx.group) return;
  if (!ctx.group.logOn) return;

  // ★ 先清洗消息文本，去掉 <> 和 【】 等装饰
  let messageText = cleanText(msg.message || '');

  let skillName = '';
  let diceResult = '';
  let skillValue = '';
  let successLevel = '';

  // SC 匹配（同时兼容有括号和无括号）
  const scPatterns = [
    /的理智检定:\s*[dD]100=(\d+)\/(\d+)\s*(.+)/,
    /的理智检定[：:]\s*[dD]100=(\d+)\/(\d+)\s*(.+)/,
    /理智检定:\s*[dD]100=(\d+)\/(\d+)\s*(.+)/,
    /理智.*?[dD]100=(\d+)\/(\d+)\s*(.+)/
  ];

  let scMatch = null;
  for (let pattern of scPatterns) {
    scMatch = messageText.match(pattern);
    if (scMatch) break;
  }

  if (scMatch) {
    skillName = 'SC';
    diceResult = scMatch[1];
    skillValue = scMatch[2];
    successLevel = normalizeRank(scMatch[3]);
  } else if (messageText.includes('理智检定')) {
    return;
  } else {
    // RA 多正则匹配
    const raPatterns = [
      /"([^"]+)"检定结果为:\s*D100=(\d+)\/(\d+)\s*(.+)/,
      /([^\s]+)检定结果为:\s*D100=(\d+)\/(\d+)\s*(.+)/,
      /进行"([^"]+)"检定[：:]\s*D100=(\d+)\/(\d+)\s*(.+)/,
      /D100=(\d+)\/(\d+)\s*(.+)/
    ];

    for (let i = 0; i < raPatterns.length; i++) {
      let raMatch = messageText.match(raPatterns[i]);
      if (raMatch) {
        if (i === 3) {
          skillName = '未知检定';
          diceResult = raMatch[1];
          skillValue = raMatch[2];
          successLevel = normalizeRank(raMatch[3]);
        } else {
          skillName = normalizeSkill(raMatch[1]);
          diceResult = raMatch[2];
          skillValue = raMatch[3];
          successLevel = normalizeRank(raMatch[4]);
        }
        break;
      }
    }
  }

  if (!skillName) return;

  let record = `${skillName}：${successLevel} (D100=${diceResult}/${skillValue})`;

  let varName = `$m跑团记录_${ctx.group.groupId}_${ctx.player.userId}`;
  let old = seal.vars.strGet(ctx, varName)[0] || '';
  seal.vars.strSet(ctx, varName, old + '\n' + record);
};

// ======================
// log 指令
// ======================
ext.onCommandReceived = (ctx, msg, cmdArgs) => {
  if (!ctx.group) return;

  let cmd = cmdArgs.command.toLowerCase();
  if (cmd !== 'log') return;

  let sub = cmdArgs.getArgN(1);
  let varName = `$m跑团记录_${ctx.group.groupId}_${ctx.player.userId}`;

  if (sub === 'new') {
    seal.vars.strSet(ctx, varName, '');
  }

  if (sub === 'end') {
    let exportText = getExportText(ctx);
    if (exportText !== '暂无记录') {
      seal.replyToSender(ctx, msg, `记录已自动导出：\n${exportText}`);
      seal.vars.strSet(ctx, varName, '');
    }
  }
};

// ======================
// countlog 指令
// ======================
const cmdCountlog = seal.ext.newCmdItemInfo();
cmdCountlog.name = 'countlog';
cmdCountlog.help = '.countlog st    //导出记录\n.countlog clr   //导出并清除记录';

cmdCountlog.solve = (ctx, msg, cmdArgs) => {
  if (!ctx.group) {
    seal.replyToSender(ctx, msg, '请在群内使用此指令');
    return seal.ext.newCmdExecuteResult(true);
  }

  let sub = cmdArgs.getArgN(1);
  let varName = `$m跑团记录_${ctx.group.groupId}_${ctx.player.userId}`;

  if (sub === 'st') {
    let output = getExportText(ctx);
    seal.replyToSender(ctx, msg, output);
    return seal.ext.newCmdExecuteResult(true);
  }

  if (sub === 'clr') {
    let output = getExportText(ctx);
    let playerName = ctx.player.name || '未知玩家';
    if (output !== '暂无记录') {
      seal.replyToSender(ctx, msg, `${playerName}的记录导出如下：\n${output}\n\n记录已清除`);
    } else {
      seal.replyToSender(ctx, msg, `${playerName}本身为空，无需清除。`);
    }
    seal.vars.strSet(ctx, varName, '');
    return seal.ext.newCmdExecuteResult(true);
  }

  seal.replyToSender(ctx, msg, '.countlog st    //导出记录\n.countlog clr   //导出并清除记录');
  return seal.ext.newCmdExecuteResult(true);
};

ext.cmdMap['countlog'] = cmdCountlog;