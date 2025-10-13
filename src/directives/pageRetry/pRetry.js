import imageMap from "../../utils/imageMap";
import "../pageLoading/style.scss"

export default {
    update(el, binding) {
        // 添加loadError效果
        const addLoadError = () => {
            // 当前已有loadError时不再继续添加
            if (el.loadErrorElement !== undefined) {
                return;
            }
            // 创建一个loadError层div，覆盖页面大小
            el.loadErrorElement = document.createElement('div');
            // 创建loadError图片的外层div，页面居中
            const loadingImgContentEl = document.createElement("div");
            loadingImgContentEl.classList.add("loading-content");
            // 创建loadError图片
            const loadingImgEl = document.createElement('img');
            loadingImgEl.src = imageMap.loadError;
            // loadingImgEl.classList.add('loading-img');
            const loadingMsg = document.createElement("span");
            loadingMsg.textContent = "页面加载失败，请点击页面任意区域重试";
            loadingMsg.classList.add('loading-msg');
            // 逐级添加元素
            loadingImgContentEl.appendChild(loadingImgEl);
            loadingImgContentEl.appendChild(loadingMsg);
            el.loadErrorElement.appendChild(loadingImgContentEl);
            el.loadErrorElement.classList.add('loading');
            el.appendChild(el.loadErrorElement);
        }
        if (binding.value === -2) {
            addLoadError()
        } else if (binding.value === 0) {
            // 移除loadError
            el.loadErrorElement && el.removeChild(el.loadErrorElement);
            el.loadErrorElement = undefined
        }

    },
    unbind(el) {
        // 指令与元素解绑时调用，进行清理工作
        el.loadErrorElement && el.removeChild(el.loadErrorElement);
    }
}
