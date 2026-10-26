import * as THREE from 'three/webgpu'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { Inspector } from 'three/addons/inspector/Inspector.js'
import {
  Fn,
  instance,
  instancedArray,
  instancedBufferAttribute,
  instanceIndex,
  normalLocal,
  positionLocal,
  rotate,
  sin,
  storage,
  time,
  uniform,
  uniformArray,
  uv
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
camera.position.x = 2
camera.position.y = 2.5
camera.position.z = 4 * 1.25
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.target.set(0, 0.75, 0)
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
await renderer.init()

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
  mesh.renderOrder = -1
  scene.add(mesh)
}
/**
 * Common
 */

const count = 4
// Geometry
const geometry = new THREE.BoxGeometry(0.5, 1, 0.5, 12, 12, 12)
// Material
const material = new THREE.MeshStandardNodeMaterial()

// Wave
const wave = sin(time.add(positionLocal.y.mul(3))).mul(0.4)

// /**
//  * Method 1:
//  * Without instancing
//  */

// material.positionNode = Fn(() => {
//   positionLocal.z.addAssign(wave)
//   return positionLocal
// })()

// for (let i = 0; i < count; i++) {
//   // Mesh
//   const mesh = new THREE.Mesh(geometry, material)
//   mesh.castShadow = true
//   mesh.receiveShadow = true
//   scene.add(mesh)

//   const process = i / (count - 1)
//   mesh.position.x = (process - 0.5) * 4
//   mesh.position.y = 1
//   mesh.rotation.y = process * 3
// }

// /**
//  * Method 2:
//  * With InstancedMesh
//  */

// material.positionNode = Fn(() => {
//   positionLocal.z.addAssign(wave)
//   return positionLocal
// })()

// const mesh = new THREE.InstancedMesh(geometry, material, count)
// mesh.position.y = 1
// mesh.castShadow = true
// mesh.receiveShadow = true
// scene.add(mesh)

// // Matrices
// for (let i = 0; i < count; i++) {
//   const process = i / (count - 1)
//   const position = new THREE.Vector3((process - 0.5) * 4, 0, 0)
//   const scale = new THREE.Vector3(1, 1, 1)
//   const rotation = new THREE.Quaternion().setFromEuler(
//     new THREE.Euler(0, process * 3, 0)
//   )
//   const matrix = new THREE.Matrix4().compose(position, rotation, scale)
//   mesh.setMatrixAt(i, matrix)
// }

// /**
//  * Method 3:
//  * With `instanceIndex`
//  */
// // Material
// const countUniform = uniform(count)

// material.positionNode = Fn(({ object }) => {
//   //   const progress = instanceIndex.toFloat().div(object.count - 1)
//   const progress = instanceIndex.toFloat().div(countUniform.sub(1))

//   // Wave
//   positionLocal.z.addAssign(wave)

//   // Rotation
//   positionLocal.xz.assign(rotate(positionLocal.xz, progress.mul(3)))
//   // 投影不对是因为 normal 未旋转
//   normalLocal.xz.assign(rotate(normalLocal.xz, progress.mul(3)))

//   // Translation
//   positionLocal.x.addAssign(progress.sub(0.5).mul(4))

//   return positionLocal
// })()

// const mesh = new THREE.Mesh(geometry, material)
// mesh.count = count
// mesh.position.y = 1
// mesh.castShadow = true
// mesh.receiveShadow = true
// scene.add(mesh)

// // Debug
// const instancesGui = renderer.inspector.createParameters('Instances')
// instancesGui.add(mesh, 'count', 0, 20, 1).onChange(() => {
//   countUniform.value = mesh.count
// })

// /**
//  * Method 4:
//  * With InstancedBufferAttribute
//  */
// // Buffers
// const rotationsArray = new Float32Array(count)
// const rotationsBuffer = new THREE.InstancedBufferAttribute(rotationsArray, 1)

// const positionsArray = new Float32Array(count * 3)
// const positionsBuffer = new THREE.InstancedBufferAttribute(positionsArray, 3)
// for (let i = 0; i < count; i++) {
//   const i3 = i * 3
//   const progress = i / (count - 1)

//   positionsArray[i3 + 0] = (progress - 0.5) * 4
//   positionsArray[i3 + 1] = 0
//   positionsArray[i3 + 2] = 0

//   rotationsArray[i] = progress * 3
// }

// // Material
// material.positionNode = Fn(() => {
//   // Buffers
//   const instancedPosition = instancedBufferAttribute(positionsBuffer)
//   const instancedRotation = instancedBufferAttribute(rotationsBuffer)

//   // Rotation
//   positionLocal.xz.assign(rotate(positionLocal.xz, instancedRotation))
//   normalLocal.xz.assign(rotate(normalLocal.xz, instancedRotation))

//   // Transition
//   positionLocal.addAssign(instancedPosition)

//   // Wave
//   positionLocal.z.addAssign(wave)

//   return positionLocal
// })()

// /**
//  * Method 5:
//  * With InstancedInterleavedBuffer
//  */
// // Buffers
// const array = new Float32Array(count * 4)
// const buffer = new THREE.InstancedInterleavedBuffer(array, 4)
// for (let i = 0; i < count; i++) {
//   const i4 = i * 4
//   const progress = i / (count - 1)

//   array[i4 + 0] = (progress - 0.5) * 4
//   array[i4 + 1] = 0
//   array[i4 + 2] = 0
//   array[i4 + 3] = progress * 3
// }

// // Material
// material.positionNode = Fn(() => {
//   // Buffers
//   const instancedPosition = instancedBufferAttribute(buffer, 'vec3', 0, 0)
//   const instancedRotation = instancedBufferAttribute(buffer, 'float', 0, 3)

//   // Rotation
//   positionLocal.xz.assign(rotate(positionLocal.xz, instancedRotation))
//   normalLocal.xz.assign(rotate(normalLocal.xz, instancedRotation))

//   // Transition
//   positionLocal.addAssign(instancedPosition)

//   // Wave
//   positionLocal.z.addAssign(wave)

//   return positionLocal
// })()

// //  Mesh
// const mesh = new THREE.Mesh(geometry, material)
// mesh.count = count
// mesh.position.y = 1
// mesh.castShadow = true
// mesh.receiveShadow = true
// scene.add(mesh)

// /**
//  * Method 6:
//  * With InstancedBufferAttribute and full matrices
//  */
// // Buffers
// const matricesArray = new Float32Array(count * 16)
// const matricesBuffer = new THREE.InstancedBufferAttribute(matricesArray, 16)

// for (let i = 0; i < count; i++) {
//   const process = i / (count - 1)
//   const position = new THREE.Vector3((process - 0.5) * 4, 0, 0)
//   const scale = new THREE.Vector3(1, 1, 1)
//   const rotation = new THREE.Quaternion().setFromEuler(
//     new THREE.Euler(0, process * 3, 0)
//   )
//   const matrix = new THREE.Matrix4().compose(position, rotation, scale)

//   matrix.toArray(matricesArray, i * 16)
// }

// // Material
// material.positionNode = Fn(() => {
//   // Instance transform
//   // 应用 matrix
//   instance(matricesBuffer)

//   // Wave
//   positionLocal.z.addAssign(wave)

//   return positionLocal
// })()

// //  Mesh
// const mesh = new THREE.Mesh(geometry, material)
// mesh.count = count
// mesh.position.y = 1
// mesh.castShadow = true
// mesh.receiveShadow = true
// scene.add(mesh)

// /**
//  * Method 7:
//  * With uniformArray
//  */
// // Buffers
// const positionsArray = []
// const rotationsArray = []

// for (let i = 0; i < count; i++) {
//   const process = i / (count - 1)

//   const position = new THREE.Vector3((process - 0.5) * 4, 0, 0)
//   const rotation = process * 3

//   positionsArray.push(position)
//   rotationsArray.push(rotation)
// }

// const positions = uniformArray(positionsArray, 'vec3')
// const rotations = uniformArray(rotationsArray, 'float')

// // Material
// material.positionNode = Fn(() => {
//   // Buffers
//   const instancedPosition = positions.element(instanceIndex)
//   const instancedRotation = rotations.element(instanceIndex)

//   // Rotation
//   positionLocal.xz.assign(rotate(positionLocal.xz, instancedRotation))
//   normalLocal.xz.assign(rotate(normalLocal.xz, instancedRotation))

//   // Translation
//   positionLocal.addAssign(instancedPosition)

//   // Wave
//   positionLocal.z.addAssign(wave)

//   return positionLocal
// })()

// //  Mesh
// const mesh = new THREE.Mesh(geometry, material)
// mesh.count = count
// mesh.position.y = 1
// mesh.castShadow = true
// mesh.receiveShadow = true
// scene.add(mesh)

// const maxBufferSize = renderer.backend.capabilities.getUniformBufferLimit()
// console.log(maxBufferSize)

/**
 * Method 8:
 * With storage and compute
 */

//  Buffer
// 第三个参数是 array 的类型
// const positionBuffer = new THREE.StorageInstancedBufferAttribute(
//   count,
//   3,
//   Float32Array
// )
// const positionStorage = storage(positionBuffer, 'vec3', count)
// 上面两行可缩写为如下
const positionStorage = instancedArray(count, 'vec3')

const update = Fn(() => {
  const position = positionStorage.element(instanceIndex)

  const instanceIndexFloat = instanceIndex.toFloat()
  const progress = instanceIndexFloat.div(count - 1)

  position.x.assign(progress.sub(0.5).mul(4))
  position.y.assign(time.add(progress).sin())
})()
const updateCompute = update.compute(count)

material.positionNode = Fn(() => {
  const instancedPosition = positionStorage.element(instanceIndex)
  positionLocal.addAssign(instancedPosition)
  return positionLocal
})()

//  Mesh
const mesh = new THREE.Mesh(geometry, material)
mesh.count = count
mesh.position.y = 1
mesh.castShadow = true
mesh.receiveShadow = true
scene.add(mesh)

/**
 * Lights
 */
const directionalLight = new THREE.DirectionalLight(0xffc799, 4)
directionalLight.castShadow = true
directionalLight.position.set(4, 2, 1).normalize().multiplyScalar(10)
directionalLight.shadow.radius = 5
directionalLight.shadow.normalBias = 0.1
scene.add(directionalLight)

const ambientLight = new THREE.AmbientLight(0x859dff, 0.5)
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
 * Animate
 */
const tick = () => {
  // Update controls
  controls.update()

  // Compute
  if (typeof updateCompute !== 'undefined') {
    renderer.compute(updateCompute)
  }

  // Render
  renderer.render(scene, camera)
}

renderer.setAnimationLoop(tick)
