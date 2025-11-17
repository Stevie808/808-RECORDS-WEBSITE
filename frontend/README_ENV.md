# Frontend Environment Setup

## Required: Create `.env` file

The frontend needs a `.env` file to know where the backend API is located.

### Quick Setup

**Run this command in the `frontend/` directory:**

```powershell
cd frontend
"REACT_APP_BACKEND_URL=http://localhost:8000" | Out-File -FilePath .env -Encoding utf8
```

Or manually:
1. Create a file named `.env` in the `frontend/` folder
2. Add this line:
   ```
   REACT_APP_BACKEND_URL=http://localhost:8000
   ```
3. Save the file

### After Creating .env

**IMPORTANT**: You must restart the frontend dev server!

1. Stop the current frontend (Ctrl+C)
2. Start it again: `yarn start`

The `.env` file is only read when React starts, so a restart is required.

### Verify It Works

1. Check the file exists: `Get-Content frontend\.env`
2. Should show: `REACT_APP_BACKEND_URL=http://localhost:8000`
3. Restart frontend
4. Check browser console - no more AxiosError!

