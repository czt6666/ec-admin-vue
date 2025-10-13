<template>
  <transition name="contextmenu-submenu-fade">
    <div ref="menu" :class="[CLASS_MENU, 'menu', customClass]"
         :style="{ left: style.left + 'px', top: style.top + 'px', minWidth: style.minWidth + 'px', zIndex: style.zIndex }"
         v-if="visible" @contextmenu="(e) => e.preventDefault()">
      <div class="menu_body">
        <template v-for="(item, index) of items">
          <template v-if="!item.hidden">
            <div class="menu_item"
                 :[UI_ATTR]="setDataUI(item)"
                 :class="{'menu_item_expand': activeSubmenu.index === index}"
                 :key="index" @mouseenter="($event) => enterItem($event, item, index)"
                 @click="itemClick(item)">
              <div class="menu_item_label">
                <div>
                  <div class="menu_item_icon" v-if="item.icon">
                    <i :class="item.icon" v-if="item.icon"></i>
                  </div>
                  <span>{{ item.label }}</span>
                </div>
                <div v-if="item.children" class="menu_item_expand_icon">▶</div>
              </div>
            </div>
          </template>
        </template>
      </div>
    </div>
  </transition>
</template>

<script>
import Vue from "vue";
import {
  SUBMENU_X_OFFSET,
  SUBMENU_Y_OFFSET,
  SUBMENU_OPEN_TREND_LEFT,
  SUBMENU_OPEN_TREND_RIGHT,
  COMPONENT_NAME,
  CLASS_MENU,
  UI_ATTR,
  UI_ATTR_DIVIDED,
  UI_ATTR_TITLE,
  UI_ATTR_DISABLED,
  UI_ATTR_AVAILABLE
} from "../js/constant.js";
export default {
  name: COMPONENT_NAME,
  data() {
    return {
      CLASS_MENU,
      UI_ATTR,
      UI_ATTR_DIVIDED,
      UI_ATTR_TITLE,
      UI_ATTR_DISABLED,
      UI_ATTR_AVAILABLE,
      activeSubmenu: {
        index: null,
        instance: null
      },
      items: [],
      parentElement: null,
      position: {
        x: 0,
        y: 0,
        width: 0,
        height: 0
      },
      style: {
        left: 0,
        top: 0,
        zIndex: 2,
        minWidth: 180
      },
      customClass: null,
      visible: false,
      hasIcon: false,
      openTrend: SUBMENU_OPEN_TREND_RIGHT
    };
  },
  mounted() {
    this.visible = true;
    for (let item of this.items) {
      if (item.icon) {
        this.hasIcon = true;
        break;
      }
    }
    this.$nextTick(() => {
      const windowWidth = document.documentElement.clientWidth;
      const windowHeight = document.documentElement.clientHeight;
      const menu = this.$refs.menu;
      const menuWidth = menu.offsetWidth;
      const menuHeight = menu.offsetHeight;

      (this.openTrend === SUBMENU_OPEN_TREND_LEFT
        ? this.leftOpen
        : this.rightOpen)(windowWidth, windowHeight, menuWidth);

      this.style.top = this.position.y;
      if (this.position.y + menuHeight > windowHeight) {
        if (this.position.height === 0) {
          this.style.top = this.position.y / windowHeight > 0.5 ? (this.position.y - menuHeight) : this.position.y;
        } else {
          this.style.top = windowHeight - menuHeight;
        }
      }
    });
  },
  methods: {
    /**
     * 根据菜单属性设置对应的ui属性，用于设置对应的样式
     * @param item
     * @returns {string}
     */
    setDataUI(item) {
      const value = [];
      if (item.divided) {
        value.push(UI_ATTR_DIVIDED);  // 分割线
      }
      if (item.isTitle) {
        value.push(UI_ATTR_TITLE);  // 标题
      } else if (item.disabled) {
        value.push(UI_ATTR_DISABLED); // 不可用
      } else {
        value.push(UI_ATTR_AVAILABLE); // 可用
      }
      return value.join(" ");
    },
    leftOpen(windowWidth, windowHeight, menuWidth) {
      this.style.left = this.position.x - menuWidth;
      this.openTrend = SUBMENU_OPEN_TREND_LEFT;
      if (this.style.left < 0) {
        this.openTrend = SUBMENU_OPEN_TREND_RIGHT;
        if (this.position.width === 0) {
          this.style.left = 0;
        } else {
          this.style.left = this.position.x + this.position.width;
        }
      }
    },
    rightOpen(windowWidth, windowHeight, menuWidth) {
      this.style.left = this.position.x + this.position.width;
      this.openTrend = SUBMENU_OPEN_TREND_RIGHT;
      if (this.style.left + menuWidth > windowWidth) {
        this.openTrend = SUBMENU_OPEN_TREND_LEFT;
        if (this.position.width === 0) {
          this.style.left = windowWidth - menuWidth;
        } else {
          this.style.left = this.position.x - menuWidth;
        }
      }
    },
    enterItem(e, item, index) {
      if (!this.visible) {
        return;
      }
      if (item.isTitle) {
        return;
      }
      if (this.activeSubmenu.instance) {
        if (this.activeSubmenu.index === index) {
          return;
        } else {
          this.activeSubmenu.instance.close();
          this.activeSubmenu.instance = null;
          this.activeSubmenu.index = null;
        }
      }
      if (!item.children || !item.children.length) {
        return;
      }
      const menuItemClientRect = e.target.getBoundingClientRect();
      const SubmenuConstructor = Vue.component(COMPONENT_NAME);
      this.activeSubmenu.index = index;
      this.activeSubmenu.instance = new SubmenuConstructor();
      this.activeSubmenu.instance.items = item.children;
      this.activeSubmenu.instance.openTrend = this.openTrend;
      this.activeSubmenu.instance.position = {
        x: menuItemClientRect.x + SUBMENU_X_OFFSET,
        y: menuItemClientRect.y + SUBMENU_Y_OFFSET,
        width: menuItemClientRect.width - 2 * SUBMENU_X_OFFSET,
        height: menuItemClientRect.height - 2 * SUBMENU_Y_OFFSET
      };
      this.activeSubmenu.instance.style.minWidth =
        typeof item.minWidth === "number" ? item.minWidth : this.style.minWidth;
      this.activeSubmenu.instance.style.zIndex = this.style.zIndex;
      this.activeSubmenu.instance.customClass =
        typeof item.customClass === "string"
          ? item.customClass
          : this.customClass;
      this.activeSubmenu.instance.$mount();
      if (this.parentElement) {
        this.parentElement.appendChild(this.activeSubmenu.instance.$el);
      } else {
        document.body.appendChild(this.activeSubmenu.instance.$el);
      }
    },
    itemClick(item) {
      if (!this.visible) {
        return;
      }
      if (
        item &&
        !item.disabled &&
        !item.hidden &&
        !item.isTitle &&
        typeof item.onClick === "function"
      ) {
        return item.onClick();
      }
    },
    close() {
      this.visible = false;
      if (this.activeSubmenu.instance) {
        this.activeSubmenu.instance.close();
      }
      this.$nextTick(() => {
        this.$destroy();
      });
    }
  }
};
</script>

<style scoped>
.menu {
  position: fixed;
  box-shadow: 0 2px 12px 2px rgba(68, 73, 77, .16);
  background: #fff;
  border-radius: 4px;
  border: 1px solid rgba(0, 0, 0, .12);
  padding: 8px 0;
}

.menu_body {
  display: block;
}

.menu_item {
  list-style: none;
  margin: 0;
  font-size: 12px;
  outline: 0;
  transition: 0.2s;
}

.menu_item .menu_item_icon {
  margin-right: 8px;
  width: 13px;
  display: inline-block;
}

.menu_item .menu_item_label {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  flex: 1;
  padding: 9px 16px 9px 28px;
}

.menu_item .menu_item_expand_icon {
  margin-left: 16px;
  font-size: 10px;
  width: 10px;
}

.menu_item_expand {
  background-color: #f3f4f6;
}

.menu_item[data-ui~="menu_divided"] {
  border-bottom: 1px solid #ebeef5;
}
.menu_item[data-ui~="menu_title"] {
  color: #606266;
  font-weight: bold;
}
.menu_item[data-ui~="menu_disabled"] {
  color: #c0c4cc;
  cursor: not-allowed;
}
.menu_item[data-ui~="menu_available"] {
  color: #606266;
  cursor: pointer;
}
.menu_item[data-ui~="menu_available"]:hover {
  background-color: #f3f4f6;
}
</style>

<style>
.contextmenu-submenu-fade-enter-active,
.contextmenu-submenu-fade-leave-active {
  transition: opacity 0.1s;
}

.contextmenu-submenu-fade-enter,
.contextmenu-submenu-fade-leave-to {
  opacity: 0;
}
</style>
