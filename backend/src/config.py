import os
import sys
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "gogame"
    workers: int = 1

    reinit_db_tables: bool = True
    clear_db_tables: bool = True

    # Filled by `.env` file
    db_driver: str = ""
    db_user: str = ""
    db_password: str = ""
    db_host: str = ""
    db_port: str = ""
    db_name: str = ""

    redis_host: str = "localhost"
    redis_port: int = 6379

    cors_allow_origins: list = [
        "http://localhost",
        "http://localhost:8080",
        "http://localhost:5173",
    ]
    cors_allow_credentials: bool = True
    cors_allow_methods: list = ["*"]
    cors_allow_headers: list = ["*"]

    default_limit: int = 18

    model_config = SettingsConfigDict(
        env_file=(
            ".dev.env"
            if (
                ("--dev" in sys.argv or "--debug" in sys.argv)
                and os.path.isfile(".dev.env")
            )
            else ".env"
        )
    )


settings = Settings()