from sqlalchemy.ext.asyncio import AsyncSession

from ..database import DBase
from ..main import session


async def add_commit_refresh(target: DBase):
    session.add(target)
    await session.commit()
    await session.refresh(target)