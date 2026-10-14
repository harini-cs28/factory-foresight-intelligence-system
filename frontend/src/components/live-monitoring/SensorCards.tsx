import React from "react";
import { Thermometer, Activity, Zap, RotateCw, Gauge, Cpu } from "lucide-react";
import { SensorValueCard } from "./SensorValueCard";
import { SensorReading } from "../../types/sensor";

interface SensorCardsProps {
  reading: SensorReading;
}

export const SensorCards: React.FC<SensorCardsProps> = ({ reading }) => {
  // Assess nominal ranges for textile machinery
  const tempStatus =
    reading.temperature_c > 85 ? "critical" : reading.temperature_c > 75 ? "warning" : "normal";
  const vibStatus =
    reading.vibration_mm_s > 6.0 ? "critical" : reading.vibration_mm_s > 4.0 ? "warning" : "normal";
  const currentStatus =
    reading.motor_current_a > 18.0
      ? "critical"
      : reading.motor_current_a > 15.0
      ? "warning"
      : "normal";
  const loadStatus =
    reading.load_percentage > 90.0
      ? "critical"
      : reading.load_percentage > 80.0
      ? "warning"
      : "normal";
  const pressStatus =
    reading.pressure_bar > 5.5 ? "critical" : reading.pressure_bar > 4.5 ? "warning" : "normal";

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <SensorValueCard
        label="Operating Temperature"
        value={reading.temperature_c}
        unit="°C"
        icon={Thermometer}
        normalRange="45 - 75 °C"
        status={tempStatus}
      />
      <SensorValueCard
        label="Vibration Velocity"
        value={reading.vibration_mm_s}
        unit="mm/s"
        icon={Activity}
        normalRange="1.0 - 4.0 mm/s"
        status={vibStatus}
      />
      <SensorValueCard
        label="Motor Current"
        value={reading.motor_current_a}
        unit="A"
        icon={Zap}
        normalRange="8.0 - 15.0 A"
        status={currentStatus}
      />
      <SensorValueCard
        label="Rotational Speed"
        value={reading.rpm}
        unit="RPM"
        icon={RotateCw}
        normalRange="1200 - 1600 RPM"
        status="normal"
      />
      <SensorValueCard
        label="Operating Pressure"
        value={reading.pressure_bar}
        unit="bar"
        icon={Gauge}
        normalRange="2.5 - 4.5 bar"
        status={pressStatus}
      />
      <SensorValueCard
        label="Mechanical Load"
        value={reading.load_percentage}
        unit="%"
        icon={Cpu}
        normalRange="40 - 80 %"
        status={loadStatus}
      />
    </div>
  );
};
