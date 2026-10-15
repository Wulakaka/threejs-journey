import {
  max,
  mix,
  mx_noise_float,
  nodeObject,
  uv,
  vec3,
  vec4,
  viewportCoordinate,
  viewportSize
} from 'three/tsl'
import * as THREE from 'three/webgpu'
import { voronoi } from './voronoi'

export class ShatterNode extends THREE.TempNode {
  static get type() {
    return 'ShatterNode'
  }

  constructor(
    textureNode,
    subdivision,
    seed,
    progress,
    thickness,
    _color,
    colorStrength
  ) {
    super('vec4')

    this.textureNode = textureNode
    this.subdivision = subdivision
    this.seed = seed
    this.progress = progress
    this.thickness = thickness
    this._color = _color
    this.colorStrength = colorStrength
  }

  setup() {
    // Voronoi
    const viewportMaxSize = max(viewportSize.x, viewportSize.y)
    const voronoiUv = viewportCoordinate.div(viewportMaxSize)
    const voronoiColor = voronoi(voronoiUv, this.subdivision, this.seed)

    // Cracks
    const cracksNoise = mx_noise_float(voronoiUv.mul(5)).remap(-1, 1, 0, 0.5)
    // r 到中心的距离；g 到边缘的近似距离；b 到边缘的精确距离
    const cracks = voronoiColor.g.step(
      this.progress.sub(cracksNoise).mul(this.thickness)
    )

    const cracksColor = this._color.mul(this.colorStrength)

    return mix(cracksColor, this.textureNode, cracks)
  }
}

export const shatter = (
  textureNode,
  subdivision,
  seed,
  progress,
  thickness,
  _color,
  colorStrength
) =>
  new ShatterNode(
    textureNode,
    nodeObject(subdivision),
    nodeObject(seed),
    nodeObject(progress),
    nodeObject(thickness),
    nodeObject(_color),
    nodeObject(colorStrength)
  )
