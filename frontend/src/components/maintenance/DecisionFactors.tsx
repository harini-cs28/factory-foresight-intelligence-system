import React from "react";
import { DecisionFactors as FactorsType } from "../../types/maintenance";
import {
  Activity,
  Clock,
  Shield,
  Layers,
  Users,
  Package,
  Calendar,
  AlertTriangle,
  SlidersHorizontal,
} from "lucide-react";

interface DecisionFactorsProps {
  factors?: FactorsType;
}

export const DecisionFactors: React.FC<DecisionFactorsProps> = ({ factors }) => {
  if (!factors) {
    return null;
  }

  const items = [
    {
      label: "Failure Likelihood",
      value: `${(factors.failure_probability * 100).toFixed(1)}%`,
      icon: <Activity className="w-4 h-4 text-[#D99A00]" />,
      highlight: factors.failure_probability > 0.5 ? "text-rose-600 font-bold" : "text-emerald-600",
    },
    {
      label: "Predicted RUL",
      value: `${factors.predicted_rul.toFixed(1)} Cycles`,
      icon: <Clock className="w-4 h-4 text-[#667085]" />,
      highlight: factors.predicted_rul < 20 ? "text-rose-600 font-bold" : "text-[#1F2933]",
    },
    {
      label: "Machine Health Classification",
      value: factors.health_status,
      icon: <Shield className="w-4 h-4 text-[#D99A00]" />,
      highlight: "text-[#1F2933] font-bold",
    },
    {
      label: "Machinery Criticality",
      value: factors.machine_criticality,
      icon: <AlertTriangle className="w-4 h-4 text-[#D99A00]" />,
      highlight: "text-amber-700 font-bold",
    },
    {
      label: "Cascade Impact Severity",
      value: factors.impact_severity,
      icon: <Layers className="w-4 h-4 text-[#D99A00]" />,
      highlight: "text-rose-600 font-bold",
    },
    {
      label: "Downstream Blocked Assets",
      value: `${factors.affected_machine_count} Machines`,
      icon: <Layers className="w-4 h-4 text-[#667085]" />,
      highlight: "text-[#1F2933] font-bold",
    },
    {
      label: "Assigned Technician Available",
      value: factors.technician_available ? "YES (Available)" : "NO (Blocked)",
      icon: <Users className="w-4 h-4 text-[#D99A00]" />,
      highlight: factors.technician_available ? "text-emerald-700" : "text-rose-600 font-bold",
    },
    {
      label: "Critical Spare Part In-Stock",
      value: factors.spare_part_available ? "IN STOCK" : "OUT OF STOCK",
      icon: <Package className="w-4 h-4 text-[#D99A00]" />,
      highlight: factors.spare_part_available ? "text-emerald-700" : "text-rose-600 font-bold",
    },
    {
      label: "Assigned Production Window",
      value: factors.maintenance_window,
      icon: <Calendar className="w-4 h-4 text-[#667085]" />,
      highlight: "text-[#1F2933]",
    },
  ];

  return (
    <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#E5E7EB] shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-5 h-5 text-[#D99A00]" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#1F2933] font-mono">
            Decision Factor Evaluation Matrix
          </h3>
        </div>
        <span className="text-xs text-[#667085]">
          Prescriptive Evaluation Inputs
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {items.map((item, index) => (
          <div
            key={index}
            className="p-3.5 rounded-xl bg-[#FFFDF5] border border-[#E5E7EB] space-y-1"
          >
            <div className="flex items-center gap-2 text-[#667085] text-[11px]">
              {item.icon}
              <span className="uppercase font-medium">{item.label}</span>
            </div>
            <div className={`text-xs pl-6 font-mono ${item.highlight}`}>
              {item.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
