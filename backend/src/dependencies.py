from functools import lru_cache
from .database import SessionMaker


# TODO: Try to use middleware: https://fastapi.tiangolo.com/tutorial/sql-databases/#alternative-db-session-with-middleware
async def get_db():
    db = SessionMaker()
    try:
        yield db
    finally:
        await db.close()