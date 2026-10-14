from sqlalchemy import Column, Integer, Float, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database.base import Base


class MaintenanceRecord(Base):
    __tablename__ = "maintenance_records"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    machine_id = Column(Integer, ForeignKey("machines.id", ondelete="CASCADE"), nullable=False, index=True)
    maintenance_type = Column(String(50), nullable=False)  # e.g., "Preventive", "Corrective", "Predictive"
    description = Column(String(500), nullable=True)
    status = Column(String(50), default="SCHEDULED", nullable=False)  # "SCHEDULED", "IN_PROGRESS", "COMPLETED", "CANCELLED"
    scheduled_at = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    machine = relationship("Machine", back_populates="maintenance_records")

    def __repr__(self) -> str:
        return f"<MaintenanceRecord(id={self.id}, machine_id={self.machine_id}, status='{self.status}')>"


class MaintenanceRecommendation(Base):
    __tablename__ = "maintenance_recommendations"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    machine_id = Column(Integer, ForeignKey("machines.id", ondelete="CASCADE"), nullable=False, index=True)
    prediction_id = Column(Integer, ForeignKey("predictions.id", ondelete="SET NULL"), nullable=True, index=True)
    priority = Column(String(50), nullable=False)  # "CRITICAL", "HIGH", "MEDIUM", "LOW"
    recommended_action = Column(String(500), nullable=False)
    reason = Column(String(500), nullable=True)
    recommended_window = Column(String(100), nullable=True)
    estimated_repair_hours = Column(Float, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    machine = relationship("Machine", back_populates="maintenance_recommendations")
    prediction = relationship("Prediction", back_populates="recommendations")

    def __repr__(self) -> str:
        return f"<MaintenanceRecommendation(id={self.id}, machine_id={self.machine_id}, priority='{self.priority}')>"
