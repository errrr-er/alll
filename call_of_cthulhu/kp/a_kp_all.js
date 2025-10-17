// ==UserScript==
// @name         KP群汇总
// @author       3987681449
// @version      4.0.0
// @description  (.kp)有问题可进群2150284119联系
// @timestamp    1760721961
// 2025-05-11 16:49:17
// @license      Apache-2
// @homepageURL  https://github.com/errrr-er/alll/tree/main
// @updateUrl    https://ghfast.top/https://raw.githubusercontent.com/errrr-er/alll/refs/heads/main/call_of_cthulhu/kp/a_kp_all.js
// @updateUrl    https://raw.githubusercontent.com/errrr-er/alll/refs/heads/main/call_of_cthulhu/kp/a_kp_all.js
// ==/UserScript==


let ext = seal.ext.find('KP群汇总');
if (!ext) {
  ext = seal.ext.new('KP群汇总', 'er', '4.0.0');
  seal.ext.register(ext);
}

// 自动获取当前脚本的时间戳
function getCurrentTimestamp() {
    return 1746972557;
}

// 用户提醒记录
const userLastNotify = new Map();

// 获取GitHub最新版本信息
async function getGitHubVersion() {
    try {
        const rawUrl = 'https://raw.githubusercontent.com/errrr-er/alll/main/call_of_cthulhu/kp/a_kp_all.js';
        const response = await fetch(rawUrl);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const content = await response.text();
        
        // 解析时间戳
        const timestampMatch = content.match(/@timestamp\s+(\d+)/);
        if (timestampMatch) {
            const timestamp = parseInt(timestampMatch[1]);
            const date = new Date(timestamp * 1000);
            return {
                timestamp: timestamp,
                date: date,
                formattedDate: date.toLocaleString('zh-CN')
            };
        }
        
        return null;
    } catch (error) {
        console.error('获取GitHub版本时出错:', error);
        throw error;
    }
}

// 后台检查更新的函数
async function checkUpdateOnce(ctx, msg, userId) {
    try {
        const githubVersion = await getGitHubVersion();
        if (!githubVersion) return;
        
        const currentTimestamp = getCurrentTimestamp();
        
        if (githubVersion.timestamp > currentTimestamp) {
            setTimeout(() => {
                seal.replyToSender(ctx, msg, 
                    `发现新版本！最后更新: ${githubVersion.formattedDate}`
                );
            }, 1000);
        }
    } catch (error) {
        // 静默处理
    }
}

// 创建群号映射表
// 格式: { 主关键词: {群号: "123456", 别名: ["alias1", "alias2"]} }
const groupMap = {
	// KP
	"4s":{ groupNumber: "926664565", aliases: ["ssss"] },
	"阿斯蒙蒂斯之链coa": { groupNumber: "581885602" },
	"哀歌弥赛亚":{ groupNumber: "609355937", aliases: ["哀歌"] },
	"暗河": { groupNumber: "1031974789" },
	"暗影狂奔": { groupNumber: "245525828" },
	"白玉风会录": { groupNumber: "942449479" },
	"柏拉图的余谈": { groupNumber: "574918635" },
	"北东路疑案": { groupNumber: "953349303" },
	"彼都": { groupNumber: "952122633" },
	"别来无恙": { groupNumber: "907810853" },
	"冰风谷": { groupNumber: "537262507" },
	"博德之门的英雄们": { groupNumber: "1005326913" },
	"不辜马戏团":{ groupNumber: "759642443", aliases: ["不辜"] },
	"不见蓬山": { groupNumber: "834893891" },
	"不死灭灭":{ groupNumber: "279755638", },
	"残败桃源": { groupNumber: "2154036156" },
	"沧渺山":{ groupNumber: "855215735", aliases: ["cms"] },
	"常夜国骑士谭:真祖红舞曲": { groupNumber: "769437181" },
	"抽刀": { groupNumber: "1057856638" },
	"畜牲道":{ groupNumber: "738570884" },
	"吹笛子的海獭": { groupNumber: "468213532" },
	"春花秋月": { groupNumber: "813932679" },
	"纯阳轶事": { groupNumber: "977656290" },
	"代号行者":{ groupNumber: "433389798" },
	"德拉肯海姆": { groupNumber: "856703297" },
	"东方快车上的恐怖": { groupNumber: "639753886" },
	"东京g":{ groupNumber: "201906582" },
	"东京v": { groupNumber: "613821934" },
	"渡春风":{ groupNumber: "199382863", aliases: ["dcf", "蛋炒饭"] },
	"渡仙劫": { groupNumber: "634208409" },
	"渡圆之": { groupNumber: "953195114" },
	"多灾多难梵达林": { groupNumber: "570879430\n*矿坑+冰塔峰+风暴君王?+风骸岛?", aliases: ["矿坑", "冰塔峰", "风暴君王","风骸岛"] },
	"恶辣":{ groupNumber: "620832218" },
	"二重身的证迹": { groupNumber: "285230351" },
	"非正经修仙": { groupNumber: "645560269" },
	"肥皂学校":{ groupNumber: "980188286", aliases: ["肥皂", "皂校"] },
	"废案重组": { groupNumber: "857972438" },
	"废楼怪谈":{ groupNumber: "563488359" },
	"凤去台空江自流": { groupNumber: "979768022、985261346\n瑰绿的决心+天地熔金+凤去台空江自流+人间烟火+问天地\n*下载",aliases: ["瑰绿的决心", "天地熔金", "人间烟火", "问天地"] },
	"浮生安梦": { groupNumber: "881234029" },
	"高塔之死": { groupNumber: "623768354\n*战役集KP群" },
	"告密者": { groupNumber: "623768354" },
	"歌味觉死": { groupNumber: "616756545\n*路易斯安那系列+畅梦人+淤泥之花与空心石" },
	"孤灯弃城": { groupNumber: "877858567" },
	"怪胎": { groupNumber: "639870851" },
	"怪物们与邪典仙境":{ groupNumber: "592577986", aliases: ["鞋垫"] },
	"海盗啊海盗":{ groupNumber: "928270526", aliases: ["海盗"] },
	"海国战役设定集": { groupNumber: "567135881" },
	"黑暗世界": { groupNumber: "985683120", aliases: ["wod"] },
	"黑幕圣杯": { groupNumber: "602145072" },
	"呼唤爱的谢幕": { groupNumber: "929268821" },
	"花&葬送者":{ groupNumber: "555632875、106559548", aliases: ["花葬"] },
	"花盗人之恋": { groupNumber: "966519249" },
	"花联物语": { groupNumber: "716402709" },
	"黄昏熔解":{ groupNumber: "826823719" },
	"黄金宝库": { groupNumber: "546468457" },
	"毁灭亲王": { groupNumber: "882887120" },
	"继续工作直到毁灭": { groupNumber: "822840569" },
	"祭日颂": { groupNumber: "717598559" },
	"今古空名": { groupNumber: "962147366" },
	"金酒狂热": { groupNumber: "794429121" },
	"靖海难": { groupNumber: "343026343" },
	"镜语礼赞": { groupNumber: "882672657" },
	"举头三尺": { groupNumber: "334821036" },
	"卡镇": { groupNumber: "297175538" },
	"恐怖墓穴": { groupNumber: "329392650" },
	"快刀乱魔":{ groupNumber: "238285939", aliases: ["快刀"] },
	"快刀乱魔贰":{ groupNumber: "417453795", aliases: ["快刀2"] },
	"拉普拉斯": { groupNumber: "1050071534" },
	"狼藉夜行":{ groupNumber: "779021829" },
	"黎明之盏": { groupNumber: "835468159" },
	"连海密录": { groupNumber: "926024691" },
	"列文菲舍变例": { groupNumber: "1040678581" },
	"流水线心脏": { groupNumber: "793350464" },
	"龙滨不良": { groupNumber: "597585029",aliases: ["lbbl"] },
	"龙蛋物语": { groupNumber: "772645004" },
	"龙后的宝山": { groupNumber: "343516463\n*龙后的宝山+提亚马特的崛起", aliases: ["提亚马特的崛起"] },
	"龙后之影": { groupNumber: "595576485" },
	"龙金劫": { groupNumber: "947826784" },
	"旅馆的捕食者":{ groupNumber: "884768719", aliases: ["旅捕", "吕布"] },
	"绿色三角洲": { groupNumber: "623759380、984765632、253302384、1061755248", aliases: ["dg"] },
	"螺旋旅人发问道": { groupNumber: "859933056" },
	"落石": { groupNumber: "603178528" },
	"猫寿司": { groupNumber: "831331659" },
	"梅林杯": { groupNumber: "905396897" },
	"蒙娜丽莎杀死格尔尼卡": { groupNumber: "580704423" },
	"弥勒佛Mythras": { groupNumber: "316394180" },
	"迷雾之城": { groupNumber: "828730465" },
	"棉花不谢": { groupNumber: "1038645659" },
	"面包骑士物语": { groupNumber: "951729026" },
	"明镜，仿佛可以斩断春天":{ groupNumber: "921034670", aliases: ["明镜斩春", "mjzc"] },
	"溟渊的呼唤": { groupNumber: "431242151" },
	"命运转轮": { groupNumber: "241837204" },
	"魔法少女歌唱死亡": { groupNumber: "868665011" },
	"魔女与彩爱": { groupNumber: "421693159" },
	"魔王之影": { groupNumber: "691528948", aliases: ["SDL"] },
	"莫索里哀的圣职者":{ groupNumber: "435690433", aliases: ["msla"] },
	"幕临": { groupNumber: "160438930" },
	"奈面": { groupNumber: "933493427" },
	"你是谁？请支持百日○纪！": { groupNumber: "1057449882",aliases: ["百日"] },
	"脓堕":{ groupNumber: "183186533", aliases: ["nd"] },
	"帕瑞卡颂马戏团": { groupNumber: "760671074" },
	"起承转结": { groupNumber: "1043452922" },
	"清平乐": { groupNumber: "814959956" },
	"秋永录":{ groupNumber: "922420972、712714985", aliases: ["yql"] },
	"求不得": { groupNumber: "887012952" },
	"求道": { groupNumber: "983418886" },
	"全景敞视主义的陷阱":{ groupNumber: "792650936" },
	"全蓝综合征": { groupNumber: "941349942" },
	"燃花":{ groupNumber: "795081215" },
	"燃烧的星辰":{ groupNumber: "1049443592" },
	"染色空白卡": { groupNumber: "657347350" },
	"人生restart": { groupNumber: "537691966" },
	"忍神": { groupNumber: "750542419、866506419" },
	"萨里希斯之光": { groupNumber: "473373105" },
	"三尺微命": { groupNumber: "1031833569\n*无作者" },
	"三尺之下": { groupNumber: "976406595" },
	"山歌唤梦": { groupNumber: "972586937" },
	"少恶世界": { groupNumber: "849810896\n*少恶世界+蚀甚", aliases: ["蚀甚"] },
	"深眠雾梦": { groupNumber: "523093958" },
	"神话时代": { groupNumber: "316394180\n*无全译本" },
	"升平世旧": { groupNumber: "1041314728" },
	"生下他吧":{ groupNumber: "705913038", aliases: ["请生"] },
	"圣餐":{ groupNumber: "659334919" },
	"圣土遗梦": { groupNumber: "146415338" },
	"胜率制圣杯": { groupNumber: "535057473" },
	"失忆后有了三个恋人": { groupNumber: "562613533" },
	"属于吾等的安乐之所":{ groupNumber: "826771926" },
	"树不子英雄传": { groupNumber: "960918320", aliases: ["RWBY"] },
	"双重十字": { groupNumber: "651709429" },
	"朔月笔谈": { groupNumber: "825664784" },
	"斯特拉德的诅咒": { groupNumber: "824773454" },
	"死神的圣域": { groupNumber: "1028029280" },
	"死刑执行": { groupNumber: "830833837" },
	"逃离深渊": { groupNumber: "513100948" },
	"提灯铁鼠": { groupNumber: "882067951" },
	"天椎谶纬": { groupNumber: "656026457" },
	"天地一灯": { groupNumber: "974274779" },
	"天命所归": { groupNumber: "875210475" },
	"天下第一刀": { groupNumber: "369645861、369645861\n*有/无作者" },
	"天衍纪年":{ groupNumber: "666391763、675869524", aliases: ["天衍", "ty", "tyjn"] },
	"天衍剧组": { groupNumber: "637230426" },
	"庭师所吟为何物":{ groupNumber: "656434498", aliases: ["庭师"] },
	"蛙徒的祭典":{ groupNumber: "655890716", aliases: ["蛙祭", "挖机"] },
	"万人无我": { groupNumber: "929768460", aliases: ["wrww"] },
	"往明": { groupNumber: "1039312225" },
	"妄想症": { groupNumber: "278636978" },
	"望君长留": { groupNumber: "700583235" },
	"帷灯匣剑": { groupNumber: "984247613" },
	"维克那的崛起/陨落": { groupNumber: "812018837" },
	"伪装者": { groupNumber: "965809145" },
	"为谢幕献上祝福的齿轮":{ groupNumber: "714364138", aliases: ["齿轮"] },
	"未交予的落白": { groupNumber: "1007853163" },
	"问道苍生": { groupNumber: "758798519、578441689" },
	"乌洛波洛斯的末日巡演": { groupNumber: "451471718" },
	"巫光之外的荒野": { groupNumber: "594209337" },
	"屋怪异谭":{ groupNumber: "174136022" },
	"无名集": { groupNumber: "663572400" },
	"无声二重唱": { groupNumber: "965715801" },
	"无为有处有还无": { groupNumber: "768399206", aliases: ["wwyc"]  },
	"无限": { groupNumber: "301122594" },
	"午夜的沙": { groupNumber: "864767076" },
	"舞榭歌台": { groupNumber: "147313715" },
	"夕妖晚谣": { groupNumber: "746417676" },
	"西比拉":{ groupNumber: "669808359" },
	"戏法师的感知": { groupNumber: "144919125" },
	"细胞复位":{ groupNumber: "892835680" },
	"侠骨生花": { groupNumber: "617241018" },
	"侠界之旅": { groupNumber: "210679492" },
	"仙人抚顶": { groupNumber: "1056213411" },
	"相约98": { groupNumber: "542398417" },
	"谢娘娘点化":{ groupNumber: "878626807", aliases: ["谢娘娘"] },
	"心脏": { groupNumber: "883465896\n*无全译本" },
	"新矿坑": { groupNumber: "894191386", aliases: ["方尖碑"] },
	"新世界": { groupNumber: "943798191" },
	"猩红文档": { groupNumber: "159022627" },
	"幸福与心动的民谣": { groupNumber: "1036780211" },
	"雪山密室": { groupNumber: "901413729" },
	"雪下残生": { groupNumber: "592418282" },
	"雪与箱庭之梦":{ groupNumber: "413941306", aliases: ["雪箱"] },
	"雪域下的金色宝藏": { groupNumber: "307758220" },
	"雪中形骸": { groupNumber: "829092202" },
	"血色豪门": { groupNumber: "979353223" },
	"哑蝉的剖白":{ groupNumber: "613231813", aliases: ["哑蝉"] },
	"亚里斯特拉魔法学院": { groupNumber: "759411294" },
	"湮灭之墓": { groupNumber: "868114556" },
	"盐沼幽魂": { groupNumber: "926412005" },
	"演绎&本我":{ groupNumber: "583290817", aliases: ["yybw"] },
	"摇曳群青": { groupNumber: "513712312" },
	"要继承的遗产里有嫂子怎么办": { groupNumber: "519716458",aliases: ["嫂子", "黑乌鸦与不死犬"] },
	"耀光城": { groupNumber: "728536185" },
	"伊卡洛斯的忠堰": { groupNumber: "749121463" },
	"伊卡忠": { groupNumber: "749121463" },
	"遗香巡游": { groupNumber: "535538005" },
	"以撒的狂想曲": { groupNumber: "907783672" },
	"艺术是死": { groupNumber: "902444229" },
	"异教徒": { groupNumber: "810537153", aliases: ["风暴岛"] },
	"异能警察不是什么英雄": { groupNumber: "873824063" },
	"异神成渊": { groupNumber: "916464615" },
	"永虹灰归的Polis":{ groupNumber: "696523899", aliases: ["永虹"] },
	"永夜后日谈": { groupNumber: "710242752" },
	"幽世常世的满天下":{ groupNumber: "749173986" },
	"幽诱,于指尖燃起": { groupNumber: "978331360",aliases: ["幽诱"] },
	"犹格索托斯之影": { groupNumber: "579586813" },
	"油盐不进":{ groupNumber: "575319883" },
	"游龙之年组": { groupNumber: "693371984" },
	"欲望之箱":{ groupNumber: "739976718" },
	"远方呢喃":{ groupNumber: "761735153" },
	"远星者":{ groupNumber: "820393813"},
	"月蜂": { groupNumber: "110208332" },
	"月计": { groupNumber: "702203298" },
	"造物者": { groupNumber: "948914482" },
	"斩我": { groupNumber: "776965370" },
	"蟑螂启示录": { groupNumber: "957865225" },
	"长兴镇": { groupNumber: "906847246" },
	"沼泽人":{ groupNumber: "913354882" },
	"侦探可有翅膀吗": { groupNumber: "963854131",aliases: ["侦探翅"] },
	"正伪的ideal": { groupNumber: "667098598" },
	"终焉之歌为谁而唱":{ groupNumber: "272502055" },
	"众妙之门": { groupNumber: "785654926" },
	"烛堡": { groupNumber: "467303448" },
	"追书人": { groupNumber: "942014926" },
	"坠入阿弗纳斯": { groupNumber: "223713820" },
	"左川之国失落谭":{ groupNumber: "770779991", aliases: ["左川"] },
	"abo同工同酬": { groupNumber: "991872893" },
	"abs": { groupNumber: "941349942" },
	"aib":{ groupNumber: "112077093" },
	"Antinomy": { groupNumber: "101476385" },
	"BASH":{ groupNumber: "774156947", aliases: ["燃星"] },
	"dear-flip-flops":{ groupNumber: "345837146", aliases: ["dff"] },
	"difftruth": { groupNumber: "849680089" },
	"GinGin": { groupNumber: "1035861353" },
	"GODARCA": { groupNumber: "869783432" },
	"H:tv": { groupNumber: "684526713" },
	"insane": { groupNumber: "650600421" },
	"magnificas":{ groupNumber: "477317221" },
	"moon cell":{ groupNumber: "817071819" },
	"nobody*2":{ groupNumber: "694908547", aliases: ["nbd"] },
	"PAC": { groupNumber: "720930120" },
	"ROP": { groupNumber: "783947110、780307937\n*有/无作者" },
	"Sillage香水屋": { groupNumber: "921302134" },
	"SKT": { groupNumber: "376500876" },
	"ssk":{ groupNumber: "708231245" },
	"ventangle": { groupNumber: "754138533" },
	"VEЯ": { groupNumber: "798805482", aliases: ["ver"] },
	"void":{ groupNumber: "1170037255" },
	"wts":{ groupNumber: "763188284" },
	"x告白": { groupNumber: "575451544" },
	"X休止": { groupNumber: "623836728" },
	"zinki": { groupNumber: "761916849" },
	"于赤土腹中再会": { groupNumber: "1060512906" },
	"亲爱的，我把脑子丢了": { groupNumber: "839027414", aliases: ["脑丢", "丢脑"] },
	"乐园在海底": { groupNumber: "641157488" },
	"革命少女罗丹斯": { groupNumber: "641481529" },
	"文手": { groupNumber: "512451066" },
	"于赤土": { groupNumber: "1060512906" },
	"生离": { groupNumber: "1061116172" },
	"似人非人": { groupNumber: "869916259" },
	"海盗之宴": { groupNumber: "1062169852" },
	"愚者的祈雨": { groupNumber: "1062832797" },
	"芝加哥之王": { groupNumber: "559366167" },
	"海·在遗忘之前的晴天": { groupNumber: "710881226", aliases: ["晴天"] },
	"鳞翅": { groupNumber: "963578553" },
	"龙王的奥德赛": { groupNumber: "238873224" },
	"游龙之年": { groupNumber: "693371984" },
	"鸦阁领域": { groupNumber: "836306797" },
	"MTG世设": { groupNumber: "1043664376" },
	"德拉肯海姆之墟": { groupNumber: "856703297" },
	"末日剑湾": { groupNumber: "812018837" },
	"战争神谕": { groupNumber: "413947504" },
	"谦卑林": { groupNumber: "941662352" },
	"斯坦哈德": { groupNumber: "929033286" },
	"巨龙迷城": { groupNumber: "1057192428" },
	"歪月": { groupNumber: "339403801\n*歪月+诡月奇谭",aliases: ["诡月奇谭"] },
	"Snow Spine": { groupNumber: "1070979351",aliases: ["雪脊"] },
	"梦里百花深处": { groupNumber: "490454774",aliases: ["梦花深"] },
	


	
	// 反馈(混合)
	"还来不见仙": { groupNumber: "590220813、984420519\n*反馈/KP群" },





	// 下载(混合)
	"白影": { groupNumber: "825032832\n*下载+KP群" },
	"晨钟旧事": { groupNumber: "655068229\n*下载" },
	"此夜不可离": { groupNumber: "522206940\n*下载" },
	"孤岛恋综": { groupNumber: "932315790\n*下载" },
	"魂夜逃避行": { groupNumber: "1046944266、1009337218\n*下载/KP群" },
	"极乐颂歌": { groupNumber: "701200710、967165493\n*下载/KP群" },
	"将潮水遗忘之物也一并收下吧": { groupNumber: "904394289\n*下载",aliases: ["潮水"] },
	"鲸落万物生": { groupNumber: "598393390、1051952972\n*下载/KP群",aliases: ["鲸落"] },
	"空箱间": { groupNumber: "858801418、1044331385\n*下载/KP群" },
	"坤元劫": { groupNumber: "954535020、862291565\n*下载/KP群",aliases: ["kyj"] },
	"来到这里的你们放弃希望吧": { groupNumber: "939600700、1047069694\n*下载/KP群" },
	"流浪武士": { groupNumber: "994791183\n*下载" },
	"弃约社会": { groupNumber: "972643133、916122224\n*下载/KP群" },
	"恰故人归": { groupNumber: "939600700、607468653\n*下载/KP群" },
	"求我": { groupNumber: "338494770、979194858、978495486\n*下载x2/KP群" },
	"如此渺小的橡果": { groupNumber: "827206593、264764228\n*下载/KP群" },
	"神明起舞之日": { groupNumber: "494739702\n*下载+KP群" },
	"太岁": { groupNumber: "615878940、703542083\n*下载/KP群" },
	"星海孤舟": { groupNumber: "657774576\n*下载" },
	"雪域下的黄金宝藏": { groupNumber: "527406942\n*下载\n*仅限扫码" },
	"寻仙I神仙索": { groupNumber: "746673328\n寻仙I神仙索+寻仙II观音土\n*下载",aliases: ["寻仙II观音土"] },
	"一梦": { groupNumber: "431528579\n*下载+KP群" },
	"异能儿童管理机构": { groupNumber: "786412774、817252450\n*下载/KP群(仅扫码)" },
	"应天劫": { groupNumber: "231734390/2811466327\n*下载/墙" },
	"玉台新薤": { groupNumber: "881091572、439862498\n*交流/KP群" },
	"再见新世界": { groupNumber: "1004914022\n*下载" },
	"掌中雪": { groupNumber: "860685448\n*下载" },
	"CandelaObscura": { groupNumber: "1053180006、1049162012\n*下载/GM群", aliases: ["暗烛"] },
	"one way straight": { groupNumber: "978645254\n*下载" },
	"the name": { groupNumber: "324809275\n*下载", aliases: ["遗书"] },
	"人间见闻录": { groupNumber: "921349225\n*下载" },
	"冤缘远怨": { groupNumber: "1033066580\n*下载" },
	"讨债鬼": { groupNumber: "973867121\n*下载" },
	"将钟表拨回茶杯摔破之前": { groupNumber: "651922911\n*下载", aliases: ["钟表"] },
	"化作海上之雨": { groupNumber: "399589228\n*下载", aliases: ["海雨"] },
	"VirtuaLive": { groupNumber: "664998654\n*下载" },
	"为生命献上砂糖、可可、和肉桂粉": { groupNumber: "628435591\n*下载",aliases: ["可可"] },
	"石榴": { groupNumber: "1063443035\n*下载" },
	"无罪之歌": { groupNumber: "1018018649\n*下载" },
	"合欢宗遇上无情道": { groupNumber: "1048818266\n*下载" },
	"绿月": { groupNumber: "1064264349\n*下载" },
	"The Moist Star": { groupNumber: "1035170762\n*下载" },
	"缉邪司": { groupNumber: "884145991、876339982\n*下载/KP群", aliases: ["jxs"] },
	"Stifle, and with hymn": { groupNumber: "1064285359、1062672838\n*下载/KP群", aliases: ["hymn"] },



	
	//规则
	"恋爱党政trpg": { groupNumber: "263776524" },
	"永7trpg": { groupNumber: "1092736604" },
	"星升": { groupNumber: "872362745" },
	"三角机构": { groupNumber: "1056836484" },
	"GURPS": { groupNumber: "577412220" },
	"WWRPG": { groupNumber: "818401752\n*全名Wizarding World", aliases: ["Wizarding World"] },
	"匕首之心": { groupNumber: "791858682、583981590" },
	"逆命仙途": { groupNumber: "796368505" },
	"brp": { groupNumber: "788438516" },
	"赛博朋克d20": { groupNumber: "135248365、283334218" },
	"小众规则综合群": { groupNumber: "945728295" },
	"剪月集": { groupNumber: "631939804" },
	"武侠克苏鲁woc": { groupNumber: "524086123" },
	"克苏鲁迷踪TOC": { groupNumber: "780909682" },
	"星海迷城": { groupNumber: "719566794" },
	"SPC基金会": { groupNumber: "602431810" },
	"魔道书": { groupNumber: "759960406" },
	"共鸣性怪异": { groupNumber: "903173796" },
	"罗小黑": { groupNumber: "687753523" },
	"pathfinder 2e": { groupNumber: "695214825\n*全名pathfinder 2e",aliases: ["pf2"] },
	"喵影奇谋": { groupNumber: "1047473677\n*喵影奇谋+赛博朋克RED+辐射",aliases: ["辐射", "赛博朋克RED"] },
	"北欧奇谭": { groupNumber: "655192271" },
	"双人搜查": { groupNumber: "616576634" },


	//其它
	"翻译存放": { groupNumber: "1053204546、972416799、377896614、1040799893、317223427、1033917987、1043393781、872345826、1061035045、220150371\n*220150371韩模" },
	
	"log相关": { groupNumber: "675664988、985865497\n*存放/整理" },

	"coj写作": { groupNumber: "761666326" },
	"全女写作": { groupNumber: "734417134" },

	"纯女": { groupNumber: "coc\n947095759、797863427、1061755248、485231082*先进审核923952181\n\ndnd\n560604565、960874614、780528057、1021578589\n\n兼容\n869660310、1016631080、1057887916*北美洲时差、609993185*限21" },
	
	"dnd纯dm": { groupNumber: "421678315" },
	"dnd语音团": { groupNumber: "893711161\n*dnd为主但不限规则" },

	"ccf搭房": { groupNumber: "805511454" },
	"ccf招募": { groupNumber: "1060652550" },
	
	"彩虹社角色桌": { groupNumber: "1062894359" },
	"角色桌": { groupNumber: "471191700、363017687", aliases: ["语擦"] },
	"音乐剧角色桌": { groupNumber: "892348859" },
	"1999角色桌": { groupNumber: "937290560" },
	
	"口胡专用": { groupNumber: "106133577" },
	"海龟汤": { groupNumber: "295820752" },

	"时差": { groupNumber: "北美1057887916\n欧洲1054398710、602634416\n*602634416coj向" },
	
};

// "": { groupNumber: "" },

// "": { groupNumber: "",aliases: [""] },

// 创建群号到群组名称的反向映射
const groupNumberToNameMap = {};
for (const groupName in groupMap) {
    const groupInfo = groupMap[groupName];
    const groupNumbers = groupInfo.groupNumber.split(/[、]/);
    
    groupNumbers.forEach(number => {
        const cleanNumber = number.split('\n')[0].trim();
        if (cleanNumber) {
            if (!groupNumberToNameMap[cleanNumber]) {
                groupNumberToNameMap[cleanNumber] = [];
            }
            groupNumberToNameMap[cleanNumber].push(groupName);
        }
    });
}

// 计算两个字符串的相似度
function getSimilarity(s1, s2) {
    s1 = s1.toLowerCase();
    s2 = s2.toLowerCase();

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

    function getJaccardScore(a, b) {
        const set1 = new Set(a.split(''));
        const set2 = new Set(b.split(''));
        const intersection = new Set([...set1].filter(c => set2.has(c))).size;
        const union = new Set([...set1, ...set2]).size;
        return union === 0 ? 0 : intersection / union;
    }

    return Math.max(
        getLevenshteinScore(s1, s2),
        getJaccardScore(s1, s2)
    );
}

function findSimilarGroup(input) {
    input = input.toLowerCase();
    const matchedGroups = [];

    for (const groupName in groupMap) {
        const groupInfo = groupMap[groupName];
        let highestScore = 0;

        const mainScore = getSimilarity(input, groupName.toLowerCase());
        highestScore = Math.max(highestScore, mainScore);

        if (groupInfo.aliases) {
            for (const alias of groupInfo.aliases) {
                const aliasScore = getSimilarity(input, alias.toLowerCase());
                highestScore = Math.max(highestScore, aliasScore);
            }
        }

        if (highestScore >= 0.3) {
            matchedGroups.push({
                name: groupName,
                info: groupInfo,
                score: highestScore
            });
        }
    }

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
.kp <关键词>	// 查询特定KP群号
.kp list	// 列出所有KP群信息(超长慎用)
.kp help	// 显示本帮助`;

cmdKp.solve = async (ctx, msg, cmdArgs) => {
    let ret = seal.ext.newCmdExecuteResult(true);
    const input = cmdArgs.getArgN(1);
    
    // 按用户检查更新（每个用户24小时提醒一次）
    const userId = msg.sender.userId;
    const now = Date.now();
    const lastNotify = userLastNotify.get(userId) || 0;
    
    if (now - lastNotify > 24 * 60 * 60 * 1000) {
        userLastNotify.set(userId, now);
        checkUpdateOnce(ctx, msg, userId).catch(console.error);
    }
    
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

    // 群号反向查询功能
    if (/^\d+$/.test(input)) {
        const matchedGroups = groupNumberToNameMap[input] || [];
        
        if (matchedGroups.length > 0) {
            let replyText = ``;
            matchedGroups.forEach(groupName => {
                const groupInfo = groupMap[groupName];
                replyText += `【${groupName}】→ ${groupInfo.groupNumber}`;
            });
            seal.replyToSender(ctx, msg, replyText);
        } else {
            seal.replyToSender(ctx, msg, `未找到匹配【${input}】的KP群，使用 .kp list 查看所有群组，或进2150284119反馈。`);
        }
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
        const matchedGroups = findSimilarGroup(input);
        if (matchedGroups) {
            let replyText = `找到以下匹配【${input}】的KP群（按相似度排序）：\n`;
            matchedGroups.forEach(group => {
                replyText += `\n【${group.name}】→ ${group.info.groupNumber} (相似度: ${Math.round(group.score * 100)}%)`;
            });
            seal.replyToSender(ctx, msg, replyText);
        } else {
            seal.replyToSender(ctx, msg, `未找到匹配【${input}】的KP群，使用 .kp list 查看所有群组，或进2150284119反馈。`);
        }
    } else {
        // 精确匹配输出
        seal.replyToSender(ctx, msg, `精确匹配【${input}】：\n【${foundGroup.match.name}】→ ${foundGroup.match.info.groupNumber}`);
    }

    return ret;
};

// 注册指令
ext.cmdMap['kp'] = cmdKp;
