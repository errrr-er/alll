// ==UserScript==
// @name        特定时间提醒
// @author      3987681449
// @version     1.0.0
// @description (.remind)有问题可进群2150284119联系
// @timestamp   1757956257
// 2025-09-15 09:09:33
// @license     MIT
// @homepageURL  https://github.com/errrr-er/trpg/tree/main
// @updateUrl    https://raw.githubusercontent.com/errrr-er/alll/refs/heads/main/sealdice/time_remind.js
// @updateUrl    https://ghfast.top/https://raw.githubusercontent.com/errrr-er/alll/refs/heads/main/sealdice/time_remind.js
// ==/UserScript==

let ext = seal.ext.find('特定时间提醒');
if (!ext) {
  ext = seal.ext.new('特定时间提醒', 'er', '1.0.0');
  seal.ext.register(ext);
}

// 存储所有定时器的Map
const timers = new Map();

// 解析用户输入的"月日时分"格式字符串
function parseMonthDayTime(str) {
  // 使用正则表达式匹配，例如 "12月25日14点30分"
  const regex = /^(\d{1,2})月(\d{1,2})日(\d{1,2})点(\d{1,2})分$/;
  const match = str.match(regex);

  if (!match) {
    return null; // 格式不匹配
  }

  // 提取捕获组
  const month = parseInt(match[1], 10);
  const day = parseInt(match[2], 10);
  const hour = parseInt(match[3], 10);
  const minute = parseInt(match[4], 10);

  // 简单的日期有效性检查
  if (month < 1 || month > 12 || day < 1 || day > 31 || hour < 0 || hour > 23 || minute < 0 || minute > 59) {
    return null;
  }

  return { month, day, hour, minute };
}

// 计算目标北京时间对应的毫秒时间戳
function calculateTargetTimestamp(monthDayTime) {
  const now = new Date();
  
  // 1. 获取当前时间的北京时间戳
  const nowBeiJing = new Date(now.getTime() + (8 * 60 - now.getTimezoneOffset()) * 60 * 1000);
  
  // 2. 创建目标时间的Date对象（假设为今年）
  let targetYear = nowBeiJing.getFullYear();
  const targetDate = new Date(targetYear, monthDayTime.month - 1, monthDayTime.day, monthDayTime.hour, monthDayTime.minute, 0, 0);
  
  // 3. 将目标时间转换为UTC时间，然后再计算其与UTC+8的偏移
  const targetTimestamp = targetDate.getTime() - (8 * 60 * 60 * 1000);
  
  // 4. 将标准时间戳转换回北京时间戳用于比较和计算
  const targetBeiJingTimestamp = targetTimestamp + (8 * 60 * 60 * 1000);

  // 5. 检查是否已经过去
  if (targetBeiJingTimestamp < nowBeiJing.getTime()) {
    return -1; // 返回-1表示时间已过
  }

  // 6. 返回目标时间的标准时间戳（用于setTimeout）
  return targetTimestamp;
}

// 创建.remind指令
const cmdRemind = seal.ext.newCmdItemInfo();
cmdRemind.name = 'remind';
cmdRemind.help = `特定时间提醒指令
.remind <月日时分> <提醒内容>  // 设置一个一次性提醒
.remind help                 // 显示本帮助

示例: .remind 1月1日1点1分 测试`;

cmdRemind.solve = (ctx, msg, cmdArgs) => {
  let ret = seal.ext.newCmdExecuteResult(true);
  const timeStr = cmdArgs.getArgN(1);
  const reminderText = cmdArgs.getArgN(2);
  
  // 帮助命令
  if (timeStr === 'help' || !timeStr) {
    ret.showHelp = true;
    return ret;
  }

  // 检查是否有提醒内容
  if (!reminderText) {
    seal.replyToSender(ctx, msg, '请输入提醒内容，格式: .remind 月日时分 提醒内容');
    return ret;
  }

  // 解析时间
  const parsedTime = parseMonthDayTime(timeStr);
  if (!parsedTime) {
    seal.replyToSender(ctx, msg, '时间格式错误，请使用【月日时分】格式，例如：12月25日14点30分');
    return ret;
  }

  // 计算目标时间戳
  const targetStamp = calculateTargetTimestamp(parsedTime);
  if (targetStamp === -1) {
    seal.replyToSender(ctx, msg, `设定的时间（${timeStr}）已经过去了，本次提醒已取消。`);
    return ret;
  }

  // 计算需要等待的毫秒数
  const nowStamp = new Date().getTime();
  const delayMs = targetStamp - nowStamp;

  if (delayMs <= 0) {
    seal.replyToSender(ctx, msg, '时间计算出现意外错误，请检查格式。');
    return ret;
  }

  // 设置定时器
  const timerId = setTimeout(() => {
    // 时间到！发送提醒
    seal.replyToSender(ctx, msg, `【提醒】${timeStr} 已到！\n${reminderText}`);
    // 从Map中移除已触发的定时器
    timers.delete(timerId);
  }, delayMs);

  // 存储定时器信息
  timers.set(timerId, {
    originalMsg: msg,
    reminder: reminderText,
    targetTime: timeStr
  });

  // 告知用户设置成功
  const confirmText = `提醒设置成功！我将在 ${timeStr} 提醒你：${reminderText}\n*请注意，JS重载时会清除所有提醒设置`;
  seal.replyToSender(ctx, msg, confirmText);

  return ret;
};

// 注册指令
ext.cmdMap['remind'] = cmdRemind;