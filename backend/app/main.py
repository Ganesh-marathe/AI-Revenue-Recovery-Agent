from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.api.invoices import router as invoices_router
from backend.app.database.database import Base, engine
from backend.app.api.recovery import router as recovery_router
from backend.app.models.customer import Customer
from backend.app.models.invoice import Invoice
from backend.app.api.customers import router as customers_router
from backend.app.models.payment import Payment
from backend.app.api.payments import router as payments_router
from backend.app.api.analytics import router as analytics_router
from backend.app.models.recovery_case import RecoveryCase
from backend.app.models.audit_log import AuditLog
app = FastAPI()

# Allow React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(recovery_router)
app.include_router(customers_router)
app.include_router(invoices_router)
app.include_router(payments_router)
app.include_router(analytics_router)
Base.metadata.create_all(bind=engine)


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