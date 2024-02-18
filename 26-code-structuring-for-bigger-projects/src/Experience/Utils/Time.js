import EventEmitter from "./EventEmitter.js";

export default class Time extends EventEmitter{
  constructor() {
    super();

    // Setup
    // 保存 experience 开始的时间
    this.start = Date.now()
    // 保存当前时间戳，并在每一帧更新
    this.current = this.start
    // 保存距离开始到现在的时长
    this.elapsed = 0
    // 保存距离上一帧的时间间隔
    this.delta = 16

    window.requestAnimationFrame(() => {
      this.tick()
    })
  }

  tick() {
    const currentTime = Date.now()
    this.delta = currentTime - this.current
    this.current = currentTime
    this.elapsed = this.current - this.start

    this.trigger('tick')

    window.requestAnimationFrame(() => {
      this.tick()
    })
  }
}
