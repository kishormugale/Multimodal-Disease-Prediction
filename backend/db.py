import logging
from motor.motor_asyncio import AsyncIOMotorClient
from config import settings

logger = logging.getLogger(__name__)

_client: AsyncIOMotorClient | None = None


def get_client() -> AsyncIOMotorClient:
    global _client
    if _client is None:
        _client = AsyncIOMotorClient(settings.mongo_uri)
    return _client


def get_db():
    return get_client()[settings.db_name]


def get_patients_collection():
    return get_db()["patients"]


def get_reports_collection():
    return get_db()["reports"]


DEFAULT_PATIENTS = [
    {"id": "PT-82741", "name": "Eleanor Shellstrop", "age": 36, "gender": "Female", "status": "Stable", "lastVisit": "2 hours ago"},
    {"id": "PT-99321", "name": "Chidi Anagonye", "age": 32, "gender": "Male", "status": "Critical", "lastVisit": "Critical Monitoring"},
    {"id": "PT-01293", "name": "Tahani Al-Jamil", "age": 34, "gender": "Female", "status": "Stable", "lastVisit": "Post-operative Observation"},
    {"id": "PT-44210", "name": "Jason Mendoza", "age": 28, "gender": "Male", "status": "Admitted", "lastVisit": "Triage Assessment"},
    {"id": "PT-55820", "name": "Janet Della-Denunzio", "age": 45, "gender": "Female", "status": "Stable", "lastVisit": "Regular Checkup"},
    {"id": "PT-67312", "name": "Michael Realman", "age": 51, "gender": "Male", "status": "Admitted", "lastVisit": "Neurological Assessment"},
    {"id": "PT-78410", "name": "Simone Garnett", "age": 29, "gender": "Female", "status": "Stable", "lastVisit": "Follow-up Visit"},
    {"id": "PT-89501", "name": "Doug Forcett", "age": 68, "gender": "Male", "status": "Critical", "lastVisit": "Emergency Admission"},
]


async def seed_patients() -> None:
    """Insert default patients if the collection is empty."""
    col = get_patients_collection()
    count = await col.count_documents({})
    if count == 0:
        await col.insert_many(DEFAULT_PATIENTS)
        logger.info("Seeded %d default patients into MongoDB.", len(DEFAULT_PATIENTS))
    else:
        logger.info("Patients collection already has %d records — skipping seed.", count)


async def ping_db() -> bool:
    """Return True if MongoDB is reachable."""
    try:
        await get_client().admin.command("ping")
        return True
    except Exception as exc:
        logger.error("MongoDB ping failed: %s", exc)
        return False
