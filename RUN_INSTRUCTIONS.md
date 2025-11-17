# How to Run the 808 Records Website

## ✅ What's Been Fixed

1. **Fixed syntax error** in `frontend/package.json` (missing comma on line 39)
2. **Created `.env` file** in `backend/` directory with MongoDB configuration
3. **Installed all backend dependencies** (Python packages)
4. **Installed all frontend dependencies** (Node packages via Yarn)

## 🚀 Running the Application

### Step 1: Start MongoDB (Required)

You need MongoDB running before starting the backend. Choose one:

**Option A: Local MongoDB**
- Install MongoDB Community Edition from https://www.mongodb.com/try/download/community
- Start MongoDB service: `mongod` (or start it as a Windows service)

**Option B: MongoDB Atlas (Cloud)**
- Sign up at https://www.mongodb.com/cloud/atlas
- Create a free cluster
- Get your connection string
- Update `backend/.env`:
  ```
  MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net
  ```

### Step 2: Start the Backend Server

Open a terminal in the project root and run:

```powershell
cd backend
uvicorn server:app --reload --port 8000
```

You should see:
```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Application startup complete.
```

The backend API will be available at: `http://localhost:8000`
- API docs: `http://localhost:8000/docs`
- Health check: `http://localhost:8000/api/`

### Step 3: Start the Frontend

Open a **new terminal** (keep backend running) and run:

```powershell
cd frontend
yarn start
```

Or if you prefer npm:
```powershell
cd frontend
npm start
```

The frontend will open automatically at: `http://localhost:3000`

## 🔧 Configuration Files

### Backend `.env` (already created in `backend/.env`)
```
MONGO_URL=mongodb://localhost:27017
DB_NAME=808records
CORS_ORIGINS=http://localhost:3000,http://localhost:3001
```

### Frontend `.env` (optional, create in `frontend/.env` if needed)
```
REACT_APP_BACKEND_URL=http://localhost:8000
```

## 🐛 Troubleshooting

### Backend won't start
- **Error: "MONGO_URL not found"**: Make sure `.env` file exists in `backend/` directory
- **Error: "Connection refused"**: MongoDB is not running. Start MongoDB first.
- **Port 8000 already in use**: Change port: `uvicorn server:app --reload --port 8001`

### Frontend won't connect to backend
- Check that backend is running on port 8000
- Verify `REACT_APP_BACKEND_URL` in frontend `.env` matches backend URL
- Check browser console for CORS errors (backend CORS should allow `http://localhost:3000`)

### MongoDB Connection Issues
- Verify MongoDB is running: `mongosh` (or `mongo` on older versions)
- For MongoDB Atlas: Check your IP is whitelisted in Atlas dashboard
- Test connection: `mongosh "mongodb://localhost:27017"`

## 📝 Default Admin Credentials

- **Email**: `stevie@808records.com`
- **Password**: `stevie808`

OR

- **Email**: `redh1ll@developer.com`
- **Password**: `redhill`

## 🎯 Next Steps

1. **Test the application**: 
   - Visit `http://localhost:3000` to see the frontend
   - Visit `http://localhost:8000/docs` to see API documentation
   - Try logging in at `http://localhost:3000/admin/login`

2. **Check for issues**: 
   - Backend logs will show any errors
   - Frontend browser console will show frontend errors
   - MongoDB connection errors will appear in backend logs

3. **Ready for deployment?**: 
   - Once everything works locally, we can help you deploy!

## 📦 Tech Stack Summary

- **Backend**: FastAPI (Python) + MongoDB + Motor (async driver)
- **Frontend**: React 19 + Tailwind CSS + Radix UI + React Router
- **Build Tool**: CRACO (Create React App Configuration Override)
- **Package Manager**: Yarn (frontend), pip (backend)

