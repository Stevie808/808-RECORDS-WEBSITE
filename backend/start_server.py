"""Startup script for the FastAPI server with better error handling"""
import sys
import os
from pathlib import Path

# Add current directory to path
sys.path.insert(0, str(Path(__file__).parent))

# Load environment variables
from dotenv import load_dotenv
load_dotenv(Path(__file__).parent / '.env')

# Check if required env vars are set
mongo_url = os.getenv('MONGO_URL')
db_name = os.getenv('DB_NAME')

if not mongo_url:
    print("ERROR: MONGO_URL not found in .env file")
    print("Please make sure your .env file contains:")
    print("MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/")
    sys.exit(1)

if not db_name:
    print("ERROR: DB_NAME not found in .env file")
    sys.exit(1)

print("=" * 60)
print("Starting 808 Records Backend Server")
print("=" * 60)
print(f"MongoDB URL: {mongo_url[:50]}...")
print(f"Database Name: {db_name}")
print("=" * 60)
print()

# Try to import and start the server
try:
    import uvicorn
    from server import app
    
    print("Server configuration loaded successfully!")
    print("Starting server on http://localhost:8000")
    print("API Documentation: http://localhost:8000/docs")
    print()
    print("Note: If you see MongoDB connection errors, check:")
    print("  1. MongoDB Atlas -> Network Access -> Add your IP address")
    print("  2. Verify your username and password in the connection string")
    print("  3. Make sure special characters in password are URL-encoded")
    print()
    print("Press Ctrl+C to stop the server")
    print("=" * 60)
    print()
    
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
    
except KeyboardInterrupt:
    print("\n\nServer stopped by user")
except Exception as e:
    print(f"\n\nERROR starting server: {e}")
    print("\nTroubleshooting:")
    print("1. Make sure all dependencies are installed: pip install -r requirements.txt")
    print("2. Check your .env file configuration")
    print("3. Verify MongoDB connection string is correct")
    sys.exit(1)

