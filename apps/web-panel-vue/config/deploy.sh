#!/bin/bash

# 切换到指定目录
cd /www/server/panel/BTPanel

# 删除 static 目录
rm -rf static

# 解压 dist.zip 文件
unzip -o dist.zip

# 删除 dist.zip 文件
rm -r dist.zip

# 执行 bt 1 命令
bt 1