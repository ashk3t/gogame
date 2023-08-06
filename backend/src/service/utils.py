from sqlalchemy.ext.asyncio import AsyncSession

from ..database import DBase


async def add_commit_refresh(db: AsyncSession, target: DBase):
    db.add(target)
    await db.commit()
    await db.refresh(target)