declare module "three" {
  export class Vector2 {
    x: number;
    y: number;
    constructor(x?: number, y?: number);
    set(x: number, y: number): this;
  }

  export class Vector3 {
    x: number;
    y: number;
    z: number;
    constructor(x?: number, y?: number, z?: number);
    set(x: number, y: number, z: number): this;
    setY(y: number): this;
    copy(v: Vector3): this;
    clone(): Vector3;
    length(): number;
    normalize(): this;
    add(v: Vector3): this;
    sub(v: Vector3): this;
    subVectors(a: Vector3, b: Vector3): this;
    crossVectors(a: Vector3, b: Vector3): this;
    addScaledVector(v: Vector3, s: number): this;
    project(camera: Camera): this;
  }

  export class Color {
    constructor(color?: string | number);
    setHex(hex: number): this;
  }

  export class FogExp2 {
    color: Color;
    density: number;
    constructor(color: string | number, density?: number);
  }

  export class Clock {
    constructor(autoStart?: boolean);
    getElapsedTime(): number;
    getDelta(): number;
  }

  export class Object3D {
    id: number;
    name: string;
    parent: Object3D | null;
    children: Object3D[];
    position: Vector3;
    rotation: { x: number; y: number; z: number };
    scale: Vector3;
    userData: Record<string, any>;
    castShadow: boolean;
    receiveShadow: boolean;
    add(...object: Object3D[]): this;
    remove(...object: Object3D[]): this;
    getObjectByName(name: string): Object3D | undefined;
    getWorldPosition(target: Vector3): Vector3;
    lookAt(vector: Vector3 | number, y?: number, z?: number): void;
  }

  export class Group extends Object3D {}

  export class Camera extends Object3D {
    aspect: number;
    updateProjectionMatrix(): void;
    lookAt(vector: Vector3 | number, y?: number, z?: number): void;
  }

  export class PerspectiveCamera extends Camera {
    constructor(fov?: number, aspect?: number, near?: number, far?: number);
  }

  export class Light extends Object3D {
    color: Color;
    intensity: number;
    castShadow: boolean;
    shadow: {
      mapSize: { width: number; height: number };
      camera: { near: number; far: number; left: number; right: number; top: number; bottom: number };
    };
  }

  export class AmbientLight extends Light {
    constructor(color?: string | number, intensity?: number);
  }

  export class DirectionalLight extends Light {
    constructor(color?: string | number, intensity?: number);
  }

  export class PointLight extends Light {
    constructor(color?: string | number, intensity?: number, distance?: number, decay?: number);
  }

  export class BufferGeometry {
    dispose(): void;
  }

  export class BoxGeometry extends BufferGeometry {
    constructor(width?: number, height?: number, depth?: number);
  }

  export class PlaneGeometry extends BufferGeometry {
    constructor(width?: number, height?: number);
  }

  export class CylinderGeometry extends BufferGeometry {
    constructor(radiusTop?: number, radiusBottom?: number, height?: number, radialSegments?: number);
  }

  export class SphereGeometry extends BufferGeometry {
    constructor(radius?: number, widthSegments?: number, heightSegments?: number);
  }

  export class RingGeometry extends BufferGeometry {
    constructor(innerRadius?: number, outerRadius?: number, thetaSegments?: number);
  }

  export class EdgesGeometry extends BufferGeometry {
    constructor(geometry?: BufferGeometry);
  }

  export class Material {
    opacity: number;
    transparent: boolean;
    side: number;
    dispose(): void;
  }

  export class MeshStandardMaterial extends Material {
    color: Color;
    emissive: Color;
    emissiveIntensity: number;
    roughness: number;
    metalness: number;
    constructor(parameters?: Record<string, any>);
  }

  export class MeshBasicMaterial extends Material {
    color: Color;
    constructor(parameters?: Record<string, any>);
  }

  export class LineBasicMaterial extends Material {
    color: Color;
    linewidth: number;
    constructor(parameters?: Record<string, any>);
  }

  export class Mesh<
    TGeometry extends BufferGeometry = BufferGeometry,
    TMaterial extends Material | Material[] = Material
  > extends Object3D {
    geometry: TGeometry;
    material: TMaterial;
    constructor(geometry?: TGeometry, material?: TMaterial);
  }

  export class LineSegments<
    TGeometry extends BufferGeometry = BufferGeometry,
    TMaterial extends Material | Material[] = Material
  > extends Object3D {
    constructor(geometry?: TGeometry, material?: TMaterial);
  }

  export class GridHelper extends Object3D {
    material: Material;
    constructor(size?: number, divisions?: number, colorCenterLine?: number, colorGrid?: number);
  }

  export class ArrowHelper extends Object3D {
    constructor(dir: Vector3, origin: Vector3, length?: number, color?: number, headLength?: number, headWidth?: number);
  }

  export class Scene extends Object3D {
    background: Color | null;
    fog: FogExp2 | null;
  }

  export class WebGLRenderer {
    domElement: HTMLCanvasElement;
    shadowMap: { enabled: boolean; type: number };
    constructor(parameters?: Record<string, any>);
    setSize(width: number, height: number, updateStyle?: boolean): void;
    setPixelRatio(value: number): void;
    render(scene: Scene, camera: Camera): void;
    dispose(): void;
  }

  export class Raycaster {
    constructor(origin?: Vector3, direction?: Vector3, near?: number, far?: number);
    setFromCamera(coords: Vector2, camera: Camera): void;
    intersectObjects(objects: Object3D[], recursive?: boolean): Array<{
      object: Object3D;
      distance: number;
      point: Vector3;
    }>;
  }

  export const DoubleSide: number;
  export const PCFSoftShadowMap: number;
}

declare module "three/examples/jsm/controls/OrbitControls.js" {
  import { Camera } from "three";
  export class OrbitControls {
    enabled: boolean;
    target: { x: number; y: number; z: number; set(x: number, y: number, z: number): void };
    enableDamping: boolean;
    dampingFactor: number;
    maxPolarAngle: number;
    minDistance: number;
    maxDistance: number;
    constructor(object: Camera, domElement?: HTMLElement);
    update(): boolean;
    dispose(): void;
  }
}
