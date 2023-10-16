from datetime import datetime
from sqlalchemy import ForeignKey
from sqlalchemy.orm import relationship, Mapped, mapped_column

from .lib.gamelogic import StoneColor
from .schemas.game import GameMode
from .database import DBase


class BaseModel(DBase):
    __abstract__ = True
    id: Mapped[int]


class GameSettingsModel(BaseModel):
    __tablename__ = "game_settings"

    id: Mapped[int] = mapped_column(primary_key=True)
    height: Mapped[int] = mapped_column(default=19)
    width: Mapped[int] = mapped_column(default=19)
    players: Mapped[int] = mapped_column(default=2)
    mode: Mapped[str] = mapped_column(default=GameMode.CLASSIC)


class GameModel(BaseModel):
    __tablename__ = "game"

    id: Mapped[int] = mapped_column(primary_key=True)
    settings_id: Mapped[int] = mapped_column(ForeignKey("game_settings.id"), index=True)
    search_start_time: Mapped[datetime] = mapped_column(default=datetime.utcnow)
    start_time: Mapped[datetime | None] = mapped_column(default=None)
    rep: Mapped[str| None] = mapped_column(default=None)

    settings: Mapped["GameSettingsModel"] = relationship()


class PlayerModel(BaseModel):
    __tablename__ = "player"

    id: Mapped[int] = mapped_column(primary_key=True)
    game_id: Mapped[int] = mapped_column(ForeignKey("game.id", ondelete="CASCADE"), index=True)
    token: Mapped[str] = mapped_column(unique=True, index=True)
    nickname: Mapped[str] = mapped_column()
    color: Mapped[int] = mapped_column(default=StoneColor.NONE)
    spectator: Mapped[bool] = mapped_column(default=False)

    game: Mapped["GameModel"] = relationship()