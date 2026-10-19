import {
  dot,
  float,
  Fn,
  If,
  Loop,
  max,
  mul,
  normalView,
  PI2,
  positionLocal,
  positionViewDirection,
  texture,
  time,
  uniform,
  uniformArray,
  uv,
  vec2,
  vec3,
  vec4
} from 'three/tsl'
import gsap from 'gsap'
import * as THREE from 'three/webgpu'

export default class Shield {
  constructor(_texture, radius = 2) {
    this.texture = _texture
    this.radius = uniform(radius)

    this.setImpacts()
    this.setGeometry()
    this.setMaterial()
    this.setMesh()
  }

  setImpacts() {
    this.impacts = {}
    this.impacts.count = 5
    this.impacts.index = 0

    // Uniform array
    const data = []

    for (let i = 0; i < this.impacts.count; i++) {
      data.push(new THREE.Vector4(0, 0, 0, 0))
    }

    this.impacts.uniforms = uniformArray(data, 'vec4')

    // Add impact
    this.impacts.add = (position, radius = 1) => {
      const impact = data[this.impacts.index]

      // Position
      const localPosition = this.mesh.worldToLocal(position)
      impact.x = localPosition.x
      impact.y = localPosition.y
      impact.z = localPosition.z

      // Radius
      gsap.to(impact, {
        w: radius,
        duration: 0.1,
        ease: 'power2.out',
        onComplete: () => {
          gsap.to(impact, {
            w: 0,
            duration: 1,
            ease: 'power2.in'
          })
        }
      })

      // Update
      this.impacts.index = (this.impacts.index + 1) % this.impacts.count
    }
  }

  setGeometry() {
    this.geometry = new THREE.SphereGeometry(1, 32, 32)
  }

  setMaterial() {
    this.material = new THREE.MeshBasicNodeMaterial()

    this.material.colorNode = Fn(() => {
      // Impacts
      const finalImpact = float(0)

      Loop(this.impacts.count, ({ i }) => {
        const impactData = this.impacts.uniforms.element(i)
        const impactDistance = impactData.xyz.distance(positionLocal)
        const impact = impactDistance.div(impactData.w).oneMinus().max(0)
        finalImpact.assign(max(finalImpact, impact))
      })

      finalImpact.assign(finalImpact.remap(0.4, 0, 1, 0))

      // Fresnel
      // positionViewDirection normalView 都已经包含了 view 投影
      const fresnel = dot(positionViewDirection, normalView).oneMinus().abs()

      // Hexagons
      const hexagonsColor = texture(this.texture, uv().mul(vec2(6, 4)))

      const hexagonsStep = max(
        time.add(hexagonsColor.g.mul(PI2)).sin().remap(-1, 1),
        finalImpact
      )
      const hexagonsMask = hexagonsStep.step(hexagonsColor.r)
      const hexagonsPolarMask = uv().y.sub(0.5).abs().remapClamp(0.35, 0.2)
      const hexagonsFresnelMask = max(fresnel.pow(2), finalImpact)
      const hexagonsFill = max(hexagonsColor.r, finalImpact)
      const hexagons = mul(
        hexagonsMask,
        hexagonsColor.b,
        hexagonsPolarMask,
        hexagonsFresnelMask,
        hexagonsFill
      )

      return vec4(vec3(hexagons), 1)
    })()

    this.material.positionNode = positionLocal.mul(this.radius)
  }
  setMesh() {
    this.mesh = new THREE.Mesh(this.geometry, this.material)
  }
}
