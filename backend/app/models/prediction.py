from sqlalchemy import Column, Integer, Float, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database.base import Base


class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    machine_id = Column(Integer, ForeignKey("machines.id", ondelete="CASCADE"), nullable=False, index=True)
    failure_probability = Column(Float, nullable=True)
    failure_prediction = Column(Integer, nullable=True)
    predicted_rul = Column(Float, nullable=True)
    health_status = Column(String(50), nullable=True)
    model_version = Column(String(50), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    machine = relationship("Machine", back_populates="predictions")
    recommendations = relationship("MaintenanceRecommendation", back_populates="prediction", cascade="all, delete-orphan")
    alerts = relationship("Alert", back_populates="prediction", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<Prediction(id={self.id}, machine_id={self.machine_id}, health_status='{self.health_status}')>"
