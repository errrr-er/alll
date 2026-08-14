// ==UserScript==
// @name         跑团时间规划
// @author       3987681449
// @version      1.0.0
// @description  (.ptplan)有问题可进群2150284119联系
// @timestamp    1786712018
// 2026-05-30 15:20:42
// @license      Apache-2
// @homepageURL  https://github.com/errrr-er/alll/tree/main
// @updateUrl    
// ==/UserScript==

let ext = seal.ext.find('跑团时间规划');
if (!ext) {
  ext = seal.ext.new('跑团时间规划', 'er', '1.0.0');
  seal.ext.register(ext);
}

function getCurrentTimestamp() {
  return 1786712018;
}

const userLastNotify = new Map();
const clearRequests = new Map();

const WEEK_NAMES = [
  "周日",
  "周一",
  "周二",
  "周三",
  "周四",
  "周五",
  "周六"
];

// 更新检查
async function getGitHubVersion() {
  try {
    const rawUrl =
      'https://raw.githubusercontent.com/errrr-er/alll/refs/heads/main/dice_common/pt_plan/ptplan.js';

    const response = await fetch(rawUrl);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const content = await response.text();

    const timestampMatch = content.match(/@timestamp\s+(\d+)/);

    if (!timestampMatch) {
      return null;
    }

    const timestamp = parseInt(timestampMatch[1], 10);
    const date = new Date(timestamp * 1000);

    return {
      timestamp,
      date,
      formattedDate: date.toLocaleString('zh-CN')
    };
  } catch (error) {
    return null;
  }
}

async function checkUpdateOnce(ctx, msg, userId) {
  try {
    const remote = await getGitHubVersion();

    if (!remote) {
      return;
    }

    const current = getCurrentTimestamp();

    if (remote.timestamp > current) {
      setTimeout(() => {
        seal.replyToSender(
          ctx,
          msg,
          `发现<跑团时间规划>插件有新版本！\n最后更新：${remote.formattedDate}\n请及时更新`
        );
      }, 1000);
    }
  } catch (e) {}
}

// 数据存储
function getData() {
  let raw = ext.storageGet("ptplan_data");

  if (!raw) {
    return {
      groups: {}
    };
  }

  try {
    const data = JSON.parse(raw);

    if (!data.groups) {
      data.groups = {};
    }

    return data;
  } catch (e) {
    return {
      groups: {}
    };
  }
}

function saveData(data) {
  ext.storageSet(
    "ptplan_data",
    JSON.stringify(data)
  );
}

// 日期处理
function parseDate(input, nowDate) {
  if (!nowDate) {
    nowDate = new Date();
  }

  const parts = input.split('-');

  if (parts.length !== 2) {
    return null;
  }

  const month = parseInt(parts[0], 10);
  const day = parseInt(parts[1], 10);

  if (
    isNaN(month) ||
    isNaN(day) ||
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > 31
  ) {
    return null;
  }

  const year = nowDate.getFullYear();

  let candidate = new Date(
    Date.UTC(year, month - 1, day)
  );

  // 检查日期本身是否合法
  if (
    candidate.getUTCFullYear() !== year ||
    candidate.getUTCMonth() !== month - 1 ||
    candidate.getUTCDate() !== day
  ) {
    return null;
  }

  const todayUTC = new Date(
    Date.UTC(
      nowDate.getFullYear(),
      nowDate.getMonth(),
      nowDate.getDate()
    )
  );

  if (candidate < todayUTC) {
    candidate = new Date(
      Date.UTC(year + 1, month - 1, day)
    );
  }

  return candidate.toISOString().slice(0, 10);
}

function getWeekday(dateStr) {
  const parts = dateStr.split('-').map(Number);

  const date = new Date(
    Date.UTC(
      parts[0],
      parts[1] - 1,
      parts[2]
    )
  );

  return date.getUTCDay();
}

function formatDate(dateStr) {
  const wd = getWeekday(dateStr);

  return `${dateStr.slice(5)} (${WEEK_NAMES[wd]})`;
}

function getMonthRange(baseDate, offsetMonths = 0) {
  const now = baseDate || new Date();

  let year = now.getFullYear();
  let month = now.getMonth() + offsetMonths;

  while (month < 0) {
    month += 12;
    year--;
  }

  while (month >= 12) {
    month -= 12;
    year++;
  }

  const start = new Date(
    Date.UTC(year, month, 1)
  );

  const end = new Date(
    Date.UTC(year, month + 1, 0)
  );

  return {
    start,
    end,
    year,
    month
  };
}

function getCurrentWeekRange(baseDate) {
  const now = baseDate || new Date();

  const year = now.getFullYear();
  const month = now.getMonth();
  const day = now.getDate();

  const today = new Date(
    Date.UTC(year, month, day)
  );

  const weekDay = today.getUTCDay();

  const deltaToMonday =
    weekDay === 0
      ? -6
      : 1 - weekDay;

  const monday = new Date(today);

  monday.setUTCDate(
    today.getUTCDate() + deltaToMonday
  );

  const sunday = new Date(monday);

  sunday.setUTCDate(
    monday.getUTCDate() + 6
  );

  return {
    start: monday,
    end: sunday
  };
}

function eachDateBetween(start, end) {
  const result = [];

  const current = new Date(start);

  while (current <= end) {
    result.push(
      current.toISOString().slice(0, 10)
    );

    current.setUTCDate(
      current.getUTCDate() + 1
    );
  }

  return result;
}

function addDays(dateStr, days) {
  const parts = dateStr.split('-').map(Number);

  const date = new Date(
    Date.UTC(
      parts[0],
      parts[1] - 1,
      parts[2]
    )
  );

  date.setUTCDate(
    date.getUTCDate() + days
  );

  return date.toISOString().slice(0, 10);
}


// 时间处理
function parseTime(input) {
  const match = input.match(
    /^(\d{1,2}):(\d{2})-(\d{1,2}):(\d{2})$/
  );

  if (!match) {
    return null;
  }

  const startHour = parseInt(match[1], 10);
  const startMinute = parseInt(match[2], 10);

  const endHour = parseInt(match[3], 10);
  const endMinute = parseInt(match[4], 10);

  if (
    startHour < 0 ||
    startHour > 23 ||
    startMinute < 0 ||
    startMinute > 59 ||
    endHour < 0 ||
    endHour > 23 ||
    endMinute < 0 ||
    endMinute > 59
  ) {
    return null;
  }

  const start = startHour * 60 + startMinute;
  const end = endHour * 60 + endMinute;

  if (start === end) {
    return null;
  }

  return {
    start,
    end
  };
}

function formatMinute(minute) {
  if (minute === 1440) {
    return "24:00";
  }

  const hour = Math.floor(minute / 60);
  const min = minute % 60;

  return (
    String(hour).padStart(2, '0') +
    ':' +
    String(min).padStart(2, '0')
  );
}

function formatRange(start, end) {
  return `${formatMinute(start)}-${formatMinute(end)}`;
}


// 时间段标准化
function normalizeDateRanges(dateValue) {
  if (dateValue === true) {
    return [
      {
        start: 0,
        end: 1440
      }
    ];
  }

  if (!Array.isArray(dateValue)) {
    return [];
  }

  const result = [];

  for (const item of dateValue) {
    if (
      item &&
      typeof item.start === 'number' &&
      typeof item.end === 'number'
    ) {
      if (
        item.start >= 0 &&
        item.start < 1440 &&
        item.end > 0 &&
        item.end <= 1440 &&
        item.start < item.end
      ) {
        result.push({
          start: item.start,
          end: item.end
        });
      }
    }

    // 兼容 ["19:00", "22:00"] 格式
    else if (
      Array.isArray(item) &&
      item.length === 2
    ) {
      const start = parseTime(
        `${item[0]}-${item[1]}`
      );

      if (start) {
        if (start.start < start.end) {
          result.push(start);
        }
      }
    }
  }

  return mergeRanges(result);
}

function mergeRanges(ranges) {
  if (!ranges.length) {
    return [];
  }

  const sorted = [...ranges].sort(
    (a, b) => a.start - b.start
  );

  const result = [];

  for (const range of sorted) {
    if (!result.length) {
      result.push({
        start: range.start,
        end: range.end
      });

      continue;
    }

    const last =
      result[result.length - 1];

    if (range.start <= last.end) {
      last.end = Math.max(
        last.end,
        range.end
      );
    } else {
      result.push({
        start: range.start,
        end: range.end
      });
    }
  }

  return result;
}


// 跨午夜处理
function splitTimeRange(dateStr, timeRange) {
  if (timeRange.start < timeRange.end) {
    return [
      {
        date: dateStr,
        start: timeRange.start,
        end: timeRange.end
      }
    ];
  }

  return [
    {
      date: dateStr,
      start: timeRange.start,
      end: 1440
    },
    {
      date: addDays(dateStr, 1),
      start: 0,
      end: timeRange.end
    }
  ];
}


// 获取用户日期数据
function getUserDates(group, userId) {
  if (
    !group ||
    !group.users ||
    !group.users[userId]
  ) {
    return {};
  }

  return group.users[userId].dates || {};
}

function ensureUser(data, groupId, userId) {
  if (!data.groups[groupId]) {
    data.groups[groupId] = {
      users: {}
    };
  }

  if (!data.groups[groupId].users[userId]) {
    data.groups[groupId].users[userId] = {
      dates: {}
    };
  }

  if (
    !data.groups[groupId].users[userId].dates
  ) {
    data.groups[groupId].users[userId].dates = {};
  }

  return data.groups[groupId].users[userId];
}


// 解析“有空”参数
function parseFreeArguments(rawArgs, now) {
  const args = rawArgs.trim().split(/\s+/);

  if (!args.length) {
    return null;
  }

  const dateStr = parseDate(args[0], now);

  if (!dateStr) {
    return {
      error:
        `日期格式错误：${args[0]}，应为 月-日，如 6-1`
    };
  }

  const timeArgs = args.slice(1);

  // 没有时间 = 全天
  if (!timeArgs.length) {
    return {
      date: dateStr,
      ranges: [
        {
          start: 0,
          end: 1440
        }
      ]
    };
  }

  const ranges = [];

  for (const timeArg of timeArgs) {
    const parsed = parseTime(timeArg);

    if (!parsed) {
      return {
        error:
          `时间格式错误：${timeArg}，应为 HH:MM-HH:MM，例如 19:00-23:00`
      };
    }

    const split = splitTimeRange(
      dateStr,
      parsed
    );

    ranges.push(...split);
  }

  return {
    date: dateStr,
    ranges
  };
}


// 有空
function cmdFree(ctx, msg, cmdArgs) {
  const rawArgs =
    cmdArgs.getRestArgsFrom(2);

  if (
    !rawArgs ||
    rawArgs.trim() === ''
  ) {
    seal.replyToSender(
      ctx,
      msg,
      "请指定日期，例如：.ptplan 有空 6-1\n也可以指定时间：.ptplan 有空 6-1 19:00-23:00"
    );

    return;
  }

  const args =
    rawArgs.trim().split(/\s+/);

  const groupId =
    ctx.group.groupId;

  const userId =
    ctx.player.userId;

  const data = getData();

  const user =
    ensureUser(
      data,
      groupId,
      userId
    );

  const now = new Date();

  const dateStr =
    parseDate(args[0], now);

  if (!dateStr) {
    seal.replyToSender(
      ctx,
      msg,
      `日期格式错误：${args[0]}，应为 月-日，如 6-1`
    );

    return;
  }

  const timeArgs = args.slice(1);

  let ranges = [];

  // 全天
  if (!timeArgs.length) {
    ranges = [
      {
        start: 0,
        end: 1440
      }
    ];
  }

  // 指定时间
  else {
    for (const timeArg of timeArgs) {
      const parsed =
        parseTime(timeArg);

      if (!parsed) {
        seal.replyToSender(
          ctx,
          msg,
          `时间格式错误：${timeArg}，应为 HH:MM-HH:MM，例如 19:00-23:00`
        );

        return;
      }

      ranges.push(
        ...splitTimeRange(
          dateStr,
          parsed
        )
      );
    }
  }

  // 将跨午夜产生的第二天数据一起写入
  const added = [];
  const skipped = [];

  for (const range of ranges) {
    if (!user.dates[range.date]) {
      user.dates[range.date] = [];
    }

    const existing =
      normalizeDateRanges(
        user.dates[range.date]
      );

    const duplicate =
      existing.some(
        r =>
          r.start === range.start &&
          r.end === range.end
      );

    if (duplicate) {
      skipped.push(range);
      continue;
    }

    existing.push({
      start: range.start,
      end: range.end
    });

    user.dates[range.date] =
      mergeRanges(existing);

    added.push(range);
  }

  saveData(data);

  const lines = [];

  if (added.length) {
    lines.push(
      `已登记空闲：\n${formatRangesByDate(added)}`
    );
  }

  if (skipped.length) {
    lines.push(
      `以下时间段已存在，跳过：\n${formatRangesByDate(skipped)}`
    );
  }

  seal.replyToSender(
    ctx,
    msg,
    lines.join('\n')
  );
}


// 格式化多个日期时间
function formatRangesByDate(ranges) {
  const grouped = {};

  for (const range of ranges) {
    if (!grouped[range.date]) {
      grouped[range.date] = [];
    }

    grouped[range.date].push(range);
  }

  const dates =
    Object.keys(grouped).sort();

  return dates
    .map(date => {
      const rangeText =
        grouped[date]
          .map(
            r =>
              r.start === 0 &&
              r.end === 1440
                ? "全天"
                : formatRange(
                    r.start,
                    r.end
                  )
          )
          .join(', ');

      return `${formatDate(date)}：${rangeText}`;
    })
    .join('\n');
}


// 请假
function cmdLeave(ctx, msg, cmdArgs) {
  const rawArgs =
    cmdArgs.getRestArgsFrom(2);

  if (
    !rawArgs ||
    rawArgs.trim() === ''
  ) {
    seal.replyToSender(
      ctx,
      msg,
      "请指定日期，例如：.ptplan 请假 6-1\n也可以指定时间：.ptplan 请假 6-1 20:00-22:00"
    );

    return;
  }

  const args =
    rawArgs.trim().split(/\s+/);

  const groupId =
    ctx.group.groupId;

  const userId =
    ctx.player.userId;

  const data = getData();

  const group =
    data.groups[groupId];

  if (
    !group ||
    !group.users ||
    !group.users[userId]
  ) {
    seal.replyToSender(
      ctx,
      msg,
      "你尚未登记任何空闲日期"
    );

    return;
  }

  const user =
    group.users[userId];

  const now = new Date();

  const dateStr =
    parseDate(args[0], now);

  if (!dateStr) {
    seal.replyToSender(
      ctx,
      msg,
      `日期格式错误：${args[0]}`
    );

    return;
  }

  // 不指定时间 = 删除整天
  if (args.length === 1) {
    if (user.dates[dateStr]) {
      delete user.dates[dateStr];

      saveData(data);

      seal.replyToSender(
        ctx,
        msg,
        `已取消 ${formatDate(dateStr)} 的全部空闲时间`
      );
    } else {
      seal.replyToSender(
        ctx,
        msg,
        `未找到 ${formatDate(dateStr)} 的登记`
      );
    }

    return;
  }

  const ranges =
    normalizeDateRanges(
      user.dates[dateStr]
    );

  if (!ranges.length) {
    seal.replyToSender(
      ctx,
      msg,
      `未找到 ${formatDate(dateStr)} 的登记`
    );

    return;
  }

  const removeRanges = [];

  for (const timeArg of args.slice(1)) {
    const parsed =
      parseTime(timeArg);

    if (!parsed) {
      seal.replyToSender(
        ctx,
        msg,
        `时间格式错误：${timeArg}，应为 HH:MM-HH:MM`
      );

      return;
    }

    removeRanges.push(parsed);
  }

  let current =
    normalizeDateRanges(
      user.dates[dateStr]
    );

  const removed = [];

  for (const remove of removeRanges) {
    const next = [];

    for (const existing of current) {
      // 完全没有重叠
      if (
        remove.end <= existing.start ||
        remove.start >= existing.end
      ) {
        next.push(existing);
        continue;
      }

      removed.push({
        date: dateStr,
        start: Math.max(
          existing.start,
          remove.start
        ),
        end: Math.min(
          existing.end,
          remove.end
        )
      });

      // 左边剩余
      if (existing.start < remove.start) {
        next.push({
          start: existing.start,
          end: remove.start
        });
      }

      // 右边剩余
      if (existing.end > remove.end) {
        next.push({
          start: remove.end,
          end: existing.end
        });
      }
    }

    current =
      mergeRanges(next);
  }

  if (current.length) {
    user.dates[dateStr] = current;
  } else {
    delete user.dates[dateStr];
  }

  saveData(data);

  if (removed.length) {
    seal.replyToSender(
      ctx,
      msg,
      `已取消：\n${formatRangesByDate(removed)}`
    );
  } else {
    seal.replyToSender(
      ctx,
      msg,
      "没有找到对应的空闲时间段"
    );
  }
}


// 个人查看
function cmdMy(ctx, msg, cmdArgs) {
  const groupId =
    ctx.group.groupId;

  const userId =
    ctx.player.userId;

  const data = getData();

  const group =
    data.groups[groupId];

  if (
    !group ||
    !group.users ||
    !group.users[userId]
  ) {
    seal.replyToSender(
      ctx,
      msg,
      "个人尚未登记任何空闲日期"
    );

    return;
  }

  const dates =
    Object.keys(
      group.users[userId].dates || {}
    ).sort();

  if (!dates.length) {
    seal.replyToSender(
      ctx,
      msg,
      "个人尚未登记任何空闲日期"
    );

    return;
  }

  const lines = [];

  for (const date of dates) {
    const ranges =
      normalizeDateRanges(
        group.users[userId].dates[date]
      );

    const text =
      ranges
        .map(r => {
          if (
            r.start === 0 &&
            r.end === 1440
          ) {
            return "全天";
          }

          return formatRange(
            r.start,
            r.end
          );
        })
        .join(', ');

    lines.push(
      `${formatDate(date)}：${text}`
    );
  }

  seal.replyToSender(
    ctx,
    msg,
    `个人已登记的全部空闲时间：\n${lines.join('\n')}`
  );
}


// 周、月查看
function showDateRangeList(
  ctx,
  msg,
  mode
) {
  const groupId =
    ctx.group.groupId;

  const userId =
    ctx.player.userId;

  const data = getData();

  const dates =
    getUserDates(
      data.groups[groupId],
      userId
    );

  const now = new Date();

  let start;
  let end;
  let title;

  if (mode === 'week') {
    const range =
      getCurrentWeekRange(now);

    start = range.start;
    end = range.end;

    title = "本周";
  }

  else if (mode === 'month') {
    const range =
      getMonthRange(now, 0);

    start = range.start;
    end = range.end;

    title = "本月";
  }

  else {
    const range =
      getMonthRange(now, 1);

    start = range.start;
    end = range.end;

    title =
      `${range.year}年${range.month + 1}月`;
  }

  const dateList =
    eachDateBetween(start, end);

  const lines = [];

  for (const date of dateList) {
    if (!dates[date]) {
      continue;
    }

    const ranges =
      normalizeDateRanges(
        dates[date]
      );

    if (!ranges.length) {
      continue;
    }

    const text =
      ranges
        .map(r => {
          if (
            r.start === 0 &&
            r.end === 1440
          ) {
            return "全天";
          }

          return formatRange(
            r.start,
            r.end
          );
        })
        .join(', ');

    lines.push(
      `${formatDate(date)}：${text}`
    );
  }

  if (!lines.length) {
    seal.replyToSender(
      ctx,
      msg,
      `${title}暂无登记空闲时间`
    );

    return;
  }

  seal.replyToSender(
    ctx,
    msg,
    `${title}已登记：\n${lines.join('\n')}`
  );
}

function cmdWeek(ctx, msg, cmdArgs) {
  showDateRangeList(
    ctx,
    msg,
    'week'
  );
}

function cmdMonth(ctx, msg, cmdArgs) {
  showDateRangeList(
    ctx,
    msg,
    'month'
  );
}

function cmdNextMonth(ctx, msg, cmdArgs) {
  showDateRangeList(
    ctx,
    msg,
    'nextMonth'
  );
}


// 共同时间计算
function intersectRanges(rangeLists) {
  if (!rangeLists.length) {
    return [];
  }

  let result =
    normalizeDateRanges(
      rangeLists[0]
    );

  for (let i = 1; i < rangeLists.length; i++) {
    const current =
      normalizeDateRanges(
        rangeLists[i]
      );

    const next = [];

    for (const a of result) {
      for (const b of current) {
        const start =
          Math.max(
            a.start,
            b.start
          );

        const end =
          Math.min(
            a.end,
            b.end
          );

        if (start < end) {
          next.push({
            start,
            end
          });
        }
      }
    }

    result =
      mergeRanges(next);

    if (!result.length) {
      break;
    }
  }

  return result;
}


// 共同时间
function cmdCommon(ctx, msg, cmdArgs) {
  const groupId =
    ctx.group.groupId;

  const data = getData();

  const group =
    data.groups[groupId];

  if (
    !group ||
    !group.users ||
    Object.keys(group.users).length === 0
  ) {
    seal.replyToSender(
      ctx,
      msg,
      "本群暂无任何空闲登记"
    );

    return;
  }

  const userIds =
    Object.keys(group.users);

  const totalUsers =
    userIds.length;

  const dateMap = {};

  for (const userId of userIds) {
    const dates =
      group.users[userId].dates || {};

    for (const date of Object.keys(dates)) {
      const ranges =
        normalizeDateRanges(
          dates[date]
        );

      if (!ranges.length) {
        continue;
      }

      if (!dateMap[date]) {
        dateMap[date] = [];
      }

      dateMap[date].push({
        userId,
        ranges
      });
    }
  }

  const dates =
    Object.keys(dateMap).sort();

  if (!dates.length) {
    seal.replyToSender(
      ctx,
      msg,
      "没有成员登记空闲日期"
    );

    return;
  }


  // 第一优先级：寻找全体共同时间
  const fullCommon = [];

  for (const date of dates) {
    const entries =
      dateMap[date];

    if (entries.length !== totalUsers) {
      continue;
    }

    const rangeLists =
      entries.map(
        e => e.ranges
      );

    const common =
      intersectRanges(
        rangeLists
      );

    for (const range of common) {
      fullCommon.push({
        date,
        start: range.start,
        end: range.end,
        count: totalUsers,
        userIds
      });
    }
  }

  if (fullCommon.length) {
    const lines =
      fullCommon.map(item => {
        const time =
          item.start === 0 &&
          item.end === 1440
            ? "全天"
            : formatRange(
                item.start,
                item.end
              );

        return `${formatDate(item.date)} ${time} - 全体${totalUsers}人`;
      });

    seal.replyToSender(
      ctx,
      msg,
      `【全体共同时间】\n${lines.join('\n')}`
    );

    return;
  }

  // 没有全体共同时间
  // 计算每个日期最多能同时参加的人数
  const partialResults = [];

  for (const date of dates) {
    const entries =
      dateMap[date];

    const events = [];

    for (const entry of entries) {
      for (const range of entry.ranges) {
        events.push({
          time: range.start,
          delta: 1,
          userId: entry.userId
        });

        events.push({
          time: range.end,
          delta: -1,
          userId: entry.userId
        });
      }
    }

    events.sort((a, b) => {
      if (a.time !== b.time) {
        return a.time - b.time;
      }

      return a.delta - b.delta;
    });

    let count = 0;
    let lastTime = null;
    let maxCount = 0;
    const segments = [];

    for (const event of events) {
      if (
        lastTime !== null &&
        lastTime < event.time &&
        count > 0
      ) {
        segments.push({
          start: lastTime,
          end: event.time,
          count
        });

        maxCount =
          Math.max(
            maxCount,
            count
          );
      }

      count += event.delta;
      lastTime = event.time;
    }

    const bestSegments =
      segments.filter(
        s => s.count === maxCount
      );

    if (maxCount > 0) {
      for (const segment of bestSegments) {
        partialResults.push({
          date,
          start: segment.start,
          end: segment.end,
          count: segment.count
        });
      }
    }
  }

  partialResults.sort((a, b) => {
    if (b.count !== a.count) {
      return b.count - a.count;
    }

    if (a.date !== b.date) {
      return a.date.localeCompare(b.date);
    }

    return a.start - b.start;
  });

  if (!partialResults.length) {
    seal.replyToSender(
      ctx,
      msg,
      "没有找到任何共同空闲时间"
    );

    return;
  }

  const top =
    partialResults.slice(0, 20);

  const lines =
    top.map(item => {
      const time =
        item.start === 0 &&
        item.end === 1440
          ? "全天"
          : formatRange(
              item.start,
              item.end
            );

      return `${formatDate(item.date)} ${time} - ${item.count}人`;
    });

  let result =
    `【无全体共同时间】\n按最多同时空闲人数排列：\n${lines.join('\n')}`;

  if (partialResults.length > 20) {
    result +=
      `\n……共${partialResults.length}个时间段，仅显示前20个`;
  }

  seal.replyToSender(
    ctx,
    msg,
    result
  );
}


// 清除
function generateClearCode() {
  return Math.floor(
    100000 +
    Math.random() * 900000
  ).toString();
}

function cmdClearRequest(
  ctx,
  msg,
  cmdArgs
) {
  const userId =
    ctx.player.userId;

  const code =
    generateClearCode();

  const expireTime =
    Date.now() +
    5 * 60 * 1000;

  clearRequests.set(
    userId,
    {
      code,
      expireTime
    }
  );

  seal.replyToSender(
    ctx,
    msg,
    `清除验证码为：${code}\n请在5分钟内使用 .ptplan 清除 确认 ${code} 来清除个人在本群登记的所有空闲时间`
  );
}

function cmdClearConfirm(
  ctx,
  msg,
  cmdArgs
) {
  const code =
    cmdArgs.getArgN(3);

  if (!code) {
    seal.replyToSender(
      ctx,
      msg,
      "请提供验证码，例如：.ptplan 清除 确认 123456"
    );

    return;
  }

  const userId =
    ctx.player.userId;

  const request =
    clearRequests.get(userId);

  if (!request) {
    seal.replyToSender(
      ctx,
      msg,
      "没有正在进行的清除请求，请先使用 .ptplan 清除 请求 获取验证码"
    );

    return;
  }

  if (
    Date.now() >
    request.expireTime
  ) {
    clearRequests.delete(userId);

    seal.replyToSender(
      ctx,
      msg,
      "验证码已过期，请重新请求"
    );

    return;
  }

  if (request.code !== code) {
    seal.replyToSender(
      ctx,
      msg,
      "验证码错误"
    );

    return;
  }

  const groupId =
    ctx.group.groupId;

  const data = getData();

  if (
    data.groups[groupId] &&
    data.groups[groupId].users &&
    data.groups[groupId].users[userId]
  ) {
    delete data.groups[groupId].users[userId];

    saveData(data);

    seal.replyToSender(
      ctx,
      msg,
      "已清除个人在本群登记的所有空闲时间"
    );
  } else {
    seal.replyToSender(
      ctx,
      msg,
      "本群没有登记任何个人空闲时间"
    );
  }

  clearRequests.delete(userId);
}


// 帮助
function cmdHelp(
  ctx,
  msg,
  cmdArgs
) {
  const helpText = `.ptplan 有空 月-日
.ptplan 有空 月-日 时间段
（例）.ptplan 有空 6-1 22:00-01:00
（例）.ptplan 有空 6-1 14:00-17:00 20:00-23:00
.ptplan 请假 月-日
.ptplan 请假 月-日 时间段
（例）.ptplan 请假 6-1 20:00-22:00
.ptplan 本周
.ptplan 本月
.ptplan 下月
.ptplan 我的
.ptplan 共同
.ptplan 清除 请求
.ptplan 清除 确认 <验证码>`.trim();

  seal.replyToSender(
    ctx,
    msg,
    helpText
  );
}


// 主命令
const cmdPtplan =
  seal.ext.newCmdItemInfo();

cmdPtplan.name = "ptplan";

cmdPtplan.help =
  "输入 .ptplan 帮助 查看详细用法";

cmdPtplan.solve =
  (ctx, msg, cmdArgs) => {
    const userId =
      msg.sender.userId;

    const now = Date.now();

    const lastNotify =
      userLastNotify.get(userId) || 0;

    if (
      now - lastNotify >
      24 * 60 * 60 * 1000
    ) {
      userLastNotify.set(
        userId,
        now
      );

      checkUpdateOnce(
        ctx,
        msg,
        userId
      ).catch(() => {});
    }

    const sub =
      cmdArgs.getArgN(1);

    if (
      !sub ||
      sub === '帮助'
    ) {
      cmdHelp(
        ctx,
        msg,
        cmdArgs
      );
    }

    else if (sub === '有空') {
      cmdFree(
        ctx,
        msg,
        cmdArgs
      );
    }

    else if (sub === '请假') {
      cmdLeave(
        ctx,
        msg,
        cmdArgs
      );
    }

    else if (sub === '本周') {
      cmdWeek(
        ctx,
        msg,
        cmdArgs
      );
    }

    else if (sub === '本月') {
      cmdMonth(
        ctx,
        msg,
        cmdArgs
      );
    }

    else if (sub === '下月') {
      cmdNextMonth(
        ctx,
        msg,
        cmdArgs
      );
    }

    else if (sub === '共同') {
      cmdCommon(
        ctx,
        msg,
        cmdArgs
      );
    }

    else if (sub === '我的') {
      cmdMy(
        ctx,
        msg,
        cmdArgs
      );
    }

    else if (sub === '清除') {
      const action =
        cmdArgs.getArgN(2);

      if (action === '请求') {
        cmdClearRequest(
          ctx,
          msg,
          cmdArgs
        );
      }

      else if (action === '确认') {
        cmdClearConfirm(
          ctx,
          msg,
          cmdArgs
        );
      }

      else {
        seal.replyToSender(
          ctx,
          msg,
          "请指定操作：请求 或 确认，例如 .ptplan 清除 请求"
        );
      }
    }

    else {
      seal.replyToSender(
        ctx,
        msg,
        `未知命令“${sub}”，请输入 .ptplan 帮助 查看用法`
      );
    }

    return seal.ext.newCmdExecuteResult(
      true
    );
  };

ext.cmdMap['ptplan'] = cmdPtplan;