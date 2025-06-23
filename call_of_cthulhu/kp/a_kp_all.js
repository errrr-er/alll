// ==UserScript==
// @name         KP群汇总
// @author       3987681449
// @version      1.0.0
// @description  有问题可进群2150284119联系
// @timestamp    1750661665
// 2025-05-11 16:49:17
// @license      Apache-2
// @homepageURL  https://github.com/errrr-er/alll/tree/main
// @updateUrl    https://raw.githubusercontent.com/errrr-er/alll/refs/heads/main/call_of_cthulhu/kp/a_kp_all.js
// @updateUrl    https://ghfast.top/https://raw.githubusercontent.com/errrr-er/alll/refs/heads/main/call_of_cthulhu/kp/a_kp_all.js
// ==/UserScript==


let ext = seal.ext.find('KP群汇总');
if (!ext) {
  ext = seal.ext.new('KP群汇总', 'er', '1.0.0');
  seal.ext.register(ext);
}


// 创建群号映射表
// 格式: { 主关键词: {群号: "123456", 别名: ["alias1", "alias2"]} }
const groupMap = {
	"aib":{ groupNumber: "112077093" },
  	"沧渺山":{ groupNumber: "855215735", aliases: ["cms"] },
  	"天衍纪年":{ groupNumber: "666391763、675869524", aliases: ["天衍", "ty", "tyjn"] },
  	"雪与箱庭之梦":{ groupNumber: "413941306", aliases: ["雪箱"] },
  	"海盗啊海盗":{ groupNumber: "928270526", aliases: ["海盗"] },
  	"左川之国失落谭":{ groupNumber: "770779991", aliases: ["左川"] },
  	"脓堕":{ groupNumber: "183186533", aliases: ["nd"] },
  	"欲望之箱":{ groupNumber: "739976718" },
  	"油盐不进":{ groupNumber: "575319883" },
  	"BASH":{ groupNumber: "774156947", aliases: ["燃星"] },
  	"燃烧的星辰":{ groupNumber: "1049443592" },
  	"快刀乱魔":{ groupNumber: "238285939", aliases: ["快刀"] },
	"快刀乱魔贰":{ groupNumber: "417453795", aliases: ["快刀2"] },
	"dear-flip-flops":{ groupNumber: "345837146", aliases: ["dff"] },
  	"生下他吧":{ groupNumber: "705913038", aliases: ["请生"] },
	"肥皂学校":{ groupNumber: "980188286", aliases: ["肥皂", "皂校"] },
	"旅馆的捕食者":{ groupNumber: "884768719", aliases: ["旅捕", "吕布"] },
	"nobody*2":{ groupNumber: "694908547", aliases: ["nbd"] },
	"4s":{ groupNumber: "926664565", aliases: ["ssss"] },
	"蛙徒的祭典":{ groupNumber: "655890716", aliases: ["蛙祭", "挖机"] },
	"怪物们与邪典仙境":{ groupNumber: "592577986", aliases: ["鞋垫"] },
	"莫索里哀的圣职者":{ groupNumber: "435690433", aliases: ["msla"] },
	"谢娘娘点化":{ groupNumber: "878626807", aliases: ["谢娘娘"] },
	"西比拉":{ groupNumber: "669808359" },
	"远方呢喃":{ groupNumber: "761735153" },
	"不辜马戏团":{ groupNumber: "759642443", aliases: ["不辜"] },
	"void":{ groupNumber: "1170037255" },
	"细胞复位":{ groupNumber: "892835680" },
 	"废楼怪谈":{ groupNumber: "563488359" },
	"明镜，仿佛可以斩断春天":{ groupNumber: "921034670", aliases: ["明镜斩春", "mjzc"] },
	"永虹灰归的Polis":{ groupNumber: "696523899", aliases: ["永虹"] },
	"演绎&本我":{ groupNumber: "583290817", aliases: ["yybw"] },
	"庭师所吟为何物":{ groupNumber: "656434498", aliases: ["庭师"] },
	"幽世常世的满天下":{ groupNumber: "749173986" },
	"恶辣":{ groupNumber: "620832218" },
	"畜牲道":{ groupNumber: "738570884" },
	"magnificas":{ groupNumber: "477317221" },
	"沼泽人":{ groupNumber: "913354882" },
	"渡春风":{ groupNumber: "199382863", aliases: ["dcf", "蛋炒饭"] },
	"哀歌弥赛亚":{ groupNumber: "609355937", aliases: ["哀歌"] },
	"哑蝉的剖白":{ groupNumber: "613231813", aliases: ["哑蝉"] },
	"燃花":{ groupNumber: "795081215" },
	"为谢幕献上祝福的齿轮":{ groupNumber: "714364138", aliases: ["齿轮"] },
	"圣餐":{ groupNumber: "659334919" },
	"终焉之歌为谁而唱":{ groupNumber: "272502055" },
	"ssk":{ groupNumber: "708231245" },
	"屋怪异谭":{ groupNumber: "174136022" },
	"moon cell":{ groupNumber: "817071819" },
	"wts":{ groupNumber: "763188284" },
	"不死灭灭":{ groupNumber: "279755638", },
	"东京g":{ groupNumber: "201906582" },
	"远星者":{ groupNumber: "820393813"},
	"全景敞视主义的陷阱":{ groupNumber: "792650936" },
	"花&葬送者":{ groupNumber: "555632875" },
	"秋永录":{ groupNumber: "922420972、712714985", aliases: ["yql"] },
	"代号行者":{ groupNumber: "433389798" },
  	"属于吾等的安乐之所":{ groupNumber: "826771926" },
	"狼藉夜行":{ groupNumber: "779021829" },
	"黄昏熔解":{ groupNumber: "826823719" },
	"蒙娜丽莎杀死格尔尼卡": { groupNumber: "580704423" },
	"螺旋旅人发问道": { groupNumber: "859933056" },
	"异能警察不是什么英雄": { groupNumber: "873824063" },
	"魔法少女歌唱死亡": { groupNumber: "868665011" },
	"伊卡洛斯的忠堰": { groupNumber: "749121463" },
	"人生restart": { groupNumber: "537691966" },
	"无名集": { groupNumber: "663572400" },
	"猫寿司": { groupNumber: "831331659" },
	"提灯铁鼠": { groupNumber: "882067951" },
	"镜语礼赞": { groupNumber: "882672657" },
	"艺术是死": { groupNumber: "902444229" },
	"落石": { groupNumber: "603178528" },
	"Antinomy": { groupNumber: "101476385" },
	"帕瑞卡颂马戏团": { groupNumber: "760671074" },
	"以撒的狂想曲": { groupNumber: "907783672" },
	"Sillage香水屋": { groupNumber: "921302134" },
	"万人无我": { groupNumber: "929768460", aliases: ["wrww"] },
	"月蜂": { groupNumber: "110208332" },
	"白玉风会录": { groupNumber: "942449479" },
	"渡仙劫": { groupNumber: "634208409" },
	"孤灯弃城": { groupNumber: "877858567" },
	"zinki": { groupNumber: "761916849" },
	"沧渺山": { groupNumber: "855215735" },
	"幕临": { groupNumber: "160438930" },
	"别来无恙": { groupNumber: "907810853" },
	"二重身的证迹": { groupNumber: "285230351" },
	"问道苍生": { groupNumber: "758798519、578441689" },
	"abs": { groupNumber: "941349942" },
	"呼唤爱的谢幕": { groupNumber: "929268821" },
	"天椎谶纬": { groupNumber: "656026457" },
	"ROP": { groupNumber: "783947110、780307937\n*有/无作者" },
	"东京v": { groupNumber: "613821934" },
	"新世界": { groupNumber: "943798191" },
	"废案重组": { groupNumber: "857972438" },
	"清平乐": { groupNumber: "814959956" },
	"舞榭歌台": { groupNumber: "147313715" },
	"x告白": { groupNumber: "575451544" },
	"全蓝综合征": { groupNumber: "941349942" },
	"众妙之门": { groupNumber: "785654926" },
	"雪下残生": { groupNumber: "592418282" },
	"求不得": { groupNumber: "887012952" },
	"天命所归": { groupNumber: "875210475" },
	"纯阳轶事": { groupNumber: "977656290" },
	"相约98": { groupNumber: "542398417" },
	"太岁": { groupNumber: "615878940、703542083\n*发布群/KP群" },
	"失忆后有了三个恋人": { groupNumber: "562613533" },
	"金酒狂热": { groupNumber: "794429121" },
  	"天下第一刀": { groupNumber: "369645861" },
	"雪域下的金色宝藏": { groupNumber: "307758220" },
	"无为有处有还无": { groupNumber: "768399206" },
	"追书人": { groupNumber: "942014926" },
	"望君长留": { groupNumber: "700583235" },
	"侠骨生花": { groupNumber: "617241018" },
	"蟑螂启示录": { groupNumber: "957865225" },
	"午夜的沙": { groupNumber: "864767076" },
	"abo同工同酬": { groupNumber: "991872893" },
	"the name": { groupNumber: "324809275\n*下载群", aliases: ["遗书"] },
	"此夜不可离": { groupNumber: "522206940\n*下载群" },
	"彼都": { groupNumber: "952122633" },
	"血色豪门": { groupNumber: "979353223" },
	"山歌唤梦": { groupNumber: "972586937" },
	"掌中雪": { groupNumber: "860685448\n*下载群" },
	"花联物语": { groupNumber: "716402709" },
	"斩我": { groupNumber: "776965370" },
	"渡圆之": { groupNumber: "953195114" },
	"帷灯匣剑": { groupNumber: "984247613" },
	"朔月笔谈": { groupNumber: "825664784" },
	"不见蓬山": { groupNumber: "834893891" },
	"流水线心脏": { groupNumber: "793350464" },
	"深眠雾梦": { groupNumber: "523093958" },
	"伊卡忠": { groupNumber: "749121463" },
	"长兴镇": { groupNumber: "906847246" },
	"今古空名": { groupNumber: "962147366" },
	"求我": { groupNumber: "978495486" },
	"暗河": { groupNumber: "1031974789" },
	"恰故人归": { groupNumber: "939600700\n*下载群" },
	"坤元劫": { groupNumber: "862291565" },
	"difftruth": { groupNumber: "849680089" },
	"柏拉图的余谈": { groupNumber: "574918635" },
	"告密者": { groupNumber: "623768354" },
	"浮生安梦": { groupNumber: "881234029" },
	"残败桃源": { groupNumber: "2154036156" },
	"VEЯ": { groupNumber: "798805482", aliases: ["ver"] },
  	"三尺微命": { groupNumber: "1031833569\n*无作者" },
	"天地一灯": { groupNumber: "974274779" },
	"亚里斯特拉魔法学院": { groupNumber: "759411294" },
	"北东路疑案": { groupNumber: "953349303" },
	"死刑执行": { groupNumber: "830833837" },
	"黎明之盏": { groupNumber: "835468159" },
	"异教徒": { groupNumber: "810537153", aliases: ["风暴岛"] },
	"少恶世界": { groupNumber: "849810896\n*少恶世界+蚀甚", aliases: ["蚀甚"] },
	"棉花不谢": { groupNumber: "1038645659" },
	"死神的圣域": { groupNumber: "1028029280" },
	"伪装者": { groupNumber: "965809145" },
	"圣土遗梦": { groupNumber: "146415338" },
	"天衍剧组": { groupNumber: "637230426" },
	"GODARCA": { groupNumber: "869783432" },
	"GinGin": { groupNumber: "1035861353" },
	"X休止": { groupNumber: "623836728" },
	"PAC": { groupNumber: "720930120" },
	"非正经修仙": { groupNumber: "645560269" },
	"起承转结": { groupNumber: "1043452922" },
	"未交予的落白": { groupNumber: "1007853163" },
	"幸福与心动的民谣": { groupNumber: "1036780211" },
	"怪胎": { groupNumber: "639870851" },
	"往明": { groupNumber: "1039312225" },
	"正伪的ideal": { groupNumber: "667098598" },
	"列文菲舍变例": { groupNumber: "1040678581" },
	"升平世旧": { groupNumber: "1041314728" },
	"造物者": { groupNumber: "948914482" },
	"拉普拉斯": { groupNumber: "1050071534" },
	"乌洛波洛斯的末日巡演": { groupNumber: "451471718" },
	"奈面": { groupNumber: "933493427" },
	"卡镇": { groupNumber: "297175538" },
	"猩红文档": { groupNumber: "159022627" },
	"流浪武士": { groupNumber: "994791183\n*下载群" },
	"东方快车上的恐怖": { groupNumber: "639753886" },
	"戏法师的感知": { groupNumber: "144919125" },
  	"多灾多难梵达林": { groupNumber: "570879430\n*矿坑+冰塔峰+风暴君王?+风骸岛?", aliases: ["矿坑", "冰塔峰", "风暴君王","风骸岛"] },
	"湮灭之墓": { groupNumber: "868114556" },
	"冰风谷": { groupNumber: "537262507" },
	"斯特拉德的诅咒": { groupNumber: "824773454" },
	"逃离深渊": { groupNumber: "513100948" },
	"龙后的宝山": { groupNumber: "343516463\n*龙后的宝山+提亚马特的崛起", aliases: ["提亚马特的崛起"] },
	"恐怖墓穴": { groupNumber: "329392650" },
	"坠入阿弗纳斯": { groupNumber: "223713820" },
	"巫光之外的荒野": { groupNumber: "594209337" },
	"龙金劫": { groupNumber: "947826784" },
	"溟渊的呼唤": { groupNumber: "431242151" },
	"耀光城": { groupNumber: "728536185" },
	"龙后之影": { groupNumber: "595576485" },
	"德拉肯海姆": { groupNumber: "856703297" },
	"海国战役设定集": { groupNumber: "567135881" },
	"盐沼幽魂": { groupNumber: "926412005" },
	"烛堡": { groupNumber: "467303448" },
	"黄金宝库": { groupNumber: "546468457" },
	"SKT": { groupNumber: "376500876" },
	"阿斯蒙蒂斯之链coa": { groupNumber: "581885602" },
	"游龙之年组": { groupNumber: "693371984" },
	"新矿坑": { groupNumber: "894191386", aliases: ["方尖碑"] },
	"毁灭亲王": { groupNumber: "882887120" },
	"命运转轮": { groupNumber: "241837204" },
	"萨里希斯之光": { groupNumber: "473373105" },
	"博德之门的英雄们": { groupNumber: "1005326913" },
	"维克那的崛起/陨落": { groupNumber: "812018837" },
  	"魔道书": { groupNumber: "759960406" },
	"insane": { groupNumber: "650600421" },
	"赛博朋克d20": { groupNumber: "135248365、283334218" },
	"黑幕圣杯": { groupNumber: "602145072" },
	"梅林杯": { groupNumber: "905396897" },
	"胜率制圣杯": { groupNumber: "535057473" },
	"暗影狂奔": { groupNumber: "245525828" },
	"无限": { groupNumber: "301122594" },
	"绿色三角洲": { groupNumber: "623759380、984765632、253302384", aliases: ["dg"] },
	"月计": { groupNumber: "702203298" },
	"树不子英雄传": { groupNumber: "960918320", aliases: ["RWBY"] },
	"常夜国骑士谭:真祖红舞曲": { groupNumber: "769437181" },
	"忍神": { groupNumber: "750542419、866506419" },
	"ventangle": { groupNumber: "754138533" },
	"无声二重唱": { groupNumber: "965715801" },
	"面包骑士物语": { groupNumber: "951729026" },
	"共鸣性怪异": { groupNumber: "903173796" },
	"brp": { groupNumber: "788438516" },
	"克苏鲁迷踪TOC": { groupNumber: "780909682" },
	"龙蛋物语": { groupNumber: "772645004" },
	"H:tv": { groupNumber: "684526713" },
	"北欧奇谭": { groupNumber: "655192271" },
	"SPC基金会": { groupNumber: "602431810" },
	"妄想症": { groupNumber: "278636978" },
	"魔王之影": { groupNumber: "691528948", aliases: ["SDL"] },
	"双重十字": { groupNumber: "651709429" },
	"双人搜查": { groupNumber: "616576634" },
	"魔女与彩爱": { groupNumber: "421693159" },
	"永夜后日谈": { groupNumber: "710242752" },
	"心脏": { groupNumber: "883465896\n*无全译本" },
	"神话时代": { groupNumber: "316394180\n*无全译本" },
  	"异神成渊": { groupNumber: "916464615" },
	"弥勒佛Mythras": { groupNumber: "316394180" },
	"武侠克苏鲁woc": { groupNumber: "524086123" },
	"永trpg": { groupNumber: "1092736604" },
	"三尺之下": { groupNumber: "976406595" },
	"迷雾之城": { groupNumber: "828730465" },
	"夕妖晚谣": { groupNumber: "746417676" },
	"侠界之旅": { groupNumber: "210679492" },
	"黑暗世界": { groupNumber: "985683120", aliases: ["wod"] },
	"求道": { groupNumber: "983418886" },
	"口胡专用": { groupNumber: "106133577" },
	"举头三尺": { groupNumber: "334821036" },
	"角色桌": { groupNumber: "471191700", aliases: ["语擦"] },
	"吹笛子的海獭": { groupNumber: "468213532" },
	"dnd纯女": { groupNumber: "560604565、960874614、780528057" },
	"dnd纯dm": { groupNumber: "421678315" },
	"雪域下的黄金宝藏": { groupNumber: "527406942\n*下载群\n*仅限扫码进群" },
	"空箱间": { groupNumber: "858801418、1044331385\n*下载/KP群" },
	"CandelaObscura": { groupNumber: "1053180006、1049162012\n*交流/GM群", aliases: ["暗烛"] },
	"春花秋月": { groupNumber: "813932679" },
	"小众规则综合群": { groupNumber: "945728295" },
	"摇曳群青": { groupNumber: "513712312" },
	"幽诱 , 于指尖燃起": { groupNumber: "978331360",aliases: ["幽诱"] },
	"星海孤舟": { groupNumber: "657774576\n*下载群" },
	"龙滨不良": { groupNumber: "597585029" },
	"侦探可有翅膀吗": { groupNumber: "963854131",aliases: ["侦探翅"] },
	"一梦": { groupNumber: "431528579\n*发布+KP群" },
	"异能儿童管理机构": { groupNumber: "786412774、817252450\n*发布群/KP群(仅扫码)" },
	"雪山密室": { groupNumber: "901413729" },
	"凤去台空江自流": { groupNumber: "979768022、985261346\n瑰绿的决心+天地熔金+凤去台空江自流\n*发布群",aliases: ["瑰绿的决心", "天地熔金"] },
	"靖海难": { groupNumber: "343026343" },
};

// "": { groupNumber: "" },

// "": { groupNumber: "",aliases: [""] },

// 计算两个字符串的相似度 (Levenshtein距离)
function getSimilarity(s1, s2) {
  // 对字符排序后计算Levenshtein距离（语序无关）
  const sorted1 = s1.toLowerCase().split('').sort().join('');
  const sorted2 = s2.toLowerCase().split('').sort().join('');
  
  // 继续使用原有的Levenshtein距离计算
  const len1 = s1.length;
  const len2 = s2.length;
  
  const matrix = [];
  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,     // 删除
        matrix[i][j - 1] + 1,     // 插入
        matrix[i - 1][j - 1] + cost  // 替换
      );
    }
  }
  
  const distance = matrix[len1][len2];
  const maxLen = Math.max(len1, len2);
  return 1 - distance / maxLen;
}

// 计算两个字符串的相似度（结合Levenshtein和Jaccard）
function getSimilarity(s1, s2) {
  // 转换为小写
  s1 = s1.toLowerCase();
  s2 = s2.toLowerCase();

  // 1. 计算Levenshtein相似度（原有方法）
  function getLevenshteinScore(a, b) {
    const len1 = a.length;
    const len2 = b.length;
    const matrix = [];
    for (let i = 0; i <= len1; i++) matrix[i] = [i];
    for (let j = 0; j <= len2; j++) matrix[0][j] = j;
    for (let i = 1; i <= len1; i++) {
      for (let j = 1; j <= len2; j++) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j - 1] + cost
        );
      }
    }
    const distance = matrix[len1][len2];
    return 1 - distance / Math.max(len1, len2);
  }

  // 2. 计算Jaccard相似度（语序无关）
  function getJaccardScore(a, b) {
    const set1 = new Set(a.split(''));
    const set2 = new Set(b.split(''));
    const intersection = new Set([...set1].filter(c => set2.has(c))).size;
    const union = new Set([...set1, ...set2]).size;
    return union === 0 ? 0 : intersection / union;
  }

  // 返回两种相似度的最大值（兼顾精准度和语序容忍）
  return Math.max(
    getLevenshteinScore(s1, s2),
    getJaccardScore(s1, s2)
  );
}

function findSimilarGroup(input) {
  input = input.toLowerCase();
  const matchedGroups = [];

  // 遍历所有群组
  for (const groupName in groupMap) {
    const groupInfo = groupMap[groupName];
    let highestScore = 0;

    // 计算主名称相似度
    const mainScore = getSimilarity(input, groupName.toLowerCase());
    highestScore = Math.max(highestScore, mainScore);

    // 计算别名相似度
    if (groupInfo.aliases) {
      for (const alias of groupInfo.aliases) {
        const aliasScore = getSimilarity(input, alias.toLowerCase());
        highestScore = Math.max(highestScore, aliasScore);
      }
    }

    // 记录相似度>=0.3的群组
    if (highestScore >= 0.3) {
      matchedGroups.push({
        name: groupName,
        info: groupInfo,
        score: highestScore  // 保留相似度用于排序
      });
    }
  }

  // 按相似度降序排列
  matchedGroups.sort((a, b) => b.score - a.score);

  return matchedGroups.length > 0 ? matchedGroups : null;
}

// 生成所有群组信息
function generateGroupList() {
  let listLines = [];
  for (const groupName in groupMap) {
    const groupInfo = groupMap[groupName];
    let aliasText = '';
    if (groupInfo.aliases && groupInfo.aliases.length > 0) {
      aliasText = `(${groupInfo.aliases.join('、')})`;
    }
    listLines.push(`${groupName}${aliasText} → ${groupInfo.groupNumber}`);
  }
  return listLines.join('\n');
}

// 创建.kp指令
const cmdKp = seal.ext.newCmdItemInfo();
cmdKp.name = 'kp';
cmdKp.help = `KP群查询指令
.kp <关键词>    // 查询特定KP群号
.kp list        // 列出所有KP群信息
.kp help        // 显示本帮助`;

// 修改.kp指令的solve函数
cmdKp.solve = (ctx, msg, cmdArgs) => {
  let ret = seal.ext.newCmdExecuteResult(true);
  const input = cmdArgs.getArgN(1);
  
  // 帮助命令
  if (input === 'help' || input === '') {
    ret.showHelp = true;
    return ret;
  }
  
  // 列出所有群组
  if (input.toLowerCase() === 'list') {
    const listText = `所有KP群信息:\n${generateGroupList()}\n\n请以图片里的为准，有问题请进2150284119反馈\n[CQ:image,file=https://github.com/errrr-er/alll/blob/main/call_of_cthulhu/kp/kp.png?raw=true,type=show]`;
    seal.replyToSender(ctx, msg, listText);
    return ret;
  }
  
  // 查找匹配的群组
  let foundGroup = null;
  let exactMatch = false;
  
  // 1. 检查主关键词（不区分大小写）
  const lowerInput = input.toLowerCase();
  for (const groupName in groupMap) {
    if (groupName.toLowerCase() === lowerInput) {
      foundGroup = { match: { name: groupName, info: groupMap[groupName] }, score: 1 };
      exactMatch = true;
      break;
    }
  }
  
  // 2. 检查所有群组的别名（不区分大小写）
  if (!foundGroup) {
    for (const groupName in groupMap) {
      const groupInfo = groupMap[groupName];
      if (groupInfo.aliases) {
        for (const alias of groupInfo.aliases) {
          if (alias.toLowerCase() === lowerInput) {
            foundGroup = { match: { name: groupName, info: groupInfo }, score: 1 };
            exactMatch = true;
            break;
          }
        }
      }
      if (exactMatch) break;
    }
  }
  
  // 3. 如果没有精确匹配，尝试近似匹配
  if (!foundGroup) {
    foundGroup = findSimilarGroup(input);
  }
  
  // 查找匹配的群组
  const matchedGroups = findSimilarGroup(input);

  if (matchedGroups) {
    let replyText = `找到以下匹配【${input}】的KP群（按相似度排序）：\n`;
    matchedGroups.forEach(group => {
      replyText += `\n【${group.name}】→ ${group.info.groupNumber} (相似度: ${Math.round(group.score * 100)}%)`;
    });
    seal.replyToSender(ctx, msg, replyText);
  } else {
    seal.replyToSender(ctx, msg, `未找到匹配【${input}】的KP群。使用 .kp list 查看所有群组。`);
  }

  return ret;
};

// 注册指令
ext.cmdMap['kp'] = cmdKp;
