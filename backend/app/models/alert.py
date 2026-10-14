from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database.base import Base


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    machine_id = Column(Integer, ForeignKey("machines.id", ondelete="CASCADE"), nullable=False, index=True)
    prediction_id = Column(Integer, ForeignKey("predictions.id", ondelete="SET NULL"), nullable=True, index=True)
    alert_type = Column(String(50), nullable=False, index=True)  # FAILURE_RISK, LOW_RUL, HIGH_CASCADE_IMPACT, MAINTENANCE_REQUIRED, CRITICAL_MACHINE_RISK
    severity = Column(String(50), nullable=False, index=True)    # CRITICAL, HIGH, MEDIUM, LOW
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    recommended_action = Column(Text, nullable=True)
    is_acknowledged = Column(Boolean, default=False, nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False, index=True)
    acknowledged_at = Column(DateTime(timezone=True), nullable=True)
    acknowledged_by_user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

    # Relationships
    machine = relationship("Machine", back_populates="alerts")
    prediction = relationship("Prediction", back_populates="alerts")
    acknowledged_by = relationship("User", foreign_keys=[acknowledged_by_user_id])

    def __repr__(self) -> str:
        return f"<Alert(id={self.id}, machine_id={self.machine_id}, type='{self.alert_type}', severity='{self.severity}', is_ack={self.is_acknowledged})>"
