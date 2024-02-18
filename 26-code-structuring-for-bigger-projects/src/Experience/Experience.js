import Sizes from "./Utils/Sizes.js";

export default class Experience {
  constructor(canvas) {
    console.log('Here starts a great experience')
    // Global access
    window.experience = this
    // Options
    this.canvas = canvas

    // Setup
    this.sizes = new Sizes()

    this.sizes.on('resize', () => {
      console.log('A resize occurred')
    })
  }

  resize() {}
}
