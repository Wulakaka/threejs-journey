import * as THREE from 'three/webgpu'
import { GLTFLoader } from 'three/addons/Addons.js'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { Inspector } from 'three/addons/inspector/Inspector.js'
import { SkyMesh } from 'three/addons/objects/SkyMesh.js'
import { bloom } from 'three/addons/tsl/display/BloomNode.js'
import { Fn, pass, vec3 } from 'three/tsl'
import { texture } from 'three/tsl'
import { vec4 } from 'three/tsl'
import { vec2 } from 'three/tsl'
import { uvec2 } from 'three/tsl'
import { textureStore } from 'three/tsl'
import { instanceIndex } from 'three/tsl'
import { float } from 'three/tsl'
import { positionGeometry } from 'three/tsl'
import { instancedBufferAttribute } from 'three/tsl'
import { mul } from 'three/tsl'
import { range } from 'three/tsl'
import { TWO_PI } from 'three/tsl'
import { rotate } from 'three/tsl'
import { time } from 'three/tsl'
import { vertexIndex } from 'three/tsl'

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
anvil.scene.position.y = 1
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
 * Textures
 */
const terrainDataTexture = await textureLoader.loadAsync('./floor-data.png')
const terrainColorTexture = await textureLoader.loadAsync('./floor-color.jpg')
terrainColorTexture.colorSpace = THREE.SRGBColorSpace
const simpleNoiseTexture = await textureLoader.loadAsync(
  './simplex-tiling-noise-256x256.png'
)
simpleNoiseTexture.wrapS = THREE.RepeatWrapping
simpleNoiseTexture.wrapT = THREE.RepeatWrapping

/**
 * Compute normal
 */
const resolution = 32

const terrainNormalTexture = new THREE.StorageTexture(resolution, resolution)

const computeNormal = Fn(() => {
  // UV
  const indexUV = uvec2(
    instanceIndex.mod(resolution),
    instanceIndex.div(resolution)
  )
  const textureUV = indexUV.toVec2().div(resolution)

  // Sample texture on each side
  const texelSize = float(1).div(resolution)
  const xPos = texture(terrainDataTexture, textureUV.add(vec2(texelSize, 0))).r
  const xNeg = texture(terrainDataTexture, textureUV.sub(vec2(texelSize, 0))).r
  const yPos = texture(terrainDataTexture, textureUV.add(vec2(0, texelSize))).r
  const yNeg = texture(terrainDataTexture, textureUV.sub(vec2(0, texelSize))).r

  // Calculate normal
  const xDelta = xNeg.sub(xPos)
  const yDelta = yNeg.sub(yPos)
  const normal = vec3(xDelta, yDelta, 1).normalize()

  // Store
  const _color = vec4(normal.remap(-1, 1), 1)
  // toWriteOnly 通知 WebGPU API 我们只想写入缓存区，也就会开启相应的优化
  textureStore(terrainNormalTexture, indexUV, _color).toWriteOnly()
})().compute(resolution * resolution)

renderer.compute(computeNormal)

/**
 * Floor
 */
{
  // Geometry
  const geometry = new THREE.PlaneGeometry(10, 10, 20, 20)
  geometry.rotateX(-Math.PI * 0.5)

  // Material
  const material = new THREE.MeshStandardNodeMaterial({
    map: terrainColorTexture,
    displacementMap: terrainDataTexture,
    normalMap: terrainNormalTexture
  })

  // material.outputNode = texture(terrainNormalTexture)

  // Mesh
  const mesh = new THREE.Mesh(geometry, material)
  mesh.castShadow = true
  mesh.receiveShadow = true
  scene.add(mesh)
}

/**
 * Grass
 */
{
  const subdivisions = 100
  const count = subdivisions * subdivisions
  const size = 9.75
  const halfSize = size * 0.5
  const cellSize = size / (subdivisions - 1)

  // Blades position
  const instancePositionsArray = new Float32Array(count * 2)
  for (let iX = 0; iX < subdivisions; iX++) {
    for (let iZ = 0; iZ < subdivisions; iZ++) {
      const i = iX * subdivisions + iZ
      instancePositionsArray[i * 2 + 0] =
        iX * cellSize - halfSize + (Math.random() - 0.5) * cellSize
      instancePositionsArray[i * 2 + 1] =
        iZ * cellSize - halfSize + (Math.random() - 0.5) * cellSize
    }
  }
  const instancePositions = new THREE.InstancedBufferAttribute(
    instancePositionsArray,
    2
  )

  // Blade geometry
  // 二维三角形
  const vertexPositions = new Float32Array(3 * 2)
  vertexPositions[0] = 0.25
  vertexPositions[1] = 0
  vertexPositions[2] = -0.25
  vertexPositions[3] = 0
  vertexPositions[4] = 0
  vertexPositions[5] = 1
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute(
    'position',
    new THREE.Float32BufferAttribute(vertexPositions, 2)
  )
  // 处理无法计算 boundingSphere 的报错
  geometry.boundingSphere = new THREE.Sphere(
    new THREE.Vector3(),
    Math.hypot(halfSize, halfSize)
  )

  // Material
  const material = new THREE.MeshStandardNodeMaterial({
    side: THREE.DoubleSide
  })

  material.positionNode = Fn(() => {
    // 通过 step 筛选出来只有 vertexIndex 为 2 的值
    const tip = vertexIndex.toFloat().step(2)
    const newPosition = vec3(positionGeometry.xy, 0)
    const instancePosition = instancedBufferAttribute(instancePositions)

    // Terrain data
    // 这里不能使用 size
    const terrainUv = instancePosition.div(10).add(0.5)
    terrainUv.y.assign(terrainUv.y.oneMinus())
    const terrainData = texture(terrainDataTexture, terrainUv).rg

    // Rotation
    const angle = range(0, TWO_PI)
    newPosition.xz.assign(rotate(newPosition.xz, angle))

    // Scale
    const terrainScale = terrainData.g.remapClamp(0, 0.2)
    const scale = mul(range(0.7, 1), 0.4, terrainScale)
    newPosition.mulAssign(scale)

    // Instance position
    newPosition.xz.addAssign(instancePosition)

    // Terrain elevation
    newPosition.y.addAssign(terrainData.r)

    // Wind
    const wind = texture(
      simpleNoiseTexture,
      terrainUv.mul(0.4).add(time.mul(0.08))
    ).r

    // Wiggle
    const wiggleTime = time.add(instanceIndex).mul(7)
    const wiggle = mul(
      wind,
      terrainScale,
      terrainData.r,
      tip,
      wiggleTime.sin(),
      0.06
    )
    newPosition.x.addAssign(wiggle)

    // Bend
    const bend = mul(terrainScale, wind.remap(0, 1, -0.1, 0.1), tip)
    newPosition.x.addAssign(bend)

    return newPosition
  })()

  // Mesh
  const mesh = new THREE.Mesh(geometry, material)
  mesh.count = count
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
