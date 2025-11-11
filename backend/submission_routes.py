from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from typing import List
from models import Submission, SubmissionCreate, SubmissionUpdate
from admin_routes import get_current_admin
from motor.motor_asyncio import AsyncIOMotorClient
import os
from datetime import datetime
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

router = APIRouter(prefix="/submissions", tags=["submissions"])

# Database will be injected
db = None

def set_db(database):
    global db
    db = database

async def send_email_notification(submission_data: dict, recipient_email: str):
    try:
        print(f"""
        ========== NEW SUBMISSION ==========
        To: {recipient_email}
        From: {submission_data['email']}
        Name: {submission_data['name']}
        Artist Name: {submission_data.get('artistName', 'N/A')}
        Demo Link: {submission_data.get('demoLink', 'N/A')}
        Message: {submission_data['message']}
        ====================================
        """)
        
        sender_email = os.getenv('SMTP_EMAIL')
        sender_password = os.getenv('SMTP_PASSWORD')
        smtp_server = os.getenv('SMTP_SERVER', 'smtp.gmail.com')
        smtp_port = int(os.getenv('SMTP_PORT', 587))
        
        if sender_email and sender_password:
            msg = MIMEMultipart()
            msg['From'] = sender_email
            msg['To'] = recipient_email
            msg['Subject'] = f'New Submission from {submission_data["name"]}'
            
            body = f"""
            New submission received:
            
            Name: {submission_data['name']}
            Email: {submission_data['email']}
            Artist Name: {submission_data.get('artistName', 'N/A')}
            Demo Link: {submission_data.get('demoLink', 'N/A')}
            
            Message:
            {submission_data['message']}
            """
            
            msg.attach(MIMEText(body, 'plain'))
            
            with smtplib.SMTP(smtp_server, smtp_port) as server:
                server.starttls()
                server.login(sender_email, sender_password)
                server.send_message(msg)
        
        return True
    except Exception as e:
        print(f"Email sending error: {e}")
        return False

@router.post("/", response_model=Submission)
async def create_submission(submission_data: SubmissionCreate, background_tasks: BackgroundTasks):
    submission = Submission(**submission_data.dict())
    
    # Convert datetime to ISO string for MongoDB
    submission_dict = submission.dict()
    submission_dict['created_at'] = submission_dict['created_at'].isoformat()
    
    await db.submissions.insert_one(submission_dict)
    
    # Get notification email from site content
    contact_content = await db.site_content.find_one({"section": "contact"})
    notification_email = contact_content.get('content', {}).get('email', 'submissions@808records.com') if contact_content else 'submissions@808records.com'
    
    # Send email notification in background
    background_tasks.add_task(send_email_notification, submission_data.dict(), notification_email)
    
    return submission

async def check_permission(email: str, permission: str):
    admin = await db.admins.find_one({"email": email})
    if not admin:
        raise HTTPException(status_code=403, detail="Admin not found")
    
    if not admin.get('permissions', {}).get(permission, False):
        raise HTTPException(status_code=403, detail=f"Missing permission: {permission}")
    
    return True

@router.get("/", response_model=List[Submission])
async def get_submissions(current_admin: str = Depends(get_current_admin)):
    await check_permission(current_admin, 'manage_submissions')
    
    submissions = await db.submissions.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    
    for submission in submissions:
        if isinstance(submission.get('created_at'), str):
            submission['created_at'] = datetime.fromisoformat(submission['created_at'])
    
    return submissions

@router.get("/{submission_id}", response_model=Submission)
async def get_submission(submission_id: str, current_admin: str = Depends(get_current_admin)):
    await check_permission(current_admin, 'manage_submissions')
    
    submission = await db.submissions.find_one({"id": submission_id}, {"_id": 0})
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")
    
    if isinstance(submission.get('created_at'), str):
        submission['created_at'] = datetime.fromisoformat(submission['created_at'])
    
    return submission

@router.put("/{submission_id}", response_model=Submission)
async def update_submission(submission_id: str, submission_data: SubmissionUpdate, current_admin: str = Depends(get_current_admin)):
    await check_permission(current_admin, 'manage_submissions')
    
    existing_submission = await db.submissions.find_one({"id": submission_id}, {"_id": 0})
    if not existing_submission:
        raise HTTPException(status_code=404, detail="Submission not found")
    
    update_data = {k: v for k, v in submission_data.dict().items() if v is not None}
    update_data['reviewed_by'] = current_admin
    
    await db.submissions.update_one(
        {"id": submission_id},
        {"$set": update_data}
    )
    
    updated_submission = await db.submissions.find_one({"id": submission_id}, {"_id": 0})
    if isinstance(updated_submission.get('created_at'), str):
        updated_submission['created_at'] = datetime.fromisoformat(updated_submission['created_at'])
    
    return updated_submission

@router.delete("/{submission_id}")
async def delete_submission(submission_id: str, current_admin: str = Depends(get_current_admin)):
    await check_permission(current_admin, 'manage_submissions')
    
    result = await db.submissions.delete_one({"id": submission_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Submission not found")
    return {"success": True, "message": "Submission deleted"}

@router.get("/stats/summary")
async def get_submission_stats(current_admin: str = Depends(get_current_admin)):
    await check_permission(current_admin, 'manage_submissions')
    
    total = await db.submissions.count_documents({})
    new_count = await db.submissions.count_documents({"status": "new"})
    reviewed = await db.submissions.count_documents({"status": "reviewed"})
    archived = await db.submissions.count_documents({"status": "archived"})
    
    return {
        "total": total,
        "new": new_count,
        "reviewed": reviewed,
        "archived": archived
    }
