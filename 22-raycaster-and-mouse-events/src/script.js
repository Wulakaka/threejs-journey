import * as THREE from 'three'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js'
import GUI from 'lil-gui'
import {GLTFLoader} from "three/addons";

/**
 * Base
 */
// Debug
const gui = new GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight('#ffffff', 3)
scene.add(ambientLight)

/**
 * Objects
 */
const object1 = new THREE.Mesh(
  new THREE.SphereGeometry(0.5, 16, 16),
  new THREE.MeshBasicMaterial({color: '#ff0000'})
)
object1.position.x = -2

const object2 = new THREE.Mesh(
  new THREE.SphereGeometry(0.5, 16, 16),
  new THREE.MeshBasicMaterial({color: '#ff0000'})
)

const object3 = new THREE.Mesh(
  new THREE.SphereGeometry(0.5, 16, 16),
  new THREE.MeshBasicMaterial({color: '#ff0000'})
)
object3.position.x = 2

scene.add(object1, object2, object3)

// model
let model = null
const gltfLoader = new GLTFLoader()
gltfLoader.load('/models/Duck/glTF-Binary/Duck.glb', (gltf) => {
  model = gltf.scene
  console.log(model)
  model.position.y = -2
  scene.add(model)
})

/**
 * Raycaster
 */
const raycaster = new THREE.Raycaster()


/**
 * Mouse
 */

let currentIntersect = null

const mouse = new THREE.Vector2()
window.addEventListener('mousemove', (event) => {
  mouse.x = event.clientX / sizes.width * 2 - 1
  mouse.y = -event.clientY / sizes.height * 2 + 1
})

// click event
window.addEventListener('click', () => {
  if (currentIntersect) {
    switch (currentIntersect.object) {
      case object1:
        console.log('click on object 1')
        break
      case object2:
        console.log('click on object 2')
        break
      case object3:
        console.log('click on object 3')
        break
    }
  }
})


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
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.z = 3
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

const tick = () => {
  const elapsedTime = clock.getElapsedTime()

  // Animate objects
  object1.position.y = Math.sin(elapsedTime * 0.3) * 1.5
  object2.position.y = Math.sin(elapsedTime * 0.8) * 1.5
  object3.position.y = Math.sin(elapsedTime * 1.4) * 1.5

  // Cast a ray
  raycaster.setFromCamera(mouse, camera)

  const objectsToTest = [object1, object2, object3]
  const intersects = raycaster.intersectObjects(objectsToTest)

  for (const object of objectsToTest) {
    if (intersects.some(intersect => intersect.object === object)) {
      object.material.color.set('#0000ff')
    } else {
      object.material.color.set('#ff0000')
    }
  }

  if (intersects.length) {
    if (!currentIntersect) {
      console.log('mouse enter')
    }
  } else {
    if (currentIntersect) {
      console.log('mouse leave')
    }
  }
  currentIntersect = intersects.length ? intersects[0] : null

  if (model) {
    // 关闭递归提升性能
    const modelIntersects = raycaster.intersectObject(model.children[0].children[0], false)
    if (modelIntersects.length) {
      model.scale.set(1.2,1.2,1.2)
    } else {
      model.scale.set(1,1,1)
    }
  }

  // Update controls
  controls.update()

  // Render
  renderer.render(scene, camera)

  // Call tick again on the next frame
  window.requestAnimationFrame(tick)
}

tick()
