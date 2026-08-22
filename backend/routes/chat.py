# backend/routes/chat.py
import os
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

groq_api_key = os.getenv("GROQ_API_KEY")
client = Groq(api_key=groq_api_key) if groq_api_key else None

class ChatRequest(BaseModel):
    user_id: str
    role: str
    message: str

@router.post("/analyze")
async def chat_with_critic(request: ChatRequest):
    if not client:
        raise HTTPException(status_code=500, detail="Groq API key missing from backend environment variables.")

    try:
        system_prompt = (
            f"You are the Placify AI Critic, an elite university placement operations advisor and harsh, candid coach. "
            f"The user interacting with you is logged in as a '{request.role}' with ID/Email '{request.user_id}'. "
            f"Your job is to analyze their placement status, give direct, constructive criticism, and help them improve "
            f"their career readiness, interview evaluations, or campus-wide recruitment pipelines. Keep your answers concise, "
            f"professional, and punchy (under 3 sentences where possible)."
        )

        chat_completion = client.chat.completions.create(
            # Updated to Groq's active high-speed open-weight model ID
            model="openai/gpt-oss-20b",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": request.message}
            ],
            temperature=0.7,
            max_tokens=250,
        )

        reply = chat_completion.choices[0].message.content

        return {
            "success": True,
            "reply": reply,
            "context_used": f"Live Groq LPU Inference ({request.role})"
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Groq API Error: {str(e)}")