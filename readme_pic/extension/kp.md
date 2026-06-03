> ※扩展和本体是两个独立插件，需分别安装

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

### [.kpissue] 扩展·KP群汇总·提交新群组数据（JS）

> .kpissue 名称 群号 别名1,别名2(可选)
>
> 用户：提交新群组数据

- 选项一【插件配置流程】
    - 拥有GitHub账号（必须）
    - 骰能直连GitHub（必须）
    - 自行修改文件（必须）
    - 【在GitHub获取token】
        - Settings → Developer Settings → Personal access tokens → Fine-grained personal access tokens → Generate new token
        - Token name * ← 必填（随便写）
        - Expiration ← 默认30天，可改成 No expiration
        - Repository access → Only select repositories → Select repositories → errrr-er/alll

- 选项二【GitHub Issue】
    - 拥有GitHub账号（必须）
    - 使用提供的模板（https://github.com/errrr-er/alll/issues）
        - 第一框为模组名
        - 第二框为群号（*下载 | *KP | *官方）←仅KP群则无需备注
        - 第三框为花名（可留空）



【2. GitHub配置】处的【替换】

|||
|:-:|:-:|
|![](https://github.com/errrr-er/alll/blob/main/readme_pic/kp/create_issue.jpg?raw=true)||
