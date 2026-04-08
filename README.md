# XSS Platform

XSS Platform is a self-hosted blind XSS receiver for CTF practice and authorized security research.

It provides unique collection endpoints, ready-to-copy payload templates, an admin dashboard for captured hits, and a small toolkit for encoding, payload reference, and CSP checks.

## Features

- Admin setup flow protected by a one-time `ADMIN_SETUP_KEY`
- Password login with bcrypt hashing and simple brute-force lockout
- Unique receiver tokens exposed as `/x/{token}`
- JavaScript probe that records URL, referrer, user agent, cookies, DOM snapshot, localStorage, sessionStorage, browser time, iframe status, and source IP
- Dashboard for token management, hit review, read status, and deletion
- XSS payload generator and utility pages for security testing workflows
- MySQL schema managed with Drizzle migrations

## Safety Notice

Only deploy and use this project on systems you own or are explicitly authorized to test. The receiver can collect sensitive browser data by design. Keep your instance private, protect admin credentials, and delete captured data when it is no longer needed.

## Tech Stack

- React 19 + Vite
- Express + tRPC
- Drizzle ORM + MySQL
- bcrypt + JWT cookie sessions
- pnpm, TypeScript, Vitest, PM2 deployment

## Quick Start

```bash
pnpm install --frozen-lockfile
cp .env.production.example .env.production
pnpm build
pnpm test
```

Edit `.env.production` before deploying:

```env
DATABASE_URL=mysql://xss_user:<db-password>@127.0.0.1:3306/xss_platform
JWT_SECRET=output-of-openssl-rand-base64-64
SERVER_URL=https://xss.example.com
ADMIN_SETUP_KEY=<random-setup-key>
PORT=3000
```

Run database migrations after configuring `DATABASE_URL`:

```bash
export $(grep -v '^#' .env.production | xargs)
pnpm drizzle-kit migrate
```

Start production:

```bash
pnpm build
pm2 start ecosystem.config.cjs
```

Then open `/setup` and initialize the admin account with `ADMIN_SETUP_KEY`.

## Deployment

See [deploy/DEPLOY.md](deploy/DEPLOY.md) for the full Ubuntu, MySQL, Nginx, HTTPS, and PM2 deployment guide.

## Development

```bash
pnpm dev
pnpm check
pnpm test
pnpm build
```

## License

MIT
