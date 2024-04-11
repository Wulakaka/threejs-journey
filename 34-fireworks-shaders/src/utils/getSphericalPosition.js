import * as THREE from "three";

export default function getSphericalPosition() {
  const theta = Math.random() * Math.PI * 2;
  let y = Math.random() * 2 - 1;
  const phi = Math.acos(y);

  const spherical = new THREE.Spherical(1, phi, theta);
  const position = new THREE.Vector3();
  position.setFromSpherical(spherical);
  return position;
}
