from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.app.database.database import get_db
from backend.app.models.customer import Customer

router = APIRouter(
    prefix="/api/customers",
    tags=["Customers"]
)


@router.post("/")
def create_customer(
    name: str,
    email: str,
    company: str,
    db: Session = Depends(get_db)
):
    customer = Customer(
        name=name,
        email=email,
        company=company
    )

    db.add(customer)
    db.commit()
    db.refresh(customer)

    return {
        "message": "Customer created successfully!",
        "customer_id": customer.id,
        "name": customer.name,
        "email": customer.email,
        "company": customer.company
    }
@router.get("/")
def get_customers(db: Session = Depends(get_db)):
    customers = db.query(Customer).all()

    return {
        "count": len(customers),
        "customers": [
            {
                "id": customer.id,
                "name": customer.name,
                "email": customer.email,
                "company": customer.company
            }
            for customer in customers
        ]
    }