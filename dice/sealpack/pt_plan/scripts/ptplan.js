// ==UserScript==
// @name         跑团时间规划
// @author       3987681449
// @version      1.0.0
// @description  (.ptplan)有问题可进群2150284119联系
// @timestamp    2026-05-30 15:20:42
// @license      Apache-2
// @homepageURL  https://jihulab.com/luj13014/alll
// @updateUrl    https://jihulab.com/luj13014/alll/-/raw/main/dice/sealpack/pt_plan/scripts/ptplan.js?ref_type=heads
// ==/UserScript==

let ext = seal.ext.find('跑团时间规划');
if (!ext) {
  ext = seal.ext.new('跑团时间规划', 'er', '1.0.0');
  seal.ext.register(ext);
}

const WEEK_NAMES = [
  "周日",
  "周一",
  "周二",
  "周三",
  "周四",
  "周五",
  "周六"
];

// 数据存储
function getData() {
  let raw =
    ext.storageGet("ptplan_data");

  if (!raw) {
    return {
      groups: {}
    };
  }

  try {
    const data =
      JSON.parse(raw);

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

  const parts =
    input.split('-');

  if (parts.length !== 2) {
    return null;
  }

  const month =
    parseInt(parts[0], 10);

  const day =
    parseInt(parts[1], 10);

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

  const year =
    nowDate.getFullYear();

  let candidate =
    new Date(
      Date.UTC(
        year,
        month - 1,
        day
      )
    );

  // 检查日期本身是否合法
  if (
    candidate.getUTCFullYear() !== year ||
    candidate.getUTCMonth() !== month - 1 ||
    candidate.getUTCDate() !== day
  ) {
    return null;
  }

  const todayUTC =
    new Date(
      Date.UTC(
        nowDate.getFullYear(),
        nowDate.getMonth(),
        nowDate.getDate()
      )
    );

  if (candidate < todayUTC) {
    candidate =
      new Date(
        Date.UTC(
          year + 1,
          month - 1,
          day
        )
      );
  }

  return candidate
    .toISOString()
    .slice(0, 10);
}

// 判断是否为单个日期，例如 6-1
function isDateToken(input) {
  return /^\d{1,2}-\d{1,2}$/.test(input);
}

// 判断是否为日期范围，例如 6-1~6-7
function isDateRangeToken(input) {
  return /^\d{1,2}-\d{1,2}[~～]\d{1,2}-\d{1,2}$/.test(input);
}

// 解析日期范围
function parseDateRange(input, nowDate) {
  if (!nowDate) {
    nowDate = new Date();
  }

  input =
    input.replace('～', '~');

  const parts =
    input.split('~');

  if (parts.length !== 2) {
    return null;
  }

  const start =
    parseDate(parts[0], nowDate);

  const end =
    parseDate(parts[1], nowDate);

  if (!start || !end) {
    return null;
  }

  const startDate =
    new Date(
      start + 'T00:00:00Z'
    );

  const endDate =
    new Date(
      end + 'T00:00:00Z'
    );

  if (startDate > endDate) {
    return null;
  }

  return {
    start,
    end
  };
}

// 展开两个日期之间的所有日期
function eachDateStringBetween(
  startStr,
  endStr
) {
  const result = [];

  const current =
    new Date(
      startStr + 'T00:00:00Z'
    );

  const end =
    new Date(
      endStr + 'T00:00:00Z'
    );

  while (current <= end) {
    result.push(
      current
        .toISOString()
        .slice(0, 10)
    );

    current.setUTCDate(
      current.getUTCDate() + 1
    );
  }

  return result;
}

// 解析一个日期参数，并展开成日期列表
function parseDateToken(
  input,
  nowDate
) {
  if (isDateToken(input)) {
    const date =
      parseDate(input, nowDate);

    if (!date) {
      return null;
    }

    return [date];
  }

  if (isDateRangeToken(input)) {
    const range =
      parseDateRange(
        input,
        nowDate
      );

    if (!range) {
      return null;
    }

    return eachDateStringBetween(
      range.start,
      range.end
    );
  }

  return null;
}

function getWeekday(dateStr) {
  const parts =
    dateStr
      .split('-')
      .map(Number);

  const date =
    new Date(
      Date.UTC(
        parts[0],
        parts[1] - 1,
        parts[2]
      )
    );

  return date.getUTCDay();
}

function formatDate(dateStr) {
  const wd =
    getWeekday(dateStr);

  return `${dateStr.slice(5)} (${WEEK_NAMES[wd]})`;
}

function getMonthRange(
  baseDate,
  offsetMonths = 0
) {
  const now =
    baseDate || new Date();

  let year =
    now.getFullYear();

  let month =
    now.getMonth() + offsetMonths;

  while (month < 0) {
    month += 12;
    year--;
  }

  while (month >= 12) {
    month -= 12;
    year++;
  }

  const start =
    new Date(
      Date.UTC(
        year,
        month,
        1
      )
    );

  const end =
    new Date(
      Date.UTC(
        year,
        month + 1,
        0
      )
    );

  return {
    start,
    end,
    year,
    month
  };
}

function getCurrentWeekRange(baseDate) {
  const now =
    baseDate || new Date();

  const year =
    now.getFullYear();

  const month =
    now.getMonth();

  const day =
    now.getDate();

  const today =
    new Date(
      Date.UTC(
        year,
        month,
        day
      )
    );

  const weekDay =
    today.getUTCDay();

  const deltaToMonday =
    weekDay === 0
      ? -6
      : 1 - weekDay;

  const monday =
    new Date(today);

  monday.setUTCDate(
    today.getUTCDate() +
    deltaToMonday
  );

  const sunday =
    new Date(monday);

  sunday.setUTCDate(
    monday.getUTCDate() + 6
  );

  return {
    start: monday,
    end: sunday
  };
}

function eachDateBetween(
  start,
  end
) {
  const result = [];

  const current =
    new Date(start);

  while (current <= end) {
    result.push(
      current
        .toISOString()
        .slice(0, 10)
    );

    current.setUTCDate(
      current.getUTCDate() + 1
    );
  }

  return result;
}

function addDays(
  dateStr,
  days
) {
  const parts =
    dateStr
      .split('-')
      .map(Number);

  const date =
    new Date(
      Date.UTC(
        parts[0],
        parts[1] - 1,
        parts[2]
      )
    );

  date.setUTCDate(
    date.getUTCDate() + days
  );

  return date
    .toISOString()
    .slice(0, 10);
}

// 时间处理
function parseTime(input) {
  const match =
    input.match(
      /^(\d{1,2}):(\d{2})-(\d{1,2}):(\d{2})$/
    );

  if (!match) {
    return null;
  }

  const startHour =
    parseInt(match[1], 10);

  const startMinute =
    parseInt(match[2], 10);

  const endHour =
    parseInt(match[3], 10);

  const endMinute =
    parseInt(match[4], 10);

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

  const start =
    startHour * 60 +
    startMinute;

  const end =
    endHour * 60 +
    endMinute;

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

  const hour =
    Math.floor(minute / 60);

  const min =
    minute % 60;

  return (
    String(hour).padStart(2, '0') +
    ':' +
    String(min).padStart(2, '0')
  );
}

function formatRange(
  start,
  end
) {
  return `${formatMinute(start)}-${formatMinute(end)}`;
}

// 时间段标准化
function normalizeDateRanges(
  dateValue
) {
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

    else if (
      Array.isArray(item) &&
      item.length === 2
    ) {
      const start =
        parseTime(
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

  const sorted =
    [...ranges].sort(
      (a, b) =>
        a.start - b.start
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
      last.end =
        Math.max(
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
function splitTimeRange(
  dateStr,
  timeRange
) {
  if (
    timeRange.start <
    timeRange.end
  ) {
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
      date: addDays(
        dateStr,
        1
      ),
      start: 0,
      end: timeRange.end
    }
  ];
}

// 获取用户日期数据
function getUserDates(
  group,
  userId
) {
  if (
    !group ||
    !group.users ||
    !group.users[userId]
  ) {
    return {};
  }

  return (
    group.users[userId].dates ||
    {}
  );
}

function ensureUser(
  data,
  groupId,
  userId
) {
  if (!data.groups[groupId]) {
    data.groups[groupId] = {
      users: {}
    };
  }

  if (
    !data.groups[groupId]
      .users[userId]
  ) {
    data.groups[groupId]
      .users[userId] = {
      dates: {}
    };
  }

  if (
    !data.groups[groupId]
      .users[userId]
      .dates
  ) {
    data.groups[groupId]
      .users[userId]
      .dates = {};
  }

  return data.groups[groupId]
    .users[userId];
}

// 解析“日期... 时间...”参数
function parseDateAndTimeArguments(
  rawArgs,
  nowDate
) {
  const args =
    rawArgs
      .trim()
      .split(/\s+/);

  if (!args.length) {
    return {
      error: "没有提供参数"
    };
  }

  const dates = [];
  const timeRanges = [];

  let readingDates = true;

  for (const arg of args) {
    // 时间段，例如 22:00-01:00
    if (arg.includes(':')) {
      readingDates = false;

      const parsed =
        parseTime(arg);

      if (!parsed) {
        return {
          error:
            `时间格式错误：${arg}，应为 HH:MM-HH:MM，例如 19:00-23:00`
        };
      }

      timeRanges.push(parsed);

      continue;
    }

    // 时间开始后不能再出现日期
    if (!readingDates) {
      return {
        error:
          `参数顺序错误：${arg}。请先写完所有日期，再写时间段`
      };
    }

    const parsedDates =
      parseDateToken(
        arg,
        nowDate
      );

    if (!parsedDates) {
      return {
        error:
          `日期格式错误：${arg}，应为 6-1、6-1~6-7 等格式`
      };
    }

    dates.push(...parsedDates);
  }

  if (!dates.length) {
    return {
      error:
        "请至少提供一个日期，例如 6-1 或 6-1~6-7"
    };
  }

  const uniqueDates =
    [...new Set(dates)].sort();

  // 不写时间 = 全天
  if (!timeRanges.length) {
    timeRanges.push({
      start: 0,
      end: 1440
    });
  }

  return {
    dates: uniqueDates,
    timeRanges
  };
}

// 有空
function cmdFree(
  ctx,
  msg,
  cmdArgs
) {
  const rawArgs =
    cmdArgs.getRestArgsFrom(2);

  if (
    !rawArgs ||
    rawArgs.trim() === ''
  ) {
    seal.replyToSender(
      ctx,
      msg,
      "请指定日期，例如：\n" +
      ".ptplan 有空 6-1\n" +
      ".ptplan 有空 6-1 6-7 22:00-01:00\n" +
      ".ptplan 有空 6-1~6-7 14:00-17:00 20:00-23:00"
    );

    return;
  }

  const now =
    new Date();

  const parsed =
    parseDateAndTimeArguments(
      rawArgs,
      now
    );

  if (parsed.error) {
    seal.replyToSender(
      ctx,
      msg,
      parsed.error
    );

    return;
  }

  const groupId =
    ctx.group.groupId;

  const userId =
    ctx.player.userId;

  const data =
    getData();

  const user =
    ensureUser(
      data,
      groupId,
      userId
    );

  const added = [];
  const skipped = [];

  for (
    const date of parsed.dates
  ) {
    for (
      const timeRange of parsed.timeRanges
    ) {
      const ranges =
        splitTimeRange(
          date,
          timeRange
        );

      for (
        const range of ranges
      ) {
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
    }
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
    lines.join('\n') ||
    "没有有效日期可登记"
  );
}

// 格式化多个日期时间
function formatRangesByDate(
  ranges
) {
  const grouped = {};

  for (const range of ranges) {
    if (!grouped[range.date]) {
      grouped[range.date] = [];
    }

    grouped[range.date].push(range);
  }

  const dates =
    Object.keys(grouped)
      .sort();

  return dates
    .map(date => {
      const rangeText =
        grouped[date]
          .map(r =>
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
function cmdLeave(
  ctx,
  msg,
  cmdArgs
) {
  const rawArgs =
    cmdArgs.getRestArgsFrom(2);

  if (
    !rawArgs ||
    rawArgs.trim() === ''
  ) {
    seal.replyToSender(
      ctx,
      msg,
      "请指定日期，例如：\n" +
      ".ptplan 请假 6-1\n" +
      ".ptplan 请假 6-1 6-7 22:00-01:00\n" +
      ".ptplan 请假 6-1~6-7 14:00-17:00"
    );

    return;
  }

  const now =
    new Date();

  const parsed =
    parseDateAndTimeArguments(
      rawArgs,
      now
    );

  if (parsed.error) {
    seal.replyToSender(
      ctx,
      msg,
      parsed.error
    );

    return;
  }

  const groupId =
    ctx.group.groupId;

  const userId =
    ctx.player.userId;

  const data =
    getData();

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
      "你尚未登记任何空闲时间"
    );

    return;
  }

  const user =
    group.users[userId];

  const removed = [];

  for (
    const date of parsed.dates
  ) {
    // 没有登记这一天
    if (!user.dates[date]) {
      continue;
    }

    const current =
      normalizeDateRanges(
        user.dates[date]
      );

    // 有日期，但没有有效时间
    if (!current.length) {
      continue;
    }

    let remaining =
      current;

    for (
      const remove of parsed.timeRanges
    ) {
      const next = [];

      for (
        const existing of remaining
      ) {
        // 完全没有重叠
        if (
          remove.end <=
            existing.start ||
          remove.start >=
            existing.end
        ) {
          next.push(existing);
          continue;
        }

        // 记录实际被删除部分
        removed.push({
          date,
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
        if (
          existing.start <
          remove.start
        ) {
          next.push({
            start:
              existing.start,
            end:
              remove.start
          });
        }

        // 右边剩余
        if (
          existing.end >
          remove.end
        ) {
          next.push({
            start:
              remove.end,
            end:
              existing.end
          });
        }
      }

      remaining =
        mergeRanges(next);
    }

    if (remaining.length) {
      user.dates[date] =
        remaining;
    } else {
      delete user.dates[date];
    }
  }

  saveData(data);

  if (!removed.length) {
    seal.replyToSender(
      ctx,
      msg,
      "没有找到对应的空闲时间段"
    );

    return;
  }

  seal.replyToSender(
    ctx,
    msg,
    `已取消：\n${formatRangesByDate(removed)}`
  );
}

// 个人查看
function cmdMy(
  ctx,
  msg,
  cmdArgs
) {
  const groupId =
    ctx.group.groupId;

  const userId =
    ctx.player.userId;

  const data =
    getData();

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
      group.users[userId]
        .dates || {}
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

  for (
    const date of dates
  ) {
    const ranges =
      normalizeDateRanges(
        group.users[userId]
          .dates[date]
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

  const data =
    getData();

  const dates =
    getUserDates(
      data.groups[groupId],
      userId
    );

  const now =
    new Date();

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
    eachDateBetween(
      start,
      end
    );

  const lines = [];

  for (
    const date of dateList
  ) {
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

function cmdWeek(
  ctx,
  msg,
  cmdArgs
) {
  showDateRangeList(
    ctx,
    msg,
    'week'
  );
}

function cmdMonth(
  ctx,
  msg,
  cmdArgs
) {
  showDateRangeList(
    ctx,
    msg,
    'month'
  );
}

function cmdNextMonth(
  ctx,
  msg,
  cmdArgs
) {
  showDateRangeList(
    ctx,
    msg,
    'nextMonth'
  );
}

// 共同时间计算
function intersectRanges(
  rangeLists
) {
  if (!rangeLists.length) {
    return [];
  }

  let result =
    normalizeDateRanges(
      rangeLists[0]
    );

  for (
    let i = 1;
    i < rangeLists.length;
    i++
  ) {
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
function cmdCommon(
  ctx,
  msg,
  cmdArgs
) {
  const groupId =
    ctx.group.groupId;

  const data =
    getData();

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

  for (
    const userId of userIds
  ) {
    const dates =
      group.users[userId]
        .dates || {};

    for (
      const date of Object.keys(dates)
    ) {
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
    Object.keys(dateMap)
      .sort();

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

  for (
    const date of dates
  ) {
    const entries =
      dateMap[date];

    if (
      entries.length !==
      totalUsers
    ) {
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

    for (
      const range of common
    ) {
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

  for (
    const date of dates
  ) {
    const entries =
      dateMap[date];

    const events = [];

    for (
      const entry of entries
    ) {
      for (
        const range of entry.ranges
      ) {
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

    for (
      const event of events
    ) {
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
        s =>
          s.count === maxCount
      );

    if (maxCount > 0) {
      for (
        const segment of bestSegments
      ) {
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
      return a.date.localeCompare(
        b.date
      );
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

  if (
    partialResults.length > 20
  ) {
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

  const data =
    getData();

  if (
    data.groups[groupId] &&
    data.groups[groupId].users &&
    data.groups[groupId].users[userId]
  ) {
    delete data.groups[groupId]
      .users[userId];

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
  const helpText =
`.ptplan 有空 日期……
.ptplan 请假 日期……
.ptplan 本周
.ptplan 本月
.ptplan 下月
.ptplan 我的
.ptplan 共同
.ptplan 清除 请求
.ptplan 清除 确认 <验证码>

日期支持：
6-1
6-1 6-7
6-1~6-7
6-1 6-3~6-5

时间支持：
22:00-01:00
14:00-17:00 20:00-23:00

示例（请假指令同理）：
.ptplan 有空 6-1 6-7 22:00-01:00
.ptplan 有空 6-1~6-7 22:00-01:00
.ptplan 有空 6-1 6-3~6-5 14:00-17:00 20:00-23:00
`.trim();

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