import * as THREE from 'three'
import {OrbitControls} from "three/addons";

console.log(OrbitControls)
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

// Object
const geometry = new THREE.BoxGeometry(1, 1, 1)
const material = new THREE.MeshBasicMaterial({ color: 0xff0000 })
const mesh = new THREE.Mesh(geometry, material)

scene.add(mesh)

// Sizes
const sizes = {
    width: 800,
    height: 600
}

// Camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height)
camera.position.z = 3
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true
// controls.target.y = 1
// controls.update()

// Renderer
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})

// Cursor
const cursor = {
    x: 0,
    y: 0
}
window.addEventListener('mousemove', (e) => {
    cursor.x = e.clientX / sizes.width - 0.5
    cursor.y = -(e.clientY / sizes.height - 0.5)

})

const clock = new THREE.Clock()

// let startTime = performance.now()
const tick = () => {

    const elapsedTime = clock.getElapsedTime()
    // const t = performance.now()
    // const delta = t - startTime
    // mesh.rotation.y = 0.1 * clock.getElapsedTime()
    // startTime = t
    // camera.position.x =  Math.sin(cursor.x * 2 * Math.PI) * 3
    // camera.position.z =  Math.cos(cursor.x * 2 * Math.PI) * 3
    // camera.position.y = cursor.y * 3
    // camera.lookAt(mesh.position)

    controls.update()
    // Renderer
    renderer.render(scene, camera)
    requestAnimationFrame(tick)
}

requestAnimationFrame(tick)
renderer.setSize(sizes.width, sizes.height)

