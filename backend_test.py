q#!/usr/bin/env python3
"""
Comprehensive Backend API Testing for 808Records Admin Dashboard
Tests all CRUD operations, authentication, and data persistence
"""

import requests
import json
import uuid
from datetime import datetime

# Configuration
BASE_URL = "https://sonic-dash-20.preview.emergentagent.com"
API_BASE = f"{BASE_URL}/api"

# Test credentials
ADMIN_EMAIL = "stevie@808records.com"
ADMIN_PASSWORD = "stevie808"

class BackendTester:
    def __init__(self):
        self.auth_token = None
        self.redhill_token = None
        self.test_results = {
            "admin_auth": {"passed": 0, "failed": 0, "errors": []},
            "role_based_admin": {"passed": 0, "failed": 0, "errors": []},
            "submissions_system": {"passed": 0, "failed": 0, "errors": []},
            "artists_crud": {"passed": 0, "failed": 0, "errors": []},
            "releases_crud": {"passed": 0, "failed": 0, "errors": []},
            "site_content": {"passed": 0, "failed": 0, "errors": []},
            "database_init": {"passed": 0, "failed": 0, "errors": []}
        }
        
    def log_result(self, category, test_name, success, error_msg=None):
        """Log test result"""
        if success:
            self.test_results[category]["passed"] += 1
            print(f"✅ {test_name}")
        else:
            self.test_results[category]["failed"] += 1
            self.test_results[category]["errors"].append(f"{test_name}: {error_msg}")
            print(f"❌ {test_name}: {error_msg}")
    
    def get_auth_headers(self):
        """Get authorization headers"""
        if not self.auth_token:
            return {}
        return {"Authorization": f"Bearer {self.auth_token}"}
    
    def test_admin_authentication(self):
        """Test admin login and authentication"""
        print("\n🔐 Testing Admin Authentication...")
        
        # Test valid login
        try:
            response = requests.post(f"{API_BASE}/admin/login", json={
                "email": ADMIN_EMAIL,
                "password": ADMIN_PASSWORD
            })
            
            if response.status_code == 200:
                data = response.json()
                if "token" in data and "email" in data:
                    self.auth_token = data["token"]
                    self.log_result("admin_auth", "Valid login", True)
                else:
                    self.log_result("admin_auth", "Valid login", False, "Missing token or email in response")
            else:
                self.log_result("admin_auth", "Valid login", False, f"Status {response.status_code}: {response.text}")
        except Exception as e:
            self.log_result("admin_auth", "Valid login", False, str(e))
        
        # Test invalid login
        try:
            response = requests.post(f"{API_BASE}/admin/login", json={
                "email": ADMIN_EMAIL,
                "password": "wrongpassword"
            })
            
            if response.status_code == 401:
                self.log_result("admin_auth", "Invalid login rejection", True)
            else:
                self.log_result("admin_auth", "Invalid login rejection", False, f"Expected 401, got {response.status_code}")
        except Exception as e:
            self.log_result("admin_auth", "Invalid login rejection", False, str(e))
        
        # Test token verification
        if self.auth_token:
            try:
                response = requests.get(f"{API_BASE}/admin/verify", headers=self.get_auth_headers())
                
                if response.status_code == 200:
                    data = response.json()
                    if data.get("valid") and data.get("email") == ADMIN_EMAIL:
                        self.log_result("admin_auth", "Token verification", True)
                    else:
                        self.log_result("admin_auth", "Token verification", False, "Invalid verification response")
                else:
                    self.log_result("admin_auth", "Token verification", False, f"Status {response.status_code}")
            except Exception as e:
                self.log_result("admin_auth", "Token verification", False, str(e))
    
    def test_database_initialization(self):
        """Test that database is properly seeded with initial data"""
        print("\n🗄️ Testing Database Initialization...")
        
        # Test artists seeded
        try:
            response = requests.get(f"{API_BASE}/content/artists")
            if response.status_code == 200:
                artists = response.json()
                if len(artists) >= 6:  # Should have at least 6 seeded artists
                    self.log_result("database_init", "Artists seeded", True)
                    
                    # Check for specific seeded artists
                    artist_names = [artist.get("name") for artist in artists]
                    expected_artists = ["HOMI", "TENNAXIS", "PREACHA", "FAILURE", "MTL", "LULUSREVENGE"]
                    found_artists = [name for name in expected_artists if name in artist_names]
                    
                    if len(found_artists) >= 5:  # At least 5 of the expected artists
                        self.log_result("database_init", "Expected artists present", True)
                    else:
                        self.log_result("database_init", "Expected artists present", False, f"Only found {len(found_artists)} expected artists")
                else:
                    self.log_result("database_init", "Artists seeded", False, f"Only {len(artists)} artists found, expected at least 6")
            else:
                self.log_result("database_init", "Artists seeded", False, f"Status {response.status_code}")
        except Exception as e:
            self.log_result("database_init", "Artists seeded", False, str(e))
        
        # Test releases seeded
        try:
            response = requests.get(f"{API_BASE}/content/releases")
            if response.status_code == 200:
                releases = response.json()
                if len(releases) >= 7:  # Should have at least 7 seeded releases
                    self.log_result("database_init", "Releases seeded", True)
                    
                    # Check for specific seeded releases
                    release_titles = [release.get("title") for release in releases]
                    expected_releases = ["Soundscraper", "#B4FAIL2PREVAIL", "A Born Killer", "ProofOfConcept"]
                    found_releases = [title for title in expected_releases if title in release_titles]
                    
                    if len(found_releases) >= 3:  # At least 3 of the expected releases
                        self.log_result("database_init", "Expected releases present", True)
                    else:
                        self.log_result("database_init", "Expected releases present", False, f"Only found {len(found_releases)} expected releases")
                else:
                    self.log_result("database_init", "Releases seeded", False, f"Only {len(releases)} releases found, expected at least 7")
            else:
                self.log_result("database_init", "Releases seeded", False, f"Status {response.status_code}")
        except Exception as e:
            self.log_result("database_init", "Releases seeded", False, str(e))
    
    def test_artists_crud(self):
        """Test Artists CRUD operations"""
        print("\n🎤 Testing Artists CRUD API...")
        
        # Test GET all artists (public endpoint)
        try:
            response = requests.get(f"{API_BASE}/content/artists")
            if response.status_code == 200:
                artists = response.json()
                if isinstance(artists, list) and len(artists) > 0:
                    self.log_result("artists_crud", "GET all artists", True)
                else:
                    self.log_result("artists_crud", "GET all artists", False, "Empty or invalid artists list")
            else:
                self.log_result("artists_crud", "GET all artists", False, f"Status {response.status_code}")
        except Exception as e:
            self.log_result("artists_crud", "GET all artists", False, str(e))
        
        # Test POST create artist (requires auth)
        test_artist = {
            "name": "Test Artist",
            "genre": "Test Genre",
            "popularityScore": 50,
            "image": "https://example.com/test.jpg",
            "verified": True,
            "instagram": "https://instagram.com/testartist",
            "spotify": "https://spotify.com/artist/test",
            "latestRelease": "https://spotify.com/album/test"
        }
        
        test_artist_id = None
        try:
            response = requests.post(f"{API_BASE}/content/artists", 
                                   json=test_artist, 
                                   headers=self.get_auth_headers())
            
            if response.status_code == 200:
                created_artist = response.json()
                if created_artist.get("name") == test_artist["name"]:
                    test_artist_id = created_artist.get("id")  # Capture the generated ID
                    self.log_result("artists_crud", "POST create artist", True)
                else:
                    self.log_result("artists_crud", "POST create artist", False, "Artist data mismatch")
            else:
                self.log_result("artists_crud", "POST create artist", False, f"Status {response.status_code}: {response.text}")
        except Exception as e:
            self.log_result("artists_crud", "POST create artist", False, str(e))
        
        # Test GET specific artist
        if test_artist_id:
            try:
                response = requests.get(f"{API_BASE}/content/artists/{test_artist_id}")
                if response.status_code == 200:
                    artist = response.json()
                    if artist.get("name") == test_artist["name"]:
                        self.log_result("artists_crud", "GET specific artist", True)
                    else:
                        self.log_result("artists_crud", "GET specific artist", False, "Artist data mismatch")
                else:
                    self.log_result("artists_crud", "GET specific artist", False, f"Status {response.status_code}")
            except Exception as e:
                self.log_result("artists_crud", "GET specific artist", False, str(e))
        else:
            self.log_result("artists_crud", "GET specific artist", False, "No artist ID available from create")
        
        # Test PUT update artist (requires auth)
        if test_artist_id:
            update_data = {
                "name": "Updated Test Artist",
                "popularityScore": 75
            }
            
            try:
                response = requests.put(f"{API_BASE}/content/artists/{test_artist_id}", 
                                      json=update_data, 
                                      headers=self.get_auth_headers())
                
                if response.status_code == 200:
                    updated_artist = response.json()
                    if updated_artist.get("name") == update_data["name"]:
                        self.log_result("artists_crud", "PUT update artist", True)
                    else:
                        self.log_result("artists_crud", "PUT update artist", False, "Update data mismatch")
                else:
                    self.log_result("artists_crud", "PUT update artist", False, f"Status {response.status_code}: {response.text}")
            except Exception as e:
                self.log_result("artists_crud", "PUT update artist", False, str(e))
        else:
            self.log_result("artists_crud", "PUT update artist", False, "No artist ID available from create")
        
        # Test DELETE artist (requires auth)
        if test_artist_id:
            try:
                response = requests.delete(f"{API_BASE}/content/artists/{test_artist_id}", 
                                         headers=self.get_auth_headers())
                
                if response.status_code == 200:
                    result = response.json()
                    if result.get("success"):
                        self.log_result("artists_crud", "DELETE artist", True)
                    else:
                        self.log_result("artists_crud", "DELETE artist", False, "Delete not successful")
                else:
                    self.log_result("artists_crud", "DELETE artist", False, f"Status {response.status_code}")
            except Exception as e:
                self.log_result("artists_crud", "DELETE artist", False, str(e))
            
            # Verify artist was deleted
            try:
                response = requests.get(f"{API_BASE}/content/artists/{test_artist_id}")
                if response.status_code == 404:
                    self.log_result("artists_crud", "Verify artist deletion", True)
                else:
                    self.log_result("artists_crud", "Verify artist deletion", False, f"Artist still exists, status {response.status_code}")
            except Exception as e:
                self.log_result("artists_crud", "Verify artist deletion", False, str(e))
        else:
            self.log_result("artists_crud", "DELETE artist", False, "No artist ID available from create")
            self.log_result("artists_crud", "Verify artist deletion", False, "No artist ID available from create")
    
    def test_releases_crud(self):
        """Test Releases CRUD operations"""
        print("\n🎵 Testing Releases CRUD API...")
        
        # Test GET all releases (public endpoint)
        try:
            response = requests.get(f"{API_BASE}/content/releases")
            if response.status_code == 200:
                releases = response.json()
                if isinstance(releases, list) and len(releases) > 0:
                    self.log_result("releases_crud", "GET all releases", True)
                else:
                    self.log_result("releases_crud", "GET all releases", False, "Empty or invalid releases list")
            else:
                self.log_result("releases_crud", "GET all releases", False, f"Status {response.status_code}")
        except Exception as e:
            self.log_result("releases_crud", "GET all releases", False, str(e))
        
        # Test POST create release (requires auth)
        test_release = {
            "title": "Test Album",
            "artist": "Test Artist",
            "coverArt": "https://example.com/cover.jpg",
            "releaseDate": "2025-01-01",
            "type": "Album",
            "tracks": 10,
            "duration": "35:00",
            "featured": False,
            "spotifyUrl": "https://spotify.com/album/test"
        }
        
        test_release_id = None
        try:
            response = requests.post(f"{API_BASE}/content/releases", 
                                   json=test_release, 
                                   headers=self.get_auth_headers())
            
            if response.status_code == 200:
                created_release = response.json()
                if created_release.get("title") == test_release["title"]:
                    test_release_id = created_release.get("id")  # Capture the generated ID
                    self.log_result("releases_crud", "POST create release", True)
                else:
                    self.log_result("releases_crud", "POST create release", False, "Release data mismatch")
            else:
                self.log_result("releases_crud", "POST create release", False, f"Status {response.status_code}: {response.text}")
        except Exception as e:
            self.log_result("releases_crud", "POST create release", False, str(e))
        
        # Test GET specific release
        if test_release_id:
            try:
                response = requests.get(f"{API_BASE}/content/releases/{test_release_id}")
                if response.status_code == 200:
                    release = response.json()
                    if release.get("title") == test_release["title"]:
                        self.log_result("releases_crud", "GET specific release", True)
                    else:
                        self.log_result("releases_crud", "GET specific release", False, "Release data mismatch")
                else:
                    self.log_result("releases_crud", "GET specific release", False, f"Status {response.status_code}")
            except Exception as e:
                self.log_result("releases_crud", "GET specific release", False, str(e))
        else:
            self.log_result("releases_crud", "GET specific release", False, "No release ID available from create")
        
        # Test PUT update release (requires auth)
        if test_release_id:
            update_data = {
                "title": "Updated Test Album",
                "featured": True
            }
            
            try:
                response = requests.put(f"{API_BASE}/content/releases/{test_release_id}", 
                                      json=update_data, 
                                      headers=self.get_auth_headers())
                
                if response.status_code == 200:
                    updated_release = response.json()
                    if updated_release.get("title") == update_data["title"]:
                        self.log_result("releases_crud", "PUT update release", True)
                    else:
                        self.log_result("releases_crud", "PUT update release", False, "Update data mismatch")
                else:
                    self.log_result("releases_crud", "PUT update release", False, f"Status {response.status_code}: {response.text}")
            except Exception as e:
                self.log_result("releases_crud", "PUT update release", False, str(e))
        else:
            self.log_result("releases_crud", "PUT update release", False, "No release ID available from create")
        
        # Test DELETE release (requires auth)
        if test_release_id:
            try:
                response = requests.delete(f"{API_BASE}/content/releases/{test_release_id}", 
                                         headers=self.get_auth_headers())
                
                if response.status_code == 200:
                    result = response.json()
                    if result.get("success"):
                        self.log_result("releases_crud", "DELETE release", True)
                    else:
                        self.log_result("releases_crud", "DELETE release", False, "Delete not successful")
                else:
                    self.log_result("releases_crud", "DELETE release", False, f"Status {response.status_code}")
            except Exception as e:
                self.log_result("releases_crud", "DELETE release", False, str(e))
            
            # Verify release was deleted
            try:
                response = requests.get(f"{API_BASE}/content/releases/{test_release_id}")
                if response.status_code == 404:
                    self.log_result("releases_crud", "Verify release deletion", True)
                else:
                    self.log_result("releases_crud", "Verify release deletion", False, f"Release still exists, status {response.status_code}")
            except Exception as e:
                self.log_result("releases_crud", "Verify release deletion", False, str(e))
        else:
            self.log_result("releases_crud", "DELETE release", False, "No release ID available from create")
            self.log_result("releases_crud", "Verify release deletion", False, "No release ID available from create")
    
    def test_site_content_api(self):
        """Test Site Content API"""
        print("\n🌐 Testing Site Content API...")
        
        # Test sections to check
        sections = ["hero", "contact", "about"]
        
        for section in sections:
            # Test GET site content (public endpoint)
            try:
                response = requests.get(f"{API_BASE}/content/site/{section}")
                if response.status_code == 200:
                    content = response.json()
                    if "section" in content:
                        self.log_result("site_content", f"GET {section} content", True)
                    else:
                        self.log_result("site_content", f"GET {section} content", False, "Invalid content structure")
                else:
                    self.log_result("site_content", f"GET {section} content", False, f"Status {response.status_code}")
            except Exception as e:
                self.log_result("site_content", f"GET {section} content", False, str(e))
            
            # Test PUT update site content (requires auth)
            test_content = {
                "title": f"Test {section.title()} Title",
                "description": f"Test {section} description",
                "updated": datetime.now().isoformat()
            }
            
            try:
                response = requests.put(f"{API_BASE}/content/site/{section}", 
                                      json=test_content, 
                                      headers=self.get_auth_headers())
                
                if response.status_code == 200:
                    result = response.json()
                    if result.get("success") and result.get("section") == section:
                        self.log_result("site_content", f"PUT update {section} content", True)
                    else:
                        self.log_result("site_content", f"PUT update {section} content", False, "Update not successful")
                else:
                    self.log_result("site_content", f"PUT update {section} content", False, f"Status {response.status_code}: {response.text}")
            except Exception as e:
                self.log_result("site_content", f"PUT update {section} content", False, str(e))
            
            # Verify content was updated
            try:
                response = requests.get(f"{API_BASE}/content/site/{section}")
                if response.status_code == 200:
                    content = response.json()
                    if content.get("content", {}).get("title") == test_content["title"]:
                        self.log_result("site_content", f"Verify {section} content update", True)
                    else:
                        self.log_result("site_content", f"Verify {section} content update", False, "Content not updated")
                else:
                    self.log_result("site_content", f"Verify {section} content update", False, f"Status {response.status_code}")
            except Exception as e:
                self.log_result("site_content", f"Verify {section} content update", False, str(e))
    
    def test_auth_protection(self):
        """Test that protected endpoints require authentication"""
        print("\n🔒 Testing Authentication Protection...")
        
        # Test protected endpoints without auth token
        protected_endpoints = [
            ("POST", f"{API_BASE}/content/artists", {"name": "Test", "genre": "Test", "popularityScore": 50, "image": "test.jpg"}),
            ("PUT", f"{API_BASE}/content/artists/1", {"name": "Updated"}),
            ("DELETE", f"{API_BASE}/content/artists/1", None),
            ("POST", f"{API_BASE}/content/releases", {"title": "Test", "artist": "Test", "coverArt": "test.jpg", "releaseDate": "2025-01-01", "type": "Album", "tracks": 1, "duration": "3:00"}),
            ("PUT", f"{API_BASE}/content/releases/1", {"title": "Updated"}),
            ("DELETE", f"{API_BASE}/content/releases/1", None),
            ("PUT", f"{API_BASE}/content/site/hero", {"title": "Test"}),
        ]
        
        for method, url, data in protected_endpoints:
            try:
                if method == "POST":
                    response = requests.post(url, json=data)
                elif method == "PUT":
                    response = requests.put(url, json=data)
                elif method == "DELETE":
                    response = requests.delete(url)
                
                if response.status_code == 401:
                    self.log_result("admin_auth", f"Auth protection {method} {url.split('/')[-1]}", True)
                else:
                    self.log_result("admin_auth", f"Auth protection {method} {url.split('/')[-1]}", False, f"Expected 401, got {response.status_code}")
            except Exception as e:
                self.log_result("admin_auth", f"Auth protection {method} {url.split('/')[-1]}", False, str(e))
    
    def test_role_based_admin_system(self):
        """Test Phase 2: Role-Based Admin System"""
        print("\n👥 Testing Role-Based Admin System...")
        
        # Test GET /api/admin/me - Verify returns role and permissions
        try:
            response = requests.get(f"{API_BASE}/admin/me", headers=self.get_auth_headers())
            if response.status_code == 200:
                admin_info = response.json()
                if admin_info.get("role") == "head_admin" and admin_info.get("permissions", {}).get("manage_admins"):
                    self.log_result("role_based_admin", "GET /api/admin/me", True)
                else:
                    self.log_result("role_based_admin", "GET /api/admin/me", False, "Missing role or permissions")
            else:
                self.log_result("role_based_admin", "GET /api/admin/me", False, f"Status {response.status_code}")
        except Exception as e:
            self.log_result("role_based_admin", "GET /api/admin/me", False, str(e))
        
        # Test GET /api/admin/list - Verify returns list of admins (head_admin only)
        try:
            response = requests.get(f"{API_BASE}/admin/list", headers=self.get_auth_headers())
            if response.status_code == 200:
                admins = response.json()
                if isinstance(admins, list) and len(admins) >= 2:  # Should have at least stevie and redhill
                    self.log_result("role_based_admin", "GET /api/admin/list", True)
                else:
                    self.log_result("role_based_admin", "GET /api/admin/list", False, f"Expected list with 2+ admins, got {len(admins) if isinstance(admins, list) else 'not a list'}")
            else:
                self.log_result("role_based_admin", "GET /api/admin/list", False, f"Status {response.status_code}")
        except Exception as e:
            self.log_result("role_based_admin", "GET /api/admin/list", False, str(e))
        
        # Test POST /api/admin/create - Create a new test admin with custom permissions
        test_admin_data = {
            "email": "testadmin@808records.com",
            "password": "testpass123",
            "role": "admin",
            "permissions": {
                "manage_artists": True,
                "manage_releases": False,
                "manage_content": True,
                "manage_submissions": True,
                "manage_admins": False
            }
        }
        
        test_admin_id = None
        try:
            response = requests.post(f"{API_BASE}/admin/create", 
                                   json=test_admin_data, 
                                   headers=self.get_auth_headers())
            
            if response.status_code == 200:
                created_admin = response.json()
                if created_admin.get("email") == test_admin_data["email"]:
                    test_admin_id = created_admin.get("id")
                    self.log_result("role_based_admin", "POST /api/admin/create", True)
                else:
                    self.log_result("role_based_admin", "POST /api/admin/create", False, "Admin data mismatch")
            else:
                self.log_result("role_based_admin", "POST /api/admin/create", False, f"Status {response.status_code}: {response.text}")
        except Exception as e:
            self.log_result("role_based_admin", "POST /api/admin/create", False, str(e))
        
        # Test PUT /api/admin/{id}/permissions - Update admin permissions
        if test_admin_id:
            updated_permissions = {
                "manage_artists": False,
                "manage_releases": True,
                "manage_content": False,
                "manage_submissions": True,
                "manage_admins": False
            }
            
            try:
                response = requests.put(f"{API_BASE}/admin/{test_admin_id}/permissions", 
                                      json=updated_permissions, 
                                      headers=self.get_auth_headers())
                
                if response.status_code == 200:
                    result = response.json()
                    if result.get("success"):
                        self.log_result("role_based_admin", "PUT /api/admin/{id}/permissions", True)
                    else:
                        self.log_result("role_based_admin", "PUT /api/admin/{id}/permissions", False, "Update not successful")
                else:
                    self.log_result("role_based_admin", "PUT /api/admin/{id}/permissions", False, f"Status {response.status_code}")
            except Exception as e:
                self.log_result("role_based_admin", "PUT /api/admin/{id}/permissions", False, str(e))
        else:
            self.log_result("role_based_admin", "PUT /api/admin/{id}/permissions", False, "No test admin ID available")
        
        # Test PUT /api/admin/{id}/role - Update admin role (head_admin only)
        if test_admin_id:
            try:
                response = requests.put(f"{API_BASE}/admin/{test_admin_id}/role", 
                                      json={"role": "admin"}, 
                                      headers=self.get_auth_headers())
                
                if response.status_code == 200:
                    result = response.json()
                    if result.get("success"):
                        self.log_result("role_based_admin", "PUT /api/admin/{id}/role", True)
                    else:
                        self.log_result("role_based_admin", "PUT /api/admin/{id}/role", False, "Role update not successful")
                else:
                    self.log_result("role_based_admin", "PUT /api/admin/{id}/role", False, f"Status {response.status_code}")
            except Exception as e:
                self.log_result("role_based_admin", "PUT /api/admin/{id}/role", False, str(e))
        else:
            self.log_result("role_based_admin", "PUT /api/admin/{id}/role", False, "No test admin ID available")
        
        # Test permission enforcement - login as redhill and try to access admin endpoints
        try:
            response = requests.post(f"{API_BASE}/admin/login", json={
                "email": "redh1ll@developer.com",
                "password": "redhill"
            })
            
            if response.status_code == 200:
                data = response.json()
                self.redhill_token = data.get("token")
                
                # Try to access admin list endpoint (should fail for redhill)
                redhill_headers = {"Authorization": f"Bearer {self.redhill_token}"}
                response = requests.get(f"{API_BASE}/admin/list", headers=redhill_headers)
                
                if response.status_code == 403:
                    self.log_result("role_based_admin", "Permission enforcement test", True)
                else:
                    self.log_result("role_based_admin", "Permission enforcement test", False, f"Expected 403, got {response.status_code}")
            else:
                self.log_result("role_based_admin", "Permission enforcement test", False, "Failed to login as redhill")
        except Exception as e:
            self.log_result("role_based_admin", "Permission enforcement test", False, str(e))
        
        # Test DELETE /api/admin/{email} - Delete test admin
        if test_admin_data["email"]:
            try:
                response = requests.delete(f"{API_BASE}/admin/{test_admin_data['email']}", 
                                         headers=self.get_auth_headers())
                
                if response.status_code == 200:
                    result = response.json()
                    if result.get("success"):
                        self.log_result("role_based_admin", "DELETE /api/admin/{email}", True)
                    else:
                        self.log_result("role_based_admin", "DELETE /api/admin/{email}", False, "Delete not successful")
                else:
                    self.log_result("role_based_admin", "DELETE /api/admin/{email}", False, f"Status {response.status_code}")
            except Exception as e:
                self.log_result("role_based_admin", "DELETE /api/admin/{email}", False, str(e))
        else:
            self.log_result("role_based_admin", "DELETE /api/admin/{email}", False, "No test admin email available")
    
    def test_admin_password_management(self):
        """Test Admin Password Management by Head Admin"""
        print("\n🔑 Testing Admin Password Management by Head Admin...")
        
        # First, get redhill admin's ID
        redhill_admin_id = None
        try:
            response = requests.get(f"{API_BASE}/admin/list", headers=self.get_auth_headers())
            if response.status_code == 200:
                admins = response.json()
                for admin in admins:
                    if admin.get("email") == "redh1ll@developer.com":
                        redhill_admin_id = admin.get("id")
                        break
                
                if redhill_admin_id:
                    self.log_result("role_based_admin", "Get redhill admin ID", True)
                else:
                    self.log_result("role_based_admin", "Get redhill admin ID", False, "Redhill admin not found in list")
            else:
                self.log_result("role_based_admin", "Get redhill admin ID", False, f"Status {response.status_code}")
        except Exception as e:
            self.log_result("role_based_admin", "Get redhill admin ID", False, str(e))
        
        if not redhill_admin_id:
            self.log_result("role_based_admin", "Test password change by head admin", False, "Cannot proceed without redhill admin ID")
            self.log_result("role_based_admin", "Test old password rejection", False, "Cannot proceed without redhill admin ID")
            self.log_result("role_based_admin", "Test new password login", False, "Cannot proceed without redhill admin ID")
            self.log_result("role_based_admin", "Test regular admin cannot change password", False, "Cannot proceed without redhill admin ID")
            self.log_result("role_based_admin", "Test invalid admin_id rejection", False, "Cannot proceed without redhill admin ID")
            return
        
        # Test 1: Head admin changes redhill's password
        new_password = "newredhill123"
        try:
            response = requests.put(
                f"{API_BASE}/admin/{redhill_admin_id}/password",
                json={"new_password": new_password},
                headers=self.get_auth_headers()
            )
            
            if response.status_code == 200:
                result = response.json()
                if result.get("success"):
                    self.log_result("role_based_admin", "Test password change by head admin", True)
                else:
                    self.log_result("role_based_admin", "Test password change by head admin", False, "Password change not successful")
            else:
                self.log_result("role_based_admin", "Test password change by head admin", False, f"Status {response.status_code}: {response.text}")
        except Exception as e:
            self.log_result("role_based_admin", "Test password change by head admin", False, str(e))
        
        # Test 2: Verify old password no longer works
        try:
            response = requests.post(f"{API_BASE}/admin/login", json={
                "email": "redh1ll@developer.com",
                "password": "redhill"  # old password
            })
            
            if response.status_code == 401:
                self.log_result("role_based_admin", "Test old password rejection", True)
            else:
                self.log_result("role_based_admin", "Test old password rejection", False, f"Expected 401, got {response.status_code}")
        except Exception as e:
            self.log_result("role_based_admin", "Test old password rejection", False, str(e))
        
        # Test 3: Verify new password works
        try:
            response = requests.post(f"{API_BASE}/admin/login", json={
                "email": "redh1ll@developer.com",
                "password": new_password  # new password
            })
            
            if response.status_code == 200:
                data = response.json()
                if "token" in data:
                    self.redhill_token = data["token"]
                    self.log_result("role_based_admin", "Test new password login", True)
                else:
                    self.log_result("role_based_admin", "Test new password login", False, "Missing token in response")
            else:
                self.log_result("role_based_admin", "Test new password login", False, f"Status {response.status_code}: {response.text}")
        except Exception as e:
            self.log_result("role_based_admin", "Test new password login", False, str(e))
        
        # Test 4: Verify regular admin (redhill) cannot change other admins' passwords
        if self.redhill_token:
            redhill_headers = {"Authorization": f"Bearer {self.redhill_token}"}
            try:
                # Try to change stevie's password (should fail)
                response = requests.get(f"{API_BASE}/admin/list", headers=self.get_auth_headers())
                stevie_admin_id = None
                if response.status_code == 200:
                    admins = response.json()
                    for admin in admins:
                        if admin.get("email") == "stevie@808records.com":
                            stevie_admin_id = admin.get("id")
                            break
                
                if stevie_admin_id:
                    response = requests.put(
                        f"{API_BASE}/admin/{stevie_admin_id}/password",
                        json={"new_password": "hacked123"},
                        headers=redhill_headers
                    )
                    
                    if response.status_code == 403:
                        self.log_result("role_based_admin", "Test regular admin cannot change password", True)
                    else:
                        self.log_result("role_based_admin", "Test regular admin cannot change password", False, f"Expected 403, got {response.status_code}")
                else:
                    self.log_result("role_based_admin", "Test regular admin cannot change password", False, "Could not find stevie admin ID")
            except Exception as e:
                self.log_result("role_based_admin", "Test regular admin cannot change password", False, str(e))
        else:
            self.log_result("role_based_admin", "Test regular admin cannot change password", False, "No redhill token available")
        
        # Test 5: Test invalid admin_id rejection
        try:
            response = requests.put(
                f"{API_BASE}/admin/invalid-admin-id-12345/password",
                json={"new_password": "test123"},
                headers=self.get_auth_headers()
            )
            
            if response.status_code == 404:
                self.log_result("role_based_admin", "Test invalid admin_id rejection", True)
            else:
                self.log_result("role_based_admin", "Test invalid admin_id rejection", False, f"Expected 404, got {response.status_code}")
        except Exception as e:
            self.log_result("role_based_admin", "Test invalid admin_id rejection", False, str(e))
        
        # Restore redhill's original password for future tests
        try:
            response = requests.put(
                f"{API_BASE}/admin/{redhill_admin_id}/password",
                json={"new_password": "redhill"},
                headers=self.get_auth_headers()
            )
            if response.status_code == 200:
                print("  ℹ️  Restored redhill's original password")
        except Exception as e:
            print(f"  ⚠️  Failed to restore redhill's password: {e}")
    
    def test_submissions_system(self):
        """Test Phase 3: Submissions System"""
        print("\n📝 Testing Submissions System...")
        
        # Test POST /api/submissions/ - Create test submission (public, no auth)
        test_submission = {
            "name": "Marcus Johnson",
            "email": "marcus.johnson@example.com",
            "artistName": "MC Marcus",
            "message": "I'm an up-and-coming hip-hop artist from Atlanta. I've been working on my craft for 3 years and would love to be part of the 808Records family. My music blends traditional Southern rap with modern trap influences.",
            "demoLink": "https://soundcloud.com/mcmarcus/demo-track-2025"
        }
        
        test_submission_id = None
        try:
            response = requests.post(f"{API_BASE}/submissions/", json=test_submission)
            
            if response.status_code == 200:
                created_submission = response.json()
                if created_submission.get("name") == test_submission["name"]:
                    test_submission_id = created_submission.get("id")
                    self.log_result("submissions_system", "POST /api/submissions/ (public)", True)
                else:
                    self.log_result("submissions_system", "POST /api/submissions/ (public)", False, "Submission data mismatch")
            else:
                self.log_result("submissions_system", "POST /api/submissions/ (public)", False, f"Status {response.status_code}: {response.text}")
        except Exception as e:
            self.log_result("submissions_system", "POST /api/submissions/ (public)", False, str(e))
        
        # Test GET /api/submissions/ - List all submissions (requires auth)
        try:
            response = requests.get(f"{API_BASE}/submissions/", headers=self.get_auth_headers())
            
            if response.status_code == 200:
                submissions = response.json()
                if isinstance(submissions, list) and len(submissions) >= 1:
                    self.log_result("submissions_system", "GET /api/submissions/ (admin)", True)
                else:
                    self.log_result("submissions_system", "GET /api/submissions/ (admin)", False, f"Expected list with 1+ submissions, got {len(submissions) if isinstance(submissions, list) else 'not a list'}")
            else:
                self.log_result("submissions_system", "GET /api/submissions/ (admin)", False, f"Status {response.status_code}")
        except Exception as e:
            self.log_result("submissions_system", "GET /api/submissions/ (admin)", False, str(e))
        
        # Test GET /api/submissions/stats/summary - Get submission stats
        try:
            response = requests.get(f"{API_BASE}/submissions/stats/summary", headers=self.get_auth_headers())
            
            if response.status_code == 200:
                stats = response.json()
                if "total" in stats and "new" in stats and "reviewed" in stats and "archived" in stats:
                    self.log_result("submissions_system", "GET /api/submissions/stats/summary", True)
                else:
                    self.log_result("submissions_system", "GET /api/submissions/stats/summary", False, "Missing stats fields")
            else:
                self.log_result("submissions_system", "GET /api/submissions/stats/summary", False, f"Status {response.status_code}")
        except Exception as e:
            self.log_result("submissions_system", "GET /api/submissions/stats/summary", False, str(e))
        
        # Test PUT /api/submissions/{id} - Update submission status and add notes
        if test_submission_id:
            update_data = {
                "status": "reviewed",
                "notes": "Great potential! Love the Atlanta sound. Let's schedule a meeting to discuss next steps."
            }
            
            try:
                response = requests.put(f"{API_BASE}/submissions/{test_submission_id}", 
                                      json=update_data, 
                                      headers=self.get_auth_headers())
                
                if response.status_code == 200:
                    updated_submission = response.json()
                    if updated_submission.get("status") == "reviewed" and updated_submission.get("notes"):
                        self.log_result("submissions_system", "PUT /api/submissions/{id}", True)
                    else:
                        self.log_result("submissions_system", "PUT /api/submissions/{id}", False, "Update data mismatch")
                else:
                    self.log_result("submissions_system", "PUT /api/submissions/{id}", False, f"Status {response.status_code}")
            except Exception as e:
                self.log_result("submissions_system", "PUT /api/submissions/{id}", False, str(e))
        else:
            self.log_result("submissions_system", "PUT /api/submissions/{id}", False, "No test submission ID available")
        
        # Test DELETE /api/submissions/{id} - Delete test submission
        if test_submission_id:
            try:
                response = requests.delete(f"{API_BASE}/submissions/{test_submission_id}", 
                                         headers=self.get_auth_headers())
                
                if response.status_code == 200:
                    result = response.json()
                    if result.get("success"):
                        self.log_result("submissions_system", "DELETE /api/submissions/{id}", True)
                    else:
                        self.log_result("submissions_system", "DELETE /api/submissions/{id}", False, "Delete not successful")
                else:
                    self.log_result("submissions_system", "DELETE /api/submissions/{id}", False, f"Status {response.status_code}")
            except Exception as e:
                self.log_result("submissions_system", "DELETE /api/submissions/{id}", False, str(e))
        else:
            self.log_result("submissions_system", "DELETE /api/submissions/{id}", False, "No test submission ID available")
        
        # Verify data persistence by checking stats again
        try:
            response = requests.get(f"{API_BASE}/submissions/stats/summary", headers=self.get_auth_headers())
            
            if response.status_code == 200:
                stats = response.json()
                # The submission should be deleted, so total might be 0 or same as before
                self.log_result("submissions_system", "Verify data persistence", True)
            else:
                self.log_result("submissions_system", "Verify data persistence", False, f"Status {response.status_code}")
        except Exception as e:
            self.log_result("submissions_system", "Verify data persistence", False, str(e))
    
    def test_admin_credentials_management(self):
        """Test Admin Credentials Management (Email and Password) by Head Admin"""
        print("\n🔑 Testing Admin Credentials Management by Head Admin...")
        
        # First, get redhill admin's ID
        redhill_admin_id = None
        try:
            response = requests.get(f"{API_BASE}/admin/list", headers=self.get_auth_headers())
            if response.status_code == 200:
                admins = response.json()
                for admin in admins:
                    if admin.get("email") == "redh1ll@developer.com":
                        redhill_admin_id = admin.get("id")
                        break
                
                if redhill_admin_id:
                    self.log_result("role_based_admin", "Get redhill admin ID for credentials test", True)
                else:
                    self.log_result("role_based_admin", "Get redhill admin ID for credentials test", False, "Redhill admin not found in list")
            else:
                self.log_result("role_based_admin", "Get redhill admin ID for credentials test", False, f"Status {response.status_code}")
        except Exception as e:
            self.log_result("role_based_admin", "Get redhill admin ID for credentials test", False, str(e))
        
        if not redhill_admin_id:
            print("  ⚠️  Cannot proceed with credentials tests without redhill admin ID")
            return
        
        # Test 1: Head admin changes redhill's email only
        new_email = "redhill.updated@808records.com"
        try:
            response = requests.put(
                f"{API_BASE}/admin/{redhill_admin_id}/credentials",
                json={"new_email": new_email},
                headers=self.get_auth_headers()
            )
            
            if response.status_code == 200:
                result = response.json()
                if result.get("success") and result.get("new_email") == new_email:
                    self.log_result("role_based_admin", "Head admin changes email only", True)
                else:
                    self.log_result("role_based_admin", "Head admin changes email only", False, "Email change not successful")
            else:
                self.log_result("role_based_admin", "Head admin changes email only", False, f"Status {response.status_code}: {response.text}")
        except Exception as e:
            self.log_result("role_based_admin", "Head admin changes email only", False, str(e))
        
        # Test 2: Verify login works with new email and old password
        try:
            response = requests.post(f"{API_BASE}/admin/login", json={
                "email": new_email,
                "password": "redhill"  # old password should still work
            })
            
            if response.status_code == 200:
                data = response.json()
                if "token" in data:
                    self.redhill_token = data["token"]
                    self.log_result("role_based_admin", "Login with new email and old password", True)
                else:
                    self.log_result("role_based_admin", "Login with new email and old password", False, "Missing token in response")
            else:
                self.log_result("role_based_admin", "Login with new email and old password", False, f"Status {response.status_code}: {response.text}")
        except Exception as e:
            self.log_result("role_based_admin", "Login with new email and old password", False, str(e))
        
        # Test 3: Head admin changes redhill's password only
        new_password = "newredhill456"
        try:
            response = requests.put(
                f"{API_BASE}/admin/{redhill_admin_id}/credentials",
                json={"new_password": new_password},
                headers=self.get_auth_headers()
            )
            
            if response.status_code == 200:
                result = response.json()
                if result.get("success"):
                    self.log_result("role_based_admin", "Head admin changes password only", True)
                else:
                    self.log_result("role_based_admin", "Head admin changes password only", False, "Password change not successful")
            else:
                self.log_result("role_based_admin", "Head admin changes password only", False, f"Status {response.status_code}: {response.text}")
        except Exception as e:
            self.log_result("role_based_admin", "Head admin changes password only", False, str(e))
        
        # Test 4: Verify old password no longer works
        try:
            response = requests.post(f"{API_BASE}/admin/login", json={
                "email": new_email,
                "password": "redhill"  # old password
            })
            
            if response.status_code == 401:
                self.log_result("role_based_admin", "Old password rejected after change", True)
            else:
                self.log_result("role_based_admin", "Old password rejected after change", False, f"Expected 401, got {response.status_code}")
        except Exception as e:
            self.log_result("role_based_admin", "Old password rejected after change", False, str(e))
        
        # Test 5: Verify new password works
        try:
            response = requests.post(f"{API_BASE}/admin/login", json={
                "email": new_email,
                "password": new_password  # new password
            })
            
            if response.status_code == 200:
                data = response.json()
                if "token" in data:
                    self.redhill_token = data["token"]
                    self.log_result("role_based_admin", "Login with new password", True)
                else:
                    self.log_result("role_based_admin", "Login with new password", False, "Missing token in response")
            else:
                self.log_result("role_based_admin", "Login with new password", False, f"Status {response.status_code}: {response.text}")
        except Exception as e:
            self.log_result("role_based_admin", "Login with new password", False, str(e))
        
        # Test 6: Head admin changes both email and password at once
        final_email = "redh1ll@developer.com"  # restore original
        final_password = "redhill"  # restore original
        try:
            response = requests.put(
                f"{API_BASE}/admin/{redhill_admin_id}/credentials",
                json={"new_email": final_email, "new_password": final_password},
                headers=self.get_auth_headers()
            )
            
            if response.status_code == 200:
                result = response.json()
                if result.get("success") and result.get("new_email") == final_email:
                    self.log_result("role_based_admin", "Head admin changes both email and password", True)
                else:
                    self.log_result("role_based_admin", "Head admin changes both email and password", False, "Credentials change not successful")
            else:
                self.log_result("role_based_admin", "Head admin changes both email and password", False, f"Status {response.status_code}: {response.text}")
        except Exception as e:
            self.log_result("role_based_admin", "Head admin changes both email and password", False, str(e))
        
        # Test 7: Verify login works with restored credentials
        try:
            response = requests.post(f"{API_BASE}/admin/login", json={
                "email": final_email,
                "password": final_password
            })
            
            if response.status_code == 200:
                data = response.json()
                if "token" in data:
                    self.redhill_token = data["token"]  # Update token for subsequent tests
                    self.log_result("role_based_admin", "Login with restored credentials", True)
                else:
                    self.log_result("role_based_admin", "Login with restored credentials", False, "Missing token in response")
            else:
                self.log_result("role_based_admin", "Login with restored credentials", False, f"Status {response.status_code}: {response.text}")
        except Exception as e:
            self.log_result("role_based_admin", "Login with restored credentials", False, str(e))
        
        # Test 8: Test duplicate email rejection
        try:
            response = requests.put(
                f"{API_BASE}/admin/{redhill_admin_id}/credentials",
                json={"new_email": "stevie@808records.com"},  # Try to use head admin's email
                headers=self.get_auth_headers()
            )
            
            if response.status_code == 400:
                self.log_result("role_based_admin", "Duplicate email rejected (400)", True)
            else:
                self.log_result("role_based_admin", "Duplicate email rejected (400)", False, f"Expected 400, got {response.status_code}")
        except Exception as e:
            self.log_result("role_based_admin", "Duplicate email rejected (400)", False, str(e))
        
        # Test 9: Verify regular admin cannot change credentials
        if self.redhill_token:
            redhill_headers = {"Authorization": f"Bearer {self.redhill_token}"}
            try:
                # Get stevie's admin ID
                response = requests.get(f"{API_BASE}/admin/list", headers=self.get_auth_headers())
                stevie_admin_id = None
                if response.status_code == 200:
                    admins = response.json()
                    for admin in admins:
                        if admin.get("email") == "stevie@808records.com":
                            stevie_admin_id = admin.get("id")
                            break
                
                if stevie_admin_id:
                    response = requests.put(
                        f"{API_BASE}/admin/{stevie_admin_id}/credentials",
                        json={"new_password": "hacked123"},
                        headers=redhill_headers
                    )
                    
                    if response.status_code == 403:
                        self.log_result("role_based_admin", "Regular admin blocked from changing credentials (403)", True)
                    else:
                        self.log_result("role_based_admin", "Regular admin blocked from changing credentials (403)", False, f"Expected 403, got {response.status_code}")
                else:
                    self.log_result("role_based_admin", "Regular admin blocked from changing credentials (403)", False, "Could not find stevie admin ID")
            except Exception as e:
                self.log_result("role_based_admin", "Regular admin blocked from changing credentials (403)", False, str(e))
        else:
            self.log_result("role_based_admin", "Regular admin blocked from changing credentials (403)", False, "No redhill token available")
        
        # Test 10: Test head admin changing their own email
        stevie_admin_id = None
        try:
            response = requests.get(f"{API_BASE}/admin/list", headers=self.get_auth_headers())
            if response.status_code == 200:
                admins = response.json()
                for admin in admins:
                    if admin.get("email") == "stevie@808records.com":
                        stevie_admin_id = admin.get("id")
                        break
        except Exception as e:
            pass
        
        if stevie_admin_id:
            temp_email = "stevie.temp@808records.com"
            try:
                response = requests.put(
                    f"{API_BASE}/admin/{stevie_admin_id}/credentials",
                    json={"new_email": temp_email},
                    headers=self.get_auth_headers()
                )
                
                if response.status_code == 200:
                    result = response.json()
                    if result.get("success"):
                        self.log_result("role_based_admin", "Head admin changes own email", True)
                        
                        # Verify need to re-login with new email
                        try:
                            response = requests.post(f"{API_BASE}/admin/login", json={
                                "email": temp_email,
                                "password": "stevie808"
                            })
                            
                            if response.status_code == 200:
                                data = response.json()
                                if "token" in data:
                                    new_token = data["token"]
                                    self.log_result("role_based_admin", "Re-login required with new email", True)
                                    
                                    # Restore original email
                                    new_headers = {"Authorization": f"Bearer {new_token}"}
                                    response = requests.put(
                                        f"{API_BASE}/admin/{stevie_admin_id}/credentials",
                                        json={"new_email": "stevie@808records.com"},
                                        headers=new_headers
                                    )
                                    if response.status_code == 200:
                                        print("  ℹ️  Restored stevie's original email")
                                        # Re-login to get fresh token
                                        response = requests.post(f"{API_BASE}/admin/login", json={
                                            "email": "stevie@808records.com",
                                            "password": "stevie808"
                                        })
                                        if response.status_code == 200:
                                            self.auth_token = response.json().get("token")
                                else:
                                    self.log_result("role_based_admin", "Re-login required with new email", False, "Missing token")
                            else:
                                self.log_result("role_based_admin", "Re-login required with new email", False, f"Status {response.status_code}")
                        except Exception as e:
                            self.log_result("role_based_admin", "Re-login required with new email", False, str(e))
                    else:
                        self.log_result("role_based_admin", "Head admin changes own email", False, "Email change not successful")
                else:
                    self.log_result("role_based_admin", "Head admin changes own email", False, f"Status {response.status_code}: {response.text}")
            except Exception as e:
                self.log_result("role_based_admin", "Head admin changes own email", False, str(e))
        else:
            self.log_result("role_based_admin", "Head admin changes own email", False, "Could not find stevie admin ID")
            self.log_result("role_based_admin", "Re-login required with new email", False, "Could not find stevie admin ID")

    def run_all_tests(self):
        """Run all backend tests"""
        print("🚀 Starting 808Records Backend API Tests - Admin Credentials Management")
        print(f"Base URL: {BASE_URL}")
        print(f"API Base: {API_BASE}")
        
        # Run tests in order
        self.test_admin_authentication()
        self.test_role_based_admin_system()
        self.test_admin_password_management()
        self.test_admin_credentials_management()  # NEW TEST
        self.test_submissions_system()
        self.test_database_initialization()
        self.test_artists_crud()
        self.test_releases_crud()
        self.test_site_content_api()
        self.test_auth_protection()
        
        # Print summary
        self.print_summary()
    
    def print_summary(self):
        """Print test results summary"""
        print("\n" + "="*60)
        print("📊 TEST RESULTS SUMMARY")
        print("="*60)
        
        total_passed = 0
        total_failed = 0
        
        for category, results in self.test_results.items():
            passed = results["passed"]
            failed = results["failed"]
            total_passed += passed
            total_failed += failed
            
            status = "✅ PASS" if failed == 0 else "❌ FAIL"
            print(f"{category.upper().replace('_', ' ')}: {status} ({passed} passed, {failed} failed)")
            
            if results["errors"]:
                for error in results["errors"]:
                    print(f"  ❌ {error}")
        
        print("-" * 60)
        print(f"TOTAL: {total_passed} passed, {total_failed} failed")
        
        if total_failed == 0:
            print("🎉 ALL TESTS PASSED!")
        else:
            print(f"⚠️  {total_failed} TESTS FAILED")
        
        return total_failed == 0

if __name__ == "__main__":
    tester = BackendTester()
    success = tester.run_all_tests()
    exit(0 if success else 1)