import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import GUI from "lil-gui";
import earthVertexShader from "./shaders/earth/vertex.glsl";
import earthFragmentShader from "./shaders/earth/fragment.glsl";

/**
 * Base
 */
// Debug
const gui = new GUI();

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

// Loaders
const textureLoader = new THREE.TextureLoader();
const dayTexture = textureLoader.load("/earth/day.jpg");
dayTexture.colorSpace = THREE.SRGBColorSpace;
const nightTexture = textureLoader.load("/earth/night.jpg");
nightTexture.colorSpace = THREE.SRGBColorSpace;
const specularTexture = textureLoader.load("/earth/specular.jpg");

/**
 * Earth
 */
// Mesh
const earthGeometry = new THREE.SphereGeometry(2, 64, 64);
const earthMaterial = new THREE.ShaderMaterial({
  vertexShader: earthVertexShader,
  fragmentShader: earthFragmentShader,
  uniforms: {
    uDayTexture: new THREE.Uniform(dayTexture),
    uNightTexture: new THREE.Uniform(nightTexture),
    uSpecularTexture: new THREE.Uniform(specularTexture),
    uSunDirection: new THREE.Uniform(new THREE.Vector3(0, 0, 1)),
  },
});
const earth = new THREE.Mesh(earthGeometry, earthMaterial);
scene.add(earth);

/** sun
 *
 */
const sun = new THREE.Mesh(
  new THREE.IcosahedronGeometry(0.1, 2),
  new THREE.MeshBasicMaterial(),
);
scene.add(sun);
const sunDirection = new THREE.Vector3();
const sunSpherical = new THREE.Spherical(1, Math.PI / 2, 0.5);
const updateSun = () => {
  sunDirection.setFromSpherical(sunSpherical);
  sun.position.copy(sunDirection).multiplyScalar(4);
  earthMaterial.uniforms.uSunDirection.value.copy(sunDirection);
};

updateSun();

// debug
gui
  .add(sunSpherical, "phi")
  .min(0)
  .max(Math.PI)
  .step(0.01)
  .name("sun phi")
  .onChange(updateSun);
gui
  .add(sunSpherical, "theta")
  .min(0)
  .max(Math.PI * 2)
  .step(0.01)
  .name("sun theta")
  .onChange(updateSun);

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
  pixelRatio: Math.min(window.devicePixelRatio, 2),
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;
  sizes.pixelRatio = Math.min(window.devicePixelRatio, 2);

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(sizes.pixelRatio);
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  25,
  sizes.width / sizes.height,
  0.1,
  100,
);
camera.position.x = 12;
camera.position.y = 5;
camera.position.z = 4;
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(sizes.pixelRatio);
renderer.setClearColor("#000011");

/**
 * Animate
 */
const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  earth.rotation.y = elapsedTime * 0.1;

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();