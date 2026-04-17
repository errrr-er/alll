const fs = require("fs");

const body = process.env.ISSUE_BODY || "";

// ========== 1. 解析 JSON ==========
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

// ========== 2. 构建 ==========
const groupMap = {};
const check = {
  duplicateName: [],
  duplicateGroupNumber: [],
  invalid: []
};

const groupNumberIndex = new Map();

function normalizeGroupNumber(str) {
  if (!str) return "";

  // 保留数字 + 中文 + 逗号拆分
  return str
    .split("\n")
    .map(v => v.replace(/\*(.+)?$/, "").trim())
    .filter(Boolean)
    .join(",");
}

for (const item of data.items) {
  if (!item.name) {
    check.invalid.push(item);
    continue;
  }

  const name = item.name.trim();

  const groupNumber = normalizeGroupNumber(item.groupNumber);
  const aliases = Array.isArray(item.aliases) ? item.aliases : [];

  // 重复 name 检查
  if (groupMap[name]) {
    check.duplicateName.push(name);
  }

  // groupNumber 重复检测
  if (groupNumberIndex.has(groupNumber)) {
    check.duplicateGroupNumber.push({
      groupNumber,
      first: groupNumberIndex.get(groupNumber),
      current: name
    });
  } else {
    groupNumberIndex.set(groupNumber, name);
  }

  groupMap[name] = {
    groupNumber,
    ...(aliases.length ? { aliases } : {})
  };
}

// ========== 3. 输出最终 JSON ==========
const output = {
  version: "1.0.0",
  timestamp: Math.floor(Date.now() / 1000),
  group_map: groupMap
};

fs.writeFileSync(
  "result/groupmap.json",
  JSON.stringify(output, null, 2),
  "utf-8"
);

// ========== 4. 输出检查文件 ==========
const md =
`# Build Check Report

## Duplicate Names
${check.duplicateName.map(v => `- ${v}`).join("\n") || "None"}

## Duplicate Group Numbers
${check.duplicateGroupNumber.map(v =>
  `- ${v.groupNumber} (${v.first} → ${v.current})`
).join("\n") || "None"}

## Invalid Items
${check.invalid.length}
`;

fs.writeFileSync("result/build_check.md", md, "utf-8");

console.log("build done:", Object.keys(groupMap).length);
