# ⚡ Quick Deployment Guide

## TL;DR - Fast Steps

### Backend to Render (5 minutes)

1. **Go to Render.com** → Sign up/Login
2. **New Web Service** → Connect GitHub repo
3. **Settings**:
   - Root Directory: `backend`
   - Build: `pip install -r requirements.txt`
   - Start: `uvicorn server:app --host 0.0.0.0 --port $PORT`
4. **Environment Variables**:
   ```
   MONGO_URL=mongodb+srv://stevie:sd80803%24%21@cluster0.nke0uhl.mongodb.net/?appName=Cluster0
   DB_NAME=808records
   CORS_ORIGINS=https://your-frontend.vercel.app,http://localhost:3000
   ```
5. **Deploy** → Copy backend URL

### Frontend to Vercel (3 minutes)

1. **Go to Vercel.com** → Sign up/Login
2. **Import Project** → Connect GitHub repo
3. **Settings**:
   - Root Directory: `frontend`
   - Framework: Create React App
   - Build: `yarn build`
   - Output: `build`
4. **Environment Variable**:
   ```
   REACT_APP_BACKEND_URL=https://your-backend.onrender.com
   ```
5. **Deploy** → Copy frontend URL

### Final Step (2 minutes)

1. **Update Render CORS** with your Vercel URL
2. **Done!** 🎉

---

## 📝 Full Guide

See `DEPLOYMENT_GUIDE.md` for detailed instructions.

