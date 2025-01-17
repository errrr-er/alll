// ==UserScript==
// @name         光明世界D6池系统
// @author       裗浳(3612464276)
// @version      1.1.0
// @description  暗烛规则适用、出bug详见README(Github)进行反馈
// @timestamp    1737136966
// 2025-01-17 00:00:40 UTC
// @license      CC-BY-NC-SA 4.0
// @homepageURL  https://github.com/errrr-er/alll/tree/main
// @updateUrl    https://raw.githubusercontent.com/errrr-er/alll/refs/heads/main/candela_obscura/illuminated_worlds.js
// @updateUrl    https://ghp.ci/https://raw.githubusercontent.com/errrr-er/alll/refs/heads/main/candela_obscura/illuminated_worlds.js
// ==/UserScript==

let ext = seal.ext.find('illumi');
if (!ext) {
  ext = seal.ext.new('illumi', 'er', '1.0.0');
  seal.ext.register(ext);
}

// “标准”
const cmdSeal = seal.ext.newCmdItemInfo();
cmdSeal.name = 'iw';
cmdSeal.help = '.iw <n> // 掷出nD6(标准骰)并汇报最高成功等级\n\n- 1~3：失败、没有完成预想而且有代价。\n- 4~5：混合成功、完成预想且有代价。\n- 6：成功、完成预想且没代价。\n- 6*n(6s)：完美成功、完成预想且额外获得■■■(无指定)。';

cmdSeal.solve = (ctx, msg, cmdArgs) => {
    let ret = seal.ext.newCmdExecuteResult(true), text = '', roller = seal.format(ctx,"{$t玩家_RAW}"), res;
    if (cmdArgs.getArgN(1) == 'help' || cmdArgs.getArgN(1) == '') {
        ret.showHelp = true;
        return ret;
    }
    let vsDice = parseInt(cmdArgs.getArgN(1));
    if (vsDice == 0) {
        text = '警告：非可处理的数量。';
        seal.replyToSender(ctx, msg, text);
        return ret;
    } else if (vsDice > 6) {
        text = '警告：单次检定的总量不可超过六个。';
        seal.replyToSender(ctx, msg, text);
        return ret;
    }
    let results = [];
    for (let i = 0; i < vsDice; i++) {
        res = Math.floor(Math.random() * 6) + 1;
        results.push(res);
    }
    let highestSuccess = determineHighestSuccess(results);
    text = roller + '：' + results.join('、') + '\n进行检定：' + vsDice + '次\n最高等级：' + highestSuccess;
    seal.replyToSender(ctx, msg, text);
    return ret;
};


// “标准”&“镀金”
const cmdSeal = seal.ext.newCmdItemInfo();
cmdSeal.name = 'iwd';
cmdSeal.help = '.iwd <n> <d> // 掷出nD6(标准骰)与dD6(镀金骰)并汇报双方各自和总体最高成功等级\n\n- 1~3：失败、没有完成预想而且有代价。\n- 4~5：混合成功、完成预想且有代价。\n- 6：成功、完成预想且没代价。\n- 6*n(6s)：完美成功、完成预想且额外获得■■■(无指定)。';

cmdSeal.solve = (ctx, msg, cmdArgs) => {
    let ret = seal.ext.newCmdExecuteResult(true), text = '', roller = seal.format(ctx,"{$t玩家_RAW}"), res;
    if (cmdArgs.getArgN(1) == 'help' || cmdArgs.getArgN(1) == '') {
        ret.showHelp = true;
        return ret;
    }
    let vsDice = parseInt(cmdArgs.getArgN(1));
    let goldDice = parseInt(cmdArgs.getArgN(2));
    if (vsDice == 0 || goldDice == 0) {
        text = '警告：骰子数量无效。';
        seal.replyToSender(ctx, msg, text);
        return ret;
    } else if (vsDice > 6 || goldDice > 6) {
        text = '警告：单次检定的骰子数量不得超过六个。';
        seal.replyToSender(ctx, msg, text);
        return ret;
    }
    let standardResults = [];
    let goldResults = [];
    for (let i = 0; i < vsDice; i++) {
        res = Math.floor(Math.random() * 6) + 1;
        standardResults.push(res);
    }
    for (let i = 0; i < goldDice; i++) {
        res = Math.floor(Math.random() * 6) + 1;
        goldResults.push(res);
    }
    let highestStandardSuccess = determineHighestSuccess(standardResults);
    let highestGoldSuccess = determineHighestSuccess(goldResults);
    let overallHighestSuccess = compareSuccessLevels(highestStandardSuccess, highestGoldSuccess);
    text = roller + '：标准骰结果 ' + standardResults.join('、') + '，镀金骰结果 ' + goldResults.join('、') + 
    '\n标准骰最高等级：' + highestStandardSuccess + 
    '\n镀金骰最高等级：' + highestGoldSuccess + 
    '\n整体最高等级：' + overallHighestSuccess;
    seal.replyToSender(ctx, msg, text);
    return ret;
};

// 成功等级
function determineHighestSuccess(results) {
    let sixCount = results.filter(res => res === 6).length;
    if (sixCount > 1) {
        return '完美成功';
    } else if (sixCount === 1) {
        return '成功';
    } else {
        let maxResult = Math.max(...results);
        if (maxResult >= 4 && maxResult <= 5) {
            return '混合成功';
        } else if (maxResult <= 3) {
            return '失败';
        }
    }
}

// 等级对比
const successOrder = ['失败', '混合成功', '成功', '完美成功'];

function compareSuccessLevels(a, b) {
    let indexA = successOrder.indexOf(a);
    let indexB = successOrder.indexOf(b);
    if (indexA > indexB) {
        return a;
    } else if (indexB > indexA) {
        return b;
    } else {
        return a;
    }
}

// 注册指令
ext.cmdMap['iw'] = cmdSeal;
ext.cmdMap['iwd'] = cmdSeal;