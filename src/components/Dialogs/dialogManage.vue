<template>
    <div class="dialogManage">

        <DocumentProperty ref="documentProerty" :key="`document${fileId}`" />

        <Html2OfdDialog ref="htmlToOfd" />

        <ProcessorDialog ref="ofdProcessor" />

        <ShareFileDialog ref="shareFile" :key="`share${fileId}`"/>

        <!--<OcrDialog ref="ocr" />-->

        <ScreenShotDialog ref="screenShot" />

        <signDialog ref="signDialog" />

        <tagsTreeDialog ref="tagsTreeDialog" />

        <confirmDialog ref="confirmDialog" />

      <StampAnnoDialog ref="StampAnnoDialog"/>
    </div>
</template>
<script>
import { mapGetters } from "vuex";
import DocumentProperty from "./DocumentProperty.vue";
import Html2OfdDialog from "./Html2OfdDialog.vue";
import ProcessorDialog from "../Processor/ProcessorDialog.vue";
import ShareFileDialog from "./ShareFileDialog.vue";
import ScreenShotDialog from "../Ocr/ScreenShotDialog.vue";
import { modalManager } from "../../utils/modelManage";
import signDialog from "./SignDialog.vue";
import tagsTreeDialog from "./tagsTreeDialog.vue"
import confirmDialog from "./confirmDialog.vue"
import StampAnnoDialog from "./StampAnnoDialog.vue"
// import { PopupManager } from 'element-ui'
export default {
    name: "dialogManage",
    components: {
        ScreenShotDialog, Html2OfdDialog, ProcessorDialog, ShareFileDialog, DocumentProperty, signDialog, tagsTreeDialog, confirmDialog, StampAnnoDialog
    },
    data() {
        return {

        }
    },
    mounted() {
        this.$bus.$on("openDialog", (modelName, param, callback) => {
            this.openDialog(modelName, param, callback)
        })
    },
    beforeDestroy() {
        this.$bus.$off("openDialog");
    },
    computed: {
        ...mapGetters(['fileId']),
    },

    methods: {

        openDialog(modelName, param, callback) {
            const model = this.$refs[modelName]
            if (model) {
                modalManager.openModal(model, param, callback)
            } else {
                modalManager.openModal(modelName, param, callback)
            }
        },

        closeDialog() {
            modalManager.closeModal()
        }


    }
}
</script>
<style lang="scss" scoped>
.dialogManage {


  /deep/ .el-card {
    height: 200px;
  }

  /deep/ .el-form--inline .el-form-item {
    margin-left: 10px;
  }


  /**对话框圆角 */
  /deep/ .el-dialog {
    border-radius: 20px;
  }

  /deep/ .el-descriptions__header {
    margin-bottom: 10px;
    margin-top: 10px;
  }

  /deep/ .el-descriptions__body .el-descriptions__table .el-descriptions-item__cell {
    line-height: 1;
  }

  /deep/ .el-descriptions__title {
    font-size: 14px;
  }

  /deep/ .el-tag .el-tag__close {
    color: black;
  }

  /deep/ .el-tag .el-icon-close {
    position: relative;
  }

  /deep/ .el-upload-dragger {
    width: 100%;
    height: 897px;
    background-color: #ebebeb;
    border: none;
  }
}
</style>
