<template>
  <div class="app-container">
    <div class="filter-container">
      <el-form inline>
        <el-form-item>
          <span class="page-title">主体信息管理</span>
        </el-form-item>
      </el-form>
    </div>

    <!-- 子路由渲染出口：村庄列表页面会在这里显示 -->
    <router-view/>
  </div>
</template>

<script>
export default {
  name: 'VillageSubject'
}
</script>

<style scoped>
.filter-container {
  margin-bottom: 20px;
}

.page-title {
  font-size: 18px;
  font-weight: bold;
  color: #303133;
}
</style>
