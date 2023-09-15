from sqlalchemy.ext.asyncio import AsyncSession

from ..schemas.game import *
from ..models import GameModel
from .utils import add_commit_refresh
from .generic import generate_basic_service_methods


class GameService:
    _get, get, get_all, create, update, delete = generate_basic_service_methods(
        GameModel, GameResponse, GameCreate, GameUpdate
    )