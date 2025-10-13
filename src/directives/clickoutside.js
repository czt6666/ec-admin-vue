const nodeList = [];
const infoKey = "clickOutSideInfo";
let keyId = 0;
let downEvent;

// document.addEventListener("mousedown", (e) => downEvent = e);
// document.addEventListener("touchstart", (e) => downEvent = e);

document.addEventListener("mousedown", (e) => {
  nodeList.forEach(node => node[infoKey].eventHandler(e));
});
document.addEventListener("touchstart", (e) => {
  nodeList.forEach(node => node[infoKey].eventHandler(e));
});

/*document.addEventListener("mouseup", (e) => {
	nodeList.forEach(node => node[infoKey].eventHandler(e, downEvent));
});
document.addEventListener("touchend", (e) => {
  nodeList.forEach(node => node[infoKey].eventHandler(e, downEvent));
});*/

const createEventHandler = (el, binding, vnode) => {
	return function (mousedown = {}) {
		const context = vnode.context;
		const downTarget = mousedown.target;
		if (!vnode || !context || !downTarget || el.contains(downTarget) ||
				el === downTarget || (context.downEl && (context.downEl.contains(downTarget)))) {
			return;
		}

		const methodName = el[infoKey].methodName;
		if (binding.expression && methodName &&
				context[methodName]) {
			context[methodName]();
		} else {
			el[infoKey].fun && el[infoKey].fun();
		}
	}
}

/*const createEventHandler1 = (el, binding, vnode) => {
  return function (mouseup = {}, mousedown = {}) {
    const context = vnode.context;
    const downTarget = mousedown.target;
    const upTarget = mouseup.target;
    if (!vnode || !context || !downTarget || !upTarget || el.contains(downTarget) || el.contains(upTarget) ||
      el === upTarget || (context.downEl && (context.downEl.contains(downTarget) || context.downEl.contains(upTarget)))) {
      return;
    }

    const methodName = el[infoKey].methodName;
    if (binding.expression && methodName &&
      context[methodName]) {
      context[methodName]();
    } else {
      el[infoKey].fun && el[infoKey].fun();
    }
  }
}*/

export default {
	bind(el, binding, vnode) {
		nodeList.push(el);
		el[infoKey] = {
			id: keyId++,
			eventHandler: createEventHandler(el, binding, vnode),
			methodName: binding.expression,
			fun: binding.value
		}
	},

	update(el, binding, vnode) {
		el[infoKey].eventHandler = createEventHandler(el, binding, vnode);
		el[infoKey].methodName = binding.expression;
		el[infoKey].fun = binding.value;
	},

	unbind(el) {
		for (let i = 0 ; i < nodeList.length; i++) {
			if (nodeList[i][infoKey].id === el[infoKey].id) {
				nodeList.splice(i, 1);
				delete el[infoKey];
				break;
			}
		}
	}
}
