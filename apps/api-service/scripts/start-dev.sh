#!/bin/bash

#############################################
# LinglongOS API 服务 - 智能启动脚本
#############################################

# 颜色
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

# 默认端口
DEFAULT_PORT=7001
PORT_RANGE_START=${PORT_RANGE_START:-$DEFAULT_PORT}
PORT_RANGE_END=${PORT_RANGE_END:-$((PORT_RANGE_START + 49))}
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  LinglongOS API 服务启动器${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# 检查 Node.js 进程占用端口
check_port() {
    local port=$1
    if lsof -ti:$port > /dev/null 2>&1; then
        return 0  # 端口被占用
    fi
    return 1  # 端口可用
}

# 获取端口占用信息
get_port_info() {
    local port=$1
    local pid=$(lsof -ti:$port 2>/dev/null | head -1)
    if [ ! -z "$pid" ]; then
        local cmd=$(ps -p $pid -o comm= 2>/dev/null)
        echo "  进程: $cmd (PID: $pid)"
    fi
}

# 寻找可用端口
find_available_port() {
    echo -e "${YELLOW}正在检测端口可用性...${NC}"
    echo -e "检测范围: ${BLUE}$PORT_RANGE_START${NC} - ${BLUE}$PORT_RANGE_END${NC}"
    echo ""

    for port in $(seq $PORT_RANGE_START $PORT_RANGE_END); do
        if ! check_port $port; then
            echo -e "${GREEN}✓ 找到可用端口: $port${NC}"
            echo ""
            return 0
        else
            printf "\r  ${YELLOW}端口 $port 已被占用${NC}"
            get_port_info $port
        fi
    done

    echo ""
    echo -e "${RED}✗ 错误: 无法找到可用端口${NC}"
    echo -e "检测范围: $PORT_RANGE_START - $PORT_RANGE_END"
    echo ""
    echo "解决方案:"
    echo "  1. 关闭占用端口的进程"
    echo "  2. 设置自定义端口范围: PORT_RANGE_START=8000 $0"
    echo "  3. 查看端口占用: lsof -i :$PORT_RANGE_START"
    echo ""

    exit 1
}

# 主函数
main() {
    # 检查项目目录
    if [ ! -f "$PROJECT_DIR/package.json" ]; then
        echo -e "${RED}✗ 错误: 未找到 package.json${NC}"
        exit 1
    fi

    # 检查依赖
    if [ ! -d "$PROJECT_DIR/node_modules" ]; then
        echo -e "${YELLOW}⚠ 依赖未安装，正在安装...${NC}"
        cd "$PROJECT_DIR"
        pnpm install
        if [ $? -ne 0 ]; then
            echo -e "${RED}✗ 依赖安装失败${NC}"
            exit 1
        fi
        echo -e "${GREEN}✓ 依赖安装完成${NC}"
        echo ""
    fi

    # 寻找可用端口
    AVAILABLE_PORT=""
    for port in $(seq $PORT_RANGE_START $PORT_RANGE_END); do
        if ! check_port $port; then
            AVAILABLE_PORT=$port
            break
        fi
    done

    if [ -z "$AVAILABLE_PORT" ]; then
        echo -e "${RED}✗ 错误: 无法找到可用端口${NC}"
        exit 1
    fi

    # 启动服务器
    echo -e "${GREEN}✓ 端口检测完成${NC}"
    echo -e "启动端口: ${BLUE}$AVAILABLE_PORT${NC}"
    echo ""
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}  启动开发服务器${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo ""

    # 设置环境变量
    export PORT=$AVAILABLE_PORT
    export EGG_PORT=$AVAILABLE_PORT

    # 启动服务
    cd "$PROJECT_DIR"
    exec pnpm dev
}

# 运行主函数
main
