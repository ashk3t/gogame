#!/usr/bin/env python
import asyncio
import sys
import uvicorn
from src.main import app


if __name__ == "__main__":
    if "--hardresetdb" in sys.argv:
        from src.database import hardreset_database
        asyncio.run(hardreset_database())

    elif "--reload" in sys.argv:
        uvicorn.run("src.main:app", host="0.0.0.0", port=8000, reload=True)

    else:
        uvicorn.run(app, host="0.0.0.0", port=8000)