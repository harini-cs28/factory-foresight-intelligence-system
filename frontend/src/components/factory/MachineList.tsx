import React, { useState } from "react";
import { MachineItem } from "../../types/machine";
import { MachineCard } from "./MachineCard";
import { Search, Filter, Layers } from "lucide-react";

interface MachineListProps {
  machines: MachineItem[];
}

export const MachineList: React.FC<MachineListProps> = ({ machines }) => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [lineFilter, setLineFilter] = useState<string>("ALL");

  const lines = Array.from(new Set(machines.map((m) => m.production_line).filter(Boolean))).sort();

  const filteredMachines = machines.filter((machine) => {
    const searchLower = searchTerm.toLowerCase().trim();
    const matchesSearch =
      !searchTerm ||
      machine.machine_id.toLowerCase().includes(searchLower) ||
      machine.process.toLowerCase().includes(searchLower) ||
      machine.production_line.toLowerCase().includes(searchLower);

    const machineStatus = machine.latest_prediction?.health_status || "HEALTHY";
    const matchesStatus =
      statusFilter === "ALL" || machineStatus.toUpperCase() === statusFilter.toUpperCase();

    const matchesLine = lineFilter === "ALL" || machine.production_line === lineFilter;

    return matchesSearch && matchesStatus && matchesLine;
  });

  return (
    <div className="space-y-6">
      {/* Search & Filtering Bar */}
      <div className="p-4 rounded-[14px] bg-[#FFFFFF] border border-[#E5E7EB] shadow-[0_2px_8px_rgba(31,41,51,0.05)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#667085]">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search machine, process or line..."
            className="w-full pl-10 pr-4 py-2 bg-[#FFFFFF] border border-[#E5E7EB] focus:border-[#F4B400] focus:ring-2 focus:ring-[#F4B400]/20 rounded-[10px] text-xs text-[#1F2933] placeholder-[#667085] transition-all outline-none"
          />
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-[#667085]" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-[10px] px-3 py-1.5 text-xs text-[#1F2933] focus:border-[#F4B400] outline-none cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="CRITICAL">Critical Only</option>
              <option value="AT_RISK">At Risk Only</option>
              <option value="HEALTHY">Healthy Only</option>
            </select>
          </div>

          {/* Line Filter */}
          <div className="flex items-center gap-2">
            <Layers className="w-3.5 h-3.5 text-[#667085]" />
            <select
              value={lineFilter}
              onChange={(e) => setLineFilter(e.target.value)}
              className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-[10px] px-3 py-1.5 text-xs text-[#1F2933] focus:border-[#F4B400] outline-none cursor-pointer"
            >
              <option value="ALL">All Lines</option>
              {lines.map((line) => (
                <option key={line} value={line}>
                  {line}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Machine Cards Grid */}
      {filteredMachines.length === 0 ? (
        <div className="text-center p-12 bg-[#FFFFFF] border border-[#E5E7EB] rounded-[14px] shadow-xs">
          <p className="text-sm font-semibold text-[#1F2933]">
            No machines found
          </p>
          <p className="text-xs text-[#667085] mt-1">
            Try a different machine ID, process, or production line.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredMachines.map((machine) => (
            <MachineCard key={machine.machine_id} machine={machine} />
          ))}
        </div>
      )}
    </div>
  );
};
