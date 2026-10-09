import * as THREE from 'three/webgpu'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { Inspector } from 'three/addons/inspector/Inspector.js'
import {
  add,
  atan,
  checker,
  color,
  cos,
  distance,
  Fn,
  hash,
  mix,
  mul,
  mx_noise_float,
  mx_worley_noise_float,
  parallaxUV,
  PI,
  PI2,
  rand,
  tan,
  time,
  uv,
  vec2,
  vec3
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
camera.position.set(1.25, 2, 4)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
// controls.target.set(0, 1, 0)
controls.target.set(0, 0, 0)
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
 * Floor
 */
{
  const textureColor = textureLoader.load('./floor-color.jpg')
  textureColor.colorSpace = THREE.SRGBColorSpace

  const geometry = new THREE.PlaneGeometry(10, 10)

  const material = new THREE.MeshBasicNodeMaterial({
    map: textureColor,
    transparent: true
  })
  material.opacityNode = uv().sub(0.5).length().smoothstep(0.5, 0.2)

  const mesh = new THREE.Mesh(geometry, material)
  mesh.rotation.x = -Math.PI * 0.5
  mesh.receiveShadow = true
  scene.add(mesh)
}

/**
 * Patterns
 */
// Geometry
// const geometry = new THREE.PlaneGeometry(2, 2, 1, 1)
const geometry = new THREE.CircleGeometry(2, 32)

// Material
const material = new THREE.MeshBasicNodeMaterial()

// Pattern 1
material.colorNode = vec3(uv(), 1)

// Pattern 2
material.colorNode = vec3(uv().x)

// Pattern 3
material.colorNode = vec3(uv().x.mul(10).fract())
// material.colorNode = vec3(uv().x.mul(10).mod())

// Pattern 4
// material.colorNode = vec3(
//   add(uv().x.mul(10).fract().step(0.5), uv().y.mul(10).fract().step(0.5)).mod(2)
// )
material.colorNode = checker(uv().mul(10))

// Pattern 5
material.colorNode = vec3(uv().distance(0.5))

// Pattern 6
const polarUv = uv().sub(0.5)
const angle = atan(polarUv.x, polarUv.y)
material.colorNode = vec3(angle.remap(PI.negate(), PI))

// Pattern 7
const subdivision = 10
const gridUv = uv().mul(subdivision).floor()
// const random = hash(gridUv.x.mul(subdivision).add(gridUv.y))
const random = rand(gridUv)
material.colorNode = vec3(random)

// Pattern 8
const perlinUv = uv().mul(5)
const perlinNoise = mx_noise_float(perlinUv) // [-1, 1]
material.colorNode = vec3(perlinNoise.mul(5).add(time).fract().step(0.8))

// Pattern 9
// By Inigo Quilez (https://iquilezles.org/articles/palettes/)
export const palette = /*@__PURE__*/ Fn(
  ([t, a, b, c, d]) => {
    return a.add(b.mul(cos(mul(6.283185, c.mul(t).add(d)))))
  },
  { t: 'float', a: 'vec3', b: 'vec3', c: 'vec3', d: 'vec3', return: 'vec3' }
)

const worleyUv = uv().mul(10)
const workeyNoise = mx_worley_noise_float(vec3(worleyUv, time))
material.colorNode = palette(
  workeyNoise,
  vec3(0.5, 0.3, 0.4),
  vec3(0.9, 0.5, 0.4),
  vec3(1.0, 1.0, 1.0),
  vec3(0.0, 0.1, 0.2)
)

// Pattern 10
const depthUv = parallaxUV(uv(), 0.5).xy
const causticsInput = vec3(depthUv.mul(6), time.mul(0.3))
const causticsNoise = mx_worley_noise_float(causticsInput).pow(3)
const depthColor = mix(color(0x1b3956), color(0x11eeff), causticsNoise)

// 泡沫
const foamInput = vec3(uv().mul(5), time.mul(0.1))
const foamNoise = mx_noise_float(foamInput)
const foamMask = foamNoise.abs().step(0.05).oneMinus()
const foamColor = color(0xe5f7ff)

// 睡莲叶
const lilyPadInput = vec3(uv().mul(4), 0)
const lilyPadNoise = mx_worley_noise_float(lilyPadInput)
const lilyPadMask = lilyPadNoise.step(0.2).oneMinus()
const lilyPadColor = mix(
  color(0xd7e689),
  color(0x329a89),
  lilyPadNoise.div(0.2)
)

let final = mix(depthColor, foamColor, foamMask)
final = mix(final, lilyPadColor, lilyPadMask)

material.colorNode = final

// Mesh
const mesh = new THREE.Mesh(geometry, material)
// mesh.position.y = 1
mesh.rotation.x = -Math.PI / 2
mesh.position.y = 0.01
scene.add(mesh)

/**
 * Animate
 */
const timer = new THREE.Timer()

const tick = () => {
  timer.update()

  // Update controls
  controls.update()

  // Render
  renderer.render(scene, camera)
}

renderer.setAnimationLoop(tick)
