import Experience from './Experience.js'
import * as THREE from 'three'
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js'
import { GlitchPass } from 'three/addons/postprocessing/GlitchPass.js'
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js'
import { SMAAPass } from 'three/examples/jsm/postprocessing/SMAAPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'

export default class Renderer {
  constructor() {
    this.experience = new Experience()
    this.canvas = this.experience.canvas
    this.sizes = this.experience.sizes
    this.scene = this.experience.scene
    this.camera = this.experience.camera
    this.debug = this.experience.debug

    if (this.debug.active) {
      this.debugFolder = this.debug.ui.addFolder('renderer')
    }

    this.setInstance()
    // Post-processing
    // this.setComposer()
  }

  setInstance() {
    this.instance = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
    })
    this.instance.toneMapping = THREE.CineonToneMapping
    this.instance.toneMappingExposure = 1.75
    this.instance.shadowMap.enabled = true
    this.instance.shadowMap.type = THREE.PCFSoftShadowMap
    this.instance.setClearColor('#211d20')
    this.instance.setSize(this.sizes.width, this.sizes.height)
    this.instance.setPixelRatio(this.sizes.pixelRatio)
  }

  setComposer() {
    this.composer = new EffectComposer(this.instance)
    const renderPass = new RenderPass(this.scene, this.camera.instance)
    this.composer.addPass(renderPass)

    const glitchPass = new GlitchPass()
    glitchPass.enabled = false
    if (this.debug.active) {
      this.debugFolder.add(glitchPass, 'goWild').name('glitchWildness')
      this.debugFolder.add(glitchPass, 'enabled').name('glitchEnabled')
    }
    this.composer.addPass(glitchPass)

    const smaaPass = new SMAAPass()
    if (this.debug.active) {
      this.debugFolder.add(smaaPass, 'enabled').name('SMAAEnabled')
    }
    this.composer.addPass(smaaPass)

    const unrealBloomPass = new UnrealBloomPass()
    unrealBloomPass.enabled = false
    if (this.debug.active) {
      this.debugFolder
        .add(unrealBloomPass, 'enabled')
        .name('unrealBloomEnabled')
    }
    this.composer.addPass(unrealBloomPass)

    const outputPass = new OutputPass()
    this.composer.addPass(outputPass)
  }

  resize() {
    this.instance.setSize(this.sizes.width, this.sizes.height)
    // this.composer.setSize(this.sizes.width, this.sizes.height)
    this.instance.setPixelRatio(this.sizes.pixelRatio)
  }

  update() {
    this.instance.render(this.scene, this.camera.instance)
    // this.composer.render()
  }
}
