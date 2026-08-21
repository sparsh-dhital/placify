from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes_admin import router as admin_router
from app.api.routes_student import router as student_router
from app.api.routes_panel import router as panel_router
from app.core.config import get_settings

settings = get_settings()
app = FastAPI(title="Placify API", version="1.0.0")
app.add_middleware(CORSMiddleware, allow_origins=settings.cors_origin_list, allow_credentials=True, allow_methods=["*"], allow_headers=["*"])
app.include_router(admin_router)
app.include_router(student_router)
app.include_router(panel_router)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
