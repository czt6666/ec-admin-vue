import Tesseract from 'tesseract.js'
export function preProcessImage(){

}
export function tesseractocr(imgbase64,lan) {

  return new Promise((resolve, reject) => {
      Tesseract.recognize(
        imgbase64,
        lan, // 你可以根据需要识别的语言更改这里的语言代码
      ).then(({ data: { text } }) => {
        resolve(text)
        // 在这里处理识别后的文本，例如将其保存到组件的数据属性中
      }).catch(err => {
        reject("识别失败");
        console.error('Error during recognition', err);
      });
      // 使用processedImageUrl进行OCR识别
  })
}
