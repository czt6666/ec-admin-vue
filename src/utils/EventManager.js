const eventManager = {
  events: {},
  addEvent(element, event, handler, options) {
    if (!this.events[element]) {
      this.events[element] = {};
    }
    if (!this.events[element][event]) {
      this.events[element][event] = [];
    }
    this.events[element][event].push({
      handler, options
    });
    element.addEventListener(event, handler, options);
    // console.log(`元素${element}，绑定${event}事件，回调为:${handler}，options为:${options}`);
  },
  removeEvent(element, event, handler) {
    if (this.events[element] && this.events[element][event]) {
      const index = this.events[element][event].findIndex(param => param.handler === handler);
      if (index > -1) {
        element.removeEventListener(event, handler, this.events[element][event][index].options);
        // console.log(`元素${element}，解除${event}事件，回调为:${handler}，options为:${this.events[element][event][index].options}`);
        this.events[element][event].splice(index, 1);
        if (this.events[element][event].length === 0) {
          delete this.events[element][event];
        }
        if (Object.keys(this.events[element]).length === 0) {
          delete this.events[element];
        }
      }
    }
  },
/*  removeEvents(element, event) {
    if (this.events[element] && this.events[element][event]) {
      for (const param of this.events[element][event]) {
        element.removeEventListener(event, param.handler, param.options);
      }
      delete this.events[element][event];
    }
  },
  clearEvents(element) {
    if (this.events[element]) {
      for (const event in this.events[element]) {
        this.events[element][event].forEach(param => {
          element.removeEventListener(event, param.handler, param.options);
        });
      }
      delete this.events[element];
    }
  },
  clear() {
    if (this.events) {
      for (const element in this.events) {
        this.clearEvents(element);
      }
    }
  }*/
}

export default eventManager;
