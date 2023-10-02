from datetime import datetime

from sqlalchemy import ForeignKey
from sqlalchemy.orm import relationship, Mapped, mapped_column

from src.schemas.player import PlayerStatus

from .schemas.game import DEFAULT_GAME_MODE, INITIAL_GAME_STATE
from .database import DBase


class BaseModel(DBase):
    __abstract__ = True
    id: Mapped[int]


class GameSettingsModel(BaseModel):
    __tablename__ = "game_settings"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    x_size: Mapped[int] = mapped_column()
    y_size: Mapped[int] = mapped_column()
    players: Mapped[int] = mapped_column()
    mode: Mapped[str] = mapped_column(default=DEFAULT_GAME_MODE)


class GameModel(BaseModel):
    __tablename__ = "game"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    game_settings_id: Mapped[int] = mapped_column(ForeignKey("game_settings.id"))
    start_time: Mapped[datetime] = mapped_column(default=datetime.utcnow)
    state: Mapped[str] = mapped_column(default=INITIAL_GAME_STATE)

    game_settings: Mapped["GameSettingsModel"] = relationship()


class PlayerModel(BaseModel):
    __tablename__ = "player"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    game_id: Mapped[int | None] = mapped_column(ForeignKey("game.id"))
    token: Mapped[str] = mapped_column(unique=True, index=True)
    nickname: Mapped[str] = mapped_column(unique=True)
    status: Mapped[str] = mapped_column(default=PlayerStatus.SEARCH)

    game: Mapped["GameModel"] = relationship()


class SearchEntryModel(BaseModel):
    __tablename__ = "search_entry"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    player_id: Mapped[int] = mapped_column(ForeignKey("player.id"))
    game_settings_id: Mapped[int] = mapped_column(ForeignKey("game_settings.id"))
    start_time: Mapped[datetime] = mapped_column(default=datetime.utcnow)

    player: Mapped["PlayerModel"] = relationship()
    game_settings: Mapped["GameSettingsModel"] = relationship()