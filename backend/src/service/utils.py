from typing import Any, Sequence
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


def nest(
    parents: Sequence[BaseSchema],
    children: Sequence[BaseSchema],
    parent_id: str,
    child_id: str,
    Schema: type,
) -> list[Any]:
    """Nest one list of Pydantic models (children) to another (parents)
    using specified schema (Schema) by corresponding ids,
    when <parent_id> of <parent> equals <child_id> of <child>"""

    parents_by_id: dict[int, Schema] = {
        getattr(parent, parent_id): Schema(**parent.model_dump()) for parent in parents
    }
    for child in children:
        parents_by_id[getattr(child, child_id)].players.append(child)
    return list(parents_by_id.values())