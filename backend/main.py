from fastapi import FastAPI
from app.core.db import supabase
from app.api.routes_admin import router as admin_router


app = FastAPI(title="Placify API")

app.include_router(admin_router)


@app.get("/")
def root():
    return {
        "ok": True,
        "message": "Placify API is running"
    }


@app.get("/api/test-db")
def test_db():
    response = supabase.table("students").select("id, name, cgpa").limit(3).execute()

    return {
        "ok": True,
        "students": response.data
    }