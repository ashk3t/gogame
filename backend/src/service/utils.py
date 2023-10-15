from typing import Sequence
from sqlalchemy import and_
from pydantic import BaseModel as BaseSchema
from sqlalchemy.ext.asyncio import AsyncSession

from ..database import DBase
from ..models import *


def list_model_dump(data: Sequence[BaseSchema]):
    return [v.model_dump() for v in data]


async def add_commit_refresh(ss: AsyncSession, target: DBase):
    ss.add(target)
    await ss.commit()
    await ss.refresh(target)


def equal_game_settings(settings):
    return and_(
        GameSettingsModel.height == settings.height,
        GameSettingsModel.width == settings.width,
        GameSettingsModel.players == settings.players,
        GameSettingsModel.mode == settings.mode,
    )

def turn_color(game_rep: str):
    return StoneColor(int(game_rep.split(";")[3]) - 1)