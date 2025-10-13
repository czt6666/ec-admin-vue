<template>
  <el-dialog
    id="html2ofdDialog"
    v-loading="loading"
    element-loading-text="文件创建中"
    title="从网页创建文件"
    :visible.sync="htmlConversion.visible"
    top="10vh"
    :before-close="beforeClose"
    :close-on-click-modal="false"
    width="40%">
    <div style="width: 100%; display: flex; flex-direction: column; align-items: center">
      <el-radio-group v-model="htmlConversion.origin" style="width: 80%">
        <div style="display: flex; width: 100%; align-items: center;">
          <el-radio border :label="1">输入URL</el-radio>
          <el-input v-model="htmlConversion.url" :disabled="htmlConversion.origin !== 1" style="width: 50%"/>
        </div>
        <div style="display: flex; width: 100%; align-items: center; margin-top: 10px">
          <el-radio border :label="2">上传文件</el-radio>
          <el-upload
            :disabled="htmlConversion.origin !== 2"
            ref="upload"
            action="/webofd/html"
            :http-request="uploadHtmlFile"
            accept=".html,.htm,.mhtml,.shtml"
            :show-file-list="false">
            <el-button :disabled="htmlConversion.origin !== 2" size="small" type="primary">选取文件</el-button>
          </el-upload>
          <el-tag v-if="htmlConversion.filename !== ''" style="margin-left: 10px">{{ htmlConversion.filename }}</el-tag>
        </div>
      </el-radio-group>
      <el-radio-group v-model="htmlConversion.sizeModel" style="width: 80%; margin-top: 10px">
        <div style="display: flex; width: 100%; align-items: flex-start; flex-direction: column; margin-bottom: 10px">
          <el-radio :label="1" style="padding-left: 10px">
            <div style="display: inline-flex; flex-direction: column; margin-bottom: 10px">
              <div style="margin-bottom: 10px">
                <span>标准尺寸</span>
                <el-select
                  v-model="htmlConversion.pageSize"
                  :disabled="htmlConversion.sizeModel !== 1"
                  placeholder="请选择"
                  style="margin-left: 50px">
                  <el-option
                    v-for="item in pageSizeOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.label">
                  </el-option>
                </el-select>
              </div>
              <div>
                <span>纸张方向</span>
                <el-select
                  v-model="htmlConversion.pageDirection"
                  :disabled="htmlConversion.sizeModel !== 1"
                  placeholder="请选择"
                  style="margin-left: 50px">
                  <el-option
                    v-for="item in pageDirectionOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value">
                  </el-option>
                </el-select>
              </div>
            </div>
          </el-radio>
          <el-radio :label="2" style="padding-left: 10px">
            <div style="display: inline-flex; align-items: center">
              <span>自定尺寸</span>
              <div style="margin-left: 50px">
                <el-input-number
                  v-model="htmlConversion.pageWidth"
                  :min="1"
                  :disabled="htmlConversion.sizeModel !== 2"
                  style="margin: 0 5px"/>mm
                <el-input-number
                  v-model="htmlConversion.pageHeight"
                  :min="1"
                  :disabled="htmlConversion.sizeModel !== 2"
                  style="margin: 0 5px"/>mm
              </div>
            </div>
          </el-radio>
        </div>
      </el-radio-group>
      <div style="display: flex; width: 80%; align-items: center; flex-direction: row; margin-bottom: 10px; margin-left: 70px">
        <span>创建类型</span>
        <el-select v-model="htmlConversion.targetType" style="margin-left: 55px; width: 100px">
          <el-option
            v-for="item in targetTypeOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
      </div>
      <div>
        <el-button :disabled="isCreate" type="primary" @click="createFile">创建文件</el-button>
        <el-button v-if="this.downloadUrl" type="success" @click="downloadFile">点击下载</el-button>
        <el-button v-if="this.viewUrl" type="success" @click="open">预览</el-button>
      </div>
    </div>
  </el-dialog>
</template>

<script>
import {downloadFile} from "../../utils/UseableTool";

export default {
  name: "html2ofd",
  data() {
    return {
      htmlConversion: {
        visible: false,
        origin: 1,
        url: '',
        file: null,
        filename: '',
        sizeModel: 1,
        pageSize: "A4",
        pageDirection: 1,
        pageWidth: 210,
        pageHeight: 297,
        targetType: 3
      },
      pageSizeOptions: [
        {
          value: "1189-841",
          label: "A0"
        },
        {
          value: "841-594",
          label: "A1"
        },
        {
          value: "594-420",
          label: "A2"
        },
        {
          value: "420-297",
          label: "A3"
        },
        {
          value: "297-210",
          label: "A4"
        },
        {
          value: "210-148",
          label: "A5"
        },
        {
          value: "148-105",
          label: "A6"
        },
        {
          value: "1000-1414",
          label: "B0"
        },
        {
          value: "707-1000",
          label: "B1"
        },
        {
          value: "500-707",
          label: "B2"
        },
        {
          value: "353-500",
          label: "B3"
        },
        {
          value: "250-353",
          label: "B4"
        },
        {
          value: "176-250",
          label: "B5"
        },
        {
          value: "125-176",
          label: "B6"
        },
      ],
      pageDirectionOptions: [
        {
          value: 1,
          label: "纵向"
        },
        {
          value: 2,
          label: "横向"
        }
      ],
      targetTypeOptions: [
        {
          value: 1,
          label: "OFD"
        },
        {
          value: 3,
          label: "PDF"
        }
      ],
      loading: false,
      downloadUrl: null,
      viewUrl: null,
    }
  },
  computed: {
    isCreate() {
      if (this.htmlConversion.origin === 1 && this.htmlConversion.url === '') {
        return true;
      } else if(this.htmlConversion.origin === 2 && this.htmlConversion.file === null) {
        return true;
      }
      return false;
    }
  },
  methods: {
    /**
     * @责任人：zxh
     * @方法名：beforeClose
     * @方法描述：关闭dialog之前重置所有数据
     * @入参：无
     * @返回值：无
     * @修改时间：2024.05.06
     * @修改类型（新增、删除、修改等）：新增
     * @修改描述：新增函数
     * */
    beforeClose() {
      this.downloadUrl = null;
      this.viewUrl = null;
      this.htmlConversion = {
        visible: false,
        origin: 1,
        url: '',
        file: null,
        filename: '',
        sizeModel: 1,
        pageSize: "A4",
        pageDirection: 1,
        pageWidth: 210,
        pageHeight: 297
      }
    },

    /**
     * @责任人：zxh
     * @方法名：uploadHtmlFile
     * @方法描述：文件上传处理，对格式进行判断
     * @入参：param：所上传的文件对象
     * @返回值：无
     * @修改时间：2024.05.06
     * @修改类型（新增、删除、修改等）：新增
     * @修改描述：新增函数
     * */
    uploadHtmlFile(param) {
      const needType = ["html", "htm", "mhtml", "shtml"];
      let suffix = param.file.name.substring(param.file.name.lastIndexOf(".") + 1);
      if (needType.includes(suffix)) {
        this.htmlConversion.file = param.file;
        this.htmlConversion.filename = param.file.name;
      } else {
        this.$message({
          type: "warning",
          message: "请上传html、htm、mhtml、shtml格式的网页文件",
          duration: 3000
        })
      }
    },

    /**
     * @责任人：zxh
     * @方法名：openDialog
     * @方法描述：打开dialog，作为接口供外部调用
     * @入参：无
     * @返回值：无
     * @修改时间：2024.05.06
     * @修改类型（新增、删除、修改等）：新增
     * @修改描述：新增函数
     * */
    openDialog() {
      this.htmlConversion.visible = true;
    },

    /**
     * @责任人：zxh
     * @方法名：createFile
     * @方法描述：根据网址或上传的网页文件创建ofd文件
     * @入参：无
     * @返回值：无
     * @修改时间：2024.05.06
     * @修改类型（新增、删除、修改等）：新增
     * @修改描述：新增函数
     * */
    createFile() {
      // 重置下载链接
      this.downloadUrl = null;
      this.viewUrl = null;

      // 组建请求参数
      const getRequestData = () => {
        const formData = new FormData();
        if (this.htmlConversion.origin === 1) {
          if (this.htmlConversion.url === '') {
            return null;
          }
          formData.append("url", this.htmlConversion.url);
        } else {
          if (this.htmlConversion.file === null) {
            return null;
          }
          formData.append("file", this.htmlConversion.file);
        }
        if (this.htmlConversion.sizeModel === 1) {
          let direct = "Portrait";
          if (this.htmlConversion.pageDirection === 2) {
            direct = "Landscape";
          }
          formData.append("direct", direct);
          formData.append("pageType", this.htmlConversion.pageSize);
        } else {
          formData.append("pageWidth", this.htmlConversion.pageWidth);
          formData.append("pageHeight", this.htmlConversion.pageHeight);
        }
        formData.append("targetType", this.htmlConversion.targetType);
        return formData;
      }

      // 请求参数为null进行错误提示
      const formData = getRequestData();
      if (formData === null) {
        this.$message({
          type: 'warning',
          message: "请先输入url或上传文件"
        })
        this.loading = false;
        return;
      }
      // 开启loading
      this.loading = true;
      // 发请求
      this.api({
        url: "/maker/htmlCreate",
        method: 'post',
        data: formData
      }).then(data => {
        // 请求成功进行提示
        this.$message({
          type: 'success',
          message: '创建成功'
        })
        // 设置下载链接并重置其余参数
        this.downloadUrl = data.path;
        this.viewUrl = data.url;
        this.htmlConversion.url = '';
        this.htmlConversion.file = null;
        this.htmlConversion.filename = '';
        // 关闭loading
        this.loading = false;
      }).catch(error => {
        // 遇到错误关闭loading进行错误信息打印
        console.log(error);
        this.loading = false;
      })
    },

    /**
     * @责任人：zxh
     * @方法名：downloadFile
     * @方法描述：下载生成的文件
     * @入参：无
     * @返回值：无
     * @修改时间：2024.05.06
     * @修改类型（新增、删除、修改等）：新增
     * @修改描述：新增函数
     * */
    downloadFile() {
      if (this.downloadUrl !== null) {
        // 下载文件名设置为默认值
        let downloadFileName = "html转换结果";
        if (this.htmlConversion.targetType === 1) {
          downloadFileName += ".ofd";
        } else {
          downloadFileName += ".pdf";
        }
        this.$message({
          duration: 1000,
          message: "开始下载",
          type: "success"
        });
        downloadFile(this.downloadUrl, downloadFileName);
      }
    },

    /**
     * @责任人：zxh
     * @方法名：open
     * @方法描述：打开文件
     * @入参：无
     * @返回值：无
     * @修改时间：2024.05.08
     * @修改类型（新增、删除、修改等）：新增
     * @修改描述：新增函数
     * */
    open() {
      window.open(this.viewUrl, "_blank")
    }
  }
}
</script>

<style scoped lang="scss">
</style>
