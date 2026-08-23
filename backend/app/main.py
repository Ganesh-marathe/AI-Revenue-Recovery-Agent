from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.api.recovery import router as recovery_router
app = FastAPI()

# Allow React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
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