import uuid
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..schemas.player import *
from ..models import PlayerModel
from .utils import add_commit_refresh
from .generic import delete_query_factory, get_all_query_factory, get_query_factory


get_player = get_query_factory(PlayerModel)
get_all_players = get_all_query_factory(PlayerModel)
delete_player = delete_query_factory(PlayerModel)


async def get_player_by_token(db: AsyncSession, token: str) -> PlayerModel:
    result = await db.execute(select(PlayerModel).where(PlayerModel.token == token))
    return result.scalars().one()


async def create_player(db: AsyncSession, player: PlayerCreate):
    db_player = PlayerModel(token=uuid.uuid4(), nickname=player.nickname)
    await add_commit_refresh(db, db_player)
    return db_player


async def update_player(db: AsyncSession, id: int, player: PlayerUpdate) -> PlayerModel:
    db_player = await get_player(db, id)
    db_player.nickname = player.nickname
    db_player.role = player.role
    await add_commit_refresh(db, db_player)
    return db_player