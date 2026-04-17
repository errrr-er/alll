const fs = require("fs");
const path = require("path");

// =======================
// 0. 输出目录（必须存在）
// =======================
const baseDir = __dirname;
const resultDir = path.join(baseDir, "result");
fs.mkdirSync(resultDir, { recursive: true });

// =======================
// 1. 读取 issue
// =======================
const body = process.env.ISSUE_BODY || "";

// =======================
// 2. 清洗 + 解析 JSON
// =======================
let data;
let error = null;

try {
  const cleaned = body
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  const match = cleaned.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("no json found in issue body");

  data = JSON.parse(match[0]);
} catch (e) {
  error = e.message;
  data = { items: [] };
}

// 如果失败，写错误报告（避免空PR）
if (error) {
  fs.writeFileSync(
    path.join(resultDir, "build_error.md"),
    `# Build Failed\n\n${error}`,
    "utf-8"
  );
}

// =======================
// 3. 构建 groupMap
// =======================
const groupMap = {};

const groupNumberSet = new Set();
const aliasSet = new Set();

const warnings = {
  duplicateGroupNumber: [],
  duplicateAlias: []
};

if (Array.isArray(data.items)) {
  for (const item of data.items) {
    if (!item.name || !item.groupNumber) continue;

    const name = item.name.trim();
    const groupNumber = String(item.groupNumber);

    // groupNumber 重复检测
    if (groupNumberSet.has(groupNumber)) {
      warnings.duplicateGroupNumber.push(groupNumber);
    }
    groupNumberSet.add(groupNumber);

    // alias 重复检测
    const aliases = item.aliases || [];
    for (const a of aliases) {
      if (aliasSet.has(a)) {
        warnings.duplicateAlias.push(a);
      }
      aliasSet.add(a);
    }

    groupMap[name] = {
      groupNumber,
      aliases
    };
  }
}

// =======================
// 4. 排序（拼音排序）
// =======================
const pinyin = require("pinyin");

function sortKey(str) {
  return pinyin(str, {
    style: pinyin.STYLE_NORMAL
  }).flat().join("").toLowerCase();
}

const sorted = Object.entries(groupMap).sort((a, b) =>
  sortKey(a[0]).localeCompare(sortKey(b[0]))
);

const sortedMap = Object.fromEntries(sorted);

// =======================
// 5. 输出 JSON（紧凑一行结构）
// =======================
const output = {
  version: "1.0.0",
  timestamp: Math.floor(Date.now() / 1000),
  group_map: sortedMap
};

fs.writeFileSync(
  path.join(resultDir, "groupmap.json"),
  JSON.stringify(output, null, 0),
  "utf-8"
);

// =======================
// 6. build_check
// =======================
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

console.log("build done:", Object.keys(groupMap).length);
