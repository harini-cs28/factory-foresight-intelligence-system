from sqlalchemy import Column, Integer, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database.base import Base


class MachineDependency(Base):
    __tablename__ = "machine_dependencies"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    source_machine_id = Column(Integer, ForeignKey("machines.id", ondelete="CASCADE"), nullable=False, index=True)
    target_machine_id = Column(Integer, ForeignKey("machines.id", ondelete="CASCADE"), nullable=False, index=True)
    dependency_level = Column(Integer, default=1, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    source_machine = relationship("Machine", foreign_keys=[source_machine_id], back_populates="downstream_dependencies")
    target_machine = relationship("Machine", foreign_keys=[target_machine_id], back_populates="upstream_dependencies")

    def __repr__(self) -> str:
        return f"<MachineDependency(id={self.id}, source_id={self.source_machine_id} -> target_id={self.target_machine_id})>"
