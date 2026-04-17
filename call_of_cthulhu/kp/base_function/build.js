const fs = require("fs");

const body = process.env.ISSUE_BODY || "";

// 提取
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

// 构建
const groupMap = {};

for (const item of data.items) {
  if (!item.name || !item.groupNumber) continue;

  groupMap[item.name] = {
    groupNumber: item.groupNumber,
    tag: item.tag || "",
    aliases: item.aliases || []
  };
}

// 输出
fs.writeFileSync(
  "groupmap.json",
  JSON.stringify(groupMap, null, 2),
  "utf-8"
);

// 同时输出一个可读 md
let md = "# GroupMap Build Result\n\n";

for (const k in groupMap) {
  const v = groupMap[k];
  md += `- ${k} → ${v.groupNumber}\n`;
}

fs.writeFileSync("build_check.md", md, "utf-8");

console.log("build done:", Object.keys(groupMap).length);
