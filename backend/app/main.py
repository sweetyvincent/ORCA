from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from backend.app.config import settings
from backend.app.api.routes import api_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    print(f"[ORCA] Marine Intelligence Core v{settings.VERSION} starting up...")
    print(f"[ORCA] OISST Target: {settings.ERDDAP_OISST_URL}")
    print(f"[ORCA] Chlorophyll Target: {settings.ERDDAP_CHLA_URL}")
    print(f"[ORCA] Advisory Agent: {'ENABLED' if settings.ENABLE_ADVISORY_AGENT else 'DISABLED'}")
    yield
    print("[ORCA] Marine Intelligence Core shutting down.")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="ORCA: Ocean Reasoning & Coastal Analytics Multi-Agent Intelligence System",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)

@app.get("/")
async def root():
    return {
        "system": "ORCA — Ocean Reasoning & Coastal Analytics",
        "status": "operational",
        "docs": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=True)
