// ==UserScript==
// @name         kpissue
// @author       3987681449
// @version      1.0.0
// @description  (.kpissue)提交GitHub Issue | 用法：.kpissue 群号 别名1,别名2(可选)
// @timestamp    1778959464
// ==/UserScript==

// ======================
// 1. 扩展初始化
// ======================
let ext = seal.ext.find('kpissue');
if (!ext) {
  ext = seal.ext.new('kpissue', 'er', '1.0.0');
  seal.ext.register(ext);
}

// ======================
// 2. GitHub配置（记得末尾qq号的@也要改）
// ======================
const CONFIG = {
  token: "ghp_xxxxxxx",
  repo: "你的用户名/你的仓库"
};

// ======================
// 3. GitHub API
// ======================
async function createIssue(bodyText) {
  const res = await fetch(
    `https://api.github.com/repos/${CONFIG.repo}/issues`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${CONFIG.token}`,
        Accept: "application/vnd.github+json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        title: "[KP_groupMap] 新增内容",
        labels: ["kp-data"],
        body: bodyText
      })
    }
  );

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "GitHub error");
  return data;
}

// ======================
// 4. 解析输入
// ======================
function parseInput(text) {
  const parts = text.trim().split(/\s+/);

  if (parts.length < 2) return null;

  const key = parts[0];
  const groupNumber = parts[1];

  const aliases = parts[2]
    ? parts[2].split(",").map(s => s.trim()).filter(Boolean)
    : [];

  if (!key || !groupNumber) return null;

  return {
    [key]: {
      groupNumber,
      aliases
    }
  };
}

// ======================
// 5. 生成Issue内容
// ======================
function buildIssueBody(data) {
  return `
### 数据内容
\`\`\`json
${JSON.stringify(data, null, 2)}
\`\`\`
`;
}

// ======================
// 6. 指令
// ======================
const cmdkpissue = seal.ext.newCmdItemInfo();
cmdkpissue.name = 'kpissue';
cmdkpissue.help = '用法：.kpissue 群号 别名1,别名2(可选)';

cmdkpissue.solve = (ctx, msg, cmdArgs) => {
  const text = cmdArgs.rawArgs || "";

  const data = parseInput(text);

  if (!data) {
    const ret = seal.ext.newCmdExecuteResult(true);
    seal.replyToSender(ctx, msg, "格式错误：.kpissue 群号 别名1,别名2(可选)");
    return ret;
  }

  createIssue(buildIssueBody(data))
    .then(issue => {
      seal.replyToSender(ctx, msg, `已提交！等待[CQ:at,qq=号码]审核中：${issue.html_url}`);
    })
    .catch(e => {
      seal.replyToSender(ctx, msg, `失败：${e.message}`);
    });

  return seal.ext.newCmdExecuteResult(true);
};

// ======================
// 7. 注册指令
// ======================
ext.cmdMap['kpissue'] = cmdkpissue;