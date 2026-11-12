from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Index
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database.base import Base


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now(), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    user_email = Column(String(255), nullable=True, index=True)
    user_role = Column(String(50), nullable=True, index=True)
    action_type = Column(String(100), nullable=False, index=True)  # e.g., USER_UPDATE, ROLE_CHANGE, MACHINE_UPDATE, CONFIG_UPDATE
    resource_type = Column(String(100), nullable=False, index=True)  # e.g., USER, MACHINE, CONFIG, ALERT
    resource_id = Column(String(100), nullable=True, index=True)
    description = Column(Text, nullable=False)
    result_status = Column(String(50), nullable=False, default="SUCCESS", index=True)  # SUCCESS, FAILURE

    # Relationship to user
    user = relationship("User", foreign_keys=[user_id])

    def __repr__(self) -> str:
        return f"<AuditLog(id={self.id}, action='{self.action_type}', resource='{self.resource_type}:{self.resource_id}', status='{self.result_status}')>"

