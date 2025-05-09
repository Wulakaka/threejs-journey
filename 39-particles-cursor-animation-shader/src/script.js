import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import particlesVertexShader from "./shaders/particles/vertex.glsl";
import particlesFragmentShader from "./shaders/particles/fragment.glsl";

/**
 * Base
 */
// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

// Loaders
const textureLoader = new THREE.TextureLoader();

/**
 * Displacement
 *
 */
const displacement = {};

// 2d canvas
displacement.canvas = document.createElement("canvas");
// 这里的尺寸要与图片的尺寸一致
displacement.canvas.width = 128;
displacement.canvas.height = 128;
displacement.canvas.style.position = "absolute";
displacement.canvas.style.top = "0";
displacement.canvas.style.left = "0";
displacement.canvas.style.width = "256px";
displacement.canvas.style.height = "256px";
displacement.canvas.style.zIndex = "10";
document.body.appendChild(displacement.canvas);

// 2d context
displacement.context = displacement.canvas.getContext("2d");

// glow image
displacement.glowImage = new Image();
displacement.glowImage.src = "/glow.png";

// texture
displacement.texture = new THREE.CanvasTexture(displacement.canvas);

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
  particlesMaterial.uniforms.uResolution.value.set(
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
camera.position.set(0, 0, 18);
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
renderer.setClearColor("#181818");
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(sizes.pixelRatio);

/**
 * Particles
 */
const particlesGeometry = new THREE.PlaneGeometry(10, 10, 128, 128);
const intensitiesArray = new Float32Array(
  particlesGeometry.attributes.position.count,
);
const anglesArray = new Float32Array(
  particlesGeometry.attributes.position.count,
);
for (let i = 0; i < particlesGeometry.attributes.position.count; i++) {
  intensitiesArray[i] = Math.random();
  anglesArray[i] = Math.random() * Math.PI * 2;
}
particlesGeometry.setAttribute(
  "aIntensity",
  new THREE.BufferAttribute(intensitiesArray, 1),
);
particlesGeometry.setAttribute(
  "aAngle",
  new THREE.BufferAttribute(anglesArray, 1),
);
// 不使用 index，为了让传给GPU的 vertex 更少
particlesGeometry.setIndex(null);
// normal 是无用数据
particlesGeometry.deleteAttribute("normal");

const particlesMaterial = new THREE.ShaderMaterial({
  vertexShader: particlesVertexShader,
  fragmentShader: particlesFragmentShader,
  uniforms: {
    uResolution: new THREE.Uniform(
      new THREE.Vector2(
        sizes.width * sizes.pixelRatio,
        sizes.height * sizes.pixelRatio,
      ),
    ),
    uPictureTexture: new THREE.Uniform(textureLoader.load("/picture-1.png")),
    uDisplacementTexture: new THREE.Uniform(displacement.texture),
  },
  // blending: THREE.AdditiveBlending,
});

const particles = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particles);

displacement.interactivePlane = new THREE.Mesh(
  new THREE.PlaneGeometry(10, 10, 1, 1),
  new THREE.MeshBasicMaterial({
    color: "red",
    side: THREE.DoubleSide,
  }),
);
displacement.interactivePlane.visible = false;
scene.add(displacement.interactivePlane);

// Raycaster
displacement.raycaster = new THREE.Raycaster();

// coordinates
displacement.screenCursor = new THREE.Vector2(9999, 9999);
displacement.canvasCursor = new THREE.Vector2(9999, 9999);
displacement.canvasPreviousCursor = new THREE.Vector2(9999, 9999);

window.addEventListener("pointermove", (event) => {
  displacement.screenCursor.x = (event.clientX / sizes.width) * 2 - 1;
  displacement.screenCursor.y = -(event.clientY / sizes.height) * 2 + 1;
});

/**
 * Animate
 */
const tick = () => {
  // Update controls
  controls.update();

  displacement.texture.needsUpdate = true;

  /**
   * Raycaster
   */
  displacement.raycaster.setFromCamera(displacement.screenCursor, camera);
  const intersections = displacement.raycaster.intersectObject(
    displacement.interactivePlane,
  );
  if (intersections.length) {
    const uv = intersections[0].uv;
    displacement.canvasCursor.x = uv.x * displacement.canvas.width;
    displacement.canvasCursor.y = (1 - uv.y) * displacement.canvas.height;
  } else {
    displacement.canvasCursor.x = 9999;
    displacement.canvasCursor.y = 9999;
  }

  /**
   * Displacement
   */
  // fade out
  displacement.context.save();
  displacement.context.globalCompositeOperation = "source-over";
  displacement.context.globalAlpha = 0.02;
  displacement.context.fillRect(
    0,
    0,
    displacement.canvas.width,
    displacement.canvas.height,
  );
  displacement.context.restore();

  // Speed alpha
  // 移动距离的大小代表了速度
  const cursorDistance = displacement.canvasPreviousCursor.distanceTo(
    displacement.canvasCursor,
  );
  // 速度过快也不能超过1
  const alpha = Math.min(cursorDistance * 0.1, 1);

  // draw glow
  displacement.canvasPreviousCursor.copy(displacement.canvasCursor);
  const glowSize =
    displacement.canvas.width * 0.25 * Math.min(cursorDistance * 0.5, 1);
  displacement.context.save();
  // 根据移动速度的快慢决定绘制 glow 的透明度
  displacement.context.globalAlpha = alpha * 0.2;
  displacement.context.globalCompositeOperation = "lighten";
  displacement.context.drawImage(
    displacement.glowImage,
    displacement.canvasCursor.x - glowSize / 2,
    displacement.canvasCursor.y - glowSize / 2,
    glowSize,
    glowSize,
  );
  displacement.context.restore();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
