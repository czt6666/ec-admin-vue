<template>
  <div class="sidebar-container">
    <div class="sideBarHeader">
      <!-- <img class="logo-img" src="../../../../assets/webOFD1.svg" alt=""/> -->
    </div>
    <scroll-bar>
      <el-menu mode="vertical" unique-opened :default-active="$route.path" :collapse="isCollapse"
               background-color="#b22222" text-color="#fff" active-text-color="#ff4b4b">
        <sidebar-item :routes="permission_routers"></sidebar-item>
      </el-menu>
    </scroll-bar>
    <!-- 左侧边栏底部图标 -->
    <!-- 图片路径: /static/icons/png/redlefticon.png -->
    <div class="sidebar-footer">
      <img class="footer-icon" src="/static/icons/png/redlefticonwhite.png" alt="footer-icon" />
    </div>
  </div>
</template>
<script>
  import {mapGetters} from 'vuex'
  import SidebarItem from './SidebarItem'
  import ScrollBar from '@/components/ScrollBar'

  export default {
    components: {SidebarItem, ScrollBar},
    computed: {
      ...mapGetters([
        'permission_routers',
        'sidebar'
      ]),
      isCollapse() {
        return !this.sidebar.opened
      }
    }
  }
</script>

<style scoped>
.sideBarHeader {
  width: 100%;
  background-color: rgba(178, 34, 34, 0.85);
  font-size: 22px;
  color: #ffffff;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 5px;
  user-select: none;
  /* //padding-right: 5px;
  //border-bottom: 2px solid white; */
}
.logo-img {
  width: 90%;
  height: 90%;
  object-fit: scale-down;
  display: block;
}

.sidebar-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.sidebar-footer {
  padding: 20px 10px;
  text-align: center;
  margin-top: auto;
  background-color: rgba(178, 34, 34, 0.85);
}

.footer-icon {
  max-width: 100%;
  max-height: 150px;
  object-fit: contain;
  border-radius: 8px;
  padding: 5px;

}
</style>
