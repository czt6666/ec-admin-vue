<template>
    <el-dialog class="confirm" :visible.sync="dialogVisible" id="confirmDialog" :title=title @close="closeDialog" top="30vh" width="20%">
        <p>{{ alertMessage }}</p>
        <span slot="footer" class="dialog-footer">
            <el-button @click=closeDialog type="primary">确定</el-button>
        </span>
    </el-dialog>
</template>
<script>

export default {
    name: "confirmDialog",
    data() {
        return {
            dialogVisible: false,
            alertMessage: "",
            title: "",
        }
    },
    methods: {
        openDialog(param) {
            this.dialogVisible = true
            this.alertMessage = param.message;
            this.title = param.title
        },

        closeDialog() {
            this.dialogVisible = false
        }
    }

}
</script>
<style lang="scss" scoped>
.confirm {
  /deep/ .el-dialog {
    border-radius: 4px;

    .el-dialog__body {
      padding: 0px 20px;
    }
  }
}
</style>
