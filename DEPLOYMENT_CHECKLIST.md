# ✅ Deployment Checklist

Use this checklist to ensure everything is ready for deployment.

## Pre-Deployment

### Backend (Render)
- [ ] Code is committed to GitHub
- [ ] `backend/Procfile` exists
- [ ] `backend/requirements.txt` is up to date
- [ ] Backend works locally
- [ ] MongoDB connection works locally
- [ ] Environment variables documented

### Frontend (Vercel)
- [ ] Code is committed to GitHub
- [ ] `frontend/vercel.json` exists
- [ ] `frontend/package.json` has build script
- [ ] Frontend builds locally (`yarn build`)
- [ ] Frontend works with local backend
- [ ] Environment variables documented

### MongoDB Atlas
- [ ] IP whitelist includes `0.0.0.0/0` (for Render)
- [ ] Database user has correct permissions
- [ ] Connection string is correct

---

## Deployment Steps

### Step 1: Deploy Backend to Render
- [ ] Created Render account
- [ ] Created new Web Service
- [ ] Connected GitHub repository
- [ ] Set root directory to `backend`
- [ ] Set build command: `pip install -r requirements.txt`
- [ ] Set start command: `uvicorn server:app --host 0.0.0.0 --port $PORT`
- [ ] Added environment variables:
  - [ ] `MONGO_URL`
  - [ ] `DB_NAME`
  - [ ] `CORS_ORIGINS` (temporary - will update after frontend deploy)
- [ ] Deployment successful
- [ ] Backend URL: `https://________________.onrender.com`
- [ ] Tested backend API: ✅

### Step 2: Deploy Frontend to Vercel
- [ ] Created Vercel account
- [ ] Imported GitHub repository
- [ ] Set root directory to `frontend`
- [ ] Set framework preset: Create React App
- [ ] Set build command: `yarn build`
- [ ] Set output directory: `build`
- [ ] Added environment variable:
  - [ ] `REACT_APP_BACKEND_URL` = `https://your-backend.onrender.com`
- [ ] Deployment successful
- [ ] Frontend URL: `https://________________.vercel.app`
- [ ] Tested frontend: ✅

### Step 3: Final Configuration
- [ ] Updated Render `CORS_ORIGINS` with Vercel frontend URL
- [ ] Backend redeployed with new CORS settings
- [ ] Frontend tested with production backend
- [ ] All features working:
  - [ ] Artists loading
  - [ ] Releases loading
  - [ ] Contact form working
  - [ ] Admin login working (if applicable)

---

## Post-Deployment Testing

### Backend Tests
- [ ] `https://your-backend.onrender.com/api/` → Returns `{"message":"Hello World"}`
- [ ] `https://your-backend.onrender.com/api/content/artists` → Returns artists
- [ ] `https://your-backend.onrender.com/api/content/releases` → Returns releases
- [ ] `https://your-backend.onrender.com/docs` → API docs load

### Frontend Tests
- [ ] Homepage loads
- [ ] No console errors
- [ ] Artists section displays data
- [ ] Releases section displays data
- [ ] Contact form submits successfully
- [ ] All links work
- [ ] Images load correctly

### Integration Tests
- [ ] Frontend can fetch data from backend
- [ ] No CORS errors
- [ ] Forms submit to backend
- [ ] Admin features work (if applicable)

---

## URLs to Save

**Backend (Render):**
```
https://________________.onrender.com
```

**Frontend (Vercel):**
```
https://________________.vercel.app
```

**API Documentation:**
```
https://________________.onrender.com/docs
```

---

## Environment Variables Reference

### Render (Backend)
```
MONGO_URL=mongodb+srv://stevie:sd80803%24%21@cluster0.nke0uhl.mongodb.net/?appName=Cluster0
DB_NAME=808records
CORS_ORIGINS=https://your-frontend.vercel.app,http://localhost:3000
```

### Vercel (Frontend)
```
REACT_APP_BACKEND_URL=https://your-backend.onrender.com
```

---

## Common Issues & Solutions

### Issue: Backend won't start
- ✅ Check Render logs
- ✅ Verify environment variables
- ✅ Test MongoDB connection locally first

### Issue: CORS errors
- ✅ Update `CORS_ORIGINS` in Render
- ✅ Make sure frontend URL is included
- ✅ No spaces in CORS_ORIGINS value

### Issue: Frontend can't connect
- ✅ Check `REACT_APP_BACKEND_URL` in Vercel
- ✅ Verify backend is accessible
- ✅ Check browser console for errors

### Issue: Build fails
- ✅ Test build locally first
- ✅ Check build logs in Vercel
- ✅ Fix any TypeScript/ESLint errors

---

## 🎉 Deployment Complete!

Once all items are checked:
- ✅ Your website is live!
- ✅ Share your Vercel URL with the world
- ✅ Monitor Render and Vercel dashboards for any issues

