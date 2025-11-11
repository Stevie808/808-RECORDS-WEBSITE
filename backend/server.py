from fastapi import FastAPI, APIRouter
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List
import uuid
from datetime import datetime, timezone
import admin_routes
from admin_routes import router as admin_router
import content_routes
from content_routes import router as content_router
import submission_routes
from submission_routes import router as submission_router
from auth import get_password_hash


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models
class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")  # Ignore MongoDB's _id field
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    client_name: str

# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "Hello World"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.model_dump()
    status_obj = StatusCheck(**status_dict)
    
    # Convert to dict and serialize datetime to ISO string for MongoDB
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    
    _ = await db.status_checks.insert_one(doc)
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    # Exclude MongoDB's _id field from the query results
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    
    # Convert ISO string timestamps back to datetime objects
    for check in status_checks:
        if isinstance(check['timestamp'], str):
            check['timestamp'] = datetime.fromisoformat(check['timestamp'])
    
    return status_checks

# Set database for routes
admin_routes.set_db(db)
content_routes.set_db(db)
submission_routes.set_db(db)

# Include the routers in the main app
app.include_router(api_router)
app.include_router(admin_router, prefix="/api")
app.include_router(content_router, prefix="/api")
app.include_router(submission_router, prefix="/api")

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("startup")
async def startup_initialize_admins():
    default_admins = [
        {
            "email": "stevie@808records.com", 
            "password": "stevie808",
            "role": "owner",
            "permissions": {
                "manage_artists": True,
                "manage_releases": True,
                "manage_content": True,
                "manage_submissions": True,
                "manage_admins": True
            }
        },
        {
            "email": "redh1ll@developer.com", 
            "password": "redhill",
            "role": "developer",
            "permissions": {
                "manage_artists": True,
                "manage_releases": True,
                "manage_content": True,
                "manage_submissions": True,
                "manage_admins": True
            }
        }
    ]
    
    for admin_data in default_admins:
        existing = await db.admins.find_one({"email": admin_data["email"]})
        if not existing:
            from models import Admin
            admin = Admin(
                email=admin_data["email"],
                password=get_password_hash(admin_data["password"]),
                role=admin_data["role"],
                permissions=admin_data["permissions"],
                created_by="system"
            )
            await db.admins.insert_one(admin.dict())
            logger.info(f"Created default {admin_data['role']}: {admin_data['email']}")
        else:
            # Update existing admin roles and permissions to match defaults
            await db.admins.update_one(
                {"email": admin_data["email"]},
                {"$set": {
                    "role": admin_data["role"],
                    "permissions": admin_data["permissions"]
                }}
            )
            logger.info(f"Updated default admin role to {admin_data['role']}: {admin_data['email']}")
    
    artists_count = await db.artists.count_documents({})
    if artists_count == 0:
        from models import Artist
        default_artists = [
            {
                "id": "1",
                "name": "HOMI",
                "genre": "RAP / HIPHOP / Underground",
                "popularityScore": 95,
                "image": "https://images-ext-1.discordapp.net/external/XY26xoDFu3Z0KYHPc7BrO7R0UWolUdbOdwJSzEXHF8c/https/i.imgur.com/VcPwVzSh.jpg",
                "verified": True,
                "instagram": "https://www.instagram.com/1lovethisfeelin/",
                "spotify": "https://open.spotify.com/artist/3vAnIWA2b7x1JcqIRUvvC1",
                "latestRelease": "https://open.spotify.com/album/2iStOb2FdxI1DZNecbnhso"
            },
            {
                "id": "2",
                "name": "TENNAXIS",
                "genre": "RAP / HIPHOP / Underground",
                "popularityScore": 88,
                "image": "https://images-ext-1.discordapp.net/external/U_u3N_VkKDMDXkvGmDF9U8B0F8fpyTJHRGuav7q_heg/https/i.imgur.com/s8InhDth.jpg",
                "verified": True,
                "instagram": "https://www.instagram.com/tennaxisofficial/",
                "spotify": "https://open.spotify.com/artist/6n9wqcbOodp0E9tQrP19Nn",
                "latestRelease": "https://open.spotify.com/track/5djZjTd2U30VmgYNGJDfBa"
            },
            {
                "id": "3",
                "name": "PREACHA",
                "genre": "RAP / HIPHOP / Underground",
                "popularityScore": 82,
                "image": "https://images-ext-1.discordapp.net/external/3RVSX5-g2LL-1jbRR8i0eQ5sJeobrNtKo8uuingAADg/https/i.imgur.com/eYgM3I1h.jpg",
                "verified": True,
                "instagram": "https://www.instagram.com/preacha.a/",
                "spotify": "https://open.spotify.com/artist/71e9sfLkaAmJCwDT3wDhdd",
                "latestRelease": "https://open.spotify.com/album/5cwERqJo4MsIruJjfQ7yUD"
            },
            {
                "id": "4",
                "name": "FAILURE",
                "genre": "RAP / HIPHOP / Underground",
                "popularityScore": 75,
                "image": "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png",
                "verified": True,
                "instagram": "https://www.instagram.com/ifuckingfailed/",
                "spotify": "https://open.spotify.com/artist/3WyZHrDbNPdUMHITtvspXG",
                "latestRelease": "https://open.spotify.com/album/3vE8rDrHfuKRmLfUezEDRf"
            },
            {
                "id": "5",
                "name": "MTL",
                "genre": "RAP / HIPHOP / Underground",
                "popularityScore": 70,
                "image": "https://images-ext-1.discordapp.net/external/4-Dbd7aROg45yYmD-tQeqZ4kvmGEv5Y13bq6EIC_4os/https/i.imgur.com/o7d5YpBh.jpg",
                "verified": True,
                "instagram": "https://www.instagram.com/youandmtl/",
                "spotify": "https://open.spotify.com/artist/53u36FhOB11keC0CSSixsM",
                "latestRelease": "https://open.spotify.com/album/460KPQFdzqpbAFoG3pQzf2"
            },
            {
                "id": "6",
                "name": "LULUSREVENGE",
                "genre": "RAP / HIPHOP / Underground",
                "popularityScore": 65,
                "image": "https://images-ext-1.discordapp.net/external/b2f-zTC4p9xK0t1IZxLO1hnginVCuOoMmh7Hqe2dYs0/https/i.imgur.com/LiKUQZph.jpg",
                "verified": True,
                "instagram": "https://www.instagram.com/lulusrevenge/",
                "spotify": "https://open.spotify.com/artist/4nn90O44N2Rl0wulNXMnjI",
                "latestRelease": "https://open.spotify.com/track/13lIM7PhQXkRE0H0L9EyHG"
            }
        ]
        
        for artist_data in default_artists:
            artist_data['updated_at'] = datetime.now(timezone.utc).isoformat()
            await db.artists.insert_one(artist_data)
        logger.info(f"Added {len(default_artists)} artists")
    
    releases_count = await db.releases.count_documents({})
    if releases_count == 0:
        from models import Release
        default_releases = [
            {
                "id": "1",
                "title": "Soundscraper",
                "artist": "HOMI",
                "coverArt": "https://i.scdn.co/image/ab67616d00001e0287536becb277975deba810a2",
                "releaseDate": "2025-11-02",
                "type": "Album",
                "tracks": 16,
                "duration": "29:47",
                "featured": True,
                "spotifyUrl": "https://open.spotify.com/album/2iStOb2FdxI1DZNecbnhso"
            },
            {
                "id": "2",
                "title": "#B4FAIL2PREVAIL",
                "artist": "FAILURE",
                "coverArt": "https://i.scdn.co/image/ab67616d00001e02a5f946d8297ca279a95aa132",
                "releaseDate": "2025-06-18",
                "type": "Album",
                "tracks": 9,
                "duration": "15:47",
                "featured": True,
                "spotifyUrl": "https://open.spotify.com/album/3vE8rDrHfuKRmLfUezEDRf"
            },
            {
                "id": "3",
                "title": "A Born Killer",
                "artist": "TENNAXIS",
                "coverArt": "https://i.scdn.co/image/ab67616d00001e026e443cdee6328da748d2dc93",
                "releaseDate": "2025-10-17",
                "type": "Album",
                "tracks": 10,
                "duration": "22:47",
                "featured": True,
                "spotifyUrl": "https://open.spotify.com/album/4IfeqHxQ98vFlBTZkwcdML"
            },
            {
                "id": "4",
                "title": "ProofOfConcept",
                "artist": "MTL",
                "coverArt": "https://i.scdn.co/image/ab67616d00001e02892dfaf28ac241acb1c87a4f",
                "releaseDate": "2024-11-01",
                "type": "Album",
                "tracks": 13,
                "duration": "29:52",
                "featured": False,
                "spotifyUrl": "https://open.spotify.com/album/460KPQFdzqpbAFoG3pQzf2"
            },
            {
                "id": "5",
                "title": "Mixed Signals",
                "artist": "LULUSREVENGE",
                "coverArt": "https://i.scdn.co/image/ab67616d00001e02487a4d23b6f9f84c8cb0af6c",
                "releaseDate": "2025-10-31",
                "type": "Single",
                "tracks": 1,
                "duration": "2:34",
                "featured": False,
                "spotifyUrl": "https://open.spotify.com/track/13lIM7PhQXkRE0H0L9EyHG"
            },
            {
                "id": "6",
                "title": "GTFO",
                "artist": "TENNAXIS",
                "coverArt": "https://i.scdn.co/image/ab67616d00001e0227abfb102130f951ef687bb2",
                "releaseDate": "2025-11-07",
                "type": "Single",
                "tracks": 1,
                "duration": "2:04",
                "featured": True,
                "spotifyUrl": "https://open.spotify.com/track/5djZjTd2U30VmgYNGJDfBa"
            },
            {
                "id": "7",
                "title": "Scream",
                "artist": "PREACHA",
                "coverArt": "https://i.scdn.co/image/ab67616d00001e0210d4b25bf2d121eb7cd20463",
                "releaseDate": "2025-10-31",
                "type": "EP",
                "tracks": 6,
                "duration": "11:57",
                "featured": False,
                "spotifyUrl": "https://open.spotify.com/album/5cwERqJo4MsIruJjfQ7yUD"
            }
        ]
        
        for release_data in default_releases:
            release_data['updated_at'] = datetime.now(timezone.utc).isoformat()
            await db.releases.insert_one(release_data)
        logger.info(f"Added {len(default_releases)} releases")

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()