from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.app.database.database import Base, engine

# Models
from backend.app.models.customer import Customer
from backend.app.models.invoice import Invoice
from backend.app.models.payment import Payment
from backend.app.models.recovery_case import RecoveryCase
from backend.app.models.audit_log import AuditLog
from backend.app.models.user import User

# API Routers
from backend.app.api.invoices import router as invoices_router
from backend.app.api.recovery import router as recovery_router
from backend.app.api.customers import router as customers_router
from backend.app.api.payments import router as payments_router
from backend.app.api.analytics import router as analytics_router
from backend.app.api.auth import router as auth_router


app = FastAPI(
    title="ReviveAI Revenue Recovery API",
    version="1.0.0"
)


# ---------------------------------
# CORS
# ---------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174"
],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------
# API Routers
# ---------------------------------
all
app.include_router(auth_router)

app.include_router(recovery_router)
app.include_router(customers_router)
app.include_router(invoices_router)
app.include_router(payments_router)
app.include_router(analytics_router)


# ---------------------------------
# Create Database Tables
# ---------------------------------

Base.metadata.create_all(bind=engine)


# ---------------------------------
# Root
# ---------------------------------

@app.get("/")
def home():
    return {
        "message": "ReviveAI Backend is running!"
    }


# ---------------------------------
# Backend Status
# ---------------------------------

@app.get("/api/status")
def status():
    return {
        "status": "success",
        "message": "Backend connected successfully!"
    }