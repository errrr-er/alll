// ==UserScript==
// @name         KP群汇总
// @author       3987681449
// @version      1.0.0
// @description  (.kp)有问题可进群2150284119联系
// @timestamp    1777790643
// 2025-05-11 16:49:17
// @license      Apache-2
// @homepageURL  https://github.com/errrr-er/alll/tree/main
// @updateUrl    https://ghfast.top/https://raw.githubusercontent.com/errrr-er/alll/refs/heads/main/call_of_cthulhu/kp/a_kp_all.js
// @updateUrl    https://raw.githubusercontent.com/errrr-er/alll/refs/heads/main/call_of_cthulhu/kp/a_kp_all.js
// ==/UserScript==
// , aliases: [""]
let ext = seal.ext.find('KP群汇总');
if (!ext) {
  ext = seal.ext.new('KP群汇总', 'er', '1.0.0');
  seal.ext.register(ext);
}

// 时间戳(需要手动更新)
// timestamp
function getCurrentTimestamp() {
    return 1777790643;
}

// 提醒历史
const userLastNotify = new Map();

// 获取GitHub最新版本编号
async function getGitHubVersion() {
    try {
		// 镜像
        const rawUrl = 'https://ghproxy.net/https://raw.githubusercontent.com/errrr-er/alll/refs/heads/main/call_of_cthulhu/kp/a_kp_all.js';
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
		seal.replyToSender(ctx, msg, '获取GitHub版本出错:', error);
        throw error;
    }
}

// 检查更新
async function checkUpdateOnce(ctx, msg, userId) {
    try {
        const githubVersion = await getGitHubVersion();
        if (!githubVersion) return;
        
        const currentTimestamp = getCurrentTimestamp();
        
        if (githubVersion.timestamp > currentTimestamp) {
            setTimeout(() => {
                seal.replyToSender(ctx, msg, 
                    `发现<KP群汇总>插件有新版本！\n更新检查冷却开始~请及时更新\n最后更新：${githubVersion.formattedDate}`
                );
            }, 1000);
        }
    } catch (error) {
        // 静默处理
    }
}

// 群号映射表
const groupMap = {
	"阿斯蒙蒂斯之链coa": { groupNumber: "581885602" },
	"哀歌弥赛亚": { groupNumber: "609355937", aliases: ["哀歌"] },
	"暗河": { groupNumber: "1031974789" },
	"暗影狂奔": { groupNumber: "245525828" },
	"八方旅人": { groupNumber: "549132432" },
	"白影": { groupNumber: "825032832*下载+KP" },
	"白玉风会录": { groupNumber: "942449479" },
	"柏拉图的余谈": { groupNumber: "574918635" },
	"拜昆仑": { groupNumber: "248817589" },
	"北东路疑案": { groupNumber: "953349303" },
	"北欧奇谭": { groupNumber: "655192271" },
	"匕首之心": { groupNumber: "791858682、583981590" },
	"彼都": { groupNumber: "952122633" },
	"陛下您这后宫不对劲": { groupNumber: "636253864*下载" },
	"边狱巴士同人规则": { groupNumber: "765965290" },
	"便当杀人事件": { groupNumber: "1098707012*下载" },
	"别来无恙": { groupNumber: "907810853" },
	"冰风谷": { groupNumber: "537262507" },
	"波子汽水": { groupNumber: "562672318" },
	"博德之门的英雄们": { groupNumber: "1005326913" },
	"不辜马戏团": { groupNumber: "759642443", aliases: ["不辜"] },
	"不见蓬山": { groupNumber: "834893891" },
	"不死灭灭": { groupNumber: "279755638" },
	"残败桃源": { groupNumber: "2154036156" },
	"沧渺山": { groupNumber: "855215735", aliases: ["cms"] },
	"常夜国骑士谭:真祖红舞曲": { groupNumber: "769437181" },
	"晨钟旧事": { groupNumber: "655068229*下载", aliases: ["沽上潮生来"] },
	"抽刀": { groupNumber: "1057856638" },
	"畜牲道": { groupNumber: "738570884" },
	"穿插、跳跃、结束，你与我的日常": { groupNumber: "1085073731、1097464299" },
	"吹笛子的海獭": { groupNumber: "468213532" },
	"春花秋月": { groupNumber: "813932679" },
	"纯女": { groupNumber: "coc\n947095759、797863427、923952181、770689154、1061755248*+绿色三角洲\n\ndnd\n560604565、960874614、780528057、1021578589\n\ncoc+dnd\n869660310、1016631080、1057887916*北美洲时差、609993185*限21+无限流" },
	"纯阳轶事": { groupNumber: "977656290" },
	"纯dm": { groupNumber: "421678315" },
	"此夜不可离": { groupNumber: "522206940*下载" },
	"翠色的光与影": { groupNumber: "1081639467" },
	"大道纪年": { groupNumber: "932560339*KP\nhttps://pan.baidu.com/share/init?surl=iNbFg3DD13ChPHPKc1035A&pwd=NZBY" },
	"大德歌": { groupNumber: "1092691584" },
	"代号行者": { groupNumber: "433389798" },
	"当代电影": { groupNumber: "1023220397" },
	"当合欢宗遇上无情道": { groupNumber: "1048818266*下载\n736394722*下载\n112452157*KP", aliases: ["合欢宗"] },
	"德拉肯海姆之墟": { groupNumber: "856703297" },
	"地区": { groupNumber: "福建936981574\n江浙沪855687184\n山河四省771840771\n\n北美1057887916\n欧洲602634416*coj向", aliases: ["时差"] },
	"地图制作": { groupNumber: "https://watabou.itch.io/perilous-shores\n大尺度，区域地图，可商用\nhttps://watabou.itch.io/one-page-dungeon\n随机生成，单层地下城地图，可商用\nhttps://watabou.itch.io/medieval-fantasy-city-generator\n中世纪，城镇地图，可商用\nhttps://probabletrain.itch.io/dungeon-scrawl\n方格地下城，扩展度高，可做多层，遵循cc0协议\nhttps://deepnight.itch.io/tabletop-rpg-map-editor\n房间地图，像素二维，可商用\nhttps://probabletrain.itch.io/city-generator\n随机，现代城市地图，可商用\nhttps://watabou.itch.io/neighbourhood\n彩色城镇地图，可商用\nhttps://watabou.itch.io/village-generator\n村庄地图，可商用\nhttps://wyvernindustries.itch.io/stationgen\n空间站地图，可编辑，付费\nhttps://watabou.itch.io/fantasy-manor\n随机庄园，可商用\nhttps://watabou.itch.io/city-viewer\n3D城市，随机，可商用\nhttps://watabou.itch.io/procgen-mansion\n豪宅、洋馆，随机，可制平面图，定制程度高，可商用\nhttps://chillcash.itch.io/map-generator\n世界地图生成\nhttps://ngreend.itch.io/hexmappy\n六角地图\nhttps://thowsenmedia.itch.io/worldshaper\n支持3D的地图、地形生成\nhttps://playest.itch.io/hextml\n六边形地图制作\nhttps://tortue.itch.io/terraingenerator\n2D地形生成" },
	"电子悖论失乐园": { groupNumber: "995398768*下载\n1033563821*KP", aliases: ["失乐园","电子"] },
	"东方快车上的恐怖": { groupNumber: "639753886", aliases: ["东快"] },
	"东京g": { groupNumber: "201906582" },
	"东京v": { groupNumber: "613821934" },
	"渡春风": { groupNumber: "199382863", aliases: ["dcf","蛋炒饭"] },
	"渡仙劫": { groupNumber: "634208409" },
	"断梦行": { groupNumber: "1051020748*PL\n1029592193*KP" },
	"断头爱丽丝": { groupNumber: "1073575754" },
	"多灾多难梵达林": { groupNumber: "570879430\n矿坑+冰塔峰+风暴君王?+风骸岛?", aliases: ["矿坑","冰塔峰","风暴君王","风骸岛"] },
	"恶辣": { groupNumber: "620832218" },
	"二重身的证迹": { groupNumber: "285230351" },
	"翻译": { groupNumber: "1073856681、1053204546、972416799、377896614、1040799893、pd59993369、1033917987、1043393781、872345826、1061035045、220150371*韩模、ny40y57197" },
	"泛界旅者": { groupNumber: "375452673" },
	"非出版短模组": { groupNumber: "1032540988" },
	"非正经修仙": { groupNumber: "645560269" },
	"肥皂学校": { groupNumber: "980188286", aliases: ["肥皂","皂校"] },
	"废案重组": { groupNumber: "857972438" },
	"废楼怪谈": { groupNumber: "563488359" },
	"焚天之战": { groupNumber: "1065925723" },
	"疯法师的地城": { groupNumber: "1025248586" },
	"逢春": { groupNumber: "1103341222" },
	"凤去台空江自流": { groupNumber: "979768022*下载\n985261346*下载\n瑰绿的决心+天地熔金+凤去台空江自流+人间烟火+问天地", aliases: ["瑰绿的决心","天地熔金","人间烟火","问天地"] },
	"缝春": { groupNumber: "798106857*KP" },
	"浮生安梦": { groupNumber: "881234029" },
	"高塔之死": { groupNumber: "623768354*战役集", aliases: ["告密者"] },
	"哥谭39:永恒之镜": { groupNumber: "858799831", aliases: ["Gotham39: The Mirror Eternal"] },
	"歌味觉死": { groupNumber: "616756545\n路易斯安那系列+畅梦人+淤泥之花与空心石" },
	"革命少女罗丹斯": { groupNumber: "641481529" },
	"公若渡河": { groupNumber: "1095875707*下载\n1101528355*KP" },
	"共鸣性怪异": { groupNumber: "903173796" },
	"孤岛恋综": { groupNumber: "932315790*下载" },
	"孤灯弃城": { groupNumber: "877858567" },
	"怪胎": { groupNumber: "639870851" },
	"怪物们与邪典仙境": { groupNumber: "592577986", aliases: ["鞋垫"] },
	"哈欠门": { groupNumber: "631595428" },
	"还来不见仙": { groupNumber: "590220813*反馈\n984420519*KP" },
	"海·在遗忘之前的晴天": { groupNumber: "710881226", aliases: ["晴天"] },
	"海盗啊海盗": { groupNumber: "928270526", aliases: ["海盗"] },
	"海盗之宴": { groupNumber: "1062169852" },
	"海龟汤": { groupNumber: "295820752" },
	"海国战役设定集": { groupNumber: "567135881" },
	"黑暗世界": { groupNumber: "985683120", aliases: ["wod","vtm"] },
	"黑幕圣杯": { groupNumber: "602145072" },
	"黑水溪": { groupNumber: "1071548693" },
	"呼唤爱的谢幕": { groupNumber: "929268821" },
	"狐鸣于白雪、狸击腹冰霰": { groupNumber: "1043393781*下载" },
	"花&葬送者": { groupNumber: "555632875、106559548", aliases: ["花葬"] },
	"花盗人之恋": { groupNumber: "966519249" },
	"花联物语": { groupNumber: "716402709" },
	"化作海上之雨": { groupNumber: "399589228*下载", aliases: ["海雨"] },
	"画手": { groupNumber: "1014072522、714835517" },
	"怀抱秘密的妻子": { groupNumber: "1054698251", aliases: ["ヒミツの奥様"] },
	"黄昏熔解": { groupNumber: "826823719" },
	"黄金宝库": { groupNumber: "546468457" },
	"毁灭亲王": { groupNumber: "882887120", aliases: ["POTA"] },
	"魂夜逃避行": { groupNumber: "1046944266*下载\n1009337218*KP" },
	"活神之手": { groupNumber: "1075504939" },
	"缉邪司": { groupNumber: "884145991*下载\n876339982*KP", aliases: ["jxs"] },
	"汲水": { groupNumber: "1014352186*下载" },
	"即兴喜剧": { groupNumber: "1023883963" },
	"极地追凶": { groupNumber: "1057328944*下载" },
	"极乐颂歌": { groupNumber: "701200710*下载\n967165493*KP" },
	"继续工作直到毁灭": { groupNumber: "822840569" },
	"寂静挽歌": { groupNumber: "1084909160" },
	"祭日颂": { groupNumber: "717598559" },
	"剪月集": { groupNumber: "631939804" },
	"将潮水遗忘之物也一并收下吧": { groupNumber: "904394289*下载", aliases: ["潮水"] },
	"将钟表拨回茶杯摔破之前": { groupNumber: "651922911*下载", aliases: ["钟表"] },
	"角色桌": { groupNumber: "471191700、363017687\n1062894359*彩虹社\n892348859*音乐剧\n1029979195*1999\n302014132*边狱巴士\n862922419*崩铁\n223628950*第五\n1079593722*鬼灭", aliases: ["语擦"] },
	"教师A的终焉": { groupNumber: "966092780*下载", aliases: ["7-Day Cricle","七日之轮"] },
	"今古空名": { groupNumber: "962147366" },
	"金酒狂热": { groupNumber: "794429121" },
	"京痕雨记": { groupNumber: "496904508*下载" },
	"荆山祭": { groupNumber: "1092255456*下载" },
	"鲸落万物生": { groupNumber: "598393390*下载\n1051952972*KP", aliases: ["鲸落"] },
	"靖海难": { groupNumber: "343026343" },
	"镜花水月•云上天篇": { groupNumber: "2151061466" },
	"镜语礼赞": { groupNumber: "882672657" },
	"举头三尺": { groupNumber: "334821036" },
	"巨龙迷城": { groupNumber: "1057192428" },
	"绝对励弩": { groupNumber: "1079402848" },
	"卡森德拉的黑色嘉年华": { groupNumber: "297175538", aliases: ["卡镇"] },
	"克苏鲁迷踪toc": { groupNumber: "780909682", aliases: ["toc"] },
	"空箱间": { groupNumber: "858801418*下载\n1044331385*KP" },
	"恐怖墓穴": { groupNumber: "329392650" },
	"口胡": { groupNumber: "106133577" },
	"快刀乱魔": { groupNumber: "238285939", aliases: ["快刀"] },
	"快刀乱魔贰": { groupNumber: "417453795", aliases: ["快刀2"] },
	"坤元劫": { groupNumber: "954535020*下载\n862291565*KP", aliases: ["kyj"] },
	"拉普拉斯": { groupNumber: "1050071534" },
	"来到这里的你们放弃希望吧": { groupNumber: "939600700*下载\n1047069694*KP", aliases: ["十二字"] },
	"狼藉夜行": { groupNumber: "779021829" },
	"老天对我不公": { groupNumber: "1053162150*下载" },
	"乐园在海底": { groupNumber: "641157488" },
	"黎明之盏": { groupNumber: "835468159" },
	"连海密录": { groupNumber: "926024691" },
	"恋爱党政": { groupNumber: "263776524" },
	"列文菲舍变例": { groupNumber: "1040678581" },
	"鳞翅": { groupNumber: "963578553" },
	"流浪武士": { groupNumber: "994791183*下载" },
	"流水线心脏": { groupNumber: "793350464", aliases: ["流心"] },
	"龙滨不良": { groupNumber: "597585029", aliases: ["lbbl"] },
	"龙蛋物语": { groupNumber: "772645004" },
	"龙港围城": { groupNumber: "1079345156", aliases: ["龙门围城"] },
	"龙后的宝山": { groupNumber: "343516463\n龙后的宝山+提亚马特的崛起", aliases: ["提亚马特的崛起"] },
	"龙后之影": { groupNumber: "595576485", aliases: ["龙枪"] },
	"龙金劫": { groupNumber: "947826784" },
	"龙台掠雪": { groupNumber: "921013368*官方禁言通知\n1051220082*同好交流" },
	"龙王的奥德赛": { groupNumber: "238873224" },
	"龙族": { groupNumber: "603211139" },
	"卢埃德街的海鸣": { groupNumber: "972416799*下载", aliases: ["性转潜入免女郎俱乐部是认真的吗"] },
	"旅馆的捕食者": { groupNumber: "884768719", aliases: ["旅捕","吕布"] },
	"绿色三角洲": { groupNumber: "623759380、984765632、253302384、1061755248", aliases: ["dg"] },
	"绿月": { groupNumber: "1064264349*下载" },
	"论道来处十二楼": { groupNumber: "1060537548*下载" },
	"罗小黑": { groupNumber: "687753523", aliases: ["妖灵会馆"] },
	"螺旋旅人发问道": { groupNumber: "859933056" },
	"落石": { groupNumber: "603178528" },
	"猫寿司": { groupNumber: "831331659" },
	"卯花腐雨": { groupNumber: "1083939047" },
	"冒充神明的童话": { groupNumber: "1062511494" },
	"梅林杯": { groupNumber: "905396897" },
	"门扉那端": { groupNumber: "621153022" },
	"蒙娜丽莎杀死格尔尼卡": { groupNumber: "580704423" },
	"梦里百花深处": { groupNumber: "490454774", aliases: ["梦花深"] },
	"弥勒佛Mythras": { groupNumber: "316394180" },
	"迷雾之城": { groupNumber: "828730465" },
	"棉花不谢": { groupNumber: "1038645659" },
	"面包骑士物语": { groupNumber: "951729026" },
	"喵影奇谋": { groupNumber: "1047473677\n喵影奇谋+赛博朋克RED+辐射", aliases: ["辐射","赛博朋克RED"] },
	"明港市灵异调查组": { groupNumber: "970189117*同好交流" },
	"明镜，仿佛可以斩断春天": { groupNumber: "921034670", aliases: ["明镜斩春","mjzc"] },
	"溟渊的呼唤": { groupNumber: "431242151", aliases: ["艾桑椎亚","冥渊"] },
	"命运转轮": { groupNumber: "241837204" },
	"模组拼车": { groupNumber: "686079835、983412936", aliases: ["私翻"] },
	"魔道书": { groupNumber: "759960406" },
	"魔法少女歌唱死亡": { groupNumber: "868665011" },
	"魔女与彩爱": { groupNumber: "421693159" },
	"魔王之影": { groupNumber: "691528948", aliases: ["SDL"] },
	"末日剑湾": { groupNumber: "812018837", aliases: ["维克那的崛起/陨落"] },
	"莫索里哀的圣职者": { groupNumber: "435690433", aliases: ["msla"] },
	"墨拉亚的羊群": { groupNumber: "671767814*下载" },
	"木马&短刀": { groupNumber: "873593450*有作者\n564501697*无作者" },
	"幕临": { groupNumber: "160438930" },
	"奈面": { groupNumber: "933493427", aliases: ["奈亚拉托提普的面具"] },
	"内锈": { groupNumber: "1061071715" },
	"你是谁？请支持百日○纪！": { groupNumber: "1057449882", aliases: ["百日"] },
	"你这什么跑团，你这coj害人不浅啊": { groupNumber: "745155380*下载" },
	"逆命仙途": { groupNumber: "796368505" },
	"鸟啼歌": { groupNumber: "1076715464" },
	"脓堕": { groupNumber: "183186533", aliases: ["nd"] },
	"帕瑞卡颂马戏团": { groupNumber: "760671074" },
	"蓬莱有龙": { groupNumber: "1073307651*下载\n1101230234*KP" },
	"奇异医科": { groupNumber: "1033132363*下载" },
	"祈舞醒梦": { groupNumber: "1104143844*下载\n1101711435*KP" },
	"崎蜀藏观音": { groupNumber: "652844613" },
	"起承转结": { groupNumber: "1043452922" },
	"弃约社会": { groupNumber: "972643133*下载\n916122224*KP" },
	"恰故人归": { groupNumber: "939600700*下载\n607468653*KP" },
	"谦卑林": { groupNumber: "941662352" },
	"枪骑兵": { groupNumber: "702215091" },
	"亲爱的，我把脑子丢了": { groupNumber: "839027414", aliases: ["脑丢","丢脑"] },
	"青春自杀": { groupNumber: "953788807" },
	"清平乐": { groupNumber: "814959956" },
	"秋鬼": { groupNumber: "1095696359*下载" },
	"秋永录": { groupNumber: "922420972、712714985", aliases: ["qyl"] },
	"囚人医療部": { groupNumber: "689946642*下载" },
	"求不得": { groupNumber: "887012952" },
	"求道": { groupNumber: "983418886" },
	"求我": { groupNumber: "338494770*下载\n979194858*下载\n978495486*KP" },
	"全景敞视主义的陷阱": { groupNumber: "792650936" },
	"燃花": { groupNumber: "795081215" },
	"燃烧的星辰": { groupNumber: "1049443592" },
	"染色空白卡": { groupNumber: "657347350" },
	"人间见闻录": { groupNumber: "921349225*下载" },
	"人生restart": { groupNumber: "537691966" },
	"忍神": { groupNumber: "750542419、866506419、750542354" },
	"日夜行人": { groupNumber: "1042210871*下载\n238797418*KP" },
	"如此渺小的橡果": { groupNumber: "827206593*下载\n264764228*KP" },
	"萨里希斯之光": { groupNumber: "473373105、930332469" },
	"赛博朋克d20": { groupNumber: "135248365、283334218" },
	"三尺微命": { groupNumber: "1031833569*无作者" },
	"三尺之下": { groupNumber: "976406595" },
	"三角机构": { groupNumber: "1056836484" },
	"三台风月": { groupNumber: "1084095765" },
	"山歌唤梦": { groupNumber: "972586937" },
	"少恶世界": { groupNumber: "849810896\n少恶世界+蚀甚", aliases: ["蚀甚"] },
	"深眠雾梦": { groupNumber: "523093958" },
	"什么叫做kpc……": { groupNumber: "1079232693*下载", aliases: ["春日宴"] },
	"神话时代": { groupNumber: "316394180*无全译本" },
	"神明起舞之日": { groupNumber: "494739702*下载+KP" },
	"神星落乐": { groupNumber: "831229728" },
	"升平世旧": { groupNumber: "1041314728" },
	"生不逢时": { groupNumber: "829092202", aliases: ["雪中形骸"] },
	"生离": { groupNumber: "1061116172" },
	"生下他吧": { groupNumber: "705913038", aliases: ["请生"] },
	"圣餐": { groupNumber: "659334919" },
	"圣诞快乐，玛丽小姐": { groupNumber: "864404671*下载\n1041629808*KP" },
	"圣土遗梦": { groupNumber: "146415338" },
	"胜率制圣杯": { groupNumber: "535057473" },
	"失忆后有了三个恋人": { groupNumber: "562613533" },
	"十六段夜谈": { groupNumber: "938304846" },
	"石榴": { groupNumber: "1063443035*下载" },
	"兽与济世之雨": { groupNumber: "1074954896*下载" },
	"赎罪邮局": { groupNumber: "1064670977" },
	"属于吾等的安乐之所": { groupNumber: "826771926" },
	"树不子英雄传": { groupNumber: "960918320", aliases: ["RWBY"] },
	"双人搜查": { groupNumber: "616576634" },
	"双重十字": { groupNumber: "651709429" },
	"朔月笔谈": { groupNumber: "825664784" },
	"斯翠海文": { groupNumber: "838512466" },
	"斯坦哈德": { groupNumber: "929033286" },
	"斯特拉德的诅咒": { groupNumber: "824773454" },
	"死神的圣域": { groupNumber: "1028029280" },
	"死刑执行": { groupNumber: "830833837" },
	"死者的顿足舞": { groupNumber: "1081620177" },
	"似人非人": { groupNumber: "869916259" },
	"太岁": { groupNumber: "615878940*下载\n703542083*KP" },
	"逃离深渊": { groupNumber: "513100948" },
	"讨债鬼": { groupNumber: "973867121*下载", aliases: ["星星的葬礼"] },
	"提灯铁鼠": { groupNumber: "882067951" },
	"天才剑修▆▆法则": { groupNumber: "1095791459*下载" },
	"天地一灯": { groupNumber: "974274779" },
	"天命所归": { groupNumber: "875210475" },
	"天启伏诛": { groupNumber: "1075156103*下载\n1093079819*KP(官方)" },
	"天启劫火": { groupNumber: "1059690417" },
	"天师": { groupNumber: "587952595*下载" },
	"天下第一刀": { groupNumber: "369645861*无作者" },
	"天衍纪年": { groupNumber: "666391763、675869524", aliases: ["tyjn"] },
	"天衍江湖录": { groupNumber: "463467776" },
	"天衍剧组": { groupNumber: "637230426" },
	"天椎谶纬": { groupNumber: "656026457" },
	"庭师所吟为何物": { groupNumber: "656434498", aliases: ["庭师"] },
	"町葬屋怪异谭": { groupNumber: "174136022" },
	"蛙徒的祭典": { groupNumber: "655890716", aliases: ["蛙祭","挖机"] },
	"歪月": { groupNumber: "339403801\n歪月+诡月奇谭", aliases: ["诡月奇谭"] },
	"万木惊春时": { groupNumber: "371709132" },
	"万人无我": { groupNumber: "929768460", aliases: ["wrww"] },
	"王之褴褛": { groupNumber: "1078850322" },
	"往明": { groupNumber: "1039312225" },
	"妄想症": { groupNumber: "278636978" },
	"望君长留": { groupNumber: "700583235" },
	"帷灯匣剑": { groupNumber: "850934230*下载\n984247613*KP" },
	"维克那毁灭前夕": { groupNumber: "1045993659" },
	"伪装者": { groupNumber: "965809145" },
	"为渡圆寂之都": { groupNumber: "953195114" },
	"为生命献上砂糖、可可、和肉桂粉": { groupNumber: "628435591*下载\n1037886003*有作者\n817342041*无作者", aliases: ["可可","为生命献上砂糖可可和肉桂粉","糖可桂","tkg"] },
	"为谢幕献上祝福的齿轮": { groupNumber: "714364138", aliases: ["齿轮"] },
	"未交予的落白": { groupNumber: "1007853163" },
	"未命名的路": { groupNumber: "1051535084*下载" },
	"文手": { groupNumber: "512451066" },
	"文字乱码制作": { groupNumber: "https://anytexteditor.com/cn/cursed-text-generator" },
	"问道苍生": { groupNumber: "758798519、578441689" },
	"我的同桌才没有那么可爱": { groupNumber: "1076334102*下载\n1022387123*下载\n1085169094*下载\n980074681*KP" },
	"乌洛波洛斯的末日巡演": { groupNumber: "451471718" },
	"巫光之外的荒野": { groupNumber: "594209337" },
	"无尽阶梯": { groupNumber: "923944293" },
	"无名集": { groupNumber: "663572400" },
	"无声二重唱": { groupNumber: "965715801" },
	"无为有处有还无": { groupNumber: "768399206", aliases: ["wwyc"] },
	"无罪之歌": { groupNumber: "1018018649*下载" },
	"午夜的沙": { groupNumber: "864767076" },
	"武侠克苏鲁woc": { groupNumber: "524086123", aliases: ["woc"] },
	"舞榭歌台": { groupNumber: "147313715" },
	"夕妖晚谣": { groupNumber: "746417676" },
	"西比拉": { groupNumber: "669808359" },
	"戏法师的感知": { groupNumber: "144919125" },
	"细胞复位": { groupNumber: "892835680" },
	"侠骨生花": { groupNumber: "617241018" },
	"侠界之旅": { groupNumber: "210679492" },
	"仙人抚顶": { groupNumber: "1056213411" },
	"相约98": { groupNumber: "542398417" },
	"香槟call可以开发票吗": { groupNumber: "1103396117*下载\n964670473*交流", aliases: ["香槟CALL"] },
	"小众规则综合": { groupNumber: "945728295" },
	"写作": { groupNumber: "629998485*魔都\n734417134*纯女、761666326*纯女coj" },
	"谢娘娘点化": { groupNumber: "878626807", aliases: ["谢娘娘"] },
	"心愿寄于清夏": { groupNumber: "599817890" },
	"心脏": { groupNumber: "883465896*无全译本" },
	"新矿坑": { groupNumber: "894191386", aliases: ["方尖碑"] },
	"新世界": { groupNumber: "943798191" },
	"星光无限流": { groupNumber: "301122594" },
	"星海孤舟": { groupNumber: "657774576*下载" },
	"星海迷城": { groupNumber: "719566794" },
	"星升": { groupNumber: "872362745" },
	"猩红文档": { groupNumber: "159022627" },
	"行行重": { groupNumber: "720893039" },
	"幸福与心动的民谣": { groupNumber: "1036780211" },
	"性福安心委員会": { groupNumber: "https://koufukuanshiniinkai.wixsite.com/trpg", aliases: ["委员会"] },
	"虚白馆·无人生还": { groupNumber: "1085269036" },
	"虚诞的毁灭": { groupNumber: "1046244155" },
	"雪山密室": { groupNumber: "901413729" },
	"雪下残生": { groupNumber: "592418282" },
	"雪与箱庭之梦": { groupNumber: "413941306", aliases: ["雪箱"] },
	"雪域下的黄金宝藏": { groupNumber: "527406942*下载\n307758220*KP", aliases: ["雪域下的金色宝藏"] },
	"血色豪门": { groupNumber: "979353223" },
	"寻仙I神仙索": { groupNumber: "746673328*下载\n寻仙I神仙索+寻仙II观音土", aliases: ["寻仙II观音土","寻仙"] },
	"鸦阁领域": { groupNumber: "836306797" },
	"哑蝉的剖白": { groupNumber: "613231813", aliases: ["哑蝉"] },
	"亚里斯特拉魔法学院": { groupNumber: "759411294" },
	"湮灭之墓": { groupNumber: "868114556" },
	"盐沼幽魂": { groupNumber: "926412005" },
	"演绎&本我": { groupNumber: "583290817", aliases: ["yybw"] },
	"摇曳群青": { groupNumber: "513712312" },
	"要继承的遗产里有嫂子怎么办": { groupNumber: "519716458", aliases: ["嫂子","黑乌鸦与不死犬"] },
	"耀光城": { groupNumber: "728536185" },
	"一梦": { groupNumber: "431528579*下载+KP" },
	"伊卡洛斯的忠堰": { groupNumber: "749121463", aliases: ["伊卡忠"] },
	"遗香巡游": { groupNumber: "535538005" },
	"以撒的狂想曲": { groupNumber: "907783672" },
	"艺术是死": { groupNumber: "902444229", aliases: ["1444"] },
	"异教徒": { groupNumber: "810537153", aliases: ["风暴岛"] },
	"异能儿童管理机构": { groupNumber: "786412774*下载\n817252450*KP" },
	"异能警察不是什么英雄": { groupNumber: "873824063" },
	"异神成渊": { groupNumber: "916464615" },
	"抑或地位未定": { groupNumber: "1041670093" },
	"阴霾，与消散的你": { groupNumber: "1091169562*下载" },
	"应天劫": { groupNumber: "231734390*下载\n2811466327*墙" },
	"永7": { groupNumber: "1092736604" },
	"永虹灰归的Polis": { groupNumber: "696523899", aliases: ["永虹"] },
	"永夜后日谈": { groupNumber: "710242752" },
	"幽世常世的满天下": { groupNumber: "749173986" },
	"幽诱,于指尖燃起": { groupNumber: "978331360", aliases: ["幽诱"] },
	"犹格索托斯之影": { groupNumber: "579586813" },
	"油盐不进": { groupNumber: "575319883" },
	"游龙之年": { groupNumber: "693371984" },
	"于赤土腹中再会": { groupNumber: "1060512906", aliases: ["于赤土"] },
	"愚者的祈雨": { groupNumber: "1062832797" },
	"语音": { groupNumber: "893711161\n*dnd为主但不限规则" },
	"玉台新薤": { groupNumber: "881091572*交流\n439862498*KP" },
	"欲望之箱": { groupNumber: "739976718" },
	"冤缘远怨": { groupNumber: "1033066580*下载" },
	"缘因何为": { groupNumber: "656621118*下载" },
	"远方呢喃": { groupNumber: "761735153" },
	"远星者": { groupNumber: "820393813" },
	"月背迷踪": { groupNumber: "1037660739*下载" },
	"月蜂": { groupNumber: "110208332" },
	"月计": { groupNumber: "702203298" },
	"云黑": { groupNumber: "795251459" },
	"云上仙": { groupNumber: "939600700*下载" },
	"再见新世界": { groupNumber: "1004914022*下载\n909369023*KP" },
	"造物者": { groupNumber: "948914482" },
	"斩我": { groupNumber: "776965370" },
	"斩仙槐": { groupNumber: "973867121*下载\n690343204*KP" },
	"战争神谕": { groupNumber: "413947504" },
	"蟑螂启示录": { groupNumber: "957865225" },
	"长天摘星": { groupNumber: "552342168*PL\n595926395*KP" },
	"长兴镇": { groupNumber: "906847246" },
	"掌中雪": { groupNumber: "860685448*下载" },
	"沼泽人": { groupNumber: "913354882" },
	"侦探可有翅膀吗": { groupNumber: "963854131", aliases: ["侦探翅"] },
	"镇魂歌": { groupNumber: "709032901" },
	"正伪的ideal": { groupNumber: "667098598" },
	"芝加哥之王": { groupNumber: "559366167" },
	"致让我们死去活来仍然热爱的冰上的一切": { groupNumber: "1087789609*下载\n1087899806*KP", aliases: ["滑冰"] },
	"致我不灭的": { groupNumber: "1073548076*下载\n1077901406*KP" },
	"掷骰演出": { groupNumber: "1090720849*下载" },
	"终焉之歌为谁而唱": { groupNumber: "272502055" },
	"众妙之门": { groupNumber: "785654926、651350563", aliases: ["zmzm"] },
	"周边": { groupNumber: "945344459*汇总\n1073238820*交易", aliases: ["谷子"] },
	"烛堡": { groupNumber: "467303448" },
	"撞邪": { groupNumber: "415568723" },
	"追书人": { groupNumber: "942014926" },
	"坠入阿弗纳斯": { groupNumber: "223713820" },
	"斫夜": { groupNumber: "220150371*下载" },
	"左川之国失落谭": { groupNumber: "770779991", aliases: ["左川"] },
	"ABO同工同酬": { groupNumber: "991822168*下载\n991872893*KP" },
	"ABS": { groupNumber: "941349942", aliases: ["全蓝综合征"] },
	"AIB": { groupNumber: "112077093" },
	"Antinomy": { groupNumber: "101476385" },
	"BASH": { groupNumber: "774156947", aliases: ["燃星"] },
	"brp": { groupNumber: "788438516" },
	"Bubble on Stage": { groupNumber: "734220119" },
	"CandelaObscura": { groupNumber: "1053180006*下载\n1049162012*GM", aliases: ["暗烛"] },
	"ccf": { groupNumber: "805511454*搭房\n1060652550*招募" },
	"coj模组": { groupNumber: "530070122" },
	"dear-flip-flops": { groupNumber: "345837146", aliases: ["dff"] },
	"difftruth": { groupNumber: "849680089" },
	"fist": { groupNumber: "830324938" },
	"GinGin": { groupNumber: "1035861353" },
	"GODARCA": { groupNumber: "869783432" },
	"GURPS": { groupNumber: "577412220" },
	"H:tv": { groupNumber: "684526713" },
	"insane": { groupNumber: "650600421" },
	"IQ游行Re：LOAD": { groupNumber: "1062159214" },
	"log": { groupNumber: "675664988*存放\n873371415*存放\n985865497*整理" },
	"LUCA": { groupNumber: "1077454734*下载" },
	"m大随机杀人事件": { groupNumber: "1079465494*下载\n548428936*KP" },
	"magnificas": { groupNumber: "477317221", aliases: ["mag"] },
	"moon cell": { groupNumber: "972416799*下载\n817071819*KP" },
	"MTG世设": { groupNumber: "1043664376" },
	"nobody": { groupNumber: "694908547", aliases: ["nbd"] },
	"one way straight": { groupNumber: "978645254*下载" },
	"Over kill the festival": { groupNumber: "https://seesaawiki.jp/trpgyarouzu/d/Over%20kill%20the%20festival" },
	"PAC": { groupNumber: "720930120" },
	"pathfinder 2e": { groupNumber: "695214825", aliases: ["pf2"] },
	"R∈D - Re:Dawn -": { groupNumber: "859997225", aliases: ["R∈D","Re:Dawn","red"] },
	"reaby": { groupNumber: "334767023" },
	"Regnagleppod": { groupNumber: "939930942", aliases: ["玻璃人"] },
	"rEpl∀λ": { groupNumber: "1082342542", aliases: ["回溯"] },
	"ROP": { groupNumber: "783947110*有作者\n780307937*无作者", aliases: ["生丝"] },
	"SCP基金会": { groupNumber: "602431810", aliases: ["FITF","Fear in the Foundation"] },
	"Sillage香水屋": { groupNumber: "921302134", aliases: ["Sillage","香水屋"] },
	"SKT": { groupNumber: "376500876" },
	"Snow Spine": { groupNumber: "1070979351", aliases: ["雪脊"] },
	"ssk": { groupNumber: "708231245" },
	"ssss": { groupNumber: "926664565", aliases: ["4s"] },
	"Stifle, and with hymn": { groupNumber: "1064285359*下载\n1062672838*KP", aliases: ["hymn"] },
	"The Moist Star": { groupNumber: "1035170762*下载" },
	"the name": { groupNumber: "324809275*下载", aliases: ["遗书"] },
	"U name it": { groupNumber: "1072212301" },
	"vamp": { groupNumber: "553675094" },
	"ventangle": { groupNumber: "754138533" },
	"VEЯ": { groupNumber: "798805482", aliases: ["ver"] },
	"VirtuaLive": { groupNumber: "664998654*下载" },
	"void": { groupNumber: "1170037255" },
	"wts": { groupNumber: "763188284" },
	"WWRPG": { groupNumber: "818401752", aliases: ["Wizarding World"] },
	"X告白": { groupNumber: "575451544" },
	"X休止": { groupNumber: "623836728" },
	"zinki": { groupNumber: "761916849" }
};

// 反向映射
const groupNumberToNameMap = {};
for (const groupName in groupMap) {
    const groupInfo = groupMap[groupName];
    // 分隔符
    const groupNumbers = groupInfo.groupNumber.split(/[、\n*]/);
    
    groupNumbers.forEach(number => {
        const cleanNumber = number.trim();
        // 确保是纯数字且不为空
        if (cleanNumber && /^\d+$/.test(cleanNumber)) {
            if (!groupNumberToNameMap[cleanNumber]) {
                groupNumberToNameMap[cleanNumber] = [];
            }
            if (!groupNumberToNameMap[cleanNumber].includes(groupName)) {
                groupNumberToNameMap[cleanNumber].push(groupName);
            }
        }
    });
}

// 字符串相似度
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

		// 相似度高于或等于30%
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

// 所有群组信息
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

// 解析 .kp mk 的输入
function parseMKInput(input) {
    const groups = [];
    
    // 方法1：多行格式（按换行符分割）
    const lines = input.split(/[\r\n]+/)
        .map(line => line.trim())
        .filter(line => line.length > 0);
    
    if (lines.length >= 2 && lines.length % 2 === 0) {
        let allValid = true;
        // 检查是否为有效的多行格式（奇数行是名称，偶数行是号码）
        for (let i = 1; i < lines.length; i += 2) {
            if (!/\d/.test(lines[i])) {
                allValid = false;
                break;
            }
        }
        
        if (allValid) {
            for (let i = 0; i < lines.length; i += 2) {
                if (i + 1 < lines.length) {
                    groups.push({
                        name: lines[i],
                        number: lines[i + 1]
                    });
                }
            }
            return groups; // 成功解析多行格式，直接返回
        }
    }
    
    // 方法2：单行分隔格式
    // 统一分隔符：中文逗号、顿号 → 英文逗号
    let normalizedInput = input
        .replace(/，/g, ',')
        .replace(/、/g, ',')
        .replace(/\s+/g, ''); // 移除所有空格
    
    const parts = normalizedInput.split(',')
        .map(p => p.trim())
        .filter(p => p.length > 0);
    
    // 每两个部分为一组
    for (let i = 0; i < parts.length; i += 2) {
        if (i + 1 < parts.length) {
            // 验证第二个参数包含数字
            if (/\d/.test(parts[i + 1])) {
                groups.push({
                    name: parts[i],
                    number: parts[i + 1]
                });
            }
        }
    }
    
    return groups;
}

// .kp指令
const cmdKp = seal.ext.newCmdItemInfo();
cmdKp.name = 'kp';
cmdKp.help = `KP群查询指令
.kp <关键词>    // 查询特定KP群号(支持反向查询)
.kp list    // 列出所有KP群信息(超长慎用)
.kp help    // 显示本帮助`;

cmdKp.solve = (ctx, msg, cmdArgs) => {
    let ret = seal.ext.newCmdExecuteResult(true);
    const input = cmdArgs.getArgN(1);
    
    // 24H提醒检查更新
    const userId = msg.sender.userId;
    const now = Date.now();
    const lastNotify = userLastNotify.get(userId) || 0;
    
    if (now - lastNotify > 24 * 60 * 60 * 1000) {
        userLastNotify.set(userId, now);
        checkUpdateOnce(ctx, msg, userId).catch(console.error);
    }
    
    // 命令help
    if (input === 'help' || input === '') {
        ret.showHelp = true;
        return ret;
    }

    // 列出所有群组
    function sendGroupListSegmented(ctx, msg, listText) {
        const lines = listText.split('\n');
        const segmentSize = 20; // 每段行数
        const segments = [];
        
        // 分段处理
        for (let i = 0; i < lines.length; i += segmentSize) {
            const segment = lines.slice(i, i + segmentSize).join('\n');
            segments.push(segment);
        }
        
        // 分段发送
        segments.forEach((segment, index) => {
            setTimeout(() => {
                const header = segments.length > 1 ? `【第 ${index + 1}/${segments.length} 段】\n` : '';
                seal.replyToSender(ctx, msg, header + segment);
            }, index * 1500); // 每段间隔，避免发送过快
        });
        
        // 最后发送图片
        setTimeout(() => {
            seal.replyToSender(ctx, msg, '图已很久没更新，插件有问题请进2150284119反馈\n[CQ:image,file=https://github.com/errrr-er/alll/blob/main/call_of_cthulhu/kp/kp.png?raw=true,type=show]');
        }, segments.length * 500 + 200);
    }

// mk命令 - 生成群组代码格式
if (input.toLowerCase() === 'mk') {
    // 获取 mk 后面的所有参数（去掉 "mk" 本身）
    let mkContent = cmdArgs.rawArgs.trim();
    
    // 移除开头的 "mk" 字符串
    if (mkContent.toLowerCase().startsWith('mk')) {
        mkContent = mkContent.substring(2).trim();
    }
    
    if (!mkContent) {
        seal.replyToSender(ctx, msg, 
            "用法：.kp mk [内容]\n" +
            "支持以下格式：\n" +
            "1. 逗号分隔：名称,号码,名称,号码\n" +
            "2. 顿号分隔：名称、号码、名称、号码\n" +
            "3. 多行格式：\n名称\n号码\n名称\n号码"
        );
        return ret;
    }
    
    // 解析输入的群组信息
    const groups = parseMKInput(mkContent);
    
    if (groups.length === 0) {
        seal.replyToSender(ctx, msg, 
            `解析失败，未找到有效的群组信息。\n\n` +
            `接收到的内容：\n${mkContent}\n\n` +
            `请检查格式是否正确。`
        );
        return ret;
    }
    
    // 生成当前时间戳
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    
    // 生成输出
    let output = `当前时间戳：${currentTimestamp}\n${dateStr}\n\n`;
    
    output += `JSON格式（适配青果）：\n`;
    groups.forEach(group => {
        const escapedNumber = JSON.stringify(group.number).slice(1, -1);
        output += `"${group.name}": { "groupNumber": "${escapedNumber}" },\n`;
    });
    
    output += `\nJS格式（适配海豹）：\n`;
    groups.forEach(group => {
        const escapedNumber = JSON.stringify(group.number).slice(1, -1);
        output += `"${group.name}": { groupNumber: "${escapedNumber}" },\n`;
    });
    
    output += `\n成功解析 ${groups.length} 个群组：\n`;
    groups.forEach((group, index) => {
        output += `${index + 1}. ${group.name} → ${group.number}\n`;
    });
    
    seal.replyToSender(ctx, msg, output);
    return ret;
}

    // list命令
    if (input.toLowerCase() === 'list') {
        const listText = `所有KP群信息:\n${generateGroupList()}`;
        sendGroupListSegmented(ctx, msg, listText);
        return ret;
    }

    // 反向查询
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
            seal.replyToSender(ctx, msg, `未找到匹配【${input}】的KP群，请先检查插件是否为最新版，接着使用 .kp list 查看所有群组(超长慎用)，或进2150284119反馈。`);
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
            seal.replyToSender(ctx, msg, `未找到匹配【${input}】的KP群，请先检查插件是否为最新版，接着使用 .kp list 查看所有群组(超长慎用)，或进2150284119反馈。`);
        }
    } else {
        // 精确匹配输出
        seal.replyToSender(ctx, msg, `精确匹配【${input}】：\n【${foundGroup.match.name}】→ ${foundGroup.match.info.groupNumber}`);
    }

    return ret;
};

// 注册指令
ext.cmdMap['kp'] = cmdKp;
