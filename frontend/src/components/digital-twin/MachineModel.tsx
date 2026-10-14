import {
  Group,
  Mesh,
  LineSegments,
  BoxGeometry,
  CylinderGeometry,
  SphereGeometry,
  RingGeometry,
  EdgesGeometry,
  MeshStandardMaterial,
  MeshBasicMaterial,
  LineBasicMaterial,
  DoubleSide,
} from "three";
import { MachineItem } from "../../types/machine";

export interface Machine3DNode {
  machine: MachineItem;
  position: [number, number, number];
  rotation?: [number, number, number];
  meshGroup: Group;
  beaconMesh: Mesh;
  haloMesh: Mesh;
  selectBox: LineSegments;
}

export const getStatusColorHex = (status?: string | null): number => {
  const s = (status || "UNKNOWN").toUpperCase();
  if (s === "HEALTHY" || s === "NORMAL") return 0x22c55e;
  if (s === "AT_RISK" || s === "MEDIUM") return 0xf59e0b;
  if (s === "CRITICAL" || s === "HIGH") return 0xef4444;
  return 0x64748b; // Grey
};

export const createMachine3DGroup = (
  machine: MachineItem,
  position: [number, number, number],
  isSelected: boolean,
  isCascadeAffected: boolean
): Machine3DNode => {
  const group = new Group();
  group.position.set(...position);
  group.userData = { machineId: machine.machine_id, machine };

  const statusColor = getStatusColorHex(machine.latest_prediction?.health_status);

  // 1. Concrete Base Plinth
  const plinthGeo = new BoxGeometry(2.4, 0.25, 2.4);
  const plinthMat = new MeshStandardMaterial({
    color: 0x11222c,
    roughness: 0.8,
    metalness: 0.2,
  });
  const plinth = new Mesh(plinthGeo, plinthMat);
  plinth.position.y = 0.125;
  plinth.receiveShadow = true;
  group.add(plinth);

  // 2. Yellow Safety Strip on Plinth Edge
  const stripGeo = new BoxGeometry(2.44, 0.04, 2.44);
  const stripMat = new MeshBasicMaterial({ color: 0xeab308 });
  const strip = new Mesh(stripGeo, stripMat);
  strip.position.y = 0.23;
  group.add(strip);

  // 3. Main Machinery Chassis Body
  const bodyGeo = new BoxGeometry(1.8, 1.4, 1.8);
  const bodyMat = new MeshStandardMaterial({
    color: 0x163a4a,
    roughness: 0.4,
    metalness: 0.6,
  });
  const body = new Mesh(bodyGeo, bodyMat);
  body.position.y = 0.95;
  body.castShadow = true;
  body.receiveShadow = true;
  group.add(body);

  // 4. Machinery specific geometric details based on Process
  const proc = machine.process.toLowerCase();
  if (proc.includes("spin") || proc.includes("ring")) {
    // Spindle cylinders
    for (let i = -0.5; i <= 0.5; i += 0.5) {
      for (let j = -0.5; j <= 0.5; j += 0.5) {
        const spindleGeo = new CylinderGeometry(0.08, 0.08, 0.6, 12);
        const spindleMat = new MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8, roughness: 0.2 });
        const spindle = new Mesh(spindleGeo, spindleMat);
        spindle.position.set(i, 1.95, j);
        group.add(spindle);
      }
    }
  } else if (proc.includes("card") || proc.includes("draw")) {
    // Carding Drum
    const drumGeo = new CylinderGeometry(0.5, 0.5, 1.4, 20);
    const drumMat = new MeshStandardMaterial({ color: 0x315a68, metalness: 0.7, roughness: 0.3 });
    const drum = new Mesh(drumGeo, drumMat);
    drum.rotation.z = Math.PI / 2;
    drum.position.y = 1.9;
    group.add(drum);
  } else if (proc.includes("weav") || proc.includes("loom")) {
    // Weaving Loom top gantry
    const gantryGeo = new BoxGeometry(1.6, 0.15, 1.6);
    const gantryMat = new MeshStandardMaterial({ color: 0x38bdf8, metalness: 0.6 });
    const gantry = new Mesh(gantryGeo, gantryMat);
    gantry.position.y = 1.9;
    group.add(gantry);

    const pillarGeo = new CylinderGeometry(0.06, 0.06, 0.5);
    const pillarMat = new MeshStandardMaterial({ color: 0x64748b, metalness: 0.8 });
    const p1 = new Mesh(pillarGeo, pillarMat);
    p1.position.set(-0.7, 1.65, -0.7);
    const p2 = new Mesh(pillarGeo, pillarMat);
    p2.position.set(0.7, 1.65, 0.7);
    group.add(p1, p2);
  } else if (proc.includes("dye")) {
    // Dyeing Vat Tank
    const vatGeo = new CylinderGeometry(0.65, 0.65, 0.7, 16);
    const vatMat = new MeshStandardMaterial({ color: 0x0284c7, metalness: 0.5, roughness: 0.4 });
    const vat = new Mesh(vatGeo, vatMat);
    vat.position.y = 1.95;
    group.add(vat);
  } else {
    // General Module cap
    const capGeo = new BoxGeometry(1.4, 0.3, 1.4);
    const capMat = new MeshStandardMaterial({ color: 0x334155, metalness: 0.5 });
    const cap = new Mesh(capGeo, capMat);
    cap.position.y = 1.8;
    group.add(cap);
  }

  // 5. LED Status Beacon on Top Mast
  const mastGeo = new CylinderGeometry(0.04, 0.04, 0.6, 8);
  const mastMat = new MeshBasicMaterial({ color: 0x475569 });
  const mast = new Mesh(mastGeo, mastMat);
  mast.position.y = 2.4;
  group.add(mast);

  const beaconGeo = new SphereGeometry(0.22, 16, 16);
  const beaconMat = new MeshStandardMaterial({
    color: statusColor,
    emissive: statusColor,
    emissiveIntensity: 0.8,
    roughness: 0.2,
    metalness: 0.3,
  });
  const beaconMesh = new Mesh(beaconGeo, beaconMat);
  beaconMesh.position.y = 2.75;
  group.add(beaconMesh);

  // Status Halo Pulse Ring
  const haloGeo = new RingGeometry(0.3, 0.45, 24);
  const haloMat = new MeshBasicMaterial({
    color: statusColor,
    side: DoubleSide,
    transparent: true,
    opacity: 0.6,
  });
  const haloMesh = new Mesh(haloGeo, haloMat);
  haloMesh.rotation.x = Math.PI / 2;
  haloMesh.position.y = 2.75;
  group.add(haloMesh);

  // 6. Selection Bounding Box / Cascade Highlight
  const boxOutlineGeo = new BoxGeometry(2.6, 3.2, 2.6);
  const edges = new EdgesGeometry(boxOutlineGeo);
  const lineMat = new LineBasicMaterial({
    color: isSelected ? 0x38bdf8 : isCascadeAffected ? 0xf43f5e : 0x315a68,
    linewidth: isSelected ? 2 : 1,
    transparent: true,
    opacity: isSelected ? 0.95 : isCascadeAffected ? 0.8 : 0.0,
  });
  const selectBox = new LineSegments(edges, lineMat);
  selectBox.position.y = 1.6;
  group.add(selectBox);

  return {
    machine,
    position,
    meshGroup: group,
    beaconMesh,
    haloMesh,
    selectBox,
  };
};
