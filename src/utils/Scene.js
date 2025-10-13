import UnitConversion from "./unitConversion";
import {ImageDraw} from "./UseableTool";

const unitEx = UnitConversion;

export class Scene {
  type = -1;
  path = null;
  points = [];
  box = null;
  offset = {
    x: 0,
    y: 0,
    saveX: 0,
    saveY: 0
  };
  style = {
    stroke: {
      isAbility: false,
      lineWidth: null,
      lineColor: null,
    },
    fill: {
      isAbility: false,
      fillColor: null
    },
    alpha: {
      isAbility: false,
      globalAlpha: null
    }
  };
  url = null;
  img = null;
  text = null;
  bgCtx = null;
  isDrawType = {
    path: false,
    fill: false,
    text: false,
    img: false,
    mask: {
      page: false,
      print: false
    }
  }
  isCanMove = false;

  // 构造方法，初始化注释类型和注释是否能移动
  constructor(type, isCanMove) {
    this.type = type;
    this.isCanMove = isCanMove;
  }

  // 复制一个新对象
  copyObj(obj) {
    Object.assign(this, obj);
    return this;
  }

  // 设置线宽颜色属性
  setStroke(lineWidth, lineColor) {
    this.style.stroke.isAbility = true;
    if (lineWidth === undefined || lineWidth === null) {
      lineWidth = 1;
    }
    this.style.stroke.lineWidth = lineWidth;
    if (lineColor === undefined || lineColor === null) {
      lineColor = "0 0 0";
    }
    this.style.stroke.lineColor = strConversionColor(lineColor.replace(/,/g, ""), " ");
  }

  // 为绘制上下文设置线宽颜色属性
  setUpStroke(ctx, scale) {
    if (!this.style.stroke.isAbility) {
      return;
    }
    ctx.strokeStyle = this.style.stroke.lineColor;
    ctx.lineWidth = this.style.stroke.lineWidth * scale;
  }

  // 设置填充色
  setFill(fillColor) {
    this.style.fill.isAbility = true;
    this.style.fill.fillColor = strConversionColor(fillColor.replace(/,/g, ""), " ");
  }

  // 为绘制上下文设置填充色属性
  setUpFill(ctx) {
    if (!this.style.fill.isAbility) {
      return;
    }
    ctx.fillStyle = this.style.fill.fillColor;
  }

  // 设置透明度
  setAlpha(alpha) {
    this.style.alpha.isAbility = true;
    if (alpha > 1) {
      alpha = alpha / 255;
    }
    this.style.alpha.globalAlpha = alpha;
  }

  // 为绘制上下文设置透明度属性
  setUpAlpha(ctx) {
    if (!this.style.alpha.isAbility) {
      return;
    }
    ctx.globalAlpha = this.style.alpha.globalAlpha;
  }

  // 绘制路径Path
  drawPath(ctx, scale, path = this.path) {
    ctx.save();
    this.setUpStroke(ctx, scale);
    this.setUpAlpha(ctx);
    if (path.indexOf("Q") > -1) {
      ctx.lineJoin = "round";
      ctx.lineCap = "round";
    }
    const {left, top, right, bottom} = this.getBox(scale);
    let boxOffset = this.getLineWidthOffset(scale);
    clipBox(ctx, {x: left - boxOffset, y: top - boxOffset, width: right - left + 2 * boxOffset, height: bottom - top + 2 * boxOffset});
    ctx.beginPath();
    const pathSplit = splitPath(path);
    if (path.indexOf("A") > -1) {
      let r = null;
      let scaleX = null, scaleY = null;
      let start;
      pathSplit.forEach(pathItem => {
        let points = pathItem.slice(1);
        switch (pathItem[0]) {
          case "S":
            break;
          case "M":
            ctx.moveTo(Number(points[0]) * scale, Number(points[1]) * scale);
            start = {x: Number(points[0]) * scale, y: Number(points[1]) * scale}
            break;
          case "A":
            let end = {x: Number(points[5]) * scale, y: Number(points[6]) * scale}
            let center = {x: (start.x + end.x) / 2, y: (start.y + end.y) / 2}
            let rX = Number(points[0]) * scale;
            let rY = Number(points[1]) * scale;
            let radius = rX > rY ? rX : rY;
            ctx.translate((left + right) / 2, (top + bottom) / 2);
            if (r === null) {
              r = radius;
              scaleX = rX / r;
              scaleY = rY / r;
              ctx.scale(scaleX, scaleY);
            } else if (r !== radius) {
              ctx.scale(1/scaleX, 1/scaleY);
              r = radius;
              scaleX = rX / r;
              scaleY = rY / r;
              ctx.scale(scaleX, scaleY);
            }
            ctx.translate(-(left + right) / 2, -(top + bottom) / 2);


            let startRotate = 0, endRotate = 0;
            if (start.x === end.x) {
              if (start.y < end.y) {
                startRotate = 1.5;
                endRotate = 0.5;
              } else {
                startRotate = 0.5;
                endRotate = 1.5;
              }
            } else if (start.y === end.y) {
              if (start.x < end.x) {
                startRotate = 1;
                endRotate = 0;
              } else {
                startRotate = 0;
                endRotate = 1;
              }
            }
            let direction = !Number(points[4]);  // false顺时针，true逆时针

            ctx.arc(center.x, center.y, r, startRotate * Math.PI, endRotate * Math.PI, direction);
            start = end;
            break;
        }
      })

    } else {
      pathSplit.forEach(pathItem => {
        drawPathDetail(ctx, scale, pathItem[0], pathItem.slice(1));
      });
    }
    ctx.stroke();
    ctx.restore();
    this.isDrawType.path = true;
  }

  // 绘制填充
  drawFill(ctx, scale, bgCtx = this.bgCtx) {

    const isSample = (objRGBA, standardRGBA) => {
      const tolerance = 20;  // 容差率
      const [sR, sG, sB, sA] = standardRGBA;
      const [oR, oG, oB, oA] = objRGBA;
      const simple = Math.sqrt((oR - sR) ** 2 + (oG - sG) ** 2 + (oB - sB) ** 2 + (oA - sA) ** 2);
      return simple < tolerance;
    }

    const handleImageData = (area, ctx, bgCtx, color) => {
      let { x, y, width, height } = area;
      if (width <= 1 || height <= 1) {
        return null;
      }
      const bgImgData = bgCtx.getImageData(x, y, width, height);
      const annoImgData = ctx.getImageData(x, y, width, height);
      let r, g, b, a;
      for (let i = 0; i < annoImgData.data.length; i += 4) {
        r = annoImgData.data[i];
        g = annoImgData.data[i + 1];
        b = annoImgData.data[i + 2];
        a = annoImgData.data[i + 3];
        const aT = isSample([r, g, b, a], [0, 0, 0, 0]);
        r = bgImgData.data[i];
        g = bgImgData.data[i + 1];
        b = bgImgData.data[i + 2];
        a = bgImgData.data[i + 3];
        const tT = isSample([r, g, b, a], [255, 255, 255, 255]);
        if (aT && tT) {
          annoImgData.data[i] = color[0];
          annoImgData.data[i + 1] = color[1];
          annoImgData.data[i + 2] = color[2];
          annoImgData.data[i + 3] = color[3];
        }
      }
      ctx.putImageData(annoImgData, x, y);
    }

    const box = this.getBox(scale);
    const points = setScaleOffsetPoints(this.points, scale);
    const color = colorConversionStr(this.style.fill.fillColor);
    if (color.length === 3) {
      color.push(255);
    }

    let surplus4 = points.length % 4;
    let surplus5 = points.length % 5;
    let step = 4;
    if (surplus4 === 0 && surplus5 !== 0) {
      step = 4;
    } else if (surplus4 !== 0 && surplus5 === 0) {
      step = 5;
    } else if (surplus4 === 0 && surplus5 === 0) {
      let temp = false;
      for (let i = 0; i < points.length; i += 5) {
        if (points[i].x !== points[i + 4].x || points[i].y !== points[i + 4].y) {
          temp = true;
          break;
        }
      }
      if (temp) {
        step = 4;
      } else {
        step = 5;
      }
    }

    for (let i = 0; i < points.length; i += step) {
      const subPoints = points.slice(i, i + 4);
      const pointBox = this.updateCommonAnnoBox(subPoints);
      const drawBox = calculateOverlap(pointBox, box);
      if (drawBox !== null) {
        handleImageData(
          {
            x: drawBox.left,
            y: drawBox.top,
            width: drawBox.right - drawBox.left,
            height: drawBox.bottom - drawBox.top
          }, ctx, bgCtx, color);
      }
    }
    this.bgCtx = undefined;
    this.isDrawType.fill = true;
  }

  // 绘制掩膜的填充
  drawFillMask(ctx, scale) {
    ctx.save();
    this.setUpFill(ctx);
    ctx.beginPath();
    const box = this.getBox(scale);
    ctx.fillRect(box.left, box.top, box.right - box.left, box.bottom - box.top);
    ctx.stroke();
    ctx.restore();
    this.isDrawType.mask.page = true;
  }

  // 绘制文字
  drawText(ctx, scale, textInfo = this.text) {
    // 获取文本宽度
    const getWidth = (text, style) => {
      let span = document.createElement("span");
      span.innerText = text;
      span.style.font = style;
      document.body.appendChild(span);
      let width = span.offsetWidth;
      document.body.removeChild(span);
      return width;
    }

    // 获取文本应该截断的位置
    const getI = (text, maxWidth, style) => {
      let ids = []
      if (getWidth(text, style) > maxWidth) {
        let i = 0;
        let j = text.length;
        while (i < text.length) {
          let temp = text.slice(i, j);
          if (getWidth(temp, style) > maxWidth) {
            j = Math.floor((j + i) / 2);
          } else {
            if (j === text.length) {
              ids.push(j);
              i = j;
            } else {
              for (; j < text.length; j++) {
                temp += text[j];
                if (getWidth(temp, style) > maxWidth) {
                  ids.push(j);
                  i = j;
                  j = text.length;
                  break;
                }
              }
            }
          }
        }
      }
      return ids;
    }

    const text = textInfo[0];
    let box;
    if (this.type === 21) {
      const commentTextBox = getCommentTextBox(this.points);
      box = {
        left: (commentTextBox.left + this.offset.x) * scale,
        top: (commentTextBox.top + this.offset.y) * scale,
        right: (commentTextBox.right + this.offset.x) * scale,
        bottom: (commentTextBox.bottom + this.offset.y) * scale,
      }
    } else {
      box = this.getBox(scale);
    }
    if (box === null) {
      return;
    }
    const width = box.right - box.left - 5 * scale;
    let textArray = text.split("\n");

    // 文字样式
    let style = "";
    if (textInfo[1] === 'true') {
      style += "italic "
    }
    if (Number(textInfo[2]) > 400) {
      style += "bold ";
    }
    style += `${textInfo[5] * scale}px ${textInfo[4]}`;

    // 将原文本进行分行
    let i = 0;
    while (i < textArray.length) {
      let temp = textArray[i];
      let ids = getI(temp, width, style);
      if (ids.length !== 0) {
        textArray.splice(i, 1);
        for (let j = 0; j < ids.length; j++) {
          let start = j === 0 ? 0 : ids[j - 1];
          let end = ids[j];
          let splitText = temp.slice(start, end);
          textArray.splice(i, 0, splitText);
          i++;
        }
      } else {
        i++;
      }
    }
    ctx.save();
    ctx.font = style;
    ctx.fillStyle = strConversionColor(textInfo[3], " ");
    const linHeight = textInfo[5] * scale;
    textArray.forEach((t, index) => {
      ctx.fillText(t, box.left + 2.5 * scale, box.top + linHeight * (index + 1));
    })
    ctx.restore();
    this.isDrawType.text = true;
  }

  // 绘制掩膜的文字
  drawTextMask(ctx, scale, textInfo = this.text) {
    // 文字样式
    let style = "";
    if (textInfo[1] === 'true') {
      style += "italic "
    }
    if (Number(textInfo[2]) > 400) {
      style += "bold ";
    }
    style += `${textInfo[5] * scale}px ${textInfo[4]}`;
    ctx.save();
    ctx.font = style;
    ctx.fillStyle = strConversionColor(textInfo[3], " ");
    ctx.textAlign = 'center';
    ctx.textBaseline = 'center';
    const box = this.getBox(scale);
    ctx.fillText(textInfo[0], (box.left + box.right) / 2, (box.top + box.bottom) / 2);
    ctx.restore();
    this.isDrawType.mask.print = true;
  }

  // 绘制图片
  drawImg(ctx, scale, url = this.url) {
    const drawImg = (ctx, scale, img) => {
      const box = this.getBox(scale);
      ctx.save();
      this.setUpAlpha(ctx);
      let x = box.left;
      let y = box.top;
      let width = box.right - box.left;
      let height = box.bottom - box.top;
      ctx.drawImage(img, x, y, width, height);

      ctx.restore();
    }

    if (this.img === null) {
      ImageDraw(url).then(img => {
        this.img = img;
        drawImg(ctx, scale, this.img);
      });
    } else {
      drawImg(ctx, scale, this.img);
    }
    this.isDrawType.img = true;
  }

  // 根据缩放比等进行重绘
  reDraw(ctx, scale) {
    if (this.isDrawType.fill) {
      this.drawFill(ctx, scale);
    }
    if (this.isDrawType.mask.page) {
      this.drawFillMask(ctx, scale);
    }
    if (this.isDrawType.path) {
      let path = conversionPath2(this.path, (item) => item + this.offset.x, (item) => item + this.offset.y);
      this.drawPath(ctx, scale, path);
    }
    if (this.isDrawType.text) {
      this.drawText(ctx, scale);
    }
    if (this.isDrawType.img) {
      this.drawImg(ctx, scale);
    }
    if (this.isDrawType.mask.print) {
      this.drawTextMask(ctx, scale);
    }
  }

  // 入参path默认为相对位置根据box转化为绝对位置，
  // 可根据isAbsolute参数进行设定传参path为相对还是绝对，
  // 所有数值单位均为px
  toPoints(path, box, isAbsolute = false) {
    let points = [];
    if (path !== undefined && path !== null && path !== "") {
      if (!isAbsolute) {
        path = conversionPathReAb(path, true, box);
      }
      let pathSplit = splitPath(path);
      pathSplit.forEach(pathItem => {
        let type = pathItem[0];
        if (type !== 'S') {
          for (let i = 1; i < pathItem.length; i+= 2) {
            points.push({
              x: Number(pathItem[i]),
              y: Number(pathItem[i + 1])
            });
          }
        }
      });
    }
    this.path = path;
    this.box = box;
    const boxOffset = this.getLineWidthOffset(1);
    // this.box.left += boxOffset;
    // this.box.top += boxOffset;
    this.box.right -= boxOffset;
    this.box.bottom -= boxOffset;
    this.points = points;
    return points;
  }

  // 生成绝对位置的box和path，所有数值单位均为px
  toPath(points, scale) {
    let scalePoints = []
    points.forEach(point => {
      if (point) {
        scalePoints.push({
          x: point.x / scale,
          y: point.y / scale
        });
      } else {
        scalePoints.push(null);
      }
    });
    if (this.type === 7) {
      this.box = this.updateQuadraticAnnoBox(scalePoints);
    } else {
      this.box = this.updateCommonAnnoBox(scalePoints);
    }
    // 拼接绘制注释字符串
    let strPath = `S 0 0 `;
    switch (this.type) {
      case 1:
      case 10:
      case 12:
        for (let i = 0; i < scalePoints.length; i += 2) {
          strPath += `M ${scalePoints[i].x} ${scalePoints[i].y} `;
          strPath += `L ${scalePoints[i + 1].x} ${scalePoints[i + 1].y} `;
        }
        break;
      case 2:
      case 9:
      case 20:
      case 101:
      case 102:
        for (let i = 0; i < scalePoints.length; i += 4) {
          strPath += `M ${scalePoints[i].x} ${scalePoints[i].y} `;
          strPath += `L ${scalePoints[i + 1].x} ${scalePoints[i + 1].y} `;
          strPath += `L ${scalePoints[i + 2].x} ${scalePoints[i + 2].y} `;
          strPath += `L ${scalePoints[i + 3].x} ${scalePoints[i + 3].y} `;
          strPath += `L ${scalePoints[i].x} ${scalePoints[i].y} `;
        }
        if (this.type === 101 || this.type === 102) {
          strPath += ` C`;
        }
        break;
      case 7:
        strPath += `M ${scalePoints[0].x} ${scalePoints[0].y} `;
        for (let i = 1; i < scalePoints.length; i += 2) {
          strPath += `Q ${scalePoints[i].x} ${scalePoints[i].y} `;
          if (i + 1 < scalePoints.length) {
            strPath += `${scalePoints[i + 1].x} ${scalePoints[i + 1].y} `;
          } else {
            strPath += `${scalePoints[i].x} ${scalePoints[i].y} `;
          }
        }
        break;
      case 11:
        strPath += `M ${scalePoints[0].x} ${scalePoints[0].y} `;
        for (let i = 1; i < scalePoints.length; i += 2) {
          if (scalePoints[i] === null) {
            strPath += `M ${scalePoints[i + 1].x} ${scalePoints[i + 1].y} `;
            continue;
          }
          strPath += `Q ${scalePoints[i].x} ${scalePoints[i].y} `;
          strPath += `${scalePoints[i + 1].x} ${scalePoints[i + 1].y} `;
        }
        break;
    }
    this.path = strPath;
    this.points = scalePoints;
    return strPath;
  }

  // 绘制对象的box信息
  getBox(scale = 1.0) {
    let box = {
      left: this.box.left + this.offset.x,
      top: this.box.top + this.offset.y,
      right: this.box.right + this.offset.x,
      bottom: this.box.bottom + this.offset.y,
    }
    return multiplyObjectProperties(box, scale);
  }

  // 根据box计算文本注释的point信息
  calcTextAnnoPoints(boxList) {
    let points = [];
    switch (this.type) {
      case 9:
        boxList.forEach(box => {
          points.push({ x: box.left, y: box.top });
          points.push({x: box.right, y: box.top});
          points.push({ x: box.right, y: box.bottom });
          points.push({x: box.left, y: box.bottom});
        });
        break;
      case 10:
        boxList.forEach(box => {
          points.push({ x: box.left, y: box.bottom });
          points.push({ x: box.right, y: box.bottom });
        });
        break;
      case 11:
        // 绘制波浪线所需的二次贝塞尔曲线的每次偏移量
        const offsetX = unitEx.mmConversionPx(0.4142);
        const offsetY = unitEx.mmConversionPx(0.7875);
        // 遍历文字box，计算所需的点位信息
        boxList.forEach((box, index) => {
          // 每段波浪线的初始曲线点位
          points.push({ x: box.left, y: box.bottom });
          points.push({ x: box.left, y: box.bottom });
          points.push({ x: box.left + offsetX, y: box.bottom + offsetY });
          // 每段波浪线中循环显示的部分曲线点位
          let i = 2;
          while (box.left + (i + 2) * offsetX <= box.right) {
            // 第一段曲线
            points.push({ x: box.left + i * offsetX, y: box.bottom + 2 * offsetY });
            points.push({ x: box.left + (i + 1) * offsetX, y: box.bottom + offsetY });
            // 第二段曲线
            points.push({ x: box.left + (i + 1) * offsetX, y: box.bottom });
            points.push({ x: box.left + (i + 2) * offsetX, y: box.bottom + offsetY });
            i += 3;
          }
          // 每行波浪线结束时的标志点位
          if (index !== boxList.length - 1) {
            points.push(null);
          }
        });
        break;
      case 12:
        boxList.forEach(box => {
          points.push({ x: box.left, y: (box.bottom + box.top) / 2 });
          points.push({ x: box.right, y: (box.bottom + box.top) / 2 });
        })
        break;
    }
    return points;
  }

  // 根据线宽获取边界偏移量
  getLineWidthOffset(scale) {
    let boxOffset;
    if (this.style.stroke.lineWidth !== null) {
      boxOffset = this.style.stroke.lineWidth * scale / 2;
    } else {
      boxOffset = 1 * scale / 2;
    }
    return boxOffset;
  }

  // 获取最终保存时的box信息（单位mm）
  getSaveBox() {
    let box = this.getBox();
    let boxOffset = this.getLineWidthOffset(1);
    return {
      x: unitEx.pxConversionMm(box.left + boxOffset),
      y: unitEx.pxConversionMm(box.top + boxOffset),
      width: unitEx.pxConversionMm(box.right - box.left - 2 * boxOffset),
      height: unitEx.pxConversionMm(box.bottom - box.top - 2 * boxOffset),
    }
  }

  // 获取最终保存时的path信息（单位mm）
  getSavePath() {
    let box = this.getBox();
    let path = conversionPath2(
      this.path,
      (item) => unitEx.pxConversionMm(item + this.offset.x - box.left),
      (item) => unitEx.pxConversionMm(item + this.offset.y - box.top)
    );
    return path;
  }

  // 注释保存后重置保存偏移量
  save() {
    this.offset.saveX = 0;
    this.offset.saveY = 0;
  }

  /**
   * @责任人：zxh
   * @方法名：updateCommonAnnoBox
   * @方法描述：更新一般注释的边框大小位置（直线、矩形）
   * @入参：points:注释点位列表
   * @返回值：注释外接box
   * @修改时间：2023.9.8
   * @修改类型（新增、删除、修改等）：新增
   * @修改描述：
   * */
  updateCommonAnnoBox(points, offset) {
    // 初始化左上角点
    let x1 = points[0].x;
    let y1 = points[0].y;
    // 初始化右下角点
    let x2 = x1;
    let y2 = y1;
    // 对所有注释点位进行遍历，比较出最小的x、y和最大的x、y
    for (let i = 0; i < points.length; i++) {
      if (points[i] === null || points[i] === undefined) {
        continue;
      }
      if (x1 > points[i].x) {
        x1 = points[i].x;
      }
      if (y1 > points[i].y) {
        y1 = points[i].y;
      }
      if (x2 < points[i].x) {
        x2 = points[i].x;
      }
      if (y2 < points[i].y) {
        y2 = points[i].y;
      }
    }
    // 左上角和右下角点组成边框
    return {
      left: x1,
      top: y1,
      right: x2,
      bottom: y2
    }
  }

  /**
   * @责任人：zxh
   * @方法名：updateQuadraticAnnoBox
   * @方法描述：绘制批注线段时对批注矩形框的大小和位置进行更新
   * @入参：points：注释点位列表
   * @返回值：注释外接box
   * @修改时间：2024.1.2
   * @修改类型（新增、删除、修改等）：新增
   * @修改描述：
   * */
  updateQuadraticAnnoBox(points, offset) {

    // 获取二次贝塞尔曲线的矩形框大小和位置
    const getQuadraticBezierBoundingBox = (beginPoint, controlPoint, endPoint) => {
      const x0 = beginPoint.x;
      const y0 = beginPoint.y;
      const x1 = controlPoint.x;
      const y1 = controlPoint.y;
      const x2 = endPoint.x;
      const y2 = endPoint.y;
      // 计算极值点的 t 值
      const tx = (x0 - x1) / (x0 - 2 * x1 + x2);
      const ty = (y0 - y1) / (y0 - 2 * y1 + y2);

      // 计算边界框的四个顶点坐标
      let minX = Math.min(x0, x2);
      let maxX = Math.max(x0, x2);
      let minY = Math.min(y0, y2);
      let maxY = Math.max(y0, y2);

      // 如果极值点在曲线上，则更新边界框
      if (tx > 0 && tx < 1) {
        const x = (1 - tx) ** 2 * x0 + 2 * (1 - tx) * tx * x1 + tx ** 2 * x2;
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
      }
      if (ty > 0 && ty < 1) {
        const y = (1 - ty) ** 2 * y0 + 2 * (1 - ty) * ty * y1 + ty ** 2 * y2;
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
      }

      // 返回边界框
      return {
        left: minX,
        top: minY,
        right: maxX,
        bottom: maxY
      };
    }

    // 合并矩形框
    const mergeRectBox = (nowBox, qbBox) => {
      const left = Math.min(nowBox.left, qbBox.left);
      const top = Math.min(nowBox.top, qbBox.top);
      const right = Math.max(nowBox.right, qbBox.right);
      const bottom = Math.max(nowBox.bottom, qbBox.bottom);
      // 返回边界框
      return {
        left: left,
        top: top,
        right: right,
        bottom: bottom
      };
    }

    // 初始外边框
    let nowBox = {
      left: points[0].x,
      top: points[0].y,
      right: points[0].x,
      bottom: points[0].y
    }
    // 对所有的点位进行遍历计算整体曲线的外边框
    let beginPoint = points[0];
    for (let i = 1; i < points.length; i += 2) {
      let controlPoint = points[i]
      if (controlPoint === undefined) {
        controlPoint = beginPoint
      }
      let endPoint = points[i + 1]
      if (endPoint === undefined) {
        endPoint = controlPoint
      }

      // 现在三个点所绘二次贝塞尔曲线的矩形框
      const qbBox = getQuadraticBezierBoundingBox(
        beginPoint,
        controlPoint,
        endPoint
      );
      // 合并box
      nowBox = mergeRectBox(nowBox, qbBox);
      // 下一个二次贝塞尔曲线的起始点等于上一个的结束点
      beginPoint = endPoint;
    }
    return {
      left: nowBox.left,
      top: nowBox.top,
      right: nowBox.right,
      bottom: nowBox.bottom
    };
  }
}



// 字符串转color：“255 255 255”=>“rgb(255, 255, 255)”
function strConversionColor(color, splitChar) {
  const colorArray = color.split(splitChar);
  if (colorArray.length === 3) {
    return `rgb(${colorArray[0]}, ${colorArray[1]}, ${colorArray[2]})`;
  } else if (colorArray.length === 4) {
    return `rgba(${colorArray[0]}, ${colorArray[1]}, ${colorArray[2]}, ${colorArray[3]})`;
  } else {
    return null;
  }
}

// color转颜色数组：“rgb(255, 255, 255)”=>“[255, 255, 255]”
function colorConversionStr(color) {
  const start = color.indexOf("(");
  const end = color.indexOf(")");
  return color.slice(start + 1, end).split(",").map(item => Number(item));
}

function splitPath(path) {
  let start = 0;
  let end = 0;
  let pathArray = []
  while (end <= path.length) {
    if ((isLetter(path[end]) || end === path.length) && start < end) {
      pathArray.push(path.slice(start, end).trim().split(" "));
      start = end;
    }
    end++;
  }
  return pathArray;
}

function drawPathDetail(ctx, scale, type, points) {
  for (let i = 0; i < points.length; i++) {
    points[i] = Number(points[i]) * scale;
  }
  switch (type) {
    case "S":
      break;
    case "M":
      ctx.moveTo(points[0], points[1]);
      break;
    case "L":
      ctx.lineTo(points[0], points[1]);
      break;
    case "Q":
      ctx.quadraticCurveTo(points[0], points[1], points[2], points[3])
      break;
    case "A":
      ctx.arc(points[0], points[1], points[2], points[3], points[4], points[5], points[6]);
      break;
    case "C":
      ctx.closePath();
      break;
  }
}

function isLetter(char) {
  return /^[A-Za-z]$/.test(char);
}

export function conversionPathPxMm(path, toPx) {
  if (toPx) {
    return conversionPath1(path, (item) => unitEx.mmConversionPx(Number(item)));
  } else {
    return conversionPath1(path, (item) => unitEx.pxConversionMm(Number(item)));
  }
}

function conversionPath1(path, callback) {
  path = path.trim();
  let operator = '';
  let step = 0;
  return path.split(" ").map(item => {
    if (Number.isNaN(Number(item))) {
      if (item === 'A') {
        operator = item;
        step = 0;
      }
      return item;
    } else {
      if (operator === 'A') {
        step++;
        if (step === 3 || step === 4 || step === 5) {
          return item;
        }
      }
      return callback(item);
    }
  }).join(" ");
}

function conversionPathReAb(path, toAbsolute, box) {
  if (toAbsolute) {
    return conversionPath2(path, (item) => item + box.left, (item) => item + box.top);
  } else {
    return conversionPath2(path, (item) => item - box.left, (item) => item - box.top);
  }
}

function conversionPath2(path, callback1, callback2) {
  const pathSplit = splitPath(path);
  pathSplit.forEach(pathItem => {
    if (pathItem[0] !== 'S') {
      if (pathItem[0] === 'A') {
        let length = pathItem.length;
        pathItem[length - 2] = callback1(Number(pathItem[length - 2]));
        pathItem[length - 1] = callback2(Number(pathItem[length - 1]));
      } else {
        for (let i = 1; i < pathItem.length; i+= 2) {
          pathItem[i] = callback1(Number(pathItem[i]));
          pathItem[i + 1] = callback2(Number(pathItem[i + 1]));
        }
      }
    }
  });
  return pathSplit.map(pathItem => pathItem.join(' ')).join(' ');
}

/**
 * 对对象的数字属性乘以一个数值
 * @param obj
 * @param multiplier
 * @returns {{}}
 */
export function multiplyObjectProperties(obj, multiplier) {
  let newObj = {};
  for (let key in obj) {
    if (obj.hasOwnProperty(key) && typeof obj[key] === 'number') {
      newObj[key] = obj[key] * multiplier;
    }
  }
  return newObj;
}

/**
 * 对点位数组进行缩放偏移
 * @param points
 * @param scale
 * @param offset
 * @returns {*|*[]}
 */
export function setScaleOffsetPoints(points, scale, offset = { x: 0, y: 0 }) {
  /*if (scale === 1 && offset.x === 0 && offset.y === 0) {
    return points;
  }*/
  let tempData = []
  points.forEach(point => {
    tempData.push(setScaleOffsetPoint(point, scale, offset));
  })
  return tempData;
}

/**
 * 对点坐标进行缩放偏移
 * @param point
 * @param scale
 * @param offset
 * @returns {{x: number, y: number}}
 */
function setScaleOffsetPoint(point, scale, offset) {
  if (point === null) {
    return null;
  }
  return {
    x: (point.x + offset.x) * scale,
    y: (point.y + offset.y) * scale
  }
}

function calculateOverlap(box1, box2) {
  let point1 = {x: Math.max(box1.left, box2.left), y: Math.max(box1.top, box2.top)};
  let point2 = {x: Math.min(box1.right, box2.right), y: Math.min(box1.bottom, box2.bottom)};
  if (point1.x >= point2.x || point1.y >= point2.y) {
    return null;
  }
  return {
    left: point1.x,
    top: point1.y,
    right: point2.x,
    bottom: point2.y
  }
}

/**
 * 根据注释类型英文名获取注释中文名
 * @param en_name
 * @returns {string}
 */
export function getAnnoTypeName(en_name) {
  switch (en_name) {
    case "Path":
      return "路径";
    case "Highlight":
      return "高亮";
    case "Stamp":
      return "橡皮图章"
    case "Link":
      return "超链接"
    default:
      return en_name;
  }
}

/**
 * 根据注释子类型英文名获取注释中文名
 * @param en_name
 * @param en_type
 * @returns {string}
 */
export function getAnnoName(en_name, en_type) {

  switch (en_type) {
    case "Link":
    case "Hyperlink":
      return "超链";
  }

  switch (en_name) {
    case "Line":
      return "直线";
    case "Rectangle":
      return "矩形";
    case "Arrow":
      return "箭头";
    case "PolyLine":
      return "折线";
    case "Polygon":
      return "多边形";
    case "Oval":
      return "椭圆";
    case "TextNoteBox":
      return "文本框";
    case "CommentNoteBox":
      return "注释框";
    case "Highlight":
      return "高亮";
    case "UnderLine":
      return "下划线";
    case "WavyUnderLine":
      return "波浪线";
    case "DeleteLine":
      return "删除线";
    case "Hand":
      return "签批";
    case "Watermark":
      return "水印";
    case "Stamp":
      return "图章";
    case "Pencil":
      return "铅笔";
    case "IncreaseSpacing":
      return "增加间距";
    case "ReduceSpacing":
      return "减少间距";
    case "Insert":
      return "插入";
    case "MovedIn":
    case "MovedOut":
      return "移动";
    case "SwitchFont":
      return "切换字体";
    case "Replace":
      return "替换";
    case "Retroposition":
      return "后移";
    case "Antedisplacement":
      return "前移";
    case "AnnotationAnno":
      return "文本附注";
    case "Hyperlink":
    case "Link":
      return "超链";
    case "affix":
      return "署名章";
    case "PreSeal":
      return "预盖章";
    case "Chapter":
      return "文号章";
    default:
      return en_name;
  }
}

/**
 * 根据注释类型数字获取注释对应的子类型
 * @param annoType 注释类型
 */
export function getAnnoSubType(annoType) {
  switch (annoType) {
    case 1:
      return "Line";
    case 2:
      return "Rectangle";
    case 3:
      return "Arrow";
    case 4:
      return "PolyLine";
    case 5:
      return "Polygon";
    case 6:
      return "Oval";
    case 7:
      return "Hand";
    case 9:
      return "Highlight";
    case 10:
      return "UnderLine";
    case 11:
      return "WavyUnderLine";
    case 12:
      return "DeleteLine";
    case 20:
      return "TextNoteBox";
    default:
      return undefined;
  }
}

export function getAnnoType(annoType) {
  switch (annoType) {
    case 1:
    case 2:
    case 3:
    case 4:
    case 5:
    case 6:
    case 7:
    case 10:
    case 11:
    case 12:
    case 20:
    case 21:
      return "Path";
    case 9:
      return "Highlight";
    default:
      return undefined;
  }
}

export function getBoxStartAndWH(points) {
  let minX = points[0].x;
  let minY = points[0].y;
  let maxX = points[0].x;
  let maxY = points[0].y;
  for (let i = 1; i < points.length; i++) {
    if (minX > points[i].x) {
      minX = points[i].x;
    }
    if (minY > points[i].y) {
      minY = points[i].y;
    }
    if (maxX < points[i].x) {
      maxX = points[i].x;
    }
    if (maxY < points[i].y) {
      maxY = points[i].y;
    }
  }
  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY
  }
}

function clipBox(ctx, {x, y, width, height}) {
  ctx.beginPath();
  ctx.rect(x, y, width, height);
  ctx.clip();
}

function getCommentTextBox(points) {
  const uniquePoints = deleteRepeatPoint(points);
  for (const point of uniquePoints) {
    const xEqual = uniquePoints.filter(p => p.x === point.x && p.y !== point.y).map(p => p.y);
    const yEqual = uniquePoints.filter(p => p.y === point.y && p.x !== point.x).map(p => p.x);
    if (xEqual.length === 0 || yEqual.length === 0) {
      continue;
    }
    for (const yEqualElement of yEqual) {
      for (const xEqualElement of xEqual) {
        if (uniquePoints.findIndex(p => p.x === yEqualElement && p.y === xEqualElement) > -1) {
          return {
            top: Math.min(point.y, xEqualElement),
            left: Math.min(point.x, yEqualElement),
            bottom: Math.max(point.y, xEqualElement),
            right: Math.max(point.x, yEqualElement)
          }
        }
      }
    }
  }
  return null;
}

function deleteRepeatPoint(points) {
  if (points.length === 0) {
    return []
  }
  const seen = new Set();
  const resultPoints = [];
  for (const point of points) {
    if (!seen.has(JSON.stringify({x: point.x, y: point.y}))) {
      seen.add(JSON.stringify({x: point.x, y: point.y}));
      resultPoints.push(point);
    }
  }
  return resultPoints;
}
