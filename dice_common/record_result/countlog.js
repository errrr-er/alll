// ==UserScript==
// @name         log骰点统计
// @author       3987681449
// @version      1.0.0
// @description  (.countlog)有问题可进群2150284119联系
// @timestamp    1779892999
// 2026-05-21 04:25:18
// @license      Apache-2
// @homepageURL  https://github.com/errrr-er/alll/tree/main
// @updateUrl    https://hk.gh-proxy.org/https://raw.githubusercontent.com/errrr-er/alll/refs/heads/main/dice_common/record_result/countlog.js
// @updateUrl    https://raw.githubusercontent.com/errrr-er/alll/refs/heads/main/dice_common/record_result/countlog.js
// ==/UserScript==

let ext = seal.ext.find('log骰点统计');
if (!ext) {
  ext = seal.ext.new('log骰点统计', 'er', '1.0.0');
  seal.ext.register(ext);
}

// ======================
// 时间戳(timestamp)
// ======================
function getCurrentTimestamp() {
    return 1779892999;
}

// 提醒历史
const userLastNotify = new Map();

// 获取GitHub最新版本编号
async function getGitHubVersion() {
    try {
		// 镜像
        const rawUrl = 'https://hk.gh-proxy.org/https://raw.githubusercontent.com/errrr-er/alll/refs/heads/main/dice_common/record_result/counlog.js';
        const response = await fetch(rawUrl);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const content = await response.text();
        
        // 解析时间戳
        const timestampMatch = content.match(/@timestamp\s+(\d+)/);
        if (timestampMatch) {
            const timestamp = parseInt(timestampMatch[1]);
            const date = new Date(timestamp * 1000);
            return {
                timestamp: timestamp,
                date: date,
                formattedDate: date.toLocaleString('zh-CN')
            };
        }
        
        return null;
    } catch (error) {
		seal.replyToSender(ctx, msg, '获取GitHub版本出错:', error);
        throw error;
    }
}

// 检查更新
async function checkUpdateOnce(ctx, msg, userId) {
    try {
        const githubVersion = await getGitHubVersion();
        if (!githubVersion) return;
        
        const currentTimestamp = getCurrentTimestamp();
        
        if (githubVersion.timestamp > currentTimestamp) {
            setTimeout(() => {
                seal.replyToSender(ctx, msg, 
                    `发现<log骰点统计>插件有新版本！\n更新检查冷却开始~请及时更新\n最后更新：${githubVersion.formattedDate}`
                );
            }, 1000);
        }
    } catch (error) {
        // 静默处理
    }
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
  "会计": [], "人类学": [], "估价": [], "考古学": [], "表演": [],
  "美术": [], "摄影": [], "伪造": [], "写作": [], "书法": [],
  "乐理": [], "厨艺": [], "裁缝": [], "理发": [], "建筑": [],
  "舞蹈": [], "酿酒": [], "捕鱼": [], "歌唱": [], "制陶": [],
  "雕塑": [], "杂技": [], "风水": [], "技术制图": [], "耕作": [],
  "打字": [], "速记": [], "木匠": [], "莫里斯舞蹈": [], "歌剧歌唱": [],
  "粉刷匠与油漆工": [], "吹真空管": [],
  "取悦": ["魅惑"],
  "攀爬": [],
  "计算机使用": ["计算机", "电脑"],
  "信用": ["信誉", "信用评级"],
  "克苏鲁神话": ["克苏鲁", "cm", "CM"],
  "乔装": [], "闪避": [],
  "汽车驾驶": ["驾驶", "汽车"],
  "电气维修": [], "电子学": [], "话术": [], "斗殴": [], "手枪": [],
  "急救": [], "历史": [], "恐吓": [], "跳跃": [], "母语": [],
  "法律": [],
  "图书馆使用": ["图书馆"],
  "聆听": [],
  "开锁": ["撬锁", "锁匠"],
  "机械维修": [], "医学": [],
  "博物学": ["自然学"],
  "导航": ["领航"],
  "神秘学": [],
  "重型机械": ["重型操作", "重型", "操作重型机械"],
  "说服": [], "精神分析": [], "心理学": [], "骑术": [],
  "地质学": [], "化学": [], "生物学": [], "数学": [],
  "天文学": [], "物理学": [], "药学": [], "植物学": [],
  "动物学": [], "密码学": [], "工程学": [], "气象学": [],
  "司法科学": [], "妙手": [], "侦查": [], "潜行": [],
  "生存": [], "游泳": [], "投掷": [], "追踪": [],
  "动物驯养": [], "潜水": [], "爆破": [], "读唇": [],
  "催眠": [], "炮术": [],
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
// $g 存储结构
// 格式: "userId§玩家名§记录行1\n记录行2\n记录行3||userId2§玩家名2§..."
// 玩家间用 || 分隔，玩家内用 § 分隔 userId、名字、记录
// ======================
const GROUP_VAR_PREFIX = '$g_countlog_';
const SEP_PLAYER = '||';
const SEP_FIELD = '§';

function getGroupVar(ctx) {
  let key = `${GROUP_VAR_PREFIX}${ctx.group.groupId}`;
  return seal.vars.strGet(ctx, key)[0] || '';
}

function setGroupVar(ctx, value) {
  let key = `${GROUP_VAR_PREFIX}${ctx.group.groupId}`;
  seal.vars.strSet(ctx, key, value);
}

function parseGroupVar(raw) {
  // 返回 [ { userId, name, records } ]
  if (!raw) return [];
  return raw.split(SEP_PLAYER).map(block => {
    let firstSep = block.indexOf(SEP_FIELD);
    let secondSep = block.indexOf(SEP_FIELD, firstSep + 1);
    if (firstSep === -1 || secondSep === -1) return null;
    return {
      userId: block.slice(0, firstSep),
      name: block.slice(firstSep + 1, secondSep),
      records: block.slice(secondSep + 1)
    };
  }).filter(Boolean);
}

function serializeGroupVar(players) {
  return players.map(p => `${p.userId}${SEP_FIELD}${p.name}${SEP_FIELD}${p.records}`).join(SEP_PLAYER);
}

function getPlayerEntry(players, userId) {
  return players.find(p => p.userId === userId) || null;
}

function appendRecord(ctx, line) {
  let raw = getGroupVar(ctx);
  let players = parseGroupVar(raw);
  let userId = ctx.player.userId;
  let name = ctx.player.name || '未知玩家';

  let entry = getPlayerEntry(players, userId);
  if (!entry) {
    players.push({ userId, name, records: line });
  } else {
    entry.name = name;
    entry.records = entry.records ? entry.records + '\n' + line : line;
  }
  setGroupVar(ctx, serializeGroupVar(players));
}

function clearPlayerRecord(ctx, userId) {
  let raw = getGroupVar(ctx);
  let players = parseGroupVar(raw);
  players = players.filter(p => p.userId !== userId);
  setGroupVar(ctx, serializeGroupVar(players));
}

function clearAllRecords(ctx) {
  setGroupVar(ctx, '');
}

// ======================
// 导出统计（单个玩家）
// ======================
function formatPlayerRecords(name, recordsRaw) {
  let lines = (recordsRaw || '').trim().split('\n').filter(l => l.trim());
  if (lines.length === 0) return null;

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
    skillMap[skill].sort((a, b) => rankPriority.indexOf(a.level) - rankPriority.indexOf(b.level));
    let parts = skillMap[skill].map(item => item.count > 1 ? `${item.level}×${item.count}` : item.level);
    outputLines.push(`${skill}：${parts.join('，')}`);
  }

  if (rawLines.length > 0) {
    outputLines.push('');
    outputLines.push('以下记录格式异常，已保留原始内容：');
    outputLines = outputLines.concat(rawLines);
  }

  return `【${name}】 共 ${totalThrows} 次投掷\n` + outputLines.join('\n');
}

function getExportText(ctx) {
  let raw = getGroupVar(ctx);
  let players = parseGroupVar(raw);
  let entry = getPlayerEntry(players, ctx.player.userId);
  if (!entry) return '暂无记录';
  let result = formatPlayerRecords(entry.name, entry.records);
  return result || '暂无记录';
}

function getAllExportText(ctx) {
  let raw = getGroupVar(ctx);
  let players = parseGroupVar(raw);
  if (players.length === 0) return null;
  let outputs = players.map(p => formatPlayerRecords(p.name, p.records)).filter(Boolean);
  return outputs.length > 0 ? outputs : null;
}

function extractSkillName(rawText) {

  let m;

  // 优先取引号内容
  m = rawText.match(/"([^"]+)"/);

  if (m) {
    let name = safeText(m[1]);

    // 纯数字检定
    if (/^\d+$/.test(name)) {
      return `数值${name}`;
    }

    return normalizeSkill(name);
  }

  // xxx检定结果为
  m = rawText.match(/([^\s"：:]+)\s*检定结果为/);

  if (m) {
    return normalizeSkill(m[1]);
  }

  // xxx检定
  m = rawText.match(/([^\s"：:]+)\s*检定/);

  if (m) {
    return normalizeSkill(m[1]);
  }

  return '未知检定';
}

// ======================
// 解析多行骰点
// ======================
function parseMultiDiceBlock(text) {

  let lines = text.split('\n');
  let results = [];

  for (let line of lines) {

    let normal = line.match(
      /D100=(\d+)\/(\d+)\s*(.*)/
    );

    if (!normal) continue;

    results.push({
      diceResult: normal[1],
      skillValue: normal[2],
      rank: normalizeRank(normal[3] || '')
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

  // SC检定
  if (rawText.includes('的理智检定')) {
    const scMatch = rawText.match(/[dD]100=(\d+)\/(\d+)\s*(.+)/);
    if (scMatch) {
      let rank = normalizeRank(scMatch[3] || '');
      appendRecord(ctx, `SC：${rank} (D100=${scMatch[1]}/${scMatch[2]})`);
    }
    return;
  }

  // 多次检定
  const d100Count = (rawText.match(/D100=/g) || []).length;

  if (
    /进行了.*?次检定/.test(rawText) ||
    d100Count > 1
  ) {
    let skillName = extractSkillName(rawText);

    let multi = parseMultiDiceBlock(rawText);
    if (multi.length === 0) return;

    let newLines = multi.map(r => `${skillName}：${r.rank} (D100=${r.diceResult}/${r.skillValue})`);
    for (let line of newLines) appendRecord(ctx, line);
    return;
  }

  // 单次RA / 奖惩骰
  {
    const raPatterns = [
      /"([^"]+)"\s*检定结果为:\s*D100=(\d+)\/(\d+)\s*(.+)/,
      /([^\s]+)\s*检定结果为:\s*D100=(\d+)\/(\d+)\s*(.+)/,
      /进行"([^"]+)"\s*检定[：:]\s*D100=(\d+)\/(\d+)\s*(.+)/,
      /"([^"]+)"[^[]*?[pb]=(\d+)\/(\d+),\s*\((\d+)\[D100=\d+,[^\]]*\]\)\s*(.+)/,
      /([^\s"：:]+)[^[]*?[pb]=(\d+)\/(\d+),\s*\((\d+)\[D100=\d+,[^\]]*\]\)\s*(.+)/,
      /D100=(\d+)\/(\d+)\s*(.+)/
    ];

    for (let i = 0; i < raPatterns.length; i++) {
      let m = rawText.match(raPatterns[i]);
      if (!m) continue;

      let skill, dice, value, rank;
      if (i === 3 || i === 4) {
        skill = normalizeSkill(m[1]);
        dice = m[4];
        value = m[3];
        rank = normalizeRank(m[5] || '');
      } else if (i === 5) {
        skill = extractSkillName(rawText);
        dice = m[1];
        value = m[2];
        rank = normalizeRank(m[3] || '');
      } else {
        skill = normalizeSkill(m[1]);
        dice = m[2];
        value = m[3];
        rank = normalizeRank(m[4] || '');
      }

      appendRecord(ctx, `${skill}：${rank} (D100=${dice}/${value})`);
      break;
    }
  }
};

// ======================
// log 指令
// ======================
function replyClr(ctx, msg, playerName, output) {
  seal.replyToSender(ctx, msg, `${playerName}的记录导出如下：\n${output}\n\n记录已清除`);
}

ext.onCommandReceived = (ctx, msg, cmdArgs) => {
  if (!ctx.group) return;

  let cmd = cmdArgs.command.toLowerCase();
  if (cmd !== 'log') return;

  let sub = cmdArgs.getArgN(1);

  if (sub === 'new') {
    let outputs = getAllExportText(ctx);
    if (outputs) {
      seal.replyToSender(ctx, msg, outputs.join('\n\n') + '\n\n所有记录已清除');
      clearAllRecords(ctx);
    }
    return seal.ext.newCmdExecuteResult(true);
  }

  if (sub === 'end') {
    let outputs = getAllExportText(ctx);
    if (outputs) {
      seal.replyToSender(ctx, msg, outputs.join('\n\n') + '\n\n所有记录已清除');
      clearAllRecords(ctx);
    } else {
      seal.replyToSender(ctx, msg, '本次团中无任何检定记录');
    }
    return seal.ext.newCmdExecuteResult(true);
  }
};

// ======================
// countlog 指令
// ======================
const cmdCountlog = seal.ext.newCmdItemInfo();
cmdCountlog.name = 'countlog';
cmdCountlog.help = [
  '.countlog st      // 查看自己的记录',
  '.countlog st all  // 查看所有人的记录',
  '.countlog clr     // 导出并清除自己的记录',
  '.countlog clr all // 导出并清除所有人的记录',
].join('\n');

cmdCountlog.solve = (ctx, msg, cmdArgs) => {
  if (!ctx.group) {
    seal.replyToSender(ctx, msg, '请在群内使用此指令');
    return seal.ext.newCmdExecuteResult(true);
  }

  let sub = cmdArgs.getArgN(1);
  let arg2 = cmdArgs.getArgN(2);

  // 24H提醒检查更新
  const userId = msg.sender.userId;
  const now = Date.now();
  const lastNotify = userLastNotify.get(userId) || 0;
  
  if (now - lastNotify > 24 * 60 * 60 * 1000) {
      userLastNotify.set(userId, now);
      checkUpdateOnce(ctx, msg, userId).catch(console.error);
  }
  
  if (sub === 'st') {
    if (arg2 === 'all') {
      let outputs = getAllExportText(ctx);
      if (!outputs) {
        seal.replyToSender(ctx, msg, '暂无任何成员记录');
      } else {
        seal.replyToSender(ctx, msg, outputs.join('\n\n'));
      }
    } else {
      seal.replyToSender(ctx, msg, getExportText(ctx));
    }
    return seal.ext.newCmdExecuteResult(true);
  }

  if (sub === 'clr') {
    if (arg2 === 'all') {
      let outputs = getAllExportText(ctx);
      if (!outputs) {
        seal.replyToSender(ctx, msg, '暂无任何成员记录，无需清除');
      } else {
        seal.replyToSender(ctx, msg, outputs.join('\n\n') + '\n\n所有记录已清除');
        clearAllRecords(ctx);
      }
    } else {
      let playerName = ctx.player.name || '未知玩家';
      let output = getExportText(ctx);
      if (output !== '暂无记录') {
        replyClr(ctx, msg, playerName, output);
      } else {
        seal.replyToSender(ctx, msg, `${playerName}暂无记录，无需清除`);
      }
      clearPlayerRecord(ctx, ctx.player.userId);
    }
    return seal.ext.newCmdExecuteResult(true);
  }

  seal.replyToSender(ctx, msg, cmdCountlog.help);
  return seal.ext.newCmdExecuteResult(true);
};

ext.cmdMap['countlog'] = cmdCountlog;