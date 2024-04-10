import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import GUI from "lil-gui";
import { gsap } from "gsap";
import fireworksVertexShader from "./shaders/fireworks/vertex.glsl";
import fireworksFragmentShader from "./shaders/fireworks/fragment.glsl";

/**
 * Base
 */
// Debug
const gui = new GUI({ width: 340 });

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

// Loaders
const textureLoader = new THREE.TextureLoader();

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
  pixelRatio: Math.min(window.devicePixelRatio, 2),
};

sizes.resolution = new THREE.Vector2(
  sizes.width * sizes.pixelRatio,
  sizes.height * sizes.pixelRatio,
);

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;
  sizes.pixelRatio = Math.min(window.devicePixelRatio, 2);
  sizes.resolution.set(
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
  25,
  sizes.width / sizes.height,
  0.1,
  100,
);
camera.position.set(1.5, 0, 6);
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

/**
 * Fireworks
 */

const textures = [
  textureLoader.load("/particles/1.png"),
  textureLoader.load("/particles/2.png"),
  textureLoader.load("/particles/3.png"),
  textureLoader.load("/particles/4.png"),
  textureLoader.load("/particles/5.png"),
  textureLoader.load("/particles/6.png"),
  textureLoader.load("/particles/7.png"),
  textureLoader.load("/particles/8.png"),
];

const getPositionSpherical = () => {
  const theta = Math.random() * Math.PI * 2;
  let y = Math.random() * 2 - 1;
  const phi = Math.acos(y);

  const spherical = new THREE.Spherical(1, phi, theta);
  const position = new THREE.Vector3();
  position.setFromSpherical(spherical);
  return position;
};

// 菲波那契网格
const getPosition = (n, N) => {
  const phi = (Math.sqrt(5) - 1) / 2;
  const z = (2 * n) / N - 1;
  const x = (1 - z ** 2) ** 0.5 * Math.cos(2 * Math.PI * n * phi);
  const y = (1 - z ** 2) ** 0.5 * Math.sin(2 * Math.PI * n * phi);

  return {
    x,
    y,
    z,
  };
};

const getSquarePosition = (n, N) => {
  // 每边数量
  const count = Math.ceil(Math.sqrt(N));
  // 通过n计算在第几行第几列
  const x = (n % count) / count;
  const y = Math.floor(n / count) / count;
  return {
    x: x * 2 - 1,
    y: y * 2 - 1,
    z: 0,
  };
};
const getBoxPosition = (n, N) => {
  const count = Math.ceil(N ** (1 / 3));
  const x = (n % count) / count;
  const y = (Math.floor(n / count) % count) / count;
  const z = Math.floor(n / count ** 2) / count;
  return {
    x: x * 2 - 1,
    y: y * 2 - 1,
    z: z * 2 - 1,
  };
};
const getBoxFacePosition = (n, N) => {
  const faceCount = Math.ceil(N / 6);
  // 通过n计算在第几个面
  const face = Math.floor(n / faceCount);
  // 通过n计算在面的第几个
  const faceIndex = n % faceCount;
  const { x, y } = getSquarePosition(faceIndex, faceCount);
  switch (face) {
    case 0:
      return {
        x,
        y,
        z: 1,
      };
    case 1:
      return {
        x: -x,
        y: -y,
        z: -1,
      };
    case 2:
      return {
        x: x,
        y: -1,
        z: y,
      };
    case 3:
      return {
        x: -x,
        y: 1,
        z: -y,
      };
    case 4:
      return {
        x: 1,
        y: x,
        z: -y,
      };
    case 5:
      return {
        x: -1,
        y: -x,
        z: y,
      };
  }
};

// 由于最终是通过点击触发，所以通过函数创建
//   count: 粒子数量
//   position: 粒子中心位置
//   size: 粒子大小
//   texture: 粒子纹理
const createFirework = (count, position, size, texture, radius, color) => {
  const positionsArray = new Float32Array(count * 3);
  const sizesArray = new Float32Array(count);
  const timeMultipliersArray = new Float32Array(count);
  const colorHuesArray = new Float32Array(count);

  for (let i = 0; i < count; i++) {
    const i3 = i * 3;

    const r = radius * (0.8 + Math.random() * 0.2);

    const { x, y, z } = getBoxFacePosition(i, count);

    positionsArray[i3 + 0] = x * r;
    positionsArray[i3 + 1] = z * r;
    positionsArray[i3 + 2] = y * r;

    sizesArray[i] = Math.random();
    timeMultipliersArray[i] = 1 + Math.random();
    colorHuesArray[i] = Math.random();
  }

  //   Geometry
  //   粒子特效使用BufferGeometry
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.BufferAttribute(positionsArray, 3),
  );

  geometry.setAttribute("aSize", new THREE.BufferAttribute(sizesArray, 1));
  geometry.setAttribute(
    "aTimeMultiplier",
    new THREE.BufferAttribute(timeMultipliersArray, 1),
  );
  geometry.setAttribute(
    "aColorHue",
    new THREE.BufferAttribute(colorHuesArray, 1),
  );

  // material
  texture.flipY = false;
  const material = new THREE.ShaderMaterial({
    vertexShader: fireworksVertexShader,
    fragmentShader: fireworksFragmentShader,
    uniforms: {
      uSize: new THREE.Uniform(size),
      uTexture: new THREE.Uniform(texture),
      uResolution: new THREE.Uniform(sizes.resolution),
      uColor: new THREE.Uniform(color),
      uProgress: new THREE.Uniform(0),
    },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  // Points
  const firework = new THREE.Points(geometry, material);
  firework.position.copy(position);
  scene.add(firework);

  // Animation
  const destroy = () => {
    scene.remove(firework);
    geometry.dispose();
    material.dispose();
  };
  gsap.to(material.uniforms.uProgress, {
    value: 1,
    duration: 4,
    ease: "linear",
    onComplete: destroy,
  });
};

createFirework(
  500,
  new THREE.Vector3(),
  0.5,
  textures[7],
  1,
  new THREE.Color("#8affff"),
);

const createRandomFirework = () => {
  const count = 1000 + Math.round(Math.random() * 500);
  const position = new THREE.Vector3(
    Math.random() * 2 - 1,
    Math.random() * 2 - 1,
    Math.random() * 2 - 1,
  );
  const size = Math.random() * 0.5 + 0.5;
  const texture = textures[Math.floor(Math.random() * textures.length)];
  const radius = Math.random() + 0.4;
  const color = new THREE.Color(`hsl(${Math.random() * 360}, 100%, 50%)`);
  createFirework(count, position, size, texture, radius, color);
};

window.addEventListener("click", createRandomFirework);

/**
 * Animate
 */
const tick = () => {
  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
