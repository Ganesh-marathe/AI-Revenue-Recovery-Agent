from backend.app.database.database import SessionLocal
from backend.app.models.customer import Customer
from backend.app.models.invoice import Invoice
from backend.app.models.payment import Payment
from backend.app.models.recovery_case import RecoveryCase


db = SessionLocal()


def main():
    print("\n========================================")
    print("ReviveAI Relationship Data Fix")
    print("========================================\n")

    # -------------------------------------------------
    # 1. Create / update demo customers
    # -------------------------------------------------

    customers_data = [
        {
            "name": "Acme Technologies",
            "email": "billing@acmetech.com",
            "company": "Acme Technologies",
        },
        {
            "name": "TechNova Solutions",
            "email": "accounts@technova.com",
            "company": "TechNova Solutions",
        },
        {
            "name": "Bright Systems",
            "email": "finance@brightsystems.com",
            "company": "Bright Systems",
        },
        {
            "name": "Global Enterprises",
            "email": "billing@globalenterprises.com",
            "company": "Global Enterprises",
        },
        {
            "name": "Innovate Labs",
            "email": "accounts@innovatelabs.com",
            "company": "Innovate Labs",
        },
    ]

    customers = []

    for index, data in enumerate(customers_data, start=1):

        customer = (
            db.query(Customer)
            .filter(Customer.email == data["email"])
            .first()
        )

        if customer:
            customer.name = data["name"]
            customer.company = data["company"]
        else:
            customer = Customer(
                name=data["name"],
                email=data["email"],
                company=data["company"],
            )
            db.add(customer)
            db.flush()

        customers.append(customer)

    db.commit()

    # Refresh objects
    for customer in customers:
        db.refresh(customer)

    print("Customers ready:")

    for customer in customers:
        print(
            f"  Customer {customer.id}: "
            f"{customer.name}"
        )

    # -------------------------------------------------
    # 2. Load invoices
    # -------------------------------------------------

    invoices = (
        db.query(Invoice)
        .order_by(Invoice.id.asc())
        .all()
    )

    print(
        f"\nInvoices found: {len(invoices)}"
    )

    # -------------------------------------------------
    # 3. Assign invoices across customers
    # -------------------------------------------------

    for index, invoice in enumerate(invoices):

        customer = customers[
            index % len(customers)
        ]

        invoice.customer_id = customer.id

        print(
            f"  Invoice INV-{invoice.id} "
            f"-> {customer.name}"
        )

    db.commit()

    # -------------------------------------------------
    # 4. Fix payment relationships
    # -------------------------------------------------

    payments = (
        db.query(Payment)
        .all()
    )

    print(
        f"\nPayments found: {len(payments)}"
    )

    for payment in payments:

        invoice = (
            db.query(Invoice)
            .filter(
                Invoice.id == payment.invoice_id
            )
            .first()
        )

        if invoice:
            payment.customer_id = (
                invoice.customer_id
            )

            print(
                f"  Payment {payment.id} "
                f"-> Invoice {invoice.id} "
                f"-> Customer {invoice.customer_id}"
            )

    db.commit()

    # -------------------------------------------------
    # 5. Fix recovery case relationships
    # -------------------------------------------------

    cases = (
        db.query(RecoveryCase)
        .all()
    )

    print(
        f"\nRecovery cases found: {len(cases)}"
    )

    for case in cases:

        invoice = (
            db.query(Invoice)
            .filter(
                Invoice.id == case.invoice_id
            )
            .first()
        )

        if invoice:
            case.customer_id = (
                invoice.customer_id
            )

            print(
                f"  Case {case.id} "
                f"-> Invoice {invoice.id} "
                f"-> Customer {invoice.customer_id}"
            )

    db.commit()

    # -------------------------------------------------
    # 6. Final verification
    # -------------------------------------------------

    print("\n========================================")
    print("FINAL RELATIONSHIP CHECK")
    print("========================================\n")

    for invoice in invoices:

        customer = (
            db.query(Customer)
            .filter(
                Customer.id == invoice.customer_id
            )
            .first()
        )

        payment_count = (
            db.query(Payment)
            .filter(
                Payment.invoice_id == invoice.id
            )
            .count()
        )

        case_count = (
            db.query(RecoveryCase)
            .filter(
                RecoveryCase.invoice_id == invoice.id
            )
            .count()
        )

        customer_name = (
            customer.name
            if customer
            else "UNKNOWN"
        )

        print(
            f"INV-{invoice.id:<4} | "
            f"{customer_name:<24} | "
            f"Payments: {payment_count:<2} | "
            f"Cases: {case_count}"
        )

    print("\n========================================")
    print("Relationship fix completed successfully!")
    print("========================================\n")


if __name__ == "__main__":
    try:
        main()
    except Exception as error:
        db.rollback()
        print("\nERROR:")
        print(error)
        raise
    finally:
        db.close()