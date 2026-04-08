# XSS Platform — Ubuntu 22.04 自部署指南

> 预计完成时间：15–20 分钟

---

## 环境要求

| 组件 | 版本要求 |
|------|---------|
| Ubuntu | 22.04 LTS |
| Node.js | 18+ |
| pnpm | 8+ |
| MySQL | 8.0+ |
| Nginx | 1.18+ |
| PM2 | 最新版 |

---

## 第一步：安装基础环境

```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装 Node.js 20（使用 NodeSource 源）
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# 安装 pnpm
sudo npm install -g pnpm

# 安装 PM2
sudo npm install -g pm2

# 安装 Nginx
sudo apt install -y nginx

# 安装 MySQL 8.0
sudo apt install -y mysql-server
sudo systemctl start mysql
sudo systemctl enable mysql
```

---

## 第二步：初始化数据库

```bash
# 进入 MySQL（首次安装无密码，直接回车）
sudo mysql -u root

# 在 MySQL 中执行（替换 <db-password> 为强密码，记住它！）
CREATE DATABASE IF NOT EXISTS xss_platform CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'xss_user'@'127.0.0.1' IDENTIFIED BY '<db-password>';
GRANT ALL PRIVILEGES ON xss_platform.* TO 'xss_user'@'127.0.0.1';
FLUSH PRIVILEGES;
EXIT;
```

---

## 第三步：获取源码

**方式 A：上传 ZIP 包**

将本地打包好的 `xss-platform.zip` 上传到服务器：

```bash
# 在本地执行（替换 your-server-ip）
scp xss-platform.zip root@your-server-ip:/opt/

# 在服务器上解压
sudo apt install -y unzip
cd /opt
sudo unzip xss-platform.zip -d xss-platform
sudo chown -R $USER:$USER /opt/xss-platform
cd /opt/xss-platform
```

**方式 B：从 GitHub 克隆**

```bash
cd /opt
git clone https://github.com/你的用户名/xss-platform.git
cd xss-platform
```

---

## 第四步：配置环境变量

```bash
cd /opt/xss-platform

# 复制模板
cp .env.production.example .env.production

# 编辑配置（用 nano 或 vim）
nano .env.production
```

将以下内容填写完整：

```env
# 数据库（替换 <db-password> 为第二步设置的密码）
DATABASE_URL=mysql://xss_user:<db-password>@127.0.0.1:3306/xss_platform

# JWT 密钥（随机生成一个长字符串）
JWT_SECRET=在这里填写一个随机长字符串至少64位

# 你的域名（必须填写，影响 XSS Payload 回调地址）
SERVER_URL=https://xss.hackerchen.com

# 初始化密钥（首次访问 /setup 时使用）
ADMIN_SETUP_KEY=<random-setup-key>

# 端口
PORT=3000
```

> **生成随机 JWT_SECRET 的命令：**
> ```bash
> openssl rand -base64 64
> ```

---

## 第五步：安装依赖 & 构建

```bash
cd /opt/xss-platform

# 安装依赖
pnpm install --frozen-lockfile

# 构建前端 + 后端
pnpm build

# 执行数据库迁移（自动创建所有表）
export $(grep -v '^#' .env.production | xargs)
pnpm drizzle-kit migrate

# 创建日志目录
mkdir -p logs
```

---

## 第六步：启动服务（PM2）

```bash
cd /opt/xss-platform

# 首次启动
pm2 start ecosystem.config.cjs

# 设置开机自启
pm2 startup
# 执行上面命令输出的那行 sudo ... 命令

pm2 save

# 查看运行状态
pm2 status

# 查看实时日志
pm2 logs xss-platform
```

---

## 第七步：配置 Nginx 反向代理

```bash
# 复制配置文件
sudo cp /opt/xss-platform/deploy/nginx.conf /etc/nginx/sites-available/xss-platform

# 编辑配置，将域名替换为你的实际域名
sudo nano /etc/nginx/sites-available/xss-platform

# 启用站点
sudo ln -s /etc/nginx/sites-available/xss-platform /etc/nginx/sites-enabled/

# 删除默认站点（可选）
sudo rm -f /etc/nginx/sites-enabled/default

# 测试配置
sudo nginx -t

# 重载 Nginx
sudo systemctl reload nginx
```

---

## 第八步：申请 SSL 证书（HTTPS）

```bash
# 安装 certbot
sudo apt install -y certbot python3-certbot-nginx

# 申请证书（替换为你的域名和邮箱）
sudo certbot --nginx -d xss.hackerchen.com --email your@email.com --agree-tos --non-interactive

# certbot 会自动修改 nginx 配置并启用 HTTPS
# 证书自动续期（certbot 已自动配置 cron）
sudo systemctl status certbot.timer
```

---

## 第九步：初始化管理员账号

打开浏览器访问：`https://xss.hackerchen.com/setup`

填写：
- **用户名**：自定义（如 `admin`）
- **密码**：至少 8 位强密码
- **Setup Key**：即 `.env.production` 中的 `ADMIN_SETUP_KEY` 值

完成后该接口自动关闭，无法重复注册。

---

## 后续更新部署

```bash
cd /opt/xss-platform

# 拉取最新代码（如使用 GitHub）
git pull

# 或重新上传 ZIP 并解压

# 一键重新构建并重启
bash deploy/deploy.sh
```

---

## 常用运维命令

```bash
# 查看应用状态
pm2 status

# 查看实时日志
pm2 logs xss-platform

# 重启应用
pm2 restart xss-platform

# 停止应用
pm2 stop xss-platform

# 查看 Nginx 错误日志
sudo tail -f /var/log/nginx/error.log

# 查看应用日志
tail -f /opt/xss-platform/logs/error.log
```

---

## 防火墙配置

```bash
# 开放 HTTP/HTTPS 端口
sudo ufw allow 'Nginx Full'
sudo ufw allow ssh
sudo ufw enable
sudo ufw status
```

---

## 注意事项

1. **SERVER_URL 必须填写正确**：这是 XSS Payload 中的回调地址，填错会导致数据无法上报。
2. **数据库备份**：建议定期备份 MySQL 数据：
   ```bash
   mysqldump -u xss_user -p xss_platform > backup_$(date +%Y%m%d).sql
   ```
3. **端口 3000 无需对外开放**：Nginx 已做反代，3000 端口仅供本机访问。
