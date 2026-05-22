// ==UserScript==
// @name         测试
// @author       3987681449
// @version      0.0.0
// @description  2150284119反馈群
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
function safeText(text) {
  return (text || '')
    .replace(/<[^>]*>/g, '')
    .replace(/【|】/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// ======================
// 结果等级
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
  text = safeText(text);
  if (!text) return "未知结果";

  for (let r of rankPriority) {
    let keys = rankDB[r] || [];
    for (let k of keys) {
      if (text.includes(k)) return r;
    }
  }
  return "未知结果";
}

// ======================
// 技能名
// ======================
const skillAlias = {
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
  "克苏鲁神话": ["克苏鲁", "cm", "CM"],
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
  let cleaned = safeText(name).replace(/\s*\d+$/, '');
  if (!cleaned) cleaned = '检定';

  for (let [standard, aliases] of Object.entries(skillAlias)) {
    if (cleaned === standard) return standard;
    if (aliases.includes(cleaned)) return standard;
  }
  return cleaned;
}

// ======================
// 导出统计
// ======================
function getExportText(ctx) {
  let varName = `$m跑团记录_${ctx.group.groupId}_${ctx.player.userId}`;
  let records = seal.vars.strGet(ctx, varName)[0] || '';
  let lines = records.trim().split('\n').filter(l => l.trim());
  if (lines.length === 0) return '暂无记录';

  let stats = {};
  let rawLines = [];
  let totalThrows = 0;

  lines.forEach(line => {
    let match = line.match(/^(.+?)：(.+?) \(D100=(\d+)\/(\d+)\)$/);
    if (match) {
      let skill = match[1];
      let level = match[2];
      let key = `${skill}::${level}`;
      stats[key] = (stats[key] || 0) + 1;
      totalThrows++;
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
  return `【${playerName}】 共 ${totalThrows} 次投掷\n` + outputLines.join('\n');
}

// ======================
// 解析多行骰点
// ======================
function parseMultiDiceBlock(text) {
  let lines = text.split('\n');
  let results = [];

  const linePattern = /D100=(\d+)\/(\d+)\s*(.*)/;

  for (let line of lines) {
    let m = line.match(linePattern);
    if (!m) continue;

    results.push({
      diceResult: m[1],
      skillValue: m[2],
      rank: normalizeRank(m[3] || '')
    });
  }

  return results;
}

// ======================
// 监听发送的消息
// ======================
ext.onMessageSend = (ctx, msg, flag) => {
  if (!ctx.group) return;
  if (!ctx.group.logOn) return;

  let rawText = (msg.message || '')
    .replace(/<[^>]*>/g, '')
    .replace(/【|】/g, '')
    .trim();

  let varName = `$m跑团记录_${ctx.group.groupId}_${ctx.player.userId}`;
  let records = [];

  if (rawText.includes('的理智检定')) {
    const scMatch = rawText.match(/[dD]100=(\d+)\/(\d+)\s*(.+)/);
    if (scMatch) {
      let rank = normalizeRank(scMatch[3] || '');
      let old = seal.vars.strGet(ctx, varName)[0] || '';
      seal.vars.strSet(ctx, varName, old + '\nSC：' + rank + ' (D100=' + scMatch[1] + '/' + scMatch[2] + ')');
    }
    return;
  }

  if (/进行了.*?次检定/.test(rawText)) {
    let skillName = '未知检定';
    let skillMatch = rawText.match(/"([^"]+)"/);
    if (skillMatch) {
      skillName = normalizeSkill(skillMatch[1]);
    }

    let multi = parseMultiDiceBlock(rawText);
    if (multi.length === 0) return;

    let old = seal.vars.strGet(ctx, varName)[0] || '';
    let newLines = multi.map(r => `${skillName}：${r.rank} (D100=${r.diceResult}/${r.skillValue})`);
    seal.vars.strSet(ctx, varName, old + '\n' + newLines.join('\n'));
    return;
  }

  {
    const raPatterns = [
      /"([^"]+)"\s*检定结果为:\s*D100=(\d+)\/(\d+)\s*(.+)/,
      /([^\s]+)\s*检定结果为:\s*D100=(\d+)\/(\d+)\s*(.+)/,
      /进行"([^"]+)"\s*检定[：:]\s*D100=(\d+)\/(\d+)\s*(.+)/,
      // 新增：奖惩骰 rap/rab 格式  "侦查"检定结果为: p=7/25, (7[D100=7,...]) 困难成功
      /"([^"]+)"\s*检定结果为:\s*[pb]=(\d+)\/(\d+),\s*\((\d+)\[D100=\d+,[^\]]*\]\)\s*(.+)/,
      /([^\s]+)\s*检定结果为:\s*[pb]=(\d+)\/(\d+),\s*\((\d+)\[D100=\d+,[^\]]*\]\)\s*(.+)/,
      /D100=(\d+)\/(\d+)\s*(.+)/
    ];

    for (let i = 0; i < raPatterns.length; i++) {
      let m = rawText.match(raPatterns[i]);
      if (!m) continue;

      let skill, dice, value, rank;

      if (i === 3 || i === 4) {
        skill = i === 3 ? normalizeSkill(m[1]) : normalizeSkill(m[1]);
        dice = m[4];
        value = m[3];
        rank = normalizeRank(m[5] || '');
      } else if (i === 5) {
        skill = '未知检定';
        dice = m[1];
        value = m[2];
        rank = normalizeRank(m[3] || '');
      } else {
        skill = normalizeSkill(m[1]);
        dice = m[2];
        value = m[3];
        rank = normalizeRank(m[4] || '');
      }

      records.push(`${skill}：${rank} (D100=${dice}/${value})`);
      break;
    }
  }

  if (records.length === 0) return;

  let old = seal.vars.strGet(ctx, varName)[0] || '';
  seal.vars.strSet(ctx, varName, old + '\n' + records.join('\n'));
};

// ======================
// log 指令
// ======================
function replyClr(ctx, msg, playerName, output) {
  seal.replyToSender(ctx, msg, `${playerName}的记录导出如下：\n${output}\n\n记录已清除，当前仅支持清除个人记录，暂不支持整群清除`);
}

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
      let playerName = ctx.player.name || '未知玩家';
      replyClr(ctx, msg, playerName, exportText);
      seal.vars.strSet(ctx, varName, '');
    } else {
      seal.replyToSender(ctx, msg, '本次团中无个人检定记录');
    }
  }
};

// ======================
// countlog 指令
// ======================
const cmdCountlog = seal.ext.newCmdItemInfo();
cmdCountlog.name = 'countlog';
cmdCountlog.help = '.countlog st    //导出记录\n.countlog clr   //导出并清除记录';

function replyHelp(ctx, msg) {
  seal.replyToSender(ctx, msg, '.countlog st    //导出记录\n.countlog clr   //导出并清除记录');
}

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
      replyClr(ctx, msg, playerName, output)
    } else {
      seal.replyToSender(ctx, msg, `${playerName}本身为空，无需清除。`);
    }
    seal.vars.strSet(ctx, varName, '');
    return seal.ext.newCmdExecuteResult(true);
  }

  replyHelp(ctx, msg)
  return seal.ext.newCmdExecuteResult(true);
};

ext.cmdMap['countlog'] = cmdCountlog;