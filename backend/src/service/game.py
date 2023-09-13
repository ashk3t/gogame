from sqlalchemy.ext.asyncio import AsyncSession

from ..schemas.game import *
from ..models import GameModel
from .utils import add_commit_refresh
from .generic import BaseModelService


class GameService(BaseModelService):
    Model = GameModel
    ResponseSchema = GameResponse
    CreateSchema = GameCreate
    UpdateSchema = GameUpdate