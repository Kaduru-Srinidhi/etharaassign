# ⚡ Quick Fix: Railway Root Directory Error

If you're seeing a build error like:
- "No package.json found"
- "Build failed - no recognizable project files"
- Build fails immediately after repo connection

**This is because Railway is building from the repository root instead of the service subdirectory.**

---

## 🔧 Fix in 2 Minutes

### For Each Service (Backend AND Frontend):

1. **Open the failing service in Railway dashboard**
2. Click **"Settings"** tab (top-right)
3. Find **"Root Directory"** field
4. Enter the correct subdirectory:
   - **Backend:** `backend`
   - **Frontend:** `frontend`
5. Click **"Save"** or **"Update"**
6. Railway will automatically redeploy

---

## ✅ Verify It's Fixed

- Backend logs should show: `Server running on port 5000`
- Frontend logs should show: `✓ built in X.XXs`
- No "package.json" errors

---

## 📚 Why This Happened

This is a **monorepo**. The repo structure is:

```
etharaassignment/
├── backend/          ← Deploy THIS for backend service
│   ├── package.json
│   └── server.js
└── frontend/         ← Deploy THIS for frontend service
    ├── package.json
    └── vite.config.js
```

Without setting the root directory, Railway tries to build from `etharaassignment/` which has no package.json at the root.

---

## 🎯 Root Directory Values

| Service | Root Directory |
|---------|----------------|
| Backend | `backend` |
| Frontend | `frontend` |

**Do NOT use:**
- `./backend` ❌
- `/backend` ❌
- `backend/` ❌
- Leaving it blank ❌

Just enter: `backend` or `frontend` (plain text)

---

**Need more help?** See `RAILWAY_DEPLOYMENT.txt` for full deployment guide.
