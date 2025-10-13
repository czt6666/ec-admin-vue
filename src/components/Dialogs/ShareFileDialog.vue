<template>
  <el-dialog id="shareFileDialog" title="分享" :close-on-click-modal="false" :visible.sync="attrvisibale" width="550px" top="10vh">
    <!-- 新分享弹窗 -->
    <!-- 分享权限设置部分 -->
    <div class="shareDialog">
      <el-form ref="shareForm" :model="shareForm" label-position="top">
        <el-form-item label="编辑权限" class="shareForm">
          <el-checkbox-group v-model="shareForm.Checked" @change="setButtonShare">
            <el-checkbox v-for="item in settingsOpt" :label="item.key" :key="item.key" name="type"
            >{{
                item.name
              }}
            </el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="文档权限" class="shareForm">
          <el-checkbox-group v-model="shareForm.Checked" @change="setButtonShare">
            <el-checkbox v-for="item in fileOpt"  :label="item.key" :key="item.key" name="type">{{
                item.name
              }}
            </el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="预览水印" label-position="left" class="shareForm">
          <el-input v-model="shareForm.waterMark" size="small" maxlength="20" placeholder="最长输入20个字符"
                    v-model.trim="shareForm.waterMark" show-word-limit style="width: 75%;"
                    @input="setButtonShare" clearable></el-input>
        </el-form-item>
        <el-form-item label="有效期" class="shareForm">
          <el-radio-group v-model="shareForm.expirationDate" @change="setButtonShare">
            <el-radio class="sharelifespan" label=604800>7天有效</el-radio>
            <el-radio class="sharelifespan" label=259200>3天有效</el-radio>
            <el-radio class="sharelifespan" label=86400>1天有效</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <div class="warning">
        <p>
          分享文档会默认<strong>保存</strong>当前文档相关操作
        </p>
        <p>
          分享界面权限默认包含预览，编辑权限需手动选择
        </p>
        <p>
          若无相关权限则表示，分享时未设置相关权限
        </p>
        <p>水印默认为“永中webOFD系统”，文档有效期默认为7天有效</p>
      </div>
    </div>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" @click="shareOrCopyButton" :loading="getUrlOver">{{ shareOrCopyCode }}</el-button>
      <el-button @click="closeDialog">取 消</el-button>
    </div>
  </el-dialog>
</template>

<script>

import {mapGetters} from "vuex";
import {copyToClipboard} from "../../utils/UseableTool";
import {downloadFile} from "../../utils/UseableTool";

export default {
  name: "ShareDialog",

  data() {
    return {
      input: '',
      attrvisibale: false, // 控制文档属性可见或隐藏  // hyj
      shareOrCopyCode: "分享",
      getUrlOver: false,
      shareForm: {
        Checked: [], //选中的编辑权限
        expirationDate: "604800",
        //分享预览水印内容设置
        waterMark: '永中webOFD系统',
      },
      //分享编辑操作权限设置
      settingsOpt: [
        {
          name: '文档属性',
          key: "title_xFileAttribute",
        },
        {
          name: '签章',
          key: "topMenu_xSign",
        },
        {
          name: '批注',
          key: "topMenu_xAnnos",
        },
        {
          name: '大纲',
          key: "leftBar_outline",
        },
        {
          name: '语义树',
          key: "leftBar_tags",
        },
        // {
        //     name: '注释（导航栏）',
        //     key: "leftBar_annotations",
        // },
        {
          name: '附件',
          key: "leftBar_attachment",
        },
        {
          name: '文档处理',
          key: "title_xProcessor",
        }
      ],
      //分享文档操作权限设置
      fileOpt: [
        {
          name: '下载',
          key: "topMenu_xDownload",
          // value: false
        },
        {
          name: '打印',
          key: "topMenu_xPrint",
          // value: false
        }
      ],
      permissionDto: {},
      shareFileUrl: '',
    }
  },

  computed: {
    ...mapGetters(["isBarShow", "topMenuComp", "titleComp", "fileId", 'fileShowName', "fileType", "fileIsChange", "esealIsChange","filePermission"]),
  },


  watch: {
    fileIsChange(val) {
      if (val) {
        this.shareOrCopyCode = "分享"
      }
    },
    esealIsChange(val) {
      if (val) {
        this.shareOrCopyCode = "分享"
      }
    }

  },
  methods: {

    /**
     * @责任人：hyj
     * @方法名：
     * @方法描述：关闭分享对话框
     * @入参：
     * @返回值：
     * @修改时间：2024.12.6
     * @修改类型（新增、删除、修改等）：新增
     * @修改描述：新增函数
     * */
    closeDialog() {
      this.attrvisibale = false
    },

    filterOptions(json, optionsArray) {
      const filteredOptions = optionsArray.filter(option => {
        const [section, key] = option.key.split('_');
        return json[section] && json[section][key] === true;
      });
      return filteredOptions;
    },

    /**
     * @责任人：lz
     * @方法名：
     * @方法描述：打开分享对话框
     * @入参：
     * @返回值：
     * @修改时间：2024.6.20
     * @修改类型（新增、删除、修改等）：新增
     * @修改描述：新增函数
     * */
    openDialog() {
      // 如果当前无文件打开
      if (this.fileId === undefined || this.fileId === null || this.fileId === "") {
        this.$message.closeAll();
        this.$message({
          duration: 600,
          message: "请先打开文件",
          type: "info",
        })
      } else {
        let permissionJson = {
          "title": JSON.parse(JSON.stringify(this.titleComp)) ,
          "leftBar":  JSON.parse(JSON.stringify(this.isBarShow)),
          "topMenu": JSON.parse(JSON.stringify(this.topMenuComp))
        }
        // if (this.filePermission[])

        permissionJson.topMenu.xDownload = permissionJson.topMenu.xDownload && this.filePermission.export
        permissionJson.topMenu.xPrint = permissionJson.topMenu.xPrint && this.filePermission.print
        permissionJson.topMenu.xSign = permissionJson.topMenu.xSign && this.filePermission.sign
        permissionJson.topMenu.xAnnos = permissionJson.topMenu.xAnnos && this.filePermission.anno
        if  (!this.filePermission.edit) {
          permissionJson.topMenu.xAnnos = false
          permissionJson.topMenu.xSign = false
          permissionJson.topMenu.xDownload = false
        }

        this.settingsOpt = this.filterOptions(permissionJson,this.settingsOpt)
        this.fileOpt = this.filterOptions(permissionJson,this.fileOpt)

        return new Promise((resolve, reject) => {
          if (this.fileIsChange || this.esealIsChange) {
            this.$confirm("您当前操作会将文档保存后分享给他人，确定要继续操作吗？", "提示", {
              confirmButtonText: "是",
              cancelButtonText: "否",
              type: "warning",
              lockScroll: false
            }).then(async () => {
              await this.$bus.$emit("saveFile", 3)
            }).then(() => {
              // 控制弹窗可见
              this.attrvisibale = true;
              resolve()
            }).catch((e) => {
              reject()
            })
          } else {
            resolve();
            // 控制弹窗可见
            this.attrvisibale = true;
          }
        })
      }
    },

    /**
     * @责任人：hyj
     * @方法名：shareOrCopyButton
     * @方法描述：分享复制链接按钮切换
     * @入参：
     * @返回值：
     * @修改时间：2024.7.15
     * @修改类型（新增、删除、修改等）：新增
     * @修改描述：新增函数
     * */
    shareOrCopyButton() {
      if (this.shareOrCopyCode === "分享") {
        this.generateShareUrl()
      } else {
        this.copyURL(this.shareFileUrl)
      }
    },


    /**
     * @责任人：lz
     * @方法名：
     * @方法描述：生成分享链接
     * @入参：
     * @返回值：
     * @修改时间：2024.6.21
     * @修改类型（新增、删除、修改等）：新增
     * @修改描述：新增函数
     * */
    generateShareUrl() {
      this.getUrlOver = true
      // this.attrvisibale = false
      Object.keys(this.isBarShow).forEach(key => {
        let newKey = `leftBar_${key}`;
        this.permissionDto[newKey] = this.isBarShow[key];
        this.permissionDto[newKey] = true
      });
      Object.keys(this.topMenuComp).forEach(key => {
        let newKey = `topMenu_${key}`;
        this.permissionDto[newKey] = this.topMenuComp[key];
        this.permissionDto[newKey] = true
      });
      Object.keys(this.titleComp).forEach(key => {
        let newKey = `title_${key}`;
        this.permissionDto[newKey] = this.titleComp[key];
        this.permissionDto[newKey] = true
      });
      let allPermissions = ["title_xFileAttribute", "title_xProcessor", "topMenu_xSign", "topMenu_xAnnos", "leftBar_outline", "leftBar_tags", "leftBar_attachment", "topMenu_xDownload", "topMenu_xPrint"]
      let notChecked = allPermissions.filter(item => !this.shareForm.Checked.includes(item))

      Object.keys(this.permissionDto).forEach(key => {
        notChecked.forEach(checkKey => {
          if (checkKey === key) {
            this.permissionDto[key] = false
          }
        })
      })
      this.permissionDto.watermark_text = this.shareForm.waterMark
      this.permissionDto.expiration_date = this.shareForm.expirationDate
      this.shareFileApi()
    },


    /**
     * @责任人：hyj
     * @方法名：
     * @方法描述：发送分享请求
     * @入参：
     * @返回值：
     * @修改时间：2024.7.10
     * @修改类型（新增、删除、修改等）：新增
     * @修改描述：新增函数
     * */
    shareFileApi() {
      const form = new FormData();
      form.append("fileId", this.fileId);
      form.append("fileShowName", this.fileShowName);
      form.append("fileType", this.fileType === 0 ? 1 : 3);
      Object.keys(this.permissionDto).forEach(key => {
        form.append(key, this.permissionDto[key])
      })
      this.api({
        url: '/viewer/shareFile',
        method: 'post',
        data: form
      }).then(data => {
        this.getUrlOver = false
        this.shareOrCopyCode = "复制链接"
        this.shareFileUrl = data
      }).catch((e) => {
        console.log(e)
      })
    },

    /**
     * @责任人：hyj
     * @方法名：setButtonShare
     * @方法描述：表单内选项改变将按钮重置为分享
     * @入参：
     * @返回值：
     * @修改时间：2024.7.15
     * @修改类型（新增、删除、修改等）：新增
     * @修改描述：新增函数
     * */
    setButtonShare() {
      this.shareOrCopyCode = "分享"
    },

    /**
     * @责任人：hyj
     * @方法名：copyURL
     * @方法描述：复制url
     * @入参：
     * @返回值：
     * @修改时间：2024.7.15
     * @修改类型（新增、删除、修改等）：新增
     * @修改描述：新增函数
     * */
    copyURL(data) {
      const h = this.$createElement;
      //拼接复制分享链接内容
      let shareSentence = '【永中webOFD】' + this.fileShowName + ' 此链接有效期为' + this.shareForm.expirationDate / 3600 / 24 + '天 ' + data
      copyToClipboard(shareSentence)
      this.$message.closeAll();
      this.$message({
        duration: 800,
        message: "已复制到剪切板",
        type: "success",
      })
    }

  }
}
</script>

<style scoped lang="scss">
.sharelifespan {
  display: block;
  margin-bottom: 10px;
}

.warning {
  padding: 8px 16px;
  background-color: #E1EEF6;
  border-radius: 4px;
  border-left: 5px solid #409eff;
}

.shareDialog {
  // border: 1px solid #dcdfe6;
  box-shadow: 0 2px 4px rgba(0, 0, 0, .12), 0 0 6px rgba(0, 0, 0, .04);
  padding: 5px;
  border-radius: 10px;
}

.shareForm {
  margin-bottom: 0 !important;
}

.shareForm /deep/ .el-form-item__label {
  // color: #0f0;
  /* 例如，将标签文本颜色改为绿色 */
  font-size: 15px;
  font-weight: bold;
  /* 设置标签文本大小 */
  /* 其他样式... */
}
</style>
