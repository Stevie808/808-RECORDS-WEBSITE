from fastapi import APIRouter, HTTPException, Depends, Header
from typing import List, Optional
from models import Admin, AdminLogin, AdminCreate, AdminUpdate, PasswordChange, AdminPasswordChange, AdminCredentialUpdate, AdminResponse, TokenResponse, SiteContent
from auth import verify_password, get_password_hash, create_access_token, verify_token

router = APIRouter(prefix="/admin", tags=["admin"])

# Database will be injected
db = None

def set_db(database):
    global db
    db = database

# Dependency to verify admin token
async def get_current_admin(authorization: Optional[str] = Header(None)):
    if not authorization or not authorization.startswith('Bearer '):
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    token = authorization.split(' ')[1]
    payload = verify_token(token)
    
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    email = payload.get('sub')
    if not email:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    admin = await db.admins.find_one({'email': email})
    if not admin:
        raise HTTPException(status_code=401, detail="Admin not found")
    
    return email

@router.post("/login", response_model=TokenResponse)
async def login(admin_login: AdminLogin):
    admin = await db.admins.find_one({'email': admin_login.email})
    
    if not admin or not verify_password(admin_login.password, admin['password']):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    access_token = create_access_token(data={'sub': admin['email']})
    
    return TokenResponse(token=access_token, email=admin['email'])

@router.get("/me")
async def get_current_admin_info(current_admin: str = Depends(get_current_admin)):
    admin = await db.admins.find_one({'email': current_admin}, {"_id": 0, "password": 0})
    if not admin:
        raise HTTPException(status_code=404, detail="Admin not found")
    return admin

@router.post("/logout")
async def logout(current_admin: str = Depends(get_current_admin)):
    return {"message": "Logged out successfully"}

@router.get("/verify")
async def verify(current_admin: str = Depends(get_current_admin)):
    return {"valid": True, "email": current_admin}

@router.get("/list", response_model=List[AdminResponse])
async def list_admins(current_admin: str = Depends(get_current_admin)):
    admin = await db.admins.find_one({'email': current_admin})
    if not admin or not admin.get('permissions', {}).get('manage_admins', False):
        raise HTTPException(status_code=403, detail="Not authorized to manage admins")
    
    admins = await db.admins.find({}, {"_id": 0, "password": 0}).to_list(100)
    return [AdminResponse(
        id=admin.get('id', ''),
        email=admin['email'],
        role=admin.get('role', 'admin'),
        permissions=admin.get('permissions', {}),
        created_at=admin['created_at'],
        created_by=admin.get('created_by')
    ) for admin in admins]

@router.post("/create", response_model=AdminResponse)
async def create_admin(admin_create: AdminCreate, current_admin: str = Depends(get_current_admin)):
    current_admin_doc = await db.admins.find_one({'email': current_admin})
    if not current_admin_doc or not current_admin_doc.get('permissions', {}).get('manage_admins', False):
        raise HTTPException(status_code=403, detail="Not authorized to manage admins")
    
    existing_admin = await db.admins.find_one({'email': admin_create.email})
    if existing_admin:
        raise HTTPException(status_code=400, detail="Admin already exists")
    
    permissions = admin_create.permissions or {
        "manage_artists": True,
        "manage_releases": True,
        "manage_content": True,
        "manage_submissions": True,
        "manage_admins": False
    }
    
    hashed_password = get_password_hash(admin_create.password)
    admin = Admin(
        email=admin_create.email,
        password=hashed_password,
        role=admin_create.role,
        permissions=permissions,
        created_by=current_admin
    )
    
    await db.admins.insert_one(admin.dict())
    
    return AdminResponse(
        id=admin.id,
        email=admin.email,
        role=admin.role,
        permissions=admin.permissions,
        created_at=admin.created_at,
        created_by=admin.created_by
    )

@router.put("/{admin_id}/permissions")
async def update_admin_permissions(admin_id: str, permissions: dict, current_admin: str = Depends(get_current_admin)):
    # Check if current admin has permission
    current_admin_doc = await db.admins.find_one({'email': current_admin})
    if not current_admin_doc or not current_admin_doc.get('permissions', {}).get('manage_admins', False):
        raise HTTPException(status_code=403, detail="Not authorized to manage admins")
    
    # Update permissions
    result = await db.admins.update_one(
        {'id': admin_id},
        {'$set': {'permissions': permissions}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Admin not found")
    
    return {"success": True, "message": "Permissions updated"}

@router.put("/{admin_id}/role")
async def update_admin_role(admin_id: str, role_data: dict, current_admin: str = Depends(get_current_admin)):
    # Check if current admin has permission
    current_admin_doc = await db.admins.find_one({'email': current_admin})
    if not current_admin_doc or current_admin_doc.get('role') != 'head_admin':
        raise HTTPException(status_code=403, detail="Only head admin can change roles")
    
    role = role_data.get('role')
    if not role:
        raise HTTPException(status_code=400, detail="Role is required")
    
    # Check if admin exists first
    existing_admin = await db.admins.find_one({'id': admin_id})
    if not existing_admin:
        raise HTTPException(status_code=404, detail="Admin not found")
    
    # Update role
    result = await db.admins.update_one(
        {'id': admin_id},
        {'$set': {'role': role}}
    )
    
    return {"success": True, "message": "Role updated"}

@router.put("/{admin_id}", response_model=AdminResponse)
async def update_admin(admin_id: str, admin_data: AdminUpdate, current_admin: str = Depends(get_current_admin)):
    current_admin_doc = await db.admins.find_one({'email': current_admin})
    if not current_admin_doc or not current_admin_doc.get('permissions', {}).get('manage_admins', False):
        raise HTTPException(status_code=403, detail="Not authorized to manage admins")
    
    existing_admin = await db.admins.find_one({'id': admin_id})
    if not existing_admin:
        raise HTTPException(status_code=404, detail="Admin not found")
    
    # Protect owner role - cannot be modified by anyone
    if existing_admin.get('role') == 'owner':
        raise HTTPException(status_code=403, detail="Owner account cannot be modified")
    
    # Only owner and developer can modify other privileged roles
    if existing_admin.get('role') in ['developer', 'head_admin']:
        if current_admin_doc.get('role') not in ['owner', 'developer']:
            raise HTTPException(status_code=403, detail="Insufficient permissions to modify this admin")
    
    update_data = {}
    if admin_data.role is not None:
        # Only owner and developer can change roles
        if current_admin_doc.get('role') not in ['owner', 'developer']:
            raise HTTPException(status_code=403, detail="Only owner or developer can change roles")
        update_data['role'] = admin_data.role
    
    if admin_data.permissions is not None:
        update_data['permissions'] = admin_data.permissions
    
    if update_data:
        await db.admins.update_one({'id': admin_id}, {'$set': update_data})
    
    updated_admin = await db.admins.find_one({'id': admin_id}, {"_id": 0, "password": 0})
    return AdminResponse(**updated_admin)

@router.put("/password/change")
async def change_password(password_data: PasswordChange, current_admin: str = Depends(get_current_admin)):
    admin = await db.admins.find_one({'email': current_admin})
    if not admin:
        raise HTTPException(status_code=404, detail="Admin not found")
    
    if not verify_password(password_data.current_password, admin['password']):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    
    new_hash = get_password_hash(password_data.new_password)
    await db.admins.update_one(
        {'email': current_admin},
        {'$set': {'password': new_hash}}
    )
    
    return {"success": True, "message": "Password updated successfully"}

@router.put("/{admin_id}/password")
async def change_admin_password(admin_id: str, password_data: AdminPasswordChange, current_admin: str = Depends(get_current_admin)):
    # Only head admin can change other admins' passwords
    current_admin_doc = await db.admins.find_one({'email': current_admin})
    if not current_admin_doc or current_admin_doc.get('role') != 'head_admin':
        raise HTTPException(status_code=403, detail="Only head admin can change other admins' passwords")
    
    # Find the target admin
    target_admin = await db.admins.find_one({'id': admin_id})
    if not target_admin:
        raise HTTPException(status_code=404, detail="Admin not found")
    
    # Hash the new password and update
    new_hash = get_password_hash(password_data.new_password)
    await db.admins.update_one(
        {'id': admin_id},
        {'$set': {'password': new_hash}}
    )
    
    return {"success": True, "message": "Admin password updated successfully"}

@router.put("/{admin_id}/credentials")
async def update_admin_credentials(admin_id: str, credential_data: AdminCredentialUpdate, current_admin: str = Depends(get_current_admin)):
    # Only owner, developer, or head admin can change admin credentials
    current_admin_doc = await db.admins.find_one({'email': current_admin})
    if not current_admin_doc or current_admin_doc.get('role') not in ['owner', 'developer', 'head_admin']:
        raise HTTPException(status_code=403, detail="Insufficient permissions to change admin credentials")
    
    # Find the target admin
    target_admin = await db.admins.find_one({'id': admin_id})
    if not target_admin:
        raise HTTPException(status_code=404, detail="Admin not found")
    
    # Protect owner - cannot be modified
    if target_admin.get('role') == 'owner':
        raise HTTPException(status_code=403, detail="Owner account cannot be modified")
    
    update_data = {}
    
    # Update email if provided
    if credential_data.new_email:
        # Check if email already exists for another admin
        existing_admin = await db.admins.find_one({'email': credential_data.new_email})
        if existing_admin and existing_admin['id'] != admin_id:
            raise HTTPException(status_code=400, detail="Email already in use by another admin")
        update_data['email'] = credential_data.new_email
    
    # Update password if provided
    if credential_data.new_password:
        update_data['password'] = get_password_hash(credential_data.new_password)
    
    if update_data:
        await db.admins.update_one({'id': admin_id}, {'$set': update_data})
    
    return {"success": True, "message": "Admin credentials updated successfully", "new_email": credential_data.new_email}

@router.delete("/{email}")
async def delete_admin(email: str, current_admin: str = Depends(get_current_admin)):
    current_admin_doc = await db.admins.find_one({'email': current_admin})
    if not current_admin_doc or not current_admin_doc.get('permissions', {}).get('manage_admins', False):
        raise HTTPException(status_code=403, detail="Not authorized to manage admins")
    
    if email == current_admin:
        raise HTTPException(status_code=400, detail="Cannot delete yourself")
    
    target_admin = await db.admins.find_one({'email': email})
    
    # Protect owner and developer roles
    if target_admin and target_admin.get('role') in ['owner', 'developer']:
        raise HTTPException(status_code=400, detail=f"Cannot delete {target_admin.get('role')} account")
    
    # Only allow head_admin deletion by owner/developer
    if target_admin and target_admin.get('role') == 'head_admin':
        if current_admin_doc.get('role') not in ['owner', 'developer']:
            raise HTTPException(status_code=403, detail="Only owner or developer can delete head admin")
    
    result = await db.admins.delete_one({'email': email})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Admin not found")
    
    return {"success": True, "message": f"Admin {email} deleted"}

# Content management routes
@router.get("/content/{section}")
async def get_content(section: str):
    content = await db.site_content.find_one({'section': section})
    if not content:
        return {"content": {}}
    return {"content": content.get('content', {})}

@router.put("/content/{section}")
async def update_content(section: str, content_data: dict, current_admin: str = Depends(get_current_admin)):
    content = SiteContent(
        section=section,
        content=content_data,
        updated_by=current_admin
    )
    
    await db.site_content.update_one(
        {'section': section},
        {'$set': content.dict()},
        upsert=True
    )
    
    return {"success": True, "message": f"Content for {section} updated"}
