# Spandana Care Aid Foundation — Deployment Guide

## QUICK START (3 options — pick one)

---

## Option A: VPS / Ubuntu Server (Recommended)

### Requirements
- Ubuntu 20.04+ / Debian 11+
- Node.js 18+
- Nginx
- PM2 (process manager)

### Step 1 — Upload project
```bash
# Upload the zip to your server
scp spandana-mern.zip user@your-server-ip:/var/www/

# On server: unzip
cd /var/www
unzip spandana-mern.zip
mv spandana-mern spandana
cd spandana
```

### Step 2 — Configure environment
```bash
cp backend/.env.example backend/.env
nano backend/.env
```

Set these minimum values:
```
PORT=5000
NODE_ENV=production
ADMIN_PASSWORD=YourSecureAdminPassword
SESSION_SECRET=your-64-char-random-secret-here
DATA_DIR=/var/www/spandana/backend/data
CORS_ORIGINS=https://yourdomain.com

# Optional — enables email notifications
GMAIL_USER=your@gmail.com
GMAIL_APP_PASSWORD=your-app-password

# Optional — enables MongoDB (otherwise uses JSON files)
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/spandana
```

### Step 3 — Run deploy script
```bash
chmod +x deploy.sh
./deploy.sh
```

### Step 4 — Configure Nginx
```bash
# Install nginx if needed
sudo apt install nginx -y

# Copy config
sudo cp nginx/spandana.conf /etc/nginx/sites-available/spandana

# Edit your domain name in the config
sudo nano /etc/nginx/sites-available/spandana
# Change: server_name spandana.org www.spandana.org;
# To:     server_name yourdomain.com www.yourdomain.com;

# Also update root path if different:
# root /var/www/spandana/frontend/dist;

# Enable site
sudo ln -s /etc/nginx/sites-available/spandana /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Step 5 — SSL Certificate (Free — Let's Encrypt)
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

### Step 6 — PM2 auto-start on reboot
```bash
pm2 startup
# Run the command it gives you (starts with "sudo env PATH=...")
pm2 save
```

---

## Option B: cPanel / Hostinger Shared Hosting (hPanel)

### Limitations on shared hosting
- Cannot run Node.js backend directly unless your plan includes "Setup Node.js App" (Hostinger Business/Cloud plans have this; entry-level shared plans do not — check hPanel → Advanced → Setup Node.js App)
- Frontend is served as static files; backend runs as a separate Node.js process

### Step 1 — Build frontend locally first
```bash
cd frontend
npm install
VITE_API_URL=/api npm run build
```
`VITE_API_URL=/api` (not `/api/v1`) matches the routes this frontend actually calls — see the note under "Environment Variables Reference" below.

### Step 2 — Upload
```
Upload frontend/dist/*  → public_html/
Upload backend/         → a non-public folder, e.g. /home/USERNAME/spandana-api/
```
(In hPanel File Manager: create the `spandana-api` folder outside `public_html`, then upload/extract the backend folder there.)

### Step 3 — Node.js app in hPanel
1. hPanel → Advanced → **Setup Node.js App** → Create Application
   - Node.js version: 18 or newer
   - Application mode: Production
   - Application root: `spandana-api` (the folder from Step 2)
   - Application startup file: `server.js`
   - Application URL: your domain, or a subdomain/subfolder used only for the API
2. In the same screen, add the environment variables listed below under
   "Environment Variables Reference" (at minimum `ADMIN_PASSWORD` and `SESSION_SECRET`).
3. Click **Run NPM Install**.
4. Click **Start App** (or Restart if already running). Hostinger keeps it running for you — no PM2 needed on shared hosting.

### Step 4 — API routing
The frontend calls the API at `/api/...` on the same domain, so requests need to be
proxied from `public_html` to the Node.js app. Add this to `public_html/.htaccess`
(replace `5000` with the port hPanel assigned to your Node.js app, shown on the
Setup Node.js App screen):
```apache
RewriteEngine On
RewriteCond %{REQUEST_URI} ^/api/
RewriteRule ^api/(.*)$ http://127.0.0.1:5000/api/$1 [P,L]

# React SPA — everything else falls back to index.html
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^ index.html [L]
```
If your hosting doesn't allow `mod_proxy` (`[P]` flag), use a subdomain
(e.g. `api.yourdomain.com`) pointed at the Node.js app instead, and set
`VITE_API_URL=https://api.yourdomain.com/api` when building the frontend in Step 1.

---

## Option C: Docker (Easiest for full-stack)

### Requirements
- Docker + Docker Compose installed

### Deploy
```bash
# Set your API URL
export VITE_API_URL=https://yourdomain.com/api/v1

# Start everything (builds frontend, starts backend + nginx)
docker-compose up -d

# Check logs
docker-compose logs -f spandana
```

### Stop
```bash
docker-compose down
```

### Update
```bash
git pull  # or re-upload files
docker-compose up -d --build
```

---

## Option D: Hostinger — GitHub Auto-Deploy (push-to-deploy, no zip uploads)

**Requires** Hostinger Business Web Hosting or a Cloud plan (Cloud Startup/Professional/Enterprise) — Node.js Web Apps hosting is not available on entry-level shared plans.

This repo is set up to deploy as **one single Node.js app**: `npm run build` builds
the React frontend and installs backend dependencies, and `backend/server.js` now
serves the built frontend (`frontend/dist`) itself alongside the API — so there's
nothing to split across two hostings or configure with nginx.

### Step 1 — Push this repo to GitHub
```bash
git init   # if not already a repo
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/<you>/<repo>.git
git push -u origin main
```
Do **not** commit `backend/.env` (it should already be in `.gitignore`) — you'll set
environment variables in hPanel instead, in Step 4.

### Step 2 — Add the website in hPanel
1. hPanel → **Websites** → **Add Website**
2. Choose **Node.js Apps** → **Import Git Repository**
3. Click **Continue with GitHub**, authorize Hostinger, and pick this repository

### Step 3 — Build settings
Hostinger will try to auto-detect the framework. Since this is a monorepo (frontend
+ backend in one repo), it will likely be detected as **"Other"** — set these manually:
| Field | Value |
|---|---|
| Install command | `npm run install:all` |
| Build command | `npm run build` |
| Output directory | *(leave blank — this isn't a static-only app)* |
| Entry file | `index.js` |

If the build-settings screen offers a **Root directory** field, leave it blank/`.`
(repo root) — the root `package.json`'s `build`/`start` scripts already know how to
reach into `frontend/` and `backend/`.

### Step 4 — Environment variables
In the same setup screen (or afterwards under the app's **Environment Variables**
tab), add at minimum:
```
ADMIN_PASSWORD=YourSecureAdminPassword
SESSION_SECRET=your-64-char-random-secret
NODE_ENV=production
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/spandana   # optional — omit to use JSON file storage
CORS_ORIGINS=https://yourdomain.com
```
(`PORT` is set automatically by Hostinger — don't override it.)

### Step 5 — Deploy
Click **Deploy**. Hostinger builds and starts the app, then gives you a live preview.

### Step 6 — Auto-deploy on every push
No extra setup needed — once connected via GitHub, Hostinger **automatically
rebuilds and redeploys** the app on every push to the selected branch. Just:
```bash
git add .
git commit -m "some change"
git push
```
...and the live site updates on its own. You can watch build/deploy status and logs
under the app's **Deployments** tab in hPanel.

### Database
For MongoDB, either use MongoDB Atlas (set `MONGO_URI` as above — see the
Atlas setup section below) or use hPanel's built-in **Database Connect Wizard**
under the Node.js app dashboard, which supports MongoDB Atlas and Supabase and
wires up the environment variable for you automatically.

---

## Environment Variables Reference

These are the **actual** variable names read by `backend/config/env.js` — use these
exact names (older drafts of this doc used different names like `JWT_SECRET` /
`MONGODB_URI` / `CORS_ORIGIN`, which the server does **not** read).

### Required (backend/.env) — server refuses to start without these
| Variable | Description |
|---|---|
| `ADMIN_PASSWORD` | Admin panel login password |
| `SESSION_SECRET` | Random 64-char string — never share this |

### Optional
| Variable | Enables | Default |
|---|---|---|
| `PORT` | Backend port | `3000` |
| `NODE_ENV` | Set to `production` on a live server | `development` |
| `MONGO_URI` | MongoDB Atlas connection string (without this, uses JSON file storage in `backend/data/`) | — |
| `CORS_ORIGINS` | Comma-separated list of allowed frontend origins | `http://localhost:5173` |
| `DATA_DIR` | Full path to the JSON data folder | `backend/data` |
| `UPLOADS_DIR` | Full path to the uploads folder | `backend/uploads` |
| `GMAIL_USER` | Gmail address used to send emails | — |
| `GMAIL_APP_PASSWORD` | Gmail app password (not your account password) | — |
| `CONTACT_EMAIL` | Where contact-form alerts are sent | — |
| `RAZORPAY_KEY_ID` / `RAZORPAY_SECRET` | Shop checkout payments | — |
| `GOOGLE_SHEETS_WEBHOOK_URL` | Enables the admin "Sync to Sheet" button (a Google Apps Script Web App URL — see below) | — |

For a production deploy, also set `CORS_ORIGINS` to your real domain(s), e.g.
`CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com`.

---

## Gmail App Password Setup
1. Enable 2FA on your Gmail account
2. Go to: Google Account → Security → 2-Step Verification → App Passwords
3. Select "Mail" → Generate
4. Copy the 16-character password → set as `GMAIL_APP_PASSWORD`

---

## MongoDB Atlas Setup (Optional — for production database)
1. Go to [cloud.mongodb.com](https://cloud.mongodb.com) → Create free cluster
2. Create a database user (username + password)
3. Whitelist your server IP (or 0.0.0.0/0 for any)
4. Click Connect → Drivers → Copy connection string
5. Replace `<password>` with your password
6. Set as `MONGO_URI` in backend/.env

Without MongoDB: the server uses JSON files in `backend/data/` — works perfectly for small sites.

---

## Google Sheets Sync Setup (Optional — for the admin "Sync to Sheet" button)
This feature has no external dependency by default — it just tells you it isn't
configured, and "Download CSV" (already in the same screen) works with zero setup.
To make "Sync to Sheet" actually push subscribers into a Google Sheet:
1. Create a Google Sheet, then Extensions → Apps Script
2. Add a script with a `doPost(e)` function that parses `JSON.parse(e.postData.contents).subscribers`
   and appends each email as a new row
3. Deploy → New deployment → Web app → Execute as "Me" → Who has access "Anyone with the link"
4. Copy the deployment URL → set as `GOOGLE_SHEETS_WEBHOOK_URL` in backend/.env

---

## Useful Commands (after deploy)

```bash
# View backend logs
pm2 logs spandana-api

# Restart backend
pm2 restart spandana-api

# Check backend health
curl http://localhost:5000/api/v1/docs

# Check nginx status
sudo systemctl status nginx

# View nginx error log
sudo tail -f /var/log/nginx/error.log

# Admin panel URL
# https://yourdomain.com/admin

# API docs URL
# https://yourdomain.com/api/v1/docs
```

---

## Folder Structure After Deploy

```
/var/www/spandana/
├── backend/
│   ├── server.js          ← Entry point
│   ├── .env               ← Your environment variables
│   ├── data/              ← JSON data files (auto-created)
│   └── uploads/           ← Uploaded images (auto-created)
├── frontend/
│   └── dist/              ← Built React app (served by nginx)
├── ecosystem.config.json  ← PM2 config
├── nginx/spandana.conf    ← Nginx config (copy to sites-available)
├── deploy.sh              ← Build + launch script
└── DEPLOYMENT.md          ← This file
```