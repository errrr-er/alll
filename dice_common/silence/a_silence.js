// ==UserScript==
// @name         沉默提醒
// @author       3987681449
// @version      1.0.0
// @description  (.沉默 help)有问题可进群2150284119联系
// @timestamp    1773092650  
// 2026-03-09 17:22:53
// @license      Apache-2
// @homepageURL  https://github.com/errrr-er/alll/tree/main
// @updateUrl    https://ghfast.top/https://raw.githubusercontent.com/errrr-er/alll/refs/heads/main/dice_common/silence/a_silence.js
// @updateUrl    https://raw.githubusercontent.com/errrr-er/alll/refs/heads/main/dice_common/silence/a_silence.js
// ==/UserScript==

let ext = seal.ext.find('silence');
if (!ext) {
    ext = seal.ext.new('silence', 'er', '1.0.0');
    seal.ext.register(ext);
}

// 时间戳(需要手动更新)
function silenceGetCurrentTimestamp() {
    return 1773092650;
}

// 提醒历史
const silenceUserLastNotify = new Map();

// 获取GitHub最新版本编号
async function silenceGetGitHubVersion() {
    try {
        // 镜像
        const rawUrl = 'https://ghfast.top/https://raw.githubusercontent.com/errrr-er/alll/refs/heads/main/dice_common/silence/a_silence.js';
        const response = await fetch(rawUrl);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        const content = await response.text();
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
        console.error('获取GitHub版本出错:', error);
        return null;
    }
}

// 检查更新
async function silenceCheckUpdateOnce(ctx, msg, userId) {
    try {
        const githubVersion = await silenceGetGitHubVersion();
        if (!githubVersion) return;
        const currentTimestamp = silenceGetCurrentTimestamp();
        if (githubVersion.timestamp > currentTimestamp) {
            setTimeout(() => {
                seal.replyToSender(ctx, msg,
                    `发现<沉默提醒>插件有新版本！\n更新检查冷却开始~请及时更新\n最后更新：${githubVersion.formattedDate}`
                );
            }, 1000);
        }
    } catch (error) {
        // 静默处理
    }
}

const STORAGE_LAST = 'silence_last';
const STORAGE_THRESHOLD = 'silence_threshold';

function getLastActive(groupId) {
    try {
        const data = ext.storageGet(STORAGE_LAST);
        const map = data ? JSON.parse(data) : {};
        return map[groupId] || 0;
    } catch (e) {
        return 0;
    }
}

function setLastActive(groupId, time) {
    try {
        const data = ext.storageGet(STORAGE_LAST);
        const map = data ? JSON.parse(data) : {};
        map[groupId] = time;
        ext.storageSet(STORAGE_LAST, JSON.stringify(map));
    } catch (e) {}
}

function getThreshold(groupId) {
    try {
        const data = ext.storageGet(STORAGE_THRESHOLD);
        const map = data ? JSON.parse(data) : {};
        return map[groupId] !== undefined ? map[groupId] : 0;
    } catch (e) {
        return 0;
    }
}

function setThreshold(groupId, minutes) {
    try {
        const data = ext.storageGet(STORAGE_THRESHOLD);
        const map = data ? JSON.parse(data) : {};
        map[groupId] = minutes;
        ext.storageSet(STORAGE_THRESHOLD, JSON.stringify(map));
    } catch (e) {}
}

// 发送提醒到指定群（使用临时上下文）
function sendReminderToGroup(groupId) {
    try {
        if (typeof seal.getEndPoints !== 'function') {
            console.warn('seal.getEndPoints 不可用');
            return false;
        }
        const endpoints = seal.getEndPoints();
        if (!endpoints || endpoints.length === 0) {
            console.warn('没有可用的 endpoint');
            return false;
        }
        const ep = endpoints[0]; // 取第一个可用的接入点

        const fakeMsg = seal.newMessage();
        fakeMsg.messageType = 'group';
        fakeMsg.groupId = groupId;
        fakeMsg.sender = { userId: '0', nickname: 'system' };

        const fakeCtx = seal.createTempCtx(ep, fakeMsg);

        if (typeof seal.replyGroup === 'function') {
            seal.replyGroup(fakeCtx, fakeMsg, '[CQ:at,qq=all]');
        } else {
            seal.replyToSender(fakeCtx, fakeMsg, '[CQ:at,qq=all]');
        }
        // console.log(`提醒已发送到群 ${groupId}（定时触发）`);
        return true;
    } catch (e) {
        console.error(`发送提醒到群 ${groupId} 失败`, e);
        return false;
    }
}

// 检查所有群并发送超时提醒
function checkAllGroupsAndSend() {
    try {
        const lastMap = JSON.parse(ext.storageGet(STORAGE_LAST) || '{}');
        const thresholdMap = JSON.parse(ext.storageGet(STORAGE_THRESHOLD) || '{}');
        const now = Date.now();
        for (const groupId in lastMap) {
            const last = lastMap[groupId];
            const threshold = thresholdMap[groupId];
            if (threshold > 0 && last > 0 && now - last > threshold * 60 * 1000) {
                if (sendReminderToGroup(groupId)) {
                    setLastActive(groupId, now); // 发送成功后重置计时
                }
            }
        }
    } catch (e) {
        console.error('定时检查异常', e);
    }
}

// 处理消息：仅更新最后活跃时间，不发送提醒
function handleMessage(ctx, msg) {
    if (msg.messageType !== 'group' || !msg.groupId) return;
    const groupId = msg.groupId.toString();
    const now = Date.now();
    setLastActive(groupId, now);
}

// 监听所有非指令消息（重置计时）
ext.onNotCommandReceived = (ctx, msg) => {
    handleMessage(ctx, msg);
};

// 监听指令消息（重置计时）
ext.onCommandReceived = (ctx, msg, cmdArgs) => {
    handleMessage(ctx, msg);
};

// 注册定时任务（每分钟执行一次）
if (typeof seal.ext.registerTask === 'function') {
    seal.ext.registerTask(ext, 'cron', '* * * * *', (taskCtx) => {
        // console.log('沉默提醒定时任务触发');
        checkAllGroupsAndSend();
    }, 'silence_check', '每分钟检查一次沉默提醒');
} else {
    console.warn('当前海豹版本不支持定时任务，沉默提醒无法自动触发');
    setInterval(() => {
        checkAllGroupsAndSend();
    }, 60000);
}

// 创建命令
const cmdSilence = seal.ext.newCmdItemInfo();
cmdSilence.name = '沉默';
cmdSilence.help = `设置群内沉默提醒阈值。
.沉默 <分钟>  设置本群无人说话多少分钟后提醒（设0关闭）
.沉默 状态     查看本群当前设置和最后活跃时间`;

cmdSilence.solve = (ctx, msg, cmdArgs) => {
    try {
        // 更新检查（每24小时提醒一次，使用带前缀的函数和变量）
        const userId = msg.sender.userId;
        const now = Date.now();
        const lastNotify = silenceUserLastNotify.get(userId) || 0;
        if (now - lastNotify > 24 * 60 * 60 * 1000) {
            silenceUserLastNotify.set(userId, now);
            silenceCheckUpdateOnce(ctx, msg, userId).catch(console.error);
        }

        if (msg.messageType !== 'group' || !msg.groupId) {
            seal.replyToSender(ctx, msg, '本命令只能在群聊中使用');
            return seal.ext.newCmdExecuteResult(true);
        }
        const groupId = msg.groupId.toString();
        const subCmd = cmdArgs.getArgN(1);

        if (!subCmd) {
            const threshold = getThreshold(groupId);
            const last = getLastActive(groupId);
            const now = Date.now();
            const lastStr = last ? new Date(last).toLocaleString() : '无记录';
            let status = '';
            let nextReminderStr = '';
            if (threshold <= 0) {
                status = '未启用';
                nextReminderStr = '未启用';
            } else {
                const remaining = last ? Math.max(0, threshold * 60 * 1000 - (now - last)) / 60000 : threshold;
                status = `阈值：${threshold} 分钟，剩余时间：${remaining.toFixed(1)} 分钟`;
                const nextTime = last + threshold * 60 * 1000;
                nextReminderStr = new Date(nextTime).toLocaleString();
            }
            seal.replyToSender(ctx, msg,
                `当前沉默提醒设置：\n${status}\n最后活跃：${lastStr}\n下次提醒：${nextReminderStr}`
            );
            return seal.ext.newCmdExecuteResult(true);
        }

        if (subCmd === '状态' || subCmd === 'status') {
            const threshold = getThreshold(groupId);
            const last = getLastActive(groupId);
            const now = Date.now();
            const lastStr = last ? new Date(last).toLocaleString() : '无记录';
            let status = '';
            let nextReminderStr = '';
            if (threshold <= 0) {
                status = '未启用';
                nextReminderStr = '未启用';
            } else {
                const remaining = last ? Math.max(0, threshold * 60 * 1000 - (now - last)) / 60000 : threshold;
                status = `阈值：${threshold} 分钟，剩余时间：${remaining.toFixed(1)} 分钟`;
                const nextTime = last + threshold * 60 * 1000;
                nextReminderStr = new Date(nextTime).toLocaleString();
            }
            seal.replyToSender(ctx, msg,
                `沉默提醒设置：\n${status}\n最后活跃：${lastStr}\n下次提醒：${nextReminderStr}`
            );
            return seal.ext.newCmdExecuteResult(true);
        }

        const minutes = parseInt(subCmd, 10);
        if (isNaN(minutes) || minutes < 0) {
            seal.replyToSender(ctx, msg, '请输入有效的分钟数（非负整数）');
            return seal.ext.newCmdExecuteResult(true);
        }

        setThreshold(groupId, minutes);
        if (minutes > 0) {
            setLastActive(groupId, Date.now());
            seal.replyToSender(ctx, msg, `已启用沉默提醒，阈值为 ${minutes} 分钟，从现在开始计时。`);
        } else {
            seal.replyToSender(ctx, msg, `已关闭沉默提醒。`);
        }
        return seal.ext.newCmdExecuteResult(true);
    } catch (e) {
        console.error('命令处理异常', e);
        seal.replyToSender(ctx, msg, `命令执行异常：${e.message}`);
        return seal.ext.newCmdExecuteResult(false);
    }
};

ext.cmdMap['沉默'] = cmdSilence;