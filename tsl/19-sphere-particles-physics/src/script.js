import * as THREE from 'three/webgpu'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { Inspector } from 'three/addons/inspector/Inspector.js'
import { bloom } from 'three/examples/jsm/tsl/display/BloomNode.js'
import { EPSILON, Fn, pass, positionLocal, uniform } from 'three/tsl'
import { instancedArray } from 'three/tsl'
import { instanceIndex } from 'three/tsl'
import { vec3 } from 'three/tsl'
import { hash } from 'three/tsl'
import { deltaTime } from 'three/tsl'
import { Loop } from 'three/tsl'
import { If } from 'three/tsl'
import { dot } from 'three/tsl'

/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.threejs')

// Scene
const scene = new THREE.Scene()

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
camera.position.z = 16
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
renderer.toneMapping = THREE.CineonToneMapping
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFShadowMap
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.setClearColor(0x252028)
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
bloomPass.strength.value = 0.15

renderPipeline.outputNode = scenePassColor.add(bloomPass)

const bloomGui = renderer.inspector.createParameters('Bloom').close()
bloomGui.add(bloomPass.threshold, 'value', 0, 2, 0.01).name('threshold')
bloomGui.add(bloomPass.strength, 'value', 0, 2, 0.01).name('strength')

/**
 * Lights
 */
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.3)
directionalLight.castShadow = true
directionalLight.position.set(1, 1, 0.75).normalize().multiplyScalar(8)
directionalLight.shadow.camera.far = 16
directionalLight.shadow.camera.top = 8
directionalLight.shadow.camera.right = 8
directionalLight.shadow.camera.bottom = -8
directionalLight.shadow.camera.left = -8
directionalLight.shadow.mapSize.set(2048, 2048)
directionalLight.shadow.radius = 30
directionalLight.shadow.normalBias = -0.1
scene.add(directionalLight)

const cameraHelper = new THREE.CameraHelper(directionalLight.shadow.camera)
// scene.add(cameraHelper)

const ambientLight = new THREE.AmbientLight(0xe8b8ff, 0.08)
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
 * Sphere particles
 */
const count = 10

// Buffers
const positionsBuffer = instancedArray(count, 'vec3')
const velocitiesBuffer = instancedArray(count, 'vec3')

// Uniforms
const radius = uniform(0.5)
const gravityStrength = uniform(0.025)

// Computes
const initCompute = Fn(() => {
  const position = positionsBuffer.element(instanceIndex)

  position.assign(
    vec3(
      hash(instanceIndex),
      hash(instanceIndex.add(12).mul(2)),
      hash(instanceIndex.add(23).mul(3))
    )
      .sub(0.5)
      .mul(10)
  )
})().compute(count)

renderer.compute(initCompute)

const updateCompute = Fn(() => {
  const clampedDeltaTime = deltaTime.min(1 / 30)

  // Buffers
  const aPosition = positionsBuffer.element(instanceIndex)
  const aVelocity = velocitiesBuffer.element(instanceIndex)

  // Center gravity
  const toCenter = aPosition.negate().normalize()
  const gravityVelocity = toCenter.mul(gravityStrength).mul(clampedDeltaTime)
  aVelocity.addAssign(gravityVelocity)

  // Sphere collision
  Loop({ start: instanceIndex.add(1), end: count }, ({ i }) => {
    // Buffers
    const bPosition = positionsBuffer.element(i)
    const bVelocity = velocitiesBuffer.element(i)

    // Relation to sphere A
    const delta = bPosition.sub(aPosition)
    const distance = delta.length()
    const direction = delta.div(distance.max(EPSILON))

    // Is touching
    const radius2 = radius.mul(2)
    If(distance.lessThan(radius2), () => {
      // Move away by overlap distance
      const overlap = radius2.sub(distance)
      const avoidance = direction.mul(overlap.div(2))
      aPosition.subAssign(avoidance)
      bPosition.addAssign(avoidance)

      // Apply impact velocities
      const relativeVelocity = aVelocity.sub(bVelocity)
      const impactStrength = dot(relativeVelocity, direction)
      const impactVelocity = direction.mul(impactStrength)
      aVelocity.subAssign(impactVelocity)
      bVelocity.addAssign(impactVelocity)
    })
  })

  // Apply velocity
  aPosition.addAssign(aVelocity)
})().compute(count)

// Geometry
const geometry = new THREE.IcosahedronGeometry(1, 2)

// Material
const material = new THREE.MeshLambertNodeMaterial({ color: 0xffffff })

material.positionNode = Fn(() => {
  // Scale
  positionLocal.mulAssign(radius)

  // Translate
  positionLocal.addAssign(positionsBuffer.element(instanceIndex))

  return positionLocal
})()

// Mesh
const mesh = new THREE.Mesh(geometry, material)
mesh.castShadow = true
mesh.receiveShadow = true
mesh.frustumCulled = false
mesh.count = count

scene.add(mesh)

// Debug
const spheresGui = renderer.inspector.createParameters('Spheres')
spheresGui.add(radius, 'value', 0, 0.5, 0.001).name('radius')
spheresGui.add(gravityStrength, 'value', 0, 0.1, 0.001).name('gravityStrength')

/**
 * Animate
 */
const tick = () => {
  // Update controls
  controls.update()

  // Computes
  renderer.compute(updateCompute)

  // Render
  renderPipeline.render()
}

renderer.setAnimationLoop(tick)
