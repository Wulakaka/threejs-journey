import * as THREE from 'three/webgpu'
import { GLTFLoader } from 'three/addons/Addons.js'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { Inspector } from 'three/addons/inspector/Inspector.js'
import { SkyMesh } from 'three/addons/objects/SkyMesh.js'
import { bloom } from 'three/addons/tsl/display/BloomNode.js'
import { pass } from 'three/tsl'

/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.threejs')

// Scene
const scene = new THREE.Scene()

// Loaders
const textureLoader = new THREE.TextureLoader()
const gltfLoader = new GLTFLoader()

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
const camera = new THREE.PerspectiveCamera(
  35,
  sizes.width / sizes.height,
  0.1,
  100
)
camera.position.x = 9
camera.position.y = 7.5
camera.position.z = 7
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.target.set(0, 0, 0)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGPURenderer({
  canvas: canvas,
  antialias: true
})
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFShadowMap
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.setClearColor(0x000000)
renderer.inspector = new Inspector()
await renderer.init()

/**
 * Post processing
 */
const renderPipeline = new THREE.RenderPipeline(renderer)
const scenePass = pass(scene, camera)
const scenePassColor = scenePass.getTextureNode('output')
const bloomPass = bloom(scenePassColor)
bloomPass.threshold.value = 0
bloomPass.strength.value = 0.05

renderPipeline.outputNode = scenePassColor.add(bloomPass)

const bloomGui = renderer.inspector.createParameters('Bloom').close()
bloomGui.add(bloomPass.threshold, 'value', 0, 2, 0.01).name('threshold')
bloomGui.add(bloomPass.strength, 'value', 0, 2, 0.01).name('strength')

/**
 * Anvil
 */
const anvil = await gltfLoader.loadAsync('./anvil.glb')
anvil.scene.position.x = -3
anvil.scene.position.z = 2.8
anvil.scene.traverse((child) => {
  if (child.isMesh) {
    child.castShadow = true
    child.receiveShadow = true
  }
})
scene.add(anvil.scene)

/**
 * Sky
 */
const sky = new SkyMesh()
sky.scale.setScalar(1000)
scene.add(sky)
const effectController = {
  turbidity: 1.5,
  rayleigh: 0.95,
  mieCoefficient: 0.055,
  mieDirectionalG: 0.335,
  elevation: 0.9,
  azimuth: 131.2,
  cloudCoverage: 0.4,
  cloudDensity: 0.4,
  cloudElevation: 0.5
}

const sun = new THREE.Vector3()

const skyChanged = () => {
  sky.turbidity.value = effectController.turbidity
  sky.rayleigh.value = effectController.rayleigh
  sky.mieCoefficient.value = effectController.mieCoefficient
  sky.mieDirectionalG.value = effectController.mieDirectionalG
  sky.cloudCoverage.value = effectController.cloudCoverage
  sky.cloudDensity.value = effectController.cloudDensity
  sky.cloudElevation.value = effectController.cloudElevation

  const phi = THREE.MathUtils.degToRad(90 - effectController.elevation)
  const theta = THREE.MathUtils.degToRad(effectController.azimuth)

  sun.setFromSphericalCoords(1, phi, theta)

  sky.sunPosition.value.copy(sun)
}

skyChanged()

// Debug
const skyGui = renderer.inspector.createParameters('Sky').close()

skyGui.add(effectController, 'turbidity', 0.0, 20.0, 0.1).onChange(skyChanged)
skyGui.add(effectController, 'rayleigh', 0.0, 4, 0.001).onChange(skyChanged)
skyGui
  .add(effectController, 'mieCoefficient', 0.0, 0.1, 0.001)
  .onChange(skyChanged)
skyGui
  .add(effectController, 'mieDirectionalG', 0.0, 1, 0.001)
  .onChange(skyChanged)
skyGui.add(effectController, 'elevation', -10, 90, 0.1).onChange(skyChanged)
skyGui.add(effectController, 'azimuth', -180, 180, 0.1).onChange(skyChanged)

/**
 * Lights
 */
const directionalLight = new THREE.DirectionalLight(0xff9147, 9.2)
directionalLight.castShadow = true
directionalLight.position.set(2, 1.1, -1.75).normalize().multiplyScalar(10)
directionalLight.shadow.camera.top = 10
directionalLight.shadow.camera.right = 10
directionalLight.shadow.camera.bottom = -10
directionalLight.shadow.camera.left = -10
directionalLight.shadow.camera.near = 0.01
directionalLight.shadow.camera.far = 20
directionalLight.shadow.radius = 5
directionalLight.shadow.normalBias = 0.1
scene.add(directionalLight)

const ambientLight = new THREE.AmbientLight(0xb870ff, 2.6)
scene.add(ambientLight)

// Debug
const lightsGui = renderer.inspector.createParameters('Lights').close()

lightsGui.addColor(directionalLight, 'color').name('directionalColor')
lightsGui.add(directionalLight.position, 'y', 0, 10, 0.01).name('directionalY')
lightsGui
  .add(directionalLight, 'intensity', 0, 10, 0.01)
  .name('directionalIntensity')
lightsGui.addColor(ambientLight, 'color').name('ambientColor')
lightsGui.add(ambientLight, 'intensity', 0, 5, 0.01).name('ambientIntensity')

/**
 * Floor
 */
{
  // Geometry
  const geometry = new THREE.PlaneGeometry(10, 10, 20, 20)
  geometry.rotateX(-Math.PI * 0.5)

  // Material
  const material = new THREE.MeshStandardNodeMaterial()

  // Mesh
  const mesh = new THREE.Mesh(geometry, material)
  mesh.castShadow = true
  mesh.receiveShadow = true
  scene.add(mesh)
}

/**
 * Animate
 */
const tick = () => {
  // Update controls
  controls.update()

  // Render
  renderPipeline.render()
}

renderer.setAnimationLoop(tick)
