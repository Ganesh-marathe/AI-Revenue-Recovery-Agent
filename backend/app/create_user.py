from backend.app.database.database import SessionLocal
from backend.app.models.user import User
from backend.app.auth import hash_password


db = SessionLocal()

username = "admin"
email = "admin@reviveai.com"
password = "ReviveAI@123"


existing_user = (
    db.query(User)
    .filter(User.username == username)
    .first()
)

if existing_user:
    print("User already exists.")
else:

    new_user = User(
        username=username,
        email=email,
        hashed_password=hash_password(password),
        is_active=True
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    print("User created successfully!")
    print("Username:", username)
    print("Email:", email)
    print("User ID:", new_user.id)


db.close()