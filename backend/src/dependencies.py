from sqlalchemy.ext.asyncio import AsyncSession
from src.database import SessionMaker


async def get_session():
    session = SessionMaker()
    try:
        yield session
    except:
        await session.rollback()
    finally:
        await session.close()
