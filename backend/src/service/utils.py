from sqlalchemy import and_
from sqlalchemy.ext.asyncio import AsyncSession

from ..database import DBase
from ..dependencies import session
from ..models import *


async def add_commit_refresh(target: DBase):
    session.add(target)
    await session.commit()
    await session.refresh(target)


def equal_game_settings(settings):
    return and_(
        GameSettingsModel.x_size == settings.x_size,
        GameSettingsModel.y_size == settings.y_size,
        GameSettingsModel.players == settings.players,
        GameSettingsModel.mode == settings.mode,
    )