<template>
	<div class="color-selector" v-clickoutside="hide">
		<div class="color-selector__mask" v-if="disabled"></div>
		<div class="color-selector__trigger" @click="handleTrigger" :style="{backgroundColor: showRgbColor}"></div>
		<color-drop-down
		  ref="down"
		  class="color-selector__down"
		  v-model="showDropDown"
			:color="color"
		  :predefine="predefine" :style="styles">
		</color-drop-down>
	</div>
</template>

<script>
import ColorDropDown from "@/components/colorSelector/src/component/color-dropdown.vue";
import {Color} from "@/components/colorSelector/src/color";

export default {
	name: "ColorSelector",
	components: {ColorDropDown},
	props: {
		disabled: Boolean,
		value: String,
		predefine: Array,
    styles: String,
    formatter: {
      type: String,
      default: "hex"
    },
    funFormatter: String,
    colorChange: Function
	},
	data() {
		const color = new Color({
			color: this.value
		});
		return {
			color: color,
			showDropDown: false,
		}
	},
	watch: {
		showHexColor(val) {
      if (this.formatter === 'rgb') {
        this.$emit('input', this.showRgbColor);
      } else {
        this.$emit('input', val);
      }
      let funValue;
      if (this.funFormatter === 'rgb') {
        funValue = this.showRgbColor;
      } else if (this.funFormatter === 'rgbValue') {
        funValue = this.showRgbValue;
      } else {
        funValue = val;
      }
      this.colorChange(funValue);
		}
	},
	computed: {
		showRgbColor() {
			const {r, g, b} = this.color.value;
			return `rgb(${r}, ${g}, ${b})`;
		},
    showRgbValue() {
      const {r, g, b} = this.color.value;
      return `${r} ${g} ${b}`;
    },
		showHexColor() {
			return this.color.hexValue;
		}
	},
	created() {

	},
	mounted() {
		this.downEl = this.$refs.down.$el;
	},
	methods: {
		handleTrigger() {
			if (this.disabled) return;
			this.showDropDown = !this.showDropDown;
		},
		hide() {
			this.showDropDown = false;
		}
	}
}
</script>

<style lang="scss" scoped>
.color-selector {
	--border-radius-selector: 5px;

	width: 100%;
	height: 100%;
	border: 1px solid #d7d5d5;
	border-radius: var(--border-radius-selector);
	position: relative;
	display: inline-block;
	line-height: normal;
}

.color-selector__mask {
	width: 100%;
	height: 100%;
	border-radius: var(--border-radius-selector);
	position: absolute;
	cursor: not-allowed;
	background-color: rgba(255, 255, 255, .7);
	z-index: 1;
}

.color-selector__trigger {
	width: 100%;
	height: 100%;
	border-radius: var(--border-radius-selector);
	cursor: pointer;
}

.color-selector__down {
	padding: 6px;
	border: 1px solid #EBEEF5;
	border-radius: var(--border-radius-selector);
	box-shadow: 0 2px 12px 0 rgba(0, 0, 0, .1);
	position: absolute;
}
</style>
