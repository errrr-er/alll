// ==UserScript==
// @name         跑团时间规划
// @author       3987681449
// @version      1.0.0
// @description  (.ptplan)有问题可进群2150284119联系
// @timestamp    1780158474
// 2026-05-30 15:20:42
// @license      Apache-2
// @homepageURL  https://github.com/errrr-er/alll/tree/main
// @updateUrl    https://hk.gh-proxy.org/https://raw.githubusercontent.com/errrr-er/alll/refs/heads/main/dice_common/pt_plan/ptplan.js
// @updateUrl    https://raw.githubusercontent.com/errrr-er/alll/refs/heads/main/dice_common/pt_plan/ptplan.js
// ==/UserScript==

let ext = seal.ext.find('跑团时间规划');
if (!ext) {
  ext = seal.ext.new('跑团时间规划', 'er', '1.0.0');
  seal.ext.register(ext);
}

function getCurrentTimestamp() {
  return 1780158474;
}

const userLastNotify = new Map();

async function getGitHubVersion() {
  try {
    const rawUrl = 'https://hk.gh-proxy.org/https://raw.githubusercontent.com/errrr-er/alll/refs/heads/main/dice_common/pt_plan/ptplan.js';
    const response = await fetch(rawUrl);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const content = await response.text();
    const timestampMatch = content.match(/@timestamp\s+(\d+)/);
    if (timestampMatch) {
      const timestamp = parseInt(timestampMatch[1]);
      const date = new Date(timestamp * 1000);
      return { timestamp, date, formattedDate: date.toLocaleString('zh-CN') };
    }
    return null;
  } catch (error) {
    return null;
  }
}

async function checkUpdateOnce(ctx, msg, userId) {
  try {
    const remote = await getGitHubVersion();
    if (!remote) return;
    const current = getCurrentTimestamp();
    if (remote.timestamp > current) {
      setTimeout(() => {
        seal.replyToSender(ctx, msg,
          `发现<跑团时间规划>插件有新版本！\n最后更新：${remote.formattedDate}\n请及时更新`
        );
      }, 1000);
    }
  } catch (e) {}
}

const clearRequests = new Map();

function generateClearCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function getData() {
  let raw = ext.storageGet("ptplan_data");
  if (!raw) return { groups: {} };
  try {
    return JSON.parse(raw);
  } catch(e) {
    return { groups: {} };
  }
}

function saveData(data) {
  ext.storageSet("ptplan_data", JSON.stringify(data));
}

function parseDate(input, nowDate) {
  if (!nowDate) nowDate = new Date();
  let parts = input.split('-');
  if (parts.length !== 2) return null;
  let m = parseInt(parts[0], 10);
  let d = parseInt(parts[1], 10);
  if (isNaN(m) || isNaN(d)) return null;
  let year = nowDate.getFullYear();
  let candidate = new Date(Date.UTC(year, m-1, d));
  let todayUTC = new Date(Date.UTC(nowDate.getFullYear(), nowDate.getMonth(), nowDate.getDate()));
  if (candidate < todayUTC) {
    candidate = new Date(Date.UTC(year + 1, m-1, d));
  }
  return candidate.toISOString().slice(0,10);
}

function getWeekday(dateStr) {
  let [year, month, day] = dateStr.split('-').map(Number);
  let d = new Date(Date.UTC(year, month-1, day));
  return d.getUTCDay();
}

function getMonthRange(baseDate, offsetMonths = 0) {
  let now = baseDate || new Date();
  let year = now.getFullYear();
  let month = now.getMonth() + offsetMonths;
  while (month < 0) { month += 12; year--; }
  while (month >= 12) { month -= 12; year++; }
  let start = new Date(Date.UTC(year, month, 1));
  let end = new Date(Date.UTC(year, month+1, 0));
  return { start, end, year, month };
}

function getCurrentWeekRange(baseDate) {
  let now = baseDate || new Date();
  let year = now.getFullYear();
  let month = now.getMonth();
  let day = now.getDate();
  let today = new Date(Date.UTC(year, month, day));
  let weekDay = today.getUTCDay();
  let deltaToMonday = (weekDay === 0 ? -6 : 1 - weekDay);
  let monday = new Date(today);
  monday.setUTCDate(today.getUTCDate() + deltaToMonday);
  let sunday = new Date(monday);
  sunday.setUTCDate(monday.getUTCDate() + 6);
  return { start: monday, end: sunday };
}

function eachDateBetween(start, end) {
  let result = [];
  let current = new Date(start);
  while (current <= end) {
    result.push(current.toISOString().slice(0,10));
    current.setUTCDate(current.getUTCDate() + 1);
  }
  return result;
}

// ---------- 子命令实现 ----------
function cmdFree(ctx, msg, cmdArgs) {
  let rawArgs = cmdArgs.getRestArgsFrom(2);
  if (!rawArgs || rawArgs.trim() === '') {
    seal.replyToSender(ctx, msg, "请指定日期，例如：.ptplan 有空 6-1");
    return;
  }
  let args = rawArgs.trim().split(/\s+/);
  let groupId = ctx.group.groupId;
  let userId = ctx.player.userId;
  let data = getData();
  if (!data.groups[groupId]) data.groups[groupId] = { users: {} };
  if (!data.groups[groupId].users[userId]) data.groups[groupId].users[userId] = { dates: {} };
  let userDates = data.groups[groupId].users[userId].dates;
  let added = [];
  let skipped = [];
  let now = new Date();
  for (let arg of args) {
    let dateStr = parseDate(arg, now);
    if (!dateStr) {
      seal.replyToSender(ctx, msg, `日期格式错误：${arg}，应为 月-日 如 6-1`);
      return;
    }
    if (userDates[dateStr]) {
      skipped.push(dateStr);
    } else {
      userDates[dateStr] = true;
      added.push(dateStr);
    }
  }
  saveData(data);
  let reply = [];
  if (added.length) reply.push(`已登记空闲：${added.map(d => d.slice(5)).join(', ')}`);
  if (skipped.length) reply.push(`以下日期已存在，跳过：${skipped.map(d => d.slice(5)).join(', ')}`);
  seal.replyToSender(ctx, msg, reply.join('\n') || "没有有效日期可登记");
}

function cmdLeave(ctx, msg, cmdArgs) {
  let rawArgs = cmdArgs.getRestArgsFrom(2);
  if (!rawArgs || rawArgs.trim() === '') {
    seal.replyToSender(ctx, msg, "请指定要取消的日期，例如：.ptplan 请假 6-1");
    return;
  }
  let args = rawArgs.trim().split(/\s+/);
  let groupId = ctx.group.groupId;
  let userId = ctx.player.userId;
  let data = getData();
  let group = data.groups[groupId];
  if (!group || !group.users[userId]) {
    seal.replyToSender(ctx, msg, "你尚未登记任何空闲日期");
    return;
  }
  let userDates = group.users[userId].dates;
  let removed = [];
  let notFound = [];
  let now = new Date();
  for (let arg of args) {
    let dateStr = parseDate(arg, now);
    if (!dateStr) continue;
    if (userDates[dateStr]) {
      delete userDates[dateStr];
      removed.push(dateStr);
    } else {
      notFound.push(dateStr);
    }
  }
  saveData(data);
  let reply = [];
  if (removed.length) reply.push(`已取消登记：${removed.map(d => d.slice(5)).join(', ')}`);
  if (notFound.length) reply.push(`未找到：${notFound.map(d => d.slice(5)).join(', ')}`);
  seal.replyToSender(ctx, msg, reply.join('\n') || "未找到任何指定日期");
}

function cmdWeek(ctx, msg, cmdArgs) {
  let groupId = ctx.group.groupId;
  let userId = ctx.player.userId;
  let data = getData();
  let userDates = data.groups[groupId]?.users[userId]?.dates || {};
  let now = new Date();
  let { start, end } = getCurrentWeekRange(now);
  let weekDates = eachDateBetween(start, end);
  let freeDates = weekDates.filter(d => userDates[d]);
  if (freeDates.length === 0) {
    seal.replyToSender(ctx, msg, "本周暂无登记空闲日期");
  } else {
    let lines = freeDates.map(d => {
      let wd = getWeekday(d);
      let weekStr = ["周日","周一","周二","周三","周四","周五","周六"][wd];
      return `${d.slice(5)} (${weekStr})`;
    });
    seal.replyToSender(ctx, msg, `本周已登记：\n${lines.join('\n')}`);
  }
}

function cmdMonth(ctx, msg, cmdArgs) {
  let groupId = ctx.group.groupId;
  let userId = ctx.player.userId;
  let data = getData();
  let userDates = data.groups[groupId]?.users[userId]?.dates || {};
  let now = new Date();
  let { start, end } = getMonthRange(now, 0);
  let monthDates = eachDateBetween(start, end);
  let freeDates = monthDates.filter(d => userDates[d]);
  if (freeDates.length === 0) {
    seal.replyToSender(ctx, msg, "本月暂无登记空闲日期");
  } else {
    let lines = freeDates.map(d => {
      let wd = getWeekday(d);
      let weekStr = ["周日","周一","周二","周三","周四","周五","周六"][wd];
      return `${d.slice(5)} (${weekStr})`;
    });
    seal.replyToSender(ctx, msg, `本月已登记：\n${lines.join('\n')}`);
  }
}

function cmdNextMonth(ctx, msg, cmdArgs) {
  let groupId = ctx.group.groupId;
  let userId = ctx.player.userId;
  let data = getData();
  let userDates = data.groups[groupId]?.users[userId]?.dates || {};
  let now = new Date();
  let { start, end, year, month } = getMonthRange(now, 1);
  let monthDates = eachDateBetween(start, end);
  let freeDates = monthDates.filter(d => userDates[d]);
  let monthNames = ["一月","二月","三月","四月","五月","六月","七月","八月","九月","十月","十一月","十二月"];
  let displayMonth = `${year}年${monthNames[month]}`;
  if (freeDates.length === 0) {
    seal.replyToSender(ctx, msg, `${displayMonth}暂无登记空闲日期`);
  } else {
    let lines = freeDates.map(d => {
      let wd = getWeekday(d);
      let weekStr = ["周日","周一","周二","周三","周四","周五","周六"][wd];
      return `${d.slice(5)} (${weekStr})`;
    });
    seal.replyToSender(ctx, msg, `${displayMonth}已登记：\n${lines.join('\n')}`);
  }
}

function cmdCommon(ctx, msg, cmdArgs) {
  let groupId = ctx.group.groupId;
  let data = getData();
  let group = data.groups[groupId];
  if (!group || Object.keys(group.users).length === 0) {
    seal.replyToSender(ctx, msg, "本群暂无任何空闲登记");
    return;
  }
  
  let userNames = {};
  for (let uid in group.users) {
    userNames[uid] = uid.slice(-4);
  }
  
  let dateUsers = {};
  for (let uid in group.users) {
    let dates = Object.keys(group.users[uid].dates);
    for (let d of dates) {
      if (!dateUsers[d]) dateUsers[d] = [];
      dateUsers[d].push(uid);
    }
  }
  
  let dates = Object.keys(dateUsers);
  if (dates.length === 0) {
    seal.replyToSender(ctx, msg, "没有成员登记空闲日期");
    return;
  }
  
  dates.sort((a,b) => dateUsers[b].length - dateUsers[a].length);
  let totalUsers = Object.keys(group.users).length;
  let fullCommon = dates.filter(d => dateUsers[d].length === totalUsers);
  
  if (fullCommon.length > 0) {
    let lines = fullCommon.map(d => {
      let wd = getWeekday(d);
      let weekStr = ["周日","周一","周二","周三","周四","周五","周六"][wd];
      return `${d.slice(5)} (${weekStr}) - 全体${totalUsers}人`;
    });
    seal.replyToSender(ctx, msg, `【全体共同】\n${lines.join('\n')}`);
  } else {
    let topDates = dates.slice(0, 10);
    let lines = topDates.map(d => {
      let wd = getWeekday(d);
      let weekStr = ["周日","周一","周二","周三","周四","周五","周六"][wd];
      let count = dateUsers[d].length;
      let usersPreview = dateUsers[d].slice(0, 5).map(uid => userNames[uid]).join(',');
      if (dateUsers[d].length > 5) usersPreview += `等${count}人`;
      return `${d.slice(5)} (${weekStr}) - ${count}人：${usersPreview}`;
    });
    let msgText = `【无全体共同】\n以下为有成员空闲的日期（按人数排序）：\n${lines.join('\n')}`;
    if (dates.length > 10) msgText += `\n……共${dates.length}个日期，仅显示前10个`;
    seal.replyToSender(ctx, msg, msgText);
  }
}

function cmdMy(ctx, msg, cmdArgs) {
  let groupId = ctx.group.groupId;
  let userId = ctx.player.userId;
  let data = getData();
  let dates = Object.keys(data.groups[groupId]?.users[userId]?.dates || {}).sort();
  if (dates.length === 0) {
    seal.replyToSender(ctx, msg, "个人尚未登记任何空闲日期");
  } else {
    let lines = dates.map(d => {
      let wd = getWeekday(d);
      let weekStr = ["周日","周一","周二","周三","周四","周五","周六"][wd];
      return `${d.slice(5)} (${weekStr})`;
    });
    seal.replyToSender(ctx, msg, `个人已登记的全部空闲日期：\n${lines.join('\n')}`);
  }
}

function cmdClearRequest(ctx, msg, cmdArgs) {
  let userId = ctx.player.userId;
  let code = generateClearCode();
  let expireTime = Date.now() + 5 * 60 * 1000;
  clearRequests.set(userId, { code, expireTime });
  seal.replyToSender(ctx, msg, `清除验证码为：${code}\n请在5分钟内使用 .ptplan 清除 确认 ${code} 来清除个人在本群登记的所有空闲日期`);
}

function cmdClearConfirm(ctx, msg, cmdArgs) {
  let code = cmdArgs.getArgN(3);
  if (!code) {
    seal.replyToSender(ctx, msg, "请提供验证码，例如：.ptplan 清除 确认 123456");
    return;
  }
  let userId = ctx.player.userId;
  let request = clearRequests.get(userId);
  if (!request) {
    seal.replyToSender(ctx, msg, "没有正在进行的清除请求，请先使用 .ptplan 清除 请求 获取验证码");
    return;
  }
  if (Date.now() > request.expireTime) {
    clearRequests.delete(userId);
    seal.replyToSender(ctx, msg, "验证码已过期，请重新请求");
    return;
  }
  if (request.code !== code) {
    seal.replyToSender(ctx, msg, "验证码错误");
    return;
  }
  let groupId = ctx.group.groupId;
  let data = getData();
  if (data.groups[groupId] && data.groups[groupId].users[userId]) {
    delete data.groups[groupId].users[userId];
    saveData(data);
    seal.replyToSender(ctx, msg, "已清除个人在本群登记的所有空闲日期");
  } else {
    seal.replyToSender(ctx, msg, "本群没有登记任何个人空闲日期");
  }
  clearRequests.delete(userId);
}

function cmdHelp(ctx, msg, cmdArgs) {
  let helpText = `.ptplan 有空 月-日 [月-日……]      - 登记空闲日期
.ptplan 请假 月-日 [月-日……]      - 取消已登记日期
.ptplan 本周                       - 查看本周登记
.ptplan 本月                       - 查看本月登记
.ptplan 下月                       - 查看下个月登记
.ptplan 共同                       - 查看群共同空闲（若无共同则分别列出）
.ptplan 我的                       - 查看自己登记的所有空闲日期
.ptplan 清除 请求                   - 清除自己所有日期（获得验证码）
.ptplan 清除 确认 <验证码>          - 二次确认清除自己所有日期

所有日期以北京时间为准，若日期早于今天则视为明年`;
  seal.replyToSender(ctx, msg, helpText);
}

// ---------- 主命令分发 ----------
const cmdPtplan = seal.ext.newCmdItemInfo();
cmdPtplan.name = "ptplan";
cmdPtplan.help = "输入 .ptplan 帮助 查看详细用法";
cmdPtplan.solve = (ctx, msg, cmdArgs) => {
  let userId = msg.sender.userId;
  let now = Date.now();
  let lastNotify = userLastNotify.get(userId) || 0;
  if (now - lastNotify > 24 * 60 * 60 * 1000) {
    userLastNotify.set(userId, now);
    checkUpdateOnce(ctx, msg, userId).catch(console.error);
  }

  let sub = cmdArgs.getArgN(1);
  if (!sub || sub === '帮助') {
    cmdHelp(ctx, msg, cmdArgs);
  } else if (sub === '有空') {
    cmdFree(ctx, msg, cmdArgs);
  } else if (sub === '请假') {
    cmdLeave(ctx, msg, cmdArgs);
  } else if (sub === '本周') {
    cmdWeek(ctx, msg, cmdArgs);
  } else if (sub === '本月') {
    cmdMonth(ctx, msg, cmdArgs);
  } else if (sub === '下月') {
    cmdNextMonth(ctx, msg, cmdArgs);
  } else if (sub === '共同') {
    cmdCommon(ctx, msg, cmdArgs);
  } else if (sub === '我的') {
    cmdMy(ctx, msg, cmdArgs);
  } else if (sub === '清除') {
    let action = cmdArgs.getArgN(2);
    if (action === '请求') {
      cmdClearRequest(ctx, msg, cmdArgs);
    } else if (action === '确认') {
      cmdClearConfirm(ctx, msg, cmdArgs);
    } else {
      seal.replyToSender(ctx, msg, "请指定操作：请求 或 确认，例如 .ptplan 清除 请求");
    }
  } else {
    seal.replyToSender(ctx, msg, `未知命令“${sub}”，请输入 .ptplan 帮助 查看用法`);
  }
  return seal.ext.newCmdExecuteResult(true);
};

ext.cmdMap['ptplan'] = cmdPtplan;