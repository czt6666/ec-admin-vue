import { default as UnitConversion } from "./unitConversion";
export function convertBoxMMtoPX(data) {
    var boxPx = {
        top: "",
        left: "",
        bottom: "",
        right: ""
    };
    boxPx.top = UnitConversion.mmConversionPx(data.top);
    boxPx.left = UnitConversion.mmConversionPx(data.left);
    boxPx.bottom = UnitConversion.mmConversionPx(data.bottom);
    boxPx.right = UnitConversion.mmConversionPx(data.right);
    return boxPx;
}
