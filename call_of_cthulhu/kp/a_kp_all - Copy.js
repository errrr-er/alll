// ==UserScript==
// @name         KP群汇总
// @author       3987681449
// @version      4.3.1
// @description  (.kp)有问题可进群2150284119联系
// @timestamp    1763137399
// 2025-05-11 16:49:17
// @license      Apache-2
// @homepageURL  https://github.com/errrr-er/alll/tree/main
// @updateUrl    https://ghfast.top/https://raw.githubusercontent.com/errrr-er/alll/refs/heads/main/call_of_cthulhu/kp/a_kp_all.js
// @updateUrl    https://raw.githubusercontent.com/errrr-er/alll/refs/heads/main/call_of_cthulhu/kp/a_kp_all.js
// ==/UserScript==

// 按照海豹格式写的插件，非海豹核心可能无法使用
// 已适配青果OPK，具体请前往GitHub查看
// https://raw.githubusercontent.com/errrr-er/alll/refs/heads/main/call_of_cthulhu/kp

// 自动更新管理器
class AutoUpdater {
    constructor() {
        this.localVersion = getCurrentTimestamp();
        this.updateChecked = false;
        this.updateInterval = 24 * 60 * 60 * 1000; // 24小时检查一次
    }

    // 检查并执行更新
    async checkAndUpdate(ctx, msg) {
        if (this.updateChecked) return;
        
        try {
            const githubVersion = await getGitHubVersion();
            if (!githubVersion) return;

            if (githubVersion.timestamp > this.localVersion) {
                console.log(`发现新版本: ${githubVersion.timestamp} > ${this.localVersion}`);
                
                // 执行JSON文件更新
                const success = await this.updateJsonFile();
                
                if (success) {
                    seal.replyToSender(ctx, msg, 
                        `✅ KP群数据已自动更新到最新版！\n` +
                        `📅 更新时间: ${githubVersion.formattedDate}\n` +
                        `🔄 数据已生效`
                    );
                    
                    this.localVersion = githubVersion.timestamp;
                }
            }
            this.updateChecked = true;
        } catch (error) {
            console.log('自动更新检查失败:', error.message);
        }
    }

    // 更新JSON文件
    async updateJsonFile() {
        try {
            console.log('开始更新JSON文件...');
            
            // 从GitHub获取最新的JS文件内容
            const rawUrl = 'https://ghproxy.net/https://raw.githubusercontent.com/errrr-er/alll/refs/heads/main/call_of_cthulhu/kp/a_kp_all.js';
            const response = await fetch(rawUrl);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            const jsContent = await response.text();
            
            // 从JS内容中提取groupMap数据
            const groupMapData = this.extractGroupMapFromJS(jsContent);
            if (!groupMapData) return false;
            
            // 构建JSON数据
            const jsonData = {
                version: "1.0.0",
                timestamp: this.localVersion,
                group_map: groupMapData
            };
            
            // 保存到helpdoc目录
            const fs = require('fs');
            const path = require('path');
            const jsonPath = path.join(seal.helpDocDir, 'kp_groupMap.json');
            
            // 写入JSON文件
            fs.writeFileSync(jsonPath, JSON.stringify(jsonData, null, 2), 'utf8');
            console.log('JSON文件更新成功:', jsonPath);
            
            return true;
        } catch (error) {
            console.error('更新JSON文件失败:', error);
            return false;
        }
    }

    // 从JS内容中提取groupMap
    extractGroupMapFromJS(jsContent) {
        try {
            // 查找groupMap定义
            const groupMapMatch = jsContent.match(/const groupMap = \{[\s\S]*?\};/);
            if (!groupMapMatch) return null;
            
            // 执行提取的代码来获取groupMap对象
            const groupMapCode = groupMapMatch[0];
            
            // 创建一个沙盒环境来执行代码并获取groupMap
            const vm = require('vm');
            const sandbox = {
                groupMap: null
            };
            
            // 执行groupMap定义代码
            const script = new vm.Script(groupMapCode + '; sandbox.groupMap = groupMap;');
            script.runInNewContext(sandbox);
            
            return sandbox.groupMap;
        } catch (error) {
            console.error('提取groupMap失败:', error);
            return null;
        }
    }
}

// 创建自动更新器实例
const autoUpdater = new AutoUpdater();

let ext = seal.ext.find('KP群汇总');
if (!ext) {
  ext = seal.ext.new('KP群汇总', 'er', '4.3.1');
  seal.ext.register(ext);
}

// 时间戳(需要手动更新)
function getCurrentTimestamp() {
    return 1763137399;
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
        console.error('获取GitHub版本出错:', error);
        return null;
    }
}

// 检查更新
async function checkUpdate(ctx, msg, userId) {
    try {
        // 24小时检查限制
        const now = Date.now();
        const lastNotify = userLastNotify.get(userId) || 0;
        
        if (now - lastNotify < autoUpdater.updateInterval) {
            return;
        }
        
        userLastNotify.set(userId, now);
        await autoUpdater.checkAndUpdate(ctx, msg);
        
    } catch (error) {
        console.log('更新检查错误:', error.message);
    }
}

// 从JSON文件加载群号映射表
function loadGroupMapFromJSON() {
    try {
        const fs = require('fs');
        const path = require('path');
        const jsonPath = path.join(seal.helpDocDir, 'kp_groupMap.json');
        
        if (fs.existsSync(jsonPath)) {
            const jsonContent = fs.readFileSync(jsonPath, 'utf8');
            const jsonData = JSON.parse(jsonContent);
            return jsonData.group_map;
        } else {
            // 如果JSON文件不存在，创建一个空的groupMap
            console.log('JSON文件不存在，创建空groupMap');
            return {};
        }
    } catch (error) {
        console.error('加载JSON文件失败:', error);
        return {};
    }
}

// 群号映射表 - 从JSON文件加载
const groupMap = loadGroupMapFromJSON();

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

        // 相似度高于或等于30%
        if (highestScore >= 0.3) {
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
.kp <关键词>	// 查询特定KP群号(支持反向查询)
.kp list	// 列出所有KP群信息(超长慎用)
.kp help	// 显示本帮助
.kpupdate	// 手动更新KP群数据`;

cmdKp.solve = (ctx, msg, cmdArgs) => {
    let ret = seal.ext.newCmdExecuteResult(true);
    const input = cmdArgs.getArgN(1);
    
    // 自动检查更新（不阻塞主流程）
    const userId = msg.sender.userId;
    setTimeout(() => {
        checkUpdate(ctx, msg, userId).catch(console.error);
    }, 1000);
    
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
            }, index * 1500); // 每段间隔，避免发送过快
        });
        
        // 最后发送图片
        setTimeout(() => {
            seal.replyToSender(ctx, msg, '图已很久没更新，插件有问题请进2150284119反馈\n[CQ:image,file=https://github.com/errrr-er/alll/blob/main/call_of_cthulhu/kp/kp.png?raw=true,type=show]');
        }, segments.length * 500 + 200);
    }

    // list命令
    if (input.toLowerCase() === 'list') {
        const listText = `所有KP群信息:\n${generateGroupList()}`;
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
            seal.replyToSender(ctx, msg, `未找到匹配【${input}】的KP群，请先检查插件是否为最新版，接着使用 .kp list 查看所有群组(超长慎用)，或进2150284119反馈。`);
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

// 手动更新指令
const cmdUpdate = seal.ext.newCmdItemInfo();
cmdUpdate.name = 'kpupdate';
cmdUpdate.help = `手动更新KP群数据
.kpupdate    // 立即检查并更新数据`;

cmdUpdate.solve = async (ctx, msg, cmdArgs) => {
    let ret = seal.ext.newCmdExecuteResult(true);
    
    seal.replyToSender(ctx, msg, '🔄 正在检查更新...');
    
    // 重置检查状态，强制更新
    autoUpdater.updateChecked = false;
    await autoUpdater.checkAndUpdate(ctx, msg);
    
    return ret;
};

// 注册指令
ext.cmdMap['kp'] = cmdKp;
ext.cmdMap['kpupdate'] = cmdUpdate;