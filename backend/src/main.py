from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from .router import routers


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_allow_origins,
    allow_credentials=settings.cors_allow_methods,
    allow_methods=settings.cors_allow_methods,
    allow_headers=settings.cors_allow_headers,
)

for router in routers:
    app.include_router(router)