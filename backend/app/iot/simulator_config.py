import os
from pathlib import Path
from pydantic_settings import BaseSettings
from app.core.config import settings


class SimulatorConfig(BaseSettings):
    SIMULATION_INTERVAL_SECONDS: float = float(os.getenv("SIMULATION_INTERVAL_SECONDS", "5.0"))
    SENSOR_DATA_CSV: Path = settings.SENSOR_DATA_CSV
    HISTORY_BUFFER_SIZE: int = 50  # Number of recent simulated readings to keep in memory per machine for trend analysis


simulator_config = SimulatorConfig()
