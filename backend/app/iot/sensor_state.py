from collections import deque
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
import threading
import logging

from app.iot.simulator_config import simulator_config
from app.ml.predictor import predict_machine_health

logger = logging.getLogger(__name__)


class SensorStateManager:
    """
    Thread-safe in-memory state manager that holds the latest simulated
    sensor readings and recent historical trend buffers for all factory machines.
    """

    def __init__(self, history_buffer_size: int = simulator_config.HISTORY_BUFFER_SIZE):
        self._lock = threading.Lock()
        self._history_buffer_size = history_buffer_size
        self._latest_state: Dict[str, Dict[str, Any]] = {}
        self._history: Dict[str, deque] = {}
        self._prediction_cache: Dict[str, Dict[str, Any]] = {}

    def update_machine_reading(self, reading: Dict[str, Any]) -> None:
        """
        Updates the latest simulated reading for a machine, records it in the
        trend history buffer, and recalculates its live ML prediction.
        """
        machine_id = reading.get("machine_id")
        if not machine_id:
            logger.warning("Attempted to update sensor state with missing machine_id.")
            return

        with self._lock:
            # Store latest reading with current timestamp
            enhanced_reading = {
                **reading,
                "timestamp": datetime.now(timezone.utc).isoformat()
            }
            self._latest_state[machine_id] = enhanced_reading

            # Append to rolling history buffer
            if machine_id not in self._history:
                self._history[machine_id] = deque(maxlen=self._history_buffer_size)
            self._history[machine_id].append(enhanced_reading)

            # Automatically run ML inference pipeline on the new reading
            try:
                features = {
                    "temperature_c": float(reading.get("temperature_c", 0.0)),
                    "vibration_mm_s": float(reading.get("vibration_mm_s", 0.0)),
                    "motor_current_a": float(reading.get("motor_current_a", 0.0)),
                    "rpm": float(reading.get("rpm", 0.0)),
                    "pressure_bar": float(reading.get("pressure_bar", 0.0)),
                    "load_percentage": float(reading.get("load_percentage", 0.0)),
                    "operating_hours": float(reading.get("operating_hours", 3000.0)),
                    "maintenance_count": int(reading.get("maintenance_count", 2)),
                }
                pred = predict_machine_health(features, machine_id=machine_id)
                self._prediction_cache[machine_id] = pred
            except Exception as e:
                logger.error(f"Error computing live prediction for {machine_id}: {e}")

    def get_latest_reading(self, machine_id: str) -> Optional[Dict[str, Any]]:
        """Returns the latest reading for a specific machine."""
        with self._lock:
            return self._latest_state.get(machine_id)

    def get_all_latest_readings(self) -> List[Dict[str, Any]]:
        """Returns the list of latest readings for all machines."""
        with self._lock:
            return list(self._latest_state.values())

    def get_machine_history(self, machine_id: str, limit: int = 30) -> List[Dict[str, Any]]:
        """Returns the recent historical readings buffer for a specific machine."""
        with self._lock:
            if machine_id not in self._history:
                return []
            history_list = list(self._history[machine_id])
            return history_list[-limit:]

    def get_latest_prediction(self, machine_id: str) -> Optional[Dict[str, Any]]:
        """Returns the cached live prediction result for a machine."""
        with self._lock:
            return self._prediction_cache.get(machine_id)

    def get_all_latest_predictions(self) -> Dict[str, Dict[str, Any]]:
        """Returns live predictions for all machines."""
        with self._lock:
            return dict(self._prediction_cache)

    def get_tracked_machines(self) -> List[str]:
        """Returns a list of all machine IDs currently tracked in state."""
        with self._lock:
            return sorted(list(self._latest_state.keys()))

    def clear(self) -> None:
        """Clears in-memory simulator state (useful for tests)."""
        with self._lock:
            self._latest_state.clear()
            self._history.clear()
            self._prediction_cache.clear()


# Global singleton instance
sensor_state_manager = SensorStateManager()
