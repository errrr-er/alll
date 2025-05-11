// ==UserScript==
// @name         KP群汇总
// @author       3987681449
// @version      1.0.0
// @description  有问题可进群2150284119联系
// @timestamp    1746953357
// 2025-05-11 16:49:17
// @license      Apache-2
// @homepageURL  https://github.com/errrr-er/alll/tree/main
// @updateUrl    https://raw.githubusercontent.com/errrr-er/alll/refs/heads/main/call_of_cthulhu/kp/a_kp_all.js
// @updateUrl    https://ghp.ci/https://raw.githubusercontent.com/errrr-er/alll/refs/heads/main/call_of_cthulhu/kp/a_kp_all.js
// ==/UserScript==


let ext = seal.ext.find('KP群汇总');
if (!ext) {
  ext = seal.ext.new('KP群汇总', 'er', '1.0.0');
  seal.ext.register(ext);
}

// 创建群号映射表
// 格式: { 主关键词: {群号: "123456", 别名: ["alias1", "alias2"]} }
const groupMap = {
  "天衍": { groupNumber: "666391763", aliases: ["ty", "tyjn"]
  },
};

// 生成帮助信息，包含主关键词和别名
function generateHelpText() {
  let helpLines = [];
  for (const groupName in groupMap) {
    const aliases = groupMap[groupName].aliases;
    let aliasText = '';
    if (aliases && aliases.length > 0) {
      aliasText = `(或${aliases.join('、')})`;
    }
    helpLines.push(`${groupName}${aliasText}`);
  }
  return helpLines.join(', ');
}

// 创建.kp指令
const cmdKp = seal.ext.newCmdItemInfo();
cmdKp.name = 'kp';
cmdKp.help = '.kp <关键词> // 根据关键词返回对应的KP群号\n可用关键词: ' + generateHelpText();

cmdKp.solve = (ctx, msg, cmdArgs) => {
  let ret = seal.ext.newCmdExecuteResult(true);
  const input = cmdArgs.getArgN(1);
  
  // 帮助命令
  if (input === 'help' || input === '') {
    ret.showHelp = true;
    return ret;
  }
  
  // 查找匹配的群组
  let foundGroup = null;
  
  // 1. 检查主关键词
  if (groupMap[input]) {
    foundGroup = groupMap[input];
  } 
  // 2. 检查所有群组的别名
  else {
    for (const groupName in groupMap) {
      if (groupMap[groupName].aliases.includes(input)) {
        foundGroup = groupMap[groupName];
        break;
      }
    }
  }
  
  // 返回结果
  if (foundGroup) {
    const replyText = `【${input}】的KP群号是: ${foundGroup.groupNumber}`;
    seal.replyToSender(ctx, msg, replyText);
  } else {
    const availableGroups = generateHelpText();
    seal.replyToSender(ctx, msg, `未找到与"${input}"匹配的KP群。可用关键词: ${availableGroups}`);
  }
  
  return ret;
};

// 注册指令
ext.cmdMap['kp'] = cmdKp;