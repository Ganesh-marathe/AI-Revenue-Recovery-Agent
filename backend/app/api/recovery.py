from fastapi import APIRouter

router = APIRouter(
    prefix="/api/recovery",
    tags=["Recovery"]
)


@router.get("/status")
def recovery_status():
    return {
        "status": "success",
        "message": "Recovery API is working!"
    }