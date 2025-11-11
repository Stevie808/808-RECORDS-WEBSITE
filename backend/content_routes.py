from fastapi import APIRouter, HTTPException, Depends
from typing import List
from models import Artist, ArtistCreate, ArtistUpdate, Release, ReleaseCreate, ReleaseUpdate
from admin_routes import get_current_admin
from datetime import datetime

router = APIRouter(prefix="/content", tags=["content"])

db = None

def set_db(database):
    global db
    db = database

async def check_permission(email: str, permission: str):
    admin = await db.admins.find_one({"email": email})
    if not admin:
        raise HTTPException(status_code=403, detail="Admin not found")
    
    if not admin.get('permissions', {}).get(permission, False):
        raise HTTPException(status_code=403, detail=f"Missing permission: {permission}")
    
    return True

@router.get("/artists", response_model=List[Artist])
async def get_artists():
    artists = await db.artists.find({}, {"_id": 0}).to_list(1000)
    for artist in artists:
        if isinstance(artist.get('updated_at'), str):
            artist['updated_at'] = datetime.fromisoformat(artist['updated_at'])
    return artists

@router.get("/artists/{artist_id}", response_model=Artist)
async def get_artist(artist_id: str):
    artist = await db.artists.find_one({"id": artist_id}, {"_id": 0})
    if not artist:
        raise HTTPException(status_code=404, detail="Artist not found")
    if isinstance(artist.get('updated_at'), str):
        artist['updated_at'] = datetime.fromisoformat(artist['updated_at'])
    return artist

@router.post("/artists", response_model=Artist)
async def create_artist(artist_data: ArtistCreate, current_admin: str = Depends(get_current_admin)):
    """Create a new artist (admin only)"""
    await check_permission(current_admin, 'manage_artists')
    
    artist = Artist(**artist_data.dict())
    
    # Convert datetime to ISO string for MongoDB
    artist_dict = artist.dict()
    artist_dict['updated_at'] = artist_dict['updated_at'].isoformat()
    
    await db.artists.insert_one(artist_dict)
    return artist

@router.put("/artists/{artist_id}", response_model=Artist)
async def update_artist(artist_id: str, artist_data: ArtistUpdate, current_admin: str = Depends(get_current_admin)):
    """Update an existing artist (admin only)"""
    await check_permission(current_admin, 'manage_artists')
    
    # Get existing artist
    existing_artist = await db.artists.find_one({"id": artist_id}, {"_id": 0})
    if not existing_artist:
        raise HTTPException(status_code=404, detail="Artist not found")
    
    # Update only provided fields
    update_data = {k: v for k, v in artist_data.dict().items() if v is not None}
    update_data['updated_at'] = datetime.utcnow().isoformat()
    
    await db.artists.update_one(
        {"id": artist_id},
        {"$set": update_data}
    )
    
    # Return updated artist
    updated_artist = await db.artists.find_one({"id": artist_id}, {"_id": 0})
    if isinstance(updated_artist.get('updated_at'), str):
        updated_artist['updated_at'] = datetime.fromisoformat(updated_artist['updated_at'])
    return updated_artist

@router.delete("/artists/{artist_id}")
async def delete_artist(artist_id: str, current_admin: str = Depends(get_current_admin)):
    """Delete an artist (admin only)"""
    await check_permission(current_admin, 'manage_artists')
    
    result = await db.artists.delete_one({"id": artist_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Artist not found")
    return {"success": True, "message": "Artist deleted"}

# ===== RELEASES ENDPOINTS =====

@router.get("/releases", response_model=List[Release])
async def get_releases():
    """Get all releases (public endpoint)"""
    releases = await db.releases.find({}, {"_id": 0}).to_list(1000)
    # Convert datetime strings back to datetime objects if needed
    for release in releases:
        if isinstance(release.get('updated_at'), str):
            release['updated_at'] = datetime.fromisoformat(release['updated_at'])
    return releases

@router.get("/releases/{release_id}", response_model=Release)
async def get_release(release_id: str):
    """Get a specific release by ID"""
    release = await db.releases.find_one({"id": release_id}, {"_id": 0})
    if not release:
        raise HTTPException(status_code=404, detail="Release not found")
    if isinstance(release.get('updated_at'), str):
        release['updated_at'] = datetime.fromisoformat(release['updated_at'])
    return release

@router.post("/releases", response_model=Release)
async def create_release(release_data: ReleaseCreate, current_admin: str = Depends(get_current_admin)):
    """Create a new release (admin only)"""
    await check_permission(current_admin, 'manage_releases')
    
    release = Release(**release_data.dict())
    
    # Convert datetime to ISO string for MongoDB
    release_dict = release.dict()
    release_dict['updated_at'] = release_dict['updated_at'].isoformat()
    
    await db.releases.insert_one(release_dict)
    return release

@router.put("/releases/{release_id}", response_model=Release)
async def update_release(release_id: str, release_data: ReleaseUpdate, current_admin: str = Depends(get_current_admin)):
    """Update an existing release (admin only)"""
    await check_permission(current_admin, 'manage_releases')
    
    # Get existing release
    existing_release = await db.releases.find_one({"id": release_id}, {"_id": 0})
    if not existing_release:
        raise HTTPException(status_code=404, detail="Release not found")
    
    # Update only provided fields
    update_data = {k: v for k, v in release_data.dict().items() if v is not None}
    update_data['updated_at'] = datetime.utcnow().isoformat()
    
    await db.releases.update_one(
        {"id": release_id},
        {"$set": update_data}
    )
    
    # Return updated release
    updated_release = await db.releases.find_one({"id": release_id}, {"_id": 0})
    if isinstance(updated_release.get('updated_at'), str):
        updated_release['updated_at'] = datetime.fromisoformat(updated_release['updated_at'])
    return updated_release

@router.delete("/releases/{release_id}")
async def delete_release(release_id: str, current_admin: str = Depends(get_current_admin)):
    """Delete a release (admin only)"""
    await check_permission(current_admin, 'manage_releases')
    
    result = await db.releases.delete_one({"id": release_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Release not found")
    return {"success": True, "message": "Release deleted"}

# ===== SITE CONTENT ENDPOINTS =====

@router.get("/site/{section}")
async def get_site_content(section: str):
    """Get site content by section (public endpoint)"""
    content = await db.site_content.find_one({"section": section}, {"_id": 0})
    if not content:
        return {"section": section, "content": {}}
    return content

@router.put("/site/{section}")
async def update_site_content(section: str, content_data: dict, current_admin: str = Depends(get_current_admin)):
    """Update site content for a specific section (admin only)"""
    await check_permission(current_admin, 'manage_content')
    
    await db.site_content.update_one(
        {"section": section},
        {"$set": {
            "section": section,
            "content": content_data,
            "updated_at": datetime.utcnow().isoformat(),
            "updated_by": current_admin
        }},
        upsert=True
    )
    return {"success": True, "section": section, "content": content_data}
