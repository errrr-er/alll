// ==UserScript==
// @name         24小时提醒
// @description  设置24小时提醒，期间收到新消息会重置计时
// @version      1.0.0
// @author       er
// @license      MIT
// @timestamp 1755096714
// 2025-08-12 11:50
// @homepageURL  https://github.com/errrr-er/alll/tree/main
// @updateUrl    https://raw.githubusercontent.com/errrr-er/alll/refs/heads/main/call_of_cthulhu/24h/24h.js
// @updateUrl    https://ghfast.top/https://raw.githubusercontent.com/errrr-er/alll/refs/heads/main/call_of_cthulhu/24h/24h.js
// ==/UserScript==

class ReminderSystem {
    constructor() {
        this.timers = new Map(); // 存储每个用户的定时器
        this.isActive = new Map(); // 记录用户是否开启提醒
    }

    // 开启提醒
    enableReminder(userId, ctx, msg) {
        this.clearTimer(userId); // 先清除现有定时器
        this.isActive.set(userId, true);
        this.setTimer(userId, ctx, msg);
        seal.replyToSender(ctx, msg, "24小时提醒已开启，期间收到新消息将重置计时[(（开头的消息除外");
    }

    // 关闭提醒
    disableReminder(userId, ctx, msg) {
        this.clearTimer(userId);
        this.isActive.delete(userId);
        seal.replyToSender(ctx, msg, "提醒已关闭");
    }

    // 设置定时器
    setTimer(userId, ctx, msg) {
        if (!this.isActive.get(userId)) return;

        this.clearTimer(userId); // 先清除现有定时器

        const timer = setTimeout(() => {
            seal.replyToSender(ctx, msg, "[CQ:image,file=https://github.com/errrr-er/alll/blob/main/call_of_cthulhu/24h/rp.png?raw=true,type=show]");
            this.isActive.delete(userId);
            this.timers.delete(userId);
        }, 24 * 60 * 60 * 1000); // 24小时

        this.timers.set(userId, timer);
    }

    // 清除定时器
    clearTimer(userId) {
        if (this.timers.has(userId)) {
            clearTimeout(this.timers.get(userId));
            this.timers.delete(userId);
        }
    }

    // 处理消息，检查是否需要重置计时
    handleMessage(ctx, msg) {
        const userId = msg.sender.userId;
        
        // 如果提醒未开启，不做处理
        if (!this.isActive.get(userId)) return;
        
        const message = msg.message;
        
        // 检查消息是否以……开头
        const shouldIgnore = 
            message.startsWith('[') || 
            message.startsWith('(') ||
            message.startsWith('（');
        
        if (!shouldIgnore) {
            // 如果不是这些符号开头，重置定时器
            this.setTimer(userId, ctx, msg);
        }
    }
}

// 初始化系统
if (!seal.ext.find('24hReminder')) {
    const ext = seal.ext.new('24hReminder', 'er', '1.0');
    const reminderSystem = new ReminderSystem();

    // 创建命令
    const cmdReminder = seal.ext.newCmdItemInfo();
    cmdReminder.name = '提醒';
    cmdReminder.help = '24小时提醒功能\n' +
                      '使用说明:\n' +
                      '.提醒开 - 开启24小时提醒[(（开头的消息不会重置计时\n' +
                      '.提醒关 - 关闭提醒';

    cmdReminder.solve = (ctx, msg, cmdArgs) => {
        const subCmd = cmdArgs.getArgN(1);
        const userId = msg.sender.userId;

        switch (subCmd) {
            case '开':
                reminderSystem.enableReminder(userId, ctx, msg);
                break;
            case '关':
                reminderSystem.disableReminder(userId, ctx, msg);
                break;
            default:
                seal.replyToSender(ctx, msg, '未知指令，使用 .提醒开 或 .提醒关');
        }
        return seal.ext.newCmdExecuteResult(true);
    };

    // 注册命令
    ext.cmdMap['提醒'] = cmdReminder;

    // 监听所有消息
    ext.onMessage = (ctx, msg) => {
        // 不处理以.开头的命令消息
        if (!msg.message.startsWith('.')) {
            reminderSystem.handleMessage(ctx, msg);
        }
    };

    // 注册扩展
    seal.ext.register(ext);
}