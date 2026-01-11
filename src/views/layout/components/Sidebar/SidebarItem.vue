<template>
  <div class="menu-wrapper">
    <template v-for="item in routes" v-if="!item.hidden&&item.children">

      <router-link v-if="item.children.length===1 && !item.children[0].children" :to="item.path+'/'+item.children[0].path" :key="item.children[0].name">
        <el-menu-item :index="item.path+'/'+item.children[0].path" class='submenu-title-noDropdown single-menu-item'>
          <svg-icon v-if="item.children[0].meta&&item.children[0].meta.icon && !isImagePath(item.children[0].meta.icon)" :icon-class="item.children[0].meta.icon"></svg-icon>
          <img v-else-if="item.children[0].meta&&item.children[0].meta.icon && isImagePath(item.children[0].meta.icon)" class="custom-icon-img" :src="getImageSrc(item.children[0].meta.icon)" alt="menu-icon">
          <span v-if="item.children[0].meta&&item.children[0].meta.title">{{item.children[0].meta.title}}</span>
        </el-menu-item>
      </router-link>

      <el-submenu v-else :index="item.name||item.path" :key="item.name">
        <template slot="title">
          <svg-icon v-if="item.meta&&item.meta.icon && !isImagePath(item.meta.icon)" :icon-class="item.meta.icon"></svg-icon>
          <img v-else-if="item.meta&&item.meta.icon && isImagePath(item.meta.icon)" class="custom-icon-img" :src="getImageSrc(item.meta.icon)" alt="menu-icon">
          <span v-if="item.meta&&item.meta.title">{{item.meta.title}}</span>
        </template>

        <template v-for="child in item.children" v-if="!child.hidden">
          <sidebar-item class="nest-menu" v-if="child.children&&child.children.length>0" :routes="[child]" :key="child.path"></sidebar-item>

          <router-link v-else :to="item.path+'/'+child.path" :key="child.name">
            <el-menu-item :index="item.path+'/'+child.path" class="sub-menu-item">
              <svg-icon v-if="child.meta&&child.meta.icon && !isImagePath(child.meta.icon)" :icon-class="child.meta.icon"></svg-icon>
              <img v-else-if="child.meta&&child.meta.icon && isImagePath(child.meta.icon)" class="custom-icon-img" :src="getImageSrc(child.meta.icon)" alt="menu-icon">
              <span v-if="child.meta&&child.meta.title">{{child.meta.title}}</span>
            </el-menu-item>
          </router-link>
        </template>
      </el-submenu>

    </template>
  </div>
</template>

<script>
export default {
  name: 'SidebarItem',
  props: {
    routes: {
      type: Array
    }
  },
  methods: {
    isImagePath(icon) {
      // 检查是否包含图片文件扩展名
      return /\.(png|jpe?g|gif|svg|bmp|webp)(\?.*)?$/.test(icon);
    },
    getImageSrc(icon) {
      // 获取图片路径
      // 如果传入的是已导入的图片对象，则直接返回；否则按路径处理
      if (typeof icon === 'string') {
        let imagePath;
        if (icon.startsWith('@/')) {
          // 将 @/ 替换为 /
          imagePath = icon.replace('@/', '/');
        } else if (icon.startsWith('/')) {
          // 直接使用绝对路径
          imagePath = icon;
        } else {
          // 相对路径或普通字符串
          imagePath = icon;
        }
        
        return imagePath;
      } else {
        // 如果是导入的图片对象（如通过require或import引入），直接返回
        return icon;
      }
    }
  }
}
</script>

<style>
.custom-icon-img {
  width: 16px;
  height: 16px;
  margin-right: 15px;
  display: inline-block;
  vertical-align: middle;
  object-fit: contain;
  min-width: 16px; /* 确保即使图片未加载也有空间 */
}

.el-submenu .custom-icon-img {
  /* 为下拉菜单项调整样式 */
  margin-right: 5px;
}

/* 确保图标在菜单项中垂直居中 */
.el-menu-item .custom-icon-img,
.el-submenu__title .custom-icon-img {
  margin-top: -2px;
}





</style>
