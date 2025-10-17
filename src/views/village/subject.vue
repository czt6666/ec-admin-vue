<template>
  <div class="app-container">
    <div class="filter-container">
      <el-form>
        <el-form-item>
          <el-button type="primary" icon="plus" @click="showCreate">添加
          </el-button>
        </el-form-item>
        <el-form-item>
          <p1>主体信息管理
          </p1>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>
<script>
import {mapGetters} from 'vuex'
import MD5 from "js-md5"

export default {
  name: 'HomePage',
  data() {
    return {
      message: 'Hello Vue!'
    }
  }
}
</script>
<style scoped>
.test{
  height: 80vh;
  overflow-x: scroll;
}
.pwValidatorfail{
  color: #F56C6C;
  font-size: 12px;
  line-height: 1;
  padding-top: 4px;
  position: absolute;
  top: 10px;
  left: 230px;
  width: 330px;
}
.el-form-item >>> .el-form-item__error{
  font-size: 12px;
  line-height: 1;
  padding-top: 4px;
  position: absolute;
  top: 10px;
  left: 230px;
  width: 330px;
}
</style>
