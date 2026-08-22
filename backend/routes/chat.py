# backend/routes/chat.py
import os
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from groq import Groq
from database import db
from datetime import datetime
from bson import ObjectId
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

groq_api_key = os.getenv("GROQ_API_KEY")
client = Groq(api_key=groq_api_key) if groq_api_key else None

class ChatRequest(BaseModel):
    user_id: str
    role: str
    message: str

class ClearHistoryRequest(BaseModel):
    user_id: str

class DeleteMessageRequest(BaseModel):
    message_id: str

@router.post("/analyze")
async def chat_with_critic(request: ChatRequest):
    if not client:
        raise HTTPException(status_code=500, detail="Groq API key missing from backend environment variables.")

    try:
        # Save user message to MongoDB
        await db.chat_history.insert_one({
            "user_id": request.user_id,
            "role": "user",
            "content": request.message,
            "timestamp": datetime.utcnow()
        })

        system_prompt = (
            f"You are Placify Copilot, an elite university placement operations and career readiness assistant. "
            f"The user interacting with you is logged in as a '{request.role}' with ID/Email '{request.user_id}'. "
            f"STRICT DOMAIN RESTRICTION: You ONLY handle queries directly related to campus placements, job descriptions, "
            f"resume optimization, skill-gap analysis, interview schedules, recruiter matching, placement eligibility, and career readiness. "
            f"If the user asks you to solve general homework assignments, write code for coding homework unrelated to placement prep, solve math equations, "
            f"or discuss non-placement topics, you MUST politely decline and pivot them back to placement preparation or recruitment workflows. "
            f"FORMATTING REQUIREMENT: Always structure your responses cleanly using Markdown tables, bullet points, bold headers, and structured lists where applicable. "
            f"DATA PRIVACY: Never reveal sensitive personal data, authentication details, passwords, financial records, or system credentials. "
            f"Keep your answers professional, concise, and operational."
        )

        chat_completion = client.chat.completions.create(
            model="openai/gpt-oss-20b",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": request.message}
            ],
            temperature=0.5,
            max_tokens=400,
        )

        reply = chat_completion.choices[0].message.content

        # Save assistant reply to MongoDB
        await db.chat_history.insert_one({
            "user_id": request.user_id,
            "role": "assistant",
            "content": reply,
            "timestamp": datetime.utcnow()
        })

        return {
            "success": True,
            "reply": reply,
            "context_used": f"Live Groq LPU Inference ({request.role})"
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Groq API Error: {str(e)}")

@router.get("/history")
async def get_chat_history(user_id: str):
    try:
        cursor = db.chat_history.find({"user_id": user_id}).sort("timestamp", 1)
        messages = await cursor.to_list(length=100)
        formatted = []
        for msg in messages:
            formatted.append({
                "id": str(msg["_id"]),
                "role": "assistant" if msg["role"] == "assistant" else "user",
                "content": msg["content"],
                "timestamp": msg["timestamp"].isoformat()
            })
        return {"success": True, "history": formatted}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/delete-message")
async def delete_chat_message(request: DeleteMessageRequest):
    try:
        result = await db.chat_history.delete_one({"_id": ObjectId(request.message_id)})
        return {"success": True, "deleted": result.deleted_count > 0, "message": "Message removed from database."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/clear")
async def clear_chat_history(request: ClearHistoryRequest):
    try:
        result = await db.chat_history.delete_many({"user_id": request.user_id})
        return {"success": True, "deleted_count": result.deleted_count, "message": "Chat history purged from database."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to clear chat history: {str(e)}")