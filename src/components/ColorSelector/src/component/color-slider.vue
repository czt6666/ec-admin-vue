<template>
  <div class="color-down__slider">
    <div ref="sliderBack"
         class="color-down__slider-back"
         @click="handleSliderTrigger"></div>
    <div ref="sliderBar"
         class="color-down__slider-bar"
         :style="{left: style.left + 'px'}"></div>
  </div>
</template>

<script>
import draggable from "../draggable";

export default {
  name: "ColorSlider",
  props: {
    color: {
      required: true
    }
  },
  data() {
    return {
      style: {
        left: 0
      },
    }
  },
  computed: {
    currentHue() {
      return this.color.hsb.h;
    }
  },
  watch: {
    currentHue: {
      handler() {
        this.setPosition();
      }
    }
  },
  mounted() {
    const dragOptions = {
      start: true,
      moveFun: (event) => {
        this.handleEvent(event);
      },
      endFun: (event) => {
        this.handleEvent(event);
      }
    }

    const {sliderBack, sliderBar} = this.$refs;
    draggable(sliderBack, dragOptions);
    draggable(sliderBar, dragOptions);
  },
  beforeDestroy() {
    const {sliderBack, sliderBar} = this.$refs;
    draggable(sliderBack, {start: false});
    draggable(sliderBar, {start: false});
  },
  methods: {
    handleSliderTrigger(event) {
      const sliderBar = this.$refs.sliderBar;
      const target = event.target;
      if (target === sliderBar) {
        return;
      }
      this.handleEvent(event);
    },

    handleEvent(event) {
      const sliderBar = this.$refs.sliderBar;
      const rect = this.$el.getBoundingClientRect();
      let left = (event.clientX || (event.touches[0] ? event.touches[0].clientX : null) || event.changedTouches[0].clientX) - rect.left;
      left = Math.min(left, rect.width - sliderBar.offsetWidth / 2);
      left = Math.max(left, sliderBar.offsetWidth / 2);
      let hue = Math.round((left - sliderBar.offsetWidth / 2) / (rect.width - sliderBar.offsetWidth) * 360);
      this.color.setHue(hue);

      const el = this.$el;
      this.style.left = Math.round(hue * (el.offsetWidth - sliderBar.offsetWidth / 2) / 360);
    },

    setPosition() {
      const sliderBar = this.$refs.sliderBar;
      const el = this.$el;
      this.style.left = Math.round(this.color.hsb.h * (el.offsetWidth - sliderBar.offsetWidth / 2) / 360);
    }

  }
}
</script>

<style lang="scss" scoped>
.color-down__slider {
  width: 100%;
  height: 15px;
  box-sizing: border-box;
  margin-top: 5px;
  position: relative;
  padding: 0 2px;
  background-color: red;

  .color-down__slider-back {
    width: 100%;
    height: 100%;
    background: linear-gradient(to right, red 0, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, red 100%);
  }

  .color-down__slider-bar {
    height: 100%;
    width: 4px;
    background-color: #fff;
    border: 1px solid #f0f0f0;
    border-radius: 1px;
    position: absolute;
    top: -1px;
    box-shadow: 0 0 2px rgba(0, 0, 0, .6);
    cursor: pointer;
  }
}
</style>
