import * as THREE from 'three'
import {OrbitControls} from 'three/addons/controls/OrbitControls.js'
import GUI from 'lil-gui'
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js'
import coffeeSmokeVertexShader from './shaders/coffeeSmoke/vertex.glsl'
import coffeeSmokeFragmentShader from './shaders/coffeeSmoke/fragment.glsl'

/**
 * Base
 */
// Debug
const gui = new GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

// Loaders
const textureLoader = new THREE.TextureLoader()
const gltfLoader = new GLTFLoader()

/**
 * Texture
 * @type {Texture|*}
 */
const perlinTexture = textureLoader.load('./perlin.png')
// 重复纹理
perlinTexture.wrapS = THREE.RepeatWrapping
perlinTexture.wrapT = THREE.RepeatWrapping

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight
}

window.addEventListener('resize', () => {
  // Update sizes
  sizes.width = window.innerWidth
  sizes.height = window.innerHeight

  // Update camera
  camera.aspect = sizes.width / sizes.height
  camera.updateProjectionMatrix()

  // Update renderer
  renderer.setSize(sizes.width, sizes.height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(25, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 8
camera.position.y = 10
camera.position.z = 12
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.target.y = 3
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Model
 */
gltfLoader.load(
  './bakedModel.glb',
  (gltf) => {
    gltf.scene.getObjectByName('baked').material.map.anisotropy = 8
    scene.add(gltf.scene)
  }
)

/**
 * Animate
 */
const clock = new THREE.Clock()

/**
 * Smoke
 */

// Geometry
const smokeGeometry = new THREE.PlaneGeometry(1, 1, 16, 64)
// 将烟雾几何体向上平移 0.5 个单位
smokeGeometry.translate(0, 0.5, 0)
// 与subdivision对应，横向与纵向是4倍的关系
smokeGeometry.scale(1.5, 6, 1.5)

// Material
const smokeMaterial = new THREE.ShaderMaterial({
  // wireframe: true,
  vertexShader: coffeeSmokeVertexShader,
  fragmentShader: coffeeSmokeFragmentShader,
  side: THREE.DoubleSide,
  transparent: true,
  uniforms: {
    uPerlin: new THREE.Uniform(perlinTexture),
    uTime: new THREE.Uniform(0)
  }
})

const smoke = new THREE.Mesh(smokeGeometry, smokeMaterial)
smoke.position.y = 1.83
scene.add(smoke)

const tick = () => {
  const elapsedTime = clock.getElapsedTime()
  // 必须要 value 属性
  smokeMaterial.uniforms.uTime.value = elapsedTime;

  // Update controls
  controls.update()

  // Render
  renderer.render(scene, camera)

  // Call tick again on the next frame
  window.requestAnimationFrame(tick)
}

tick()
