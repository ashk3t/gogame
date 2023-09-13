from datetime import datetime

from sqlalchemy import ForeignKey
from sqlalchemy.orm import relationship, Mapped, mapped_column

from src.schemas.player import PlayerStatus

from .schemas.game import INITIAL_GAME_STATE
from .database import DBase


class BaseModel(DBase):
    id: Mapped[int]


class GameModel(BaseModel):
    __tablename__ = "game"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    white_player_id: Mapped[int] = mapped_column(ForeignKey("player.id"))
    black_player_id: Mapped[int] = mapped_column(ForeignKey("player.id"))
    start_time: Mapped[datetime] = mapped_column(default=datetime.utcnow)
    state: Mapped[str] = mapped_column(default=INITIAL_GAME_STATE)

    white_player: Mapped["PlayerModel"] = relationship(foreign_keys=[white_player_id])
    black_player: Mapped["PlayerModel"] = relationship(foreign_keys=[black_player_id])


class PlayerModel(BaseModel):
    __tablename__ = "player"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    token: Mapped[str] = mapped_column(unique=True, index=True)
    nickname: Mapped[str] = mapped_column(unique=True)
    status: Mapped[str] = mapped_column(default=PlayerStatus.SEARCH)


class SearchEntryModel(BaseModel):
    __tablename__ = "search_entry"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    player_id: Mapped[int] = mapped_column(ForeignKey("player.id"))
    start_time: Mapped[datetime] = mapped_column(default=datetime.utcnow)
    mode: Mapped[str] = mapped_column()

    player: Mapped["PlayerModel"] = relationship()