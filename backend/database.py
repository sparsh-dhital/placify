# backend/database.py
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
client = AsyncIOMotorClient(MONGO_URI)

class DatabaseProxy:
    def __init__(self, database):
        self._db = database
        self.db = database  # Enables db.db["collection"] syntax

    def __getattr__(self, name):
        return getattr(self._db, name)

db = DatabaseProxy(client.placify_db)