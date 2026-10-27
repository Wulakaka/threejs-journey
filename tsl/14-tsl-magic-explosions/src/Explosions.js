import {
  add,
  color,
  float,
  Fn,
  frontFacing,
  instanceIndex,
  max,
  min,
  mix,
  positionLocal,
  texture,
  time,
  uniformArray,
  uv,
  vec2,
  vec3
} from 'three/tsl'
import * as THREE from 'three/webgpu'
import gsap from 'gsap'

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

    this.index = 0

    this.setBuffers()
    this.setGeometry()
    this.setMaterial()
    this.setMesh()
  }

  setBuffers() {
    this.positions = uniformArray([], 'vec3')
    this.radiuses = uniformArray([], 'float')
    this.progresses = uniformArray([], 'float')

    for (let i = 0; i < this.max; i++) {
      this.positions.array[i] = new THREE.Vector3()
      this.radiuses.array[i] = 1
      this.progresses.array[i] = 0
    }
  }

  setGeometry() {
    this.geometry = new THREE.SphereGeometry(1, 32, 32)
  }

  setMaterial() {
    this.material = new THREE.MeshBasicNodeMaterial({
      color: 0x111111,
      side: THREE.DoubleSide
    })

    // Buffers
    const radius = this.radiuses.element(instanceIndex)
    const position = this.positions.element(instanceIndex)
    const progress = this.progresses.element(instanceIndex)

    // Mask
    this.material.maskNode = Fn(() => {
      const noise1Uv = uv().mul(vec2(1, 3))
      const noise1 = texture(this.simplexTexture, noise1Uv).r
      const noise2Uv = uv().mul(vec2(1, 5))
      const noise2 = texture(this.simplexTexture, noise2Uv).r

      const finalNoise = add(noise1, noise2).div(2).pow(2)

      return finalNoise.sub(progress).greaterThan(0)
    })()

    // Emissive
    this.material.emissiveNode = Fn(() => {
      const emissiveMix = progress.smoothstep(0, 0.7)
      const emissiveColor = mix(
        this.emissiveColorA,
        this.emissiveColorB,
        emissiveMix
      ).toVertexStage()
      // 不能在这之后转换到 VertexStage，因为 frontFacing 是在 fragment shader 中
      const backFacingMask = frontFacing.toFloat().oneMinus()
      const emissiveStrength = this.emissiveStrength.mul(backFacingMask)

      return emissiveColor.mul(emissiveStrength)
    })()

    // Position
    this.material.positionNode = Fn(() => {
      // Radius
      const radiusIn = progress.remap(0, 0.075)
      const radiusOut = progress.remap(0.075, 1, 1, 0.3)
      const radiusFinal = min(radiusIn, radiusOut)
        .oneMinus()
        .pow(2)
        .oneMinus()
        .mul(radius)
      positionLocal.mulAssign(radiusFinal)

      // Translate
      positionLocal.addAssign(position)

      // Floor clamp
      // 让低于地面的顶点到上面来
      positionLocal.y.assign(max(positionLocal.y, 0.01))

      return positionLocal
    })()
  }

  setMesh() {
    this.mesh = new THREE.Mesh(this.geometry, this.material)
    this.mesh.castShadow = true
    this.mesh.count = this.max
  }

  create(position = new THREE.Vector3(), radius = 1) {
    const index = this.index
    this.positions.array[index].copy(position)
    this.radiuses.array[index] = radius
    this.progresses.array[index] = 0

    const dummy = { progress: 0 }
    gsap.to(dummy, {
      progress: 1,
      duration: 2,
      ease: 'linear',
      onUpdate: () => {
        this.progresses.array[index] = dummy.progress
      }
    })

    this.index++
    this.index = this.index % this.max
  }
}
