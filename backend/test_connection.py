"""Quick test script to verify MongoDB connection"""
from dotenv import load_dotenv
from pathlib import Path
import os
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

# Load environment variables
load_dotenv(Path('.env'))

async def test_connection():
    mongo_url = os.getenv('MONGO_URL')
    db_name = os.getenv('DB_NAME')
    
    print(f"MONGO_URL: {mongo_url[:50]}..." if mongo_url else "MONGO_URL: NOT FOUND")
    print(f"DB_NAME: {db_name}")
    
    if not mongo_url:
        print("ERROR: MONGO_URL not found in .env file")
        return
    
    try:
        client = AsyncIOMotorClient(mongo_url)
        # Test connection
        await client.admin.command('ping')
        print("MongoDB connection successful!")
        
        # List databases
        db_list = await client.list_database_names()
        print(f"Available databases: {db_list}")
        
        client.close()
    except Exception as e:
        error_msg = str(e)
        print(f"MongoDB connection failed: {error_msg[:200]}")
        print("\nTroubleshooting tips:")
        print("1. Check your MongoDB Atlas IP whitelist:")
        print("   - Go to MongoDB Atlas -> Network Access")
        print("   - Add your current IP or 0.0.0.0/0 (for testing only)")
        print("2. Verify your username and password are correct")
        print("3. The password special characters ($!) are URL-encoded as %24%21")
        if "SSL" in error_msg or "TLS" in error_msg:
            print("4. SSL/TLS error detected - check network connectivity and firewall")

if __name__ == "__main__":
    asyncio.run(test_connection())

