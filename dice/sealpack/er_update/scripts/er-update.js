// ==UserScript==
// @name         er-update
// @author       3987681449
// @version      1.0.0
// @description  (.er-update)有问题可进群2150284119联系
// @timestamp    2026-08-14 11:39:53
// @license      Apache-2
// @homepageURL  https://jihulab.com/luj13014/alll
// @updateUrl    https://jihulab.com/luj13014/alll/-/raw/main/dice/sealpack/er_update/scripts/er-update.js?ref_type=heads
// ==/UserScript==

let ext = seal.ext.find('er-update');

if (!ext) {
    ext = seal.ext.new('er-update', 'er', '1.0.0');
    seal.ext.register(ext);
}

// 要检查的插件
const PLUGINS = [
    '沉默提醒',
    'KP群汇总',
    'er-update',
    'log骰点统计',
    '跑团时间规划',
];

// 从 info.toml 中提取 update_timestamp
function parseRemoteTimestamp(tomlText) {
    if (typeof tomlText !== 'string') {
        return null;
    }

    // 找到：
    // [config.update_timestamp]
    //
    // 然后在它下面寻找：
    // default = ""

    const sectionMatch = tomlText.match(
        /\[config\.update_timestamp\]([\s\S]*?)(?=\n\s*\[[^\]]+\]|\s*$)/
    );

    if (!sectionMatch) {
        return null;
    }

    const section = sectionMatch[1];

    const defaultMatch = section.match(
        /^\s*default\s*=\s*["']?(\d+)["']?\s*$/m
    );

    if (!defaultMatch) {
        return null;
    }

    const timestamp = Number(
        defaultMatch[1]
    );

    if (!Number.isFinite(timestamp)) {
        return null;
    }

    return timestamp;
}

// 检查单个插件
async function checkPlugin(pluginName) {
    const target =
        seal.ext.find(pluginName);

    if (!target) {
        return {
            name: pluginName,
            status: '未找到插件'
        };
    }

    if (
        typeof target.getPackageConfig !==
        'function'
    ) {
        return {
            name: pluginName,
            status: '不支持 getPackageConfig'
        };
    }

    let packageConfig;

    try {
        packageConfig =
            target.getPackageConfig() || {};
    } catch (e) {
        return {
            name: pluginName,
            status: '读取包配置失败',
            error: String(e)
        };
    }

    const updateUrl =
        packageConfig.update_url;

    const localTimestamp =
        Number(
            packageConfig.update_timestamp || 0
        );

    if (!updateUrl) {
        return {
            name: pluginName,
            status: '没有 update_url'
        };
    }

    if (
        !Number.isFinite(localTimestamp) ||
        localTimestamp <= 0
    ) {
        return {
            name: pluginName,
            status: '本地 update_timestamp 无效'
        };
    }

    let remoteText;

    try {
        const response =
            await fetch(updateUrl);

        if (!response.ok) {
            throw new Error(
                `HTTP ${response.status}`
            );
        }

        remoteText =
            await response.text();

    } catch (e) {
        return {
            name: pluginName,
            status: '下载远程 info.toml 失败',
            error: String(e)
        };
    }

    const remoteTimestamp =
        parseRemoteTimestamp(
            remoteText
        );

    if (remoteTimestamp === null) {
        return {
            name: pluginName,
            status: '无法解析远程 update_timestamp'
        };
    }

    if (
        remoteTimestamp >
        localTimestamp
    ) {
        return {
            name: pluginName,
            status: '有更新',
            localTimestamp,
            remoteTimestamp,
            updateUrl
        };
    }

    if (
        remoteTimestamp ===
        localTimestamp
    ) {
        return {
            name: pluginName,
            status: '已是最新',
            localTimestamp,
            remoteTimestamp,
            updateUrl
        };
    }

    return {
        name: pluginName,
        status: '本地时间戳晚于远程',
        localTimestamp,
        remoteTimestamp,
        updateUrl
    };
}

// 检查全部插件
async function checkAllPlugins() {
    const results = [];

    for (const pluginName of PLUGINS) {
        const result =
            await checkPlugin(pluginName);

        results.push(result);
    }

    return results;
}

// 检查结果显示
function formatResult(result) {
    if (result.status === '有更新') {
        return (
            `${result.name}：有更新\n` +
            `本地：${result.localTimestamp}\n` +
            `远程：${result.remoteTimestamp}`
        );
    }

    if (result.status === '已是最新') {
        return (
            `${result.name}：已是最新\n` +
            `时间：${result.localTimestamp}`
        );
    }

    if (
        result.status === '本地时间戳晚于远程'
    ) {
        return (
            `${result.name}：本地时间戳晚于远程\n` +
            `本地：${result.localTimestamp}\n` +
            `远程：${result.remoteTimestamp}`
        );
    }

    if (result.error) {
        return (
            `${result.name}：${result.status}\n` +
            `错误：${result.error}`
        );
    }

    return (
        `${result.name}：${result.status}`
    );
}

// 手动检查指令
const cmd =
    seal.ext.newCmdItemInfo();

cmd.name = 'er-update';

cmd.help =
    '检查指定 SealPack 的远程 info.toml\n' +
    '用法：.er-update';

cmd.solve =
    async (ctx, msg, cmdArgs) => {

        const results =
            await checkAllPlugins();

        const lines = [
            '【SealPack更新检查】',
            ''
        ];

        for (const result of results) {
            lines.push(
                formatResult(result)
            );

            lines.push('');
        }

        seal.replyToSender(
            ctx,
            msg,
            lines.join('\n').trim()
        );

        return seal.ext.newCmdExecuteResult(
            true
        );
    };

ext.cmdMap['er-update'] = cmd;