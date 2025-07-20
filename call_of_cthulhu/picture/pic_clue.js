// ==UserScript==
// @name         模组图片资料
// @author       3987681449
// @version      1.0.0
// @description  有问题可进群2150284119联系
// @timestamp    1753038344
// 2025-04-08
// @license      Apache-2
// @homepageURL  https://github.com/errrr-er/alll/tree/main
// @updateUrl    https://raw.githubusercontent.com/errrr-er/alll/refs/heads/main/call_of_cthulhu/picture/pic_clue.js
// @updateUrl    https://ghfast.top/https://raw.githubusercontent.com/errrr-er/alll/refs/heads/main/call_of_cthulhu/picture/pic_clue.js
// ==/UserScript==


let ext = seal.ext.find('模组图片资料');
if (!ext) {
  ext = seal.ext.new('模组图片资料', 'er', '1.0.0');
  seal.ext.register(ext);
}


// 创建映射表
const groupMap = {
	//月光舞鞋
	"西大附中": { groupNumber: "[CQ:image,file=https://github.com/errrr-er/alll/blob/main/call_of_cthulhu/picture/pic/%E6%9C%88%E5%85%89%E8%88%9E%E9%9E%8B/%E8%A5%BF%E5%A4%A7%E9%99%84%E4%B8%AD.png?raw=true,type=show]" },
};

// "": { groupNumber: "" },

// "": { groupNumber: "",aliases: [""] },

// [CQ:image,file=,type=show]

// 创建.pic指令
const cmdPic = seal.ext.newCmdItemInfo();
cmdPic.name = 'pic';
cmdPic.help = `模组图片资料查询指令
.pic <关键词>  // 查询特定图片
.pic list     // 列出所有支持模组
.pic help     // 显示本帮助`;

cmdPic.solve = (ctx, msg, cmdArgs) => {
  let ret = seal.ext.newCmdExecuteResult(true);
  const input = cmdArgs.getArgN(1);
  
  // 帮助命令
  if (input === 'help' || input === '') {
    ret.showHelp = true;
    return ret;
  }
  
  // 列出所有群组
  if (input.toLowerCase() === 'list') {
    const listText = `所有KP群信息:\n请查看完整图片\n[CQ:image,file=https://github.com/errrr-er/alll/blob/main/call_of_cthulhu/kp/kp.png?raw=true,type=show]`;
    seal.replyToSender(ctx, msg, listText);
    return ret;
  }
  
  // 查找精确匹配的群组
  let foundGroup = null;
  const lowerInput = input.toLowerCase();
  
  // 1. 检查主关键词
  for (const groupName in groupMap) {
    if (groupName.toLowerCase() === lowerInput) {
      foundGroup = groupMap[groupName];
      break;
    }
  }
  
  // 2. 检查别名
  if (!foundGroup) {
    for (const groupName in groupMap) {
      const groupInfo = groupMap[groupName];
      if (groupInfo.aliases) {
        for (const alias of groupInfo.aliases) {
          if (alias.toLowerCase() === lowerInput) {
            foundGroup = groupInfo;
            break;
          }
        }
      }
      if (foundGroup) break;
    }
  }
  
  if (foundGroup) {
    // 找到精确匹配，显示图片
    seal.replyToSender(ctx, msg, `KP群图片查询结果：\n[CQ:image,file=https://github.com/errrr-er/alll/blob/main/call_of_cthulhu/kp/kp.png?raw=true,type=show]`);
  } else {
    seal.replyToSender(ctx, msg, `未找到精确匹配【${input}】的KP群。使用 .pic list 查看所有群组图片。`);
  }

  return ret;
};

// 注册指令
ext.cmdMap['pic'] = cmdPic;