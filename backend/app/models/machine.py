from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database.base import Base


class ProductionLine(Base):
    __tablename__ = "production_lines"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    line_name = Column(String(50), unique=True, index=True, nullable=False)
    description = Column(String(255), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    def __repr__(self) -> str:
        return f"<ProductionLine(id={self.id}, line_name='{self.line_name}')>"


class Machine(Base):
    __tablename__ = "machines"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    machine_id = Column(String(50), unique=True, index=True, nullable=False)
    process = Column(String(100), nullable=False)
    production_line = Column(String(50), nullable=False)
    criticality = Column(String(50), nullable=False, default="MEDIUM")
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    predictions = relationship(
        "Prediction",
        back_populates="machine",
        cascade="all, delete-orphan",
        lazy="selectin"
    )
    maintenance_records = relationship(
        "MaintenanceRecord",
        back_populates="machine",
        cascade="all, delete-orphan",
        lazy="selectin"
    )
    maintenance_recommendations = relationship(
        "MaintenanceRecommendation",
        back_populates="machine",
        cascade="all, delete-orphan",
        lazy="selectin"
    )
    alerts = relationship(
        "Alert",
        back_populates="machine",
        cascade="all, delete-orphan",
        lazy="selectin"
    )
    downstream_dependencies = relationship(
        "MachineDependency",
        foreign_keys="MachineDependency.source_machine_id",
        back_populates="source_machine",
        cascade="all, delete-orphan"
    )
    upstream_dependencies = relationship(
        "MachineDependency",
        foreign_keys="MachineDependency.target_machine_id",
        back_populates="target_machine",
        cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<Machine(id={self.id}, machine_id='{self.machine_id}', process='{self.process}')>"
