import os,re,argparse,datetime,html,sys,time,threading
from pathlib import Path

try:
    from watchdog.observers import Observer
    from watchdog.events import FileSystemEventHandler
    WATCHDOG_AVAILABLE = True
except ImportError:
    WATCHDOG_AVAILABLE = False
    # 定义占位符类，避免NameError
    class FileSystemEventHandler:
        pass
    class Observer:
        pass
    print("警告: watchdog 库未安装，无法使用文件监听功能。")
    print("请运行: pip install watchdog")
    print()

def find_files(root_dir, file_types, exclude_patterns):
    """
    递归查找指定类型的文件，并排除特定模式的目录和文件。
    """
    found_files = []
    for dirpath, dirnames, filenames in os.walk(root_dir):
        # 过滤掉需要排除的目录 (处理目录名本身或以目录名开头的模式)
        dirnames_to_keep = []
        for dname in dirnames:
            exclude_this_dir = False
            for pattern in exclude_patterns:
                if '*' in pattern:
                    # 将 glob 模式转换为 regex 模式
                    regex_pattern = pattern.replace('.', r'\.').replace('*', '.*') + r'$'
                    if re.match(regex_pattern, dname):
                        exclude_this_dir = True
                        break
                else: # 精确目录名匹配
                    if dname == pattern:
                        exclude_this_dir = True
                        break
            if not exclude_this_dir:
                dirnames_to_keep.append(dname)
        dirnames[:] = dirnames_to_keep # 更新 dirnames 列表，以便 os.walk 继续遍历

        for filename in filenames:
            # 检查文件类型
            if not any(filename.endswith(f".{ft}") for ft in file_types):
                continue
            
            full_path = os.path.join(dirpath, filename)
            relative_path_from_root = os.path.relpath(full_path, root_dir)

            # 过滤掉需要排除的文件 (处理文件名本身或相对路径的模式)
            exclude_this_file = False
            for pattern in exclude_patterns:
                if '*' in pattern:
                    regex_pattern = pattern.replace('.', r'\.').replace('*', '.*')
                    # 对于通配符模式，检查是否匹配文件名或路径
                    if re.search(regex_pattern, filename) or re.search(regex_pattern, relative_path_from_root):
                        exclude_this_file = True
                        break
                else: # 对于非通配符模式，进行精确匹配
                    if pattern.startswith('./'):
                        # 对于 ./config 这样的模式，只匹配根目录下的目录
                        target_dir = pattern[2:]  # 去掉 ./
                        if relative_path_from_root.startswith(target_dir + '/') or relative_path_from_root == target_dir:
                            exclude_this_file = True
                            break
                    elif pattern in relative_path_from_root or pattern == filename:
                        exclude_this_file = True
                        break
            
            if exclude_this_file:
                continue

            found_files.append(full_path)
    return found_files

def scan_file_for_styles(filepath, grep_pattern_re, exclude_full_pattern_re):
    """
    扫描单个文件，查找匹配正则表达式的样式。
    支持Vue单文件组件的特殊处理，能够解析<template>、<script>和<style>块。
    返回一个列表，其中每个元素是 (行号, 完整代码行内容)。
    """
    matches = []
    try:
        with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()
            lines = content.split('\n')
            
            # 检查是否为Vue文件，如果是则进行特殊处理
            is_vue_file = filepath.endswith('.vue')
            
            if is_vue_file:
                # Vue文件需要解析不同的块，使用计数器处理嵌套
                template_depth = 0
                script_depth = 0
                style_depth = 0
                
                for line_num, line in enumerate(lines, 1):
                    # 检测Vue文件的不同块，使用计数器处理嵌套
                    if '<template' in line:
                        template_depth += 1
                        continue
                    elif '</template>' in line:
                        template_depth = max(0, template_depth - 1)
                        continue
                    elif '<script' in line:
                        script_depth += 1
                        continue
                    elif '</script>' in line:
                        script_depth = max(0, script_depth - 1)
                        continue
                    elif '<style' in line:
                        style_depth += 1
                        continue
                    elif '</style>' in line:
                        style_depth = max(0, style_depth - 1)
                        continue
                    
                    # 在所有块中都进行扫描
                    if template_depth > 0 or script_depth > 0 or style_depth > 0:
                        if scan_line_for_matches(line, line_num, grep_pattern_re, exclude_full_pattern_re, matches):
                            continue
            else:
                # 非Vue文件的常规处理
                for line_num, line in enumerate(lines, 1):
                    scan_line_for_matches(line, line_num, grep_pattern_re, exclude_full_pattern_re, matches)
                    
    except Exception as e:
        print(f"Error reading {filepath}: {e}", file=sys.stderr)
    return matches

def scan_line_for_matches(line, line_num, grep_pattern_re, exclude_full_pattern_re, matches):
    """
    扫描单行内容，查找匹配项并添加到matches列表中。
    返回True如果找到匹配项，False否则。
    """
    line_has_match = False
    for match in grep_pattern_re.finditer(line):
        matched_text = match.group(0).strip()
        
        # 检查是否应该排除此匹配项
        if exclude_full_pattern_re.search(matched_text):
            continue
        
        line_has_match = True
        break  # 只要有一个匹配就足够了
    
    # 如果该行有匹配，添加完整的行内容
    if line_has_match:
        matches.append((line_num, line.strip()))
    
    return line_has_match

def extract_style_value(matched_line, grep_pattern_re):
    """
    从匹配的行中提取完整的样式匹配内容。
    """
    import re
    
    # 使用传入的正则表达式来查找完整的匹配内容
    match_obj = grep_pattern_re.search(matched_line)
    if match_obj:
        return match_obj.group(0)  # 返回完整的匹配内容
    
    return None

class StyleScanEventHandler(FileSystemEventHandler):
    """文件系统事件处理器，用于监听文件变化并触发重新扫描"""
    
    def __init__(self, scan_function, debounce_delay=2.0):
        super().__init__()
        self.scan_function = scan_function
        self.debounce_delay = debounce_delay
        self.last_scan_time = 0
        self.scan_timer = None
        self.lock = threading.Lock()
    
    def should_process_file(self, file_path):
        """检查文件是否应该被处理"""
        # 获取文件扩展名
        file_ext = Path(file_path).suffix.lstrip('.')
        
        # 检查是否为我们关心的文件类型
        target_extensions = ["vue", "js", "ts", "jsx", "tsx", "html", "css", "scss", "less"]
        if file_ext not in target_extensions:
            return False
        
        # 检查是否在排除路径中
        exclude_patterns = [
            "node_modules", "dist", ".codebuddy", ".git", ".cursor", ".idea", "config",
            ".vscode", "pages", ".temp", "linux-panel", "public"
        ]
        
        file_path_str = str(file_path)
        for pattern in exclude_patterns:
            if pattern in file_path_str:
                return False
        
        return True
    
    def debounced_scan(self):
        """防抖扫描函数"""
        with self.lock:
            current_time = time.time()
            if current_time - self.last_scan_time >= self.debounce_delay:
                self.last_scan_time = current_time
                print(f"\n[{datetime.datetime.now().strftime('%H:%M:%S')}] 检测到文件变化，正在重新扫描...")
                self.scan_function()
                print(f"[{datetime.datetime.now().strftime('%H:%M:%S')}] 扫描完成\n")
    
    def schedule_scan(self):
        """调度扫描任务"""
        if self.scan_timer:
            self.scan_timer.cancel()
        
        self.scan_timer = threading.Timer(self.debounce_delay, self.debounced_scan)
        self.scan_timer.start()
    
    def on_modified(self, event):
        if not event.is_directory and self.should_process_file(event.src_path):
            self.schedule_scan()
    
    def on_created(self, event):
        if not event.is_directory and self.should_process_file(event.src_path):
            self.schedule_scan()
    
    def on_deleted(self, event):
        if not event.is_directory and self.should_process_file(event.src_path):
            self.schedule_scan()


def perform_scan(project_root, file_types, exclude_patterns, grep_pattern_re, exclude_full_pattern_re, output_file, html_output_file, html_template_file, generate_html, search_mode=False, search_pattern=None, quiet_mode=False):
    """执行扫描操作的核心函数"""
    all_files = find_files(project_root, file_types, exclude_patterns)
    
    file_match_data = {}  # 键为相对文件路径，值为列表，列表每个元素是 (行号, 匹配内容)
    total_match_count = 0
    
    # 统计数据
    value_count_stats = {}  # 统计每个匹配值的出现次数
    file_count_stats = {}   # 统计每个文件的匹配数量
    
    for filepath in all_files:
        relative_path = os.path.relpath(filepath, project_root)
        matches = scan_file_for_styles(filepath, grep_pattern_re, exclude_full_pattern_re)
        if matches:
            file_match_data[relative_path] = matches
            total_match_count += len(matches)
            file_count_stats[relative_path] = len(matches)
            
            # 统计每个匹配值的出现次数
            for line_num, matched_line in matches:
                # 从匹配的行中提取实际的样式值
                match_obj = grep_pattern_re.search(matched_line)
                if match_obj:
                    # 提取匹配到的具体值（颜色值、尺寸值等）
                    matched_value = extract_style_value(matched_line, grep_pattern_re)
                    if matched_value:
                        value_count_stats[matched_value] = value_count_stats.get(matched_value, 0) + 1
    
    # 生成报告
    if generate_html:
        generate_html_report(html_output_file, project_root, total_match_count, file_match_data, html_template_file, value_count_stats, file_count_stats, search_mode, search_pattern, quiet_mode)
        if not quiet_mode:
            print(f"HTML报告已更新: {html_output_file}")
    else:
        generate_text_report(output_file, project_root, total_match_count, file_match_data, search_mode, search_pattern, quiet_mode)
        if not quiet_mode:
            print(f"文本报告已更新: {output_file}")
    
    if search_mode:
        print(f"发现 {total_match_count} 个匹配项，涉及 {len(file_match_data)} 个文件。")
    else:
        print(f"发现 {total_match_count} 个硬编码参数，涉及 {len(file_match_data)} 个文件。")


def generate_text_report(output_file, project_root, total_match_count, file_match_data, search_mode=False, search_pattern=None, quiet_mode=False):
    """生成文本报告"""
    output_target = sys.stdout  # 默认输出到控制台
    if output_file:
        try:
            output_target = open(output_file, 'w', encoding='utf-8')
        except Exception as e:
            print(f"无法打开输出文件 '{output_file}': {e}", file=sys.stderr)
            return
    
    def print_to_output(msg, file_handle):
        print(msg, file=file_handle)
        if file_handle != sys.stdout and not quiet_mode:  # 如果写入文件且非静默模式，也打印到控制台
            print(msg)
    
    # 根据搜索模式调整报告标题
    if search_mode:
        print_to_output(f"=== 自定义文本搜索报告: {search_pattern} ===", file_handle=output_target)
    else:
        print_to_output("=== 硬编码样式扫描报告 ===", file_handle=output_target)
    
    print_to_output(f"项目路径: {project_root}", file_handle=output_target)
    print_to_output(f"扫描时间: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", file_handle=output_target)
    print_to_output(f"总匹配数: {total_match_count}", file_handle=output_target)
    print_to_output(f"涉及文件数: {len(file_match_data)}", file_handle=output_target)
    print_to_output("", file_handle=output_target)
    print_to_output("=== 详细匹配 (按文件路径) ===", file_handle=output_target)
    
    # 按照文件路径排序输出
    for file_path in sorted(file_match_data.keys()):
        matches_in_file = file_match_data[file_path]
        print_to_output(f"文件: {file_path} ({len(matches_in_file)} 处匹配)", file_handle=output_target)
        for line_num, matched_text in matches_in_file:
            print_to_output(f"  {line_num}: {matched_text}", file_handle=output_target)
        print_to_output("", file_handle=output_target)
    
    print_to_output("--- 扫描完成 ---", file_handle=output_target)
    if total_match_count > 0:
        if search_mode:
            print_to_output(f"发现 {total_match_count} 个匹配项，涉及 {len(file_match_data)} 个文件。请查看 {output_file if output_file else '控制台'}。", file_handle=output_target)
        else:
            print_to_output(f"发现 {total_match_count} 个硬编码参数，涉及 {len(file_match_data)} 个文件。请查看 {output_file if output_file else '控制台'}。", file_handle=output_target)
    else:
        if search_mode:
            print_to_output("未发现匹配项。", file_handle=output_target)
        else:
            print_to_output("未发现硬编码参数。", file_handle=output_target)
    
    if output_target != sys.stdout:
        output_target.close()


def generate_html_report(output_file, project_root, total_match_count, file_match_data, template_path, value_count_stats, file_count_stats, search_mode=False, search_pattern=None, quiet_mode=False):
    """
    生成HTML报告。
    """
    try:
        with open(template_path, 'r', encoding='utf-8') as f:
            template_content = f.read()
    except FileNotFoundError:
        print(f"错误：HTML 模板文件 '{template_path}' 未找到。请确保它位于脚本相同目录下。", file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print(f"读取HTML模板文件 '{template_path}' 时出错: {e}", file=sys.stderr)
        sys.exit(1)

    unique_file_count = len(file_match_data)
    current_date = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    # 构建折叠面板内容
    collapsible_sections_content_list = []
    
    # 按照文件路径排序
    sorted_file_paths = sorted(file_match_data.keys())

    for file_path in sorted_file_paths:
        matches_in_file = file_match_data[file_path]
        file_match_count = len(matches_in_file)

        collapsible_sections_content_list.append(
            f'            <details class="file-details">\n'
            f'                <summary class="file-summary">{html.escape(file_path)} ({file_match_count} 处匹配)</summary>\n'
            f'                <pre class="code-block"><code>\n'
        )
        
        for line_num, matched_text in matches_in_file:
            # 确保代码内容也被转义，并且每行后有换行符
            collapsible_sections_content_list.append(f'{line_num}: {html.escape(matched_text)}\n') 
        
        collapsible_sections_content_list.append(
            f'                </code></pre>\n'
            f'            </details>\n'
        )
    
    collapsible_sections_str = "".join(collapsible_sections_content_list)

    # 生成按匹配值出现次数排序的统计内容
    value_stats_content_list = []
    sorted_values = sorted(value_count_stats.items(), key=lambda x: x[1], reverse=True)
    for value, count in sorted_values:
        value_stats_content_list.append(
            f'            <tr>\n'
            f'                <td class="value-cell">{html.escape(value)}</td>\n'
            f'                <td class="count-cell">{count}</td>\n'
            f'            </tr>\n'
        )
    value_stats_str = "".join(value_stats_content_list)

    # 生成按文件匹配数量排序的统计内容
    file_stats_content_list = []
    sorted_files = sorted(file_count_stats.items(), key=lambda x: x[1], reverse=True)
    for file_path, count in sorted_files:
        file_stats_content_list.append(
            f'            <tr>\n'
            f'                <td class="file-cell">{html.escape(file_path)}</td>\n'
            f'                <td class="count-cell">{count}</td>\n'
            f'            </tr>\n'
        )
    file_stats_str = "".join(file_stats_content_list)

    # 根据搜索类型设置报告标题和描述
    if args.search:
        report_title = "自定义搜索报告"
        report_description = f"搜索模式: {args.search}"
        total_matches_label = "总匹配项数"
    else:
        report_title = "硬编码样式参数扫描报告"
        report_description = "检测代码库中的硬编码样式参数，包括颜色值、字体大小、边框圆角等"
        total_matches_label = "硬编码参数总数"
    
    # 替换占位符
    report_content = template_content.replace('PROJECT_ROOT_PLACEHOLDER', html.escape(project_root))
    report_content = report_content.replace('SCAN_TIME_PLACEHOLDER', current_date)
    report_content = report_content.replace('TOTAL_MATCHES_PLACEHOLDER', str(total_match_count))
    report_content = report_content.replace('UNIQUE_FILES_PLACEHOLDER', str(unique_file_count))
    report_content = report_content.replace('COLLAPSIBLE_SECTIONS_PLACEHOLDER', collapsible_sections_str)
    report_content = report_content.replace('VALUE_STATS_PLACEHOLDER', value_stats_str)
    report_content = report_content.replace('REPORT_TITLE_PLACEHOLDER', html.escape(report_title))
    report_content = report_content.replace('REPORT_DESCRIPTION_PLACEHOLDER', html.escape(report_description))
    report_content = report_content.replace('TOTAL_MATCHES_LABEL_PLACEHOLDER', html.escape(total_matches_label))

    try:
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(report_content)
    except Exception as e:
        print(f"写入HTML报告 '{output_file}' 时出错: {e}", file=sys.stderr)
        sys.exit(1)


def start_file_watcher(project_root, file_types, exclude_patterns, grep_pattern_re, exclude_full_pattern_re, output_file, html_output_file, html_template_file, generate_html, search_mode=False, search_pattern=None, quiet_mode=True):
    """启动文件监听器"""
    if not WATCHDOG_AVAILABLE:
        print("错误: watchdog 库未安装，无法启用文件监听功能。")
        print("请运行: pip install watchdog")
        return
    
    def scan_wrapper():
        """扫描包装函数"""
        perform_scan(
            project_root=project_root,
            file_types=file_types,
            exclude_patterns=exclude_patterns,
            grep_pattern_re=grep_pattern_re,
            exclude_full_pattern_re=exclude_full_pattern_re,
            output_file=output_file,
            html_output_file=html_output_file,
            html_template_file=html_template_file,
            generate_html=generate_html,
            search_mode=search_mode,
            search_pattern=search_pattern,
            quiet_mode=quiet_mode
        )
    
    # 创建事件处理器
    event_handler = StyleScanEventHandler(scan_wrapper, debounce_delay=2.0)
    
    # 创建观察者
    observer = Observer()
    observer.schedule(event_handler, project_root, recursive=True)
    
    print(f"\n=== 文件监听模式已启动 ===")
    print(f"监听目录: {project_root}")
    print(f"输出文件: {output_file if not generate_html else html_output_file}")
    print("按 Ctrl+C 停止监听...\n")
    
    # 启动监听
    observer.start()
    
    try:
        # 首次执行扫描
        print("执行初始扫描...")
        scan_wrapper()
        
        # 保持程序运行
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n正在停止文件监听...")
        observer.stop()
        if event_handler.scan_timer:
            event_handler.scan_timer.cancel()
    
    observer.join()
    print("文件监听已停止。")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="扫描代码库中的硬编码样式参数。")
    parser.add_argument("--html", action="store_true", help="生成HTML格式的汇总报告。")
    parser.add_argument("--search", type=str, help="搜索指定的文本内容（支持正则表达式）。")
    parser.add_argument("--watch", "-w", action="store_true", help="启用文件监听模式，实时更新报告。")
    args = parser.parse_args()

    # --- 配置区 ---
    FILE_TYPES = ["vue", "js", "ts", "jsx", "tsx", "html", "css", "scss", "less"]
    PROJECT_ROOT = os.getcwd()
    EXCLUDE_PATTERNS = [
        "node_modules", "dist", ".codebuddy", ".git", ".cursor", ".idea", "./config",
        ".vscode", "pages", "*.json", ".babelrc", ".eslintrc", ".prettierrc",
        ".stylelintrc", ".browserslistrc", "uno.config.ts", "*.svg", "*.png",
        ".temp", "linux-panel", "public/*", "*.html", "src/styles/*"
    ]
    OUTPUT_FILE = "hardcoded_styles_report.txt"
    HTML_OUTPUT_FILE = "hardcoded_styles_report.html"
    # 确保 HTML 模板文件路径正确，相对于脚本自身目录
    HTML_TEMPLATE_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "report_template_py.html")

    # ===== 重新设计的正则表达式配置区域 =====
    # 根据用户需求，支持UnoCSS两种语法和五种设计属性的精确匹配
    
    # 1. 核心值模式定义
    # 颜色值核心模式 (hex, rgb, rgba, hsl, hsla) - 移除外层括号
    COLOR_VALUE_CORE = r"#[0-9a-fA-F]{3,8}|rgb\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*\)|rgba\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*(?:0?\.\d+|1\.0|[01])\s*\)|hsl\(\s*\d{1,3}\s*,\s*\d{1,3}%\s*,\s*\d{1,3}%\s*\)|hsla\(\s*\d{1,3}\s*,\s*\d{1,3}%\s*,\s*\d{1,3}%\s*,\s*(?:0?\.\d+|1\.0|[01])\s*\)"
    
    # 尺寸值核心模式 (支持更多单位) - 移除外层括号
    DIMENSION_VALUE_CORE = r"\d+(?:\.\d+)?(?:px|rem|em|pt|%|vw|vh|vmin|vmax|ch|ex|fr|cm|mm|in|pc|q)"
    
    # 2. UnoCSS 属性前缀定义 (按五种设计属性分类)
    # a. 字体颜色前缀
    TEXT_COLOR_PREFIX = r"text"
    
    # b. 边框颜色前缀 (包含各种方向)
    BORDER_COLOR_PREFIX = r"border(?:-(?:t|r|b|l|x|y|s|e|top|right|bottom|left))?"
    
    # c. 字体大小前缀
    FONT_SIZE_PREFIX = r"text"
    
    # d. 圆角大小前缀 (包含各种方向)
    BORDER_RADIUS_PREFIX = r"rounded(?:-(?:t|r|b|l|tl|tr|bl|br|top|right|bottom|left))?"
    
    # e. 背景颜色前缀
    BG_COLOR_PREFIX = r"bg"
    
    # 3. UnoCSS 带方括号语法模式
    # a. 字体颜色: text-[#FF0000], text-[rgb(255,0,0)]
    UNO_TEXT_COLOR_BRACKET = rf"({TEXT_COLOR_PREFIX})-\[({COLOR_VALUE_CORE})\]"
    
    # b. 边框颜色: border-[#FF0000], border-t-[rgb(255,0,0)]
    UNO_BORDER_COLOR_BRACKET = rf"({BORDER_COLOR_PREFIX})-\[({COLOR_VALUE_CORE})\]"
    
    # c. 字体大小: text-[12px], text-[1.2rem]
    UNO_FONT_SIZE_BRACKET = rf"({FONT_SIZE_PREFIX})-\[({DIMENSION_VALUE_CORE})\]"
    
    # d. 圆角大小: rounded-[8px], rounded-t-[0.5rem]
    UNO_BORDER_RADIUS_BRACKET = rf"({BORDER_RADIUS_PREFIX})-\[({DIMENSION_VALUE_CORE})\]"
    
    # e. 背景颜色: bg-[#FF0000], bg-[rgba(255,0,0,0.5)]
    UNO_BG_COLOR_BRACKET = rf"({BG_COLOR_PREFIX})-\[({COLOR_VALUE_CORE})\]"
    
    # 4. UnoCSS 不带方括号语法模式
    # a. 字体颜色: text-#FF0000, text-rgb(255,0,0)
    UNO_TEXT_COLOR_NO_BRACKET = rf"({TEXT_COLOR_PREFIX})-({COLOR_VALUE_CORE})"
    
    # b. 边框颜色: border-#FF0000, border-t-rgb(255,0,0)
    UNO_BORDER_COLOR_NO_BRACKET = rf"({BORDER_COLOR_PREFIX})-({COLOR_VALUE_CORE})"
    
    # c. 字体大小: text-12px, text-1.2rem
    UNO_FONT_SIZE_NO_BRACKET = rf"({FONT_SIZE_PREFIX})-({DIMENSION_VALUE_CORE})"
    
    # d. 圆角大小: rounded-8px, rounded-t-0.5rem
    UNO_BORDER_RADIUS_NO_BRACKET = rf"({BORDER_RADIUS_PREFIX})-({DIMENSION_VALUE_CORE})"
    
    # e. 背景颜色: bg-#FF0000, bg-rgba(255,0,0,0.5)
    UNO_BG_COLOR_NO_BRACKET = rf"({BG_COLOR_PREFIX})-({COLOR_VALUE_CORE})"
    
    # 5. 传统CSS样式模式
    # a. 字体颜色: color: #FF0000;
    CSS_TEXT_COLOR = rf"color\s*:\s*({COLOR_VALUE_CORE})"
    
    # b. 边框颜色: border-color: #FF0000; border: 1px solid #FF0000;
    CSS_BORDER_COLOR = rf"border(?:-(?:top|right|bottom|left))?-color\s*:\s*({COLOR_VALUE_CORE})"
    CSS_BORDER_SHORTHAND = rf"border(?:-(?:top|right|bottom|left))?\s*:\s*({DIMENSION_VALUE_CORE})\s+(?:solid|dashed|dotted|double|groove|ridge|inset|outset)\s+({COLOR_VALUE_CORE})"
    
    # c. 字体大小: font-size: 12px;
    CSS_FONT_SIZE = rf"font-size\s*:\s*({DIMENSION_VALUE_CORE})"
    
    # d. 圆角大小: border-radius: 8px; border-top-left-radius: 10px;
    CSS_BORDER_RADIUS = rf"border(?:-(?:top-left|top-right|bottom-left|bottom-right))?-radius\s*:\s*({DIMENSION_VALUE_CORE})"
    
    # e. 背景颜色: background-color: #FF0000; background: #FF0000;
    CSS_BG_COLOR = rf"background(?:-color)?\s*:\s*({COLOR_VALUE_CORE})"
    
    # 6. 内联样式模式 (style属性中的样式)
    INLINE_STYLE_PATTERNS = [
        rf'style\s*=\s*["\'](?:[^"\';]*;\s*)*color\s*:\s*({COLOR_VALUE_CORE})',
        rf'style\s*=\s*["\'](?:[^"\';]*;\s*)*border(?:-(?:top|right|bottom|left))?-color\s*:\s*({COLOR_VALUE_CORE})',
        rf'style\s*=\s*["\'](?:[^"\';]*;\s*)*font-size\s*:\s*({DIMENSION_VALUE_CORE})',
        rf'style\s*=\s*["\'](?:[^"\';]*;\s*)*border(?:-(?:top-left|top-right|bottom-left|bottom-right))?-radius\s*:\s*({DIMENSION_VALUE_CORE})',
        rf'style\s*=\s*["\'](?:[^"\';]*;\s*)*background(?:-color)?\s*:\s*({COLOR_VALUE_CORE})'
    ]
    
    # 7. 组合所有匹配模式
    GREP_PATTERN_STR = "|".join([
        # UnoCSS 带方括号语法
        f"(?:{UNO_TEXT_COLOR_BRACKET})",
        f"(?:{UNO_BORDER_COLOR_BRACKET})",
        f"(?:{UNO_FONT_SIZE_BRACKET})",
        f"(?:{UNO_BORDER_RADIUS_BRACKET})",
        f"(?:{UNO_BG_COLOR_BRACKET})",
        
        # UnoCSS 不带方括号语法
        f"(?:{UNO_TEXT_COLOR_NO_BRACKET})",
        f"(?:{UNO_BORDER_COLOR_NO_BRACKET})",
        f"(?:{UNO_FONT_SIZE_NO_BRACKET})",
        f"(?:{UNO_BORDER_RADIUS_NO_BRACKET})",
        f"(?:{UNO_BG_COLOR_NO_BRACKET})",
        
        # 传统CSS样式
        f"(?:{CSS_TEXT_COLOR})",
        f"(?:{CSS_BORDER_COLOR})",
        f"(?:{CSS_BORDER_SHORTHAND})",
        f"(?:{CSS_FONT_SIZE})",
        f"(?:{CSS_BORDER_RADIUS})",
        f"(?:{CSS_BG_COLOR})"
    ] + [f"(?:{pattern})" for pattern in INLINE_STYLE_PATTERNS])
    
    # 编译主扫描正则表达式
    # 如果用户指定了自定义搜索文本，则使用用户的模式
    if args.search:
        try:
            GREP_PATTERN_RE = re.compile(args.search)
            print(f"使用自定义搜索模式: {args.search}")
        except re.error as e:
            print(f"自定义搜索正则表达式编译错误: {e}", file=sys.stderr)
            print(f"有问题的正则表达式: {args.search}", file=sys.stderr)
            sys.exit(1)
    else:
        try:
            GREP_PATTERN_RE = re.compile(GREP_PATTERN_STR)
        except re.error as e:
            print(f"正则表达式 GREP_PATTERN_STR 编译错误: {e}", file=sys.stderr)
            print(f"有问题的正则表达式: {GREP_PATTERN_STR}", file=sys.stderr)
            sys.exit(1)


    # ===== 排除模式配置 (避免误报) =====
    # 根据用户需求，精确排除预设颜色、语义化Token和变量
    
    # 1. CSS变量和函数排除
    EXCLUDE_CSS_VAR = r"var\(--[a-zA-Z0-9_-]+\)"
    EXCLUDE_CSS_CALC = r"calc\([^)]+\)"
    
    # 2. CSS命名颜色排除 (但不包括具体的颜色代码)
    EXCLUDE_NAMED_COLORS = r"(?:red|blue|green|yellow|purple|pink|indigo|gray|grey|black|white|transparent|currentcolor|inherit|initial|revert|unset|auto|none)\b"
    
    # 3. UnoCSS/Tailwind预设颜色系统排除
    # Tailwind颜色系统: red-50, red-100, ..., red-900, red-950
    EXCLUDE_TAILWIND_COLORS = r"(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950)"
    
    # UnoCSS预设颜色
    EXCLUDE_UNO_PRESET_COLORS = r"(?:primary|secondary|success|warning|danger|info|light|dark)(?:-\d+)?"
    
    # 4. UnoCSS语义化尺寸Token排除
    # 字体大小语义化Token
    EXCLUDE_UNO_FONT_SIZE_TOKENS = r"(?:xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl|8xl|9xl)"
    
    # 圆角语义化Token
    EXCLUDE_UNO_BORDER_RADIUS_TOKENS = r"(?:none|sm|md|lg|xl|2xl|3xl|full)"
    
    # 间距语义化Token (可能用于padding, margin等)
    EXCLUDE_UNO_SPACING_TOKENS = r"(?:0|0\.5|1|1\.5|2|2\.5|3|3\.5|4|5|6|7|8|9|10|11|12|14|16|20|24|28|32|36|40|44|48|52|56|60|64|72|80|96)"
    
    # 5. 组合排除模式
    # a. 字体颜色排除
    EXCLUDE_TEXT_COLOR_PATTERNS = [
        rf"text-(?:{EXCLUDE_TAILWIND_COLORS})",
        rf"text-(?:{EXCLUDE_UNO_PRESET_COLORS})",
        rf"text-(?:{EXCLUDE_NAMED_COLORS})"
    ]
    
    # b. 边框颜色排除
    EXCLUDE_BORDER_COLOR_PATTERNS = [
        rf"border(?:-(?:t|r|b|l|x|y|s|e|top|right|bottom|left))?-(?:{EXCLUDE_TAILWIND_COLORS})",
        rf"border(?:-(?:t|r|b|l|x|y|s|e|top|right|bottom|left))?-(?:{EXCLUDE_UNO_PRESET_COLORS})",
        rf"border(?:-(?:t|r|b|l|x|y|s|e|top|right|bottom|left))?-(?:{EXCLUDE_NAMED_COLORS})"
    ]
    
    # c. 字体大小排除
    EXCLUDE_FONT_SIZE_PATTERNS = [
        rf"text-(?:{EXCLUDE_UNO_FONT_SIZE_TOKENS})"
    ]
    
    # d. 圆角大小排除
    EXCLUDE_BORDER_RADIUS_PATTERNS = [
        rf"rounded(?:-(?:t|r|b|l|tl|tr|bl|br|top|right|bottom|left))?-(?:{EXCLUDE_UNO_BORDER_RADIUS_TOKENS})"
    ]
    
    # e. 背景颜色排除
    EXCLUDE_BG_COLOR_PATTERNS = [
        rf"bg-(?:{EXCLUDE_TAILWIND_COLORS})",
        rf"bg-(?:{EXCLUDE_UNO_PRESET_COLORS})",
        rf"bg-(?:{EXCLUDE_NAMED_COLORS})"
    ]
    
    # f. Vue数据绑定排除 (动态类名和样式)
    EXCLUDE_VUE_BINDING = r":(?:class|style)\s*=\s*[\"'][^\"']*[\"']"
    
    # 6. 组合所有排除模式
    EXCLUDE_FULL_PATTERN_STR = "|".join([
        EXCLUDE_CSS_VAR,
        EXCLUDE_CSS_CALC,
        EXCLUDE_VUE_BINDING
    ] + EXCLUDE_TEXT_COLOR_PATTERNS + 
      EXCLUDE_BORDER_COLOR_PATTERNS + 
      EXCLUDE_FONT_SIZE_PATTERNS + 
      EXCLUDE_BORDER_RADIUS_PATTERNS + 
      EXCLUDE_BG_COLOR_PATTERNS)
    
    # 编译排除正则表达式
    # 如果用户使用自定义搜索，则不使用排除模式
    if args.search:
        # 对于自定义搜索，创建一个永远不匹配的排除模式
        EXCLUDE_FULL_PATTERN_RE = re.compile(r'(?!.*)')
    else:
        try:
            EXCLUDE_FULL_PATTERN_RE = re.compile(EXCLUDE_FULL_PATTERN_STR)
        except re.error as e:
            print(f"正则表达式 EXCLUDE_FULL_PATTERN_STR 编译错误: {e}", file=sys.stderr)
            print(f"有问题的正则表达式: {EXCLUDE_FULL_PATTERN_STR}", file=sys.stderr)
            sys.exit(1)


    # 根据搜索模式调整输出信息和文件名
    if args.search:
        print(f"--- 正在搜索指定文本: {args.search} ---")
        OUTPUT_FILE = "custom_search_report.txt"
        HTML_OUTPUT_FILE = "custom_search_report.html"
    else:
        print("--- 正在搜索硬编码样式参数 ---")
    
    print(f"扫描目录: {PROJECT_ROOT}")
    print(f"扫描文件类型: {', '.join(FILE_TYPES)}")
    print(f"排除模式: {', '.join(EXCLUDE_PATTERNS)}")
    
    # 检查是否启用监听模式
    if args.watch:
        start_file_watcher(
            project_root=PROJECT_ROOT,
            file_types=FILE_TYPES,
            exclude_patterns=EXCLUDE_PATTERNS,
            grep_pattern_re=GREP_PATTERN_RE,
            exclude_full_pattern_re=EXCLUDE_FULL_PATTERN_RE,
            output_file=OUTPUT_FILE,
            html_output_file=HTML_OUTPUT_FILE,
            html_template_file=HTML_TEMPLATE_FILE,
            generate_html=args.html,
            search_mode=bool(args.search),
            search_pattern=args.search,
            quiet_mode=True
        )
    else:
        # 执行一次性扫描
        perform_scan(
            project_root=PROJECT_ROOT,
            file_types=FILE_TYPES,
            exclude_patterns=EXCLUDE_PATTERNS,
            grep_pattern_re=GREP_PATTERN_RE,
            exclude_full_pattern_re=EXCLUDE_FULL_PATTERN_RE,
            output_file=OUTPUT_FILE,
            html_output_file=HTML_OUTPUT_FILE,
            html_template_file=HTML_TEMPLATE_FILE,
            generate_html=args.html,
            search_mode=bool(args.search),
            search_pattern=args.search
        )