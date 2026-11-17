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
import { color } from 'three/tsl'

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
 * Cursor
 */

const raycaster = new THREE.Raycaster()
const cursor = new THREE.Vector2()

window.addEventListener('pointermove', (event) => {
  cursor.x = (event.clientX / sizes.width) * 2 - 1
  cursor.y = -(event.clientY / sizes.height) * 2 + 1
})

// Helper
const cursorHelper = new THREE.Mesh(
  new THREE.IcosahedronGeometry(1, 3),
  new THREE.MeshBasicMaterial({ wireframe: true })
)
// scene.add(cursorHelper)

/**
 * Sphere particles
 */
const count = 6000

// Buffers
const positionsBuffer = instancedArray(count, 'vec3')
const velocitiesBuffer = instancedArray(count, 'vec3')
const heatBuffer = instancedArray(count, 'float')

// Uniforms
const radius = uniform(0.15)
const gravityStrength = uniform(0.025)
const impactDamping = uniform(0.05)
const generalDamping = uniform(0.4)
const heatDamping = uniform(3)
const heatImpactStrength = uniform(30)
const emissiveColor = uniform(color(0xff3f0f))
const cursorPosition = uniform(vec3())
const cursorVelocity = uniform(vec3())
const cursorRadius = uniform(1.75)
const cursorStrength = uniform(0.05)

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
  const aHeat = heatBuffer.element(instanceIndex)

  // Cursor
  const cursorDistance = aPosition.distance(cursorPosition)
  // 距离 cursor 越近，越接近 1
  const cursorDistanceRatio = cursorDistance.div(cursorRadius).oneMinus().max(0)
  const _cursorVelocity = cursorVelocity
    .mul(cursorDistanceRatio)
    .mul(cursorStrength)
  aVelocity.addAssign(_cursorVelocity)
  aHeat.addAssign(_cursorVelocity.length().mul(50))

  // Center gravity
  const toCenter = aPosition.negate().normalize()
  const gravityVelocity = toCenter.mul(gravityStrength).mul(clampedDeltaTime)
  aVelocity.addAssign(gravityVelocity)

  // Sphere collision
  Loop({ start: instanceIndex.add(1), end: count }, ({ i }) => {
    // Buffers
    const bPosition = positionsBuffer.element(i)
    const bVelocity = velocitiesBuffer.element(i)
    const bHeat = heatBuffer.element(i)

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
      const impactVelocity = direction
        .mul(impactStrength)
        .mul(impactDamping.oneMinus())
      aVelocity.subAssign(impactVelocity)
      bVelocity.addAssign(impactVelocity)

      // Impact heat
      const heat = impactStrength.sub(0.01).max(0).mul(heatImpactStrength)
      aHeat.addAssign(heat)
      bHeat.addAssign(heat)
    })
  })

  // Apply velocity
  aPosition.addAssign(aVelocity)

  // Velocity damping
  aVelocity.mulAssign(generalDamping.mul(clampedDeltaTime).oneMinus())

  // Heat damping
  aHeat.mulAssign(heatDamping.mul(clampedDeltaTime).oneMinus())
})().compute(count)

// Geometry
const geometry = new THREE.IcosahedronGeometry(1, 2)

// Material
const material = new THREE.MeshLambertNodeMaterial({ color: 0xffffff })

// Position
material.positionNode = Fn(() => {
  // Scale
  positionLocal.mulAssign(radius)

  // Translate
  positionLocal.addAssign(positionsBuffer.element(instanceIndex))

  return positionLocal
})()

// Emissive
const heat = heatBuffer.element(instanceIndex)

material.emissiveNode = emissiveColor.mul(heat)

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
spheresGui.add(impactDamping, 'value', 0, 0.1, 0.001).name('impactDamping')
spheresGui.add(generalDamping, 'value', 0, 1, 0.01).name('generalDamping')
spheresGui.add(heatDamping, 'value', 0, 10, 0.1).name('heatDamping')
spheresGui
  .add(heatImpactStrength, 'value', 0, 100, 0.1)
  .name('heatImpactStrength')
spheresGui.addColor(emissiveColor, 'value').name('emissiveColor')
spheresGui.add(cursorRadius, 'value', 0, 5, 0.001).name('cursorRadius')
spheresGui.add(cursorStrength, 'value', 0, 0.2, 0.001).name('cursorStrength')

/**
 * Animate
 */
const tick = () => {
  // Update controls
  controls.update()

  // Cursor + Raycaster
  raycaster.setFromCamera(cursor, camera)
  const planeNormal = camera.position.clone().normalize()
  const plane = new THREE.Plane(planeNormal, 0)

  const intersect = new THREE.Vector3()
  raycaster.ray.intersectPlane(plane, intersect)

  cursorHelper.position.copy(intersect)

  cursorVelocity.value.copy(intersect).sub(cursorPosition.value)
  cursorPosition.value.copy(intersect)

  // Computes
  renderer.compute(updateCompute)

  // Render
  renderPipeline.render()
}

renderer.setAnimationLoop(tick)
