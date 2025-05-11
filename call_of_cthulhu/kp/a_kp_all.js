// ==UserScript==
// @name         KP群汇总
// @author       3987681449
// @version      1.0.0
// @description  有问题可进群2150284119联系
// @timestamp    1746956538
// 2025-05-11 16:49:17
// @license      Apache-2
// @homepageURL  https://github.com/errrr-er/alll/tree/main
// @updateUrl    https://raw.githubusercontent.com/errrr-er/alll/refs/heads/main/call_of_cthulhu/kp/a_kp_all.js
// @updateUrl    https://ghfast.top/https://raw.githubusercontent.com/errrr-er/alll/refs/heads/main/call_of_cthulhu/kp/a_kp_all.js
// ==/UserScript==


let ext = seal.ext.find('KP群汇总');
if (!ext) {
  ext = seal.ext.new('KP群汇总', 'er', '1.0.0');
  seal.ext.register(ext);
}


// 创建群号映射表
// 格式: { 主关键词: {群号: "123456", 别名: ["alias1", "alias2"]} }
const groupMap = {
  "aib":{ groupNumber: "112077093" },
  "沧渺山":{ groupNumber: "855215735", aliases: ["cms"] },
  "天衍纪年":{ groupNumber: "666391763、675869524", aliases: ["天衍", "ty", "tyjn"] },
  "雪与箱庭之梦":{ groupNumber: "413941306", aliases: ["雪箱"] },
  "海盗啊海盗":{ groupNumber: "928270526", aliases: ["海盗"] },
  "左川之国失落谭":{ groupNumber: "770779991", aliases: ["左川"] },
  "脓堕":{ groupNumber: "183186533", aliases: ["nd"] },
  "欲望之箱":{ groupNumber: "739976718" },
  "油盐不进":{ groupNumber: "575319883" },
  "BASH":{ groupNumber: "774156947", aliases: ["bash"] },
  "燃烧的星辰":{ groupNumber: "1049443592" },
  "快刀乱魔":{ groupNumber: "238285939", aliases: ["快刀"] },
	"快刀乱魔贰":{ groupNumber: "417453795", aliases: ["快刀2"] },
	"dear-flip-flops":{ groupNumber: "345837146", aliases: ["dff"] },
  "生下他吧":{ groupNumber: "705913038" },
	"肥皂学校":{ groupNumber: "980188286", aliases: ["肥皂", "皂校"] },
	"旅馆的捕食者":{ groupNumber: "884768719", aliases: ["旅馆的捕食者", "吕布"] },
	"nobody*2":{ groupNumber: "694908547", aliases: ["nobodynobody", "nobodyx2"] },
	"4s":{ groupNumber: "926664565", aliases: ["ssss"] },
	"蛙徒的祭典":{ groupNumber: "655890716", aliases: ["蛙祭", "挖机"] },
	"怪物们与邪典仙境":{ groupNumber: "592577986" },
	"莫索里哀的圣职者":{ groupNumber: "435690433", aliases: ["msla"] },
	"谢娘娘点化":{ groupNumber: "878626807", aliases: ["谢娘娘"] },
	"西比拉":{ groupNumber: "669808359" },
	"远方呢喃":{ groupNumber: "761735153" },
	"不辜马戏团":{ groupNumber: "759642443", aliases: ["不辜"] },
	"void":{ groupNumber: "1170037255" },
	"细胞复位":{ groupNumber: "892835680" },
};

// 计算两个字符串的相似度 (Levenshtein距离)
function getSimilarity(s1, s2) {
  const len1 = s1.length;
  const len2 = s2.length;
  
  const matrix = [];
  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,     // 删除
        matrix[i][j - 1] + 1,     // 插入
        matrix[i - 1][j - 1] + cost  // 替换
      );
    }
  }
  
  const distance = matrix[len1][len2];
  const maxLen = Math.max(len1, len2);
  return 1 - distance / maxLen;
}

// 查找最相似的群组
function findSimilarGroup(input) {
  let bestMatch = null;
  let highestScore = 0;
  
  // 检查所有群组名称和别名
  for (const groupName in groupMap) {
    const groupInfo = groupMap[groupName];
    
    // 检查主名称
    const mainScore = getSimilarity(input, groupName);
    if (mainScore > highestScore) {
      highestScore = mainScore;
      bestMatch = { name: groupName, info: groupInfo };
    }
    
    // 检查别名
    if (groupInfo.aliases) {
      for (const alias of groupInfo.aliases) {
        const aliasScore = getSimilarity(input, alias);
        if (aliasScore > highestScore) {
          highestScore = aliasScore;
          bestMatch = { name: groupName, info: groupInfo };
        }
      }
    }
  }
  
  return highestScore > 0.4 ? { match: bestMatch, score: highestScore } : null;  // 设置相似度阈值为0.4
}

// 生成所有群组信息
function generateGroupList() {
  let listLines = [];
  for (const groupName in groupMap) {
    const groupInfo = groupMap[groupName];
    let aliasText = '';
    if (groupInfo.aliases && groupInfo.aliases.length > 0) {
      aliasText = `(${groupInfo.aliases.join('、')})`;
    }
    listLines.push(`${groupName}${aliasText} → ${groupInfo.groupNumber}`);
  }
  return listLines.join('\n');
}

// 创建.kp指令
const cmdKp = seal.ext.newCmdItemInfo();
cmdKp.name = 'kp';
cmdKp.help = `KP群查询指令
.kp <关键词>    // 查询特定KP群号
.kp list        // 列出所有KP群信息
.kp help        // 显示本帮助`;

cmdKp.solve = (ctx, msg, cmdArgs) => {
  let ret = seal.ext.newCmdExecuteResult(true);
  const input = cmdArgs.getArgN(1);
  
  // 帮助命令
  if (input === 'help' || input === '') {
    ret.showHelp = true;
    return ret;
  }
  
  // 列出所有群组
  if (input === 'list') {
    const listText = `所有KP群信息:\n${generateGroupList()}`;
    seal.replyToSender(ctx, msg, listText);
    return ret;
  }
  
  // 查找匹配的群组
  let foundGroup = null;
  let exactMatch = false;
  
  // 1. 检查主关键词
  if (groupMap[input]) {
    foundGroup = { match: { name: input, info: groupMap[input] }, score: 1 };
    exactMatch = true;
  } 
  // 2. 检查所有群组的别名
  else {
    for (const groupName in groupMap) {
      const groupInfo = groupMap[groupName];
      if (groupInfo.aliases && groupInfo.aliases.includes(input)) {
        foundGroup = { match: { name: groupName, info: groupInfo }, score: 1 };
        exactMatch = true;
        break;
      }
    }
  }
  
  // 3. 如果没有精确匹配，尝试近似匹配
  if (!foundGroup) {
    foundGroup = findSimilarGroup(input);
  }
  
  // 返回结果
  if (foundGroup) {
    let replyText;
    if (exactMatch) {
      replyText = `【${input}】的KP群号是: ${foundGroup.match.info.groupNumber}`;
    } else {
      replyText = `未找到精确匹配的"${input}"，最相似的是【${foundGroup.match.name}】(相似度${Math.round(foundGroup.score * 100)}%)，群号: ${foundGroup.match.info.groupNumber}`;
    }
    seal.replyToSender(ctx, msg, replyText);
  } else {
    seal.replyToSender(ctx, msg, `未找到与"${input}"匹配的KP群。使用 .kp list 查看所有可用群组。`);
  }
  
  return ret;
};

// 注册指令
ext.cmdMap['kp'] = cmdKp;