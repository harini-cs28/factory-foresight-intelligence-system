import React, { useState } from "react";
import { SensorReading } from "../../types/sensor";
import { TrendingUp, Activity, Thermometer, Zap, Layers } from "lucide-react";

interface SensorTrendProps {
  history: SensorReading[];
  machineId: string;
}

type MetricKey = "temperature_c" | "vibration_mm_s" | "motor_current_a" | "load_percentage";

interface MetricOption {
  key: MetricKey;
  label: string;
  unit: string;
  color: string;
  stroke: string;
  fill: string;
  icon: any;
}

const METRIC_OPTIONS: MetricOption[] = [
  {
    key: "temperature_c",
    label: "Temperature",
    unit: "°C",
    color: "text-amber-700",
    stroke: "#D99A00",
    fill: "rgba(244, 180, 0, 0.12)",
    icon: Thermometer,
  },
  {
    key: "vibration_mm_s",
    label: "Vibration",
    unit: "mm/s",
    color: "text-rose-600",
    stroke: "#e11d48",
    fill: "rgba(225, 29, 72, 0.12)",
    icon: Activity,
  },
  {
    key: "motor_current_a",
    label: "Current",
    unit: "A",
    color: "text-[#1F2933]",
    stroke: "#F4B400",
    fill: "rgba(244, 180, 0, 0.15)",
    icon: Zap,
  },
  {
    key: "load_percentage",
    label: "Load",
    unit: "%",
    color: "text-emerald-700",
    stroke: "#059669",
    fill: "rgba(5, 150, 105, 0.12)",
    icon: Layers,
  },
];

export const SensorTrend: React.FC<SensorTrendProps> = ({ history, machineId }) => {
  const [selectedMetric, setSelectedMetric] = useState<MetricKey>("temperature_c");

  const currentOption =
    METRIC_OPTIONS.find((o) => o.key === selectedMetric) || METRIC_OPTIONS[0];

  if (!history || history.length === 0) {
    return (
      <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 text-center shadow-xs">
        <TrendingUp size={32} className="mx-auto text-[#667085] mb-2" />
        <p className="text-sm font-semibold text-[#1F2933]">Awaiting historical data points...</p>
        <p className="text-xs text-[#667085] mt-1">
          Historical readings will populate as the simulator cycles.
        </p>
      </div>
    );
  }

  // Calculate points for SVG rendering
  const values = history.map((h) => Number(h[selectedMetric]) || 0);
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const range = maxVal - minVal || 1;

  const svgWidth = 600;
  const svgHeight = 160;
  const paddingX = 20;
  const paddingY = 20;
  const chartWidth = svgWidth - paddingX * 2;
  const chartHeight = svgHeight - paddingY * 2;

  const points = values.map((val, idx) => {
    const x =
      paddingX +
      (values.length > 1 ? (idx / (values.length - 1)) * chartWidth : chartWidth / 2);
    const y = paddingY + chartHeight - ((val - minVal) / range) * chartHeight;
    return { x, y, val, cycle: history[idx].cycle };
  });

  const pathData = points.reduce((acc, pt, idx) => {
    return `${acc} ${idx === 0 ? "M" : "L"} ${pt.x.toFixed(1)},${pt.y.toFixed(1)}`;
  }, "");

  const areaData = `${pathData} L ${points[points.length - 1].x},${svgHeight - paddingY} L ${points[0].x},${svgHeight - paddingY} Z`;

  return (
    <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-xs">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-sm font-bold text-[#1F2933] flex items-center gap-2">
            <TrendingUp size={16} className="text-[#D99A00]" />
            <span>Simulated Telemetry Trend — {machineId}</span>
          </h3>
          <p className="text-xs text-[#667085] mt-0.5">
            Real-time trajectory over the last {history.length} cycles
          </p>
        </div>

        {/* Metric Selector Buttons */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#F8F9FA] border border-[#E5E7EB]">
          {METRIC_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              onClick={() => setSelectedMetric(opt.key)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                selectedMetric === opt.key
                  ? "bg-[#FFF3C4] text-[#1F2933] shadow-xs border border-[#F4B400]/40"
                  : "text-[#667085] hover:text-[#1F2933]"
              }`}
            >
              <span>{opt.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 mb-4 text-xs">
        <div className="p-2.5 rounded-xl bg-[#FFFDF5] border border-[#E5E7EB]">
          <span className="text-[#667085] block">Min Observed</span>
          <span className="text-sm font-bold font-mono text-[#1F2933]">
            {minVal.toFixed(1)} {currentOption.unit}
          </span>
        </div>
        <div className="p-2.5 rounded-xl bg-[#FFFDF5] border border-[#E5E7EB]">
          <span className="text-[#667085] block">Latest Reading</span>
          <span className={`text-sm font-bold font-mono ${currentOption.color}`}>
            {values[values.length - 1].toFixed(1)} {currentOption.unit}
          </span>
        </div>
        <div className="p-2.5 rounded-xl bg-[#FFFDF5] border border-[#E5E7EB]">
          <span className="text-[#667085] block">Max Observed</span>
          <span className="text-sm font-bold font-mono text-[#1F2933]">
            {maxVal.toFixed(1)} {currentOption.unit}
          </span>
        </div>
      </div>

      {/* SVG Chart */}
      <div className="relative w-full overflow-hidden rounded-xl bg-[#FFFDF5] border border-[#E5E7EB] p-2">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-36 overflow-visible"
          preserveAspectRatio="none"
        >
          {/* Subtle horizontal grid lines */}
          <line
            x1={paddingX}
            y1={paddingY}
            x2={svgWidth - paddingX}
            y2={paddingY}
            stroke="#E5E7EB"
            strokeDasharray="4 4"
          />
          <line
            x1={paddingX}
            y1={paddingY + chartHeight / 2}
            x2={svgWidth - paddingX}
            y2={paddingY + chartHeight / 2}
            stroke="#E5E7EB"
            strokeDasharray="4 4"
          />
          <line
            x1={paddingX}
            y1={svgHeight - paddingY}
            x2={svgWidth - paddingX}
            y2={svgHeight - paddingY}
            stroke="#E5E7EB"
            strokeDasharray="4 4"
          />

          {/* Fill area under curve */}
          <path d={areaData} fill={currentOption.fill} />

          {/* Line stroke */}
          <path
            d={pathData}
            fill="none"
            stroke={currentOption.stroke}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Dots on points */}
          {points.map((pt, i) => (
            <circle
              key={i}
              cx={pt.x}
              cy={pt.y}
              r={i === points.length - 1 ? 4.5 : 2.5}
              fill={i === points.length - 1 ? "#F4B400" : currentOption.stroke}
              stroke={currentOption.stroke}
              strokeWidth="2"
            />
          ))}
        </svg>
      </div>
    </div>
  );
};
