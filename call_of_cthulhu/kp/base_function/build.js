const fs = require("fs");
const path = require("path");
const pinyin = require("pinyin");

// 🔥 强制稳定路径（关键修复）
process.chdir(__dirname);

const body = process.env.ISSUE_BODY || "";

// ===== 0. 输出目录 =====
const resultDir = path.join(__dirname, "result");
fs.mkdirSync(resultDir, { recursive: true });

// ===== 1. 解析 JSON =====
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
  console.log("invalid format");
  process.exit(1);
}

// ===== 2. 拼音排序 key =====
function sortKey(str) {
  return pinyin(str, {
    style: pinyin.STYLE_NORMAL
  })
    .flat()
    .join("")
    .toLowerCase();
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

  // groupNumber 去重检查
  if (groupNumberSet.has(groupNumber)) {
    warnings.duplicateGroupNumber.push(groupNumber);
  }
  groupNumberSet.add(groupNumber);

  // alias 去重检查
  const aliases = item.aliases || [];
  for (const a of aliases) {
    if (aliasSet.has(a)) {
      warnings.duplicateAlias.push(a);
    }
    aliasSet.add(a);
  }

  // ❌ 已删除 tag（你要求的）
  groupMap[name] = {
    groupNumber,
    aliases
  };
}

// ===== 4. 拼音排序（中英混合）=====
const sorted = Object.entries(groupMap).sort((a, b) =>
  sortKey(a[0]).localeCompare(sortKey(b[0]))
);

const sortedGroupMap = Object.fromEntries(sorted);

// ===== 5. 输出 JSON（单行紧凑）=====
const output = {
  version: "1.0.0",
  timestamp: Math.floor(Date.now() / 1000),
  group_map: sortedGroupMap
};

// 👉 一行 JSON（你要的）
fs.writeFileSync(
  path.join(resultDir, "groupmap.json"),
  JSON.stringify(output),
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

console.log("build done:", Object.keys(groupMap).length);
