from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes_admin import router as admin_router
from app.api.routes_panel import router as panel_router
from app.api.routes_student import router as student_router

app = FastAPI(title="Placify API", version="1.0.0")
app.add_middleware(CORSMiddleware, allow_origins=["http://localhost:5173"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])
app.include_router(admin_router, prefix="/api/admin", tags=["admin"])
app.include_router(panel_router, prefix="/api/panel", tags=["panel"])
app.include_router(student_router, prefix="/api/student", tags=["student"])


@app.get("/health")
def health() -> dict[str, str]:
	return {"status": "ok", "service": "placify"}
