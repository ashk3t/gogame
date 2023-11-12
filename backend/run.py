#!/usr/bin/env python
import uvloop
import sys
import uvicorn
from src.database import create_all, drop_all
from src.config import settings


if __name__ == "__main__":
    if "--resetdb" in sys.argv:
        uvloop.run(create_all())
        uvloop.run(drop_all())

    elif "--dev" in sys.argv:
        uvicorn.run("src.main:app", host="0.0.0.0", port=8000, reload=True)

    else:
        print(settings.workers)
        uvicorn.run(
            "src.main:app",
            host="0.0.0.0",
            port=8000,
            workers=settings.workers,
            loop="uvloop",
            proxy_headers=False,
        )