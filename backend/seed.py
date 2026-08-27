# backend/seed.py
import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")

async def run_seed():
    client = AsyncIOMotorClient(MONGO_URI)
    db = client.placify
    
    print("🌱 Seeding MongoDB with initial data...")

    # 1. Seed Active Job
    await db.jobs.delete_many({})
    await db.jobs.insert_one({
        "id": "job_1",
        "company": "TechNova Solutions",
        "role": "Software Engineer",
        "min_cgpa": 7.5,
        "max_backlogs": 0,
        "status": "active",
        "matched_skills": ["Python", "SQL", "Git", "React"]
    })
    print("✅ Added Active Job (TechNova Solutions)")

    # 2. Seed Panels and Rooms
    await db.panels.delete_many({})
    await db.rooms.delete_many({})
    await db.panels.insert_many([{"name": "Panel A"}, {"name": "Panel B"}])
    await db.rooms.insert_many([{"name": "Room 101"}, {"name": "Room 102"}])
    print("✅ Added Interview Panels & Rooms")

    print("🚀 Database seeding complete! You can now refresh the dashboard.")

if __name__ == "__main__":
    asyncio.run(run_seed())