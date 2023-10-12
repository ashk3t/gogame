from typing import Sequence
from sqlalchemy import and_
from pydantic import BaseModel as BaseSchema

from ..database import DBase
from ..dependencies import session
from ..models import *


def list_model_dump(data: Sequence[BaseSchema]):
    return [v.model_dump() for v in data]


async def add_commit_refresh(target: DBase):
    session.add(target)
    await session.commit()
    await session.refresh(target)


def equal_game_settings(settings):
    return and_(
        GameSettingsModel.height == settings.height,
        GameSettingsModel.width == settings.width,
        GameSettingsModel.players == settings.players,
        GameSettingsModel.mode == settings.mode,
    )