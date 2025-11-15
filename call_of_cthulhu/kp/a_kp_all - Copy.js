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
        this.localVersion = null;
        this.updateChecked = false;
    }

    // 获取本地时间戳
    getLocalTimestamp() {
        try {
            const fs = require('fs');
            const path = require('path');
            
            // 动态检测JSON文件路径
            const currentDir = __dirname;
            const dataDir = path.join(currentDir, '..', '..');
            const helpdocDir = path.join(dataDir, 'helpdoc');
            const jsonPath = path.join(helpdocDir, 'kp_groupMap.json');
            
            if (fs.existsSync(jsonPath)) {
                const jsonContent = fs.readFileSync(jsonPath, 'utf8');
                const jsonData = JSON.parse(jsonContent);
                
                if (jsonData.timestamp) {
                    return jsonData.timestamp;
                }
            }
            
            // 如果JSON文件不存在或没有时间戳，返回null
            return null;
            
        } catch (error) {
            console.error('获取本地时间戳失败:', error);
            return null;
        }
    }

    async checkAndUpdate(ctx, msg) {
        seal.replyToSender(ctx, msg, "🔄 开始检查更新...");
        
        try {
            // 获取本地版本
            this.localVersion = this.getLocalTimestamp();
            seal.replyToSender(ctx, msg, `📊 本地版本: ${this.localVersion || '未找到'}`);
            
            // 获取GitHub版本
            const githubVersion = await getGitHubVersion();
            if (!githubVersion) {
                seal.replyToSender(ctx, msg, "❌ 获取GitHub版本信息失败");
                return;
            }

            seal.replyToSender(ctx, msg, `🌐 远程版本: ${githubVersion.timestamp}`);
            
            // 如果没有本地版本或者远程版本更新，则更新
            if (!this.localVersion || githubVersion.timestamp > this.localVersion) {
                seal.replyToSender(ctx, msg, "✅ 发现新版本，开始更新JSON文件...");
                await this.updateJsonFile(ctx, msg, githubVersion.timestamp);
            } else {
                seal.replyToSender(ctx, msg, "✅ 当前已是最新版本");
            }
        } catch (error) {
            seal.replyToSender(ctx, msg, `❌ 更新检查失败: ${error.message}`);
        }
    }

    async updateJsonFile(ctx, msg, newTimestamp) {
        try {
            seal.replyToSender(ctx, msg, "📥 正在准备更新JSON文件...");
            
            const fs = require('fs');
            const path = require('path');
            
            // 动态检测路径
            seal.replyToSender(ctx, msg, "📍 开始检测文件路径...");
            const currentDir = __dirname;
            const dataDir = path.join(currentDir, '..', '..');
            const helpdocDir = path.join(dataDir, 'helpdoc');
            const jsonPath = path.join(helpdocDir, 'kp_groupMap.json');
            
            seal.replyToSender(ctx, msg, `📁 推算的JSON路径: ${jsonPath}`);
            
            // 检查路径是否存在
            if (fs.existsSync(helpdocDir)) {
                seal.replyToSender(ctx, msg, "✅ helpdoc目录存在");
            } else {
                seal.replyToSender(ctx, msg, "❌ helpdoc目录不存在，尝试创建");
                fs.mkdirSync(helpdocDir, { recursive: true });
                seal.replyToSender(ctx, msg, "✅ helpdoc目录创建成功");
            }
            
            seal.replyToSender(ctx, msg, "📋 正在构建JSON数据...");
            
            // 构建JSON数据 - 使用新的时间戳
            const jsonData = {
                version: "1.0.0",
                timestamp: newTimestamp,
                group_map: groupMap
            };
            
            seal.replyToSender(ctx, msg, `📊 数据统计: ${Object.keys(groupMap).length} 个群组`);
            seal.replyToSender(ctx, msg, `⏰ 新时间戳: ${newTimestamp}`);
            seal.replyToSender(ctx, msg, "💾 正在写入文件...");
            
            fs.writeFileSync(jsonPath, JSON.stringify(jsonData, null, 2), 'utf8');
            
            seal.replyToSender(ctx, msg, "✅ JSON文件更新完成！");
            
        } catch (error) {
            seal.replyToSender(ctx, msg, `❌ 更新JSON文件失败: ${error.message}`);
        }
    }
}

const autoUpdater = new AutoUpdater();

let ext = seal.ext.find('KP群汇总');
if (!ext) {
  ext = seal.ext.new('KP群汇总', 'er', '4.3.1');
  seal.ext.register(ext);
}

// 获取GitHub最新版本编号
async function getGitHubVersion() {
    try {
        seal.replyToSender(ctx, msg, "🌐 正在从GitHub获取最新版本...");
        
        // 直接从GitHub的JSON文件获取版本信息
        const jsonUrl = 'https://ghproxy.net/https://raw.githubusercontent.com/errrr-er/alll/refs/heads/main/call_of_cthulhu/kp/kp_groupMap.json';
        const response = await fetch(jsonUrl);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const jsonContent = await response.text();
        const jsonData = JSON.parse(jsonContent);
        
        if (jsonData.timestamp) {
            const date = new Date(jsonData.timestamp * 1000);
            seal.replyToSender(ctx, msg, `✅ 获取到GitHub版本: ${jsonData.timestamp}`);
            
            return {
                timestamp: jsonData.timestamp,
                date: date,
                formattedDate: date.toLocaleString('zh-CN')
            };
        } else {
            throw new Error('GitHub JSON文件中没有timestamp字段');
        }
        
    } catch (error) {
        seal.replyToSender(ctx, msg, `❌ 获取GitHub版本失败: ${error.message}`);
        return null;
    }
}

// 检查更新
async function checkUpdate(ctx, msg, userId) {
    seal.replyToSender(ctx, msg, "⏰ 触发更新检查...");
    await autoUpdater.checkAndUpdate(ctx, msg);
}

// 从JSON文件加载群号映射表
function loadGroupMapFromJSON() {
    try {
        const fs = require('fs');
        const path = require('path');
        
        // 使用动态路径检测
        const currentDir = __dirname;
        const dataDir = path.join(currentDir, '..', '..');
        const helpdocDir = path.join(dataDir, 'helpdoc');
        const jsonPath = path.join(helpdocDir, 'kp_groupMap.json');
        
        if (fs.existsSync(jsonPath)) {
            const jsonContent = fs.readFileSync(jsonPath, 'utf8');
            const jsonData = JSON.parse(jsonContent);
            console.log('从JSON文件加载groupMap成功');
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
    
    // 自动检查更新
    const userId = msg.sender.userId;
    seal.replyToSender(ctx, msg, "🔍 后台检查更新中...");
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