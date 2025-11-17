# Quick Fix: Frontend Not Showing Backend Data

## 🔴 Problem
Frontend is showing `AxiosError` because it can't connect to the backend API.

## ✅ Solution (2 minutes)

### Step 1: Create `.env` file in `frontend/` directory

**Option A: Using PowerShell (Recommended)**
```powershell
cd frontend
.\create-env.ps1
```

**Option B: Manual Creation**
1. Create a new file called `.env` in the `frontend/` folder
2. Add this single line:
   ```
   REACT_APP_BACKEND_URL=http://localhost:8000
   ```
3. Save the file

**Option C: Copy from example**
```powershell
cd frontend
Copy-Item .env.example .env
```

### Step 2: Make sure backend is running

Open a terminal and run:
```powershell
cd backend
python start_server.py
```

Wait until you see:
```
INFO:     Uvicorn running on http://127.0.0.1:8000
```

### Step 3: Restart the frontend

**IMPORTANT**: You MUST restart the frontend after creating the `.env` file!

1. Stop the frontend (press `Ctrl+C` in the terminal where it's running)
2. Start it again:
   ```powershell
   cd frontend
   yarn start
   ```

The `.env` file is only read when React starts, so a restart is required.

### Step 4: Verify it's working

1. Open browser to `http://localhost:3000`
2. Open DevTools (F12) → Console tab
3. You should **NOT** see `AxiosError` anymore
4. The page should show:
   - ✅ Artists in the Leaderboard section
   - ✅ Releases in the Releases section
   - ✅ Contact information

## 🔍 Troubleshooting

### Still seeing errors?

1. **Check backend is running**:
   - Visit http://localhost:8000/api/ in your browser
   - Should see: `{"message":"Hello World"}`

2. **Verify .env file**:
   ```powershell
   Get-Content frontend\.env
   ```
   Should show: `REACT_APP_BACKEND_URL=http://localhost:8000`

3. **Check browser console**:
   - Open DevTools (F12) → Network tab
   - Look for requests to `http://localhost:8000/api/...`
   - If they're failing, check the error message

4. **CORS errors?**
   - Make sure backend `.env` has: `CORS_ORIGINS=http://localhost:3000,http://localhost:3001`
   - Restart backend after changing `.env`

### Backend not starting?

See `backend/BACKEND_STATUS.md` - you may need to configure MongoDB Atlas IP whitelist.

## 📝 Summary

The issue was:
- ❌ Missing `REACT_APP_BACKEND_URL` environment variable
- ❌ Frontend trying to connect to empty URL: `/api/...` instead of `http://localhost:8000/api/...`

The fix:
- ✅ Created `.env` file with `REACT_APP_BACKEND_URL=http://localhost:8000`
- ✅ Restarted frontend to load the new environment variable

