import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import {RGBELoader} from "three/addons";
import GUI from 'lil-gui'
const gui = new GUI()


/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

// textures
const textureLoader = new THREE.TextureLoader()
const textureDoorColor = textureLoader.load('/textures/door/color.jpg')
const textureDoorAlpha = textureLoader.load('/textures/door/alpha.jpg')
const textureDoorAO = textureLoader.load('/textures/door/ambientOcclusion.jpg')
const textureDoorHeight = textureLoader.load('/textures/door/height.jpg')
const textureDoorNormal = textureLoader.load('/textures/door/normal.jpg')
const textureDoorMetalness = textureLoader.load('/textures/door/metalness.jpg')
const textureDoorRoughness = textureLoader.load('/textures/door/roughness.jpg')
const textureMatcap = textureLoader.load('/textures/matcaps/8.png')
const textureGradient = textureLoader.load('/textures/gradients/3.jpg')

// 不指定的话颜色会有问题
textureDoorColor.colorSpace = THREE.SRGBColorSpace
textureMatcap.colorSpace = THREE.SRGBColorSpace

// Objects
// material
// const material = new THREE.MeshBasicMaterial({map : textureDoorColor})

const material = new THREE.MeshStandardMaterial()
material.matalness = 1
material.roughness = 1
material.map = textureDoorColor
material.aoMap = textureDoorAO
material.aoMapIntensity = 1
material.displacementMap = textureDoorHeight
material.displacementScale = 0.1
material.metalnessMap = textureDoorMetalness
material.roughnessMap = textureDoorRoughness
material.normalMap = textureDoorNormal
material.normalScale.set(2, 2)
material.transparent = true
material.alphaMap = textureDoorAlpha

gui.add(material, 'matalness').min(0).max(1).step(0.0001)
gui.add(material, 'roughness').min(0).max(1).step(0.0001)
const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 64, 64),
    material
)

sphere.position.x = -1.5
const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(1, 1, 100, 100),
    material
)

const torus = new THREE.Mesh(
    new THREE.TorusGeometry(0.3, 0.2, 64, 128),
    material
)

torus.position.x = 1.5

scene.add(sphere, plane, torus)

// const ambientLight = new THREE.AmbientLight(0xffffff, 1)
// scene.add(ambientLight)
// const pointLight = new THREE.PointLight(0xffffff, 30)
// pointLight.position.x = 2
// pointLight.position.y = 3
// pointLight.position.z = 4
// scene.add(pointLight)

const rgbeLoader = new RGBELoader()
rgbeLoader.load('/textures/environmentMap/2k.hdr', (environmentMap) => {
    environmentMap.mapping = THREE.EquirectangularReflectionMapping
    scene.background = environmentMap
    scene.environment = environmentMap
})

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
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
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 1
camera.position.y = 1
camera.position.z = 2
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // Update objects
    sphere.rotation.y = elapsedTime * 0.1
    plane.rotation.y = elapsedTime * 0.1
    torus.rotation.y = elapsedTime * 0.1

    sphere.rotation.x = elapsedTime * -0.15
    plane.rotation.x = elapsedTime * -0.15
    torus.rotation.x = elapsedTime * -0.15

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()