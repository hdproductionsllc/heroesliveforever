# Heroes Live Forever — Deployment Guide

## Current Stack Requirements

This app needs a host that supports all of:

- **Express.js** server (Node.js)
- **Sharp** v0.33 — native C++ image processing (resize, crop analysis, metadata)
- **Puppeteer** v23 — headless Chromium for PDF generation (needs ~1-2GB RAM)
- **Persistent disk** — uploads/ and output/ directories must survive redeploys
- **Outbound HTTPS** — Wikipedia API proxy calls

Traffic is low: 1-5 concurrent users. This is an internal production tool, not a SaaS product.

---

## Recommendation: Railway

**~$5-10/month. Zero code changes. Git push deploy.**

| Factor | Details |
|---|---|
| Sharp | Works out of the box (Linux containers, auto-installs correct binary) |
| Puppeteer | Officially supported with a one-click template |
| Persistent disk | Railway Volumes — mount to /app/uploads, up to 5GB on Hobby plan |
| Deploy | Connect GitHub repo, auto-detects Node.js, builds and deploys |
| SSL / Domain | Automatic HTTPS, custom domains supported |
| Pricing | Hobby plan $5/month base (includes $5 compute credit) |

### Setup Steps

1. Push repo to GitHub
2. Sign up at [railway.com](https://railway.com), connect GitHub
3. Create new project from the repo
4. Add a Volume mounted at `/app/uploads`
5. Add another Volume mounted at `/app/output`
6. Set environment variable `PORT=3001` (or let Railway assign)
7. Ensure Puppeteer launch args include `--no-sandbox` and `--disable-dev-shm-usage`
8. Deploy

---

## Runner-Up: Coolify on Hetzner VPS

**~$4/month. More control, more storage. Slightly more initial setup.**

Good "phase 2" option if Railway ever feels limiting or you want to run multiple apps on one box.

- Hetzner CX22: ~$4/month for 2 vCPU, 4GB RAM, 40GB SSD
- Coolify is free, open-source, self-hosted PaaS
- Git push deploy via GitHub webhooks, web dashboard, automatic SSL
- Full native filesystem — uploads/ just works, no volumes to configure
- You own the server (OS updates and backups are on you)

### Setup Steps

1. Create a Hetzner Cloud account, spin up a CX22 server (Ubuntu)
2. SSH in, install Coolify (one-line installer)
3. Open Coolify dashboard, connect GitHub
4. Create new service from repo
5. Configure persistent storage paths
6. Deploy

---

## Platforms Evaluated and Rejected

| Platform | Monthly Cost | Why Not |
|---|---|---|
| **Vercel** | $0-20 | No persistent disk, no Puppeteer support. Would require full rearchitect — replace Sharp with client-side Canvas, Puppeteer with cloud PDF API, disk uploads with S3. 2-4 days of rewriting, worse output quality. |
| **Render** | ~$25 | Works perfectly but expensive. Puppeteer needs the $25/month Standard plan (2GB RAM minimum). The $7 Starter plan doesn't have enough memory. |
| **Fly.io** | $8-13 | Good value but CLI-driven, requires writing a Dockerfile. Too much DevOps overhead for this use case. |
| **DO App Platform** | $5-12 | **No persistent filesystem.** Uploads/ directory gets wiped on every deploy. Would need to rearchitect to use S3-compatible storage. |
| **Bare VPS** | $4-14 | Best value and most capable, but you're the sysadmin — Node.js, PM2, Nginx, Let's Encrypt, deploy scripts, security patches all manual. Use Coolify instead. |

---

## Why Not Rearchitect for Serverless

Rearchitecting to fit Vercel/serverless would require:

1. Replace Puppeteer with a cloud PDF API (~$50/month) or client-side jsPDF (lower quality)
2. Replace Sharp with client-side Canvas API (loses server-side crop analysis)
3. Replace Multer disk storage with cloud object storage (S3/R2/Vercel Blob)
4. Rewrite Express routes as serverless functions

**Verdict:** 2-4 days of work, new cloud service accounts and API keys, and measurably worse print output quality. Not worth it for a tool whose entire purpose is high-quality production.

---

*Last updated: 2026-02-18*
