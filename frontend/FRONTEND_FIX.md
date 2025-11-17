# Frontend Connection Fix

## Issue
The frontend was showing AxiosError because:
1. Missing `.env` file with `REACT_APP_BACKEND_URL`
2. Backend server not running

## ✅ Fixed

1. **Created `.env` file** in `frontend/` directory with:
   ```
   REACT_APP_BACKEND_URL=http://localhost:8000
   ```

## 🚀 How to Run

### Step 1: Start the Backend (Required First!)

```powershell
cd backend
python start_server.py
```

Wait until you see:
```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Application startup complete.
```

### Step 2: Start the Frontend

**IMPORTANT**: You need to **restart** the frontend dev server after creating the `.env` file!

1. **Stop the current frontend** (if running) - Press `Ctrl+C` in the terminal
2. **Start it again**:
   ```powershell
   cd frontend
   yarn start
   ```

The `.env` file is only read when the React app starts, so you must restart it.

### Step 3: Verify It's Working

1. Open browser to `http://localhost:3000`
2. Open browser DevTools (F12) → Console tab
3. You should **NOT** see AxiosError anymore
4. The page should load:
   - Artists in the Leaderboard section
   - Releases in the Releases section
   - Contact information in Footer

## 🔍 Troubleshooting

### Still seeing AxiosError?

1. **Check backend is running**:
   - Visit http://localhost:8000/api/ in browser
   - Should see: `{"message":"Hello World"}`

2. **Check .env file exists**:
   ```powershell
   Get-Content frontend\.env
   ```
   Should show: `REACT_APP_BACKEND_URL=http://localhost:8000`

3. **Restart frontend**:
   - Stop it completely (Ctrl+C)
   - Start again: `yarn start`

4. **Check browser console**:
   - Open DevTools (F12)
   - Look at Network tab
   - See if requests to `http://localhost:8000/api/...` are failing
   - Check for CORS errors

### CORS Errors?

If you see CORS errors in the browser console:
- Make sure backend `.env` has: `CORS_ORIGINS=http://localhost:3000,http://localhost:3001`
- Restart the backend server after changing `.env`

### Backend Connection Issues?

See `backend/BACKEND_STATUS.md` for MongoDB connection help.

