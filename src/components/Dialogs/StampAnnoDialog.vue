<template>
  <el-dialog class="StampDialog" :visible.sync="visible" @close="closeDialog" title="添加图章到指定页面" :width="pageOption.dialogWidth">
    <div style="width: 100%; display: flex; align-items: center; justify-content: flex-start">
      <el-input-number v-model="number" :min="1" :max="pageCount" :size="pageOption.numberSize">
      </el-input-number>
      <span style="margin-left: 10px">
        /{{pageCount}}
      </span>
    </div>
    <span slot="footer">
      <el-button type="primary" @click="confirmClick" :size="pageOption.btnSize">确定</el-button>
      <el-button @click="closeDialog" :size="pageOption.btnSize">取消</el-button>
    </span>
  </el-dialog>
</template>

<script>
import {mapGetters} from "vuex";

export default {
  name: "StampAnnoDialog",
  data() {
    return {
      visible: false,
      callback: undefined,
      number: 0
    }
  },
  computed: {
    ...mapGetters(['pageCount', 'currentPage', 'isMobile']),
    pageOption() {
      if (this.isMobile) {
        return {
          dialogWidth: '40%',
          numberSize: 'mini',
          btnSize: 'small'
        }
      } else {
        return {
          dialogWidth: '20%',
          numberSize: 'middle',
          btnSize: 'middle'
        }
      }
    }
  },
  methods: {
    openDialog(param, callback) {
      this.number = this.currentPage;
      this.visible = true;
      this.callback = callback;
    },
    confirmClick() {
      this.callback(this.number - 1);
      this.closeDialog();
    },
    closeDialog() {
      this.visible = false;
    }
  }
}
</script>

<style scoped lang="scss">
.StampDialog {
  /deep/ .el-dialog {
    min-width: 250px;
  }
}
</style>
