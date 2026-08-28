# backend/seed.py
import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from passlib.context import CryptContext

load_dotenv()
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password):
    return pwd_context.hash(password)

async def run_seed():
    client = AsyncIOMotorClient(MONGO_URI)
    db = client.placify_db  # Matches the database name in database.py
    
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
        "required_skills": ["Python", "SQL", "Git", "React"]
    })
    print("✅ Added Active Job (TechNova Solutions)")

    # 2. Seed Panels and Rooms
    await db.panels.delete_many({})
    await db.rooms.delete_many({})
    await db.panels.insert_many([{"name": "Panel A"}, {"name": "Panel B"}])
    await db.rooms.insert_many([{"name": "Room 101"}, {"name": "Room 102"}])
    print("✅ Added Interview Panels & Rooms")

    # 3. Seed Default Login Users
    existing_user = await db.users.find_one({"email": "student@placify.com"})
    if not existing_user:
        test_users = [
            {
                "name": "Demo Student", 
                "email": "student@placify.com", 
                "password": get_password_hash("password123"), 
                "role": "student"
            },
            {
                "name": "Demo Admin", 
                "email": "admin@placify.com", 
                "password": get_password_hash("password123"), 
                "role": "admin"
            },
            {
                "name": "Demo Panelist", 
                "email": "panelist@placify.com", 
                "password": get_password_hash("password123"), 
                "role": "panelist"
            }
        ]
        await db.users.insert_many(test_users)
        print("✅ Created default login accounts!")
    else:
        print("ℹ️ Default login accounts already exist.")

    print("🚀 Database seeding complete! You can now log in.")

if __name__ == "__main__":
    asyncio.run(run_seed())