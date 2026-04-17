const fs = require("fs");

const body = process.env.ISSUE_BODY || "";

// ===== 1. 提取 JSON =====
let data;

try {
  const match = body.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("no json found");

  data = JSON.parse(match[0]);
} catch (e) {
  console.log("JSON parse failed:", e.message);
  process.exit(1);
}

// ===== 2. 校验结构 =====
if (!data.items || !Array.isArray(data.items)) {
  console.log("invalid format: items missing");
  process.exit(1);
}

// ===== 3. 构建 groupMap =====
const groupMap = {};

for (const item of data.items) {
  if (!item.name || !item.groupNumber) continue;

  groupMap[item.name] = {
    groupNumber: item.groupNumber,
    tag: item.tag || "",
    aliases: Array.isArray(item.aliases) ? item.aliases : []
  };
}

// ===== 4. 输出目录（重点改动）=====
const outDir = "call_of_cthulhu/kp/base_function/result";

// 自动创建目录
fs.mkdirSync(outDir, { recursive: true });

// ===== 5. 输出 JSON =====
fs.writeFileSync(
  `${outDir}/groupmap.json`,
  JSON.stringify(groupMap, null, 2),
  "utf-8"
);

// ===== 6. 输出检查文件 =====
let md = "# GroupMap Build Result\n\n";

const keys = Object.keys(groupMap).sort((a, b) =>
  a.localeCompare(b, "zh-Hans-CN")
);

for (const k of keys) {
  const v = groupMap[k];

  const aliasText =
    v.aliases.length > 0 ? ` (aliases: ${v.aliases.join(", ")})` : "";

  md += `- ${k}${aliasText} → ${v.groupNumber}\n`;
}

fs.writeFileSync(`${outDir}/build_check.md`, md, "utf-8");

// ===== 7. 输出日志 =====
console.log("build done:", keys.length, "groups");
