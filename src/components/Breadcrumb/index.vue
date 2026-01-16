<template>
  <el-breadcrumb class="app-breadcrumb" separator="/">
    <transition-group name="breadcrumb">
      <el-breadcrumb-item v-for="(item,index)  in levelList" :key="item.path" v-if="item.meta.title">
        <span v-if="item.redirect==='noredirect'||index==levelList.length-1" class="no-redirect">
          <img v-if="item.meta.isIcon" class="breadcrumb-icon" src="/static/icons/png/Redicon.png" alt="home" />
          <span v-else>{{item.meta.title}}</span>
        </span>
        <router-link v-else :to="item.redirect||item.path">
          <img v-if="item.meta.isIcon" class="breadcrumb-icon" src="/static/icons/png/Redicon.png" alt="home" />
          <span v-else>{{item.meta.title}}</span>
        </router-link>
      </el-breadcrumb-item>
    </transition-group>
  </el-breadcrumb>
</template>

<script>
export default {
  created() {
    this.getBreadcrumb()
  },
  data() {
    return {
      levelList: null
    }
  },
  watch: {
    $route() {
      this.getBreadcrumb()
    }
  },
  methods: {
    getBreadcrumb() {
      let matched = this.$route.matched.filter(item => item.name)
      const first = matched[0]
      if (first && first.name !== 'dashboard') {
        //ycgd
        matched = [{ path: '/dashboard', meta: { title: 'Dashboard', isIcon: true }}].concat(matched)
      }
      this.levelList = matched
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
  .app-breadcrumb.el-breadcrumb {
    display: inline-block;
    font-size: 14px;
    line-height: 50px;
    margin-left: 10px;
    .no-redirect {
      color: #97a8be;
      cursor: text;
    }
    .breadcrumb-icon {
      width: 95px;
      height: 52px;
      vertical-align: middle;
      margin-right: 8px;
      display: inline-block;
    }
  }
</style>
