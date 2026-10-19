import {
  float,
  Fn,
  mul,
  PI2,
  positionLocal,
  texture,
  time,
  uniform,
  uv,
  vec2,
  vec3,
  vec4
} from 'three/tsl'
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

    this.material.colorNode = Fn(() => {
      // Hexagons
      const hexagonsColor = texture(this.texture, uv().mul(vec2(6, 4)))

      const hexagonsStep = time.add(hexagonsColor.g.mul(PI2)).sin().remap(-1, 1)
      const hexagonsMask = hexagonsStep.step(hexagonsColor.r)
      const hexagonsPolarMask = uv().y.sub(0.5).abs().remapClamp(0.35, 0.2)
      const hexagons = mul(hexagonsMask, hexagonsColor.b, hexagonsPolarMask)

      return vec4(vec3(hexagons), 1)
    })()

    this.material.positionNode = positionLocal.mul(this.radius)
  }
  setMesh() {
    this.mesh = new THREE.Mesh(this.geometry, this.material)
  }
}
