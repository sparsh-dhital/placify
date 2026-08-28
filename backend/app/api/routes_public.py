import os
import resend
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()
resend.api_key = os.environ.get("RESEND_API_KEY")

router = APIRouter()

class ContactPayload(BaseModel):
    name: str
    email: str
    message: str

@router.post("/contact")
async def submit_contact_form(payload: ContactPayload):
    try:
        params = {
            "from": "Placify <onboarding@resend.dev>",
            "to": ["251fa04i95.sparsh@gmail.com"],
            "subject": f"New Contact Submission from {payload.name}",
            "reply_to": payload.email,
            "html": f"""
            <h3>New Message via Placify</h3>
            <p><strong>Name:</strong> {payload.name}</p>
            <p><strong>Email:</strong> {payload.email}</p>
            <p><strong>Message:</strong><br>{payload.message}</p>
            """
        }
        
        email_response = resend.Emails.send(params)
        return {"success": True, "id": email_response.get("id")}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))