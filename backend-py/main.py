import os
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger("uvicorn.error")

AI_ENABLE_FLUX   = os.getenv("AI_ENABLE_FLUX", "false").lower() == "true"
CLOUDINARY_READY = all([
    os.getenv("CLOUDINARY_CLOUD_NAME"),
    os.getenv("CLOUDINARY_API_KEY"),
    os.getenv("CLOUDINARY_API_SECRET"),
])
if not CLOUDINARY_READY:
    logger.warning("Cloudinary not fully configured. Set CLOUDINARY_* in .env.")

app = FastAPI(
    title="Event Planner AI Backend",
    description="AI-powered backend for event planning and visual composer",
    version="1.0.0"
)

default_origins = "http://localhost:5173,http://localhost:5174,http://localhost:5175"
origins = os.getenv("CORS_ORIGIN", default_origins).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in origins if o.strip()],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount visual composer router
try:
    from routers.design import router as design_router
    app.include_router(design_router, prefix="/api/design", tags=["design"])
    logger.info("Mounted /api/design router.")
except Exception as e:
    logger.warning(f"/api/design router not mounted: {e}")

@app.get("/", summary="Health Check")
def health_check():
    return {
        "status": "Event Planner AI Backend is running",
        "version": "1.0.0",
        "services": ["visual-composer"],
        "ai_enable_flux": AI_ENABLE_FLUX,
        "cloudinary_configured": CLOUDINARY_READY
    }
