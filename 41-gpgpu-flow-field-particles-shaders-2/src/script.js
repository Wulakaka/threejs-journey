import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";

import GUI from "lil-gui";
import particlesVertexShader from "./shaders/particles/vertex.glsl";
import particlesFragmentShader from "./shaders/particles/fragment.glsl";
import gpgpuParticlesShader from "./shaders/gpgpu/particles.glsl";
import { GPUComputationRenderer } from "three/addons";

/**
 * Base
 */
// Debug
const gui = new GUI({ width: 340 });
const debugObject = {};

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

// Loaders
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath("/draco/");

const gltfLoader = new GLTFLoader();
gltfLoader.setDRACOLoader(dracoLoader);

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

  // Materials
  particles.material.uniforms.uResolution.value.set(
    sizes.width * sizes.pixelRatio,
    sizes.height * sizes.pixelRatio,
  );

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
  35,
  sizes.width / sizes.height,
  0.1,
  100,
);
camera.position.set(4.5, 4, 11);
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

debugObject.clearColor = "#29191f";
renderer.setClearColor(debugObject.clearColor);

/**
 * Base Geometry
 */

const baseGeometry = {};
baseGeometry.instance = new THREE.SphereGeometry(3, 64, 64);
baseGeometry.count = baseGeometry.instance.attributes.position.count;

// gpgpu
const gpgpu = {};
gpgpu.size = Math.ceil(Math.sqrt(baseGeometry.count));
gpgpu.computation = new GPUComputationRenderer(
  gpgpu.size,
  gpgpu.size,
  renderer,
);

// 创建纹理
const baseParticlesTexture = gpgpu.computation.createTexture();

// 将 base geometry 的位置信息写入 baseParticlesTexture 中
for (let i = 0; i < baseGeometry.count; i++) {
  const i3 = i * 3;
  const i4 = i * 4;
  baseParticlesTexture.image.data[i4 + 0] =
    baseGeometry.instance.attributes.position.array[i3 + 0];
  baseParticlesTexture.image.data[i4 + 1] =
    baseGeometry.instance.attributes.position.array[i3 + 1];
  baseParticlesTexture.image.data[i4 + 2] =
    baseGeometry.instance.attributes.position.array[i3 + 2];
  // a 通道控制生命周期，随机数避免同时死亡
  baseParticlesTexture.image.data[i4 + 3] = Math.random();
}

// 创建 variable
gpgpu.particlesVariable = gpgpu.computation.addVariable(
  "uParticles",
  gpgpuParticlesShader,
  baseParticlesTexture,
);
gpgpu.particlesVariable.material.uniforms.uTime = new THREE.Uniform(0);
gpgpu.particlesVariable.material.uniforms.uBase = new THREE.Uniform(
  baseParticlesTexture,
);

// 设置依赖
gpgpu.computation.setVariableDependencies(gpgpu.particlesVariable, [
  gpgpu.particlesVariable,
]);

gpgpu.computation.init();

gpgpu.debug = new THREE.Mesh(
  new THREE.PlaneGeometry(3, 3),
  new THREE.MeshBasicMaterial({
    map: gpgpu.computation.getCurrentRenderTarget(gpgpu.particlesVariable)
      .texture,
  }),
);
gpgpu.debug.position.x = 3;

scene.add(gpgpu.debug);

/**
 * Particles
 */
const particles = {};

// Geometry
particles.geometry = new THREE.BufferGeometry();
particles.geometry.setDrawRange(0, baseGeometry.count);

const particlesUvArray = new Float32Array(baseGeometry.count * 2);
for (let y = 0; y < gpgpu.size; y++) {
  for (let x = 0; x < gpgpu.size; x++) {
    const i = gpgpu.size * y + x;
    const i2 = i * 2;
    particlesUvArray[i2 + 0] = (x + 0.5) / gpgpu.size;
    particlesUvArray[i2 + 1] = (y + 0.5) / gpgpu.size;
  }
}

particles.geometry.setAttribute(
  "aParticlesUv",
  new THREE.BufferAttribute(particlesUvArray, 2),
);

// Material
particles.material = new THREE.ShaderMaterial({
  vertexShader: particlesVertexShader,
  fragmentShader: particlesFragmentShader,
  uniforms: {
    uSize: new THREE.Uniform(0.2),
    uResolution: new THREE.Uniform(
      new THREE.Vector2(
        sizes.width * sizes.pixelRatio,
        sizes.height * sizes.pixelRatio,
      ),
    ),
    // 这里不同于教程中在 tick 中更新
    uParticlesTexture: new THREE.Uniform(
      gpgpu.computation.getCurrentRenderTarget(gpgpu.particlesVariable).texture,
    ),
  },
});

// Points
particles.points = new THREE.Points(particles.geometry, particles.material);
scene.add(particles.points);

/**
 * Tweaks
 */
gui.addColor(debugObject, "clearColor").onChange(() => {
  renderer.setClearColor(debugObject.clearColor);
});
gui
  .add(particles.material.uniforms.uSize, "value")
  .min(0)
  .max(1)
  .step(0.001)
  .name("uSize");

/**
 * Animate
 */
const clock = new THREE.Clock();
let previousTime = 0;

const tick = () => {
  const elapsedTime = clock.getElapsedTime();
  const deltaTime = elapsedTime - previousTime;
  previousTime = elapsedTime;

  // Update controls
  controls.update();

  // GPGPU Update
  gpgpu.particlesVariable.material.uniforms.uTime.value = elapsedTime;
  gpgpu.computation.compute();

  // Render normal scene
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
