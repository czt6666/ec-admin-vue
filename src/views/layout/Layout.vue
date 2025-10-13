<template>
  <div class="app-wrapper" :class="{ hideSidebar: !sidebar.opened }">
    <div v-if="needLogin && !loginSuccess" style="width: 100%; height: 100vh; background-color: rgba(0, 0, 0, 0.5); display: flex; justify-content: center; align-items: center">
      <el-card style="width: 380px;">
        <div slot="header" style="text-align: center">
          <span style="font-size: 18px">webOFD后台登录</span>
        </div>
        <div style="width: 100%">
          <el-form @submit.native.prevent>
            <el-input v-model="adminPassword" placeholder="请输入管理员密码" show-password clearable @keyup.enter.native="adminLogin"></el-input>
            <el-button type="primary" @click="adminLogin" style="width: 100%; margin-top: 20px">登录</el-button>
          </el-form>
        </div>
      </el-card>
    </div>
    <template v-else>
      <sidebar class="sidebar-container"></sidebar>
      <div class="main-container">
        <navbar></navbar>
        <app-main>
          <p style="color: #999; padding: 0 20px 5px;">缓存组件：{{ caches }}</p>
          <keep-alive :include="caches">
            <router-view v-if="isRenderTab"></router-view>
          </keep-alive>
        </app-main>
      </div>
    </template>
  </div>
</template>

<script>
import { Navbar, Sidebar, AppMain } from '@/views/layout/components'
import { mapState } from 'vuex'
export default {
  name: 'layout',
  components: {
    Navbar,
    Sidebar,
    AppMain
  },
  data() {
    return {
      loginSuccess: false,
      adminPassword: ""
    }
  },
  computed: {
    sidebar() {
      return this.$store.state.app.sidebar
    },
    ...mapState('cache', ['caches']),
    ...mapState(['isRenderTab']),
    needLogin() {
      return !window.webofdConfig.IS_LOGIN;
    }
  },
  methods: {
    adminLogin() {
      if (this.adminPassword === "") {
        return;
      }
      const formData = new FormData();
      formData.append("password", this.adminPassword);
      this.api({
        url: "/file/configPassword",
        method: "post",
        data: formData
      }).then(res => {
        if (res === 1) {
          this.loginSuccess = true;
        } else {
          alert("密码错误")
        }
      })
    }
  }
}

</script>

<style rel="stylesheet/scss" lang="scss" scoped>
@import "src/styles/mixin.scss";

.app-wrapper {
  @include clearfix;
  position: relative;
  height: 100%;
  width: 100%;
}
</style>
