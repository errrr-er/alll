const fs = require("fs");
const path = require("path");

// ====== 0. 路径安全处理 ======
const baseDir = __dirname;
const resultDir = path.join(baseDir, "result");

if (!fs.existsSync(resultDir)) {
  fs.mkdirSync(resultDir, { recursive: true });
}

// ====== 1. 读取 Issue ======
const body = process.env.ISSUE_BODY || "";

// ====== 2. 提取 JSON ======
let data;

try {
  const match = body.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("no json found");

  data = JSON.parse(match[0]);
} catch (e) {
  console.log("JSON parse failed:", e.message);
  process.exit(1);
}

if (!data.items || !Array.isArray(data.items)) {
  console.log("invalid format: items missing");
  process.exit(1);
}

// ====== 3. 构建逻辑 ======
const groupMap = {};

for (const item of data.items) {
  if (!item.name || !item.groupNumber) continue;

  const name = item.name.trim();

  groupMap[name] = {
    groupNumber: item.groupNumber,
    tag: item.tag || "",
    aliases: item.aliases || []
  };
}

// ====== 4. 输出 JSON ======
const output = {
  version: "1.0.0",
  timestamp: Math.floor(Date.now() / 1000),
  group_map: groupMap
};

fs.writeFileSync(
  path.join(resultDir, "groupmap.json"),
  JSON.stringify(output, null, 2),
  "utf-8"
);

// ====== 5. 输出 check 文件 ======
let md = "# GroupMap Build Check\n\n";

for (const k in groupMap) {
  const v = groupMap[k];
  md += `- ${k} → ${v.groupNumber}\n`;
}

fs.writeFileSync(
  path.join(resultDir, "build_check.md"),
  md,
  "utf-8"
);

// ====== 6. log ======
console.log("build done:", Object.keys(groupMap).length);
