#!/bin/bash
# XSS Platform — 一键部署/更新脚本
# 用法：bash deploy.sh
# 首次部署前请确保已完成 README 中的"环境安装"步骤

set -e

APP_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$APP_DIR"

echo "===== [1/5] 安装依赖 ====="
pnpm install --frozen-lockfile

echo "===== [2/5] 构建项目 ====="
pnpm build

echo "===== [3/5] 执行数据库迁移 ====="
# 加载 .env.production 中的 DATABASE_URL
export $(grep -v '^#' .env.production | xargs)
pnpm drizzle-kit migrate

echo "===== [4/5] 创建日志目录 ====="
mkdir -p logs

echo "===== [5/5] 重启 PM2 服务 ====="
if pm2 list | grep -q "xss-platform"; then
    pm2 reload ecosystem.config.cjs --update-env
else
    pm2 start ecosystem.config.cjs
fi

pm2 save

echo ""
echo "✅ 部署完成！"
echo "   访问 http://你的域名/setup 初始化管理员账号"
echo "   查看日志：pm2 logs xss-platform"
