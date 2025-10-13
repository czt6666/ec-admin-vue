<template>
  <!-- 2023.7.26 lyh add: 打印预处理对话框 -->
<!--  <el-dialog title="打印"  @close="handleClose" width="30%" :close-on-click-modal="false">-->
  <el-dialog id="printDialog" title="打印" :visible.sync="dialogVisible" @close="closeDialog" width="30%"
             :lock-scroll="false" :close-on-click-modal="false">
    <el-form :label-position="labelPosition" label-width="80px" :model="printForm" size="mini" ref="printForm">
<!--      <el-form-item label="打印内容">-->
<!--        <el-checkbox v-model="printForm.mask">掩膜</el-checkbox>-->
<!--        <el-checkbox v-model="printForm.stamp">签章</el-checkbox>-->
<!--        <el-checkbox v-model="printForm.template">模板</el-checkbox>-->
<!--        <el-checkbox v-model="printForm.annotation">注释</el-checkbox>-->
<!--        <el-checkbox v-model="printForm.watermark">水印</el-checkbox>-->
<!--      </el-form-item>-->

<!--      <el-form-item label="打印范围" prop="printRange">-->
<!--        <el-radio-group v-model="chooseRange">-->
<!--          <el-radio label="all" class="radio-btn">所有页</el-radio>-->
<!--          <el-radio label="current" class="radio-btn">当前页</el-radio>-->

<!--          <el-radio label="area" class="radio-btn">-->
<!--            <span style="margin-right: 50px;">从页面</span>-->
<!--            <el-select v-model="selectPage.from" :disabled="chooseRange !== 'area'" size="mini" class="selector"-->
<!--              @change="handleFromSelectorChange">-->
<!--              <el-option v-for="pageNum in pageNums" :value="pageNum" :label="pageNum" :key="pageNum"></el-option>-->
<!--            </el-select>-->
<!--            <span style="margin: 0 10px">到</span>-->
<!--            <el-select v-model="selectPage.to" :disabled="chooseRange !== 'area'" size="mini" class="selector"-->
<!--              @change="handleToSelectorChange">-->
<!--              <el-option v-for="pageNum in pageNums" :value="pageNum" :label="pageNum" :key="pageNum"></el-option>-->
<!--            </el-select>-->
<!--          </el-radio>-->

<!--          <el-radio label="specified" class="radio-btn">-->
<!--            <span style="margin-right: 30px;">指定范围</span>-->
<!--            <el-tooltip style="margin: 4px" effect="dark" content="请输入页码和页码范围(如：1,3,5-8)" :open-delay="500">-->
<!--              <el-input v-model="inputRange" :disabled="chooseRange !== 'specified'" size="mini"-->
<!--                class="input-range"></el-input>-->
<!--            </el-tooltip>-->
<!--          </el-radio>-->
<!--        </el-radio-group>-->

<!--        <div>-->
<!--          <span style="margin-right: 70px;">子范围</span>-->
<!--          <el-select size="mini" :disabled="chooseRange === 'current'" v-model="subRange">-->
<!--            <el-option label="全部页面" value="all"></el-option>-->
<!--            <el-option label="仅奇数页" value="odd"></el-option>-->
<!--            <el-option label="仅偶数页" value="even"></el-option>-->
<!--          </el-select>-->
<!--          <el-checkbox v-model="reverse" style="margin-left: 10px;">逆序打印</el-checkbox>-->
<!--        </div>-->

<!--      </el-form-item>-->

<!--      <el-form-item label="打印处理">-->
<!--        <div>-->
<!--          <span style="margin-right: 50px;">缩放模式</span>-->
<!--          <el-select v-model="zoomMode" size="mini">-->
<!--            <el-option label="无" value="none"></el-option>-->
<!--            <el-option label="适合纸张" value="suitPaper"></el-option>-->
<!--            <el-option label="适合打印边距" value="suitMargin"></el-option>-->
<!--            <el-option label="自定义比例" value="custom"></el-option>-->
<!--            <el-option label="每张纸放置多页" value="one2many"></el-option>-->
<!--            <el-option label="一页打印多张纸" value="manyOnOne"></el-option>-->
<!--            <el-option label="小册子" value="pamphlet"></el-option>-->
<!--          </el-select>-->
<!--        </div>-->

<!--        <div style="margin-top: 20px;">-->
<!--          <span style="margin-right: 40px;">缩放率(%)</span>-->
<!--          <el-input-number v-model="scalePercentage" controls-position="right" :precision="2" :min="10" :max="800"-->
<!--            size="mini" :disabled="zoomMode !== 'custom'"></el-input-number>-->
<!--        </div>-->

<!--      </el-form-item>-->

      <el-form-item label="打印模式">
        <el-radio-group v-model="isRanderPagePrint">
          <el-radio  label="1">默认模式</el-radio>
          <el-radio  label="2">所见即所得</el-radio>
        </el-radio-group>

      </el-form-item>
      <el-form-item label="打印质量控制">
        <el-radio-group v-model="quality">
          <el-radio label="normal" title="打印速度快，但是文档质量一般">一般</el-radio>
          <el-radio label="standard">标清</el-radio>
          <el-radio label="high">高清</el-radio>
          <el-radio label="super" title="打印速度慢，但是文档质量最清晰">超清</el-radio>
        </el-radio-group>

      </el-form-item>
    </el-form>
    <!-- 2023.7.26 lyh add: 打印内容的组件，不展示 -->
<!--    <print-content ref="printer" v-show="false"></print-content>-->
    <span slot="footer" class="dialog-footer">
      <el-button @click="closeDialog">取 消</el-button>
      <el-button type="primary" @click="setConf">确 定</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { formatRange } from "../../utils";
import PrintContent from "../PrintContent/index.vue"
import {mapGetters} from "vuex";
export default {
  name: "PrintDialog",
  components: {
    PrintContent
  },
  // props: {
  //   pageCount: Number,  // 当前打开文档的总页数
  //   currentPage: Number,  // 当前页
  //   fileName: String, // 当前打开的文件的uuid文件名
  // },
  created() {
    // this.initData()
  },
  computed:{
    ...mapGetters(["fileType", "fileId", "pageCount", "pageLayout", 'fileIsChange',"currentPage"]),
  },
  data() {
    return {
      dialogVisible: false,  // 打印框显示
      labelPosition: 'top',  // 表单标签位置
      // 打印表单数据
      printForm: {
        mask: true,  // 掩膜
        stamp: true,  // 签章
        template: true,  // 模板
        annotation: true,  // 注释
        watermark: true,  // 水印
        range: [],  // 要传输的打印范围
        scale: 1.0,  // 缩放大小
        dpi: 96,  // dpi  标清：96  高清：300  超清：600
      },
      chooseRange: 'all',  // 选择要打印的范围
      // 保存页号的数组
      pageNums: [],
      // 用户从选择器选定页面范围时绑定的select数据
      selectPage: {
        from: '1',  // 第一个选择器 “从”哪页
        to: ''  // 第二个选择器 "到"哪页
      },
      inputRange: '',  // 输入的指定范围,
      subRange: 'all',  // 子范围的选择，all：全部页面，odd：仅奇数页，even：仅偶数页
      reverse: false,  // 逆序打印
      zoomMode: 'suitMargin',  // 缩放模式，  none：无， suitPaper：适合纸张，  suitMargin：适合打印边距，  custom：自定义比例，  one2many： 每张纸放置多页，  manyOnOne：一页打印多张纸， pamphlet： 小册子
      scalePercentage: 100,  // 缩放百分比
      quality: 'normal',

      // 定义打印质量映射
      QUALITY_TO_DPI: {
        normal: 96,
        standard: 144,
        high: 300,
        super: 600
      },// 打印质量控制    standard：标清    high：高清    super：超清
      isRanderPagePrint: "1",
    }
  },


  watch:{
    quality: {
      handler(newQuality) {
        this.setPrintQuality();
      },

      // immediate: true
    }
  },
  methods: {
    /**
     * 控制Dlg的显示
     */
    openDialog() {
      this.dialogVisible = true
    },

    /**
     * 对话框关闭事件
     */
    closeDialog() {
      if (this.dialogVisible) {
        this.dialogVisible = false
      }
      // 重置数据
      // Object.assign(this.$data, this.$options.data())
      // this.initData()
    },

    /**
     * 初始化页面数据
     */
    // initData() {
    //   // 初始化页号数组
    //   for (let i = 1; i <= this.pageCount; i++) {
    //     this.pageNums.push(`${i}`)
    //   }
    //   // 初始化第二个选择器
    //   this.selectPage.to = `${this.pageCount}`
    //   // input 框
    //   this.inputRange = `1-${this.pageCount}`
    // },

    /**
     * 处理第一个选择器的回调函数，使得该值不比“to”的值大
     * @param value
     */
    handleFromSelectorChange(value) {
      const numFrom = Number(value)
      const numTo = Number(this.selectPage.to)
      if (numFrom > numTo) {
        this.selectPage.from = this.selectPage.to
      }
    },

    /**
     * 处理第二个选择器的回调函数，使得该值不比"from"的值小
     * @param value
     */
    handleToSelectorChange(value) {
      const numTo = Number(value)
      const numFrom = Number(this.selectPage.from)
      if (numTo < numFrom) {
        this.selectPage.to = this.selectPage.from
      }
    },

    /**
     * 开始打印
     */
    // startPrint() {
    //   // 打印范围处理
    //   if (this.chooseRange === 'all') {
    //     // 选择所有页则直接传入空数组
    //     this.printForm.range = []
    //   } else if (this.chooseRange === 'current') {
    //     // 选择当前页则传入当前页
    //     // this.printForm.printRange = formatRange(this.currentPage)
    //     this.printForm.range.push(this.currentPage + 1)
    //   } else if (this.chooseRange === 'area') {
    //     // 选择“从页面”则传入指定范围页
    //     // 拼接范围字符串
    //     let strRange = this.selectPage.from + '-' + this.selectPage.to
    //     // 获取范围
    //     this.printForm.range = formatRange(strRange)
    //
    //   } else if (this.chooseRange === 'specified') {
    //     // 选择“指定范围”则传入输入的指定范围
    //     // 获取格式化后的数据
    //     const printRange = formatRange(this.inputRange)
    //     // 如果返回了null
    //     if (!printRange) {
    //       this.$message.error('请输入正确的范围')
    //       return false
    //     }
    //     this.printForm.range = printRange
    //   }
    //
    //   // 子范围的处理
    //   if (this.subRange === 'odd') {
    //     // 奇数情况
    //     // 额外判断选择了“所有页”的情况
    //     if (this.chooseRange === 'all') {
    //       this.printForm.range = this.pageNums.filter(value => value % 2 !== 0)
    //     } else {
    //       this.printForm.range = this.printForm.range.filter(value => value % 2 !== 0)
    //     }
    //
    //   } else if (this.subRange === 'even') {
    //     // 偶数情况
    //     // 额外判断选择了“所有页”的情况
    //     if (this.chooseRange === 'all') {
    //       this.printForm.range = this.pageNums.filter(value => value % 2 === 0)
    //     } else {
    //       this.printForm.range = this.printForm.range.filter(value => value % 2 === 0)
    //     }
    //   }
    //
    //   // 逆序打印处理
    //   if (this.reverse) {
    //     // 选择“所有页”时单独处理
    //     if (this.chooseRange === 'all') {
    //       this.printForm.range = [...this.pageNums]
    //     }
    //     this.printForm.range.reverse()
    //   }
    //
    //   // 打印缩放的处理
    //   if (this.zoomMode === 'custom') {
    //     // 当选择自定义的比例时对百分数转为小数且保留1位小数
    //     this.printForm.scale = (this.scalePercentage / 100).toFixed(1)
    //   } else if (this.zoomMode === 'none') {
    //     // 选择“无”时
    //
    //   } else if (this.zoomMode === 'suitPaper') {
    //     // 选择"适合纸张"时
    //
    //   } else if (this.zoomMode === 'suitMargin') {
    //     // 选择“适合打印边距”时
    //
    //   } else if (this.zoomMode === 'one2many') {
    //     // 选择“每张纸放置多页”时
    //
    //   } else if (this.zoomMode === 'manyOnOne') {
    //     // 选择"一页打印多张纸"时
    //
    //   } else if (this.zoomMode === 'pamphlet') {
    //     // 选择“小册子”时
    //
    //   }
    //
    //   // 打印质量控制
    //   if (this.quality === 'standard') {
    //     // 标清情况
    //     this.printForm.dpi = 96
    //   } else if (this.quality === 'high') {
    //     // 高清情况
    //     this.printForm.dpi = 300
    //   } else if (this.quality === 'super') {
    //     // 超清情况
    //     this.printForm.dpi = 600
    //   }
    //
    //   // 准备要发送的数据
    //   const data = {
    //     fileId: this.fileId,
    //     dpi: this.printForm.dpi,
    //     scale: this.printForm.scale,
    //     template: this.printForm.template,
    //     annotation: this.printForm.annotation,
    //     stamp: this.printForm.stamp,
    //     watermark: this.printForm.watermark,
    //     range: this.printForm.range,
    //   }
    //   // console.log('待发送数据 ==> ', data)
    //
    //   this.api({
    //     url: '/print/printCommon',
    //     method: 'POST',
    //     data
    //   }).then(data => {
    //     // console.log('返回的数据 ==> ', data)
    //     console.log(data)
    //     this.$refs.printer.startPrint(data)
    //
    //   }).catch(error => {
    //     // console.log('错误提示 ==> ', error)
    //     // this.$message.error(error.msg)
    //
    //   })
    //   this.handleClose()
    // },
    setPrintQuality() {
      // 打印质量控制
      const dpi = this.QUALITY_TO_DPI[this.quality] || 96;
      this.$store.commit('SET_PRINT_DPI', dpi);
    },
    setConf(){
      // 打印模式设置
      this.$store.commit("SET_PRINT_Type", this.isRanderPagePrint);
      this.$store.commit("SET_PRINT_FILE_NAME", this.fileId);
      this.$store.commit("CHANGE_IS_PRINT", true);
      this.dialogVisible = false
    }
  }
}
</script>

<style scoped lang="scss">
// 单选框样式
.radio-btn {
  display: block;
  margin-bottom: 20px;
}

// 选择器样式
.selector {
  width: 25%;
}

// 指定范围的输入框
.input-range {
  width: 57%;
}

// 修改el对话框默认的样式让其永远居中
/deep/ .el-dialog {
  display: flex;
  flex-direction: column;
  margin: 0 !important;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

/deep/ .el-dialog .el-dialog__body {
  min-height: 230px;
  flex: 1;
  overflow: auto;
}
</style>
