import GUI from "lil-gui";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import gsap from "gsap";
import firefliesVertexShader from "./shaders/fireflies/vertex.glsl";
import firefliesFragmentShader from "./shaders/fireflies/fragment.glsl";
import portalVertexShader from "./shaders/portal/vertex.glsl";
import portalFragmentShader from "./shaders/portal/fragment.glsl";
import balloonVertexShader from "./shaders/balloon/vertex.glsl";
import balloonFragmentShader from "./shaders/balloon/fragment.glsl";

/**
 * Base
 */
// Debug
const gui = new GUI({
  width: 400,
});
const debugObject = {};

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

/**
 * Loaders
 */
// Texture loader
const textureLoader = new THREE.TextureLoader();

// Draco loader
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath("draco/");

// GLTF loader
const gltfLoader = new GLTFLoader();
gltfLoader.setDRACOLoader(dracoLoader);

/**
 * Textures
 */
const bakedTexture = textureLoader.load("baked.jpg");
bakedTexture.flipY = false;
bakedTexture.colorSpace = THREE.SRGBColorSpace;

/**
 * Materials
 */
// Baked material
const bakedMaterial = new THREE.MeshBasicMaterial({ map: bakedTexture });

// Pole light material
const poleLightMaterial = new THREE.MeshBasicMaterial({ color: "#fffffb" });

// Portal light material
debugObject.portalColorStart = "#730c4e";
debugObject.portalColorEnd = "#FEE7FE";
gui.addColor(debugObject, "portalColorStart").onChange(() => {
  portalLightMaterial.uniforms.uColorStart.value.set(
    debugObject.portalColorStart,
  );
});
gui.addColor(debugObject, "portalColorEnd").onChange(() => {
  portalLightMaterial.uniforms.uColorEnd.value.set(debugObject.portalColorEnd);
});

const portalLightMaterial = new THREE.ShaderMaterial({
  vertexShader: portalVertexShader,
  fragmentShader: portalFragmentShader,
  uniforms: {
    uTime: new THREE.Uniform(0),
    uColorStart: new THREE.Uniform(
      new THREE.Color(debugObject.portalColorStart),
    ),
    uColorEnd: new THREE.Uniform(new THREE.Color(debugObject.portalColorEnd)),
  },
});

/**
 * Model
 */
gltfLoader.load("portal.glb", (gltf) => {
  scene.add(gltf.scene);

  // Get each object
  const bakedMesh = gltf.scene.children.find((child) => child.name === "baked");
  const portalLightMesh = gltf.scene.children.find(
    (child) => child.name === "portalLight",
  );
  const poleLightAMesh = gltf.scene.children.find(
    (child) => child.name === "poleLightA",
  );
  const poleLightBMesh = gltf.scene.children.find(
    (child) => child.name === "poleLightB",
  );

  // Apply materials
  bakedMesh.material = bakedMaterial;
  portalLightMesh.material = portalLightMaterial;
  poleLightAMesh.material = poleLightMaterial;
  poleLightBMesh.material = poleLightMaterial;
});

/**
 * Balloon
 */

let balloonMaterial;
gltfLoader.load("balloon.glb", (gltf) => {
  const geometry = new THREE.BufferGeometry();
  const count = gltf.scene.children[0].geometry.attributes.position.count;

  const originArray = gltf.scene.children[0].geometry.attributes.position.array;
  const positionArray = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    positionArray[i * 3 + 0] = originArray[i * 3 + 0];
    positionArray[i * 3 + 1] = originArray[i * 3 + 1];
    positionArray[i * 3 + 2] = originArray[i * 3 + 2];
  }

  geometry.setAttribute(
    "position",
    new THREE.BufferAttribute(positionArray, 3),
  );

  const positionAArray = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const r = Math.random() * 0.5;
    const angle = Math.random() * Math.PI * 2;
    positionAArray[i * 3 + 0] = 0;
    positionAArray[i * 3 + 1] = 0.78 + Math.sin(angle) * r;
    positionAArray[i * 3 + 2] = -1.7 + Math.cos(angle) * r;
  }
  geometry.setAttribute(
    "aPositionA",
    new THREE.BufferAttribute(positionAArray, 3),
  );

  // material
  debugObject.progress = 0;
  gui
    .add(debugObject, "progress")
    .min(0)
    .max(1)
    .step(0.0001)
    .name("Balloon progress")
    .onChange(() => {
      balloonMaterial.uniforms.uProgress.value = debugObject.progress;
    })
    .listen();

  debugObject.start = function () {
    const tl = gsap.timeline();

    tl.fromTo(
      debugObject,
      {
        progress: 0,
      },
      {
        progress: 1,
        duration: 10,
        // ease: "power3.inOut",
        onUpdate: () => {
          balloonMaterial.uniforms.uProgress.value = debugObject.progress;
        },
      },
    );

    tl.to(debugObject, {
      progress: 0,
      delay: 2,
      duration: 10,
      // ease: "power3.inOut",
      onUpdate: () => {
        balloonMaterial.uniforms.uProgress.value = debugObject.progress;
      },
    });

    // tl.play();
  };
  gui.add(debugObject, "start");

  balloonMaterial = new THREE.ShaderMaterial({
    vertexShader: balloonVertexShader,
    fragmentShader: balloonFragmentShader,
    uniforms: {
      uTime: { value: 0 },
      uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
      uProgress: new THREE.Uniform(debugObject.progress),
    },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  const balloon = new THREE.Points(geometry, balloonMaterial);
  scene.add(balloon);
});

/**
 * Fireflies
 */
const firefliesGeometry = new THREE.BufferGeometry();
const firefliesCount = 30;
const positions = new Float32Array(firefliesCount * 3);
const scaleArray = new Float32Array(firefliesCount);
const frequency = new Float32Array(firefliesCount);
for (let i = 0; i < firefliesCount; i++) {
  positions[i * 3 + 0] = (Math.random() - 0.5) * 4;
  positions[i * 3 + 1] = Math.random() * 2;
  positions[i * 3 + 2] = (Math.random() - 0.5) * 4;
  scaleArray[i] = Math.random();
  frequency[i] = Math.random();
}
firefliesGeometry.setAttribute(
  "position",
  new THREE.BufferAttribute(positions, 3),
);
firefliesGeometry.setAttribute(
  "aScale",
  new THREE.BufferAttribute(scaleArray, 1),
);
firefliesGeometry.setAttribute(
  "aFrequency",
  new THREE.BufferAttribute(frequency, 1),
);
const firefliesMaterial = new THREE.ShaderMaterial({
  blending: THREE.AdditiveBlending,
  uniforms: {
    uSize: new THREE.Uniform(200),
    uPixelRatio: new THREE.Uniform(Math.min(window.devicePixelRatio, 2)),
    uTime: new THREE.Uniform(0),
  },
  vertexShader: firefliesVertexShader,
  fragmentShader: firefliesFragmentShader,
  transparent: true,
  depthWrite: false,
});
const fireflies = new THREE.Points(firefliesGeometry, firefliesMaterial);
scene.add(fireflies);

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update uniforms
  firefliesMaterial.uniforms.uPixelRatio.value = Math.min(
    window.devicePixelRatio,
    2,
  );

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  45,
  sizes.width / sizes.height,
  0.1,
  100,
);
camera.position.x = 4;
camera.position.y = 2;
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
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
debugObject.clearColor = "#1d161b";
renderer.setClearColor(debugObject.clearColor);
gui.addColor(debugObject, "clearColor").onChange(() => {
  renderer.setClearColor(debugObject.clearColor);
});

/**
 * Animate
 */
const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  // Update controls
  controls.update();

  // Update materials
  firefliesMaterial.uniforms.uTime.value = elapsedTime;
  portalLightMaterial.uniforms.uTime.value = elapsedTime;
  balloonMaterial && (balloonMaterial.uniforms.uTime.value = elapsedTime);

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
