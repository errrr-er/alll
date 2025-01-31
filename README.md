> [!TIP]
> 善用目录`箭头旁按钮`![](https://github.com/errrr-er/alll/blob/main/other/readme_pic/readme_lists_pointout.png?raw=true)

> [!IMPORTANT]
> - 导入前须知&本体更新方式
>     - TOML制作原理为文件内不存储任何抽取结果、全靠骰子通过文件内的配置从github拉取相关信息
>         - 利：修正后无需手动更新(除非修改toml本体)
>         - 弊：骰子无法连接(github/镜像) = 无法使用
> - TOML/JSON皆适配海豹系、其它骰系暂且未知、欢迎补充
>     - 海豹系：`扩展功能`->`牌堆管理/JS扩展`->`更新`
> ![](https://github.com/errrr-er/alll/blob/main/other/readme_pic/sealdice_update_example_pointout.png?raw=true)

> [!CAUTION]
> - **禁止使用other文件夹里的内容**
> - 除非有特殊说明、其余使用时默认同意并遵守[CC-BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/deed.zh-hans)许可协议
> - 发布地点有且仅有[github(errr-er)](https://github.com/errrr-er/alll)、[QQ空间(3612464276)](https://user.qzone.qq.com/3612464276)、[微博(@裗浳)](https://m.weibo.cn/u/7850658576?luicode=10000011&lfid=1005056364573448)
> - 仓内均为无原作授权的个人制作/整理&人机混翻、若内容有误/漏欢迎补充
> - 本人不负责因多转(或不正当使用)产生/导致的任何问题/情况
> - 须知/译文更新后会传至同样位置(但不另行通知)

# 汇报错误/补充 :inbox_tray:

提问箱 - https://box.n3ko.cc/_/no_reply31cat

issues - https://github.com/errrr-er/alll/issues

以上方式选其一即可、反馈时请带上相关截图!!!

<sub>*提issues需要登录github</sub>

# Candela Obscura【准备中、优先级II】

- Markdown/HTML
    - 暗烛快速入门指南
- Json
    - 光明世界D6池系统

## 暗烛快速入门指南 ver0.0.0

格式排版等改动欢迎反馈、会提取有效建议并在后续更新中进行变更

> [!CAUTION]
> Markdown以适配Github阅读为主、使用其它软件阅读可能会出现不适配情况。
> 
> VitePress根据相关语法进行修改、指南版本通常比Markdown落后。

- Markdown
    - [最新版、可在线or下载使用](https://github.com/errrr-er/alll/blob/main/candela_obscura/candela_obscura_qsg.md)
- VitePress
    - [仅在线使用](https://errrr-er.github.io/Candela_QSG/)

## 光明世界D6池系统 ver1.1.0

- 触发指令为
    - `.iw <n>` // 掷出nD6(标准骰)并汇报最高成功等级
    - `.iwd <n> <d>` // 掷出nD6(标准骰)与dD6(镀金骰)并汇报双方各自最高成功等级
        - `<n>`与`<d>`之间的空格**非！常！重！要！**
- [illuminated_worlds.js](https://github.com/errrr-er/alll/blob/main/candela_obscura/illuminated_worlds.js)下载后导入即可

# Call of Cthulhu【三语对照目录制作中、内容准备中、优先级I】

- TOML
    - 旧版手册呪文(三语对照)

## 旧版手册呪文(三语对照) ver1.0.0

> [!CAUTION]
> - 导入后位于`牌组列表`最底部
>   - 因抽取词无法隐藏会导致底部**超级、超级长！！！**
>   - 折叠请使用删除键右侧的小箭头(一次性、无法永久折叠)
> - `.draw keys`过长会报错、抽取词将在`.draw mhelp`时提供图片版(详见下图)
> - 尽量提供中日英释义、但大部分将会是`日名+中英释义`
> - 若有任何遗漏欢迎补充

- 只需下载本体、即[z_magic_all.toml](https://github.com/errrr-er/alll/tree/main/call_of_cthulhu/magic/CJE/z_magic_all.toml)
- 仅想看对应名称可下载[excel](https://github.com/errrr-er/alll/tree/main/call_of_cthulhu/magic/CJE/%E6%97%A7%E7%89%88%E6%89%8B%E5%86%8C%E5%91%AA%E6%96%87_%E4%BB%85%E5%90%8D%E7%A7%B0.xlsx)或详见下图

![](https://github.com/errrr-er/alll/blob/main/other/readme_pic/magic_all.png?raw=true)

# 参考资料

## Markdown语法

- 中
    - [字体颜色](https://blog.csdn.net/heimu24/article/details/81189700)（by heimu24）
    - [左右分栏](https://blog.csdn.net/zhangyu4863/article/details/83504008)（by zhangyu4863）
    - [基本撰写和格式语法](https://docs.github.com/zh/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax)（by Github）
    - [页内跳转&内置目录](https://blog.csdn.net/qq_38276669/article/details/86748936)（by L_MaGw）
    - [Github中高亮字体](https://github.com/guodongxiaren/README/issues/21)（by wilddylan）

## HTML语法

- 英
    - [Convert Markdown to HTML](https://markdowntohtml.com/)

## Json语法

- 中
    - [海豹手册](https://dice.weizaima.com/manual/)（by海豹官方）
    - [北欧奇谭规则检定](https://github.com/sealdice/javascript)（by浣熊旅記）

- 英
    - [Epoch & Unix Timestamp Conversion Tools](https://www.epochconverter.com/)

## VitePress语法
- 中
    - [VitePress手册](https://vitepress.dev/zh/)（by VitePress）

## PDF转换

- 英
    - [Convert/Edit/Organize](https://www.pdfforge.org/online/en)

## Candela Obscura

- 英
    - [完整手册(电子版) $19.99](https://shop.critrole.com/collections/books/products/candela-obscura-core-rulebook-pdf)（by Critical Role）
    - [完整手册(实体&电子版) $39.99](https://shop.critrole.com/products/candela-obscura-core-rulebook)（by Critical Role）
    - [Candela Obscura Quickstart Guide](https://shop.critrole.com/products/candela-obscura-quickstart-guide)（by Critical Role）

https://www.reddit.com/r/criticalrole/comments/152ix2y/no_spoilers_looking_for_a_printer_friendly/

## 旧版手册呪文(三语对照)

- 中
    - 海豹内置查询文档（by海豹官方）
    - [克蘇魯神話咒文(中)](https://home.gamer.com.tw/creationDetail.php?sn=4140071)（by實樂）
    - 克苏鲁神话魔法大典1.1.2（by七宫涟）
    - [COC常见魔法日汉英对照](https://www.bilibili.com/opus/853115006210801681)（uid147558）
- 日
    - [クトゥルフTRPGの呪文一覧](https://trpg-yaruo.com/jyumon/)
    - [クトゥルフ神話TRPGで使える呪文まとめ](https://boardgame-blog.com/cthulhu-spell/)
    - [クトゥルフ神話の呪文一覧｜ネクロノミコンやエイボンの書でお馴染みの呪文解説](https://trpg-japan.com/call_of_cthulhu/coc-basic/cthulhu-mythos-spell-list/)
- 英
    - [Grimoire Spells](http://www.gubaba.org/mi2/wiki/index.php/Grimoire_Spells)（by MI2wiki）
    - [Grimoire Spells Specific](http://www.gubaba.org/mi2/wiki/index.php/Grimoire_Spells_Specific)（by MI2wiki）
    - The Grand Grimoire of Cthulhu Mythos Magic（by Mike Mason, Matt Sanderson）
