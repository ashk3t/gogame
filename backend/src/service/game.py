from typing import Any
from pydantic import ValidationError
from sqlalchemy.exc import NoResultFound
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.sql.functions import count as sql_count
from sqlalchemy import Select, and_, select, true
import sqlalchemy as alc
from sqlalchemy.orm import selectinload

from ..config import settings
from ..lib.gamelogic import GameBoard
from ..schemas import *
from ..models import GameModel, GameSettingsModel
from .generic import generate_basic_service_methods
from ..service.utils import add_commit_refresh, equal_game_settings


class GameService:
    get, get_all, create, update, delete = generate_basic_service_methods(
        GameModel, GameResponse, GameCreate, GameUpdate
    )

    @staticmethod
    def base_game_stmt(
        *columns,
        searching: bool = False,
        settings: GameSettingsOptional = GameSettingsOptional(),
    ) -> Select[Any]:
        return select(*columns).where(
            and_(
                GameModel.start_time == None
                if searching
                else GameModel.start_time != None,
                GameModel.settings.has(equal_game_settings(settings)),
            )
        )

    @staticmethod
    async def get_ext(ss: AsyncSession, id: int) -> GameExtendedResponse:
        result = await ss.execute(
            select(GameModel)
            .options(selectinload(GameModel.settings))
            .where(GameModel.id == id)
        )
        return GameExtendedResponse.model_validate(result.scalars().one())

    @staticmethod
    async def get_many_ext(
        ss: AsyncSession, ids: list[int]
    ) -> list[GameExtendedResponse]:
        result = await ss.execute(
            select(GameModel)
            .options(selectinload(GameModel.settings))
            .where(GameModel.id.in_(ids))
        )
        return list(map(GameExtendedResponse.model_validate, result.scalars()))

    @staticmethod
    async def get_all_ext(
        ss: AsyncSession,
        offset: int = 0,
        limit: int = settings.default_limit,
        searching: bool = False,
        **kwargs,
    ) -> list[GameExtendedResponse]:
        stmt = GameService.base_game_stmt(GameModel, searching=searching, **kwargs)

        result = await ss.execute(
            stmt.order_by(
                GameModel.search_start_time
                if searching
                else GameModel.start_time.desc()
            )
            .options(selectinload(GameModel.settings))
            .offset(offset)
            .limit(limit)
        )
        return list(map(GameExtendedResponse.model_validate, result.scalars()))

    @staticmethod
    async def count(ss: AsyncSession, **kwargs) -> int:
        stmt = GameService.base_game_stmt(sql_count(GameModel.id), **kwargs)
        result = await ss.execute(stmt)
        return result.scalars().one()

    @staticmethod
    async def find_relevant(ss: AsyncSession, settings_id: int) -> GameResponse | None:
        try:
            result = await ss.execute(
                select(GameModel)
                .where(
                    and_(
                        GameModel.start_time == None,
                        GameModel.settings_id == settings_id,
                    )
                )
                .order_by(GameModel.search_start_time),
            )
            return GameResponse.model_validate(result.scalars().first())
        except ValidationError:
            return

    @staticmethod
    async def start(ss: AsyncSession, id: int) -> GameResponse:
        settings = (await GameService.get_ext(ss, id)).settings
        rep = GameBoard(settings.height, settings.width, settings.players).to_rep()
        result = await ss.execute(
            alc.update(GameModel)
            .where(GameModel.id == id)
            .values(rep=rep, start_time=datetime.utcnow())
            .returning(GameModel)
        )
        model = result.scalars().one()
        await add_commit_refresh(ss, model)
        return GameResponse.model_validate(model)


class GameSettingsService:
    get, get_all, create, _, delete = generate_basic_service_methods(
        GameSettingsModel, GameSettingsResponse, GameSettingsCreate, None
    )

    @staticmethod
    async def find_same(
        ss: AsyncSession, settings: GameSettingsBase
    ) -> GameSettingsResponse | None:
        try:
            result = await ss.execute(
                select(GameSettingsModel).where(equal_game_settings(settings))
            )
            return GameSettingsResponse.model_validate(result.scalars().one())
        except NoResultFound:
            return

    @staticmethod
    async def clear(ss: AsyncSession) -> GameSettingsResponse | None:
        await ss.execute(
            alc.delete(GameSettingsModel).where(
                GameSettingsModel.id.in_(
                    select(GameSettingsModel.id)
                    .outerjoin(GameModel)
                    .group_by(GameSettingsModel.id)
                    .having(sql_count(GameModel.id) == 0)
                )
            )
        )
        await ss.commit()