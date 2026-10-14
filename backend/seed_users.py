"""
Seed script to populate development users across all 4 FFIS roles.
Password for all initial prototype users is: 12345 (hashed with bcrypt).
Safe and idempotent to run multiple times without duplicating or dropping data.
"""
import sys
import logging
from sqlalchemy import select
from app.database.session import SessionLocal
from app.models.user import User
from app.core.security import hash_password

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

INITIAL_USERS = [
    {
        "name": "Admin",
        "email": "admin@gmail.com",
        "password": "12345",
        "role": "ADMIN",
        "is_active": True
    },
    {
        "name": "Maintenance Engineer",
        "email": "engineer@gmail.com",
        "password": "12345",
        "role": "MAINTENANCE_ENGINEER",
        "is_active": True
    },
    {
        "name": "Production Manager",
        "email": "production@gmail.com",
        "password": "12345",
        "role": "PRODUCTION_MANAGER",
        "is_active": True
    },
    {
        "name": "Plant Manager",
        "email": "manager@gmail.com",
        "password": "12345",
        "role": "PLANT_MANAGER",
        "is_active": True
    }
]


def seed_users():
    db = SessionLocal()
    try:
        created_count = 0
        existing_count = 0

        for user_data in INITIAL_USERS:
            stmt = select(User).where(User.email == user_data["email"])
            existing_user = db.execute(stmt).scalar_one_or_none()

            if not existing_user:
                hashed = hash_password(user_data["password"])
                new_user = User(
                    name=user_data["name"],
                    email=user_data["email"],
                    password_hash=hashed,
                    role=user_data["role"],
                    is_active=user_data["is_active"]
                )
                db.add(new_user)
                created_count += 1
                logger.info(f"Created user: {user_data['email']} ({user_data['role']})")
            else:
                existing_count += 1
                logger.info(f"User already exists: {user_data['email']} ({existing_user.role})")

        db.commit()
        print(f"\nUser seeding completed successfully: {created_count} created, {existing_count} already existed.")
        return True
    except Exception as e:
        db.rollback()
        logger.error(f"Error during user seeding: {e}")
        return False
    finally:
        db.close()


if __name__ == "__main__":
    success = seed_users()
    sys.exit(0 if success else 1)
