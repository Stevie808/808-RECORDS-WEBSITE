# MongoDB Atlas Setup Guide

## Current Issue: SSL Handshake Error

Your backend server is failing to connect to MongoDB Atlas due to an SSL/TLS handshake error. This is typically caused by one of these issues:

## ✅ Solution 1: Whitelist Your IP Address (Most Common)

1. **Go to MongoDB Atlas Dashboard**: https://cloud.mongodb.com
2. **Navigate to Network Access**:
   - Click on "Network Access" in the left sidebar
   - Or go to: Security → Network Access
3. **Add IP Address**:
   - Click "Add IP Address" button
   - For testing/development, you can add `0.0.0.0/0` (allows all IPs - **only for development!**)
   - For production, add your specific IP address
   - Click "Confirm"
4. **Wait 1-2 minutes** for changes to propagate
5. **Try connecting again**

## ✅ Solution 2: Verify Connection String

Your current connection string format:
```
mongodb+srv://stevie:sd80803%24%21@cluster0.nke0uhl.mongodb.net/?appName=Cluster0
```

**Important Notes:**
- The password `sd80803$!` is URL-encoded as `sd80803%24%21`
  - `$` = `%24`
  - `!` = `%21`
- Make sure your username and password are correct
- The cluster name should match your Atlas cluster

## ✅ Solution 3: Test Connection Manually

Run the test script to verify:
```powershell
cd backend
python test_connection.py
```

## ✅ Solution 4: Alternative - Use MongoDB Connection String from Atlas

1. Go to MongoDB Atlas → Clusters
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Copy the connection string
5. Replace `<password>` with your actual password (URL-encoded if needed)
6. Update `MONGO_URL` in `backend/.env`

## Current .env Configuration

Your `.env` file should look like:
```
MONGO_URL=mongodb+srv://stevie:sd80803%24%21@cluster0.nke0uhl.mongodb.net/?appName=Cluster0
DB_NAME=808records
CORS_ORIGINS=http://localhost:3000,http://localhost:3001
```

## Quick Fix Steps

1. **Whitelist IP in MongoDB Atlas** (most important!)
   - Go to: https://cloud.mongodb.com/v2#/security/network/whitelist
   - Add: `0.0.0.0/0` (for development) or your specific IP
   - Wait 1-2 minutes

2. **Verify credentials**:
   - Username: `stevie`
   - Password: `sd80803$!` (encoded as `%24%21` in URL)

3. **Test connection**:
   ```powershell
   cd backend
   python test_connection.py
   ```

4. **Start server**:
   ```powershell
   python start_server.py
   # or
   uvicorn server:app --reload --port 8000
   ```

## Still Having Issues?

If you're still getting SSL errors after whitelisting your IP:

1. **Check MongoDB Atlas Status**: Make sure your cluster is running
2. **Verify Database User**: 
   - Go to Atlas → Database Access
   - Make sure user `stevie` exists and has proper permissions
3. **Try Different Connection String Format**:
   ```
   mongodb+srv://stevie:sd80803%24%21@cluster0.nke0uhl.mongodb.net/808records?retryWrites=true&w=majority
   ```
4. **Check Firewall**: Make sure your firewall isn't blocking MongoDB connections

## Need Help?

The server has been modified to show clearer error messages. Check the server logs when you start it to see specific error details.

