<template>
  <div>
    <div class="sideBarHeader">
      <!-- <img class="logo-img" src="../../../../assets/webOFD1.svg" alt=""/> -->
    </div>
    <scroll-bar>
      <el-menu mode="vertical" unique-opened :default-active="$route.path" :collapse="isCollapse"
               background-color="#304156" text-color="#fff" active-text-color="#409EFF">
        <sidebar-item :routes="permission_routers"></sidebar-item>
      </el-menu>
    </scroll-bar>
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
  background-color: #304156;
  font-size: 22px;
  color: #ffffff;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 5px;
  user-select: none;
  //padding-right: 5px;
  //border-bottom: 2px solid white;
}
.logo-img {
  width: 90%;
  height: 90%;
  object-fit: scale-down;
  display: block;
}
</style>
