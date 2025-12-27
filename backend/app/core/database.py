import os
import urllib.parse
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

# 1. Get raw credentials
username = os.getenv("MONGO_USER", "admin")
password = os.getenv("MONGO_PASSWORD", "")
cluster = os.getenv("MONGO_CLUSTER", "")
db_name = "recipe_db"

# 2. Escape them automatically (Fixes the RFC 3986 error)
escaped_username = urllib.parse.quote_plus(username)
escaped_password = urllib.parse.quote_plus(password)

# 3. Construct the URI safely
# If MONGO_URI is manually set in .env, use that. Otherwise, build it.
if os.getenv("MONGO_URI"):
    MONGO_URI = os.getenv("MONGO_URI")
else:
    MONGO_URI = f"mongodb+srv://{escaped_username}:{escaped_password}@{cluster}/?retryWrites=true&w=majority"

class Database:
    client: AsyncIOMotorClient = None

db = Database()

async def connect_to_mongo():
    try:
        db.client = AsyncIOMotorClient(MONGO_URI)
        await db.client.admin.command('ping')
        print(f"✅ Successfully connected to MongoDB Atlas!")
    except Exception as e:
        print(f"❌ MongoDB Connection Error: {e}")

async def close_mongo_connection():
    if db.client:
        db.client.close()
        print("🔒 MongoDB connection closed.")

def get_database():
    return db.client[db_name]