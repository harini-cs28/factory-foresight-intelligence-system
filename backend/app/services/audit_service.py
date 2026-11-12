import logging
from typing import Optional
from sqlalchemy.orm import Session
from app.models.audit_log import AuditLog
from app.models.user import User

logger = logging.getLogger(__name__)


def record_audit_log(
    db: Session,
    action_type: str,
    resource_type: str,
    description: str,
    resource_id: Optional[str] = None,
    user: Optional[User] = None,
    result_status: str = "SUCCESS",
    commit: bool = True
) -> AuditLog:
    """
    Persists an audit event to the audit_logs table.
    """
    try:
        user_id = user.id if user else None
        user_email = user.email if user else None
        user_role = user.role if user else None

        audit_entry = AuditLog(
            user_id=user_id,
            user_email=user_email,
            user_role=user_role,
            action_type=action_type,
            resource_type=resource_type,
            resource_id=str(resource_id) if resource_id is not None else None,
            description=description,
            result_status=result_status,
        )
        db.add(audit_entry)
        if commit:
            db.commit()
            db.refresh(audit_entry)
        return audit_entry
    except Exception as e:
        logger.error(f"Failed to record audit log: {e}")
        if commit:
            db.rollback()
        raise e

