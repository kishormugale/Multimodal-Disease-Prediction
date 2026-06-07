"""
Password Reset Router
Handles password reset requests with email notifications
"""

import uuid
import logging
from datetime import datetime, timedelta, timezone
from typing import Optional
from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel, EmailStr
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig, MessageType
from config import settings
from db import get_db

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/auth", tags=["auth"])

# Email configuration
conf = ConnectionConfig(
    MAIL_USERNAME=settings.mail_username,
    MAIL_PASSWORD=settings.mail_password,
    MAIL_FROM=settings.mail_from,
    MAIL_PORT=settings.mail_port,
    MAIL_SERVER=settings.mail_server,
    MAIL_FROM_NAME=settings.mail_from_name,
    MAIL_STARTTLS=settings.mail_starttls,
    MAIL_SSL_TLS=settings.mail_ssl_tls,
    USE_CREDENTIALS=settings.use_credentials,
    VALIDATE_CERTS=settings.validate_certs
)


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str


async def send_reset_email(email: str, reset_token: str, background_tasks: BackgroundTasks):
    """
    Send password reset email to user.
    In development mode (no SMTP configured), this logs the reset link.
    """
    reset_link = f"http://localhost:5173/reset-password?token={reset_token}"
    
    html_body = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ background: linear-gradient(135deg, #1976D2 0%, #64B5F6 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
            .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }}
            .button {{ display: inline-block; padding: 15px 30px; background: #1976D2; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }}
            .footer {{ text-align: center; margin-top: 20px; color: #666; font-size: 12px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🏥 KDM Care Hospital</h1>
                <p>Password Reset Request</p>
            </div>
            <div class="content">
                <h2>Reset Your Password</h2>
                <p>We received a request to reset your password. Click the button below to create a new password:</p>
                <p style="text-align: center;">
                    <a href="{reset_link}" class="button">Reset Password</a>
                </p>
                <p>Or copy and paste this link into your browser:</p>
                <p style="background: white; padding: 10px; border-radius: 5px; word-break: break-all;">
                    {reset_link}
                </p>
                <p><strong>This link will expire in 1 hour.</strong></p>
                <p>If you didn't request this password reset, please ignore this email or contact support if you have concerns.</p>
            </div>
            <div class="footer">
                <p>KDM Care Hospital - AI Multimodal Disease Prediction System</p>
                <p>This is an automated message, please do not reply.</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    # Check if email is configured
    if not settings.mail_password:
        # Development mode - just log the reset link
        print("\n" + "="*80)
        print("📧 PASSWORD RESET EMAIL (Development Mode)")
        print("="*80)
        print(f"To: {email}")
        print(f"Reset Link: {reset_link}")
        print(f"Token: {reset_token}")
        print("="*80 + "\n")
        return
    
    # Production mode - send actual email
    message = MessageSchema(
        subject="Password Reset Request - KDM Care Hospital",
        recipients=[email],
        body=html_body,
        subtype=MessageType.html
    )
    
    fm = FastMail(conf)
    background_tasks.add_task(fm.send_message, message)


@router.post("/forgot-password")
async def forgot_password(request: ForgotPasswordRequest, background_tasks: BackgroundTasks):
    """
    Initiate password reset process.
    Generates a reset token and sends email with reset link.
    """
    try:
        email = request.email.lower()
        
        # Generate reset token
        reset_token = str(uuid.uuid4())
        expires_at = datetime.now(timezone.utc) + timedelta(hours=1)
        
        # Store reset token in database
        db = get_db()
        reset_collection = db["password_resets"]
        
        # Invalidate any existing tokens for this email
        await reset_collection.delete_many({"email": email})
        
        # Create new reset token
        await reset_collection.insert_one({
            "email": email,
            "token": reset_token,
            "expires_at": expires_at,
            "used": False,
            "created_at": datetime.now(timezone.utc)
        })
        
        # Send reset email
        await send_reset_email(email, reset_token, background_tasks)
        
        return {
            "message": "If an account exists with this email, you will receive password reset instructions.",
            "success": True
        }
    except Exception as e:
        logger.error(f"Error in forgot_password: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to process password reset: {str(e)}")


@router.post("/reset-password")
async def reset_password(request: ResetPasswordRequest):
    """
    Reset password using valid token.
    """
    db = get_db()
    reset_collection = db["password_resets"]
    
    # Find the reset token
    reset_record = await reset_collection.find_one({
        "token": request.token,
        "used": False
    })
    
    if not reset_record:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")
    
    # Check if token is expired
    if reset_record["expires_at"] < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="Reset token has expired")
    
    # Validate new password
    if len(request.new_password) < 4:
        raise HTTPException(status_code=400, detail="Password must be at least 4 characters")
    
    # Mark token as used
    await reset_collection.update_one(
        {"token": request.token},
        {"$set": {"used": True, "used_at": datetime.now(timezone.utc)}}
    )
    
    # In a real system, you would update the user's password here
    # For this demo, we'll just return success
    
    return {
        "message": "Password has been reset successfully",
        "success": True
    }


@router.get("/verify-reset-token/{token}")
async def verify_reset_token(token: str):
    """
    Verify if a reset token is valid and not expired.
    """
    db = get_db()
    reset_collection = db["password_resets"]
    
    reset_record = await reset_collection.find_one({
        "token": token,
        "used": False
    })
    
    if not reset_record:
        return {"valid": False, "message": "Invalid token"}
    
    if reset_record["expires_at"] < datetime.now(timezone.utc):
        return {"valid": False, "message": "Token has expired"}
    
    return {
        "valid": True,
        "email": reset_record["email"],
        "expires_at": reset_record["expires_at"].isoformat()
    }
