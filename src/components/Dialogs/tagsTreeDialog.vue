<template>
  <el-dialog id="tagsTreeDialog" :visible.sync="visible" v-if="visible" :key="key" title="提示" class="tagtree"
    @close="closeDialog" top="30vh" width="20%">
    <el-form :model="formData" :rules="rules" ref="form">
      <el-form-item label="请输入语义内容" prop="inputValue">
        <el-input v-model="formData.inputValue" placeholder="请输入语义内容"></el-input>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="closeDialog">取消</el-button>
      <el-button type="primary" @click="addRootTag">确定</el-button>
    </div>
  </el-dialog>
</template>
<style lang="scss" scoped>
.tagtree {

  /deep/ .el-dialog {
    width: 420px;
    font-size: 18px;
    border: 1px solid #EBEEF5;
    border-radius: 4px;
  }


  /deep/ .el-dialog__body {
    padding: 10px 20px;
  }
}
</style>
<script>

export default {
  name: "tagsTreeDialog",
  data() {
    return {
      callback: null,
      request: null,
      key: null,
      visible: false,
      formData: {
        inputValue: ''
      },
      rules: {
        inputValue: [
          { required: true, message: '请输入语义内容', trigger: 'change' },
          { pattern: /^([\u4e00-\u9fa5a-zA-Z])/, message: "语义树名称不能是以特殊字符开头", trigger: 'change' }
        ]
      }
    }
  },
  methods: {
    /**
     * @责任人：hyj
     * @方法名：addRootTag
     * @方法描述：新增语义节点（靠request是否为空区分根节点和其他节点）
     * @入参：无
     * @返回值：无
     * @修改时间：2024.12.18
     * @修改类型（新增、删除、修改等）：新增
     * @修改描述：封装函数
     * */
    addRootTag() {
      this.visible = false
      if (this.callback && typeof this.callback === 'function') {
        if (this.request === null) {
          this.callback(this.formData.inputValue);
        } else {
          this.request.addNodeName = this.formData.inputValue
          this.callback(this.formData.inputValue, this.request);
        }
      }
    },

    /**
     * @责任人：hyj
     * @方法名：openDialog
     * @方法描述：打开弹窗
     * @入参：无
     * @返回值：无
     * @修改时间：2024.12.18
     * @修改类型（新增、删除、修改等）：新增
     * @修改描述：封装函数
     * */
    openDialog(param, callback) {
      let date = new Date
      this.request = param
      this.visible = true
      this.key = date.getTime();
      this.callback = callback
    },

    /**
     * @责任人：hyj
     * @方法名：closeDialog
     * @方法描述：打开弹窗
     * @入参：无
     * @返回值：无
     * @修改时间：2024.12.18
     * @修改类型（新增、删除、修改等）：新增
     * @修改描述：封装函数
     * */
    closeDialog() {
      this.visible = false
      this.formData.inputValue = ''
    }

  }

}
</script>
