import { PerspectiveCamera, Vector3 } from "three";

export interface CameraPreset {
  position: [number, number, number];
  target: [number, number, number];
}

export const DEFAULT_CAMERA_PRESET: CameraPreset = {
  position: [0, 22, 26],
  target: [0, 0, 0],
};

export const LINE_CAMERA_PRESETS: { [key: string]: CameraPreset } = {
  "Line-A": { position: [0, 16, 12], target: [0, 0, -8.5] },
  "Line-B": { position: [0, 16, 16], target: [0, 0, 0] },
  "Line-C": { position: [0, 16, 20], target: [0, 0, 8.5] },
};

export class SimpleOrbitControls {
  camera: PerspectiveCamera;
  domElement: HTMLElement;
  target: Vector3;
  enableDamping: boolean = true;
  dampingFactor: number = 0.05;
  minDistance: number = 6;
  maxDistance: number = 65;
  maxPolarAngle: number = Math.PI / 2 - 0.05;
  minPolarAngle: number = 0.05;

  private isPointerDown: boolean = false;
  private pointerButton: number = 0;
  private previousPointerPos = { x: 0, y: 0 };
  private spherical = { radius: 34, theta: 0, phi: Math.PI / 4 };
  private targetSpherical = { radius: 34, theta: 0, phi: Math.PI / 4 };

  constructor(camera: PerspectiveCamera, domElement: HTMLElement) {
    this.camera = camera;
    this.domElement = domElement;
    this.target = new Vector3(0, 0, 0);

    // Initial spherical sync from camera position
    this.syncFromCamera();

    // Event listeners
    this.domElement.addEventListener("pointerdown", this.onPointerDown);
    window.addEventListener("pointermove", this.onPointerMove);
    window.addEventListener("pointerup", this.onPointerUp);
    this.domElement.addEventListener("wheel", this.onWheel, { passive: false });
    this.domElement.addEventListener("contextmenu", this.onContextMenu);
  }

  private syncFromCamera = () => {
    const offset = new Vector3().copy(this.camera.position).sub(this.target);
    const radius = offset.length();
    if (radius > 0) {
      this.spherical.radius = radius;
      this.spherical.phi = Math.acos(Math.max(-1, Math.min(1, offset.y / radius)));
      this.spherical.theta = Math.atan2(offset.x, offset.z);
      this.targetSpherical = { ...this.spherical };
    }
  };

  private onPointerDown = (e: PointerEvent) => {
    this.isPointerDown = true;
    this.pointerButton = e.button;
    this.previousPointerPos = { x: e.clientX, y: e.clientY };
  };

  private onPointerMove = (e: PointerEvent) => {
    if (!this.isPointerDown) return;

    const dx = e.clientX - this.previousPointerPos.x;
    const dy = e.clientY - this.previousPointerPos.y;
    this.previousPointerPos = { x: e.clientX, y: e.clientY };

    if (this.pointerButton === 0) {
      // Left click -> Rotate (Orbit)
      const rotateSpeed = 0.005;
      this.targetSpherical.theta -= dx * rotateSpeed;
      this.targetSpherical.phi -= dy * rotateSpeed;
      this.targetSpherical.phi = Math.max(
        this.minPolarAngle,
        Math.min(this.maxPolarAngle, this.targetSpherical.phi)
      );
    } else if (this.pointerButton === 2 || this.pointerButton === 1) {
      // Right/Middle click -> Pan
      const panSpeed = 0.03 * (this.spherical.radius / 30);
      const forward = new Vector3()
        .subVectors(this.target, this.camera.position)
        .setY(0)
        .normalize();
      const right = new Vector3().crossVectors(forward, new Vector3(0, 1, 0)).normalize();

      const panDelta = new Vector3()
        .addScaledVector(right, -dx * panSpeed)
        .addScaledVector(forward, dy * panSpeed);

      this.target.add(panDelta);
      this.camera.position.add(panDelta);
    }
  };

  private onPointerUp = () => {
    this.isPointerDown = false;
  };

  private onWheel = (e: WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY > 0 ? 1.08 : 0.92;
    this.targetSpherical.radius = Math.max(
      this.minDistance,
      Math.min(this.maxDistance, this.targetSpherical.radius * zoomFactor)
    );
  };

  private onContextMenu = (e: MouseEvent) => {
    e.preventDefault();
  };

  update = () => {
    if (this.enableDamping) {
      this.spherical.theta += (this.targetSpherical.theta - this.spherical.theta) * this.dampingFactor;
      this.spherical.phi += (this.targetSpherical.phi - this.spherical.phi) * this.dampingFactor;
      this.spherical.radius += (this.targetSpherical.radius - this.spherical.radius) * this.dampingFactor;
    } else {
      this.spherical = { ...this.targetSpherical };
    }

    const sinPhi = Math.sin(this.spherical.phi);
    const cosPhi = Math.cos(this.spherical.phi);
    const sinTheta = Math.sin(this.spherical.theta);
    const cosTheta = Math.cos(this.spherical.theta);

    this.camera.position.x = this.target.x + this.spherical.radius * sinPhi * sinTheta;
    this.camera.position.y = this.target.y + this.spherical.radius * cosPhi;
    this.camera.position.z = this.target.z + this.spherical.radius * sinPhi * cosTheta;

    this.camera.lookAt(this.target);
  };

  dispose = () => {
    this.domElement.removeEventListener("pointerdown", this.onPointerDown);
    window.removeEventListener("pointermove", this.onPointerMove);
    window.removeEventListener("pointerup", this.onPointerUp);
    this.domElement.removeEventListener("wheel", this.onWheel);
    this.domElement.removeEventListener("contextmenu", this.onContextMenu);
  };
}
