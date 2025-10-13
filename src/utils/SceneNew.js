// import { default as UnitConversion } from "./unitConversion";
// import {ImageDraw} from "./UseableTool";
//
// const unitEx = UnitConversion;
// // const baseLineWidth = unitEx.mmConversionPx(0.265);
// const baseLineWidth = 1;
// const baseLineColor = "rgb(255,0,0)";
// const borderWidth = unitEx.mmConversionPx(1.323);
//
// /**
//  * 所有注释的基类
//  */
// class SceneNew {
//   points = [];  // 注释点位数组（保留100%缩放比的数据）
//   type = -1;  // 1：直线，2：矩形，7：签批
//   isFile = false;
//   stroke = false;
//   annoLineWidth = null; // 注释线宽（保留100%缩放比的数据）
//   annoLineColor = null; // 注释颜色
//   fill = false;
//   annoFillColor = null;
//   box = null; // 注释外接box（保留100%缩放比的数据）
//   offset = {  // 注释偏移量
//     x: 0,
//     y: 0,
//     saveX: 0,
//     saveY: 0
//   };
//   isAbleMove = true;  // 注释是否能移动
//   bgCtx = undefined;
//   param = null;
//
//   // 构造方法
//   constructor(type = -1, points = []) {
//     this.type = type;
//     this.points = points;
//     this.setIsAbleMove();
//   }
//
//   copyObj() {
//     return new SceneNew(this.type, this.points)
//   }
//
//   /**
//    * @责任人：zxh
//    * @方法名：copyResizeObj
//    * @方法描述：从一个注释对象中复制其中的属性，并将其点位信息规范到100%
//    * @入参：obj：注释对象， scale：当前缩放比
//    * @返回值：返回复制完属性信息的当前对象
//    * @修改时间：2023.12.29
//    * @修改类型（新增、删除、修改等）：新增
//    * @修改描述：
//    * */
//   copyResizeObj(obj, scale) {
//     // 复制属性信息
//     Object.assign(this, obj);
//     // 将points规范到100%缩放比，缩放比为1时无需调整点位数据，减少数据遍历
//     if (scale !== 1) {
//       this.points.forEach(point => {
//         point.x /= scale;
//         point.y /= scale;
//       })
//     }
//     return this;
//   }
//
//   /**
//    * @责任人：zxh
//    * @方法名：setLine
//    * @方法描述：设置注释对象的线宽和颜色
//    * @入参：lineWidth：线宽， lineColor：颜色
//    * @返回值：无
//    * @修改时间：2023.12.29
//    * @修改类型（新增、删除、修改等）：新增
//    * @修改描述：
//    * */
//   setLine(lineWidth, lineColor) {
//     // 传入线宽和颜色时进行设置，否则使用默认数据
//     if (lineWidth !== undefined && lineWidth !== null) {
//       this.annoLineWidth = lineWidth;
//     } else {
//       this.annoLineWidth = baseLineWidth
//     }
//     if (lineColor !== undefined && lineColor !== null) {
//       this.annoLineColor = lineColor;
//     } else {
//       this.annoLineColor = baseLineColor
//     }
//   }
//
//   setStroke(lineWidth, lineColor) {
//     this.stroke = true;
//     this.annoLineWidth = UnitConversion.mmConversionPx(lineWidth);
//     const color = lineColor.split(" ");
//     this.annoLineColor = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
//   }
//
//   setFill(fillColor) {
//     this.fill = true;
//     this.annoFillColor = fillColor;
//   }
//
//   /**
//    * @责任人：zxh
//    * @方法名：draw
//    * @方法描述：注释绘制统一方法
//    * @入参：ctx：画布上下文， scale：当前缩放比， points：点位数组
//    * @返回值：points数组为空时进行日志提示并返回null
//    * @修改时间：2023.12.29
//    * @修改类型（新增、删除、修改等）：新增
//    * @修改描述：
//    * */
//   draw(ctx, scale, points = this.points) {
//     if (points.length === 0) {
//       console.log("points的长度为0，不能进行绘制");
//       return null;
//     }
//   }
//
//   /**
//    * @责任人：zxh
//    * @方法名：reDraw
//    * @方法描述：根据已经创建完毕的注释对象中的信息进行注释重绘
//    * @入参：ctx：画布上下文， scale：当前缩放比
//    * @返回值：无
//    * @修改时间：2023.12.29
//    * @修改类型（新增、删除、修改等）：新增
//    * @修改描述：
//    * */
//   reDraw(bgCtx, ctx, scale) {
//     this.bgCtx = bgCtx;
//     if (this.isFile) {
//       this.draw(ctx, scale, );
//     } else {
//       // 将注释对象中保存的100%缩放比的点位数据计算出当前缩放比下所要绘制的数据
//       const scaledPoints = setScaleOffsetPoints(this.points, scale, this.offset);
//       // 调用绘制方法进行注释绘制
//       this.draw(ctx, scale, scaledPoints);
//     }
//   }
//
//   /**
//    * @责任人：zxh
//    * @方法名：getBox
//    * @方法描述：获取注释外接box的统一方法
//    * @入参：无
//    * @返回值：返回当前box信息
//    * @修改时间：2023.12.29
//    * @修改类型（新增、删除、修改等）：新增
//    * @修改描述：
//    * */
//   getBox() {
//     if (this.box !== null) {
//       return this.box;
//     } else {
//       return null;
//     }
//   }
//
//   /**
//    * @责任人：zxh
//    * @方法名：updateCommonAnnoBox
//    * @方法描述：更新一般注释的边框大小位置（直线、矩形）
//    * @入参：points:注释点位列表
//    * @返回值：注释外接box
//    * @修改时间：2023.9.8
//    * @修改类型（新增、删除、修改等）：新增
//    * @修改描述：
//    * */
//   updateCommonAnnoBox(points = this.points) {
//     // 初始化左上角点
//     let x1 = points[0].x;
//     let y1 = points[0].y;
//     // 初始化右下角点
//     let x2 = x1;
//     let y2 = y1;
//     // 对所有注释点位进行遍历，比较出最小的x、y和最大的x、y
//     for (let i = 0; i < points.length; i++) {
//       if (points[i] === null || points[i] === undefined) {
//         continue;
//       }
//       if (x1 > points[i].x) {
//         x1 = points[i].x;
//       }
//       if (y1 > points[i].y) {
//         y1 = points[i].y;
//       }
//       if (x2 < points[i].x) {
//         x2 = points[i].x;
//       }
//       if (y2 < points[i].y) {
//         y2 = points[i].y;
//       }
//     }
//     // 左上角和右下角点组成边框
//     return {
//       left: x1,
//       top: y1,
//       right: x2,
//       bottom: y2
//     }
//   }
//
//   /**
//    * @责任人：zxh
//    * @方法名：updateQuadraticAnnoBox
//    * @方法描述：绘制批注线段时对批注矩形框的大小和位置进行更新
//    * @入参：points：注释点位列表
//    * @返回值：注释外接box
//    * @修改时间：2024.1.2
//    * @修改类型（新增、删除、修改等）：新增
//    * @修改描述：
//    * */
//   updateQuadraticAnnoBox(points = this.points) {
//
//     // 获取二次贝塞尔曲线的矩形框大小和位置
//     const getQuadraticBezierBoundingBox = (beginPoint, controlPoint, endPoint) => {
//       const x0 = beginPoint.x;
//       const y0 = beginPoint.y;
//       const x1 = controlPoint.x;
//       const y1 = controlPoint.y;
//       const x2 = endPoint.x;
//       const y2 = endPoint.y;
//       // 计算极值点的 t 值
//       const tx = (x0 - x1) / (x0 - 2 * x1 + x2);
//       const ty = (y0 - y1) / (y0 - 2 * y1 + y2);
//
//       // 计算边界框的四个顶点坐标
//       let minX = Math.min(x0, x2);
//       let maxX = Math.max(x0, x2);
//       let minY = Math.min(y0, y2);
//       let maxY = Math.max(y0, y2);
//
//       // 如果极值点在曲线上，则更新边界框
//       if (tx > 0 && tx < 1) {
//         const x = (1 - tx) ** 2 * x0 + 2 * (1 - tx) * tx * x1 + tx ** 2 * x2;
//         minX = Math.min(minX, x);
//         maxX = Math.max(maxX, x);
//       }
//       if (ty > 0 && ty < 1) {
//         const y = (1 - ty) ** 2 * y0 + 2 * (1 - ty) * ty * y1 + ty ** 2 * y2;
//         minY = Math.min(minY, y);
//         maxY = Math.max(maxY, y);
//       }
//
//       // 返回边界框
//       return {
//         left: minX,
//         top: minY,
//         right: maxX,
//         bottom: maxY
//       };
//     }
//
//     // 合并矩形框
//     const mergeRectBox = (nowBox, qbBox) => {
//       const left = Math.min(nowBox.left, qbBox.left);
//       const top = Math.min(nowBox.top, qbBox.top);
//       const right = Math.max(nowBox.right, qbBox.right);
//       const bottom = Math.max(nowBox.bottom, qbBox.bottom);
//       // 返回边界框
//       return {
//         left: left,
//         top: top,
//         right: right,
//         bottom: bottom
//       };
//     }
//
//     // 初始外边框
//     let nowBox = {
//       left: points[0].x,
//       top: points[0].y,
//       right: points[0].x,
//       bottom: points[0].y
//     }
//     // 对所有的点位进行遍历计算整体曲线的外边框
//     let beginPoint = points[0];
//     for (let i = 1; i < points.length; i += 2) {
//       let controlPoint = points[i]
//       if (controlPoint === undefined) {
//         controlPoint = beginPoint
//       }
//       let endPoint = points[i + 1]
//       if (endPoint === undefined) {
//         endPoint = controlPoint
//       }
//
//       // 现在三个点所绘二次贝塞尔曲线的矩形框
//       const qbBox = getQuadraticBezierBoundingBox(
//         beginPoint,
//         controlPoint,
//         endPoint
//       );
//       // 合并box
//       nowBox = mergeRectBox(nowBox, qbBox);
//       // 下一个二次贝塞尔曲线的起始点等于上一个的结束点
//       beginPoint = endPoint;
//     }
//     return nowBox;
//   }
//
//   /**
//    * @责任人：zxh
//    * @方法名：getSavePath
//    * @方法描述：顶层父类对注释点位信息进行预处理
//    * @入参：points：注释点位列表
//    * @返回值：返回偏移后的单位为毫米的注释点位数据
//    * @修改时间：2024.1.18
//    * @修改类型（新增、删除、修改等）：新增
//    * @修改描述：
//    * */
//   getSavePath(points = this.points) {
//     let box = this.getBox();
//     let mmPoints = setScaleOffsetPoints(this.points, 1.0, this.offset);
//     mmPoints.forEach(point => {
//       if (point !== null) {
//         point.x = unitEx.pxConversionMm(point.x - box.left);
//         point.y = unitEx.pxConversionMm(point.y - box.top);
//       }
//     });
//     return mmPoints;
//   }
//
//   /**
//    * @责任人：zxh
//    * @方法名：getSaveBox
//    * @方法描述：将注释的box转为毫米单位
//    * @入参：无
//    * @返回值：返回单位为毫米的注释box数据
//    * @修改时间：2024.1.18
//    * @修改类型（新增、删除、修改等）：新增
//    * @修改描述：
//    * */
//   getSaveBox() {
//     let box = this.getBox();
//     return {
//       x: unitEx.pxConversionMm(box.left),
//       y: unitEx.pxConversionMm(box.top),
//       width: unitEx.pxConversionMm(box.right - box.left),
//       height: unitEx.pxConversionMm(box.bottom - box.top),
//     }
//   }
//
//   /**
//    * @责任人：zxh
//    * @方法名：setIsAbleMove
//    * @方法描述：设置注释是否可以移动
//    * @入参：无
//    * @返回值：无
//    * @修改时间：2024.1.29
//    * @修改类型（新增、删除、修改等）：新增
//    * @修改描述：
//    * */
//   setIsAbleMove() {
//     // 能够移动的注释类型，1：直线，2：矩形，7：签批，20：文本框
//     // const ableMoveType = [1, 2，7，20];
//     // 不能移动的注释类型，9：高亮，10：下划线，11：波浪线，12：删除线
//     const unAbleMoveTYpe = [9, 10, 11, 12, 30];
//     if (unAbleMoveTYpe.includes(this.type)) {
//       this.isAbleMove = false;
//     }
//   }
//
//   save() {
//     this.offset.saveX = 0;
//     this.offset.saveY = 0;
//   }
// }
//
// export class AnnoFile extends SceneNew {
//   draw(ctx, scale, param) {
//     this.drawCanvasByPath(ctx, scale, param);
//   }
//
//   getBox(scale = 1.0) {
//     let zoomBox = {
//       left: this.box.left + this.offset.x,
//       top: this.box.top + this.offset.y,
//       right: this.box.right + this.offset.x,
//       bottom: this.box.bottom + this.offset.y,
//     }
//     // 进行缩放
//     return multiplyObjectProperties(zoomBox, scale);
//   }
//
//   drawCanvasByPath(ctx, scale, {path, text, property, url}) {
//     if (path) {
//       ctx.save();
//       const box = this.getBox(scale)
//       ctx.translate(box.left, box.top);
//       // 设置画笔颜色，线宽
//       if (this.stroke) {
//         ctx.strokeStyle = this.annoLineColor;
//         ctx.lineWidth = this.annoLineWidth * scale;
//       }
//       if (this.fill) {
//         ctx.fillStyle = this.annoFillColor;
//       }
//       // 开始这条路径
//       ctx.beginPath();
//       let pathArray = splitPath(path);
//       pathArray.forEach(aPath => {
//         const pathType = aPath[0];
//         const points = aPath.slice(1);
//         drawPath(ctx, pathType, points, scale);
//       });
//       ctx.stroke();
//       ctx.restore();
//     }
//   }
// }
//
// /**
//  * 一般注释
//  */
// class CommonAnno extends SceneNew {
//   /**
//    * @责任人：zxh
//    * @方法名：draw
//    * @方法描述：绘制注释入口
//    * @入参：ctx：画布上下文， scale：当前缩放比， points：注释点位数组默认为当前注释对象所保存的点位数组
//    * @返回值：返回基类方法结果
//    * @修改时间：2023.1.17
//    * @修改类型（新增、删除、修改等）：新增
//    * @修改描述：
//    * */
//   draw(ctx, scale, points = this.points) {
//     return super.draw(ctx, scale, points);
//   }
//
//   /**
//    * @责任人：zxh
//    * @方法名：getBox
//    * @方法描述：获取当前缩放比下直线注释外接box，重写基类方法
//    * @入参：scale：缩放比
//    * @返回值：返回缩放后的box信息
//    * @修改时间：2023.12.29
//    * @修改类型（新增、删除、修改等）：新增
//    * @修改描述：
//    * */
//   getBox(scale = 1.0) {
//     // box不存在进行计算
//     if (super.getBox() === null) {
//       this.box = this.updateCommonAnnoBox();
//     }
//     let zoomBox = {
//       left: this.box.left + this.offset.x,
//       top: this.box.top + this.offset.y,
//       right: this.box.right + this.offset.x,
//       bottom: this.box.bottom + this.offset.y,
//     }
//     // 进行缩放
//     return multiplyObjectProperties(zoomBox, scale);
//   }
//
//   /**
//    * @责任人：zxh
//    * @方法名：getSavePath
//    * @方法描述：过渡父类无需处理
//    * @入参：points：注释点位列表
//    * @返回值：返回偏移后的单位为毫米的注释点位数据
//    * @修改时间：2024.1.18
//    * @修改类型（新增、删除、修改等）：新增
//    * @修改描述：
//    * */
//   getSavePath(points = this.points) {
//     return super.getSavePath(points);
//   }
// }
//
// /**
//  * 直线注释
//  */
// export class AnnoLine extends CommonAnno {
//
//   /**
//    * @责任人：zxh
//    * @方法名：draw
//    * @方法描述：绘制直线注释入口，重写注释基类方法
//    * @入参：ctx：画布上下文， scale：当前缩放比默认为1.0， points：注释点位数组默认为当前注释对象所保存的点位数组
//    * @返回值：无
//    * @修改时间：2023.12.29
//    * @修改类型（新增、删除、修改等）：新增
//    * @修改描述：
//    * */
//   draw(ctx, scale = 1.0, points = this.points) {
//     // 调用基类方法
//     if (super.draw(ctx, scale, points) === null) {
//       return;
//     }
//     // 绘制直线注释
//     this.drawLine(ctx, points, scale);
//   }
//
//   /**
//    * @责任人：zxh
//    * @方法名：drawLine
//    * @方法描述：绘制直线
//    * @入参：ctx：canvas绘制对象，points：注释点位信息， scale：缩放比
//    * @返回值：
//    * @修改时间：2023.8.15
//    * @修改类型（新增、删除、修改等）：新增
//    * @修改描述：
//    * */
//   drawLine(ctx, points, scale) {
//     ctx.save();
//     ctx.strokeStyle = this.annoLineColor;
//     ctx.lineWidth = this.annoLineWidth * scale;
//     // 开始这条路径
//     ctx.beginPath();
//     // 移动到起始点
//     ctx.moveTo(points[0].x + 0.5, points[0].y);
//     ctx.lineTo(points[1].x + 0.5, points[1].y);
//     // 画线
//     ctx.stroke();
//     ctx.restore();
//   }
//
//   /**
//    * @责任人：zxh
//    * @方法名：getSavePath
//    * @方法描述：获取直线注释所对应的path
//    * @入参：points：注释点位列表
//    * @返回值：返回偏移后的单位为毫米的注释点位数据
//    * @修改时间：2024.1.18
//    * @修改类型（新增、删除、修改等）：新增
//    * @修改描述：
//    * */
//   getSavePath(points = this.points) {
//     let mmPoints = super.getSavePath(points);
//     // 拼接绘制注释字符串
//     let strPath = `S 0 0 `;
//     for (let i = 0; i < mmPoints.length; i += 2) {
//       strPath += `M ${mmPoints[i].x} ${mmPoints[i].y} `;
//       strPath += `L ${mmPoints[i + 1].x} ${mmPoints[i + 1].y} `;
//     }
//     return strPath.trim();
//   }
// }
//
// /**
//  * 矩形注释
//  */
// export class AnnoRect extends CommonAnno {
//   /**
//    * @责任人：zxh
//    * @方法名：draw
//    * @方法描述：绘制矩形注释入口，重写注释基类方法
//    * @入参：ctx：画布上下文， scale：当前缩放比默认为1.0， points：注释点位数组默认为当前注释对象所保存的点位数组
//    * @返回值：无
//    * @修改时间：2023.12.29
//    * @修改类型（新增、删除、修改等）：新增
//    * @修改描述：
//    * */
//   draw(ctx, scale = 1.0, points = this.points) {
//     // 调用基类方法
//     if (super.draw(ctx, scale, points) === null) {
//       return;
//     }
//     // 绘制矩形注释
//     this.drawRectangle(ctx, points, scale);
//   }
//
//   /**
//    * @责任人：zxh
//    * @方法名：drawRectangle
//    * @方法描述：绘制矩形
//    * @入参：ctx：canvas绘制对象，points：注释点位信息， scale：缩放比
//    * @返回值：
//    * @修改时间：2023.8.15
//    * @修改类型（新增、删除、修改等）：新增
//    * @修改描述：
//    * */
//   drawRectangle(ctx, points, scale) {
//     ctx.save();
//     // 设置画笔颜色，线宽
//     ctx.strokeStyle = this.annoLineColor;
//     ctx.lineWidth = this.annoLineWidth * scale;
//     // 开始这条路径
//     ctx.beginPath();
//     // 移动到起始点
//     ctx.moveTo(points[0].x, points[0].y);
//     ctx.lineTo(points[1].x, points[1].y);
//     ctx.lineTo(points[2].x, points[2].y);
//     ctx.lineTo(points[3].x, points[3].y);
//     ctx.lineTo(points[0].x, points[0].y);
//     // 画线
//     ctx.stroke();
//     ctx.restore();
//   }
//
//   /**
//    * @责任人：zxh
//    * @方法名：getSavePath
//    * @方法描述：获取矩形注释所对应的path
//    * @入参：points：注释点位列表
//    * @返回值：返回偏移后的单位为毫米的注释点位数据
//    * @修改时间：2024.1.18
//    * @修改类型（新增、删除、修改等）：新增
//    * @修改描述：
//    * */
//   getSavePath(points = this.points) {
//     let mmPoints = super.getSavePath(points);
//     // 拼接绘制注释字符串
//     let strPath = `S 0 0 `;
//     for (let i = 0; i < mmPoints.length; i += 4) {
//       strPath += `M ${mmPoints[i].x} ${mmPoints[i].y} `;
//       strPath += `L ${mmPoints[i + 1].x} ${mmPoints[i + 1].y} `;
//       strPath += `L ${mmPoints[i + 2].x} ${mmPoints[i + 2].y} `;
//       strPath += `L ${mmPoints[i + 3].x} ${mmPoints[i + 3].y} `;
//       strPath += `L ${mmPoints[i].x} ${mmPoints[i].y} `;
//     }
//     return strPath.trim();
//   }
//
// }
//
// export class PageMask extends CommonAnno {
//   /**
//    * @责任人：zxh
//    * @方法名：draw
//    * @方法描述：绘制页面遮罩入口，重写注释基类方法
//    * @入参：ctx：画布上下文， scale：当前缩放比默认为1.0， points：注释点位数组默认为当前注释对象所保存的点位数组
//    * @返回值：无
//    * @修改时间：2024.06.28
//    * @修改类型（新增、删除、修改等）：新增
//    * @修改描述：
//    * */
//   draw(ctx, scale = 1.0, points = this.points) {
//     // 调用基类方法
//     if (super.draw(ctx, scale, points) === null) {
//       return;
//     }
//     // 绘制页面遮罩
//     this.drawPageMask(ctx, points, scale);
//   }
//
//   /**
//    * @责任人：zxh
//    * @方法名：drawPageMask
//    * @方法描述：绘制页面遮罩
//    * @入参：ctx：canvas绘制对象，points：注释点位信息， scale：缩放比
//    * @返回值：
//    * @修改时间：2024.6.28
//    * @修改类型（新增、删除、修改等）：新增
//    * @修改描述：
//    * */
//   drawPageMask(ctx, points, scale) {
//     ctx.save();
//     // 设置画笔颜色，线宽
//     ctx.strokeStyle = this.annoLineColor;
//     ctx.fillStyle = this.annoLineColor;
//     ctx.lineWidth = this.annoLineWidth * scale;
//     // 开始这条路径
//     ctx.beginPath();
//     // 移动到起始点
//     ctx.moveTo(points[0].x, points[0].y);
//     ctx.lineTo(points[1].x, points[1].y);
//     ctx.lineTo(points[2].x, points[2].y);
//     ctx.lineTo(points[3].x, points[3].y);
//     ctx.lineTo(points[0].x, points[0].y);
//     const {x, y, width, height} = getBoxStartAndWH(points);
//     ctx.fillRect(x, y, width, height);
//     // 画线
//     ctx.stroke();
//     ctx.restore();
//   }
// }
//
// export class PrintMask extends CommonAnno {
//   /**
//    * @责任人：zxh
//    * @方法名：draw
//    * @方法描述：绘制打印掩膜入口，重写注释基类方法
//    * @入参：ctx：画布上下文， scale：当前缩放比默认为1.0， points：注释点位数组默认为当前注释对象所保存的点位数组
//    * @返回值：无
//    * @修改时间：2024.07.01
//    * @修改类型（新增、删除、修改等）：新增
//    * @修改描述：
//    * */
//   draw(ctx, scale = 1.0, points = this.points) {
//     // 调用基类方法
//     if (super.draw(ctx, scale, points) === null) {
//       return;
//     }
//     // 绘制打印掩膜
//     this.drawPrintMask(ctx, points, scale);
//   }
//
//   /**
//    * @责任人：zxh
//    * @方法名：drawPrintMask
//    * @方法描述：绘制打印掩膜
//    * @入参：ctx：canvas绘制对象，points：注释点位信息， scale：缩放比
//    * @返回值：
//    * @修改时间：2024.07.01
//    * @修改类型（新增、删除、修改等）：新增
//    * @修改描述：
//    * */
//   drawPrintMask(ctx, points, scale) {
//     ctx.save();
//     // 设置画笔颜色，线宽
//     ctx.strokeStyle = this.annoLineColor;
//     ctx.lineWidth = this.annoLineWidth * scale;
//     // 开始这条路径
//     ctx.beginPath();
//     // 移动到起始点
//     ctx.moveTo(points[0].x, points[0].y);
//     ctx.lineTo(points[1].x, points[1].y);
//     ctx.lineTo(points[2].x, points[2].y);
//     ctx.lineTo(points[3].x, points[3].y);
//     ctx.lineTo(points[0].x, points[0].y);
//
//     // 绘制文字
//     ctx.font = `${20 * scale}px Arial`;
//     ctx.textAlign = 'center';
//     ctx.textBaseline = 'middle';
//     ctx.fillStyle = this.annoLineColor;
//     const {x, y, width, height} = getBoxStartAndWH(points);
//     ctx.fillText("Print", x + width / 2, y + height / 2);
//     // 画线
//     ctx.stroke();
//     ctx.restore();
//   }
// }
//
// /**
//  * 手型注释
//  */
// export class AnnoHand extends SceneNew {
//
//   /**
//    * @责任人：zxh
//    * @方法名：draw
//    * @方法描述：绘制手型注释入口，重写注释基类方法
//    * @入参：ctx：画布上下文， scale：当前缩放比默认为1.0， points：注释点位数组默认为当前注释对象所保存的点位数组
//    * @返回值：无
//    * @修改时间：2023.12.29
//    * @修改类型（新增、删除、修改等）：新增
//    * @修改描述：
//    * */
//   draw(ctx, scale = 1.0, points = this.points) {
//     // 调用基类方法
//     if (super.draw(ctx, scale, points) === null) {
//       return null;
//     }
//     // 绘制手型注释
//     this.drawLineQuadratic(ctx, points, scale);
//   }
//
//   /**
//    * @责任人：zxh
//    * @方法名：getBox
//    * @方法描述：获取当前缩放比下签批注释外接box，重写基类方法
//    * @入参：scale：缩放比
//    * @返回值：返回缩放后的box信息
//    * @修改时间：2024.1.2
//    * @修改类型（新增、删除、修改等）：新增
//    * @修改描述：
//    * */
//   getBox(scale = 1.0) {
//     // box不存在进行计算
//     if (super.getBox() === null) {
//       this.box = this.updateQuadraticAnnoBox();
//     }
//     let zoomBox = {
//       left: this.box.left + this.offset.x,
//       top: this.box.top + this.offset.y,
//       right: this.box.right + this.offset.x,
//       bottom: this.box.bottom + this.offset.y,
//     }
//     // 进行缩放
//     return multiplyObjectProperties(zoomBox, scale);
//   }
//
//   /**
//    * @责任人：zxh
//    * @方法名：drawLineQuadratic
//    * @方法描述：绘制二次贝塞尔曲线
//    * @入参：ctx：canvas绘制对象，points：注释点位信息， scale：缩放比
//    * @返回值：
//    * @修改时间：2023.7.10
//    * @修改类型（新增、删除、修改等）：修改
//    * @修改描述：更改canvas的id为注释递增的ID-修改画线颜色线宽
//    * */
//   drawLineQuadratic(ctx, points, scale) {
//     let beginPoint = points[0];
//     for (let i = 1; i < points.length; i += 2) {
//       let controlPoint = points[i];
//       if (controlPoint === undefined) {
//         controlPoint = beginPoint;
//       }
//       let endPoint = points[i + 1];
//       if (endPoint === undefined) {
//         endPoint = controlPoint;
//       }
//
//       // 设置线条颜色等
//       ctx.strokeStyle = this.annoLineColor;
//       ctx.lineWidth = this.annoLineWidth * scale;
//       ctx.lineJoin = "round";
//       ctx.lineCap = "round";
//       // 开始这条路径
//       ctx.beginPath();
//       // 移动到起始点
//       ctx.moveTo(beginPoint.x, beginPoint.y);
//       // 二次贝塞尔曲线
//       ctx.quadraticCurveTo(controlPoint.x, controlPoint.y, endPoint.x, endPoint.y);
//       // 画线
//       ctx.stroke();
//       beginPoint = endPoint;
//     }
//   }
//
//   /**
//    * @责任人：zxh
//    * @方法名：getSavePath
//    * @方法描述：获取签批注释所对应的path
//    * @入参：points：注释点位列表
//    * @返回值：返回偏移后的单位为毫米的注释点位数据
//    * @修改时间：2024.3.15
//    * @修改类型（新增、删除、修改等）：新增
//    * @修改描述：
//    * */
//   getSavePath(points = this.points) {
//     let mmPoints = super.getSavePath(points);
//     // 拼接绘制注释字符串
//     let strPath = `S 0 0 M ${mmPoints[0].x} ${mmPoints[0].y} `;
//     for (let i = 1; i < mmPoints.length; i += 2) {
//       strPath += `Q ${mmPoints[i].x} ${mmPoints[i].y} `;
//       if (i + 1 < mmPoints.length) {
//         strPath += `${mmPoints[i + 1].x} ${mmPoints[i + 1].y} `;
//       } else {
//         strPath += `${mmPoints[i].x} ${mmPoints[i].y} `;
//       }
//     }
//     return strPath.trim();
//   }
// }
//
// /**
//  * 文本框注释
//  */
// export class AnnoTextBox extends AnnoRect {
//
//   text = null;  // 文本框注释内的文本
//
//   /**
//    * @责任人：zxh
//    * @方法名：draw
//    * @方法描述：绘制文本框注释入口，重写注释基类方法
//    * @入参：ctx：画布上下文， scale：当前缩放比默认为1.0， points：注释点位数组默认为当前注释对象所保存的点位数组
//    * @返回值：无
//    * @修改时间：2023.12.29
//    * @修改类型（新增、删除、修改等）：新增
//    * @修改描述：
//    * */
//   draw(ctx, scale = 1.0, points = this.points) {
//     // 调用基类方法
//     super.draw(ctx, scale, points);
//     // 绘制矩形注释
//     if (this.text !== null) {
//       // this.text = this.text.replaceAll("\n", "");
//       this.drawText(ctx, scale);
//     }
//   }
//
//   /**
//    * @责任人：zxh
//    * @方法名：drawText
//    * @方法描述：绘制文本框的文字
//    * @入参：ctx：画布上下文， scale：缩放比， text：文本框内的文字
//    * @返回值：
//    * @修改时间：2023.9.19
//    * @修改类型（新增、删除、修改等）：新增
//    * @修改描述：
//    * */
//   drawText(ctx, scale, text = this.text) {
//     const box = this.getBox(scale);
//     const width = box.right - box.left - 2;
//     let textArray = text.split("\n");
//
//     // 获取文本宽度
//     const getWidth = (text) => {
//       let span = document.createElement("span");
//       span.innerText = text;
//       span.style.font = `${15 * scale}px serif`;
//       document.body.appendChild(span);
//       let width = span.offsetWidth;
//       document.body.removeChild(span);
//       return width;
//     }
//
//     // 获取文本应该截断的位置
//     const getI = (text, maxWidth) => {
//       let ids = []
//       if (getWidth(text) > maxWidth) {
//         let i = 0;
//         let j = text.length;
//         while (i < text.length) {
//           let temp = text.slice(i, j);
//           if (getWidth(temp) > maxWidth) {
//             j = Math.floor((j + i) / 2);
//           } else {
//             if (j === text.length) {
//               ids.push(j);
//               i = j;
//             } else {
//               for (; j < text.length; j++) {
//                 temp += text[j];
//                 if (getWidth(temp) > maxWidth) {
//                   ids.push(j);
//                   i = j;
//                   j = text.length;
//                   break;
//                 }
//               }
//             }
//           }
//         }
//       }
//       return ids;
//     }
//
//     // 将原文本进行分行
//     let i = 0;
//     while (i < textArray.length) {
//       let temp = textArray[i];
//       let ids = getI(temp, width);
//       if (ids.length !== 0) {
//         textArray.splice(i, 1);
//         for (let j = 0; j < ids.length; j++) {
//           let start = j === 0 ? 0 : ids[j - 1];
//           let end = ids[j];
//           let splitText = temp.slice(start, end);
//           textArray.splice(i, 0, splitText);
//           i++;
//         }
//       } else {
//         i++;
//       }
//     }
//     // 获取canvas
//     ctx.font = `${15 * scale}px 黑体`;
//     const linHeight = 17 * scale;
//     textArray.forEach((t, index) => {
//       ctx.fillText(t, box.left + 3, box.top + linHeight * (index + 1));
//     })
//   }
// }
//
// /**
//  * 高亮注释
//  */
// export class AnnoHighLight extends CommonAnno {
//   /**
//    * @责任人：zxh
//    * @方法名：draw
//    * @方法描述：绘制高亮注释入口，重写注释基类方法
//    * @入参：ctx：画布上下文， scale：当前缩放比默认为1.0， points：注释点位数组默认为当前注释对象所保存的点位数组
//    * @返回值：无
//    * @修改时间：2024.01.25
//    * @修改类型（新增、删除、修改等）：新增
//    * @修改描述：
//    * */
//   draw(ctx, scale = 1.0, points = this.points) {
//     // 调用基类方法
//     if (super.draw(ctx, scale, points) === null) {
//       return;
//     }
//     // 绘制高亮注释
//     this.drawHighLight(ctx, points, scale);
//     // this.drawHighLight1(ctx, points, scale);
//   }
//
//   /**
//    * @责任人：zxh
//    * @方法名：setPoints
//    * @方法描述：根据文字box列表计算获取所要绘制的点位数据
//    * @入参：boxList：文字box列表
//    * @返回值：返回获取的注释点位数据
//    * @修改时间：2024.01.26
//    * @修改类型（新增、删除、修改等）：新增
//    * @修改描述：
//    * */
//   setPoints(boxList) {
//     boxList.forEach(box => {
//       this.points.push({ x: box.left, y: box.top });
//       this.points.push({x: box.right, y: box.top});
//       this.points.push({ x: box.right, y: box.bottom });
//       this.points.push({x: box.left, y: box.bottom});
//     })
//     return this.points;
//   }
//
//   /**
//    * @责任人：zxh
//    * @方法名：drawHighLight
//    * @方法描述：绘制高亮
//    * @入参：ctx：canvas绘制对象，points：注释点位信息， scale：缩放比
//    * @返回值：
//    * @修改时间：2024.01.25
//    * @修改类型（新增、删除、修改等）：新增
//    * @修改描述：
//    * */
//   drawHighLight1(ctx, points, scale) {
//     ctx.save();
//     // 设置画笔颜色，线宽
//     ctx.strokeStyle = "rgba(255, 237, 0, 0.5)";
//     ctx.fillStyle = "rgba(255, 237, 0, 0.5)";
//     ctx.lineWidth = unitEx.mmConversionPx(0.265) * scale;
//     // 开始这条路径
//     ctx.beginPath();
//     for (let i = 0; i < points.length; i += 4) {
//       // 移动到起始点
//       ctx.moveTo(points[i].x, points[i].y);
//       ctx.lineTo(points[i + 1].x, points[i + 1].y);
//       ctx.lineTo(points[i + 2].x, points[i + 2].y);
//       ctx.lineTo(points[i + 3].x, points[i + 3].y);
//       ctx.closePath();
//       ctx.fillRect(points[i].x, points[i].y, Math.abs(points[i + 2].x - points[i].x), Math.abs(points[i + 2].y - points[i].y));
//     }
//     // 画线
//     ctx.stroke();
//     ctx.restore();
//   }
//
//   /**
//    * @责任人：zxh
//    * @方法名：drawHighLight
//    * @方法描述：绘制高亮
//    * @入参：ctx：canvas绘制对象，points：注释点位信息， scale：缩放比
//    * @返回值：
//    * @修改时间：2024.03.22
//    * @修改类型（新增、删除、修改等）：新增
//    * @修改描述：
//    * */
//   drawHighLight(ctx, points, scale) {
//     const divideArea = (area, stepWidth, stepHeight) => {
//       const { left, top, width, height } = area;
//       const divisions = [];
//
//       // 计算可以分割成多少个区块
//       const numRows = Math.ceil(width / stepWidth);
//       const numColumns = Math.ceil(height / stepHeight);
//
//       // 循环创建区块
//       for (let y = 0; y < numColumns; y++) {
//         for (let x = 0; x < numRows; x++) {
//           const xStart = left + x * stepWidth;
//           const yStart = top + y * stepHeight;
//           const xEnd = x === numRows - 1 ? left + width : left + (x + 1) * stepWidth;
//           const yEnd = y === numColumns - 1 ? top + height : top + (y + 1) * stepHeight;
//
//           divisions.push({
//             // x: Math.round((xStart) * 100) / 100,
//             // y: Math.round((yStart) * 100) / 100,
//             // width: Math.round((xEnd - xStart) * 100) / 100,
//             // height: Math.round((yEnd - yStart) * 100) / 100
//             x: xStart - 1,
//             y: yStart - 1,
//             width: xEnd - xStart,
//             height: yEnd - yStart
//           });
//         }
//       }
//       return divisions;
//     }
//
//     const isSample = (objRGBA, standardRGBA) => {
//       const tolerance = 20;  // 容差率
//       const [sR, sG, sB, sA] = standardRGBA;
//       const [oR, oG, oB, oA] = objRGBA;
//       const simple = Math.sqrt((oR - sR) ** 2 + (oG - sG) ** 2 + (oB - sB) ** 2 + (oA - sA) ** 2);
//       return simple < tolerance;
//     }
//
//     const inRect = ({ x, y }, points) => {
//       for (let i = 0; i < points.length; i += 2) {
//         if (x >= points[i].x && y >= points[i].y && x <= points[i + 1].x && y <= points[i + 1].y) {
//           return true;
//         }
//       }
//       return false;
//     }
//
//     const handleImageData = (area) => {
//       let { x, y, width, height } = area;
//       if (width <= 1 || height <= 1) {
//         return null;
//       }
//       const bgImgData = this.bgCtx.getImageData(x, y, width, height);
//       const annoImgData = ctx.getImageData(x, y, width, height);
//       let r, g, b, a;
//       for (let i = 0; i < annoImgData.data.length; i += 4) {
//         r = annoImgData.data[i];
//         g = annoImgData.data[i + 1];
//         b = annoImgData.data[i + 2];
//         a = annoImgData.data[i + 3];
//         const aT = isSample([r, g, b, a], [0, 0, 0, 0]);
//         r = bgImgData.data[i];
//         g = bgImgData.data[i + 1];
//         b = bgImgData.data[i + 2];
//         a = bgImgData.data[i + 3];
//         const tT = isSample([r, g, b, a], [255, 255, 255, 255]);
//         if (aT && tT) {
//           annoImgData.data[i] = 255;
//           annoImgData.data[i + 1] = 237;
//           annoImgData.data[i + 2] = 0;
//           annoImgData.data[i + 3] = 255;
//         }
//       }
//       ctx.putImageData(annoImgData, x, y);
//     }
//     const box = this.getBox(scale);
//     for (let i = 0; i < points.length; i += 4) {
//       const subPoints = points.slice(i, i + 4);
//       const pointBox = this.updateCommonAnnoBox(subPoints);
//       const drawBox = calculateOverlap(pointBox, box);
//       if (drawBox !== null) {
//         handleImageData({x: drawBox.left, y: drawBox.top, width: drawBox.right - drawBox.left, height: drawBox.bottom - drawBox.top});
//       }
//     }
//     this.bgCtx = undefined;
//   }
//
//   /**
//    * @责任人：zxh
//    * @方法名：getSavePath
//    * @方法描述：获取高亮注释所对应的path
//    * @入参：points：注释点位列表
//    * @返回值：返回偏移后的单位为毫米的注释点位数据
//    * @修改时间：2024.1.30
//    * @修改类型（新增、删除、修改等）：新增
//    * @修改描述：
//    * */
//   getSavePath(points = this.points) {
//     let mmPoints = super.getSavePath(points);
//     // 拼接绘制注释字符串
//     let strPath = `S 0 0 `;
//     for (let i = 0; i < mmPoints.length; i += 4) {
//       strPath += `M ${mmPoints[i].x} ${mmPoints[i].y} `;
//       strPath += `L ${mmPoints[i + 1].x} ${mmPoints[i + 1].y} `;
//       strPath += `L ${mmPoints[i + 2].x} ${mmPoints[i + 2].y} `;
//       strPath += `L ${mmPoints[i + 3].x} ${mmPoints[i + 3].y} `;
//       strPath += `L ${mmPoints[i].x} ${mmPoints[i].y} `;
//     }
//     return strPath.trim();
//   }
// }
//
// /**
//  * 下划线
//  */
// export class AnnoUnderLine extends CommonAnno {
//   /**
//    * @责任人：zxh
//    * @方法名：draw
//    * @方法描述：绘制下划线注释入口，重写注释基类方法
//    * @入参：ctx：画布上下文， scale：当前缩放比默认为1.0， points：注释点位数组默认为当前注释对象所保存的点位数组
//    * @返回值：无
//    * @修改时间：2024.01.26
//    * @修改类型（新增、删除、修改等）：新增
//    * @修改描述：
//    * */
//   draw(ctx, scale = 1.0, points = this.points) {
//     // 调用基类方法
//     if (super.draw(ctx, scale, points) === null) {
//       return;
//     }
//     // 绘制下划线注释
//     this.drawUnderLine(ctx, points, scale);
//   }
//
//   /**
//    * @责任人：zxh
//    * @方法名：setPoints
//    * @方法描述：根据文字box列表计算获取所要绘制的点位数据
//    * @入参：boxList：文字box列表
//    * @返回值：返回获取的注释点位数据
//    * @修改时间：2024.01.26
//    * @修改类型（新增、删除、修改等）：新增
//    * @修改描述：
//    * */
//   setPoints(boxList) {
//     boxList.forEach(box => {
//       this.points.push({ x: box.left, y: box.bottom });
//       this.points.push({ x: box.right, y: box.bottom });
//     })
//     return this.points;
//   }
//
//   /**
//    * @责任人：zxh
//    * @方法名：drawUnderLine
//    * @方法描述：绘制下划线
//    * @入参：ctx：canvas绘制对象，points：注释点位信息， scale：缩放比
//    * @返回值：
//    * @修改时间：2024.01.26
//    * @修改类型（新增、删除、修改等）：新增
//    * @修改描述：
//    * */
//   drawUnderLine(ctx, points, scale) {
//     ctx.save();
//
//     const {left, top, right, bottom} = this.getBox(scale);
//     clipBox(ctx, {x: left, y: top, width: right - left, height: bottom - top});
//
//     // 设置画笔颜色，线宽
//     ctx.strokeStyle = "rgb(109, 235, 109)";
//     ctx.lineWidth = unitEx.mmConversionPx(0.265) * scale;
//     // 开始这条路径
//     ctx.beginPath();
//     for (let i = 0; i < points.length; i += 2) {
//       // 移动到起始点
//       ctx.moveTo(points[i].x, points[i].y);
//       // ctx.moveTo(0, 0);
//       ctx.lineTo(points[i + 1].x, points[i + 1].y);
//     }
//     // 画线
//     ctx.stroke();
//     ctx.restore();
//   }
//
//   /**
//    * @责任人：zxh
//    * @方法名：getSavePath
//    * @方法描述：获取下划线注释所对应的path
//    * @入参：points：注释点位列表
//    * @返回值：返回偏移后的单位为毫米的注释点位数据
//    * @修改时间：2024.1.30
//    * @修改类型（新增、删除、修改等）：新增
//    * @修改描述：
//    * */
//   getSavePath(points = this.points) {
//     let mmPoints = super.getSavePath(points);
//     // 拼接绘制注释字符串
//     let strPath = `S 0 0 `;
//     for (let i = 0; i < mmPoints.length; i += 2) {
//       strPath += `M ${mmPoints[i].x} ${mmPoints[i].y} `;
//       strPath += `L ${mmPoints[i + 1].x} ${mmPoints[i + 1].y} `;
//     }
//     return strPath.trim();
//   }
// }
//
// /**
//  * 波浪线
//  */
// export class AnnoWavyUnderLine extends CommonAnno {
//   /**
//    * @责任人：zxh
//    * @方法名：draw
//    * @方法描述：绘制波浪线注释入口，重写注释基类方法
//    * @入参：ctx：画布上下文， scale：当前缩放比默认为1.0， points：注释点位数组默认为当前注释对象所保存的点位数组
//    * @返回值：无
//    * @修改时间：2024.01.29
//    * @修改类型（新增、删除、修改等）：新增
//    * @修改描述：
//    * */
//   draw(ctx, scale = 1.0, points = this.points) {
//     // 调用基类方法
//     if (super.draw(ctx, scale, points) === null) {
//       return;
//     }
//     // 绘制波浪线注释
//     this.drawWavyUnderLine(ctx, points, scale);
//   }
//
//   /**
//    * @责任人：zxh
//    * @方法名：setPoints
//    * @方法描述：根据所选文字范围设置对应的绘制点位信息
//    * @入参：boxList：文本范围列表
//    * @返回值：所需点位数组
//    * @修改时间：2024.01.29
//    * @修改类型（新增、删除、修改等）：新增
//    * @修改描述：
//    * */
//   setPoints(boxList) {
//     // 绘制波浪线所需的二次贝塞尔曲线的每次偏移量
//     const offsetX = unitEx.mmConversionPx(0.4142);
//     const offsetY = unitEx.mmConversionPx(0.7875);
//     // 遍历文字box，计算所需的点位信息
//     boxList.forEach((box, index) => {
//       // 每段波浪线的初始曲线点位
//       this.points.push({ x: box.left, y: box.bottom });
//       this.points.push({ x: box.left, y: box.bottom });
//       this.points.push({ x: box.left + offsetX, y: box.bottom + offsetY });
//       // 每段波浪线中循环显示的部分曲线点位
//       let i = 2;
//       while (box.left + (i + 2) * offsetX <= box.right) {
//         // 第一段曲线
//         this.points.push({ x: box.left + i * offsetX, y: box.bottom + 2 * offsetY });
//         this.points.push({ x: box.left + (i + 1) * offsetX, y: box.bottom + offsetY });
//         // 第二段曲线
//         this.points.push({ x: box.left + (i + 1) * offsetX, y: box.bottom });
//         this.points.push({ x: box.left + (i + 2) * offsetX, y: box.bottom + offsetY });
//         i += 3;
//       }
//       // 每行波浪线结束时的标志点位
//       if (index !== boxList.length - 1) {
//         this.points.push(null);
//       }
//     })
//     return this.points;
//   }
//
//   /**
//    * @责任人：zxh
//    * @方法名：drawWavyUnderLine
//    * @方法描述：绘制波浪线
//    * @入参：ctx：canvas绘制对象，points：注释点位信息， scale：缩放比
//    * @返回值：
//    * @修改时间：2024.01.29
//    * @修改类型（新增、删除、修改等）：新增
//    * @修改描述：
//    * */
//   drawWavyUnderLine(ctx, points, scale) {
//     ctx.save();
//     // 设置画笔颜色，线宽
//     ctx.strokeStyle = "rgb(109, 235, 109)";
//     ctx.lineWidth = unitEx.mmConversionPx(0.265) * scale;
//     // 开始这条路径
//     ctx.beginPath();
//     // 循环绘制
//     let i = 0;
//     while (i < points.length) {
//       // 每行波浪线开始位置
//       ctx.moveTo(points[i].x, points[i].y);
//       i++;
//       // 循环绘制曲线直到每行结束标志位
//       while (i < points.length - 1 && points[i] !== null) {
//         ctx.quadraticCurveTo(points[i].x, points[i].y, points[i + 1].x, points[i + 1].y);
//         i += 2;
//       }
//       i++;
//     }
//     // 画线
//     ctx.stroke();
//     ctx.restore();
//   }
//
//   /**
//    * @责任人：zxh
//    * @方法名：getSavePath
//    * @方法描述：获取波浪线注释所对应的path
//    * @入参：points：注释点位列表
//    * @返回值：返回偏移后的单位为毫米的注释点位数据
//    * @修改时间：2024.1.30
//    * @修改类型（新增、删除、修改等）：新增
//    * @修改描述：
//    * */
//   getSavePath(points = this.points) {
//     let mmPoints = super.getSavePath(points);
//     // 拼接绘制注释字符串
//     let strPath = `S 0 0 M ${mmPoints[0].x} ${mmPoints[0].y} `;
//     for (let i = 1; i < mmPoints.length; i += 2) {
//       if (mmPoints[i] === null) {
//         strPath += `M ${mmPoints[i + 1].x} ${mmPoints[i + 1].y} `;
//         continue;
//       }
//       strPath += `Q ${mmPoints[i].x} ${mmPoints[i].y} `;
//       strPath += `${mmPoints[i + 1].x} ${mmPoints[i + 1].y} `;
//     }
//     return strPath.trim();
//   }
// }
//
// /**
//  * 删除线
//  */
// export class AnnoDeleteLine extends CommonAnno {
//   /**
//    * @责任人：zxh
//    * @方法名：draw
//    * @方法描述：绘制删除线注释入口，重写注释基类方法
//    * @入参：ctx：画布上下文， scale：当前缩放比默认为1.0， points：注释点位数组默认为当前注释对象所保存的点位数组
//    * @返回值：无
//    * @修改时间：2024.01.26
//    * @修改类型（新增、删除、修改等）：新增
//    * @修改描述：
//    * */
//   draw(ctx, scale = 1.0, points = this.points) {
//     // 调用基类方法
//     if (super.draw(ctx, scale, points) === null) {
//       return;
//     }
//     // 绘制删除线注释
//     this.drawDeleteLine(ctx, points, scale);
//   }
//
//   /**
//    * @责任人：zxh
//    * @方法名：setPoints
//    * @方法描述：根据所选文字范围设置对应的绘制点位信息
//    * @入参：boxList：文本范围列表
//    * @返回值：所需点位数组
//    * @修改时间：2024.01.26
//    * @修改类型（新增、删除、修改等）：新增
//    * @修改描述：
//    * */
//   setPoints(boxList) {
//     boxList.forEach(box => {
//       this.points.push({ x: box.left, y: (box.bottom + box.top) / 2 });
//       this.points.push({ x: box.right, y: (box.bottom + box.top) / 2 });
//     })
//     return this.points;
//   }
//
//   /**
//    * @责任人：zxh
//    * @方法名：drawDeleteLine
//    * @方法描述：绘制删除线
//    * @入参：ctx：canvas绘制对象，points：注释点位信息， scale：缩放比
//    * @返回值：
//    * @修改时间：2024.01.26
//    * @修改类型（新增、删除、修改等）：新增
//    * @修改描述：
//    * */
//   drawDeleteLine(ctx, points, scale) {
//     ctx.save();
//     // 设置画笔颜色，线宽
//     ctx.strokeStyle = "rgb(249, 66, 68)";
//     ctx.lineWidth = unitEx.mmConversionPx(0.265) * scale;
//     // 开始这条路径
//     ctx.beginPath();
//     for (let i = 0; i < points.length; i += 2) {
//       // 移动到起始点
//       ctx.moveTo(points[i].x, points[i].y);
//       ctx.lineTo(points[i + 1].x, points[i + 1].y);
//     }
//     // 画线
//     ctx.stroke();
//     ctx.restore();
//   }
//
//   /**
//    * @责任人：zxh
//    * @方法名：getSavePath
//    * @方法描述：获取删除线注释所对应的path
//    * @入参：points：注释点位列表
//    * @返回值：返回偏移后的单位为毫米的注释点位数据
//    * @修改时间：2024.1.30
//    * @修改类型（新增、删除、修改等）：新增
//    * @修改描述：
//    * */
//   getSavePath(points = this.points) {
//     let mmPoints = super.getSavePath(points);
//     // 拼接绘制注释字符串
//     let strPath = `S 0 0 `;
//     for (let i = 0; i < mmPoints.length; i += 2) {
//       strPath += `M ${mmPoints[i].x} ${mmPoints[i].y} `;
//       strPath += `L ${mmPoints[i + 1].x} ${mmPoints[i + 1].y} `;
//     }
//     return strPath.trim();
//   }
// }
//
// /**
//  * 图章注释
//  */
// export class AnnoStamp extends CommonAnno {
//
//   img = null;
//   stampUrl = null;
//
//   draw(ctx, scale = 1.0) {
//     if (this.stampUrl !== null) {
//       // 绘制图章注释
//       this.drawStamp(ctx, scale, this.stampUrl);
//     } else {
//       throw Error("未获取到图章注释");
//     }
//   }
//
//   drawStamp(ctx, scale, stampUrl) {
//
//     const drawImg = (ctx, scale, img) => {
//       const box = this.getBox(scale);
//       ctx.save();
//
//       let x = box.left;
//       let y = box.top;
//       let width = box.right - box.left;
//       let height = box.bottom - box.top;
//       ctx.drawImage(img, x, y, width, height);
//
//       ctx.restore();
//     }
//
//     if (this.img == null) {
//       ImageDraw(stampUrl).then(img => {
//         this.img = img;
//         drawImg(ctx, scale, this.img);
//       });
//     } else {
//       drawImg(ctx, scale, this.img);
//     }
//
//   }
//
//
// }
//
// /**
//  * 根据注释类型英文名获取注释中文名
//  * @param en_name
//  * @returns {string}
//  */
// export function getAnnoTypeName(en_name) {
//   switch (en_name) {
//     case "Path":
//       return "路径";
//     case "Highlight":
//       return "高亮";
//     case "Stamp":
//       return "橡皮图章"
//     default:
//       return en_name;
//   }
// }
//
// /**
//  * 根据注释子类型英文名获取注释中文名
//  * @param en_name
//  * @returns {string}
//  */
// export function getAnnoName(en_name) {
//   switch (en_name) {
//     case "Line":
//       return "直线";
//     case "Rectangle":
//       return "矩形";
//     case "Arrow":
//       return "箭头";
//     case "PolyLine":
//       return "折线";
//     case "Polygon":
//       return "多边形";
//     case "Oval":
//       return "椭圆";
//     case "TextNoteBox":
//       return "文本框";
//     case "CommentNoteBox":
//       return "注释框";
//     case "Highlight":
//       return "高亮";
//     case "UnderLine":
//       return "下划线";
//     case "WavyUnderLine":
//       return "波浪线";
//     case "DeleteLine":
//       return "删除线";
//     case "Hand":
//       return "签批";
//     case "Watermark":
//       return "水印"
//     case "Stamp":
//       return "图章"
//     default:
//       return en_name;
//   }
// }
//
// /**
//  * 根据注释类型数字获取注释对应的子类型
//  * @param annoType 注释类型
//  */
// export function getAnnoSubType(annoType) {
//   switch (annoType) {
//     case 1:
//       return "Line";
//     case 2:
//       return "Rectangle";
//     case 3:
//       return "Arrow";
//     case 4:
//       return "PolyLine";
//     case 5:
//       return "Polygon";
//     case 6:
//       return "Oval";
//     case 7:
//       return "Hand";
//     case 9:
//       return "Highlight";
//     case 10:
//       return "UnderLine";
//     case 11:
//       return "WavyUnderLine";
//     case 12:
//       return "DeleteLine";
//     case 20:
//       return "TextNoteBox";
//     default:
//       return undefined;
//   }
// }
//
// export function getAnnoType(annoType) {
//   switch (annoType) {
//     case 1:
//     case 2:
//     case 3:
//     case 4:
//     case 5:
//     case 6:
//     case 7:
//     case 10:
//     case 11:
//     case 12:
//     case 20:
//     case 21:
//       return "Path";
//     case 9:
//       return "Highlight";
//     default:
//       return undefined;
//   }
// }
//
// /**
//  * 对点位数组进行缩放偏移
//  * @param points
//  * @param scale
//  * @param offset
//  * @returns {*|*[]}
//  */
// export function setScaleOffsetPoints(points, scale, offset = { x: 0, y: 0 }) {
//   /*if (scale === 1 && offset.x === 0 && offset.y === 0) {
//     return points;
//   }*/
//   let tempData = []
//   points.forEach(point => {
//     tempData.push(setScaleOffsetPoint(point, scale, offset));
//   })
//   return tempData;
// }
//
// /**
//  * 对点坐标进行缩放偏移
//  * @param point
//  * @param scale
//  * @param offset
//  * @returns {{x: number, y: number}}
//  */
// function setScaleOffsetPoint(point, scale, offset) {
//   if (point === null) {
//     return null;
//   }
//   return {
//     x: (point.x + offset.x) * scale,
//     y: (point.y + offset.y) * scale
//   }
// }
//
// /**
//  * 对对象的数字属性乘以一个数值
//  * @param obj
//  * @param multiplier
//  * @returns {{}}
//  */
// export function multiplyObjectProperties(obj, multiplier) {
//   let newObj = {};
//   for (let key in obj) {
//     if (obj.hasOwnProperty(key) && typeof obj[key] === 'number') {
//       newObj[key] = obj[key] * multiplier;
//     }
//   }
//   return newObj;
// }
//
//
// export function getBoxStartAndWH(points) {
//   let minX = points[0].x;
//   let minY = points[0].y;
//   let maxX = points[0].x;
//   let maxY = points[0].y;
//   for (let i = 1; i < points.length; i++) {
//     if (minX > points[i].x) {
//       minX = points[i].x;
//     }
//     if (minY > points[i].y) {
//       minY = points[i].y;
//     }
//     if (maxX < points[i].x) {
//       maxX = points[i].x;
//     }
//     if (maxY < points[i].y) {
//       maxY = points[i].y;
//     }
//   }
//   return {
//     x: minX,
//     y: minY,
//     width: maxX - minX,
//     height: maxY - minY
//   }
// }
//
// function calculateOverlap(box1, box2) {
//   let point1 = {x: Math.max(box1.left, box2.left), y: Math.max(box1.top, box2.top)};
//   let point2 = {x: Math.min(box1.right, box2.right), y: Math.min(box1.bottom, box2.bottom)};
//   if (point1.x >= point2.x || point1.y >= point2.y) {
//     return null;
//   }
//   return {
//     left: point1.x,
//     top: point1.y,
//     right: point2.x,
//     bottom: point2.y
//   }
// }
//
// function clipBox(ctx, {x, y, width, height}) {
//   ctx.beginPath();
//   ctx.rect(x, y, width, height);
//   ctx.clip();
// }
//
// function drawPath(ctx, type, points, scale) {
//   for (let i = 0; i < points.length; i++) {
//     points[i] = UnitConversion.mmConversionPx(Number(points[i])) * scale;
//   }
//   switch (type) {
//     case "S":
//       break;
//     case "M":
//       ctx.moveTo(points[0], points[1]);
//       break;
//     case "L":
//       ctx.lineTo(points[0], points[1]);
//       break;
//     case "Q":
//       ctx.quadraticCurveTo(points[0], points[1], points[2], points[3])
//       break;
//   }
// }
//
// function splitPath(path) {
//   let start = 0;
//   let end = 0;
//   let pathArray = []
//   while (end <= path.length) {
//     if ((isLetter(path[end]) || end === path.length) && start < end) {
//       pathArray.push(path.slice(start, end).trim().split(" "));
//       start = end;
//     }
//     end++;
//   }
//   return pathArray;
// }
//
// function isLetter(char) {
//   return /^[A-Za-z]$/.test(char);
// }
