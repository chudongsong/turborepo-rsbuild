#!/bin/bash

# LinglongOS API Service 日志自动清理脚本
# 清理超过50MB的日志文件，保持5个备份文件

set -e

# 配置参数
LOG_DIR="${1:-/Users/chudong/Project/turborepo-rsbuild/apps/api-service/logs}"
MAX_SIZE_MB=50
MAX_FILES_PER_TYPE=5
CLEANUP_DATE=$(date '+%Y-%m-%d %H:%M:%S')

echo "========================================"
echo "  LinglongOS API Service - 日志清理"
echo "  时间: $CLEANUP_DATE"
echo "  日志目录: $LOG_DIR"
echo "========================================"

# 检查日志目录是否存在
if [ ! -d "$LOG_DIR" ]; then
    echo "❌ 错误: 日志目录不存在: $LOG_DIR"
    exit 1
fi

# 清理函数
cleanup_log_files() {
    local log_dir="$1"
    local log_pattern="$2"
    local log_name="$3"
    
    echo ""
    echo "🔍 检查 $log_name 日志文件..."
    
    # 查找所有匹配的日志文件，按修改时间排序
    local log_files=($(find "$log_dir" -name "$log_pattern" -type f 2>/dev/null | sort))
    
    if [ ${#log_files[@]} -eq 0 ]; then
        echo "   ✓ 未发现 $log_name 日志文件"
        return
    fi
    
    # 检查每个文件的大小
    local total_size=0
    local file_count=0
    local large_files=()
    
    for file in "${log_files[@]}"; do
        if [ -f "$file" ]; then
            local size=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null || echo 0)
            local size_mb=$((size / 1024 / 1024))
            total_size=$((total_size + size))
            file_count=$((file_count + 1))
            
            if [ $size_mb -gt $MAX_SIZE_MB ]; then
                large_files+=("$file ($size_mb MB)")
            fi
            
            echo "   📄 $(basename "$file"): ${size_mb}MB"
        fi
    done
    
    # 清理超过限制的文件
    if [ ${#large_files[@]} -gt 0 ]; then
        echo "   ⚠️  发现 ${#large_files[@]} 个超过 ${MAX_SIZE_MB}MB 的文件:"
        for large_file in "${large_files[@]}"; do
            echo "      - $large_file"
            rm -f "$large_file"
        done
        echo "   ✅ 已清理超大日志文件"
    else
        echo "   ✅ 所有 $log_name 文件大小正常"
    fi
    
    # 清理超过备份数量限制的文件
    if [ $file_count -gt $MAX_FILES_PER_TYPE ]; then
        echo "   📊 文件数量: $file_count (超过限制 $MAX_FILES_PER_TYPE)"
        
        # 保留最新的5个文件，删除旧的
        local files_to_delete=("${log_files[@]:$MAX_FILES_PER_TYPE}")
        if [ ${#files_to_delete[@]} -gt 0 ]; then
            echo "   🗑️  删除旧的备份文件:"
            for file in "${files_to_delete[@]}"; do
                echo "      - $(basename "$file")"
                rm -f "$file"
            done
            echo "   ✅ 已清理旧备份文件"
        fi
    fi
    
    local total_size_mb=$((total_size / 1024 / 1024))
    echo "   📈 $log_name 总大小: ${total_size_mb}MB (${file_count}个文件)"
}

# 开始清理
echo "🚀 开始清理日志文件..."

# 清理常见的日志文件类型
cleanup_log_files "$LOG_DIR" "*.log" "通用日志"
cleanup_log_files "$LOG_DIR" "*-web.log" "Web日志"
cleanup_log_files "$LOG_DIR" "*-agent.log" "Agent日志"
cleanup_log_files "$LOG_DIR" "*-error.log" "错误日志"
cleanup_log_files "$LOG_DIR" "*-schedule.log" "调度日志"

# 计算清理效果
echo ""
echo "📊 清理后的目录大小:"
du -h "$LOG_DIR" 2>/dev/null | tail -1

echo ""
echo "========================================"
echo "✅ 日志清理完成!"
echo "   - 最大文件大小: ${MAX_SIZE_MB}MB"
echo "   - 最大备份文件数: ${MAX_FILES_PER_TYPE}个"
echo "   - 清理时间: $CLEANUP_DATE"
echo "========================================"

# 输出建议
echo ""
echo "💡 建议配置:"
echo "   1. 将此脚本设置为定期执行: crontab -e"
echo "   2. 建议执行频率: 每天凌晨2点执行"
echo "   3. 定时任务示例: 0 2 * * * /path/to/cleanup-logs.sh"
echo ""