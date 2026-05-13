# 🚀 Railway Deployment Checklist - CRITICAL STEPS

> **DO NOT deploy from root directory.** This is a monorepo. You MUST deploy as TWO separate Railway services.

## ✅ Pre-Deployment Verification

- [ ] GitHub repository is public and connected to Railway
- [ ] You have a Railway account (https://railway.app)
- [ ] You have generated a strong JWT_SECRET (e.g., use `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)

---

## 📦 Step 1: Deploy PostgreSQL Database

1. Log into Railway dashboard
2. Click **"New Project"** → **"Provision PostgreSQL"**
3. Wait for PostgreSQL to start
4. Click the PostgreSQL service and open **"Variables"** tab
5. Copy the **`DATABASE_URL`** value (looks like: `postgresql://user:pass@host:port/db`)
6. **SAVE THIS** – you'll need it for the backend

---

## 🔧 Step 2: Deploy Backend Service (CRITICAL: Set Root Directory)

### Create Backend Service

1. Click **"New Service"** → **"GitHub Repo"**
2. Select your repository
3. **CRITICAL: Click "Settings" tab**
4. **Find "Root Directory" field and enter exactly:** `backend`
5. Click save

### Add Environment Variables (Backend)

1. Click **"Variables"** tab
2. Add these variables:
   - **Key:** `DATABASE_URL` | **Value:** (paste your PostgreSQL connection string)
   - **Key:** `JWT_SECRET` | **Value:** (your generated secret key)
   - **Key:** `NODE_ENV` | **Value:** `production`
   - **Key:** `PORT` | **Value:** `5000`

3. Deploy triggers automatically
4. **Wait for deployment to complete** (check logs)
5. Once deployed, copy your backend URL (looks like: `https://your-app-backend.railway.app`)
6. **SAVE THIS** – you'll need it for the frontend

### Verify Backend

- Check logs: click service → "Logs" tab
- Should see: `Server running on port 5000`
- Test health: Visit `https://your-app-backend.railway.app/api/health`

---

## 🎨 Step 3: Deploy Frontend Service (CRITICAL: Set Root Directory)

### Create Frontend Service

1. Click **"New Service"** → **"GitHub Repo"**
2. Select your repository
3. **CRITICAL: Click "Settings" tab**
4. **Find "Root Directory" field and enter exactly:** `frontend`
5. Click save

### Add Environment Variables (Frontend)

1. Click **"Variables"** tab
2. Add this variable:
   - **Key:** `VITE_API_URL` | **Value:** (paste your backend URL from Step 2)

3. Deploy triggers automatically
4. **Wait for deployment to complete** (check logs)
5. Once deployed, copy your frontend URL (looks like: `https://your-app-frontend.railway.app`)

### Verify Frontend

- Visit your frontend URL
- Should load without errors
- Try signing up with a new account
- If page loads but API calls fail → VITE_API_URL is not set correctly

---

## 🔍 Troubleshooting

### ❌ Build Error: "No package.json found"
**Cause:** Root directory not set to `backend` or `frontend`  
**Fix:** Go to service Settings → set Root Directory to the correct subdirectory

### ❌ Backend logs show "Cannot find module"
**Fix:** Ensure you ran `npm install` before deploying (should be automatic)

### ❌ Frontend shows blank page or API errors
**Cause:** `VITE_API_URL` not set or incorrect  
**Fix:** 
1. Go to frontend service → Variables
2. Verify `VITE_API_URL` = your backend URL
3. Redeploy or wait for automatic redeploy

### ❌ Database connection error
**Fix:**
1. Verify PostgreSQL service is running (check project overview)
2. Copy DATABASE_URL again and verify it's correct in backend Variables
3. Check PostgreSQL logs for errors

### ❌ Signup/Login not working
**Cause:** JWT_SECRET not set or different between local and Railway  
**Fix:**
1. Generate a new JWT_SECRET
2. Update backend Variables with new value
3. Redeploy backend

---

## ✨ Final Verification Checklist

- [ ] Backend service deployed with root directory = `backend`
- [ ] Backend has `DATABASE_URL`, `JWT_SECRET`, `NODE_ENV`, `PORT` variables
- [ ] Backend logs show "Server running on port 5000"
- [ ] Frontend service deployed with root directory = `frontend`
- [ ] Frontend has `VITE_API_URL` pointing to backend URL
- [ ] Frontend builds successfully (check logs)
- [ ] Can visit frontend URL without errors
- [ ] Can sign up for a new account
- [ ] Can create a project
- [ ] Can create a task
- [ ] Can see tasks on dashboard

---

## 📝 Reference

- Backend root: `backend/`
- Backend entry: `backend/server.js`
- Frontend root: `frontend/`
- Frontend build output: `frontend/dist/`
- Production database: Railway PostgreSQL
- JWT token expiry: 7 days
