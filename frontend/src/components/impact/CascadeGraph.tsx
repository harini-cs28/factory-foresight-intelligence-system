import React from "react";
import { Link } from "react-router-dom";
import { ImpactResponse } from "../../types/impact";
import { ArrowRight, Layers, CheckCircle2 } from "lucide-react";

interface CascadeGraphProps {
  impact: ImpactResponse;
}

export const CascadeGraph: React.FC<CascadeGraphProps> = ({ impact }) => {
  const { origin_machine, cascade } = impact;

  // Group affected machines by cascade level
  const levelsMap: { [key: number]: typeof cascade.affected_machines } = {};
  cascade.affected_machines.forEach((m) => {
    if (!levelsMap[m.cascade_level]) {
      levelsMap[m.cascade_level] = [];
    }
    levelsMap[m.cascade_level].push(m);
  });

  const sortedLevels = Object.keys(levelsMap)
    .map(Number)
    .sort((a, b) => a - b);

  return (
    <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#E5E7EB] shadow-xs space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB]">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-[#F4B400]" />
          <h3 className="text-base font-bold text-[#1F2933]">
            Downstream Cascade Propagation Topology
          </h3>
        </div>
        <span className="text-xs text-[#667085]">
          Downstream Dependency Traversal
        </span>
      </div>

      {cascade.affected_machines.length === 0 ? (
        <div className="p-8 rounded-xl bg-[#FFFDF5] border border-emerald-200 text-center flex flex-col items-center justify-center">
          <CheckCircle2 className="w-8 h-8 text-emerald-600 mb-2" />
          <h4 className="text-sm font-bold text-[#1F2933]">Isolated Machine Topology</h4>
          <p className="text-xs text-[#667085] mt-1 max-w-md">
            Machine {origin_machine.machine_id} has no registered downstream dependencies. Failure in this unit will not propagate to other factory units.
          </p>
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-[#FFFDF5] border border-[#E5E7EB] overflow-x-auto">
          <div className="flex items-center gap-6 min-w-max py-2">
            {/* Origin Node (Level 0) */}
            <div className="flex flex-col items-center">
              <div className="text-[10px] uppercase font-bold text-rose-800 mb-2 px-2.5 py-0.5 rounded bg-rose-100 border border-rose-200">
                Origin Machine (Root)
              </div>
              <div className="w-56 p-4 rounded-xl bg-[#FFFFFF] border-2 border-[#F4B400] shadow-sm space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-base font-bold font-mono text-[#1F2933]">
                    {origin_machine.machine_id}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#FFF3C4] text-[#1F2933] font-bold">
                    Crit: {origin_machine.criticality}/5
                  </span>
                </div>
                <p className="text-xs text-[#1F2933] font-semibold">{origin_machine.process}</p>
                <p className="text-[11px] text-[#667085]">
                  Line: <strong className="text-[#1F2933]">{origin_machine.production_line}</strong>
                </p>
              </div>
            </div>

            {/* Cascade Levels */}
            {sortedLevels.map((lvl) => {
              const machinesInLevel = levelsMap[lvl];
              return (
                <React.Fragment key={lvl}>
                  {/* Transition Arrow */}
                  <div className="flex flex-col items-center text-[#667085]">
                    <ArrowRight className="w-5 h-5 text-[#F4B400]" />
                    <span className="text-[10px] text-[#667085] mt-0.5">Propagates</span>
                  </div>

                  {/* Level Column */}
                  <div className="flex flex-col items-center">
                    <div className="text-[10px] uppercase font-bold text-[#1F2933] mb-2 px-2.5 py-0.5 rounded bg-[#FFF3C4] border border-[#F4B400]/40">
                      Cascade Level {lvl} ({machinesInLevel.length})
                    </div>

                    <div className="space-y-3">
                      {machinesInLevel.map((m) => (
                        <div
                          key={m.machine_id}
                          className="w-56 p-4 rounded-xl bg-[#FFFFFF] border border-[#E5E7EB] hover:border-[#F4B400] transition-all space-y-1.5 shadow-xs"
                        >
                          <div className="flex items-center justify-between">
                            <Link
                              to={`/intelligence/${m.machine_id}`}
                              className="text-sm font-bold font-mono text-[#1F2933] hover:text-[#D99A00] flex items-center gap-1 transition-colors"
                            >
                              <span>{m.machine_id}</span>
                              <ArrowRight className="w-3 h-3 text-[#F4B400]" />
                            </Link>
                            {m.criticality && (
                              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#FFFDF5] border border-[#E5E7EB] text-[#667085]">
                                Crit: {m.criticality}/5
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-[#1F2933] font-medium">
                            {m.process || "Downstream Unit"}
                          </p>
                          <div className="text-[11px] text-[#667085] space-y-0.5 pt-1 border-t border-[#E5E7EB]/60">
                            <div>Source: <strong className="text-[#1F2933]">{m.direct_source}</strong></div>
                            <div>Line: <strong className="text-[#1F2933]">{m.production_line}</strong></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

