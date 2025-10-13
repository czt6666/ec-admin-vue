function hsbToRgb(h, s, b) {
	s /= 100;
	b /= 100;

	const i = Math.floor(h / 60);
	const f = h % 60;
	const p = b * (1 - s);
	const q = b * (1 - s * f / 60);
	const t = b * (1 - s * (60 - f) / 60);

	const mod = i % 6;
	const red = [b, q, p, p, t, b][mod];
	const green = [t, b ,b, q, p, p][mod];
	const blue = [p, p, t, b, b, q][mod];
	return {
		r: Math.round(red * 255),
		g: Math.round(green * 255),
		b: Math.round(blue * 255),
	}
}

function rgbToHsb({r, g, b}) {
	r /= 255;
	g /= 255;
	b /= 255;
	const max = Math.max(r, g, b);
	const min = Math.min(r, g, b);
	let h, s, v = max;

	const delta = max - min;
	s = max === 0 ? 0 : delta / max;

	if (max === min) {
		h = 0;
	} else {
		switch (max) {
			case r:
				h = (g - b) / delta + (g < b ? 6 : 0);
				break;
			case g:
				h = (b - r) / delta + 2;
				break;
			case b:
				h = (r - g) / delta + 4;
				break;
		}
		h *= 60;
		if (h < 0) {
			h += 360;
		}
	}

	return {
		h: Math.round(h),
		s: Math.round(s * 100),
		b: Math.round(v * 100)
	}
}

function rgbToHex({r, g, b}) {
	const intToHex = {10: 'A', 11: 'B', 12: 'C', 13: 'D', 14: 'E', 15: 'F'};
	const toHex = function (value) {
		value = Math.min(Math.round(value), 255);
		const high = Math.floor(value / 16);
		const low = value % 16;
		return '' + (intToHex[high] || high) + (intToHex[low] || low);
	}
	return '#' + toHex(r) + toHex(g) + toHex(b);
}

function hexToRgb(hex) {
	hex = hex.replace(/^#/, '');

	let r, g, b;
	if (hex.length === 3) {
		r = parseInt(hex[0] + hex[0], 16);
		g = parseInt(hex[1] + hex[1], 16);
		b = parseInt(hex[2] + hex[2], 16);
	} else if (hex.length === 6) {
		r = parseInt(hex.substring(0, 2), 16);
		g = parseInt(hex.substring(2, 4), 16);
		b = parseInt(hex.substring(4, 6), 16);
	}

	return {r, g, b};
}

function rgbToValue(rgb) {
	rgb = rgb.substring(rgb.indexOf('(') + 1, rgb.indexOf(')'));
	rgb = rgb.replace(/\s+/g, '');
	const [r, g, b] = rgb.split(',')
	return {
		r: Number(r),
		g: Number(g),
		b: Number(b)
	};
}

export class Color {
	constructor({color}) {
		this.hsb = {
			h: 0,
			s: 100,
			b: 100
		};
		this.baseColor = {
			r: 255,
			g: 0,
			b: 0
		}
		this.value = {
			r: 255,
			g: 0,
			b: 0
		}
		this.setColor(color);
		this.hexValue = rgbToHex(this.value);
	}

	setHue(value) {
		this.hsb.h = value;
		const {h, s, b} = this.hsb;
		this.baseColor = hsbToRgb(h, 100, 100);
		this.value = hsbToRgb(h, s, b);
		this.hexValue = rgbToHex(this.value);
	}

	setSAndB(saturation = 100, brightness = 100) {
		this.hsb.s = saturation;
		this.hsb.b = brightness;
		const {h, s, b} = this.hsb;
		this.value = hsbToRgb(h, s, b);
		this.hexValue = rgbToHex(this.value);
	}

	setColor(value) {
		if (value.includes('#')) {
			this.value = hexToRgb(value);
			this.hexValue = value.toUpperCase();
		} else {
			this.value = rgbToValue(value);
			this.hexValue = rgbToHex(this.value);
		}
		this.hsb = rgbToHsb(this.value);
		this.baseColor = hsbToRgb(this.hsb.h, 100, 100);
	}



}