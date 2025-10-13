class ModalManager {
    // 构造
    constructor() {
        this.currentModal = null;
    }

    // 打开弹窗
    openModal(modal, param, callback) {
        if (this.currentModal) {
            // 关闭当前弹窗
            if (typeof this.currentModal.closeDialog === 'function') {
                this.currentModal.closeDialog();
            } else {
                this.currentModal.beforeClose();
            }
        }
        this.currentModal = modal;
        modal.openDialog(param, callback);
        // console.log(modal)
        // let modalId = modal.$el.id
        // var dialogElement = document.getElementById(modalId)
        /*modal.$el.focus()*/
        // 禁止事件冒泡
        /*modal.$el.addEventListener('mouseup', function (event) {
            event.stopPropagation();
        });*/
    }

    // 关闭弹窗
    closeModal() {
        if (this.currentModal) {
            if (typeof this.currentModal.closeDialog === 'function') {
                this.currentModal.closeDialog();
            } else {
                this.currentModal.beforeClose();
            }
            this.currentModal = null;
        }
    }
}
// 创建单例实例
const modalManager = new ModalManager();
export { modalManager };
