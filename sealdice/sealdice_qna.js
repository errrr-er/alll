// ==UserScript==
// @name         海豹自助问答(非官方)
// @author       3987681449
// @version      1.0.0
// @description  有问题可进群2150284119联系
// @timestamp    1757439793
// 2025-09-09 09:09:30
// @license      MIT
// @homepageURL  https://github.com/errrr-er/trpg/tree/main
// @updateUrl    https://raw.githubusercontent.com/errrr-er/alll/refs/heads/main/sealdice/sealdice_qna.js
// @updateUrl    https://ghfast.top/https://raw.githubusercontent.com/errrr-er/alll/refs/heads/main/sealdice/sealdice_qna.js
// ==/UserScript==

let ext = sd.ext.find('海豹自助问答(非官方)');
if (!ext) {
  ext = sd.ext.new('海豹自助问答(非官方)', 'er', '1.0.0');
  sd.ext.register(ext);
}

// 创建群号映射表
// 格式: { 主关键词: {群号: "123456", 别名: ["alias1", "alias2"]} }
const lyMap = {
  "官网": { sdQuestion: "https://dice.weizaima.com/" },
  "手册": { sdQuestion: "https://docs.sddice.com/" },
  "WebUI密码": { sdQuestion: "综合设置→基本设置→访问控制\n*保存键在页面最低下\n*密码忘了不要紧，手册中有方法重置" },
  "文件同步": { sdQuestion: "https://sdfile.cn.xuetao.host/" },
  "拉格兰一键包": { sdQuestion: "https://lgrbuild.cn.xuetao.host/" },
};

// "": { sdQuestion: "" },

// "": { sdQuestion: "",aliases: [""] },

// 计算两个字符串的相似度（结合Levenshtein和Jaccard）
function getSimilarity(s1, s2) {
  // 转换为小写
  s1 = s1.toLowerCase();
  s2 = s2.toLowerCase();

  // 1. 计算Levenshtein相似度
  function getLevenshteinScore(a, b) {
    const len1 = a.length;
    const len2 = b.length;
    const matrix = [];
    for (let i = 0; i <= len1; i++) matrix[i] = [i];
    for (let j = 0; j <= len2; j++) matrix[0][j] = j;
    for (let i = 1; i <= len1; i++) {
      for (let j = 1; j <= len2; j++) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j - 1] + cost
        );
      }
    }
    const distance = matrix[len1][len2];
    return 1 - distance / Math.max(len1, len2);
  }

  // 2. 计算Jaccard相似度（语序无关）
  function getJaccardScore(a, b) {
    const set1 = new Set(a.split(''));
    const set2 = new Set(b.split(''));
    const intersection = new Set([...set1].filter(c => set2.has(c))).size;
    const union = new Set([...set1, ...set2]).size;
    return union === 0 ? 0 : intersection / union;
  }

  // 返回两种相似度的最大值
  return Math.max(
    getLevenshteinScore(s1, s2),
    getJaccardScore(s1, s2)
  );
}

// 查找相似名称
function findSimilarGroup(input) {
  input = input.toLowerCase();
  const matchedGroups = [];

  // 遍历所有名称
  for (const groupName in lyMap) {
    const groupInfo = lyMap[groupName];
    let highestScore = 0;

    // 计算主名称相似度
    const mainScore = getSimilarity(input, groupName.toLowerCase());
    highestScore = Math.max(highestScore, mainScore);

    // 计算别名相似度
    if (groupInfo.aliases && groupInfo.aliases.length > 0) {
      for (const alias of groupInfo.aliases) {
        const aliasScore = getSimilarity(input, alias.toLowerCase());
        highestScore = Math.max(highestScore, aliasScore);
      }
    }

    // 记录相似度>=0.1的名称
    if (highestScore >= 0.1) {
      matchedGroups.push({
        name: groupName,
        info: groupInfo,
        score: highestScore
      });
    }
  }

  // 按相似度降序排列
  matchedGroups.sort((a, b) => b.score - a.score);

  return matchedGroups.length > 0 ? matchedGroups : null;
}

// 生成带编号的名称列表（仅显示主关键词）
function generateNumberedGroupList() {
  let listLines = [];
  let index = 1;
  for (const groupName in lyMap) {
    listLines.push(`${index}. ${groupName}`); // 只显示编号和主关键词
    index++;
  }
  return listLines.join('\n');
}

// 通过数字获取名称信息
function getGroupByNumber(num) {
  const groups = Object.entries(lyMap);
  if (num > 0 && num <= groups.length) {
    const [groupName, groupInfo] = groups[num - 1];
    return {
      name: groupName,
      info: groupInfo
    };
  }
  return null;
}

// 创建.sd指令
const cmdly = sd.ext.newCmdItemInfo();
cmdly.name = 'sd';
cmdly.help = `海豹自助问答(非官方)
.sd <关键词/数字>  // 查询特定简介
.sd list          // 列出所有名称
.sd help          // 显示本帮助`;

cmdly.solve = (ctx, msg, cmdArgs) => {
  let ret = sd.ext.newCmdExecuteResult(true);
  const command = cmdArgs.getArgN(1);
  const input = cmdArgs.getArgN(2);
  
  // 帮助命令
  if (command === 'help' || !command) {
    ret.showHelp = true;
    return ret;
  }
  
  // 列出所有名称(带编号)
  if (command.toLowerCase() === 'list') {
    const listText = `海豹自助问答(非官方):\n${generateNumberedGroupList()}\n\n使用.sd+数字快速查询(如.sd1)`;
    sd.replyToSender(ctx, msg, listText);
    return ret;
  }
  
  // 下载链接命令
  if (command.toLowerCase() === 'd') {
    if (!input) {
      sd.replyToSender(ctx, msg, `请提供要查询的名称或编号，例如：.ly d 1`);
      return ret;
    }
    
    let targetGroup = null;
    
    // 数字查询
    if (/^\d+$/.test(input)) {
      const num = parseInt(input);
      targetGroup = getGroupByNumber(num);
      if (!targetGroup) {
        sd.replyToSender(ctx, msg, `无效的数字编号，请使用.ly list查看有效编号`);
        return ret;
      }
    } else {
      // 关键词查询
      const matchedGroups = findSimilarGroup(input);
      if (!matchedGroups || matchedGroups.length === 0) {
        sd.replyToSender(ctx, msg, `未找到匹配【${input}】的名称。使用 .ly list 查看所有名称。`);
        return ret;
      }
      targetGroup = matchedGroups[0]; // 取相似度最高的
    }
    
    return ret;
  }
  
  // 普通查询命令
  let queryInput = command;
  if (input) {
    // 如果有多于一个参数，合并起来查询
    queryInput = command + ' ' + input;
    for (let i = 3; i <= cmdArgs.args.length; i++) {
      const arg = cmdArgs.getArgN(i);
      if (arg) queryInput += ' ' + arg;
    }
  }

  // 数字查询(如.sd1)
  if (/^\d+$/.test(queryInput)) {
    const num = parseInt(queryInput);
    const group = getGroupByNumber(num);
    if (group) {
      let aliasText = '';
      if (group.info.aliases && group.info.aliases.length > 0) {
        aliasText = `\n别名: ${group.info.aliases.join('、')}`;
      }
      let replyText = (ctx, msg, `【${group.name}】${aliasText}\n ${group.info.sdQuestion}`);
      sd.replyToSender(ctx, msg, replyText);
    } else {
      sd.replyToSender(ctx, msg, `无效的数字编号，请使用.sd list查看有效编号`);
    }
    return ret;
  }
  
  // 关键词查询
  const matchedGroups = findSimilarGroup(queryInput);
  if (matchedGroups) {
    let replyText = `找到以下匹配【${queryInput}】的名称（按相似度排序）：`;
    matchedGroups.forEach(group => {
      let aliasText = '';
      if (group.info.aliases && group.info.aliases.length > 0) {
        aliasText = `\n别名: ${group.info.aliases.join('、')}`;
      }
      replyText += `\n\n【${group.name}】${aliasText}\n→ ${group.info.sdQuestion}`;
    });
    sd.replyToSender(ctx, msg, replyText);
  } else {
    sd.replyToSender(ctx, msg, `未找到匹配【${queryInput}】的名称。使用 .sd list 查看所有名称。`);
  }

  return ret;
};

// 注册指令
ext.cmdMap['sd'] = cmdly;