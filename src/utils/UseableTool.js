import {fetch} from "whatwg-fetch";
import JSZip from "jszip";

/**
 * @责任人：hyj
 * @方法名：copyToClipboard
 * @方法描述：复制文字到剪切板
 * @入参：textToCopy(需要复制的文本)
 * @返回值：
 * @修改时间：2024.4.26
 * @修改类型（新增、删除、修改等）：新增
 * @修改描述：新增函数
 * */
export function copyToClipboard(textToCopy) {
  // navigator clipboard 需要https等安全上下文
  if (navigator.clipboard && window.isSecureContext) {
    // navigator clipboard 向剪贴板写文本
    return navigator.clipboard.writeText(textToCopy);
  } else {
    // 创建text area
    let textArea = document.createElement("textarea");
    textArea.value = textToCopy;
    // 使text area不在viewport，同时设置不可见
    textArea.style.position = "absolute";
    textArea.style.opacity = '0';
    textArea.style.left = "-999999px";
    textArea.style.top = "-999999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    return new Promise((res, rej) => {
      // 执行复制命令并移除文本框
      document.execCommand('copy') ? res() : rej();
      textArea.remove();
    });
  }
}

/**
 * @责任人：zxh
 * @方法名：ImageDraw
 * @方法描述：加载图片
 * @入参：src:图片地址
 * @返回值：
 * @修改时间：2023.10.13
 * @修改类型（新增、删除、修改等）：新增
 * @修改描述：新增函数
 * */
export function ImageDraw(src) {
  return new Promise((resolve) => {
    const img = new Image();
    // img.crossOrigin = 'Anonymous';
    img.setAttribute("crossOrigin", "anonymous");
    img.onload = () => {
      resolve(img);
    }
    img.src = src + '?' + new Date().getTime();
  })
}

/**
 * @责任人：hyj
 * @方法名：getRangeOfTens
 * @方法描述：对每个十的整数倍之间的数取10的上下整数倍，例如8.8 取9或者8
 * @入参：
 * @返回值：
 * @修改时间：2023.12.18
 * @修改类型（新增、删除、修改等）：修改
 * @修改描述：封装函数
 * */
export function getRangeOfTens(value) {
  const tens = Math.floor(value / 10);
  let start = tens * 10;
  let end = (tens + 1) * 10;
  return {start, end};
}

/**
 * @责任人：zxh
 * @方法名：downloadFile
 * @方法描述：根据url下载文件
 * @入参：url：文件链接，filename：下载的文件名
 * @返回值：
 * @修改时间：2024.1.25
 * @修改类型（新增、删除、修改等）：新增
 * @修改描述：新增函数
 * */
export async function downloadFile(url, filename) {
  const res = await fetch(url, {
    method: 'get',
    responseType: 'arraybuffer'
  });
  if (res.status !== 200) {
    throw new Error(`${res.status}`);
  }
  const blob = await res.blob();
  /** 2024/4/2-ts-add 用于解决IE11下点击下载无反应的问题*/
  if ('msSaveOrOpenBlob' in navigator) {
    window.navigator.msSaveOrOpenBlob(blob, filename);
    return;
  }
  let link = window.URL.createObjectURL(blob);
  let a = document.createElement('a');
  a.href = link;
  a.download = filename;
  a.click();
}

/**
 * @责任人：hyj
 * @方法名：getdate
 * @方法描述：获取格式为xx-xx-xx的日期
 * @入参：
 * @返回值：
 * @修改时间：2023
 * @修改类型（新增、删除、修改等）：新增
 * @修改描述：新增函数
 * */
export function getDate() {
  let date = new Date();
  let year = date.getFullYear();
  let month = date.getMonth() + 1;
  let strDate = date.getDate();
  if (month >= 1 && month <= 9) {
    month = "0" + month;
  }
  if (strDate >= 0 && strDate <= 9) {
    strDate = "0" + strDate;
  }
  return year + " - " + month + " - " + strDate;
}

/**
 * @责任人：hyj
 * @方法名：insertionSort
 * @方法描述：直接插入排序函数，原本数组就基本有序。
 * @入参：
 * @返回值：
 * @修改时间：2023.12.26
 * @修改类型（新增、删除、修改等）：新增
 * @修改描述：
 * */
export function insertionSort(arr) {
  let len = arr.length;
  let preIndex, current;
  for (let i = 1; i < len; i++) {
    preIndex = i - 1;
    current = arr[i];
    while (preIndex >= 0 && arr[preIndex].box.top > current.box.top) {
      arr[preIndex + 1] = arr[preIndex];
      preIndex--;
    }
    arr[preIndex + 1] = current;
  }
  return arr;
}

/**
 * @责任人：zxh
 * @方法名：singleton
 * @方法描述：将一个类变为单例
 * @入参：className：类名
 * @返回值：代理后的单例类
 * @修改时间：2024.03.01
 * @修改类型（新增、删除、修改等）：新增
 * @修改描述：
 * */
export function singleton(className) {
  let instance;

  function Singleton() {
    if (!instance) {
      // console.log("新建对象");
      instance = new className(...arguments);
    }
    return instance;
  }

  Singleton.prototype = className.prototype;
  return Singleton;
}

/**
 * @责任人：zxh
 * @方法名：animaFrameTask
 * @方法描述：动画帧处理任务
 * @入参：task：任务方法，callback：回调
 * @返回值：无
 * @修改时间：2024.04.03
 * @修改类型（新增、删除、修改等）：新增
 * @修改描述：
 * */
function animaFrameTask(task, callback) {
  let start = Date.now();
  requestAnimationFrame(() => {
    if (Date.now() - start < 16.6) {
      task();
      callback();
    } else {
      animaFrameTask(task, callback);
    }
  });
}

/**
 * @责任人：zxh
 * @方法名：useAnimaFrameTask
 * @方法描述：使用动画帧处理任务并返回Promise
 * @入参：task：任务方法
 * @返回值：返回promise
 * @修改时间：2024.04.08
 * @修改类型（新增、删除、修改等）：新增
 * @修改描述：
 * */
export function useAnimaFrameTask(task) {
  return new Promise(resolve => {
    animaFrameTask(task, resolve);
  })
}

/**
 * @责任人：zxh
 * @方法名：setPageCursorById
 * @方法描述：设置页面的鼠标样式
 * @入参：id：元素id，cursorStyle：鼠标样式
 * @返回值：代理后的单例类
 * @修改时间：2024.03.01
 * @修改类型（新增、删除、修改等）：新增
 * @修改描述：
 * */
export function setPageCursorById(id, cursorStyle) {
  // 获取所有页面节点
  const pageContainers = document.querySelectorAll(
    `[id^=${id}]`
  );
  // 设置鼠标样式
  // 2024.4.9-lz-update 适配ie11不支持forEach语法
  for (let i = 0; i < pageContainers.length; i++) {
    pageContainers[i].style.cursor = cursorStyle
  }
}

/**
 * @责任人：hyj
 * @方法名：urlToBase64
 * @方法描述：图片url转成base64
 * @入参：
 * @返回值：
 * @修改时间：2024.1.24
 * @修改类型（新增、删除、修改等）：修改
 * @修改描述：新增函数
 * */
export function urlToBase64(url) {
  return new Promise((resolve, reject) => {
    let image = new Image();
    image.onload = function () {
      let canvas = document.createElement("canvas");
      canvas.width = this.naturalWidth;
      canvas.height = this.naturalHeight;
      // 将图片插入画布并开始绘制
      canvas.getContext("2d").drawImage(image, 0, 0);
      let result = canvas.toDataURL("image/png");
      resolve(result);
    };
    // CORS 策略，会存在跨域问题https://stackoverflow.com/questions/20424279/canvas-todataurl-securityerror
    image.setAttribute("crossOrigin", "Anonymous");
    image.src = url;

    // 图片加载失败的错误处理
    image.onerror = () => {
      reject(new Error("urlToBase64 error"));
    };
  });
}

/**
 * @责任人：zxh
 * @方法名：getBeijingTime
 * @方法描述：获取北京时间
 * @入参：无
 * @返回值：返回北京时间的字符串
 * @修改时间：2024.03.29
 * @修改类型（新增、删除、修改等）：新增
 * @修改描述：新增函数
 * */
export function getBeijingTime() {
  const date = new Date();
  // 将北京时间的偏移量（东八区）转换为毫秒
  const offset = 8 * 60 * 60 * 1000;
  // 设置新的日期时间，加上偏移量
  date.setTime(date.getTime() + offset);
  // 转换为ISO 8601格式的字符串
  return date.toISOString();
}

/**
 * @责任人：ts
 * @方法名：formatDate
 * @方法描述：将时间戳转为“2024-01-11 17:03:23”形式
 * @入参：无
 * @返回值：返回北京时间的字符串
 * @修改时间：2024.04.19
 * @修改类型（新增、删除、修改等）：新增
 * @修改描述：新增函数
 * */
export function formatDate(timestamp) {
  if (timestamp === "" || timestamp === null || timestamp === undefined) {
    return ""
  }
  const date = new Date(timestamp);

  const year = date.getFullYear();
  const month = ("0" + (date.getMonth() + 1)).slice(-2);
  const day = ("0" + date.getDate()).slice(-2);

  const hours = ("0" + date.getHours()).slice(-2);
  const minutes = ("0" + date.getMinutes()).slice(-2);
  const seconds = ("0" + date.getSeconds()).slice(-2);

  return year + "-" + month + "-" + day + " " + hours + ":" + minutes + ":" + seconds;
}

/**
 * @责任人：zxh
 * @方法名：pageNumConversion
 * @方法描述：将页面范围字符串转换为页码数组
 * @入参：pageNum：页面范围字符串（例如：“1-5,7,9-10”）
 * @返回值：转换完毕的页码数组（例如：[1,2,3,4,5,7,9,10]）
 * @修改时间：2024.04.23
 * @修改类型（新增、删除、修改等）：新增
 * @修改描述：新增函数
 * */
export function pageNumConversion(pageNum) {
  let numList = [];
  let startToEndList = pageNum.split(",");
  for (let i = 0; i < startToEndList.length; i++) {
    if (startToEndList[i].includes('-')) {
      let [start, end] = startToEndList[i].split('-').map(num => Number(num));
      numList = numList.concat(Array.from({length: end - start + 1}, (_, index) => start + index));
    } else {
      numList.push(Number(startToEndList[i]));
    }
  }
  return numList;
}

/**
 * @责任人：zxh
 * @方法名：deepClone
 * @方法描述：深拷贝
 * @入参：value：对象或数组
 * @返回值：拷贝完成的对象或数组
 * @修改时间：2024.05.16
 * @修改类型（新增、删除、修改等）：新增
 * @修改描述：
 * */
export function deepClone(value) {
  if (typeof value !== 'object' || value === null) {
    return value;
  }
  let clone = Array.isArray(value) ? [] : {};
  for (const valueKey in value) {
    clone[valueKey] = deepClone(value[valueKey]);
  }
  return clone;
}

/**
 * @责任人：zxh
 * @方法名：deepAssign
 * @方法描述：深度赋值
 * @入参：target：目标对象，source：源对象
 * @返回值：无
 * @修改时间：2024.07.18
 * @修改类型（新增、删除、修改等）：新增
 * @修改描述：
 * */
export function deepAssign(target, source) {
  for (const key in source) {
    if (source.hasOwnProperty(key)) {
      if (typeof source[key] === 'object' && typeof target[key] === 'object') {
        deepAssign(target[key], source[key]);
      } else {
        target[key] = source[key];
      }
    }
  }
}

/**
 * @责任人：zxh
 * @方法名：checkFile
 * @方法描述：检查文件类型及大小
 * @入参：file：文件对象，maxLength：限制文件大小（默认30MB），type：限制文件类型（数组，默认ofd、pdf）
 * @返回值：检查是否失败，及失败信息
 * @修改时间：2024.05.31
 * @修改类型（新增、删除、修改等）：新增
 * @修改描述：
 * */
export function checkFile(file, types, maxLength = window.webofdConfig.MAX_FILE_SIZE) {
  const result = {
    isFail: true,
    msg: ''
  }
  // 文件传参检查
  if (file === undefined || file === null || file.type === undefined || file.type === null || file.size === undefined || file.size === null) {
    result.msg = "文件传参错误";
    return result;
  }
  // 文件类型检查
  if (types !== undefined && Array.isArray(types) && types.length > 0) {
    let typeCheck = false;
    for (const type of types) {
      if (file.name.split('.').pop().toLowerCase() === type) {
        typeCheck = true;
        break;
      }
    }
    if (!typeCheck) {
      result.msg = `请上传${types.toString()}类型的文件`;
      return result;
    }
  }
  // 文件大小检查
  if (file.size === 0) {
    result.msg = `上传文件大小为空`;
  } else if (maxLength > 0 && file.size > maxLength) {
    result.msg = `超出文档大小限制${getSizeFormat(maxLength)}，请联系管理员`;
  } else {
    result.isFail = false;
  }
  return result;
}

/**
 * @责任人：zxh
 * @方法名：getSizeFormat
 * @方法描述：格式化文件大小
 * @入参：length：文件大小，fixed：保留小数位（默认为0）
 * @返回值：返回格式化后的文件大小
 * @修改时间：2024.05.31
 * @修改类型（新增、删除、修改等）：新增
 * @修改描述：
 * */
export function getSizeFormat(length, fixed = 0) {

  // 传参不为数字直接返回
  if (typeof length !== 'number') {
    return '0B';
  }

  // 如果长度为0，直接返回0B
  if (length < 1024) {
    return length + "B";
  }

  // 定义单位数组，从大到小排列
  const units = ['KB', 'MB', 'GB'];
  let formattedSize = length;

  let i = 0;
  while (i < units.length) {
    formattedSize = formattedSize / 1024;
    if (formattedSize > 1024) {
      if (i === units.length - 1) {
        formattedSize = formattedSize.toFixed(fixed) + units[i];
      }
      i++;
      continue;
    }
    formattedSize = formattedSize.toFixed(fixed) + units[i];
    break;
  }
  return formattedSize;
}

/**
 * @责任人：zxh
 * @方法名：checkStrRange
 * @方法描述：格式化文件大小
 * @入参：str：页面范围（例如：1,3-5,12），max：页面最大值
 * @返回值：页面范围字符串格式不正确或超出最大值时返回false，正常返回页面范围字符串解析的结果例如：[1,3,4,5,12]
 * @修改时间：2024.06.14
 * @修改类型（新增、删除、修改等）：新增
 * @修改描述：
 * */
export function checkStrRange(str, max) {
  // 校验是否成功标志
  let step = true;
  // 字符串解析成的数组
  let result = [];
  // 字符串中字符的校验
  let pattern = /[^-,\d]/;

  // 字符串正则验证通过则进行字符串的分解
  if (pattern.test(str)) {
    step = false;
  } else {
    // 先按照','进行分割，再按照'-'进行分割
    const pageList = str.split(',');
    for (const item of pageList) {
      if (item.includes('-')) {
        if (item.split('-').length - 1 > 1) {
          step = false;
          break;
        } else {
          // 承载'-'两侧数据的数组
          let arr = [];
          const numList = item.split('-');
          for (const numItem of numList) {
            if (Number(numItem) === 0 || isNaN(Number(numItem))) {
              step = false;
              break;
            }
            arr.push(Number(numItem));
          }
          if (!step) {
            break;
          }
          result.push(arr);
        }
      } else {
        if (Number(item) === 0 || isNaN(Number(item))) {
          step = false;
          break;
        }
        result.push(Number(item));
      }
    }
  }
  return step ? traverseArray(result, max) : step;
}

/**
 * @责任人：zxh
 * @方法名：traverseArray
 * @方法描述：页面范围数组再次校验解析
 * @入参：arr：页面范围数组（例如：[1,[3,5],12]），max：页面最大值
 * @返回值：页面范围超出最大值时返回false，正常返回页面范围解析的结果例如：[1,3,4,5,12]
 * @修改时间：2024.06.14
 * @修改类型（新增、删除、修改等）：新增
 * @修改描述：
 * */
function traverseArray(arr, max) {
  // 结果数组
  let result = []
  // 检验是否成功判别标志
  let step = true

  // 遍历数组
  for (let i = 0; i < arr.length; i++) {
    // 如果数组元素为数组，则将其中元素提取出来，且该数组必定只包含两个元素
    if (Array.isArray(arr[i])) {
      // 如果不是递增的则校验失败
      if (arr[i][0] < arr[i][1]) {
        for (let j = arr[i][0]; j <= arr[i][1]; j++) {
          result.push(j)
        }
      } else {
        step = false
        break;
      }
    } else {
      result.push(arr[i])
    }
  }

  // 根据标志位判断是否需要进一步判断
  if (step) {
    // 将原数组进行升序排序
    let sortResult = result.slice().sort((a, b) => a - b)
    // 若排序后数组与原数组相同则校验通过
    if (JSON.stringify(sortResult) !== JSON.stringify(result)) {
      step = false
    } else if (max !== -1 && result[result.length - 1] > max) {
      step = false
    }
  }
  return step ? result : step
}

/**
 * @责任人：zxh
 * @方法名：createZip
 * @方法描述：将多个文件压缩到一个压缩文件中并下载
 * @入参：data：文件数组（包含文件url和文件名称）
 * @返回值：无
 * @修改时间：2024.06.19
 * @修改类型（新增、删除、修改等）：新增
 * @修改描述：
 * */
export function createZip(data) {

  // 异步函数来获取所有文件内容
  function fetchFilesContent() {
    // 存储所有文件内容的数组
    let filesContent = [];
    return new Promise(async (resolve) => {
      for (let i = 0; i < data.length; i++) {
        try {
          const response = await fetch(data[i].url);
          const blob = await response.blob();
          filesContent.push({blob: blob, filename: data[i].filename});
        } catch (error) {
          console.log(data[i].url + "fetching error, Error is:", error);
        }
      }
      resolve(filesContent);
    });
  }

  return new Promise((resolve) => {
    // 将文件添加到JSZip
    fetchFilesContent().then(filesContent => {
      if (filesContent.length === 0) {
        resolve();
      }
      // 创建JSZip对象
      const zip = new JSZip();

      // 将文件内容添加到JSZip对象
      filesContent.forEach(file => {
        zip.file(file.filename, file.blob, {binary: true});
      });
      // 生成压缩包的blob对象
      zip.generateAsync({type: 'blob'}).then(content => {
        resolve(content);
      });
    });
  });
}

/**
 * @责任人：zxh
 * @方法名：doesSupportGrayscale
 * @方法描述：判断是否支持灰度样式
 * @入参：无
 * @返回值：true/false
 * @修改时间：2024.07.15
 * @修改类型（新增、删除、修改等）：新增
 * @修改描述：
 * */
export function doesSupportGrayscale() {
  const testDiv = document.createElement('div');
  testDiv.style.filter = 'grayscale(1)';

  // 检查style.filter是否包含我们设置的值，如果不包含，可能不支持
  return testDiv.style.filter === 'grayscale(1)';
}

/**
 * @责任人：zxh
 * @方法名：getScrollbarWidth
 * @方法描述：获取当前浏览器的默认滚动条宽度
 * @入参：无
 * @返回值：滚动条宽度（单位像素）
 * @修改时间：2024.12.13
 * @修改类型（新增、删除、修改等）：新增
 * @修改描述：
 * */
export function getScrollbarWidth() {
  const outer = document.createElement("div");
  outer.style.visibility = "hidden";
  outer.style.overflow = "scroll"; // 需要滚动条
  document.body.appendChild(outer);
  const widthOffset = outer.offsetWidth;
  const widthClient = outer.clientWidth;
  document.body.removeChild(outer);
  return widthOffset - widthClient;
}

/**
 * @责任人：ts
 * @方法名：drawSignature
 * @方法描述：绘制署名图片
 * @入参：
 * @返回值：
 * @修改时间：2025.01.14
 * @修改类型（新增、删除、修改等）：新增
 * @修改描述：新增函数
 * */
export function drawSignature(imgSrc, includeDate = true) {
  return new Promise(resolve => {

    const date = convertToChineseDate();
    let canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    let textWidth = 0;
    let textHeight = 0;

    const maxWidth = 300;
    const maxHeight = 150;

    // 图片加载完成后进行绘制
    img.onload = function () {
      let scale = 1.0;
      if (img.width > maxWidth || img.height > maxHeight) {
        const scaleWidth = maxWidth / img.width;
        const scaleHeight = maxHeight / img.height;
        scale = Math.min(scaleWidth, scaleHeight);
      }


      if (includeDate) {
        ctx.font = '18px 仿宋'; // 设置字体和大小
        const metrics = ctx.measureText(date);
        textWidth = metrics.width;
        textHeight = 20;

        canvas.width = 2 + 2 + 10 + Math.max(textWidth, img.width * scale);
        canvas.height = img.height * scale + textHeight + 6;
      } else {
        canvas.width = 2 + 2 + img.width * scale;
        canvas.height = img.height * scale + 4;
      }
      // 绘制图片
      ctx.drawImage(img, 0, 0, img.width, img.height, 2, 2, img.width * scale, img.height * scale); // 在(2, 2)的位置绘制图片

      if (includeDate) {
        // 图片绘制完成后，在图片右侧10像素处绘制文字
        const textX = canvas.width - 2 - textWidth; // 图片宽度加上间隔
        const textY = canvas.height - 2 - textHeight; // 文字垂直居中显示
        ctx.font = '18px 仿宋';
        ctx.textBaseline = "top"
        ctx.fillStyle = 'black'; // 设置文字颜色
        ctx.fillText(date, textX, textY); // 绘制文字
      }
      resolve(canvas);
    };

    // 图片加载失败的处理
    img.onerror = function () {
      canvas = null
    };
    // 设置图片源
    img.src = imgSrc;
  })
}

/**
 * @责任人：ts
 * @方法名：convertDateToChinese
 * @方法描述：获取当前时间的中文大写
 * @入参：
 * @返回值：
 * @修改时间：2025.01.14
 * @修改类型（新增、删除、修改等）：新增
 * @修改描述：新增函数
 * */
function convertToChineseDate() {
  const date = new Date()
  // 定义数字到中文大写的映射
  const numToChinese = {
    '0': '〇', '1': '一', '2': '二', '3': '三', '4': '四',
    '5': '五', '6': '六', '7': '七', '8': '八', '9': '九'
  };

  // 获取年、月、日
  const year = date.getFullYear().toString();
  let month = (date.getMonth() + 1).toString(); // 月份是从0开始的
  let day = date.getDate().toString();

  // 转换年份为中文大写
  const chineseYear = year.split('').map(digit => numToChinese[digit]).join('');

  // 转换月份为中文大写，处理10月以上的特殊情况
  if (Number(month) === 10) {
    month = '十';
  } else if (Number(month) > 10) {
    month = '十' + numToChinese[month[1]];
  } else {
    month = numToChinese[month];
  }
  // 转换日期为中文大写，处理20日以上的特殊情况
  if (Number(day) === 10) {
    day = '十';
  } else if (Number(day) > 10 && Number(day) < 20) {
    day = '十' + numToChinese[day[1]];
  } else if (Number(day) >= 20) {
    day = '二十' + (Number(day[1]) !== 0 ? numToChinese[day[1]] : '');
  } else {
    day = numToChinese[day];
  }

  // 组合成最终的中文日期格式
  return `${chineseYear}年${month}月${day}日`;
}
