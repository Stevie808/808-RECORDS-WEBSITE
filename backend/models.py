from pydantic import BaseModel, Field, EmailStr
from typing import Optional
from datetime import datetime
import uuid

class Admin(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    password: str
    role: str = "admin"  # "head_admin" or "admin"
    permissions: dict = Field(default_factory=lambda: {
        "manage_artists": True,
        "manage_releases": True,
        "manage_content": True,
        "manage_submissions": True,
        "manage_admins": False  # Only head_admin can do this
    })
    created_at: datetime = Field(default_factory=datetime.utcnow)
    created_by: Optional[str] = None

class AdminLogin(BaseModel):
    email: EmailStr
    password: str

class AdminCreate(BaseModel):
    email: EmailStr
    password: str
    role: str = "admin"
    permissions: Optional[dict] = None

class AdminUpdate(BaseModel):
    role: Optional[str] = None
    permissions: Optional[dict] = None

class AdminCredentialUpdate(BaseModel):
    new_email: Optional[str] = None
    new_password: Optional[str] = None

class PasswordChange(BaseModel):
    current_password: str
    new_password: str

class AdminPasswordChange(BaseModel):
    new_password: str

class AdminResponse(BaseModel):
    id: str
    email: EmailStr
    role: str
    permissions: dict
    created_at: datetime
    created_by: Optional[str]

class TokenResponse(BaseModel):
    token: str
    email: str

class SiteContent(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    section: str
    content: dict
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    updated_by: str

# Artist models
class Artist(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    genre: str
    popularityScore: int
    image: str
    verified: bool = True
    featured: bool = False
    instagram: Optional[str] = None
    spotify: Optional[str] = None
    latestRelease: Optional[str] = None
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class ArtistCreate(BaseModel):
    name: str
    genre: str
    popularityScore: int
    image: str
    verified: bool = True
    featured: bool = False
    instagram: Optional[str] = None
    spotify: Optional[str] = None
    latestRelease: Optional[str] = None

class ArtistUpdate(BaseModel):
    name: Optional[str] = None
    genre: Optional[str] = None
    popularityScore: Optional[int] = None
    image: Optional[str] = None
    verified: Optional[bool] = None
    featured: Optional[bool] = None
    instagram: Optional[str] = None
    spotify: Optional[str] = None
    latestRelease: Optional[str] = None

# Release models
class Release(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    artist: str
    coverArt: str
    releaseDate: str
    type: str  # Album, Single, EP
    tracks: int
    duration: str
    featured: bool = False
    spotifyUrl: Optional[str] = None
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class ReleaseCreate(BaseModel):
    title: str
    artist: str
    coverArt: str
    releaseDate: str
    type: str
    tracks: int
    duration: str
    featured: bool = False
    spotifyUrl: Optional[str] = None

class ReleaseUpdate(BaseModel):
    title: Optional[str] = None
    artist: Optional[str] = None
    coverArt: Optional[str] = None
    releaseDate: Optional[str] = None
    type: Optional[str] = None
    tracks: Optional[int] = None
    duration: Optional[str] = None
    featured: Optional[bool] = None
    spotifyUrl: Optional[str] = None

# Submission models
class Submission(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: EmailStr
    artistName: Optional[str] = None
    message: str
    demoLink: Optional[str] = None
    status: str = "new"  # new, reviewed, archived
    created_at: datetime = Field(default_factory=datetime.utcnow)
    reviewed_by: Optional[str] = None
    notes: Optional[str] = None

class SubmissionCreate(BaseModel):
    name: str
    email: EmailStr
    artistName: Optional[str] = None
    message: str
    demoLink: Optional[str] = None

class SubmissionUpdate(BaseModel):
    status: Optional[str] = None
    notes: Optional[str] = None
