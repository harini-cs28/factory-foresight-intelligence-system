import {
  Group,
  Mesh,
  BoxGeometry,
  MeshStandardMaterial,
  ArrowHelper,
  Vector3,
} from "three";
import { MachineItem } from "../../types/machine";

export interface LineLayoutConfig {
  lineName: string;
  zOffset: number;
  colorHex: number;
  machines: MachineItem[];
}

export const calculateMachinePositions = (
  machines: MachineItem[],
  selectedLine: string
): { [machineId: string]: [number, number, number] } => {
  const positions: { [machineId: string]: [number, number, number] } = {};

  // Group machines by production line
  const linesMap: { [line: string]: MachineItem[] } = {};
  machines.forEach((m) => {
    if (!linesMap[m.production_line]) {
      linesMap[m.production_line] = [];
    }
    linesMap[m.production_line].push(m);
  });

  const lineKeys = Object.keys(linesMap).sort();
  const lineSpacing = 8.5; // Z distance between lines
  const machineSpacing = 4.8; // X distance between machines in a line

  lineKeys.forEach((lineKey, lineIdx) => {
    const lineMachines = linesMap[lineKey];
    // Center the line along X
    const startX = -((lineMachines.length - 1) * machineSpacing) / 2;
    const zPos = (lineIdx - (lineKeys.length - 1) / 2) * lineSpacing;

    lineMachines.forEach((machine, mIdx) => {
      const xPos = startX + mIdx * machineSpacing;
      positions[machine.machine_id] = [xPos, 0, zPos];
    });
  });

  return positions;
};

export const createProductionLineVisuals = (
  machines: MachineItem[],
  positions: { [machineId: string]: [number, number, number] },
  activeCascadeIds: string[]
): Group => {
  const lineGroup = new Group();

  // Group machines by line
  const linesMap: { [line: string]: MachineItem[] } = {};
  machines.forEach((m) => {
    if (!linesMap[m.production_line]) linesMap[m.production_line] = [];
    linesMap[m.production_line].push(m);
  });

  // 1. Conveyor / Pathway linking machines in each line
  Object.keys(linesMap).forEach((lineKey) => {
    const lineMachines = linesMap[lineKey];
    if (lineMachines.length < 2) return;

    for (let i = 0; i < lineMachines.length - 1; i++) {
      const m1 = lineMachines[i];
      const m2 = lineMachines[i + 1];
      const p1 = positions[m1.machine_id];
      const p2 = positions[m2.machine_id];

      if (!p1 || !p2) continue;

      const isCascadeLink =
        activeCascadeIds.includes(m1.machine_id) && activeCascadeIds.includes(m2.machine_id);

      // Conveyor track
      const trackLength = Math.abs(p2[0] - p1[0]);
      const trackGeo = new BoxGeometry(trackLength, 0.08, 0.8);
      const trackMat = new MeshStandardMaterial({
        color: isCascadeLink ? 0xf43f5e : 0x1e293b,
        metalness: 0.6,
        roughness: 0.4,
      });
      const track = new Mesh(trackGeo, trackMat);
      track.position.set((p1[0] + p2[0]) / 2, 0.04, p1[2]);
      lineGroup.add(track);

      // Flow direction arrow helper
      const dir = new Vector3(1, 0, 0);
      const origin = new Vector3((p1[0] + p2[0]) / 2 - 0.4, 0.15, p1[2]);
      const arrow = new ArrowHelper(
        dir,
        origin,
        0.8,
        isCascadeLink ? 0xf43f5e : 0x0ea5e9,
        0.3,
        0.2
      );
      lineGroup.add(arrow);
    }
  });

  return lineGroup;
};
