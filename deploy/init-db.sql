-- XSS Platform — 数据库初始化脚本
-- 在 MySQL 中以 root 身份执行

-- 1. 创建数据库
CREATE DATABASE IF NOT EXISTS xss_platform
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

-- 2. 创建专用用户（替换 <db-password> 为强密码）
CREATE USER IF NOT EXISTS 'xss_user'@'127.0.0.1' IDENTIFIED BY '<db-password>';

-- 3. 授权
GRANT ALL PRIVILEGES ON xss_platform.* TO 'xss_user'@'127.0.0.1';
FLUSH PRIVILEGES;

-- 4. 切换到 xss_platform 数据库（表结构由 Drizzle 迁移自动创建，无需手动建表）
USE xss_platform;
