import { add, color, float, Fn, texture, time, uv, vec2, vec3 } from 'three/tsl'
import * as THREE from 'three/webgpu'

export default class Explosions {
  constructor(
    simplexTexture,
    max = 100,
    emissiveColorA = color(0x1111ff),
    emissiveColorB = color(0xff1111),
    emissiveStrength = float(20)
  ) {
    this.simplexTexture = simplexTexture
    this.max = max
    this.emissiveColorA = emissiveColorA
    this.emissiveColorB = emissiveColorB
    this.emissiveStrength = emissiveStrength

    this.setGeometry()
    this.setMaterial()
    this.setMesh()
  }

  setGeometry() {
    this.geometry = new THREE.SphereGeometry(1, 32, 32)
  }

  setMaterial() {
    this.material = new THREE.MeshBasicNodeMaterial({
      color: 0x111111
    })

    const progress = time.mul(0.25).fract()

    // Mask
    this.material.maskNode = Fn(() => {
      const noise1Uv = uv().mul(vec2(1, 3))
      const noise1 = texture(this.simplexTexture, noise1Uv).r
      const noise2Uv = uv().mul(vec2(1, 5))
      const noise2 = texture(this.simplexTexture, noise2Uv).r

      const finalNoise = add(noise1, noise2).div(2).pow(2)

      return finalNoise.sub(progress).greaterThan(0)
    })()
  }

  setMesh() {
    this.mesh = new THREE.Mesh(this.geometry, this.material)
    this.mesh.castShadow = true
  }
}
