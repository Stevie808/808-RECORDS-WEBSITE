# 🚀 Deployment Guide: Backend (Render) + Frontend (Vercel)

This guide will walk you through deploying your 808 Records website to production.

## 📋 Prerequisites

- ✅ Code is working locally
- ✅ GitHub account (for connecting to Render/Vercel)
- ✅ MongoDB Atlas account (already set up)
- ✅ Render account (free tier available)
- ✅ Vercel account (free tier available)

---

## Part 1: Deploy Backend to Render

### Step 1: Prepare Your Code

1. **Commit all changes to Git**:
   ```powershell
   git add .
   git commit -m "Prepare for deployment"
   git push origin main
   ```

2. **Verify these files exist**:
   - ✅ `backend/Procfile` (created for you)
   - ✅ `backend/requirements.txt` (already exists)
   - ✅ `backend/server.py` (already exists)

### Step 2: Create Render Account & Service

1. **Sign up/Login**: Go to https://render.com
2. **Create New Web Service**:
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select the repository containing your code

3. **Configure the Service**:
   - **Name**: `808-records-backend` (or your choice)
   - **Region**: Choose closest to you
   - **Branch**: `main` (or your default branch)
   - **Root Directory**: `backend`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn server:app --host 0.0.0.0 --port $PORT`

### Step 3: Set Environment Variables in Render

In Render dashboard, go to **Environment** section and add:

```
MONGO_URL=mongodb+srv://stevie:sd80803%24%21@cluster0.nke0uhl.mongodb.net/?appName=Cluster0
DB_NAME=808records
CORS_ORIGINS=https://your-frontend-domain.vercel.app,http://localhost:3000
```

**Important Notes**:
- Replace `your-frontend-domain.vercel.app` with your actual Vercel domain (you'll get this after deploying frontend)
- Keep `http://localhost:3000` for local development
- Make sure password is URL-encoded (`%24%21` for `$!`)

### Step 4: Deploy

1. Click **"Create Web Service"**
2. Render will automatically:
   - Clone your repo
   - Install dependencies
   - Start your server
3. Wait for deployment (usually 2-5 minutes)
4. Your backend will be live at: `https://your-backend-name.onrender.com`

### Step 5: Update MongoDB Atlas IP Whitelist

1. Go to MongoDB Atlas → Network Access
2. Click "Add IP Address"
3. Add: `0.0.0.0/0` (allows all IPs - needed for Render)
   - ⚠️ For production, you can restrict this later
4. Wait 1-2 minutes for changes

### Step 6: Test Your Backend

Visit your Render URL:
- API Root: `https://your-backend-name.onrender.com/api/`
- API Docs: `https://your-backend-name.onrender.com/docs`

You should see: `{"message":"Hello World"}`

---

## Part 2: Deploy Frontend to Vercel

### Step 1: Prepare Frontend

1. **Update frontend to use production backend URL**:
   - We'll set this via environment variable in Vercel

2. **Verify build works locally**:
   ```powershell
   cd frontend
   yarn build
   ```
   This should create a `build` folder without errors.

### Step 2: Create Vercel Account & Project

1. **Sign up/Login**: Go to https://vercel.com
2. **Import Project**:
   - Click "Add New..." → "Project"
   - Import your GitHub repository
   - Select the repository

3. **Configure Project**:
   - **Framework Preset**: Create React App
   - **Root Directory**: `frontend`
   - **Build Command**: `yarn build` (or `npm run build`)
   - **Output Directory**: `build`
   - **Install Command**: `yarn install` (or `npm install`)

### Step 3: Set Environment Variables in Vercel

In Vercel dashboard, go to **Settings** → **Environment Variables** and add:

```
REACT_APP_BACKEND_URL=https://your-backend-name.onrender.com
```

**Important**: Replace `your-backend-name.onrender.com` with your actual Render backend URL!

### Step 4: Deploy

1. Click **"Deploy"**
2. Vercel will:
   - Install dependencies
   - Build your React app
   - Deploy to production
3. Your frontend will be live at: `https://your-project-name.vercel.app`

### Step 5: Update Backend CORS

1. Go back to Render dashboard
2. Update the `CORS_ORIGINS` environment variable:
   ```
   CORS_ORIGINS=https://your-project-name.vercel.app,http://localhost:3000
   ```
3. Redeploy the backend (Render will auto-redeploy when env vars change)

---

## Part 3: Final Configuration

### Update Frontend Environment Variable

After you have both URLs:

1. **In Vercel**: Update `REACT_APP_BACKEND_URL` to your Render backend URL
2. **Redeploy frontend** (Vercel will auto-redeploy)

### Update Backend CORS

1. **In Render**: Update `CORS_ORIGINS` to include your Vercel frontend URL
2. **Redeploy backend** (or wait for auto-redeploy)

---

## 🔍 Testing Your Deployment

### Test Backend:
- ✅ `https://your-backend.onrender.com/api/` → Should return `{"message":"Hello World"}`
- ✅ `https://your-backend.onrender.com/api/content/artists` → Should return artists array
- ✅ `https://your-backend.onrender.com/docs` → Should show API documentation

### Test Frontend:
- ✅ Visit `https://your-frontend.vercel.app`
- ✅ Check browser console (F12) - should see no errors
- ✅ Artists and releases should load
- ✅ Forms should work

---

## 🐛 Troubleshooting

### Backend Issues

**Problem**: Backend won't start
- Check Render logs for errors
- Verify environment variables are set correctly
- Check MongoDB connection (test locally first)

**Problem**: CORS errors
- Make sure `CORS_ORIGINS` includes your Vercel frontend URL
- Format: `https://your-frontend.vercel.app,http://localhost:3000` (no spaces!)

**Problem**: MongoDB connection fails
- Check MongoDB Atlas IP whitelist (add `0.0.0.0/0` for Render)
- Verify `MONGO_URL` is correct in Render environment variables
- Check password is URL-encoded

### Frontend Issues

**Problem**: Can't connect to backend
- Check `REACT_APP_BACKEND_URL` in Vercel environment variables
- Make sure backend URL is correct (no trailing slash)
- Check browser console for specific errors

**Problem**: Build fails
- Check Vercel build logs
- Try building locally: `cd frontend && yarn build`
- Fix any build errors locally first

**Problem**: Blank page
- Check browser console for errors
- Verify environment variables are set in Vercel
- Make sure backend is accessible

---

## 📝 Environment Variables Summary

### Render (Backend):
```
MONGO_URL=mongodb+srv://stevie:sd80803%24%21@cluster0.nke0uhl.mongodb.net/?appName=Cluster0
DB_NAME=808records
CORS_ORIGINS=https://your-frontend.vercel.app,http://localhost:3000
```

### Vercel (Frontend):
```
REACT_APP_BACKEND_URL=https://your-backend.onrender.com
```

---

## 🎉 Success!

Once both are deployed:
- ✅ Backend: `https://your-backend.onrender.com`
- ✅ Frontend: `https://your-frontend.vercel.app`
- ✅ Everything working together!

---

## 📚 Additional Resources

- **Render Docs**: https://render.com/docs
- **Vercel Docs**: https://vercel.com/docs
- **MongoDB Atlas**: https://cloud.mongodb.com

---

## 🔄 Updating Your Deployment

### To update backend:
1. Make changes locally
2. Commit and push to GitHub
3. Render will auto-deploy

### To update frontend:
1. Make changes locally
2. Commit and push to GitHub
3. Vercel will auto-deploy

Both platforms support automatic deployments from GitHub! 🚀

