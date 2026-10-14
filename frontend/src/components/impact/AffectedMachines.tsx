import React from "react";
import { Link } from "react-router-dom";
import { AffectedMachineInfo } from "../../types/impact";
import { ArrowRight, Layers } from "lucide-react";

interface AffectedMachinesProps {
  affectedMachines: AffectedMachineInfo[];
}

export const AffectedMachines: React.FC<AffectedMachinesProps> = ({ affectedMachines }) => {
  const formatCurrency = (val?: number) => {
    if (val === undefined || val === null) return "--";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#E5E7EB] shadow-xs space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB]">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-[#F4B400]" />
          <h3 className="text-base font-bold text-[#1F2933]">
            Affected Machinery Registry &amp; Cost Analysis
          </h3>
        </div>
        <span className="text-xs text-[#667085]">
          {affectedMachines.length} Downstream Assets
        </span>
      </div>

      {affectedMachines.length === 0 ? (
        <p className="text-xs text-[#667085] py-2">No downstream machines impacted.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-[#E5E7EB] text-[#667085] uppercase tracking-wider bg-[#FFFDF5]">
                <th className="p-3">Machine ID</th>
                <th className="p-3">Process</th>
                <th className="p-3">Production Line</th>
                <th className="p-3">Cascade Level</th>
                <th className="p-3">Direct Source</th>
                <th className="p-3">Est. Repair (hrs)</th>
                <th className="p-3">Cost / Hr</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {affectedMachines.map((m) => (
                <tr key={m.machine_id} className="hover:bg-[#FFFDF5] transition-colors text-[#1F2933]">
                  <td className="p-3 font-bold font-mono text-[#1F2933]">{m.machine_id}</td>
                  <td className="p-3 text-[#1F2933] font-sans">{m.process || "--"}</td>
                  <td className="p-3 font-sans font-semibold text-[#1F2933]">{m.production_line}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded bg-[#FFF3C4] border border-[#F4B400]/40 text-[#1F2933] font-bold">
                      Level {m.cascade_level}
                    </span>
                  </td>
                  <td className="p-3 font-bold text-[#667085]">{m.direct_source}</td>
                  <td className="p-3">{m.estimated_repair_hours ? `${m.estimated_repair_hours} hrs` : "--"}</td>
                  <td className="p-3 text-rose-600 font-semibold">
                    {formatCurrency(m.estimated_downtime_cost_per_hour_inr)}
                  </td>
                  <td className="p-3 text-right">
                    <Link
                      to={`/intelligence/${m.machine_id}`}
                      className="inline-flex items-center gap-1 font-bold text-[#1F2933] hover:text-[#D99A00] transition-colors"
                    >
                      <span>Inspect</span>
                      <ArrowRight className="w-3 h-3 text-[#F4B400]" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

