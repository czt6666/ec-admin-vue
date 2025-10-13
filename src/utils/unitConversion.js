import {singleton} from "./UseableTool";

class unitConversion {

    dpi = undefined;

    constructor() {
        /**
         * 获取DPI
         * @returns {Array}
         */
        this.conversion_getDPI = function () {
            //定义dpi变量
            var arrDPI = [];
            if (window.screen.deviceXDPI) {

                //将获取到的x，ydpi赋值给该变量
                arrDPI[0] = window.screen.deviceXDPI;
                arrDPI[1] = window.screen.deviceYDPI;
            } else {
                var tmpNode = document.createElement("DIV");
                tmpNode.style.cssText = "width:1in;height:1in;position:absolute;left:0px;top:0px;z-index:99;visibility:hidden";
                document.body.appendChild(tmpNode);
                arrDPI[0] = parseInt(tmpNode.offsetWidth);
                arrDPI[1] = parseInt(tmpNode.offsetHeight);
                tmpNode.parentNode.removeChild(tmpNode);
            }
            return arrDPI;
        };

        /**
         * px转换为mm
         * @param value
         * @returns {number}
         */
        this.pxConversionMm = function (value) {
            var inch = value / this.dpi;
            var cValue = inch * 25.4;
            return Number(cValue.toFixed(3));
        };

        /**
         * mm转换为px
         * @param value
         * @returns {number}
         */
        this.mmConversionPx = function (value) {
            var inch = value / 25.4;
            var cValue = inch * this.dpi;
            return Number(cValue.toFixed(3));
        };

        this.dpi = this.conversion_getDPI()[0];
    }
}

// 单例
const UnitConversion = singleton(unitConversion);
export default new UnitConversion();
