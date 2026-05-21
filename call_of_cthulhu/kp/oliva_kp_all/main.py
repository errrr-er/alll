import OlivOS
import re
import json
import os
import threading
import time
import requests
import random

# ===============================
# 全局数据
# ===============================
groupMap = {}
groupNumberToNameMap = {}
current_version = "1.0.0"
current_timestamp = 0
data_loaded = False

GITHUB_JSON_URL = "https://hk.gh-proxy.org/https://raw.githubusercontent.com/errrr-er/alll/refs/heads/main/call_of_cthulhu/kp/kp_groupMap.json"

PLUGIN_DIR = os.path.dirname(os.path.abspath(__file__))
OLIVOS_ROOT = os.path.dirname(os.path.dirname(PLUGIN_DIR))
LOCAL_JSON_PATH = os.path.join(OLIVOS_ROOT, "data", "oliva_kp_all", "kp_groupMap.json")

# 自动更新冷却（全局，24 小时）
last_auto_update_time = 0
auto_update_cooldown = 24 * 3600

# ===============================
# 工具函数
# ===============================
def ensure_data_directory():
    data_dir = os.path.dirname(LOCAL_JSON_PATH)
    if not os.path.exists(data_dir):
        os.makedirs(data_dir, exist_ok=True)

def get_similarity(s1: str, s2: str) -> float:
    s1 = s1.lower()
    s2 = s2.lower()

    # Levenshtein 得分
    def levenshtein_score(a, b):
        len1, len2 = len(a), len(b)
        if max(len1, len2) == 0:
            return 1.0
        matrix = [[0]*(len2+1) for _ in range(len1+1)]
        for i in range(len1+1):
            matrix[i][0] = i
        for j in range(len2+1):
            matrix[0][j] = j
        for i in range(1, len1+1):
            for j in range(1, len2+1):
                cost = 0 if a[i-1] == b[j-1] else 1
                matrix[i][j] = min(
                    matrix[i-1][j] + 1,
                    matrix[i][j-1] + 1,
                    matrix[i-1][j-1] + cost
                )
        distance = matrix[len1][len2]
        return 1.0 - distance / max(len1, len2)

    # Jaccard 得分
    def jaccard_score(a, b):
        set1 = set(a)
        set2 = set(b)
        if not set1 and not set2:
            return 0.0
        intersection = len(set1 & set2)
        union = len(set1 | set2)
        return intersection / union if union else 0.0

    return max(levenshtein_score(s1, s2), jaccard_score(s1, s2))

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
def update_data(remote_data):
    global groupMap, current_version, current_timestamp
    try:
        old_count = len(groupMap)
        groupMap = remote_data.get("group_map", {})
        current_version = remote_data.get("version", current_version)
        current_timestamp = remote_data.get("timestamp", int(time.time()))
        build_reverse_mapping()
        save_local_data()
        return len(groupMap) - old_count  # 返回变化数量
    except:
        return None

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
            change = update_data(remote)
            if change is not None:
                plugin_event.reply(
                    f"数据更新成功\n"
                    f"当前群组数量: {len(groupMap)}（变化 {change}）\n"
                    f"版本: {current_version}"
                )
            else:
                plugin_event.reply("更新失败")
        else:
            plugin_event.reply("当前已是最新版本")
    except Exception as e:
        plugin_event.reply(f"更新失败：{e}")

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
        remote = r.json()
        remote_version = remote.get("version", "0.0.0")
        remote_timestamp = remote.get("timestamp", 0)
        if remote_version != current_version or remote_timestamp != current_timestamp:
            change = update_data(remote)
            if change is not None and plugin_event:
                plugin_event.reply(
                    f"数据更新成功\n"
                    f"当前群组数量: {len(groupMap)}（变化 {change}）\n"
                    f"版本: {current_version}"
                )
    except:
        if plugin_event:
            plugin_event.reply("KP群插件版本检测失败，请进2150284119反馈")

# ===============================
# 公共回复消息
# ===============================
def not_found_msg(keyword):
    return f"【{keyword}】查找失败，请先检查更新，或进2150284119反馈"

def alias_text(info) -> str:
    aliases = info.get("aliases", [])
    if aliases:
        return f"({'|'.join(aliases)})"
    return ""

# ===============================
# 搜索功能(分段发送近似结果)
# ===============================
def send_chunks(chunks, index, plugin_event, input_text):
    if index >= len(chunks):
        return
    chunk = chunks[index]
    if len(chunks) > 1:
        reply = f"近似【{input_text}】（{index+1}/{len(chunks)}）"
    else:
        reply = f"近似【{input_text}】"

    for group in chunk:
        name = group["name"]
        info = group["info"]
        score = group["score"]
        atxt = alias_text(info)
        reply += f"\n【{name}{atxt}】{round(score*100)}%\n{info.get('groupNumber','')}\n"

    plugin_event.reply(reply)

    # 下一段延迟x秒
    if index + 1 < len(chunks):
        threading.Timer(3.0, send_chunks, args=(chunks, index+1, plugin_event, input_text)).start()

def search_group(plugin_event, search_input):
    search_input = search_input.strip()
    lower = search_input.lower()

    # 1. 反查群号（纯数字）
    if search_input.isdigit():
        matches = groupNumberToNameMap.get(search_input, [])
        if matches:
            reply = ""
            for name in matches:
                info = groupMap.get(name, {})
                atxt = alias_text(info)
                reply += f"反向【{name}{atxt}】\n{info.get('groupNumber','')}\n"
            plugin_event.reply(reply.strip())
        else:
            plugin_event.reply(not_found_msg(search_input))
        return

    # 2. 精确匹配（主名称或别名）
    for name, info in groupMap.items():
        if name.startswith("#"):
            continue
        if name.lower() == lower:
            atxt = alias_text(info)
            plugin_event.reply(f"精确【{name}{atxt}】\n{info.get('groupNumber','')}")
            return
        for a in info.get("aliases", []):
            if a.lower() == lower:
                atxt = alias_text(info)
                plugin_event.reply(f"精确【{name}{atxt}】\n{info.get('groupNumber','')}")
                return

    # 3. 模糊匹配（相似度 >= 0.3）
    matched = []
    for name, info in groupMap.items():
        if name.startswith("#"):
            continue
        candidates = [name] + info.get("aliases", [])
        best_score = 0.0
        for candidate in candidates:
            score = get_similarity(lower, candidate.lower())
            if score > best_score:
                best_score = score
        if best_score >= 0.3:
            matched.append({"name": name, "info": info, "score": best_score})
    
    # x条一段
    if matched:
        matched.sort(key=lambda x: x["score"], reverse=True)
        chunk_size = 5 
        chunks = [matched[i:i+chunk_size] for i in range(0, len(matched), chunk_size)]
        send_chunks(chunks, 0, plugin_event, search_input)
    else:
        plugin_event.reply(not_found_msg(search_input))

# ===============================
# 指令处理
# ===============================
def process_kp_command(plugin_event):
    # 每次 .kp 指令触发时尝试自动更新（全局冷却）
    auto_update_on_command(plugin_event)

    message = plugin_event.data.message
    if not message:
        return

    # 支持多种前缀
    prefixes = (".", "。", "，", "/", "、")
    cmd_base = "kp"
    prefix_len = 0
    for p in prefixes:
        if message.startswith(p + cmd_base):
            prefix_len = len(p + cmd_base)
            break
    else:
        return

    remaining = message[prefix_len:].strip()
    lower_remaining = remaining.lower()

    # 帮助或空输入
    if lower_remaining == "help" or lower_remaining == "":
        plugin_event.reply(
            "KP群查询指令\n"
            ".kp <关键词/群号>    // 查询KP群(支持花名)\n"
            ".kp list            // 群组源文件(提供镜像)\n"
            ".kp list x			// 随机抽取x个群组(最多5)"
        )
        return

    # 特殊命令 list
    if re.match(r'^list(\s+\d+)?$', lower_remaining):
        count_match = re.match(r'^list\s+(\d+)$', lower_remaining)
        if count_match:
            count = int(count_match.group(1))
            count = max(1, min(count, 5))
            valid_keys = [name for name in groupMap if not name.startswith("#")]
            actual_count = min(count, len(valid_keys))

            if actual_count == 0:
                plugin_event.reply("暂无有效数据，请进2150284119反馈")
                return

            chosen = random.sample(valid_keys, actual_count)
            reply = f"随机{actual_count}"
            for name in chosen:
                info = groupMap[name]
                atxt = alias_text(info)
                reply += f"\n【{name}{atxt}】\n{info.get('groupNumber', '')}\n"
            plugin_event.reply(reply)
        else:
            plugin_event.reply(
                "https://raw.githubusercontent.com/errrr-er/alll/refs/heads/main/call_of_cthulhu/kp/issues_base/database.json\n\n如果使用不了请打镜像(选其一)\n将以下内容添加在开头(不是替换！)\n\nhttps://hk.gh-proxy.org/\nhttps://gh-proxy.org/\nhttps://edgeone.gh-proxy.org/"
            )
        return

    # 手动更新命令
    if lower_remaining == "update":
        manual_update(plugin_event)
        return

    # 其余全部作为搜索关键词
    search_group(plugin_event, remaining)

# ===============================
# OlivOS 事件绑定
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