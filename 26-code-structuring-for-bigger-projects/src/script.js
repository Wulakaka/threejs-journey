import Experience from './Experience/Experience.js'

const experience = new Experience(document.querySelector('canvas.webgl'))
// import * as THREE from 'three'

// import GUI from 'lil-gui'

// /**
//  * Base
//  */
// // Debug
// const gui = new GUI()
// const debugObject = {}
//
// // Canvas
// const canvas = document.querySelector('canvas.webgl')
//
// /**
//  * Update all materials
//  */
// const updateAllMaterials = () =>
// {
//     scene.traverse((child) =>
//     {
//         if(child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial)
//         {
//             // child.material.envMap = environmentMap
//             child.material.envMapIntensity = debugObject.envMapIntensity
//             child.material.needsUpdate = true
//             child.castShadow = true
//             child.receiveShadow = true
//         }
//     })
// }
//

// // scene.background = environmentMap

//
// gui.add(directionalLight, 'intensity').min(0).max(10).step(0.001).name('lightIntensity')
// gui.add(directionalLight.position, 'x').min(- 5).max(5).step(0.001).name('lightX')
// gui.add(directionalLight.position, 'y').min(- 5).max(5).step(0.001).name('lightY')
// gui.add(directionalLight.position, 'z').min(- 5).max(5).step(0.001).name('lightZ')

//
// /**
//  * Animate
//  */
// const clock = new THREE.Clock()
// let previousTime = 0
//
// const tick = () =>
// {
//     const elapsedTime = clock.getElapsedTime()
//     const deltaTime = elapsedTime - previousTime
//     previousTime = elapsedTime
//
//
//     // Fox animation
//     if(foxMixer)
//     {
//         foxMixer.update(deltaTime)
//     }
//
//
//     // Call tick again on the next frame
//     window.requestAnimationFrame(tick)
// }
//
// tick()
