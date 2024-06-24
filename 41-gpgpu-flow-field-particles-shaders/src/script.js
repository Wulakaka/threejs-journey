import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";
import { GPUComputationRenderer } from "three/addons/misc/GPUComputationRenderer.js";
import GUI from "lil-gui";
import particlesVertexShader from "./shaders/particles/vertex.glsl";
import particlesFragmentShader from "./shaders/particles/fragment.glsl";
import gpgpuParticlesShader from "./shaders/gpgpu/particles.glsl";

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
 * Base geometry
 */
const baseGeometry = {};
baseGeometry.instance = gltf.scene.children[0].geometry;
// 记录顶点数量
baseGeometry.count = baseGeometry.instance.attributes.position.count;

/**
 * GPU Compute
 */
// Setup
const gpgpu = {};
gpgpu.size = Math.ceil(Math.sqrt(baseGeometry.count));
gpgpu.computation = new GPUComputationRenderer(
  gpgpu.size,
  gpgpu.size,
  renderer,
);

// Base particles
// 创建一个纹理，用于存储粒子的位置
const baseParticlesTexture = gpgpu.computation.createTexture();

for (let i = 0; i < baseGeometry.count; i++) {
  // i3 用于标记 geometry 的位置信息
  const i3 = i * 3;
  // i4 用于标记 texture 中的像素信息
  const i4 = i * 4;

  // 将位置信息保存到 texture
  baseParticlesTexture.image.data[i4 + 0] =
    baseGeometry.instance.attributes.position.array[i3 + 0];
  baseParticlesTexture.image.data[i4 + 1] =
    baseGeometry.instance.attributes.position.array[i3 + 1];
  baseParticlesTexture.image.data[i4 + 2] =
    baseGeometry.instance.attributes.position.array[i3 + 2];
  // 用 a channel 来控制生命周期
  baseParticlesTexture.image.data[i4 + 3] = Math.random();
}

// Particles variable
// uParticles 是一个 variable,是传递给 shader 的变量，它的值是 baseParticlesTexture
gpgpu.particlesVariable = gpgpu.computation.addVariable(
  "uParticles",
  gpgpuParticlesShader,
  baseParticlesTexture,
);
gpgpu.computation.setVariableDependencies(gpgpu.particlesVariable, [
  gpgpu.particlesVariable,
]);

// Uniforms
gpgpu.particlesVariable.material.uniforms.uTime = new THREE.Uniform(0);
gpgpu.particlesVariable.material.uniforms.uDeltaTime = new THREE.Uniform(0);
// 传递原始 texture，为了reset
gpgpu.particlesVariable.material.uniforms.uBase = new THREE.Uniform(
  baseParticlesTexture,
);
gpgpu.particlesVariable.material.uniforms.uFlowFieldInfluence =
  new THREE.Uniform(0.5);
gpgpu.particlesVariable.material.uniforms.uFlowFieldStrength =
  new THREE.Uniform(2);
gpgpu.particlesVariable.material.uniforms.uFlowFieldFrequency =
  new THREE.Uniform(0.5);

// Init
gpgpu.computation.init();

// Debug
// 通过获取 texture 来创建一个用于 debug 的 mesh
gpgpu.debug = new THREE.Mesh(
  new THREE.PlaneGeometry(3, 3),
  new THREE.MeshBasicMaterial({
    map: gpgpu.computation.getCurrentRenderTarget(gpgpu.particlesVariable)
      .texture,
  }),
);
gpgpu.debug.position.x = 3;
gpgpu.debug.visible = false;
scene.add(gpgpu.debug);

/**
 * Particles
 */
const particles = {};

// Geometry
// 由于发送给 vertex shader 的 texture 对应的每个 vertex 的值是 0 - 1
// 为了让位置信息变成正常值，需要一个尺寸为 gpgpu.size * gpgpu.size 的 texture 对应的 uv 值
// 这里不能在 vertex shader 中使用 gl_FragCoord 来获取 uv 值，因为 gl_FragCoord 是屏幕像素坐标
const particlesUvArray = new Float32Array(baseGeometry.count * 2);
const sizesArray = new Float32Array(baseGeometry.count);

for (let y = 0; y < gpgpu.size; y++) {
  for (let x = 0; x < gpgpu.size; x++) {
    const i = y * gpgpu.size + x;
    const i2 = i * 2;
    // 除以 gpgpu.size 是为了让值在 0 - 1 之间
    // 加上 0.5 是为了在 texture 中获取像素信息时，获取的是每个格子的中心，而不是格子的左下角点
    // 在当前例子中不加也没关系，因为不存在边界混合的情况，但是某些情况下可能拿不到想要的值
    const uvX = (x + 0.5) / gpgpu.size;
    const uvY = (y + 0.5) / gpgpu.size;

    particlesUvArray[i2 + 0] = uvX;
    particlesUvArray[i2 + 1] = uvY;

    // Size
    sizesArray[i] = Math.random();
  }
}

particles.geometry = new THREE.BufferGeometry();
// setDrawRange 用于设置渲染的顶点数量
// 这里我们设置为 baseGeometry.count，因为实际的点数量为 gpgpu.size * gpgpu.size，而实际有用的点数量为 baseGeometry.count
particles.geometry.setDrawRange(0, baseGeometry.count);
particles.geometry.setAttribute(
  "aParticlesUv",
  new THREE.BufferAttribute(particlesUvArray, 2),
);
particles.geometry.setAttribute(
  "aColor",
  baseGeometry.instance.attributes.color,
);
particles.geometry.setAttribute(
  "aSize",
  new THREE.BufferAttribute(sizesArray, 1),
);

// Material
particles.material = new THREE.ShaderMaterial({
  vertexShader: particlesVertexShader,
  fragmentShader: particlesFragmentShader,
  uniforms: {
    uSize: new THREE.Uniform(0.07),
    uResolution: new THREE.Uniform(
      new THREE.Vector2(
        sizes.width * sizes.pixelRatio,
        sizes.height * sizes.pixelRatio,
      ),
    ),
    // 为什么不用 position attribute 传递位置信息？
    // 因为我们已经将位置信息保存到了 texture 中，无法通过 js 来获取 texture 中的值
    uParticlesTexture: new THREE.Uniform(),
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

gui
  .add(gpgpu.particlesVariable.material.uniforms.uFlowFieldInfluence, "value")
  .min(0)
  .max(1)
  .step(0.001)
  .name("uFlowFieldInfluence");
gui
  .add(gpgpu.particlesVariable.material.uniforms.uFlowFieldStrength, "value")
  .min(0)
  .max(10)
  .step(0.001)
  .name("uFlowFieldStrength");
gui
  .add(gpgpu.particlesVariable.material.uniforms.uFlowFieldFrequency, "value")
  .min(0)
  .max(1)
  .step(0.001)
  .name("uFlowFieldFrequency");

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
  // 更新 gpgpu 的 uniform
  gpgpu.particlesVariable.material.uniforms.uTime.value = elapsedTime;
  gpgpu.particlesVariable.material.uniforms.uDeltaTime.value = deltaTime;
  gpgpu.computation.compute();
  // 更新 particles.material.uniforms.uParticlesTexture 的值为 gpgpu 的 texture
  particles.material.uniforms.uParticlesTexture.value =
    gpgpu.computation.getCurrentRenderTarget(gpgpu.particlesVariable).texture;

  // Render normal scene
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
