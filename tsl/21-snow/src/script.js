import { GLTFLoader } from 'three/addons/Addons.js'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { Inspector } from 'three/addons/inspector/Inspector.js'
import { SkyMesh } from 'three/addons/objects/SkyMesh.js'
import { bloom } from 'three/addons/tsl/display/BloomNode.js'
import {
  cross,
  Fn,
  instanceIndex,
  min,
  normalLocal,
  pass,
  positionLocal,
  storageTexture,
  texture,
  uniform,
  uv,
  uvec2,
  vec3,
  vec4
} from 'three/tsl'
import * as THREE from 'three/webgpu'

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
 * Cursor
 */
const raycaster = new THREE.Raycaster()
const cursor = new THREE.Vector2()
const intersectionPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0)
window.addEventListener('pointermove', (event) => {
  cursor.x = (event.clientX / sizes.width) * 2 - 1
  cursor.y = -(event.clientY / sizes.height) * 2 + 1
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
camera.position.x = -3
camera.position.y = 3.25
camera.position.z = 5.5
camera.layers.enableAll()
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
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFShadowMap
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.setClearColor(0x111111)
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
 * Sky
 */
const sky = new SkyMesh()
sky.scale.setScalar(1000)
scene.add(sky)
const effectController = {
  turbidity: 0.4,
  rayleigh: 0.025,
  mieCoefficient: 0.006,
  mieDirectionalG: 0.38,
  elevation: 14.5,
  azimuth: 126.9,
  cloudCoverage: 0.4,
  cloudDensity: 0.4,
  cloudElevation: 0.5
}

const sun = new THREE.Vector3()

function skyChanged() {
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
skyGui.add(effectController, 'elevation', 0, 90, 0.1).onChange(skyChanged)
skyGui.add(effectController, 'azimuth', -180, 180, 0.1).onChange(skyChanged)

/**
 * Lights
 */
const directionalLight = new THREE.DirectionalLight(0xffffff, 6)
directionalLight.castShadow = true
directionalLight.position.set(1, 0.05, -0.75).multiplyScalar(10)
directionalLight.shadow.camera.top = 7
directionalLight.shadow.camera.right = 7
directionalLight.shadow.camera.bottom = -7
directionalLight.shadow.camera.left = -7
directionalLight.shadow.camera.near = 0.01
directionalLight.shadow.camera.far = 30
directionalLight.shadow.radius = 5
directionalLight.shadow.normalBias = 0.1
scene.add(directionalLight)

const ambientLight = new THREE.AmbientLight(0x00aaff, 1.65)
scene.add(ambientLight)

// Debug
const lightsGui = renderer.inspector.createParameters('Lights').close()

lightsGui.addColor(directionalLight, 'color').name('directionalColor')
lightsGui.add(directionalLight.position, 'y', 0, 2, 0.01).name('directionalY')
lightsGui
  .add(directionalLight, 'intensity', 0, 10, 0.01)
  .name('directionalIntensity')
lightsGui.addColor(ambientLight, 'color').name('ambientColor')
lightsGui.add(ambientLight, 'intensity', 0, 5, 0.01).name('ambientIntensity')

/**
 * Objects
 */
const objectsOptions = {
  wireframe: false,
  animated: true
}

// Box
const box = new THREE.Mesh(
  new THREE.BoxGeometry(1, 1, 1),
  new THREE.MeshStandardMaterial({
    wireframe: objectsOptions.wireframe,
    color: 0xf5f5f5
  })
)
box.castShadow = true
box.receiveShadow = true
box.material.shadowSide = THREE.FrontSide
scene.add(box)

// Sphere
const sphere = new THREE.Mesh(
  new THREE.IcosahedronGeometry(0.65, 1),
  new THREE.MeshStandardMaterial({
    wireframe: objectsOptions.wireframe,
    color: 0xf5f5f5
  })
)
sphere.castShadow = true
sphere.receiveShadow = true
sphere.material.shadowSide = THREE.FrontSide
scene.add(sphere)

// Michelle
const model = await gltfLoader.loadAsync('./Michelle.glb')
const michelle = model.scene
const michelleMesh = michelle.children[0].children[0]
michelleMesh.material.side = THREE.FrontSide
michelleMesh.material.wireframe = objectsOptions.wireframe
michelleMesh.castShadow = true
michelleMesh.receiveShadow = true
michelle.scale.setScalar(2)
scene.add(michelle)

const mixer = new THREE.AnimationMixer(model.scene)
const action = mixer.clipAction(model.animations[0])
action.play()

// Debug
const objectsGui = renderer.inspector.createParameters('Objects')
objectsGui.add(objectsOptions, 'wireframe').onChange(() => {
  box.material.wireframe = objectsOptions.wireframe
  sphere.material.wireframe = objectsOptions.wireframe
  michelleMesh.material.wireframe = objectsOptions.wireframe
})
objectsGui.add(objectsOptions, 'animated')

/**
 * Common
 */
const size = 20
const resolution = 512
const thickness = uniform(0.3)

/**
 * Depth
 */
const halfSize = size / 2
const near = 1
const safe = uniform(1)
const far = near + safe.value + thickness.value

// Camera
const depthCamera = new THREE.OrthographicCamera(
  -halfSize,
  halfSize,
  halfSize,
  -halfSize,
  near,
  far
)
depthCamera.position.y = -(near + safe.value)
depthCamera.rotation.x = Math.PI / 2
scene.add(depthCamera)

// // Helper
// const cameraHelper = new THREE.CameraHelper(depthCamera)
// scene.add(cameraHelper)

// Render target
const depthRenderTarget = new THREE.RenderTarget(resolution, resolution)

// Depth texture
const depthTexture = new THREE.DepthTexture()
depthRenderTarget.depthTexture = depthTexture

// Depth material
const depthMaterial = new THREE.NodeMaterial()
depthMaterial.fragmentNode = vec4(0, 0, 0, 1)

/**
 * Compute texture
 */
// Storage texture
const snowTexture = new THREE.StorageTexture(resolution, resolution)
snowTexture.format = THREE.RedFormat
snowTexture.type = THREE.FloatType

// storageTexture 创建一个 node，并设置可读写
// 后续可以通过 store 方法写入，load 方法读取
const snowTextureNode = storageTexture(snowTexture).setAccess(
  THREE.NodeAccess.READ_WRITE
)

// Reset compute
const resetSnowCompute = Fn(() => {
  // UV
  const indexUV = uvec2(
    instanceIndex.mod(resolution),
    instanceIndex.div(resolution)
  )

  snowTextureNode.store(indexUV, vec4(1, 0, 0, 0))
})().compute(resolution * resolution)
renderer.compute(resetSnowCompute)

window.addEventListener('keydown', (event) => {
  if (event.code === 'Space') {
    renderer.compute(resetSnowCompute)
  }
})

// Update compute
const updateSnowTextureCompute = Fn(() => {
  // UV
  const indexUV = uvec2(
    instanceIndex.mod(resolution),
    instanceIndex.div(resolution)
  )

  const textureUV = indexUV.toVec2().div(resolution)

  // Setup
  const currentSnow = snowTextureNode.load(indexUV).r
  // toVar 创建一个新的变量，而不是引用
  const newSnow = currentSnow.toVar()

  // Dig depth
  const depth = texture(depthTexture, textureUV).r.remap(
    safe.div(thickness.add(safe)),
    1,
    0,
    thickness
  )
  newSnow.assign(min(newSnow, depth))

  // Store
  snowTextureNode.store(indexUV, vec4(newSnow, 0, 0, 0))
})().compute(resolution * resolution)

// Debug mesh
const debugMesh = new THREE.Mesh(
  new THREE.BoxGeometry(1, 1, 1),
  new THREE.NodeMaterial()
)
debugMesh.material.fragmentNode = vec4(texture(snowTexture).r, 0, 0, 1)
debugMesh.position.y = 2.5
debugMesh.scale.setScalar(2)
scene.add(debugMesh)

/**
 * Floor
 */
// Geometry
const geometry = new THREE.PlaneGeometry(size, size, resolution, resolution)

// Normal texture
const textureNormal = textureLoader.load('./snow_field_aerial_nor_gl_2k.png')
textureNormal.wrapS = THREE.RepeatWrapping
textureNormal.wrapT = THREE.RepeatWrapping
textureNormal.repeat.x = 3
textureNormal.repeat.y = 3

// Material
const material = new THREE.MeshStandardNodeMaterial({
  normalMap: textureNormal,
  roughness: 0.5,
  transparent: true
})

material.opacityNode = uv().sub(0.5).length().smoothstep(0.5, 0.35)

const snowElevation = Fn(([position]) => {
  const snowUV = position.div(size).add(0.5)
  return texture(snowTexture, snowUV).r
})

material.positionNode = Fn(() => {
  // Elevation
  const newPosition = positionLocal.toVar()
  newPosition.z.addAssign(snowElevation(newPosition.xy))

  // Normal
  const spacing = size / resolution
  const positionA = positionLocal.add(vec3(spacing, 0, 0))
  const positionB = positionLocal.add(vec3(0, spacing, 0))
  positionA.z.addAssign(snowElevation(positionA.xy))
  positionB.z.addAssign(snowElevation(positionB.xy))
  const toA = positionA.sub(newPosition).normalize()
  const toB = positionB.sub(newPosition).normalize()

  normalLocal.assign(cross(toA, toB))

  return newPosition
})()

// Mesh
const floor = new THREE.Mesh(geometry, material)
floor.rotation.x = -Math.PI / 2
floor.receiveShadow = true
floor.castShadow = true
scene.add(floor)

/**
 * Animate
 */
const timer = new THREE.Timer()

const tick = () => {
  timer.update()
  const elapsedTime = timer.getElapsed()
  const deltaTime = timer.getDelta()

  // Update controls
  controls.update()

  // Cursor + Raycaster
  raycaster.setFromCamera(cursor, camera)
  const intersect = new THREE.Vector3()
  raycaster.ray.intersectPlane(intersectionPlane, intersect)

  // Animate objects
  if (objectsOptions.animated) {
    box.position.x = Math.cos(elapsedTime * 0.6) * 2
    box.position.z = Math.sin(elapsedTime * 0.6) * 2
    box.position.y = 0.75
    box.rotation.x = elapsedTime
    box.rotation.z = elapsedTime * 1.23

    mixer.update(timer.getDelta())
  }

  sphere.position.x += (intersect.x - sphere.position.x) * deltaTime * 3
  sphere.position.y = 0.5
  sphere.position.z += (intersect.z - sphere.position.z) * deltaTime * 3

  // Reset
  // 获取 reset 之前的 state
  const rendererState = THREE.RendererUtils.resetRendererState(renderer)

  // Render depth
  // 隐藏 floor，避免出现对 depthTexture 进行同时的读和写
  floor.visible = false
  // 使用极简的 material 来渲染，避免性能浪费
  scene.overrideMaterial = depthMaterial
  // 设置 render target
  renderer.setRenderTarget(depthRenderTarget)
  renderer.render(scene, depthCamera)

  // Restore
  floor.visible = true
  scene.overrideMaterial = null
  // 恢复 render target
  renderer.setRenderTarget(null)
  // 恢复之前的 renderer state
  THREE.RendererUtils.restoreRendererState(renderer, rendererState)

  // Compute snow
  renderer.compute(updateSnowTextureCompute)

  // Render
  renderPipeline.render()
}

renderer.setAnimationLoop(tick)
