from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "gogame"

    # Filled by `.env` file
    db_driver: str = ""
    db_user: str = ""
    db_password: str = ""
    db_host: str = ""
    db_port: str = ""
    db_name: str = ""

    cors_allow_origins: list = [
        "http://localhost",
        "http://localhost:8080",
    ]
    cors_allow_credentials: bool = True
    cors_allow_methods: list = ["*"]
    cors_allow_headers: list = ["*"]

    model_config = SettingsConfigDict(env_file=".env")


settings = Settings()