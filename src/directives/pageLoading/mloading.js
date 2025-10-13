import './style.scss'
import imageMap from "../../utils/imageMap";

export default {
  bind(el, binding) {
  },

  update(el, binding) {
    // 添加loading效果
    const addLoading = () => {
      // 当前已有loading时不再继续添加
      if (el.loadingElement !== undefined) {
        return;
      }
      // 创建一个loading层div，覆盖页面大小
      el.loadingElement = document.createElement('div');
      // 创建loading图片的外层div，页面居中
      const loadingImgContentEl = document.createElement("div");
      loadingImgContentEl.classList.add("loading-content");
      // 创建loading图片
      const loadingImgEl = document.createElement('img');
      loadingImgEl.src = imageMap.loading;
      loadingImgEl.classList.add('loading-img');
      const loadingMsg = document.createElement("span");
      loadingMsg.textContent = "页面加载中，请稍等";
      loadingMsg.classList.add('loading-msg');
      // 逐级添加元素
      loadingImgContentEl.appendChild(loadingImgEl);
      loadingImgContentEl.appendChild(loadingMsg);
      el.loadingElement.appendChild(loadingImgContentEl);
      el.loadingElement.classList.add('loading');
      el.appendChild(el.loadingElement);
    }

    if (binding.oldValue !== binding.value) {
      if (binding.value === 1) {
        // 添加loading
        addLoading();
      } else if (binding.value === 2) {
        // 移除loading
        el.loadingElement && el.removeChild(el.loadingElement);
        el.loadingElement = undefined
      }
    } else {
      if (binding.value === 1) {
        // 添加loading
        addLoading();
      }
    }
  },
  unbind(el) {
    // 指令与元素解绑时调用，进行清理工作
    el.loadingElement && el.removeChild(el.loadingElement);
  }

};
