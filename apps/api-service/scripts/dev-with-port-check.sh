#!/bin/bash

#############################################
# LinglongOS API 服务智能启动脚本
#
# 功能：
# 1. 自动检测端口占用情况
# 2. 端口冲突时自动切换到可用端口
# 3. 启动开发服务器
# 4. 提供友好的错误提示和解决建议
#############################################

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 默认配置
DEFAULT_PORT=7001
MAX_PORT_ATTEMPTS=50
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

#############################################
# 打印标题
#############################################
print_header() {
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}  LinglongOS API 服务 - 智能启动器${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo ""
}

#############################################
# 打印成功消息
#############################################
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

#############################################
# 打印警告消息
#############################################
print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

#############################################
# 打印错误消息
#############################################
print_error() {
    echo -e "${RED}✗ $1${NC}"
}

#############################################
# 检测端口是否被占用
#############################################
is_port_in_use() {
    local port=$1
    local host=${2:-127.0.0.1}

    # 使用 netstat 或 lsof 检测端口
    if command -v lsof > /dev/null 2>&1; then
        lsof -i :$port > /dev/null 2>&1
        return $?
    elif command -v netstat > /dev/null 2>&1; then
        netstat -ln 2>/dev/null | grep -q ":$port "
        return $?
    else
        # 备选方案：尝试连接
        (echo > /dev/tcp/$host/$port) > /dev/null 2>&1
        return $?
    fi
}

#############################################
# 获取端口占用进程信息
#############################################
get_port_info() {
    local port=$1

    if command -v lsof > /dev/null 2>&1; then
        local info=$(lsof -ti :$port 2>/dev/null | head -1)
        if [ ! -z "$info" ]; then
            local pid=$info
            local cmd=$(ps -p $pid -o comm= 2>/dev/null)
            echo "端口 $port 被进程占用 (PID: $pid, 命令: $cmd)"
            return 0
        fi
    fi

    echo "端口 $port 被占用"
    return 0
}

#############################################
# 寻找可用端口
#############################################
find_available_port() {
    local start_port=${1:-$DEFAULT_PORT}
    local max_attempts=${2:-$MAX_PORT_ATTEMPTS}

    echo -e "${YELLOW}正在检测端口可用性...${NC}"
    echo -e "起始端口: ${BLUE}$start_port${NC}"
    echo -e "最大尝试次数: ${BLUE}$max_attempts${NC}"
    echo ""

    for ((i = 0; i < max_attempts; i++)); do
        local port=$((start_port + i))

        if ! is_port_in_use $port; then
            echo -e "\r${GREEN}✓ 找到可用端口: $port${NC}"
            echo ""
            return 0
        else
            printf "\r${YELLOW}检测端口: $port (已被占用)${NC}"
            get_port_info $port >&2
        fi
    done

    echo ""
    print_error "无法找到可用端口 (尝试范围: $start_port - $((start_port + max_attempts - 1)))"
    return 1
}

#############################################
# 启动开发服务器
#############################################
start_dev_server() {
    local port=$1

    echo ""
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}  启动开发服务器${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo -e "端口: ${GREEN}$port${NC}"
    echo -e "进程: ${BLUE}egg-bin dev${NC}"
    echo ""

    # 设置环境变量
    export PORT=$port
    export EGG_PORT=$port

    cd "$PROJECT_ROOT"

    # 启动服务
    exec pnpm dev
}

#############################################
# 显示使用帮助
#############################################
show_help() {
    cat << EOF
用法: $0 [选项] [端口]

选项:
  -h, --help      显示此帮助信息
  -p, --port PORT 指定起始端口号 (默认: $DEFAULT_PORT)
  -m, --max NUM   最大端口尝试次数 (默认: $MAX_PORT_ATTEMPTS)

示例:
  $0              # 使用默认端口 7001
  $0 8080         # 使用端口 8080 作为起始端口
  $0 -p 9000      # 使用端口 9000 作为起始端口
  $0 -m 100       # 最多尝试 100 个端口

端口检测范围:
  默认检测范围: 7001 - 7050
  可通过 -p 和 -m 参数自定义

EOF
}

#############################################
# 主函数
#############################################
main() {
    # 解析参数
    local start_port=$DEFAULT_PORT
    local max_attempts=$MAX_PORT_ATTEMPTS

    while [[ $# -gt 0 ]]; do
        case $1 in
            -h|--help)
                show_help
                exit 0
                ;;
            -p|--port)
                start_port="$2"
                shift 2
                ;;
            -m|--max)
                max_attempts="$2"
                shift 2
                ;;
            *)
                if [[ $1 =~ ^[0-9]+$ ]]; then
                    start_port=$1
                fi
                shift
                ;;
        esac
    done

    # 打印标题
    print_header

    # 检查项目依赖
    if [ ! -f "$PROJECT_ROOT/package.json" ]; then
        print_error "未找到 package.json 文件"
        print_error "请确保在正确的项目目录中运行此脚本"
        exit 1
    fi

    # 检查 node_modules
    if [ ! -d "$PROJECT_ROOT/node_modules" ]; then
        print_warning "未找到 node_modules，正在安装依赖..."
        cd "$PROJECT_ROOT"
        pnpm install
        if [ $? -ne 0 ]; then
            print_error "依赖安装失败"
            exit 1
        fi
        print_success "依赖安装完成"
    fi

    # 寻找可用端口
    if find_available_port $start_port $max_attempts; then
        local available_port=$?

        if [ $available_port -eq 0 ]; then
            # 重新获取端口号（这是上一个命令的输出）
            available_port=$(find_available_port $start_port $max_attempts 2>/dev/null | grep -oP '可用端口: \K\d+' || echo $start_port)
        fi

        # 从脚本中获取端口号
        available_port=$(find_available_port $start_port $max_attempts 2>&1 | tail -1 | grep -oP '\d+$' || echo $start_port)

        # 如果上面的方法失败，使用默认值
        if [ -z "$available_port" ] || [ "$available_port" = "0" ]; then
            available_port=$start_port
        fi

        start_dev_server $available_port
    else
        echo ""
        print_error "无法启动服务，端口检测失败"
        echo ""
        echo "可能的解决方案:"
        echo "  1. 关闭占用端口的进程"
        echo "  2. 使用其他端口范围:"
        echo "     $0 -p 8000"
        echo "  3. 查看端口占用情况:"
        echo "     lsof -i :$start_port"
        echo "     netstat -tulpn | grep :$start_port"
        echo ""
        exit 1
    fi
}

# 运行主函数
main "$@"
