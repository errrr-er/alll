const fs = require("fs");
const path = require("path");

// ====== 0. 路径 ======
const baseDir = __dirname;
const resultDir = path.join(baseDir, "result");
const outputPath = path.join(resultDir, "groupmap.json");

if (!fs.existsSync(resultDir)) {
  fs.mkdirSync(resultDir, { recursive: true });
}

// ====== 1. 读取 issue ======
const body = process.env.ISSUE_BODY || "";

// ====== 2. 解析 JSON ======
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

// ====== 3. 读取旧数据（关键升级点） ======
let oldData = {
  version: "1.0.0",
  timestamp: Math.floor(Date.now() / 1000),
  group_map: {}
};

if (fs.existsSync(outputPath)) {
  try {
    oldData = JSON.parse(fs.readFileSync(outputPath, "utf-8"));
  } catch (e) {
    console.log("old json broken, fallback to empty");
  }
}

// ====== 4. merge 逻辑 ======
const groupMap = oldData.group_map || {};

for (const item of data.items) {
  if (!item.name || !item.groupNumber) continue;

  const name = item.name.trim();

  const newEntry = {
    groupNumber: item.groupNumber,
    aliases: item.aliases || []
  };

  // 如果已经存在 → 合并（不是覆盖）
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

// ====== 5. 输出 ======
const output = {
  version: oldData.version || "1.0.0",
  timestamp: Math.floor(Date.now() / 1000),
  group_map: groupMap
};

// ====== 6. 写文件（每行一个 entry） ======
const lines = Object.entries(groupMap)
  .map(([k, v]) => `    "${k}": ${JSON.stringify(v)}`)
  .join(",\n");

const finalJson =
`{
  "version": "${output.version}",
  "timestamp": ${output.timestamp},
  "group_map": {
${lines}
  }
}`;

fs.writeFileSync(outputPath, finalJson, "utf-8");

// ====== 7. check 文件 ======
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

// ====== 8. log ======
console.log("build done:", Object.keys(groupMap).length);
