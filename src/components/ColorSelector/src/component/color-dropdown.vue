<template>
  <transition name="el-zoom-in-top">
    <div class="color-down"
         v-show="open"
         :style="{left: style.left + 'px', top: style.top + 'px', zIndex: style.zIndex}">
      <div class="color-down__main-wrapper">
        <ColorPanel ref="panel" :color="color"/>
        <ColorSlider ref="slider" :color="color"/>
      </div>
      <div class="color-down__btns">
				<span class="color-down__input-position">
					<input v-model="inputValue"
                 type="text"
                 autocomplete="off"
                 class="color-down__input"
                 @input="inputHandle"/>
				</span>
      </div>
      <template v-if="availablePredefine.length">
        <div class="color-down__splitLine"></div>
        <div class="color-down__example">
          <div class="color-down__example-item"
               v-for="(item, index) in availablePredefine"
               :key="index"
               :class="{'color-down__example-choose': chooseColorIndex === index}" @click="handleExampleTrigger(item, index)">
            <div class="color-down__example-color" :style="{ backgroundColor: item}"></div>
          </div>
        </div>
      </template>
    </div>
  </transition>
</template>

<script>
import ColorSlider from "./color-slider.vue";
import ColorPanel from "./color-panel.vue";

const stop = e => e.stopPropagation();
export default {
  name: "ColorDropDown",
  components: {ColorSlider, ColorPanel},
  props: {
    value: Boolean,
    color: {
      required: true
    },
    predefine: Array
  },
  data() {
    return {
      open: false,
      style: {
        left: 0,
        top: 0,
        zIndex: 2024
      },
      selfEl: null,
      parentEl: null,
      chooseColorIndex: 0,
      inputValue: "",
    }
  },
  watch: {
    value: {
      immediate: true,
      handler(val) {
        this.open = val;
        if (val === true) {
          this.$nextTick(() => {
            this.position();
            this.inputValue = this.color.hexValue;
            this.$refs.panel.setPosition();
            this.$refs.slider.setPosition();
          });
        }
      }
    },
    showColor: {
      immediate: true,
      handler(val) {
        if (this.chooseColorIndex !== -1 && this.color.hexValue !== this.availablePredefine[this.chooseColorIndex].toUpperCase()) {
          this.chooseColorIndex = -1;
        }
        this.inputValue = this.color.hexValue;
      }
    },
  },
  computed: {
    showColor() {
      return this.color.value;
    },
    availablePredefine() {
      const colors = [];
      if (this.predefine) {
        this.predefine.forEach(color => {
          if (/^#((?:[0-9a-fA-F]{3}){1,2}|[0-9a-fA-F]{6})$/.test(color)) {
            colors.push(color);
          }
        });
      }
      return colors;
    }
  },
  mounted() {
    this.selfEl = this.$el;
    this.parentEl = this.$parent.$el;
    document.body.appendChild(this.selfEl);
    this.selfEl.addEventListener("click", stop);
  },
  beforeDestroy() {
    if (this.selfEl && this.selfEl.parentNode === document.body) {
      this.selfEl.removeEventListener("click", stop);
      document.body.removeChild(this.selfEl);
    }
  },
  methods: {
    position(parent = this.parentEl, self = this.selfEl) {
      if (!parent || !self) {
        return;
      }
      const windowWidth = Math.max(document.documentElement.clientWidth, window.innerWidth);
      const windowHeight = document.documentElement.clientHeight;
      const {width: parentWidth, x: parentX, bottom: parentBottom, top: parentTop} = parent.getBoundingClientRect();
      const {width: selfWidth, height: selfHeight} = self.getBoundingClientRect();
      const right = (selfWidth + parentWidth) / 2 + parentX;
      if (right > windowWidth) {
        this.style.left = windowWidth - selfWidth;
      } else {
        this.style.left = right - selfWidth;
      }

      const bottom1 = parentBottom + selfHeight;
      const bottom2 = parentTop;
      if (bottom1 > windowHeight && bottom2 > selfHeight) {
        this.style.top = bottom2 - selfHeight;
      } else {
        this.style.top = parentBottom;
      }
    },

    inputHandle() {
      if (!/^#((?:[0-9a-fA-F]{3}){1,2}|[0-9a-fA-F]{6})$/.test(this.inputValue)) {
        return;
      }
      this.color.setColor(this.inputValue);
    },

    handleExampleTrigger(color, index) {
      if (this.chooseColorIndex === index) {
        return;
      }
      this.chooseColorIndex = index;
      this.color.setColor(color);
    }
  },
}
</script>

<style lang="scss" scoped>
.color-down {
  width: 240px;
  background-color: #fff;
}

.color-down__main-wrapper {
  margin-bottom: 6px;
  width: 100%;
}

.color-down__btns {
  margin-top: 6px;

  .color-down__input-position {
  }

  .color-down__input {
    border: 1px solid #DCDFE6;
    border-radius: 4px;
    background-color: #FFF;
    background-image: none;
    color: #606266;
    padding: 0 15px;
    display: inline-block;
    box-sizing: border-box;
    font-size: 12px;
    width: 100%;
    height: 28px;
    line-height: 28px;
  }

  .color-down__input:hover {
    border-color: #C0C4CC;
  }

  .color-down__input:focus {
    border-color: #409EFF;
    outline: 0;
  }
}

.color-down__splitLine {
  margin: 12px 0 8px;
  border-block-end: 1px solid #DCDFE6;
  width: 100%;
  min-width: 100%;
  padding: 0;
}

.color-down__example {
  display: flex;
  align-items: center;
  justify-content: start;
  flex-wrap: wrap;
  //height: 35px;

  .color-down__example-item {
    width: 29px;
    height: 29px;
    border-radius: 6px;
    margin: 2px;
    padding: 2px;
    cursor: pointer;
    box-sizing: border-box;

    .color-down__example-color {
      width: 100%;
      height: 100%;
      border-radius: 4px;
    }
  }

  .color-down__example-choose {
    border: 1px solid #c3c4c9;
  }
}

</style>
