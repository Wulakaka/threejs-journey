import Sizes from './Utils/Sizes.js'
import Time from './Utils/Time.js'
import * as THREE from 'three'
import Camera from './Camera.js'
import Renderer from './Renderer.js'
import World from './World/World.js'
import Resources from './Utils/Resources.js'
import sources from './sources.js'
import Debug from './Utils/Debug.js'

// 使用单例模式
let instance = null

export default class Experience {
  constructor(canvas) {
    // Singleton
    if (instance) return instance

    instance = this

    // Global access
    window.experience = this
    // Options
    this.canvas = canvas

    // Setup
    this.debug = new Debug()
    this.sizes = new Sizes()
    this.time = new Time()
    this.scene = new THREE.Scene()
    this.resources = new Resources(sources)
    this.camera = new Camera()
    this.renderer = new Renderer()

    this.world = new World()

    this.sizes.on('resize', () => {
      this.resize()
    })
    // Time tick event
    this.time.on('tick', () => {
      this.update()
    })
  }

  resize() {
    this.camera.resize()
    this.renderer.resize()
  }
  update() {
    this.camera.update()
    // 要在 renderer 之前更新 world
    this.world.update()
    this.renderer.update()
  }
  destroy() {
    this.time.off('tick')
    this.sizes.off('resize')
    this.time.destroy()
    this.sizes.destroy()

    // dispose geometries, materials, textures, etc.
    this.scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose()
        for (const key in child.material) {
          const value = child.material[key]
          if (value && typeof value.dispose === 'function') {
            value.dispose()
          }
        }
      }
    })
    // dispose renderer
    this.renderer.instance.dispose()

    // destroy debug
    if (this.debug.active) {
      this.debug.ui.destroy()
    }
  }
}
