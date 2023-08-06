from functools import lru_cache
from .database import SessionMaker


async def get_db():
    db = SessionMaker()
    try:
        yield db
    finally:
        await db.close()