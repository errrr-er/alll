### [.countlog] log骰点统计（JS）

> .countlog st
>
> 用于：查看自己的记录

> .countlog st all
>
> 用于：查看所有人的记录

> .countlog clr
>
> 用于：导出并清除自己的记录

> .countlog clr all
>
> 用于：导出并清除所有人的记录

- 【注意】
    - 请确保导入后插件处于开启状态
    - 以下功能皆为根据log状态自动触发

- 【功能】
    - 记录成功/失败等级（ra、rap、rab、rah、sc）
    - log new
        - 自动开始记录，同时导出并清除所有人的记录
    - log on
        - 自动开始记录
    - log off
        - 自动暂停记录
    - log end
        - 自动暂停记录，同时导出并清除所有人的记录
    - 暂不支持（rav）