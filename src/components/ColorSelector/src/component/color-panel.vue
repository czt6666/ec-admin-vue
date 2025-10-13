<template>
	<div class="color-down__panel" :style="{backgroundColor: baseColor}">
		<div class="color-down__panel-white"></div>
		<div class="color-down__panel-black"></div>
		<div class="color-down__panel-point"
		     :style="{left: style.left + 'px', top: style.top + 'px'}">
			<div></div>
		</div>
	</div>
</template>

<script>
import draggable from "../draggable";

export default {
	name: "ColorPanel",
	props: {
		color: {
			required: true
		}
	},
	data() {
		return {
			style: {
				left: 0,
				top: 0
			}
		}
	},
	computed: {
		baseColor() {
			const {r, g, b} = this.color.baseColor;
			return `rgb(${r}, ${g}, ${b})`;
		},
		showColor() {
			const {r, g, b} = this.color.value;
			return `rgb(${r}, ${g}, ${b})`;
		}
	},
	watch: {
		showColor() {
			this.setPosition();
		}
	},
	mounted() {
		draggable(this.$el, {
			start: true,
			moveFun: (event) => {
				this.handleEvent(event);
			},
			endFun: (event) => {
				this.handleEvent(event);
			}
		});
		this.setPosition();
	},
	beforeDestroy() {
		draggable(this.$el, {start: false});
	},
	methods: {
		handleEvent(event) {
			const rect = this.$el.getBoundingClientRect();
			let eventX, eventY;
			if (event.clientX !== undefined) {
				eventX = event.clientX;
				eventY = event.clientY;
			} else if (event.touches[0]) {
				eventX = event.touches[0].clientX;
				eventY = event.touches[0].clientY;
			} else {
				eventX = event.changedTouches[0].clientX;
				eventY = event.changedTouches[0].clientY;
			}
			let left = eventX - rect.left;
			left = Math.max(left, 0);
			left = Math.min(left, rect.width);

			let top = eventY - rect.top;
			top = Math.max(top, 0);
			top = Math.min(top, rect.height);
			this.style.left = left;
			this.style.top = top;

			this.color.setSAndB(
			 left / rect.width * 100,
			 100 - top / rect.height * 100
			);
		},
		setPosition() {
			const {s, b} = this.color.hsb;
			this.style.left = s * this.$el.clientWidth / 100;
			this.style.top = (100 - b) * this.$el.clientHeight / 100;
		}
	}
}
</script>

<style lang="scss" scoped>
.color-down__panel {
	height: 200px;
	width: 100%;
	position: relative;

	.color-down__panel-white, .color-down__panel-black {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
	}

	.color-down__panel-point {
		position: absolute;

		> div {
			width: 4px;
			height: 4px;
			border-radius: 50%;
			transform: translate(-2px, -2px);
			box-shadow: 0 0 0 1.5px #fff, inset 0 0 1px 1px rgba(0, 0, 0, .3), 0 0 1px 2px rgba(0, 0, 0, .4);
		}
	}
}

.color-down__panel-white {
	background: linear-gradient(to right, #fff, rgba(255, 255, 255, 0));
}

.color-down__panel-black {
	background: linear-gradient(to top, #000, rgba(0, 0, 0, 0));
}
</style>
