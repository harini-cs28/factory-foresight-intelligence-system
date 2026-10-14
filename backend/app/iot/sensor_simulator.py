import asyncio
import logging
from pathlib import Path
from typing import Dict, List, Any, Optional
import pandas as pd

from app.iot.simulator_config import simulator_config
from app.iot.sensor_state import sensor_state_manager

logger = logging.getLogger(__name__)

REQUIRED_SENSOR_FIELDS = [
    "machine_id",
    "cycle",
    "temperature_c",
    "vibration_mm_s",
    "motor_current_a",
    "rpm",
    "pressure_bar",
    "load_percentage",
]


class SensorSimulator:
    """
    Simulates real-time sensor streams from existing textile manufacturing CSV datasets.
    Iterates sequentially through actual machine cycles at configurable time intervals.
    """

    def __init__(self, data_csv_path: Optional[Path] = None, interval_seconds: Optional[float] = None):
        self.csv_path = data_csv_path or simulator_config.SENSOR_DATA_CSV
        self.interval_seconds = interval_seconds or simulator_config.SIMULATION_INTERVAL_SECONDS
        self._grouped_data: Dict[str, List[Dict[str, Any]]] = {}
        self._machine_indices: Dict[str, int] = {}
        self._is_running: bool = False
        self._task: Optional[asyncio.Task] = None
        self._load_and_validate_dataset()

    def _load_and_validate_dataset(self) -> None:
        """
        Loads the sensor dataset from CSV, validates required columns,
        and groups records sequentially by machine_id.
        """
        if not self.csv_path.exists():
            logger.error(f"Sensor dataset file not found at: {self.csv_path}")
            return

        try:
            df = pd.read_csv(self.csv_path)

            # Check required fields
            missing_fields = [f for f in REQUIRED_SENSOR_FIELDS if f not in df.columns]
            if missing_fields:
                logger.error(f"Sensor dataset is missing required columns: {missing_fields}")
                return

            # Sort by machine_id and cycle
            df_sorted = df.sort_values(by=["machine_id", "cycle"])

            grouped = {}
            for machine_id, group in df_sorted.groupby("machine_id"):
                machine_str = str(machine_id).strip()
                records = []
                for _, row in group.iterrows():
                    try:
                        record = {
                            "machine_id": machine_str,
                            "cycle": int(row["cycle"]),
                            "temperature_c": round(float(row["temperature_c"]), 2),
                            "vibration_mm_s": round(float(row["vibration_mm_s"]), 2),
                            "motor_current_a": round(float(row["motor_current_a"]), 2),
                            "rpm": round(float(row["rpm"]), 2),
                            "pressure_bar": round(float(row["pressure_bar"]), 2),
                            "load_percentage": round(float(row["load_percentage"]), 2),
                            "operating_hours": round(float(row.get("operating_hours", 3000)), 1),
                            "maintenance_count": int(row.get("maintenance_count", 2)),
                            "process": str(row.get("process", "Textile Manufacturing")),
                            "production_line": str(row.get("production_line", "Line-A")),
                        }
                        records.append(record)
                    except (ValueError, TypeError) as val_err:
                        logger.warning(f"Skipping malformed sensor row for {machine_str}: {val_err}")

                if records:
                    grouped[machine_str] = records
                    self._machine_indices[machine_str] = 0

            self._grouped_data = grouped
            logger.info(
                f"Sensor simulator initialized with {len(self._grouped_data)} machines and "
                f"{sum(len(r) for r in self._grouped_data.values())} total valid readings."
            )

            # Seed initial state with cycle 0 so APIs immediately have valid readings
            self.step_simulation()

        except Exception as e:
            logger.error(f"Failed to load and parse sensor dataset: {e}")

    def step_simulation(self) -> Dict[str, Dict[str, Any]]:
        """
        Advances the simulation forward by one cycle for every machine,
        updating the in-memory state manager. Returns the updated readings dict.
        """
        updated_readings = {}
        for machine_id, records in self._grouped_data.items():
            if not records:
                continue

            idx = self._machine_indices.get(machine_id, 0)
            current_reading = records[idx]

            # Update state manager
            sensor_state_manager.update_machine_reading(current_reading)
            updated_readings[machine_id] = current_reading

            # Advance index sequentially, wrapping around smoothly when end of dataset is reached
            self._machine_indices[machine_id] = (idx + 1) % len(records)

        return updated_readings

    async def _run_loop(self) -> None:
        """Background asynchronous execution loop."""
        logger.info(f"Sensor simulator background loop started with interval={self.interval_seconds}s.")
        while self._is_running:
            try:
                self.step_simulation()
            except Exception as e:
                logger.error(f"Error during sensor simulation step: {e}")

            try:
                await asyncio.sleep(self.interval_seconds)
            except asyncio.CancelledError:
                logger.info("Sensor simulator background loop cancelled.")
                break

    def start(self) -> None:
        """Starts the background simulator task."""
        if self._is_running:
            logger.warning("Sensor simulator is already running.")
            return

        self._is_running = True
        try:
            loop = asyncio.get_running_loop()
            self._task = loop.create_task(self._run_loop())
            logger.info("Sensor simulator background task scheduled.")
        except RuntimeError:
            logger.warning("No running asyncio event loop found to schedule simulator background task.")

    def stop(self) -> None:
        """Stops the background simulator task."""
        self._is_running = False
        if self._task and not self._task.done():
            self._task.cancel()
            self._task = None
            logger.info("Sensor simulator stopped.")

    @property
    def is_running(self) -> bool:
        return self._is_running

    def get_loaded_machines(self) -> List[str]:
        return sorted(list(self._grouped_data.keys()))


# Global singleton simulator instance
sensor_simulator = SensorSimulator()
