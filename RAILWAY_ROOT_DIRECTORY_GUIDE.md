# Railway Service Configuration - Quick Reference

## 🎯 Two Services Required

```
Service 1: Backend
├─ Root Directory: backend
├─ Start Command: node server.js
├─ Build: npm install
└─ Variables:
   ├─ DATABASE_URL=postgresql://...
   ├─ JWT_SECRET=<your-secret>
   ├─ NODE_ENV=production
   └─ PORT=5000

Service 2: Frontend  
├─ Root Directory: frontend
├─ Start Command: npm run start
├─ Build: npm run build
└─ Variables:
   └─ VITE_API_URL=https://your-backend.railway.app
```

---

## 🔄 Deployment Flow

```
1. Push code to GitHub (main branch)
   ↓
2. Railway detects repo change
   ↓
3. For each service:
   ├─ Read Root Directory setting
   ├─ Read package.json from that directory
   ├─ npm install (if not cached)
   ├─ Build command (npm run build for frontend, npm install for backend)
   ├─ Start command
   └─ Serve on auto-assigned port
```

---

## 📋 Root Directory Setting Location

**In Railway Dashboard:**
```
Your Service → Settings → Root Directory

┌─────────────────────────────────────┐
│ Service Settings                    │
├─────────────────────────────────────┤
│ ...                                 │
│ Root Directory:  [backend     ]    │
│ ...                                 │
└─────────────────────────────────────┘
```

---

## ✅ Validation

### For Backend Service
```bash
$ npm install        # Should complete without errors
$ node server.js     # Should show: "Server running on port 5000"
$ curl /api/health   # Should return: {"status":"OK"}
```

### For Frontend Service
```bash
$ npm install        # Should complete without errors
$ npm run build      # Should show: "✓ built in X.XXs"
$ ls dist/           # Should have index.html and assets
```

---

## 🚨 Common Mistakes

| ❌ Wrong | ✅ Correct |
|---------|----------|
| `./backend` | `backend` |
| `/backend` | `backend` |
| `backend/` | `backend` |
| `etharaassignment` | `backend` (or `frontend`) |
| Blank/empty | `backend` (or `frontend`) |

---

## 📞 If Deployment Fails

1. **Check service logs** → Click service → "Logs" tab
2. **Look for:** "No package.json found" → Root Directory not set correctly
3. **Fix:** Update root directory to `backend` or `frontend`
4. **Redeploy:** Click "Redeploy" button or push new commit

---

## 🎓 Understanding Monorepos

This project is a **monorepo** because backend and frontend are in the same Git repository:

```
etharaassignment/          ← Git repo root
├── backend/               ← Backend service root
│   └── package.json       ← Backend dependencies
├── frontend/              ← Frontend service root
│   └── package.json       ← Frontend dependencies
└── README.md              ← Project docs
```

**Single repo, two services, two root directories.**

Without specifying the root directory, Railway doesn't know which `package.json` to use!

---

**For detailed steps, see:** [RAILWAY_DEPLOYMENT.txt](RAILWAY_DEPLOYMENT.txt)  
**For quick troubleshooting:** [QUICK_RAILWAY_FIX.md](QUICK_RAILWAY_FIX.md)  
**For complete checklist:** [RAILWAY_SETUP_CHECKLIST.md](RAILWAY_SETUP_CHECKLIST.md)
