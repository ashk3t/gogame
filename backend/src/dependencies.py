from src.database import SessionMaker


async def get_session():
    session = SessionMaker()
    try:
        yield session
    finally:
        await session.close()