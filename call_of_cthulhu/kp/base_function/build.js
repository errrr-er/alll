const fs = require("fs");
const path = require("path");

const body = process.env.ISSUE_BODY || "";

// ===== 0. 输出路径 =====
const resultDir = path.join(__dirname, "result");

// 自动创建目录（防炸）
if (!fs.existsSync(resultDir)) {
  fs.mkdirSync(resultDir, { recursive: true });
}

// ===== 1. 解析 JSON =====
let data;

try {
  const match = body.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("no json found");

  data = JSON.parse(match[0]);
} catch (e) {
  console.log("JSON parse failed:", e.message);

  // 👉 防止 workflow 直接炸掉（更安全）
  process.exit(1);
}

if (!Array.isArray(data.items)) {
  console.log("invalid format: items missing");
  process.exit(1);
}

// ===== 2. 拼音排序 =====
const pinyin = require("pinyin");

function sortKey(str) {
  if (!str) return "";

  return pinyin(str, {
    style: pinyin.STYLE_NORMAL
  }).flat().join("").toLowerCase();
}

// ===== 3. 构建 =====
const groupMap = {};

const groupNumberSet = new Set();
const aliasSet = new Set();

const warnings = {
  duplicateGroupNumber: [],
  duplicateAlias: []
};

for (const item of data.items) {
  if (!item.name || !item.groupNumber) continue;

  const name = item.name.trim();
  const groupNumber = String(item.groupNumber);

  // ===== groupNumber 重复检测 =====
  if (groupNumberSet.has(groupNumber)) {
    warnings.duplicateGroupNumber.push(groupNumber);
  }
  groupNumberSet.add(groupNumber);

  // ===== alias 重复检测 =====
  const aliases = item.aliases || [];
  for (const a of aliases) {
    if (aliasSet.has(a)) {
      warnings.duplicateAlias.push(a);
    }
    aliasSet.add(a);
  }

  // ✔ 已删除 tag
  groupMap[name] = {
    groupNumber,
    aliases
  };
}

// ===== 4. 排序 =====
const sortedEntries = Object.entries(groupMap).sort((a, b) => {
  return sortKey(a[0]).localeCompare(sortKey(b[0]));
});

const sortedGroupMap = {};
for (const [k, v] of sortedEntries) {
  sortedGroupMap[k] = v;
}

// ===== 5. 输出 JSON =====
const output = {
  version: "1.0.0",
  timestamp: Math.floor(Date.now() / 1000),
  group_map: sortedGroupMap
};

// ✔ 紧凑输出（一行结构）
const jsonText = JSON.stringify(output, null, 0);

fs.writeFileSync(
  path.join(resultDir, "groupmap.json"),
  jsonText,
  "utf-8"
);

// ===== 6. build_check =====
let md = "# GroupMap Build Check\n\n";

md += "## Duplicate groupNumber\n";
md += warnings.duplicateGroupNumber.length
  ? warnings.duplicateGroupNumber.map(x => `- ${x}`).join("\n")
  : "- none";

md += "\n\n## Duplicate aliases\n";
md += warnings.duplicateAlias.length
  ? warnings.duplicateAlias.map(x => `- ${x}`).join("\n")
  : "- none";

fs.writeFileSync(
  path.join(resultDir, "build_check.md"),
  md,
  "utf-8"
);

// ===== 7. log =====
console.log("build done:", Object.keys(groupMap).length);
