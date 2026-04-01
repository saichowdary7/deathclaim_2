from fastapi import FastAPI
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging
import asyncio

from alembic import command
from alembic.config import Config

from src.routers.party_routes import router as party_router
from src.core.exceptions import (
    AppException,
    app_exception_handler,
    validation_exception_handler
)
from src.middleware.audit import AuditMiddleware
from src.middleware.request_id import RequestIDMiddleware


logger = logging.getLogger(__name__)


def run_migrations():
    alembic_cfg = Config("alembic.ini")
    command.upgrade(alembic_cfg, "head")


@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        loop = asyncio.get_event_loop()
        await loop.run_in_executor(None, run_migrations)
        logger.info("✅ Database schema is up to date")
    except Exception as e:
        logger.error(f"❌ Alembic migration failed: {str(e)}")
        raise

    yield


app = FastAPI(
    title="Death Claims API",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Next.js dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(RequestIDMiddleware)
app.add_middleware(AuditMiddleware)

app.add_exception_handler(AppException, app_exception_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)

app.include_router(party_router)