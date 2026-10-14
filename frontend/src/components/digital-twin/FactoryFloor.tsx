import {
  Group,
  Mesh,
  PlaneGeometry,
  BoxGeometry,
  MeshStandardMaterial,
  GridHelper,
  LineBasicMaterial,
} from "three";

export const createFactoryFloorGroup = (
  width: number = 44,
  depth: number = 30
): Group => {
  const group = new Group();

  // 1. Base Factory Floor Slab
  const floorGeo = new PlaneGeometry(width, depth);
  const floorMat = new MeshStandardMaterial({
    color: 0x0b1720,
    roughness: 0.85,
    metalness: 0.15,
  });
  const floor = new Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  group.add(floor);

  // 2. Industrial Floor Grid
  const gridHelper = new GridHelper(Math.max(width, depth), 40, 0x315a68, 0x163a4a);
  gridHelper.position.y = 0.01;
  const gridMat = gridHelper.material as LineBasicMaterial;
  gridMat.opacity = 0.45;
  gridMat.transparent = true;
  group.add(gridHelper);

  // 3. Factory Boundary Walls (Subtle lower perimeter curbs)
  const curbMat = new MeshStandardMaterial({ color: 0x163a4a, metalness: 0.5 });
  const curbHeight = 0.3;
  const curbThick = 0.2;

  // North curb
  const nCurb = new Mesh(new BoxGeometry(width, curbHeight, curbThick), curbMat);
  nCurb.position.set(0, curbHeight / 2, -depth / 2);
  // South curb
  const sCurb = new Mesh(new BoxGeometry(width, curbHeight, curbThick), curbMat);
  sCurb.position.set(0, curbHeight / 2, depth / 2);
  // West curb
  const wCurb = new Mesh(new BoxGeometry(curbThick, curbHeight, depth), curbMat);
  wCurb.position.set(-width / 2, curbHeight / 2, 0);
  // East curb
  const eCurb = new Mesh(new BoxGeometry(curbThick, curbHeight, depth), curbMat);
  eCurb.position.set(width / 2, curbHeight / 2, 0);

  group.add(nCurb, sCurb, wCurb, eCurb);

  return group;
};
