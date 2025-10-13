import {singleton} from "./UseableTool";

export class SuperTask {
  constructor(parallelCount = 2) {
    this.parallelCount = parallelCount;
    this.runningCount = 0;
    this.tasks = [];
    this.pause = false
  }

  // 添加任务
  add(task) {
    return new Promise((resolve, reject) => {
      this.tasks.push({task, resolve, reject});
      this._run();
    })
  }

  // 依次执行任务
  _run() {
    while(this.runningCount < this.parallelCount && this.tasks.length && !this.pause) {
      const {task, resolve, reject} = this.tasks.shift();
      this.runningCount++;
      task().then(resolve, reject).finally(() => {
        this.runningCount--;
        this._run();
      })
    }
  }
}

export default singleton(SuperTask);
