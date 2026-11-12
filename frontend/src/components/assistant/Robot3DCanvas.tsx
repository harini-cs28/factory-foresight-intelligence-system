import React, { useEffect, useRef } from "react";
import * as THREE from "three";

interface Robot3DCanvasProps {
  isListening?: boolean;
  isSpeaking?: boolean;
  isThinking?: boolean;
  className?: string;
  size?: number;
}

export const Robot3DCanvas: React.FC<Robot3DCanvasProps> = ({
  isListening = false,
  isSpeaking = false,
  isThinking = false,
  className = "",
  size = 120,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const mousePosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    camera.position.set(0, 0, 4.2);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(size, size);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    if ("toneMapping" in renderer) {
      (renderer as any).toneMapping = (THREE as any).ACESFilmicToneMapping || 4;
      (renderer as any).toneMappingExposure = 1.1;
    }
    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    // 2. Lighting
    const ambientLight = new THREE.AmbientLight(0xfffdf5, 1.4);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 2.0);
    mainLight.position.set(3, 4, 5);
    scene.add(mainLight);

    const yellowRimLight = new THREE.PointLight(0xf4b400, 2.5, 8);
    yellowRimLight.position.set(-2, 2, 2);
    scene.add(yellowRimLight);

    // 3. Robot Character Group
    const robotGroup = new THREE.Group();
    scene.add(robotGroup);

    // Materials
    const whiteBodyMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.18,
      metalness: 0.08,
    });

    const yellowAccentMat = new THREE.MeshStandardMaterial({
      color: 0xf4b400,
      roughness: 0.25,
      metalness: 0.45,
    });

    const darkVisorMat = new THREE.MeshStandardMaterial({
      color: 0x111827,
      roughness: 0.12,
      metalness: 0.2,
    });

    const eyeGlowMat = new THREE.MeshStandardMaterial({
      color: 0xf4b400,
      emissive: 0xf4b400,
      emissiveIntensity: 2.2,
      roughness: 0.1,
    });

    // A. Head Shell (Rounded Capsule/Sphere)
    const headGeo = new THREE.SphereGeometry(1.0, 32, 32);
    (headGeo as any).scale(1.15, 1.0, 1.05);
    const headMesh = new THREE.Mesh(headGeo, whiteBodyMat);
    robotGroup.add(headMesh);

    // B. Visor (Black curved front display)
    const visorGeo = new (THREE as any).SphereGeometry(0.85, 32, 24, 0, Math.PI);
    (visorGeo as any).scale(1.1, 0.65, 0.55);
    const visorMesh = new THREE.Mesh(visorGeo, darkVisorMat);
    visorMesh.rotation.y = -Math.PI / 2;
    visorMesh.position.set(0, 0.05, 0.62);
    robotGroup.add(visorMesh);

    // C. Eyes (Friendly glowing yellow arches/discs)
    const eyeGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.04, 16);
    (eyeGeo as any).rotateX(Math.PI / 2);

    const leftEye = new THREE.Mesh(eyeGeo, eyeGlowMat);
    leftEye.position.set(-0.35, 0.08, 1.08);
    leftEye.scale.set(1.1, 0.8, 1);
    robotGroup.add(leftEye);

    const rightEye = new THREE.Mesh(eyeGeo, eyeGlowMat);
    rightEye.position.set(0.35, 0.08, 1.08);
    rightEye.scale.set(1.1, 0.8, 1);
    robotGroup.add(rightEye);

    // D. Ears / Yellow Side Pods
    const earGeo = new THREE.CylinderGeometry(0.28, 0.28, 0.22, 24);
    (earGeo as any).rotateZ(Math.PI / 2);

    const leftEar = new THREE.Mesh(earGeo, yellowAccentMat);
    leftEar.position.set(-1.24, 0.05, 0);
    robotGroup.add(leftEar);

    const rightEar = new THREE.Mesh(earGeo, yellowAccentMat);
    rightEar.position.set(1.24, 0.05, 0);
    robotGroup.add(rightEar);

    // E. Golden Top Antenna
    const stemGeo = new THREE.CylinderGeometry(0.035, 0.035, 0.35, 16);
    const stemMesh = new THREE.Mesh(stemGeo, yellowAccentMat);
    stemMesh.position.set(0, 1.15, 0);
    robotGroup.add(stemMesh);

    const tipGeo = new THREE.SphereGeometry(0.1, 16, 16);
    const tipMesh = new THREE.Mesh(tipGeo, eyeGlowMat);
    tipMesh.position.set(0, 1.35, 0);
    robotGroup.add(tipMesh);

    // F. Golden Collar / Neck Base
    const collarGeo = new (THREE as any).TorusGeometry(0.7, 0.08, 16, 32);
    (collarGeo as any).rotateX(Math.PI / 2);
    const collarMesh = new THREE.Mesh(collarGeo, yellowAccentMat);
    collarMesh.position.set(0, -0.92, 0);
    robotGroup.add(collarMesh);

    // 4. Mouse Tracking Handler
    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const dx = (e.clientX - centerX) / (window.innerWidth / 2);
      const dy = (e.clientY - centerY) / (window.innerHeight / 2);
      mousePosRef.current = {
        x: Math.max(-1, Math.min(1, dx)),
        y: Math.max(-1, Math.min(1, dy)),
      };
    };
    window.addEventListener("mousemove", handleMouseMove);

    // 5. Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();
    let blinkTimer = 0;
    let isBlinking = false;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      // Idle Hover & subtle breathing
      const hoverY = Math.sin(time * 2.2) * 0.06;
      robotGroup.position.y = hoverY;

      // Mouse Look Tracking with gentle lerp
      const targetRotY = mousePosRef.current.x * 0.35;
      const targetRotX = mousePosRef.current.y * 0.22;
      robotGroup.rotation.y += (targetRotY - robotGroup.rotation.y) * 0.08;
      robotGroup.rotation.x += (targetRotX - robotGroup.rotation.x) * 0.08;

      // Blinking logic every ~4 seconds
      blinkTimer += delta;
      if (blinkTimer > 3.8) {
        isBlinking = true;
        if (blinkTimer > 4.05) {
          isBlinking = false;
          blinkTimer = 0;
        }
      }

      if (isBlinking) {
        leftEye.scale.y = 0.1;
        rightEye.scale.y = 0.1;
      } else {
        leftEye.scale.y = 0.8;
        rightEye.scale.y = 0.8;
      }

      // Voice Reactive States
      if (isSpeaking) {
        // Nodding and eye pulsing
        const speakNod = Math.sin(time * 8) * 0.08;
        robotGroup.rotation.x = targetRotX + speakNod;
        const pulse = 2.0 + Math.sin(time * 10) * 1.2;
        eyeGlowMat.emissiveIntensity = pulse;
      } else if (isListening) {
        // Attentive tilt and antenna pulsing
        robotGroup.rotation.z = Math.sin(time * 3) * 0.05;
        const listenGlow = 2.5 + Math.sin(time * 8) * 1.5;
        eyeGlowMat.emissiveIntensity = listenGlow;
      } else if (isThinking) {
        // Slow scanning tilt
        robotGroup.rotation.y = Math.sin(time * 3) * 0.3;
        eyeGlowMat.emissiveIntensity = 1.8;
      } else {
        // Idle friendly glow
        eyeGlowMat.emissiveIntensity = 2.2;
        robotGroup.rotation.z = 0;
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationFrameId);
      renderer.dispose();
      headGeo.dispose();
      visorGeo.dispose();
      eyeGeo.dispose();
      earGeo.dispose();
      stemGeo.dispose();
      tipGeo.dispose();
      collarGeo.dispose();
      whiteBodyMat.dispose();
      yellowAccentMat.dispose();
      darkVisorMat.dispose();
      eyeGlowMat.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [size, isListening, isSpeaking, isThinking]);

  return (
    <div
      ref={mountRef}
      className={`relative inline-flex items-center justify-center select-none overflow-hidden ${className}`}
      style={{ width: size, height: size }}
      aria-label="3D Interactive FFIS Robot Mascot"
    />
  );
};
