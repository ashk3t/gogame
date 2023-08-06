from sqlalchemy.ext.asyncio import AsyncSession

from ..schemas.game import *
from ..models import GameModel
from .utils import add_commit_refresh
from .generic import delete_query_factory, get_all_query_factory, get_query_factory


get_game = get_query_factory(GameModel)
get_all_games = get_all_query_factory(GameModel)
delete_game = delete_query_factory(GameModel)


async def create_game(db: AsyncSession, game: GameCreate) -> GameModel:
    db_game = GameModel(**game.model_dump())
    await add_commit_refresh(db, db_game)
    return db_game


async def update_game(db: AsyncSession, id: int, game: GameUpdate) -> GameModel:
    db_game = await get_game(db, id)
    db_game.state = game.state
    await add_commit_refresh(db, db_game)
    return db_game