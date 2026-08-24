from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.recovery import router as recovery_router
from backend.app.models.invoice import Invoice

app = FastAPI()


# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Recovery API
app.include_router(recovery_router)


@app.get("/")
def home():
    return {
        "message": "ReviveAI Backend is running!"
    }


@app.get("/api/status")
def status():
    return {
        "status": "success",
        "message": "Backend connected successfully!"
    }