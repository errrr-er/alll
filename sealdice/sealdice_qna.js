// ==UserScript==
// @name         海豹自助问答(非官方)
// @author       3987681449
// @version      1.0.0
// @description  (.seal)有问题可进群2150284119联系
// @timestamp    1757605099
// 2025-09-09 09:09:30
// @license      MIT
// @homepageURL  https://github.com/errrr-er/trpg/tree/main
// @updateUrl    https://raw.githubusercontent.com/errrr-er/alll/refs/heads/main/sealdice/sealdice_qna.js
// @updateUrl    https://ghfast.top/https://raw.githubusercontent.com/errrr-er/alll/refs/heads/main/sealdice/sealdice_qna.js
// ==/UserScript==


let ext = seal.ext.find('海豹自助问答(非官方)');
if (!ext) {
  ext = seal.ext.new('海豹自助问答(非官方)', 'er', '1.0.0');
  seal.ext.register(ext);
}


// 创建问答映射表
const sealMap = {
  "官网": "https://dice.weizaima.com/",
  "手册": "https://docs.sealdice.com/",
  "入群": "新人好，请看群公告\n\n当前最新版本为1.5.0dev2，【务必】更新到最新版本再使用。\n看到有滑条验证的先看一下海豹版本是不是1.5.0dev2，不是的话去升级一下，重新添加账号即可正常使用。\n请直接从官网进，不必走内置的检测更新。\n\n必须先看教程手册，有问题必须截图，截图不截日志等于溜群友❗️\n截日志请务必用截图，拍屏不但不会被回答并且还会被群友拍死‼️\n如果没看手册就来问可能会被无视，不要做伸手党，不要不看手册教程就直接问❗️\n\n海豹手册链接： https://dice.weizaima.com/manual/ \n（手册有搜索工具，大家善用这个功能）\n\n现在1.5.0dev2海豹可用内置客户端登录，其他可靠方案还有LiteLoader（llonebot）、Lagrange和NapCat，请你去手册上看细节https://dice.weizaima.com/manual/deploy/platform-qq.html\n链接在这里↑",
  "文件同步·旧": "https://sealfile.cn.xuetao.host/\n*已停止更新，请去官方群内获取最新文件",
  "146": "备份data+backup文件夹后升150，目前核心最新版为0114的测试版\n*backup文件夹想备份就备份不想就不备，但推荐留几个以防万一",
  "拍屏" : "不要拍屏，拍屏看不清，截图时请点击日志页面右下角的小三角，或者是截取红色一片黄色一片的地方，请尽可能截全",
  "日志截图" : "请截最新日志，点击日志页面右下角的小三角，或者是红色一片黄色一片的地方，请尽可能截全",
  "WaitingForScan" : "海豹在等你扫码",
  "另一台终端登录" : "海豹在使用电脑版qq，请不要跟海豹抢电脑\n(人话：把你那电脑端的登录给退了然后UI里删账号再重连)",
  "异地登录告警" : "请尝试使用WebUI提供的13325辅助端口让手机ip与服务器ip一致后再扫码，具体配置与操作请看海豹官方手册\nhttps://docs.sealdice.com/use/faq.html#_1-%E9%A6%96%E9%80%89-%E8%AE%A9%E6%89%8B%E6%9C%BA%E8%B7%9F%E6%9C%8D%E5%8A%A1%E5%99%A8%E7%9C%9F%E7%9A%84%E5%A4%84%E4%BA%8E%E5%90%8C%E4%B8%80%E4%B8%AA%E7%BD%91%E7%BB%9C",
  "WebUI密码": "记得加密码！一定！\n综合设置→基本设置→访问控制\n*保存键在页面最底下\n*重置密码详见海豹官方手册：\n首先彻底关闭海豹。用文本编辑器打开 dice/dice.yaml，删除 uiPasswordHash 一行，保存。重新启动海豹。",
  "拉格兰一键包": "https://lgrbuild.cn.xuetao.host/",
};

// "" : "",

// 生成带编号的列表
function generateNumberedList() {
  let listLines = [];
  let index = 1;
  for (const itemName in sealMap) {
    listLines.push(`${index}. ${itemName}`);
    index++;
  }
  return listLines.join('\n');
}

// 通过数字获取项目信息
function getItemByNumber(num) {
  const items = Object.entries(sealMap);
  if (num > 0 && num <= items.length) {
    const [itemName, itemAnswer] = items[num - 1];
    return {
      name: itemName,
      answer: itemAnswer
    };
  }
  return null;
}

// 创建.seal指令
const cmdseal = seal.ext.newCmdItemInfo();
cmdseal.name = 'seal';
cmdseal.help = `海豹自助问答(非官方)
.seal <数字>        // 查询对应答案
.seal list          // 列出所有问题
.seal help          // 显示本帮助`;

cmdseal.solve = (ctx, msg, cmdArgs) => {
  let ret = seal.ext.newCmdExecuteResult(true);
  const command = cmdArgs.getArgN(1);
  
  // 帮助命令
  if (command === 'help' || !command) {
    ret.showHelp = true;
    return ret;
  }
  
  // 列出所有问题
  if (command.toLowerCase() === 'list') {
    const listText = `海豹自助问答(非官方):\n${generateNumberedList()}\n\n使用.seal+数字快速查询(如.seal 1)`;
    seal.replyToSender(ctx, msg, listText);
    return ret;
  }
  
  // 数字查询
  if (/^\d+$/.test(command)) {
    const num = parseInt(command);
    const item = getItemByNumber(num);
    if (item) {
      const replyText = `【${item.name}】\n${item.answer}`;
      seal.replyToSender(ctx, msg, replyText);
    } else {
      seal.replyToSender(ctx, msg, `无效的数字编号，请使用.seal list查看有效编号`);
    }
    return ret;
  }
  
  // 如果不是数字也不是list/help，显示帮助
  ret.showHelp = true;
  return ret;
};

// 注册指令
ext.cmdMap['seal'] = cmdseal;
