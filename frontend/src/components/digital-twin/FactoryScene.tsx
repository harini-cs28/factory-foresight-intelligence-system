import React, { useEffect, useRef, useState } from "react";
import {
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  PCFSoftShadowMap,
  AmbientLight,
  DirectionalLight,
  PointLight,
  Color,
  FogExp2,
  Raycaster,
  Vector2,
  Vector3,
  Clock,
  Object3D,
  MeshStandardMaterial,
} from "three";
import { MachineItem } from "../../types/machine";
import { createMachine3DGroup, Machine3DNode } from "./MachineModel";
import { createFactoryFloorGroup } from "./FactoryFloor";
import { calculateMachinePositions, createProductionLineVisuals } from "./ProductionLine";
import { MachineTooltip } from "./MachineTooltip";
import { MachineMarker } from "./MachineMarker";
import {
  DEFAULT_CAMERA_PRESET,
  LINE_CAMERA_PRESETS,
  SimpleOrbitControls,
} from "./CameraControls";

interface FactorySceneProps {
  machines: MachineItem[];
  selectedMachineId: string | null;
  selectedLine: string;
  activeCascadeIds: string[];
  onSelectMachine: (machine: MachineItem | null) => void;
  resetCameraTrigger: number;
}

export const FactoryScene: React.FC<FactorySceneProps> = ({
  machines,
  selectedMachineId,
  selectedLine,
  activeCascadeIds,
  onSelectMachine,
  resetCameraTrigger,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredMachine, setHoveredMachine] = useState<MachineItem | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);
  const [markerPositions, setMarkerPositions] = useState<{
    [machineId: string]: { x: number; y: number };
  }>({});

  const sceneRef = useRef<Scene | null>(null);
  const cameraRef = useRef<PerspectiveCamera | null>(null);
  const rendererRef = useRef<WebGLRenderer | null>(null);
  const controlsRef = useRef<SimpleOrbitControls | null>(null);
  const machineNodesRef = useRef<Machine3DNode[]>([]);
  const animFrameIdRef = useRef<number | null>(null);

  // Filter machines based on selectedLine
  const displayedMachines =
    selectedLine === "ALL"
      ? machines
      : machines.filter((m) => m.production_line === selectedLine);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Scene Setup
    const scene = new Scene();
    scene.background = new Color(0xf8f9fa);
    scene.fog = new FogExp2(0xf8f9fa, 0.012);
    sceneRef.current = scene;

    // 2. Camera
    const camera = new PerspectiveCamera(45, width / height, 0.5, 200);
    camera.position.set(...DEFAULT_CAMERA_PRESET.position);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = PCFSoftShadowMap;
    container.innerHTML = "";
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. OrbitControls
    const controls = new SimpleOrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.05; // Don't go below floor
    controls.minDistance = 6;
    controls.maxDistance = 65;
    controls.target.set(...DEFAULT_CAMERA_PRESET.target);
    controlsRef.current = controls;

    // 5. Lighting
    const ambientLight = new AmbientLight(0xffffff, 1.1);
    scene.add(ambientLight);

    const dirLight = new DirectionalLight(0xffffff, 1.3);
    dirLight.position.set(15, 25, 15);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    dirLight.shadow.camera.near = 1;
    dirLight.shadow.camera.far = 80;
    dirLight.shadow.camera.left = -25;
    dirLight.shadow.camera.right = 25;
    dirLight.shadow.camera.top = 25;
    dirLight.shadow.camera.bottom = -25;
    scene.add(dirLight);

    const yellowAccentLight = new PointLight(0xf4b400, 0.8, 40);
    yellowAccentLight.position.set(-10, 10, -5);
    scene.add(yellowAccentLight);

    // 6. Factory Floor
    const floor = createFactoryFloorGroup(50, 34);
    scene.add(floor);

    // 7. Raycasting & Interaction
    const raycaster = new Raycaster();
    const mouse = new Vector2();

    const getIntersectedMachine = (event: MouseEvent): MachineItem | null => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const meshesToTest: Object3D[] = [];
      machineNodesRef.current.forEach((n) => meshesToTest.push(...n.meshGroup.children));

      const intersects = raycaster.intersectObjects(meshesToTest, true);
      if (intersects.length > 0) {
        let parent: Object3D | null = intersects[0].object;
        while (parent && !parent.userData?.machineId) {
          parent = parent.parent;
        }
        if (parent && parent.userData?.machine) {
          return parent.userData.machine as MachineItem;
        }
      }
      return null;
    };

    const handleMouseMove = (event: MouseEvent) => {
      const foundMachine = getIntersectedMachine(event);
      if (foundMachine) {
        setHoveredMachine(foundMachine);
        setTooltipPos({ x: event.clientX, y: event.clientY });
        container.style.cursor = "pointer";
      } else {
        setHoveredMachine(null);
        setTooltipPos(null);
        container.style.cursor = "default";
      }
    };

    const handleClick = (event: MouseEvent) => {
      const foundMachine = getIntersectedMachine(event);
      if (foundMachine) {
        onSelectMachine(foundMachine);
      }
    };

    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    renderer.domElement.addEventListener("mousemove", handleMouseMove);
    renderer.domElement.addEventListener("click", handleClick);
    window.addEventListener("resize", handleResize);

    // 8. Animation Loop
    let clock = new Clock();
    const animate = () => {
      animFrameIdRef.current = requestAnimationFrame(animate);

      const elapsedTime = clock.getElapsedTime();
      controls.update();

      // Animate Status Beacons & Halo Rings
      machineNodesRef.current.forEach((node) => {
        if (node.haloMesh) {
          const scale = 1.0 + 0.3 * Math.sin(elapsedTime * 3.5);
          node.haloMesh.scale.set(scale, scale, scale);
        }
        if (node.beaconMesh) {
          const intensity = 0.6 + 0.4 * Math.sin(elapsedTime * 3.0);
          (node.beaconMesh.material as MeshStandardMaterial).emissiveIntensity = intensity;
        }
      });

      // Project 3D positions to 2D screen coordinates for marker overlays
      const newMarkerPositions: { [id: string]: { x: number; y: number } } = {};
      const rect = renderer.domElement.getBoundingClientRect();

      machineNodesRef.current.forEach((node) => {
        const worldPos = new Vector3();
        node.meshGroup.getWorldPosition(worldPos);
        worldPos.y += 3.2; // Top of machine

        // Check if behind camera
        worldPos.project(camera);
        if (worldPos.z < 1) {
          const screenX = ((worldPos.x + 1) * rect.width) / 2 + rect.left;
          const screenY = ((-worldPos.y + 1) * rect.height) / 2 + rect.top;
          newMarkerPositions[node.machine.machine_id] = { x: screenX, y: screenY };
        }
      });

      setMarkerPositions(newMarkerPositions);

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      renderer.domElement.removeEventListener("mousemove", handleMouseMove);
      renderer.domElement.removeEventListener("click", handleClick);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
    };
  }, []);

  // Update Machinery Nodes when displayed machines or selection changes
  useEffect(() => {
    if (!sceneRef.current) return;
    const scene = sceneRef.current;

    // Remove existing machines and line visuals
    machineNodesRef.current.forEach((node) => scene.remove(node.meshGroup));
    machineNodesRef.current = [];

    const existingLines = scene.getObjectByName("production_lines_visuals");
    if (existingLines) scene.remove(existingLines);

    // Calculate positions
    const positions = calculateMachinePositions(displayedMachines, selectedLine);

    // Build 3D Machines
    const nodes: Machine3DNode[] = [];
    displayedMachines.forEach((machine) => {
      const pos = positions[machine.machine_id] || [0, 0, 0];
      const isSelected = selectedMachineId === machine.machine_id;
      const isCascade = activeCascadeIds.includes(machine.machine_id);

      const node = createMachine3DGroup(machine, pos, isSelected, isCascade);
      scene.add(node.meshGroup);
      nodes.push(node);
    });
    machineNodesRef.current = nodes;

    // Build Production Lines Connectors
    const lineVisuals = createProductionLineVisuals(
      displayedMachines,
      positions,
      activeCascadeIds
    );
    lineVisuals.name = "production_lines_visuals";
    scene.add(lineVisuals);
  }, [displayedMachines, selectedMachineId, activeCascadeIds, selectedLine]);

  // Handle Camera Reset
  useEffect(() => {
    if (!cameraRef.current || !controlsRef.current) return;
    const preset =
      selectedLine !== "ALL" && LINE_CAMERA_PRESETS[selectedLine]
        ? LINE_CAMERA_PRESETS[selectedLine]
        : DEFAULT_CAMERA_PRESET;

    cameraRef.current.position.set(...preset.position);
    controlsRef.current.target.set(...preset.target);
    controlsRef.current.update();
  }, [resetCameraTrigger, selectedLine]);

  return (
    <div className="relative w-full h-[620px] rounded-2xl overflow-hidden border border-[#E5E7EB] shadow-xs bg-[#F8F9FA]">
      {/* Three.js Container */}
      <div ref={containerRef} className="w-full h-full" />

      {/* Floating 2D Marker Overlays */}
      {displayedMachines.map((m) => (
        <MachineMarker
          key={m.machine_id}
          machine={m}
          screenPos={markerPositions[m.machine_id] || null}
          isSelected={selectedMachineId === m.machine_id}
          isCascadeAffected={activeCascadeIds.includes(m.machine_id)}
          onClick={() => onSelectMachine(m)}
        />
      ))}

      {/* Hover Tooltip */}
      <MachineTooltip machine={hoveredMachine} position={tooltipPos} />
    </div>
  );
};
