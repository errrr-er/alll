// ==UserScript==
// @name         KP群汇总
// @author       3987681449
// @version      1.0.0
// @description  (.kp)有问题可进群2150284119联系
// @timestamp    1779030169
// 2025-05-11 16:49:17
// @license      Apache-2
// @homepageURL  https://github.com/errrr-er/alll/tree/main
// @updateUrl    https://ghfast.top/https://raw.githubusercontent.com/errrr-er/alll/refs/heads/main/call_of_cthulhu/kp/a_kp_all.js
// @updateUrl    https://raw.githubusercontent.com/errrr-er/alll/refs/heads/main/call_of_cthulhu/kp/a_kp_all.js
// ==/UserScript==

let ext = seal.ext.find('KP群汇总');
if (!ext) {
  ext = seal.ext.new('KP群汇总', 'er', '1.0.0');
  seal.ext.register(ext);
}

// 时间戳(timestamp)
function getCurrentTimestamp() {
    return 1779030169;
}

// 提醒历史
const userLastNotify = new Map();

// 获取GitHub最新版本编号
async function getGitHubVersion() {
    try {
		// 镜像
        const rawUrl = 'https://ghproxy.net/https://raw.githubusercontent.com/errrr-er/alll/refs/heads/main/call_of_cthulhu/kp/a_kp_all.js';
        const response = await fetch(rawUrl);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const content = await response.text();
        
        // 解析时间戳
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
		seal.replyToSender(ctx, msg, '获取GitHub版本出错:', error);
        throw error;
    }
}

// 检查更新
async function checkUpdateOnce(ctx, msg, userId) {
    try {
        const githubVersion = await getGitHubVersion();
        if (!githubVersion) return;
        
        const currentTimestamp = getCurrentTimestamp();
        
        if (githubVersion.timestamp > currentTimestamp) {
            setTimeout(() => {
                seal.replyToSender(ctx, msg, 
                    `发现<KP群汇总>插件有新版本！\n更新检查冷却开始~请及时更新\n最后更新：${githubVersion.formattedDate}`
                );
            }, 1000);
        }
    } catch (error) {
        // 静默处理
    }
}

// 群号映射表(action)
const groupMap = {
};

// 反向映射
const groupNumberToNameMap = {};
for (const groupName in groupMap) {
    const groupInfo = groupMap[groupName];
    // 分隔符
    const groupNumbers = groupInfo.groupNumber.split(/[、\n*]/);
    
    groupNumbers.forEach(number => {
        const cleanNumber = number.trim();
        // 确保是纯数字且不为空
        if (cleanNumber && /^\d+$/.test(cleanNumber)) {
            if (!groupNumberToNameMap[cleanNumber]) {
                groupNumberToNameMap[cleanNumber] = [];
            }
            if (!groupNumberToNameMap[cleanNumber].includes(groupName)) {
                groupNumberToNameMap[cleanNumber].push(groupName);
            }
        }
    });
}

// 字符串相似度
function getSimilarity(s1, s2) {
    s1 = s1.toLowerCase();
    s2 = s2.toLowerCase();

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

    function getJaccardScore(a, b) {
        const set1 = new Set(a.split(''));
        const set2 = new Set(b.split(''));
        const intersection = new Set([...set1].filter(c => set2.has(c))).size;
        const union = new Set([...set1, ...set2]).size;
        return union === 0 ? 0 : intersection / union;
    }

    return Math.max(
        getLevenshteinScore(s1, s2),
        getJaccardScore(s1, s2)
    );
}

function findSimilarGroup(input) {
    input = input.toLowerCase();
    const matchedGroups = [];

    for (const groupName in groupMap) {
        const groupInfo = groupMap[groupName];
        let highestScore = 0;

        const mainScore = getSimilarity(input, groupName.toLowerCase());
        highestScore = Math.max(highestScore, mainScore);

        if (groupInfo.aliases) {
            for (const alias of groupInfo.aliases) {
                const aliasScore = getSimilarity(input, alias.toLowerCase());
                highestScore = Math.max(highestScore, aliasScore);
            }
        }

		// 相似度高于或等于
        if (highestScore >= 0.25) {
            matchedGroups.push({
                name: groupName,
                info: groupInfo,
                score: highestScore
            });
        }
    }

    matchedGroups.sort((a, b) => b.score - a.score);
    return matchedGroups.length > 0 ? matchedGroups : null;
}

// 所有群组信息
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

// .kp指令
const cmdKp = seal.ext.newCmdItemInfo();
cmdKp.name = 'kp';
cmdKp.help = `KP群查询指令
.kp <关键词/群号>    // 查询KP群(支持反向查询)
.kp list            // 列出所有KP群信息(超长慎用)
.kp help            // 显示帮助`;

cmdKp.solve = (ctx, msg, cmdArgs) => {
    let ret = seal.ext.newCmdExecuteResult(true);
    const input = cmdArgs.getArgN(1);
    
    // 24H提醒检查更新
    const userId = msg.sender.userId;
    const now = Date.now();
    const lastNotify = userLastNotify.get(userId) || 0;
    
    if (now - lastNotify > 24 * 60 * 60 * 1000) {
        userLastNotify.set(userId, now);
        checkUpdateOnce(ctx, msg, userId).catch(console.error);
    }
    
    // 命令help
    if (input === 'help' || input === '') {
        ret.showHelp = true;
        return ret;
    }

    // 列出所有群组
    function sendGroupListSegmented(ctx, msg, listText) {
        const lines = listText.split('\n');
        const segmentSize = 20; // 每段行数
        const segments = [];
        
        // 分段处理
        for (let i = 0; i < lines.length; i += segmentSize) {
            const segment = lines.slice(i, i + segmentSize).join('\n');
            segments.push(segment);
        }
        
        // 分段发送
        segments.forEach((segment, index) => {
            setTimeout(() => {
                const header = segments.length > 1 ? `【第 ${index + 1}/${segments.length} 段】\n` : '';
                seal.replyToSender(ctx, msg, header + segment);
            }, index * 5000); // 每段间隔，避免发送过快
        });
        
        // 最后发送图片
        setTimeout(() => {
            seal.replyToSender(ctx, msg, '图已很久没更新，插件有问题请进2150284119反馈\n[CQ:image,file=https://github.com/errrr-er/alll/blob/main/call_of_cthulhu/kp/kp.png?raw=true,type=show]');
        }, (segments.length - 1) * 5000 + 200);
    }

    // list命令
    if (input.toLowerCase() === 'list') {
        const listText = `${generateGroupList()}`;
        sendGroupListSegmented(ctx, msg, listText);
        return ret;
    }

    // 反向查询
    if (/^\d+$/.test(input)) {
        const matchedGroups = groupNumberToNameMap[input] || [];
        
        if (matchedGroups.length > 0) {
            let replyText = ``;
            matchedGroups.forEach(groupName => {
                const groupInfo = groupMap[groupName];
                replyText += `【${groupName}】→ ${groupInfo.groupNumber}`;
            });
            seal.replyToSender(ctx, msg, replyText);
        } else {
            seal.replyToSender(ctx, msg, `未找到匹配【${input}】的结果，请先检查插件是否为最新版，或进2150284119反馈。`);
        }
        return ret;
    }
    
    // 查找匹配的群组
    let foundGroup = null;
    let exactMatch = false;
    
    // 1. 检查主关键词（不区分大小写）
    const lowerInput = input.toLowerCase();
    for (const groupName in groupMap) {
        if (groupName.toLowerCase() === lowerInput) {
            foundGroup = { match: { name: groupName, info: groupMap[groupName] }, score: 1 };
            exactMatch = true;
            break;
        }
    }
    
    // 2. 检查所有群组的别名（不区分大小写）
    if (!foundGroup) {
        for (const groupName in groupMap) {
            const groupInfo = groupMap[groupName];
            if (groupInfo.aliases) {
                for (const alias of groupInfo.aliases) {
                    if (alias.toLowerCase() === lowerInput) {
                        foundGroup = { match: { name: groupName, info: groupInfo }, score: 1 };
                        exactMatch = true;
                        break;
                    }
                }
            }
            if (exactMatch) break;
        }
    }
    
    // 3. 如果没有精确匹配，尝试近似匹配
    if (!foundGroup) {
        const matchedGroups = findSimilarGroup(input);
        if (matchedGroups) {
            let replyText = `找到以下匹配【${input}】的KP群（按相似度排序）：\n`;
            matchedGroups.forEach(group => {
                replyText += `\n【${group.name}】→ ${group.info.groupNumber} (相似度: ${Math.round(group.score * 100)}%)`;
            });
            seal.replyToSender(ctx, msg, replyText);
        } else {
            seal.replyToSender(ctx, msg, `未找到匹配【${input}】的KP群，请先检查插件是否为最新版，接着使用 .kp list 查看所有群组(超长慎用)，或进2150284119反馈。`);
        }
    } else {
        // 精确匹配输出
        seal.replyToSender(ctx, msg, `精确匹配【${input}】：\n【${foundGroup.match.name}】→ ${foundGroup.match.info.groupNumber}`);
    }

    return ret;
};

// 注册指令
ext.cmdMap['kp'] = cmdKp;