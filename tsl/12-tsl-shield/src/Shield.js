import { positionLocal, uniform } from 'three/tsl'
import * as THREE from 'three/webgpu'

export default class Shield {
  constructor(_texture, radius = 2) {
    this.texture = _texture
    this.radius = uniform(radius)

    this.setGeometry()
    this.setMaterial()
    this.setMesh()
  }

  setGeometry() {
    this.geometry = new THREE.SphereGeometry(1, 32, 32)
  }
  setMaterial() {
    this.material = new THREE.MeshBasicNodeMaterial()
    this.material.positionNode = positionLocal.mul(this.radius)
  }
  setMesh() {
    this.mesh = new THREE.Mesh(this.geometry, this.material)
  }
}
