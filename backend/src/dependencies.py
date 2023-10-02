from sqlalchemy.ext.asyncio import AsyncSession
from src.database import SessionMaker


session: AsyncSession = SessionMaker()