import OlivOS
import re
import json
import os
import threading
import time
import requests
import difflib

# ===============================
# 全局数据
# ===============================
groupMap = {}
groupNumberToNameMap = {}
current_version = "1.0.0"
current_timestamp = 0
data_loaded = False

GITHUB_JSON_URL = "https://ghproxy.net/https://raw.githubusercontent.com/errrr-er/alll/refs/heads/main/call_of_cthulhu/kp/kp_groupMap.json"

PLUGIN_DIR = os.path.dirname(os.path.abspath(__file__))
OLIVOS_ROOT = os.path.dirname(os.path.dirname(PLUGIN_DIR))
LOCAL_JSON_PATH = os.path.join(OLIVOS_ROOT, "data", "oliva_kp_all", "kp_groupMap.json")

# 自动更新冷却
last_auto_update_time = 0
auto_update_cooldown = 24 * 3600  # 24小时

# ===============================
# 工具函数
# ===============================
def ensure_data_directory():
    data_dir = os.path.dirname(LOCAL_JSON_PATH)
    if not os.path.exists(data_dir):
        os.makedirs(data_dir, exist_ok=True)

# ===============================
# 数据加载与保存
# ===============================
def load_local_data():
    global groupMap, data_loaded, current_version, current_timestamp
    try:
        if os.path.exists(LOCAL_JSON_PATH):
            with open(LOCAL_JSON_PATH, "r", encoding="utf-8") as f:
                data = json.load(f)
            groupMap = data.get("group_map", {})
            current_version = data.get("version", "1.0.0")
            current_timestamp = data.get("timestamp", 0)
        else:
            init_default_data()
            save_local_data()
        build_reverse_mapping()
        data_loaded = True
    except:
        init_default_data()

def save_local_data():
    try:
        ensure_data_directory()
        data = {
            "version": current_version,
            "timestamp": current_timestamp,
            "group_map": groupMap
        }
        with open(LOCAL_JSON_PATH, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
    except:
        pass

def init_default_data():
    global groupMap, current_timestamp
    groupMap = {"看到此条说明需要更新": {"groupNumber": ".kp update"}}
    current_timestamp = int(time.time())
    build_reverse_mapping()

def build_reverse_mapping():
    global groupNumberToNameMap
    groupNumberToNameMap = {}
    for groupName, info in groupMap.items():
        if groupName.startswith("#"):
            continue
        gn = info.get("groupNumber", "")
        numbers = re.findall(r"\b\d+\b", gn)
        for n in numbers:
            if n not in groupNumberToNameMap:
                groupNumberToNameMap[n] = []
            if groupName not in groupNumberToNameMap[n]:
                groupNumberToNameMap[n].append(groupName)

# ===============================
# 更新功能
# ===============================
def update_data(remote_data, plugin_event=None):
    global groupMap, current_version, current_timestamp
    try:
        old_count = len(groupMap)
        groupMap = remote_data.get("group_map", {})
        current_version = remote_data.get("version", current_version)
        current_timestamp = remote_data.get("timestamp", int(time.time()))
        build_reverse_mapping()
        save_local_data()
        if plugin_event:
            plugin_event.reply(
                f"数据更新成功\n"
                f"当前群组数量: {len(groupMap)}（变化 {len(groupMap)-old_count}）\n"
                f"版本: {current_version}"
            )
        return True
    except Exception as e:
        if plugin_event:
            plugin_event.reply(f"更新失败: {e}")
        return False

def manual_update(plugin_event):
    plugin_event.reply("正在检查更新……")
    try:
        r = requests.get(GITHUB_JSON_URL, timeout=10)
        if r.status_code != 200:
            plugin_event.reply(f"更新失败，HTTP {r.status_code}")
            return
        remote = r.json()
        if (remote.get("version") != current_version or
            remote.get("timestamp") != current_timestamp):
            update_data(remote, plugin_event)
        else:
            plugin_event.reply("当前已是最新版本")
    except Exception as e:
        plugin_event.reply(f"更新失败：{e}")

# ===============================
# .kp触发时自动更新（24H冷却）
# ===============================
def auto_update_on_command(plugin_event=None):
    global last_auto_update_time
    now = time.time()
    if now - last_auto_update_time < auto_update_cooldown:
        return  # 冷却中
    last_auto_update_time = now
    try:
        r = requests.get(GITHUB_JSON_URL, timeout=10)
        if r.status_code != 200:
            if plugin_event:
                plugin_event.reply("KP群插件版本检测失败，请进2150284119反馈")
            return
        remote_data = r.json()
        remote_version = remote_data.get("version", "0.0.0")
        remote_timestamp = remote_data.get("timestamp", 0)
        if remote_version != current_version or remote_timestamp != current_timestamp:
            success = update_data(remote_data, plugin_event)
            if not success and plugin_event:
                plugin_event.reply("KP群插件版本检测失败，请进2150284119反馈")
    except:
        if plugin_event:
            plugin_event.reply("KP群插件版本检测失败，请进2150284119反馈")

# ===============================
# 搜索功能（精确 + 模糊 >=30% + 反查）
# ===============================
def search_group(plugin_event, search_input):
    search_input = search_input.strip()
    lower = search_input.lower()

    # 反查群号
    if search_input.isdigit():
        matches = groupNumberToNameMap.get(search_input, [])
        if matches:
            reply = ""
            for name in matches:
                reply += f"【{name}】→ {groupMap[name].get('groupNumber','')}\n"
            plugin_event.reply(reply.strip())
        else:
            plugin_event.reply(f"未找到匹配【{search_input}】的KP群，请先检查插件是否为最新版，接着使用 .kp list 查看所有群组(超长慎用)，或进2150284119反馈。")
        return

    # 精确匹配
    for name, info in groupMap.items():
        if name.startswith("#"):
            continue
        if name.lower() == lower:
            plugin_event.reply(f"【{name}】→ {info.get('groupNumber','')}")
            return
        for a in info.get("aliases", []):
            if a.lower() == lower:
                plugin_event.reply(f"【{name}】→ {info.get('groupNumber','')}")
                return

    # 模糊匹配（相似度 >= 0.3）
    matched = []
    for name, info in groupMap.items():
        if name.startswith("#"):
            continue
        names_to_check = [name] + info.get("aliases", [])
        for n in names_to_check:
            if difflib.SequenceMatcher(None, lower, n.lower()).ratio() >= 0.3:
                matched.append((name, info))
                break

    if matched:
        reply = f"找到以下匹配【{search_input}】的KP群：\n"
        for name, info in matched[:5]:
            reply += f"【{name}】→ {info.get('groupNumber','')}\n"
        plugin_event.reply(reply)
    else:
        plugin_event.reply(f"未找到匹配【{search_input}】的KP群，请先检查插件是否为最新版，接着使用 .kp list 查看所有群组(超长慎用)，或进2150284119反馈。")

# ===============================
# 分段输出列表
# ===============================
def send_group_list_segmented(plugin_event, list_text, segment_size=20):
    lines = list_text.split("\n")
    segments = []
    for i in range(0, len(lines), segment_size):
        segments.append("\n".join(lines[i:i + segment_size]))

    def send_segments():
        total = len(segments)
        for index, segment in enumerate(segments):
            header = f"【第 {index + 1}/{total} 段】\n" if total > 1 else ""
            plugin_event.reply(header + segment)
            time.sleep(1.5)
        plugin_event.reply(
            "图已很久没更新，插件有问题请进 2150284119 反馈\n"
            "[CQ:image,file=https://github.com/errrr-er/alll/blob/main/call_of_cthulhu/kp/kp.png?raw=true,type=show]"
        )

    threading.Thread(target=send_segments).start()

# ===============================
# 指令处理
# ===============================
def process_kp_command(plugin_event):
    auto_update_on_command(plugin_event)
    message = plugin_event.data.message
    if not message:
        return

    prefixes = (".", "。", "，", "/", "、")
    cmd_base = "kp"
    prefix_len = 0
    for p in prefixes:
        if message.startswith(p + cmd_base):
            prefix_len = len(p + cmd_base)
            break
    else:
        return  # 没有匹配前缀

    remaining = message[prefix_len:].strip()
    if not remaining:
        plugin_event.reply(
            "KP群查询帮助：\n"
            ".kp <关键词> - 查询(支持反向查询)\n"
            ".kp list - 列出所有群\n"
            ".kp update - 手动更新"
        )
        return

    # 第一个空格之后为参数
    if " " in remaining:
        command, args = remaining.split(" ", 1)
    else:
        command = remaining
        args = ""
    command = command.lower()

    if command == "help":
        plugin_event.reply(
            "KP群查询帮助：\n"
            ".kp <关键词> - 查询(支持反向查询)\n"
            ".kp list - 列出所有群\n"
            ".kp update - 手动更新"
        )
        return
    if command == "list":
        lines = [f"{name} → {info.get('groupNumber','')}" 
                 for name, info in groupMap.items() if not name.startswith("#")]
        list_text = "所有KP群信息：\n" + "\n".join(lines)
        send_group_list_segmented(plugin_event, list_text)
        return
    if command == "update":
        manual_update(plugin_event)
        return

    # 默认搜索
    search_input = args if args else command
    search_group(plugin_event, search_input)

# ===============================
# OlivOS
# ===============================
class Event(object):
    def init(plugin_event, Proc):
        ensure_data_directory()
        load_local_data()
    def private_message(plugin_event, Proc):
        process_kp_command(plugin_event)
    def group_message(plugin_event, Proc):
        process_kp_command(plugin_event)
    def save(plugin_event, Proc):
        pass
    def menu(plugin_event, Proc):
        if hasattr(plugin_event.data, "event") and plugin_event.data.event == "KPGroupSearch_Menu_Help":
            plugin_event.reply("使用 .kp help 查看帮助")

# 初始化
ensure_data_directory()
load_local_data()