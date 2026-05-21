### 包含

- [.kp] KP群汇总（JS/OPK）
- [.沉默 help] 沉默提醒（JS）
- 多套回复生成器（网页）
- 下载/反馈群（二维码）

### [.kp] KP群汇总（JS/OPK）

> .kp <关键词/群号>
> 
> 用于：查询KP群(支持花名)

> .kp list
> 
> 用于：群组源文件(提供镜像)

> .kp list x
> 
> 用于：随机抽取x个群组(最多5)

- 【兼容】
    - 精确查询（精确输出100%对应的查询结果、包含已录入的花名）
    - 模糊查询（除精确匹配外输出所有匹配值超过30%的查询结果）
    - 反向查询（通过群号反向查询对应名称）

- 【海豹】
    - 更新提醒（使用时自动触发，对比文件与GitHub中的TimeStamp部分，接着进入24H勿打扰时间）

- 【青果】
    - 自动更新（除opk更新外无需考虑手动覆盖，更新失败时会跳出提醒，自动从GitHub拉取最新版本，接着进入24H勿打扰时间）

- 【GitHub Issue】
    - 可通过.kpissue功能提交（仅群内猫骰有此功能）
        - 用法：.kpissue 群号 别名1,别名2(可选)
    - 或在GitHub Issue页面使用模板
        - 第一个框是模组名
        - 第二个框是群号（支持数字符号文字混合）
        - 第三个是别名，也可以是缩写（可填也可留空，留空不影响）

|||
|:-:|:-:|
|![](https://github.com/errrr-er/alll/blob/main/readme_pic/kp/create_issue.jpg?raw=true)||

- 【其它】
    - 数据组的维护流程为半人工半github action，有问题可随时提出

### [.沉默 help] 沉默提醒（JS）

> .沉默 <分钟>
> 
> 用于：群内X分钟无人说话时@全体

> .沉默
> 
> 用于：查看本群当前设置和最后活跃时间

### 多套回复生成器（网页）

> ※强烈推荐配合海豹官方手册进行生成与修改
> 
> ※非网页本身的问题请先尝试在官群答疑解惑

- 【兼容】
    - 海豹v1、海豹v2

- 【整体】
    - 提供实时预览、一键复制、恢复默认、从代码导入等功能

- 【板块】
    - 通用、jrrp、log计时\*、切换\*
    - ※未打*代表可根据提供的配置进行修改，具体请自行体验
    - ※打*代表仅提供复制即可用的模板，后续可自行在此基础上增添内容

- 【通用】
    - 适配大多数回复

- 【jrrp】
    - 专门适配jrrp

- 【log计时】
    - 适配new、on、off、end

- 【切换】
    - 指令切换、汇报状态
    - ※请放至“自定义回复”处

- 【更多】
    - 开发中……如有想加的功能可随时提出

|通用|jrrp|
|:-:|:-:|
|![](https://github.com/errrr-er/alll/blob/main/readme_pic/multi/%E9%80%9A%E7%94%A8.png?raw=true)|![](https://github.com/errrr-er/alll/blob/main/readme_pic/multi/jrrp.png?raw=true)|

|log计时|切换|
|:-:|:-:|
|![](https://github.com/errrr-er/alll/blob/main/readme_pic/multi/log.png?raw=true)|![](https://github.com/errrr-er/alll/blob/main/readme_pic/multi/%E5%88%87%E6%8D%A2.png?raw=true)|

### 下载/反馈群（二维码）

> 请先阅读公告

- 【兼容】
    - 反馈、公告、插件触发指令

- 【群聊】
    - 可查看全部消息、参与讨论

- 【频道】
    - 仅接收公告，减少消息打扰

|群聊|频道|
|:-:|:-:|
|![](https://github.com/errrr-er/alll/blob/main/readme_pic/reply/%E5%8F%8D%E9%A6%88%E7%BE%A4.jpg?raw=true)|![](https://github.com/errrr-er/alll/blob/main/readme_pic/reply/%E4%B8%8B%E8%BD%BD%E7%BE%A4.jpg?raw=true)|
