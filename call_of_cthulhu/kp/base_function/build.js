const fs = require("fs");
const path = require("path");

// ===== 路径 =====
const baseDir = __dirname;
const resultDir = path.join(baseDir, "result");
const outputPath = path.join(resultDir, "groupmap.json");

// ===== 保证目录存在 =====
if (!fs.existsSync(resultDir)) {
  fs.mkdirSync(resultDir, { recursive: true });
}

// ===== 读取 issue =====
const body = process.env.ISSUE_BODY || "";

// ===== 解析 JSON =====
let data;

try {
  const match = body.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("no json found");

  data = JSON.parse(match[0]);
} catch (e) {
  console.log("JSON parse failed:", e.message);
  process.exit(1);
}

if (!Array.isArray(data.items)) {
  console.log("invalid format: items missing");
  process.exit(1);
}

// ===== 读取旧数据（用于 merge）=====
let oldData = {
  version: "1.0.0",
  timestamp: Math.floor(Date.now() / 1000),
  group_map: {}
};

if (fs.existsSync(outputPath)) {
  try {
    oldData = JSON.parse(fs.readFileSync(outputPath, "utf-8"));
  } catch (e) {
    console.log("old file broken, reset");
  }
}

// ===== merge =====
const groupMap = oldData.group_map || {};

for (const item of data.items) {
  if (!item.name || !item.groupNumber) continue;

  const name = item.name.trim();

  const newEntry = {
    groupNumber: item.groupNumber,
    aliases: item.aliases || []
  };

  if (groupMap[name]) {
    const prev = groupMap[name];

    groupMap[name] = {
      groupNumber: prev.groupNumber || newEntry.groupNumber,
      aliases: Array.from(new Set([
        ...(prev.aliases || []),
        ...(newEntry.aliases || [])
      ]))
    };
  } else {
    groupMap[name] = newEntry;
  }
}

// ===== 输出 =====
const lines = Object.entries(groupMap)
  .map(([k, v]) => `    "${k}": ${JSON.stringify(v)}`)
  .join(",\n");

const finalJson = `{
  "version": "${oldData.version || "1.0.0"}",
  "timestamp": ${Math.floor(Date.now() / 1000)},
  "group_map": {
${lines}
  }
}`;

fs.writeFileSync(outputPath, finalJson, "utf-8");

// ===== check 文件 =====
let md = "# GroupMap Build Check\n\n";

for (const k in groupMap) {
  md += `- ${k} → ${groupMap[k].groupNumber}\n`;
}

fs.writeFileSync(
  path.join(resultDir, "build_check.md"),
  md,
  "utf-8"
);

console.log("build done:", Object.keys(groupMap).length);
