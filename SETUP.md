# Setup Instructions for 808 Records Website

## Tech Stack
- **Backend**: FastAPI (Python) with MongoDB
- **Frontend**: React 19 with Tailwind CSS and Radix UI

## Prerequisites
- Python 3.8+ installed
- Node.js and Yarn installed (or npm)
- MongoDB running locally OR MongoDB Atlas connection string

## Backend Setup

1. **Create `.env` file in the `backend/` directory:**
   ```
   MONGO_URL=mongodb://localhost:27017
   DB_NAME=808records
   CORS_ORIGINS=http://localhost:3000,http://localhost:3001
   ```

   For MongoDB Atlas, use:
   ```
   MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net
   ```

2. **Install Python dependencies:**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

3. **Run the backend server:**
   ```bash
   uvicorn server:app --reload --port 8000
   ```

   The backend will be available at `http://localhost:8000`

## Frontend Setup

1. **Create `.env` file in the `frontend/` directory (optional):**
   ```
   REACT_APP_BACKEND_URL=http://localhost:8000
   ```

2. **Install dependencies:**
   ```bash
   cd frontend
   yarn install
   # or: npm install
   ```

3. **Run the frontend:**
   ```bash
   yarn start
   # or: npm start
   ```

   The frontend will be available at `http://localhost:3000`

## Default Admin Credentials
- Email: `stevie@808records.com` / Password: `stevie808`
- Email: `redh1ll@developer.com` / Password: `redhill`

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running locally, or
- Update `MONGO_URL` in `backend/.env` with your MongoDB Atlas connection string

### CORS Issues
- Make sure `CORS_ORIGINS` in `backend/.env` includes your frontend URL
- Default is `http://localhost:3000`

### Port Already in Use
- Backend: Change port in uvicorn command: `--port 8001`
- Frontend: React will prompt to use a different port automatically

