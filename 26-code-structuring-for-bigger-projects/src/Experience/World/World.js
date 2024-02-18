import Experience from "../Experience.js";
import * as THREE from 'three'
import Environment from "./Environment.js";
import Floor from "./Floor.js";

export default class World {
  constructor() {
    this.experience = new Experience()
    this.scene = this.experience.scene

    // Test mesh
    const testMesh = new THREE.Mesh(
      new THREE.BoxGeometry(1,1,1),
      new THREE.MeshStandardMaterial()
    )
    this.scene.add(testMesh)

    this.resources = this.experience.resources

    this.resources.on('ready', () => {
      // Setup
      console.log('resources ready')
      // 由于 environment 初始化时会更新场景中的所有材质，所以需要在 environment 初始化前加载 floor
      this.floor = new Floor()
      this.environment = new Environment()
    })
  }
}
