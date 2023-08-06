#!/usr/bin/env python
import asyncio
import sys
import uvicorn
from src.main import app


if __name__ == "__main__":
    if "--reload" in sys.argv:
        uvicorn.run("src.main:app", host="0.0.0.0", port=8000, reload=True)
    elif "--initdb" in sys.argv:
        from src.database import init_models
        asyncio.run(init_models())
    else:
        uvicorn.run(app, host="0.0.0.0", port=8000)