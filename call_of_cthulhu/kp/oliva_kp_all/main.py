import OlivOS
import re
import json
import os
import threading
import time
import requests

# 全局数据
groupMap = {}
groupNumberToNameMap = {}
current_version = "1.0.0"
current_timestamp = 0
data_loaded = False

# GitHub
GITHUB_JSON_URL = "https://ghproxy.net/https://raw.githubusercontent.com/errrr-er/alll/refs/heads/main/call_of_cthulhu/kp/kp_groupMap.json"

# 直接获取py文件路径，上两层进入data文件夹
PLUGIN_DIR = os.path.dirname(os.path.abspath(__file__)) # 当前
OLIVOS_ROOT = os.path.dirname(os.path.dirname(PLUGIN_DIR)) # 上两层
LOCAL_JSON_PATH = os.path.join(OLIVOS_ROOT, "data", "oliva_kp_all", "kp_groupMap.json") #创建本地JSON

# 检测数据目录
def ensure_data_directory():
    data_dir = os.path.dirname(LOCAL_JSON_PATH)
    if not os.path.exists(data_dir):
        os.makedirs(data_dir, exist_ok=True)

# 存储路径
def show_storage_paths(plugin_event):
    path_info = [
        f"插件目录: {PLUGIN_DIR}",
        f"数据路径: {LOCAL_JSON_PATH}",
        f"数据文件: {'存在' if os.path.exists(LOCAL_JSON_PATH) else '不存在'}"
    ]
    
    plugin_event.reply("\n".join(path_info))

# 本地加载数据
def load_local_data():
    global groupMap, groupNumberToNameMap, data_loaded, current_version, current_timestamp
    
    try:
        if os.path.exists(LOCAL_JSON_PATH):
            with open(LOCAL_JSON_PATH, 'r', encoding='utf-8') as f:
                data = json.load(f)
                
            groupMap = data.get("group_map", {})
            current_version = data.get("version", "1.0.0")
            current_timestamp = data.get("timestamp", 0)
            
            # 构建反向映射
            build_reverse_mapping()
            data_loaded = True

        else:
            # 如果本地文件不存在，使用内置数据
            init_default_data()
            save_local_data()

    except Exception as e:
        # 使用内置数据
        init_default_data()

# 初始化数据
def init_default_data():
    global groupMap, current_version, current_timestamp
    
    # 内置数据(初次使用需先更新)
    groupMap = {
        "看到此条说明需要更新": { "groupNumber": ".kp update" },
    }
    current_version = "1.0.0"
    current_timestamp = int(time.time())
    build_reverse_mapping()

# 构建反向映射
def build_reverse_mapping():
    global groupNumberToNameMap
    groupNumberToNameMap = {}
    
    for groupName, groupInfo in groupMap.items():
        # 跳过以#开头的分类标题
        if groupName.startswith("#"):
            continue
            
        numbers = re.findall(r'\b\d+\b', groupInfo["groupNumber"])
        for number in numbers:
            if number not in groupNumberToNameMap:
                groupNumberToNameMap[number] = []
            if groupName not in groupNumberToNameMap[number]:
                groupNumberToNameMap[number].append(groupName)

# 保存数据
def save_local_data():
    try:
        ensure_data_directory()
        data = {
            "version": current_version,
            "timestamp": current_timestamp,
            "group_map": groupMap
        }
        with open(LOCAL_JSON_PATH, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
    except Exception:
        pass

# debug专用
# (真希望永远也用不上)
# (超级无敌长理论上应该删掉但万一呢)
def check_for_updates_debug(plugin_event):
    debug_messages = []
    debug_messages.append(f"GitHub URL: {GITHUB_JSON_URL}")
    debug_messages.append(f"本地路径: {LOCAL_JSON_PATH}")
    
    # 检查本地文件信息
    if os.path.exists(LOCAL_JSON_PATH):
        file_size = os.path.getsize(LOCAL_JSON_PATH)
        file_mtime = time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(os.path.getmtime(LOCAL_JSON_PATH)))
        debug_messages.append(f"本地文件: 存在 (大小: {file_size}字节，修改时间: {file_mtime})")
    else:
        debug_messages.append("本地文件: 不存在")
    
    debug_messages.append(f"当前版本: {current_version}")
    debug_messages.append(f"当前时间戳: {current_timestamp}")
    debug_messages.append(f"当前群组数量: {len(groupMap)}")
    
    try:
        debug_messages.append("发送HTTP请求...")
        start_time = time.time()
        response = requests.get(GITHUB_JSON_URL, timeout=10)
        request_time = time.time() - start_time
        
        debug_messages.append(f"请求耗时: {request_time:.2f}秒")
        debug_messages.append(f"HTTP状态码: {response.status_code}")
        
        if response.status_code == 200:
            debug_messages.append("拉取成功，解析中……")
            remote_data = response.json()
            remote_version = remote_data.get("version", "0.0.0")
            remote_timestamp = remote_data.get("timestamp", 0)
            remote_group_count = len(remote_data.get("group_map", {}))
            
            debug_messages.append(f"云端版本: {remote_version}")
            debug_messages.append(f"云端时间戳: {remote_timestamp}")
            debug_messages.append(f"云端群组数量: {remote_group_count}")
            
            # 比较版本和时间戳
            version_changed = remote_version != current_version
            timestamp_changed = remote_timestamp != current_timestamp
            
            debug_messages.append(f"版本变化: {'是' if version_changed else '否'}")
            debug_messages.append(f"时间戳变化: {'是' if timestamp_changed else '否'}")
            
            if version_changed or timestamp_changed:
                debug_messages.append("有新版本")
                plugin_event.reply("\n".join(debug_messages))
                return remote_data
            else:
                debug_messages.append("无新版本")
                plugin_event.reply("\n".join(debug_messages))
        else:
            debug_messages.append(f"检查更新失败，HTTP状态码: {response.status_code}")
            plugin_event.reply("\n".join(debug_messages))
            
    except requests.exceptions.Timeout:
        debug_messages.append("请求超时（10秒）")
        plugin_event.reply("\n".join(debug_messages))
    except requests.exceptions.ConnectionError:
        debug_messages.append("连接错误，请检查网络")
        plugin_event.reply("\n".join(debug_messages))
    except requests.exceptions.RequestException as e:
        debug_messages.append(f"网络请求异常: {e}")
        plugin_event.reply("\n".join(debug_messages))
    except json.JSONDecodeError as e:
        debug_messages.append(f"JSON解析错误: {e}")
        plugin_event.reply("\n".join(debug_messages))
    except Exception as e:
        debug_messages.append(f"未知错误: {e}")
        plugin_event.reply("\n".join(debug_messages))
    
    return None

# 更新
def update_data(remote_data, plugin_event=None):
    global groupMap, current_version, current_timestamp
    
    try:
        old_version = current_version
        old_timestamp = current_timestamp
        old_count = len(groupMap)
        
        groupMap = remote_data.get("group_map", {})
        current_version = remote_data.get("version", current_version)
        current_timestamp = remote_data.get("timestamp", int(time.time()))
        new_count = len(groupMap)
        
        build_reverse_mapping()

        # 是文件路径
        # save_result = save_local_data()
        
        if plugin_event:
            update_msg = [
                "数据更新成功",
                f"版本: {old_version} → {current_version}",
                f"时间戳: {old_timestamp} → {current_timestamp}",
                f"群组数量: {old_count} → {new_count}",
                f"新增群组: {new_count - old_count}",
                # f"{save_result}"
            ]
            plugin_event.reply("\n".join(update_msg))
        
        return True
    except Exception as e:
        if plugin_event:
            plugin_event.reply(f"更新数据失败: {e}")
        return False

# 手动更新
def manual_update_debug(plugin_event):
    plugin_event.reply("正在获取信息……")
    
    # 这里会直接回复详细的调试信息
    remote_data = check_for_updates_debug(plugin_event)
    if remote_data:
        # 稍等一下让用户看到调试信息
        time.sleep(1)
        plugin_event.reply("开始更新……")
        update_data(remote_data, plugin_event)
    else:
        plugin_event.reply("无可用更新")

# 自动更新
# (不知道有没有用反正手动是有用的)
def auto_update_worker():
    global current_version, current_timestamp

    while True:
        try:
            # 等24H
            time.sleep(24 * 60 * 60)

            print("[AutoUpdate] 正在检查更新...")

            response = requests.get(GITHUB_JSON_URL, timeout=10)
            if response.status_code != 200:
                print(f"[AutoUpdate] 请求失败 HTTP {response.status_code}")
                continue

            remote_data = response.json()
            remote_version = remote_data.get("version", "0.0.0")
            remote_timestamp = remote_data.get("timestamp", 0)

            # 检查是否需要更新
            if remote_version != current_version or remote_timestamp != current_timestamp:
                print(f"[AutoUpdate] 发现新版本: {remote_version} (旧版: {current_version})")
                update_data(remote_data)  # 静默更新，不发消息
                print("[AutoUpdate] 更新成功")

            else:
                print("[AutoUpdate] 已是最新版本")

        except Exception as e:
            print(f"[AutoUpdate] 自动更新出现错误: {e}")

class Event(object):
    def init(plugin_event, Proc):
        # 确保数据目录存在并加载本地数据
        directory_msg = ensure_data_directory()
        load_msg = load_local_data()
        print(f"KP群查询插件初始化: {directory_msg}, {load_msg}")
        
        # 启动自动更新线程
        update_thread = threading.Thread(target=auto_update_worker, daemon=True)
        update_thread.start()

    def private_message(plugin_event, Proc):
        process_kp_command(plugin_event)

    def group_message(plugin_event, Proc):
        process_kp_command(plugin_event)

    def save(plugin_event, Proc):
        pass

    def menu(plugin_event, Proc):
        if hasattr(plugin_event.data, 'event') and plugin_event.data.event == 'KPGroupSearch_Menu_Help':
            plugin_event.reply("使用 .kp help 查看帮助")

def process_kp_command(plugin_event):
    try:
        # 确保数据已加载
        if not data_loaded:
            load_local_data()
            
        message = plugin_event.data.message
        if not message:
            return
            
        # 支持多种前缀
        if not any(message.startswith(prefix + 'kp') for prefix in ('.', '，', '。', '/')):
            return

        parts = message.split()
        if len(parts) < 2:
            plugin_event.reply("使用 .kp help 查看帮助")
            return
            
        command = parts[1].lower()
        
        if command == 'help':
            help_text = [
                "KP群查询指令",
                ".kp <关键词> - 正/反向查询",
                ".kp list - 列出所有群(超长慎用)",
                ".kp update - 手动更新数据",
                "余下为插件debug专用",
                ".kp debug - 调试更新(详细)",
                ".kp paths - 查看存储路径"
            ]
            plugin_event.reply("\n".join(help_text))
        elif command == 'list':
            send_group_list(plugin_event)
        elif command == 'update':
            manual_update(plugin_event)
        elif command == 'debug':
            manual_update_debug(plugin_event)
        elif command == 'paths':
            show_storage_paths(plugin_event)
        else:
            search_group(plugin_event, command)
    except Exception as e:
        plugin_event.reply("处理命令时出现错误 | 请进2150284119反馈")

# 手动更新
def manual_update(plugin_event):
    plugin_event.reply("正在检查更新……")
    
    try:
        response = requests.get(GITHUB_JSON_URL, timeout=10)
        if response.status_code == 200:
            remote_data = response.json()
            remote_version = remote_data.get("version", "0.0.0")
            remote_timestamp = remote_data.get("timestamp", 0)
            
            if remote_version != current_version or remote_timestamp != current_timestamp:
                update_data(remote_data, plugin_event)
            else:
                plugin_event.reply("当前已是最新版本")
        else:
            plugin_event.reply(f"更新失败，HTTP错误代码: {response.status_code}")
    except Exception as e:
        plugin_event.reply(f"更新失败，网络错误: {e}")

def send_group_list(plugin_event, batch_size=20):
    list_lines = []
    valid_count = 0
    for group_name, group_info in groupMap.items():
        # 跳过以#开头的分类标题
        if group_name.startswith("#"):
            continue

        valid_count += 1
        alias_text = ""
        if "aliases" in group_info and group_info["aliases"]:
            alias_text = f"({'、'.join(group_info['aliases'])})"
        list_lines.append(f"{group_name}{alias_text} → {group_info['groupNumber']}")

    if not list_lines:
        plugin_event.reply("暂无群组数据")
        return
    
    # 分批发送
    for i in range(0, len(list_lines), batch_size):
        batch_content = "\n".join(list_lines[i:i + batch_size])
        if i == 0:
            plugin_event.reply(f"{batch_content}")
        else:
            plugin_event.reply(batch_content)

def search_group(plugin_event, search_input):
    # 反向查询
    if re.match(r'^\d+$', search_input):
        matched_groups = groupNumberToNameMap.get(search_input, [])
        if matched_groups:
            reply_text = f"【{search_input}】\n"
            for group_name in matched_groups:
                reply_text += f"【{group_name}】→ {groupMap[group_name]['groupNumber']}\n"
            plugin_event.reply(reply_text.strip())
        else:
            plugin_event.reply(f"未找到匹配【{search_input}】的KP群，请先检查插件是否为最新版，接着使用 .kp list 查看所有群组(超长慎用)，或进2150284119反馈。")
        return
    
    # 精确匹配
    lower_input = search_input.lower()
    for group_name, group_info in groupMap.items():
        # 跳过以#开头的分类标题
        if group_name.startswith("#"):
            continue
            
        if group_name.lower() == lower_input:
            alias_text = ""
            if "aliases" in group_info and group_info["aliases"]:
                alias_text = f" (别名: {'、'.join(group_info['aliases'])})"
            plugin_event.reply(f"精确匹配【{group_name}】{alias_text}\n【{group_name}】→ {group_info['groupNumber']}")
            return
        if "aliases" in group_info:
            for alias in group_info["aliases"]:
                if alias.lower() == lower_input:
                    plugin_event.reply(f"【{group_name}】→ {group_info['groupNumber']}")
                    return
    
    # 模糊匹配
    matched = find_similar_group(search_input)
    if matched:
        reply_text = f"【{search_input}】\n"
        for group in matched[:5]:
            alias_text = ""
            if "aliases" in group['info'] and group['info']["aliases"]:
                alias_text = f" (别名: {'、'.join(group['info']['aliases'])})"
            reply_text += f"【{group['name']}】{alias_text} → {group['info']['groupNumber']}\n"
        plugin_event.reply(reply_text)
    else:
        plugin_event.reply(f"未找到匹配【{search_input}】的KP群，请先检查插件是否为最新版，接着使用 .kp list 查看所有群组(超长慎用)，或进2150284119反馈。")

def find_similar_group(input_str):
    input_str = input_str.lower()
    matched = []
    for name, info in groupMap.items():
        # 跳过以#开头的分类标题
        if name.startswith("#"):
            continue
            
        if input_str in name.lower():
            matched.append({"name": name, "info": info})
        elif "aliases" in info:
            for alias in info["aliases"]:
                if input_str in alias.lower():
                    matched.append({"name": name, "info": info})
                    break
    return matched

ensure_data_directory()
load_local_data()