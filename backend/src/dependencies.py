from .database import SessionMaker, redis_connection_pool


async def get_session():
    session = SessionMaker()
    try:
        yield session
    finally:
        await session.close()