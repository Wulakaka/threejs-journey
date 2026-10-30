import * as THREE from 'three/webgpu'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { Inspector } from 'three/addons/inspector/Inspector.js'
import { SkyMesh } from 'three/addons/objects/SkyMesh.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { bloom } from 'three/examples/jsm/tsl/display/BloomNode.js'
import {
  color,
  Fn,
  grayscale,
  materialColor,
  mix,
  mul,
  pass,
  positionGeometry,
  uniform,
  uv,
  vec3,
  vec4
} from 'three/tsl'

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
camera.position.x = 5
camera.position.y = 4.5
camera.position.z = 2.5
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.target.set(0, 1.5, 0)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGPURenderer({
  canvas: canvas,
  antialias: true
})
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFShadowMap
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.setClearColor(0x111111)
renderer.inspector = new Inspector()

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
 * Floor
 */
{
  const texture = textureLoader.load('./floor-color.jpg')
  texture.colorSpace = THREE.SRGBColorSpace
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(10, 10),
    new THREE.MeshStandardNodeMaterial({ map: texture, transparent: true })
  )
  mesh.material.opacityNode = uv().sub(0.5).length().smoothstep(0.5, 0.2)
  mesh.rotation.x = -Math.PI * 0.5
  mesh.receiveShadow = true
  scene.add(mesh)
}

/**
 * Model
 */
const model = await gltfLoader.loadAsync('./anvil.glb')
model.scene.traverse((mesh) => {
  mesh.castShadow = true
  mesh.receiveShadow = true
})
scene.add(model.scene)

/**
 * Sky
 */
const sky = new SkyMesh()
sky.scale.setScalar(1000)
scene.add(sky)
const effectController = {
  turbidity: 3.5,
  rayleigh: 3.215,
  mieCoefficient: 0.02,
  mieDirectionalG: 0.48,
  elevation: 0,
  azimuth: -51,
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
const directionalLight = new THREE.DirectionalLight(0xffaf85, 3)
directionalLight.castShadow = true
directionalLight.position.set(-1, 1, 0.75)
directionalLight.shadow.radius = 5
directionalLight.shadow.normalBias = 0.1
scene.add(directionalLight)

const ambientLight = new THREE.AmbientLight(0x4d70ff, 2.15)
scene.add(ambientLight)

// Debug
const lightsGui = renderer.inspector.createParameters('Lights').close()

lightsGui.addColor(directionalLight, 'color').name('directionalColor')
lightsGui
  .add(directionalLight, 'intensity', 0, 5, 0.01)
  .name('directionalIntensity')

lightsGui.addColor(ambientLight, 'color').name('ambientColor')
lightsGui.add(ambientLight, 'intensity', 0, 5, 0.01).name('ambientIntensity')

/**
 * Hammer
 */
const hammer = model.scene.getObjectByName('hammer')
hammer.rotation.reorder('YXZ')

/**
 * blade
 */
const blade = model.scene.getObjectByName('blade')
blade.material = new THREE.MeshPhysicalNodeMaterial().copy(blade.material)

const bladeEffectStrength = uniform(0)
const bladeColorA = uniform(color(0xff007b))
const bladeColorB = uniform(color(0xffb070))
const bladeEmissiveStrength = uniform(1.5)

blade.material.emissiveNode = Fn(() => {
  const mask = grayscale(materialColor.rgb).remapClamp(0, 0.13, 1, 0)
  const distanceToImpact = positionGeometry.sub(vec3(0, 0, 0.3)).length()
  const effect = mask
    .sub(distanceToImpact.mul(2))
    .add(bladeEffectStrength)
    .max(0)
    .pow(2)

  const emissiveColor = mul(
    mix(bladeColorA, bladeColorB, effect),
    effect,
    bladeEmissiveStrength
  )

  return emissiveColor
})()

// Debug
const bladeGui = renderer.inspector.createParameters('Blade')
bladeGui.addColor(bladeColorA, 'value').name('colorA')
bladeGui.addColor(bladeColorB, 'value').name('colorB')
bladeGui
  .add(bladeEmissiveStrength, 'value', 0, 5, 0.01)
  .name('emissiveStrength')

/**
 * Sparkles light
 */
const sparklesLight = new THREE.PointLight(0xff9955, 5)
sparklesLight.position.set(0.4, 2.65, 0.35)
scene.add(sparklesLight)

// const sparklesLightHelper = new THREE.PointLightHelper(sparklesLight, 0.25)
// scene.add(sparklesLightHelper)

/**
 * Impact
 */
const impact = () => {
  // Hammer
  hammer.rotation.x = Math.PI / 2

  // Blade
  bladeEffectStrength.value += 0.15

  // Light
  sparklesLight.intensity += 3
}
canvas.addEventListener('pointerdown', impact)

/**
 * Animate
 */
const timer = new THREE.Timer()

const tick = () => {
  timer.update()
  const deltaTime = Math.min(1 / 30, timer.getDelta())

  // Update controls
  controls.update()

  // Hammer
  // 目标与当前的差值
  hammer.rotation.x += (0 - hammer.rotation.x) * deltaTime

  // Blade
  bladeEffectStrength.value += (0 - bladeEffectStrength.value) * deltaTime * 0.5

  // Sparkles light
  sparklesLight.intensity += (5 - sparklesLight.intensity) * deltaTime * 3

  // Render
  renderPipeline.render()
}

renderer.setAnimationLoop(tick)
