import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";

import GUI from "lil-gui";
import particlesVertexShader from "./shaders/particles/vertex.glsl";
import particlesFragmentShader from "./shaders/particles/fragment.glsl";
import gpgpuParticlesShader from "./shaders/gpgpu/particles.glsl";
import gpgpuParticles2Shader from "./shaders/gpgpu/particles2.glsl";
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
 * Load model
 */
const gltf = await gltfLoader.loadAsync("./model.glb");

/**
 * Base Geometry
 */

const baseGeometry = {};
baseGeometry.instance = gltf.scene.children[0].geometry;
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

// Uniforms
gpgpu.particlesVariable.material.uniforms.uTime = new THREE.Uniform(0);
gpgpu.particlesVariable.material.uniforms.uDeltaTime = new THREE.Uniform(0);
gpgpu.particlesVariable.material.uniforms.uBase = new THREE.Uniform(
  baseParticlesTexture,
);
gpgpu.particlesVariable.material.uniforms.uFlowFieldStrength =
  new THREE.Uniform(2);
gpgpu.particlesVariable.material.uniforms.uFlowFieldFrequency =
  new THREE.Uniform(0.5);
gpgpu.particlesVariable.material.uniforms.uFlowFieldInfluence =
  new THREE.Uniform(0.5);
gpgpu.particlesVariable.material.uniforms.uInteractiveTexture =
  new THREE.Uniform();

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

// gpgpu2
const gpgpu2 = {};
gpgpu2.size = gpgpu.size;
gpgpu2.computation = new GPUComputationRenderer(
  gpgpu2.size,
  gpgpu2.size,
  renderer,
);

// 创建纹理
const baseParticlesTexture2 = gpgpu2.computation.createTexture();

// 将 base geometry 的位置信息写入 baseParticlesTexture 中
for (let i = 0; i < baseGeometry.count; i++) {
  const i3 = i * 3;
  const i4 = i * 4;
  baseParticlesTexture2.image.data[i4 + 0] =
    baseGeometry.instance.attributes.position.array[i3 + 0];
  baseParticlesTexture2.image.data[i4 + 1] =
    baseGeometry.instance.attributes.position.array[i3 + 1];
  baseParticlesTexture2.image.data[i4 + 2] =
    baseGeometry.instance.attributes.position.array[i3 + 2];
  // a 通道控制生命周期，随机数避免同时死亡
  baseParticlesTexture2.image.data[i4 + 3] = 0;
}

// 创建 variable
gpgpu2.particlesVariable = gpgpu2.computation.addVariable(
  "uParticles",
  gpgpuParticles2Shader,
  baseParticlesTexture2,
);

// Uniforms
gpgpu2.particlesVariable.material.uniforms.uDeltaTime = new THREE.Uniform(0);
gpgpu2.particlesVariable.material.uniforms.uBase = new THREE.Uniform(
  baseParticlesTexture2,
);
gpgpu2.particlesVariable.material.uniforms.uInteractivePoint =
  new THREE.Uniform(new THREE.Vector3(9999, 9999, 9999));
gpgpu2.particlesVariable.material.uniforms.uInteractiveRadius =
  new THREE.Uniform(1);
gpgpu2.particlesVariable.material.uniforms.uInteractiveDecay =
  new THREE.Uniform(0.1);
// 设置依赖
gpgpu2.computation.setVariableDependencies(gpgpu2.particlesVariable, [
  gpgpu2.particlesVariable,
]);

gpgpu2.computation.init();

gpgpu2.debug = new THREE.Mesh(
  new THREE.PlaneGeometry(3, 3),
  new THREE.MeshBasicMaterial({
    map: gpgpu2.computation.getCurrentRenderTarget(gpgpu2.particlesVariable)
      .texture,
    transparent: true,
  }),
);
gpgpu2.debug.position.x = -3;

scene.add(gpgpu2.debug);

/**
 * Particles
 */
const particles = {};

// Geometry
particles.geometry = new THREE.BufferGeometry();
particles.geometry.setDrawRange(0, baseGeometry.count);

const particlesUvArray = new Float32Array(baseGeometry.count * 2);
const sizesArray = new Float32Array(baseGeometry.count);
for (let y = 0; y < gpgpu.size; y++) {
  for (let x = 0; x < gpgpu.size; x++) {
    const i = gpgpu.size * y + x;
    const i2 = i * 2;
    particlesUvArray[i2 + 0] = (x + 0.5) / gpgpu.size;
    particlesUvArray[i2 + 1] = (y + 0.5) / gpgpu.size;

    sizesArray[i] = Math.random();
  }
}

particles.geometry.setAttribute(
  "aParticlesUv",
  new THREE.BufferAttribute(particlesUvArray, 2),
);
particles.geometry.setAttribute(
  "aSize",
  new THREE.BufferAttribute(sizesArray, 1),
);
particles.geometry.setAttribute(
  "aColor",
  baseGeometry.instance.attributes.color,
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
    uParticlesTexture: new THREE.Uniform(),
  },
});

// Points
particles.points = new THREE.Points(particles.geometry, particles.material);
// particles.points.frustumCulled = false;
scene.add(particles.points);

/**
 * Displacement
 */
const displacement = {};
displacement.interactiveGeometry = new THREE.Mesh(
  baseGeometry.instance,
  new THREE.MeshBasicMaterial({
    color: "red",
  }),
);
displacement.interactiveGeometry.visible = false;
scene.add(displacement.interactiveGeometry);

displacement.raycaster = new THREE.Raycaster();
displacement.screenCursor = new THREE.Vector2(9999, 9999);
window.addEventListener("pointermove", (event) => {
  displacement.screenCursor.x = (event.clientX / sizes.width) * 2 - 1;
  displacement.screenCursor.y = -(event.clientY / sizes.height) * 2 + 1;
});

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
gui
  .add(gpgpu.particlesVariable.material.uniforms.uFlowFieldStrength, "value")
  .min(0)
  .max(10)
  .step(0.1)
  .name("uFlowFieldStrength");
gui
  .add(gpgpu.particlesVariable.material.uniforms.uFlowFieldFrequency, "value")
  .min(0)
  .max(1)
  .step(0.001)
  .name("uFlowFieldFrequency");
gui
  .add(gpgpu.particlesVariable.material.uniforms.uFlowFieldInfluence, "value")
  .min(0)
  .max(1)
  .step(0.001)
  .name("uFlowFieldInfluence");
gui
  .add(gpgpu2.particlesVariable.material.uniforms.uInteractiveRadius, "value")
  .min(0)
  .max(10)
  .step(0.01)
  .name("uInteractiveRadius");
gui
  .add(gpgpu2.particlesVariable.material.uniforms.uInteractiveDecay, "value")
  .min(0)
  .max(1)
  .step(0.001)
  .name("uInteractiveDecay");
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
  gpgpu.particlesVariable.material.uniforms.uDeltaTime.value = deltaTime;
  gpgpu.particlesVariable.material.uniforms.uInteractiveTexture.value =
    gpgpu2.computation.getCurrentRenderTarget(gpgpu2.particlesVariable).texture;
  gpgpu.computation.compute();

  particles.material.uniforms.uParticlesTexture.value =
    gpgpu.computation.getCurrentRenderTarget(gpgpu.particlesVariable).texture;

  // GPGPU2 Update
  gpgpu2.particlesVariable.material.uniforms.uDeltaTime.value = deltaTime;
  gpgpu2.computation.compute();

  // Raycaster
  displacement.raycaster.setFromCamera(displacement.screenCursor, camera);
  const intersections = displacement.raycaster.intersectObject(
    displacement.interactiveGeometry,
  );
  if (intersections.length) {
    console.log(intersections[0]);
    const point = intersections[0].point;
    gpgpu2.particlesVariable.material.uniforms.uInteractivePoint.value.copy(
      point,
    );
  } else {
    gpgpu2.particlesVariable.material.uniforms.uInteractivePoint.value.set(
      9999,
      9999,
      9999,
    );
  }

  // Render normal scene
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
