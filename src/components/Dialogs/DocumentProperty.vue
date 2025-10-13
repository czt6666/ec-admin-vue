<template>
  <!-- 文档属性弹窗 -->
  <el-dialog title="文档属性" id="documentProperty" :visible.sync="DocAttrvisibale" :lock-scroll="false" width="550px"
             top="10vh" :close-on-click-modal="false">
    <!-- 以公文元数据的高度为准，撑开整个文档属性的框高 -->
    <div style="height: 576px;">
      <el-tabs v-model="activeName">
        <!-- 属性一般消息 -->
        <el-tab-pane label="一般" name="first">
          <!-- 文件信息及封面 -->
          <div style="display: flex; border: 1px solid #EBEBEB;">
            <!--<div style="width:60%">-->
            <div :class="`fileInfo_` + ie11Flag">
              <el-descriptions title="文件信息" border size="small" :column="1" :labelStyle="{ 'width': '65px' }"
                               :contentStyle="{ 'font-size': '12px', 'white-space': 'normal!important', 'text-overflow': 'ellipsis', 'display': '-webkit-box', 'overflow-y': 'auto', 'word-wrap': 'break-word', '-webkit-line-clamp': '1', '-webkit-box-orient': 'vertical' }">
                <el-descriptions-item label="文件ID:">{{
                    attrData.dataFile.DocID
                  }}
                </el-descriptions-item>
                <el-descriptions-item label="文件名:">
                  <div :title="attrData.dataFile.filename">
                    {{ attrData.dataFile.filename }}
                  </div>
                </el-descriptions-item>
                <el-descriptions-item label="大小:">{{
                    attrData.dataFile.fileSize
                  }}
                </el-descriptions-item>
                <el-descriptions-item label="页数:">{{
                    attrData.dataFile.filePage
                  }}
                </el-descriptions-item>
              </el-descriptions>
            </div>
            <!-- dcs版本无封面 -->
            <div style="width: 2%;"></div>
            <div style="width:37% ;float: right;">
              <el-descriptions title="封面" border size="small">
              </el-descriptions>
              <div style="display: flex;">
                <div style="border: 1px solid #EBEBEB; ">
                  <img :src="btnImages.cover" alt="" />
                </div>
                <div>
                  <el-button plain size="small" style="margin-left: 5px;" disabled>替换封面</el-button>
                  <el-button plain size="small" style="margin-left: 5px;" disabled>删除封面</el-button>
                </div>
              </div>
            </div>
          </div>
          <!-- 创建信息 -->
          <el-descriptions title="创建信息" border size="small" :column="1" :labelStyle="{ 'width': '100px' }">
            <el-descriptions-item label="创作者:">{{
                attrData.dataCreate.Creator
              }}
            </el-descriptions-item>
            <el-descriptions-item label="创建时间:">{{
                attrData.dataCreate.CreationDate
              }}
            </el-descriptions-item>
            <el-descriptions-item label="创作者版本:">{{
                attrData.dataCreate.CreatorVersion
              }}
            </el-descriptions-item>
            <el-descriptions-item label="创建者信息:">{{
                attrData.dataCreate.CreatorInfo
              }}
            </el-descriptions-item>
          </el-descriptions>
          <!-- 描述信息 -->
          <div>
            <el-descriptions title="描述信息" border size="small">
            </el-descriptions>
            <div style=" border: 1px solid #EBEBEB;">
              <el-form label-width="120px" :model="attrData.formDisp" :label-position="labelPosition" size="mini"
                       class="formItem" :disabled="!filePermission.edit">
                <el-form-item label="标题：">
                  <el-input v-model="attrData.formDisp.Title"></el-input>
                </el-form-item>
                <el-form-item label="作者：">
                  <el-input v-model="attrData.formDisp.Author"></el-input>
                </el-form-item>
                <el-form-item label="主题:">
                  <el-input v-model="attrData.formDisp.Subject"></el-input>
                </el-form-item>
                <el-form-item label="关键词:">
                  <el-input v-model="attrData.formDisp.Keywords"></el-input>
                </el-form-item>
                <el-form-item label="修改时间:">
                  <el-input id="describeModDate" v-model="attrData.formDisp.ModDate" :disabled="true">
                  </el-input>
                </el-form-item>
                <el-form-item label="文档摘要:">
                  <el-input v-model="attrData.formDisp.Abstract"></el-input>
                </el-form-item>
                <el-form-item label="文档类型:">
                  <el-input v-model="attrData.formDisp.DocUsage"></el-input>
                </el-form-item>
              </el-form>
            </div>
          </div>
          <!-- </div> -->
        </el-tab-pane>
        <!-- 属性安全性消息 -->
        <el-tab-pane label="安全性" name="second">
          <div style=" border: 1px solid #EBEBEB;">
            <div style="font-size: 14px;font-weight: 700;color: #303133">文档限制：</div>
            <div>
              <div style="width: 150px;display: inline-block">编辑:</div>
              <el-select v-model="editvalue" disabled placeholder="">
                <!--                    <el-option-->
                <!--                      v-for="item in options"-->
                <!--                      :key="item.value"-->
                <!--                      :label="item.label"-->
                <!--                      :value="item.value">-->
                <!--                    </el-option>-->
              </el-select>
            </div>

            <div>
              <div style="width: 150px;display: inline-block">注释:</div>
              <el-select v-model="annovalue" disabled placeholder="">
                <!--                    <el-option-->
                <!--                      v-for="item in options"-->
                <!--                      :key="item.value"-->
                <!--                      :label="item.label"-->
                <!--                      :value="item.value">-->
                <!--                    </el-option>-->
              </el-select>
            </div>

            <div>
              <div style="width: 150px;display: inline-block">导出:</div>
              <el-select v-model="exportvalue" disabled placeholder="">
                <!--                    <el-option-->
                <!--                      v-for="item in options"-->
                <!--                      :key="item.value"-->
                <!--                      :label="item.label"-->
                <!--                      :value="item.value">-->
                <!--                    </el-option>-->
              </el-select>
            </div>

            <div>
              <div style="width: 150px;display: inline-block">签名:</div>
              <el-select v-model="signaturevalue" disabled placeholder="">
                <!--                    <el-option-->
                <!--                      v-for="item in options"-->
                <!--                      :key="item.value"-->
                <!--                      :label="item.label"-->
                <!--                      :value="item.value">-->
                <!--                    </el-option>-->
              </el-select>
            </div>

            <div>
              <div style="width: 150px;display: inline-block">水印:</div>
              <el-select v-model="watermarkvalue" disabled placeholder="">
                <!--                    <el-option-->
                <!--                      v-for="item in options"-->
                <!--                      :key="item.value"-->
                <!--                      :label="item.label"-->
                <!--                      :value="item.value">-->
                <!--                    </el-option>-->
              </el-select>
            </div>

            <div>
              <div style="width: 150px;display: inline-block">截屏:</div>
              <el-select v-model="screenshotvalue" disabled placeholder="">
                <!--                    <el-option-->
                <!--                      v-for="item in options"-->
                <!--                      :key="item.value"-->
                <!--                      :label="item.label"-->
                <!--                      :value="item.value">-->
                <!--                    </el-option>-->
              </el-select>
            </div>

            <div>
              <div style="width: 150px;display: inline-block">打印:</div>
              <el-select v-model="printvalue" disabled placeholder="">
                <!--                    <el-option-->
                <!--                      v-for="item in options"-->
                <!--                      :key="item.value"-->
                <!--                      :label="item.label"-->
                <!--                      :value="item.value">-->
                <!--                    </el-option>-->
              </el-select>
            </div>
            <div>
              <div style="width: 150px;display: inline-block">打印份数:</div>
              <el-input-number v-model="num" controls-position="right" :min="0" :max="0" style="width: 202px; "
                               class="printNum" disabled></el-input-number>
            </div>
            <div>
              <div class="block">
                <span class="demonstration" style="width: 150px;display: inline-block">有效期:</span>
                <el-date-picker v-model="valuedata" type="daterange" range-separator="至" start-placeholder="开始日期"
                                end-placeholder="结束日期" disabled class="dataRange">
                </el-date-picker>
              </div>
            </div>
          </div>
        </el-tab-pane>

        <!-- 属性视图化消息 -->
        <el-tab-pane label="初始化视图" name="third">
          <div style=" border: 1px solid #EBEBEB;margin-bottom: 10px">
            <div>
              <div style="font-size: 14px;font-weight: 700;color: #303133">布局和缩放</div>
              <div>
                <div style="width: 150px;display: inline-block">页面窗口模式:</div>
                <el-select v-model="visionvalue" disabled placeholder="常规模式">
                  <el-option v-for="item in visionoptions" :key="item.value" :label="item.label" :value="item.value">
                  </el-option>
                </el-select>
              </div>

              <div>
                <div style="width: 150px;display: inline-block">页面布局:</div>
                <el-select v-model="visionvalue" disabled placeholder="单页">
                  <el-option v-for="item in visionoptions" :key="item.value" :label="item.label" :value="item.value">
                  </el-option>
                </el-select>
              </div>

              <div>
                <div style="width: 150px;display: inline-block">标题栏显示:</div>
                <el-select v-model="visionvalue" disabled placeholder="文件名称">
                  <el-option v-for="item in visionoptions" :key="item.value" :label="item.label" :value="item.value">
                  </el-option>
                </el-select>
              </div>

              <div>
                <div style="width: 150px;display: inline-block">缩放模式:</div>
                <el-select v-model="visionvalue" disabled placeholder="默认(100%)">
                  <el-option v-for="item in visionoptions" :key="item.value" :label="item.label" :value="item.value">
                  </el-option>
                </el-select>
              </div>

              <div>
                <div style="width: 150px;display: inline-block">缩放值:</div>
                <el-select v-model="visionvalue" disabled placeholder="">
                  <el-option v-for="item in visionoptions" :key="item.value" :label="item.label" :value="item.value">
                  </el-option>
                </el-select>
              </div>
            </div>
          </div>

          <div style=" border: 1px solid #EBEBEB;">
            <div>
              <div style="font-size: 14px;font-weight: 700;color: #303133">用户界面选择</div>
              <div>
                <div style="width: 150px;display: inline-block">工具栏:</div>
                <el-select v-model="visionvalue" disabled placeholder="不隐藏">
                  <el-option v-for="item in visionoptions" :key="item.value" :label="item.label" :value="item.value">
                  </el-option>
                </el-select>
              </div>

              <div>
                <div style="width: 150px;display: inline-block">菜单栏:</div>
                <el-select v-model="visionvalue" disabled placeholder="不隐藏">
                  <el-option v-for="item in visionoptions" :key="item.value" :label="item.label" :value="item.value">
                  </el-option>
                </el-select>
              </div>

              <div>
                <div style="width: 150px;display: inline-block">主窗口之外的其他窗体:</div>
                <el-select v-model="visionvalue" disabled placeholder="不隐藏">
                  <el-option v-for="item in visionoptions" :key="item.value" :label="item.label" :value="item.value">
                  </el-option>
                </el-select>
              </div>
            </div>
          </div>
        </el-tab-pane>
        <!-- 属性元数据消息 -->
        <el-tab-pane label="元数据" name="fourth">
          <!-- 元数据-编辑 -->
          <div style="border: 1px solid #EBEBEB;" v-permission="'isAddMetaData'">
            <el-descriptions title="编辑" border size="small">
            </el-descriptions>
            <div style=" border: 1px solid #EBEBEB;">
              <el-form label-width="120px" :model="attrData.formMetaDataCr" :label-position="labelPosition" size="mini"
                       class="formItem" :disabled="!filePermission.edit">
                <el-form-item label="数据名称：">
                  <el-select v-model="attrData.formMetaDataCr.dataName" filterable allow-create default-first-option
                             class="selectDataType" @change="setMetaDataTypeChange">
                    <el-option v-for="item in attrData.formMetaDataCr.nameOptions" :key="item.value" :label="item.label"
                               :value="item.value" :disabled="item.disabled">
                    </el-option>
                  </el-select>
                </el-form-item>
                <el-form-item label="类型：">
                  <el-select v-model="attrData.formMetaDataCr.dataType" class="selectDataType">
                    <el-option v-for="item in attrData.formMetaDataCr.typeOptions" :key="item.value" :label="item.label"
                               :value="item.value" :disabled="item.disabled"></el-option>
                  </el-select>
                </el-form-item>
                <el-form-item label="数据值：">
                  <el-input v-model="attrData.formMetaDataCr.dataValue"></el-input>
                </el-form-item>
                <el-form-item>
                  <el-button style="float: right;" :disabled="metadataDeleBTable || !filePermission.edit"
                             @click="deleteMetaData">删除
                  </el-button>
                  <el-button style="float: right; margin-right: 10px;" :disabled=metadataAddBTable @click="addMetaData">添加
                  </el-button>
                </el-form-item>
              </el-form>
            </div>
          </div>
          <!-- 元数据-属性 -->
          <el-descriptions title="属性" border size="small">
          </el-descriptions>
          <el-table :data="attrData.dataMetaData" :key="tableKey" border size="mini"
                    :header-cell-style="{ background: '#FAFAFA', color: '#606266' }" style="width: 100%" max-height="350"
                    @row-click="cilckMetadataRow" highlight-current-row>
            <!-- dcs版本无元数据编辑，要调整显示元数据的高度 -->
            <!-- <el-table :data="attrData.dataMetaData" border size="mini"
    :header-cell-style="{ background: '#FAFAFA', color: '#606266' }" style="width: 100%" max-height="516"> -->
            <el-table-column prop="dataName" label="名称" width="180">
            </el-table-column>
            <el-table-column prop="dataValue" label="值" width="180">
            </el-table-column>
            <el-table-column prop="dataType" label="类型" width="155">
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <!-- 属性公文元数据消息 -->
        <el-tab-pane label="公文元数据" name="fifth">
          <el-form label-width="120px" :model="attrData.formGW" :label-position="labelPosition" size="mini"
                   class="formItemGW" :disabled="!filePermission.edit">
            <el-form-item label="公文标识：">
              <el-input v-model="attrData.formGW.GWBS"
                        @blur="changeMetaData('GWBS', '公文标识', '文本', attrData.formGW.GWBS)"></el-input>
            </el-form-item>
            <el-form-item label="文种：">
              <el-input v-model="attrData.formGW.WZ"
                        @blur="changeMetaData('WZ', '文种', '文本', attrData.formGW.WZ)"></el-input>
            </el-form-item>
            <el-form-item label="份号:">
              <el-input v-model="attrData.formGW.FH"
                        @blur="changeMetaData('FH', '份号', '文本', attrData.formGW.FH)"></el-input>
            </el-form-item>
            <el-form-item label="密级和保密期限:">
              <el-input v-model="attrData.formGW.MJHBMQX"
                        @blur="changeMetaData('MJHBMQX', '密级和保密期限', '文本', attrData.formGW.MJHBMQX)"></el-input>
            </el-form-item>
            <el-form-item label="紧急程度:">
              <el-input v-model="attrData.formGW.JJCD"
                        @blur="changeMetaData('JJCD', '紧急程度', '文本', attrData.formGW.JJCD)"></el-input>
            </el-form-item>
            <el-form-item label="发文机关标志:">
              <el-input v-model="attrData.formGW.FWJGBZ"
                        @blur="changeMetaData('FWJGBZ', '发文机关标志', '文本', attrData.formGW.FWJGBZ)"></el-input>
            </el-form-item>
            <el-form-item label="发文字号:">
              <el-input v-model="attrData.formGW.FWZH"
                        @blur="changeMetaData('FWZH', '发文字号', '文本', attrData.formGW.FWZH)"></el-input>
            </el-form-item>
            <el-form-item label="签发人:">
              <el-input v-model="attrData.formGW.QFR"
                        @blur="changeMetaData('QFR', '签发人', '文本', attrData.formGW.QFR)"></el-input>
            </el-form-item>
            <el-form-item label="标题:">
              <el-input v-model="attrData.formGW.BT"
                        @blur="changeMetaData('BT', '标题', '文本', attrData.formGW.BT)"></el-input>
            </el-form-item>
            <el-form-item label="主送机关:">
              <el-input v-model="attrData.formGW.ZSJG"
                        @blur="changeMetaData('ZSJG', '主送机关', '文本', attrData.formGW.ZSJG)"></el-input>
            </el-form-item>
            <el-form-item label="附件说明:">
              <el-input v-model="attrData.formGW.FJSM"
                        @blur="changeMetaData('FJSM', '附件说明', '文本', attrData.formGW.FJSM)"></el-input>
            </el-form-item>
            <el-form-item label="签发机关署名：">
              <el-input v-model="attrData.formGW.FWJGSM"
                        @blur="changeMetaData('FWJGSM', '签发机关署名', '文本', attrData.formGW.FWJGSM)"></el-input>
            </el-form-item>
            <el-form-item label="成文日期：">
              <el-input v-model="attrData.formGW.CWRQ" placeholder="格式：yyyy-mm-dd或yyyy/mm/dd"
                        @blur="changeMetaData('CWRQ', '成文日期', '日期', attrData.formGW.CWRQ)"></el-input>
            </el-form-item>
            <el-form-item label="附注：">
              <el-input v-model="attrData.formGW.FZ"
                        @blur="changeMetaData('FZ', '附注', '文本', attrData.formGW.FZ)"></el-input>
            </el-form-item>
            <el-form-item label="抄送机关：">
              <el-input v-model="attrData.formGW.CSJG"
                        @blur="changeMetaData('CSJG', '抄送机关', '文本', attrData.formGW.CSJG)"></el-input>
            </el-form-item>
            <el-form-item label="印发机关：">
              <el-input v-model="attrData.formGW.YFJG"
                        @blur="changeMetaData('YFJG', '印发机关', '文本', attrData.formGW.YFJG)"></el-input>
            </el-form-item>
            <el-form-item label="印发日期：">
              <el-input v-model="attrData.formGW.YFRQ" placeholder="格式：yyyy-mm-dd或yyyy/mm/dd"
                        @blur="changeMetaData('YFRQ', '印发日期', '日期', attrData.formGW.YFRQ)"></el-input>
            </el-form-item>
            <el-form-item label="发布层次：">
              <el-input v-model="attrData.formGW.FBCC"
                        @blur="changeMetaData('FBCC', '发布层次', '文本', attrData.formGW.FBCC)"></el-input>
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>
    </div>
    <div slot="footer" class="dialog-footer">
      <el-button @click=closeDialog>取 消</el-button>
      <el-button type="primary" @click="setMetaData" v-permission="'isAddMetaData'">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { mapGetters } from "vuex";
import imageMap from "../../utils/imageMap";

export default {
  name: "DocumentProperty",
  data() {
    return {
      tableKey: new Date().getTime(),
      btnImages: imageMap,
      metadataDeleBTable: true,// 删除
      DocAttrvisibale: false, // 控制文档属性可见或隐藏  // hyj
      activeName: 'first', // 文档属性默认展示第一个页面即 “ 一般 ”  // hyj
      labelPosition: 'left',// 公文元数据展示  // hyj
      // hyj
      attrData: {
        // 公文元数据消息
        formGW: {
          GWBS: '', // 公文标识
          WZ: '', // 文种
          FH: '', // 份号
          MJHBMQX: '', // 密级和保密期限
          JJCD: '', // 紧急程度
          FWJGBZ: '', // 发文机关标志
          FWZH: '', // 发文字号
          QFR: '', // 签发人
          BT: '', // 标题
          ZSJG: '', // 主送机关
          FJSM: '', // 附件说明
          FWJGSM: '', // 签发机关署名
          CWRQ: '', // 成文日期
          FZ: '', // 附注
          CSJG: '', // 抄送机关
          YFJG: '', // 印发机关
          YFRQ: '', // 印发日期
          FBCC: '', // 发布层次
        },
        // 公文元数据标记
        formGWFlag: {
          GWBS: '', // 公文标识
          WZ: '', // 文种
          FH: '', // 份号
          MJHBMQX: '', // 密级和保密期限
          JJCD: '', // 紧急程度
          FWJGBZ: '', // 发文机关标志
          FWZH: '', // 发文字号
          QFR: '', // 签发人
          BT: '', // 标题
          ZSJG: '', // 主送机关
          FJSM: '', // 附件说明
          FWJGSM: '', // 签发机关署名
          CWRQ: '', // 成文日期
          FZ: '', // 附注
          CSJG: '', // 抄送机关
          YFJG: '', // 印发机关
          YFRQ: '', // 印发日期
          FBCC: '', // 发布层次
        },
        // 一般信息中描述信息
        formDisp: {
          Title: '', // 文档标题
          Author: '', // 文档作者
          Subject: '', // 文档主题
          Abstract: '', // 文档摘要
          ModDate: '', // 文档最后修改时间
          DocUsage: '', // 文档分类
          Keywords: '' // 关键词
        },
        // 一般信息中描述信息标记
        formDispFlag: {
          Title: '', // 文档标题
          Author: '', // 文档作者
          Subject: '', // 文档主题
          Abstract: '', // 文档摘要
          ModDate: '', // 文档最后修改时间
          DocUsage: '', // 文档分类
          Keywords: '' // 关键词
        },
        // 一般信息中创建信息
        dataCreate: {
          Creator: '', // 创作者
          CreationDate: '', // 创建时间
          CreatorVersion: '', // 创建者版本
          CreatorInfo: '', //创建者信息（后端获取不了这个信息，一直未空）
        },
        // 一般信息中文件信息
        dataFile: {
          DocID: '', // 文档ID
          filename: '',// 文件名
          fileSize: '',// 文件大小（字节），单位B或Kb或Mb或Gb或Tb或Pb或E
          filePage: '', //页数
        },
        // 元数据-编辑
        formMetaDataCr: {
          dataName: '', // 数据名称
          dataType: '', // 数据类型
          dataValue: '', // 数据值
          // 元数据-编辑-数据类型选择展示数据
          typeOptions: [
            {
              value: '文本',
              label: '文本',
              disabled: false
            },
            {
              value: '日期',
              label: '日期(yyyy-mm-dd或者yyyy/mm/dd)',
              disabled: false
            },
          ],
          // 元数据-编辑-数据名称选择展示数据
          nameOptions: [
            {
              value: 'GWBS',
              label: '公文标识',
              disabled: false
            },
            {
              value: 'WZ',
              label: '文种',
              disabled: false
            },
            {
              value: 'FH',
              label: '份号',
              disabled: false
            },
            {
              value: 'MJHBMQX',
              label: '密级和保密期限',
              disabled: false
            },
            {
              value: 'JJCD',
              label: '紧急程度',
              disabled: false
            },
            {
              value: 'FWJGBZ',
              label: '发文机关标志',
              disabled: false
            },
            {
              value: 'FWZH',
              label: '发文字号',
              disabled: false
            },
            {
              value: 'QFR',
              label: '签发人',
              disabled: false
            },
            {
              value: 'BT',
              label: '标题',
              disabled: false
            },
            {
              value: 'ZSJG',
              label: '主送机关',
              disabled: false
            },
            {
              value: 'FJSM',
              label: '附件说明',
              disabled: false
            },
            {
              value: 'FWJGSM',
              label: '签发机关署名',
              disabled: false
            },
            {
              value: 'CWRQ',
              label: '成文日期',
              disabled: false
            },
            {
              value: 'FZ',
              label: '附注',
              disabled: false
            },
            {
              value: 'CSJG',
              label: '抄送机关'
            },
            {
              value: 'YFJG',
              label: '印发机关',
              disabled: false
            },
            {
              value: 'YFRQ',
              label: '印发日期',
              disabled: false
            },
            {
              value: 'FBCC',
              label: '发布层次',
              disabled: false
            },

          ]
        },
        // 元数据-属性
        dataMetaData: [],
        // 变换数据
        changeData: [],
        // 当前元数据属性选中数据
        currentMetaData: {},
      },
      num: 0,
      editvalue: 'edit',
      annovalue: 'anno',
      exportvalue: 'export',
      signaturevalue: 'signature',
      watermarkvalue: 'watermark',
      screenshotvalue: 'screenshot',
      printvalue: 'print',
      startdata: '',
      enddata: '',
      valuedata: [],
      visionoptions: [{
        value: '选项1',
        label: '允许'
      }, {
        value: '选项2',
        label: '不允许'
      }],
      visionvalue: '',
      fileSize: '',
    }
  },

  computed: {
    ...mapGetters(['fileShowName', 'fileType', 'pageCount', 'fileIsChange', 'fileId', 'ie11Flag', 'esealIsChange']),
    ...mapGetters(['isMobile', 'filePermission']),

    /** 2024/3/25-ts-add: 控制元数据添加按钮*/
    metadataAddBTable() {
      // 匹配元数据数据值输入框内容，若内容为空或者单个/连续空格则禁用添加按钮
      return !!(this.attrData.formMetaDataCr.dataValue === "" || this.attrData.formMetaDataCr.dataValue.match(/^[ ]*$/));
    },

  },
  watch: {
    DocAttrvisibale(newValue, oldValue) {
      if (!newValue) {
        this.metadataDeleBTable = true
        this.attrData.currentMetaData = {}
      }
    }

  },

  mounted() {
    this.$bus.$on("setFileSize", (value) => {
      this.fileSize = value;
    });
  },

  beforeDestroy() {
    this.$bus.$off("setFileSize");

  },


  methods: {

    /**
     * @责任人：hyj
     * @方法名：closeDialog
     * @方法描述：关闭弹窗
     * @入参：
     * @返回值：
     * @修改时间：2024.12.6
     * @修改类型（新增、删除、修改等）：新增
     * @修改描述：
     * */
    closeDialog() {
      this.DocAttrvisibale = false;
    },

    /**
     * @责任人：hyj
     * @方法名：openDialog
     * @方法描述：打开文档属性
     * @入参：
     * @返回值：
     * @修改时间：2023.6.21
     * @修改类型（新增、删除、修改等）：新增
     * @修改描述：
     * */
    openDialog() {
      // 如果当前无文件打开
      if (this.fileId === '' || this.fileId === undefined || this.fileId === null) {
        this.$message.closeAll();
        this.$message({
          duration: 600,
          message: "请先打开文件",
          type: "info",
        })
      } else {
        // 控制弹窗可见
        this.DocAttrvisibale = true;
        // JSON格式传输数据
        let metaData = {
          fileId: this.fileId
        }
        this.attrData.changeData.length = 0;
        this.api({
          // hyj-0810-add 修改接口metadata
          url: "/metadata/getMetaData",
          method: "POST",
          data: metaData
        }).then(data => {
          // 公文元数据
          let tmp = data.dataGW
          const mte = {
            GWBS: '公文标识',
            WZ: '文种',
            FH: '份号',
            MJHBMQX: '密级和保密期限',
            JJCD: '紧急程度',
            FWJGBZ: '发文机关标志',
            FWZH: '发文字号',
            QFR: '签发人',
            BT: '标题',
            ZSJG: '主送机关',
            FJSM: '附件说明',
            FWJGSM: '签发机关署名',
            CWRQ: '成文日期',
            FZ: '附注',
            CSJG: '抄送机关',
            YFJG: '印发机关',
            YFRQ: '印发日期',
            FBCC: '发布层次',
          }
          const type = {
            text: '文本',
            date: '日期'
          }
          //判断是否是日期格式
          const regex = /^\d{4}-\d{2}-\d{2}$/;
          // 公文元数据
          // ll-1128-add 增加判断
          if (data.dataGW) {
            // 公文元数据
            this.attrData.formGW = tmp
            // 存放标记公文是否变化的数组
            for (let key in this.attrData.formGWFlag) {
              this.attrData.formGWFlag[key] = data.dataGW[key]
            }
          }

          if (data.dataDisp)
            // 一般信息-描述信息
          {
            this.attrData.formDisp = data.dataDisp
            // 存放描述信息是否变化的数组
            for (let key in this.attrData.formDispFlag) {
              this.attrData.formDispFlag[key] = data.dataDisp[key]
            }
          }
          if (data.dataCreate)
            // 一般信息-创建信息
          {
            this.attrData.dataCreate = data.dataCreate
          }
          if (data.DocID)
            // 一般信息-文件信息
          {
            this.attrData.dataFile.DocID = data.DocID
            this.attrData.dataFile.filename = this.fileShowName;
            this.attrData.dataFile.filePage = this.pageCount + '页';
            this.attrData.dataFile.fileSize = this.fileSize + 'KB';


          }
          if (data.dataMetaData)
            // 元数据-属性
          {
            //将dataname和datatype转为中文 2023.12.22 ll add
            let temp = []
            for (let i = 0; i < data.dataMetaData.length; i++) {
              // debugger
              if (type[data.dataMetaData[i].dataType]) {
                if (data.dataMetaData[i].dataID === "CWRQ" || data.dataMetaData[i].dataID === "QFRQ" || data.dataMetaData[i].dataID === "YFRQ") {
                  data.dataMetaData[i].dataType = "date"
                }
                data.dataMetaData[i].dataType = type[data.dataMetaData[i].dataType]
              }
              if (mte[data.dataMetaData[i].dataName]) {
                data.dataMetaData[i].dataName = mte[data.dataMetaData[i].dataName]
              }
              if (regex.test(data.dataMetaData[i].dataValue)) {
                const date = new Date(data.dataMetaData[i].dataValue);
                if (!Number.isNaN(date.getTime())) {
                  if (date.toISOString().slice(0, 10) === data.dataMetaData[i].dataValue) {
                    data.dataMetaData[i].dataType = type["date"]
                  }
                }
              }
              if (data.dataMetaData[i].dataValue === "无") {
                temp.push(i)
              }
              if (data.dataMetaData[i].dataValue === "") {
                data.dataMetaData.splice(data.dataMetaData.indexOf(data.dataMetaData[i]), 1)
              }
            }

            let uniqueData = data.dataMetaData.reduce((unique, item) => {
              // 如果unique对象中没有当前item的dataName，则添加到unique数组中
              if (!unique.some(i => i.dataName === item.dataName)) {
                unique.push(item);
              }
              return unique;
            }, []);

            this.attrData.dataMetaData = [...uniqueData]
          }
          if (data.permission) {
            this.editvalue = data.permission.edit ? '允许' : '不允许'
            this.annovalue = data.permission.annot ? '允许' : '不允许'
            this.exportvalue = data.permission.export ? '允许' : '不允许'
            this.signaturevalue = data.permission.signature ? '允许' : '不允许'
            this.watermarkvalue = data.permission.watermark ? '允许' : '不允许'
            this.screenshotvalue = data.permission.printScreen ? '允许' : '不允许'
            this.printvalue = data.permission.print ? '允许' : '不允许'
            this.num = data.permission.nprintCopies
            this.valuedata = [data.permission.strDate4Start, data.permission.strDate4End];
          }
          // 2024.2.27-lz-add 保证每次打开新文件文档属性默认第一个标签页
          this.activeName = 'first'
        })
      }
    },


    /**
     * @责任人：hyj
     * @方法名：addMetaData
     * @方法描述：新增或更改元数据
     * @入参：
     * @返回值：
     * @修改时间：2023.6.26
     * @修改类型（新增、删除、修改等）：新增
     * @修改描述：hyj
     * */
    addMetaData() {
      let setData = {
        dataID: this.attrData.formMetaDataCr.dataName,
        dataName: this.attrData.formMetaDataCr.dataName,
        dataType: this.attrData.formMetaDataCr.dataType,
        dataValue: this.attrData.formMetaDataCr.dataValue
      }
      // 2024.3.26-lz-add 若未选择数据名称则提示请选择数据名称
      if (!setData.dataName) {
        this.$message.error("请选择数据名称")
        return
      }
      //hyj-2024.5.28-add 对于选择的日期格式进行输入值限制
      if (setData.dataType == '日期') {
        if (this.isValidDate(setData.dataValue)) {
        } else {
          this.$message.error("您输入的值不是日期格式")
          return
        }
      }
      // debugger
      // 标识是否备选项中是否含有输入值
      let selectFlag = 0;
      // 暂存dataName的人读模式
      let selectName = '';
      // 遍历数组
      for (let i = 0; i < this.attrData.formMetaDataCr.nameOptions.length; i++) {
        // 如果里面有和输入值相同的就记录下来
        if (setData.dataName === this.attrData.formMetaDataCr.nameOptions[i].value) {
          selectFlag = 1
          selectName = this.attrData.formMetaDataCr.nameOptions[i].label
        }
      }
      // 标识是否原文档中含有选中值
      let selectMetaFlag = 0
      for (let j = 0; j < this.attrData.dataMetaData.length; j++) {
        if (setData.dataName === this.attrData.dataMetaData[j].dataID) {
          selectMetaFlag = 1
        }
      }
      // 如果输入的是备选项中的值
      if (selectFlag === 1) {
        // 如果是原来就有的，弹窗提示
        if (selectMetaFlag === 1) {
          this.$confirm('元数据已存在, 是否替换?', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
            lockScroll: false
          }).then(() => {
            for (let j = 0; j < this.attrData.dataMetaData.length; j++) {
              if (setData.dataName == this.attrData.dataMetaData[j].dataID) {
                this.attrData.dataMetaData[j].dataValue = setData.dataValue
                let x = setData.dataName
                this.attrData.formGW[x] = setData.dataValue
                // 记录更改的数据
                this.attrData.changeData.push(setData)
              }
            }
          }).catch(() => {
          });
        } else {
          setData.dataName = selectName
          let x = setData.dataID
          this.attrData.formGW[x] = setData.dataValue
          this.attrData.dataMetaData.push(setData)
          // 记录更改的数据
          this.attrData.changeData.push(setData)
        }
      } else {
        this.attrData.dataMetaData.push(setData)
        // 记录更改的数据
        this.attrData.changeData.push(setData)
      }

      this.attrData.formMetaDataCr.dataName = '';
      this.attrData.formMetaDataCr.dataType = '';
      this.attrData.formMetaDataCr.dataValue = '';
    },

    /**
     * @责任人：hyj
     * @方法名：cilckMetadataRow
     * @方法描述：
     * @入参：
     * @返回值：
     * @修改时间：2024.5.28
     * @修改类型（新增、删除、修改等）：新增
     * @修改描述：hyj
     * */
    cilckMetadataRow(row, column, event) {
      this.metadataDeleBTable = false
      this.attrData.currentMetaData = row
    },

    /**
     * @责任人：hyj
     * @方法名：deleteMetaData
     * @方法描述：
     * @入参：
     * @返回值：
     * @修改时间：2024.5.28
     * @修改类型（新增、删除、修改等）：新增
     * @修改描述：hyj
     * */
    deleteMetaData() {
      // debugger
      let deleteData = {
        dataID: this.attrData.currentMetaData.dataID,
        dataName: this.attrData.currentMetaData.dataName,
        dataType: this.attrData.currentMetaData.dataType,
        dataValue: ""
      }
      if (this.attrData.dataMetaData.indexOf(this.attrData.currentMetaData) === -1) {
        return false
      }
      this.attrData.formGW[this.attrData.currentMetaData.dataID] = ''
      this.attrData.dataMetaData.splice(this.attrData.dataMetaData.indexOf(this.attrData.currentMetaData), 1)
      this.attrData.changeData.push(deleteData)
      this.metadataDeleBTable = true
    },

    convertChineseNumberToArabic(chineseNumber, chineseNumbers) {
      let arabicNumber = 0;
      let currentMultiplicator = 1;
      chineseNumber = chineseNumber.slice(0, -1)
      for (let i = chineseNumber.length - 1; i >= 0; i--) {
        const number = chineseNumbers[chineseNumber.charAt(i)];
        if (number === 10) { // 对于'十'特殊处理
          arabicNumber += (chineseNumber.length - i) * 10;
          currentMultiplicator = 1;
        } else {
          arabicNumber += number * currentMultiplicator;
          currentMultiplicator *= 10;
        }
      }

      return arabicNumber;
    },

    isValidDate1(year, month, day) {
      const date = new Date(year, month - 1, day);
      return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
    },

    /**
     * @责任人：hyj
     * @方法名：isValidDate
     * @方法描述：判断日期是否有效
     * @入参：
     * @返回值：
     * @修改时间：2024.5.28
     * @修改类型（新增、删除、修改等）：新增
     * @修改描述：hyj
     * */
    isValidDate(input) {
      // 正则表达式匹配 yyyy-mm-dd 或 yyyy/mm/dd 格式
      const regex = /^(\d{4})[-/](\d{2})[-/](\d{2})$/;
      // 检查输入是否匹配正则表达式
      const match = input.match(regex);
      if (match) {
        // 如果匹配，解析年月日
        const year = parseInt(match[1], 10);
        const month = parseInt(match[2], 10);
        const day = parseInt(match[3], 10);

        // 创建日期对象以验证日期的有效性
        const date = new Date(year, month - 1, day);

        // 检查日期对象的年月日是否与输入匹配
        return date.getFullYear() === year &&
          date.getMonth() === month - 1 &&
          date.getDate() === day;
      } else {
        const chineseNumbers = {
          '〇': 0,
          '○': 0,
          '零': 0,
          '一': 1,
          '二': 2,
          '两': 2,
          '三': 3,
          '四': 4,
          '五': 5,
          '六': 6,
          '七': 7,
          '八': 8,
          '九': 9,
          '十': 10
        };
        let year = 0, month = 0, day = 0;

        // 正则表达式匹配年月日
        const yearMatch = input.match(/(\d{4}年|[〇○零一二三四五六七八九十百千万]+年)/);
        const monthMatch = input.match(/(\d{1,2}月|[〇○零一二三四五六七八九十]+月)/);
        const dayMatch = input.match(/(\d{1,2}日|[〇○零一二三四五六七八九十]+日)/);

        if (yearMatch) {
          year = this.convertChineseNumberToArabic(yearMatch[0], chineseNumbers);
        }
        if (monthMatch) {
          month = this.convertChineseNumberToArabic(monthMatch[0], chineseNumbers);
        }
        if (dayMatch) {
          day = this.convertChineseNumberToArabic(dayMatch[0], chineseNumbers);
        }

        // 校验日期有效性
        return this.isValidDate1(year, month, day);
      }

      // 如果不匹配或日期无效，返回 false
      return false;
    },


    /**
     * @责任人：hyj
     * @方法名：setMetaData
     * @方法描述：更改文档属性
     * @入参：
     * @返回值：
     * @修改时间：2023.6.26
     * @修改类型（新增、删除、修改等）：新增
     * @修改描述：hyj
     * */
    setMetaData() {
      let isDataGWValidTrue = true
      let isDataGWValid = Object.keys(this.attrData.formGW).filter(key => ['CWRQ', 'YFRQ'].includes(key))
      if (isDataGWValid.length != 0) {
        isDataGWValid.forEach(key => {
          if (this.attrData.formGW[key] === "无" || this.attrData.formGW[key] === "") return;
          if (this.isValidDate(this.attrData.formGW[key])) {
          } else if (this.attrData.formGW[key] != "") {
            // this.$message.error("您输入的值不是日期格式")
            isDataGWValidTrue = false
            return
          }
        })
      }
      if (isDataGWValidTrue) {
        this.DocAttrvisibale = false
        let chgDispData = this.compareObject(this.attrData.formDispFlag, this.attrData.formDisp)
        let chgGWData = this.compareObject(this.attrData.formGWFlag, this.attrData.formGW)

        let setData = {
          fileId: this.fileId,
          data: this.attrData.changeData,
          dataGw: chgGWData,
          dataDisp: chgDispData
        }
        if (setData.dataDisp.length > 0 || setData.dataGw.length > 0 || this.attrData.changeData.length > 0) {
          this.api({
            // hyj-0810-add 修改接口metadata
            url: "/metadata/setMetaData", // hyjnew ofdviewer --> viewer
            method: "POST",
            data: setData
          }).then(data => {
            this.$bus.$emit("setFileIsChange", true)
            this.$message.success("修改成功")
            // 修改之后，将修改的数据置空
            this.attrData.changeData = []
          })
        }
      }
    },

    /**
     * @责任人：hyj
     * @方法名：changeMetaData
     * @方法描述：公文元数据改变时修改元数据部分
     * @入参：
     * @返回值：
     * @修改时间：2024.7.4
     * @修改类型（新增、删除、修改等）：新增
     * @修改描述：hyj
     * */
    changeMetaData(dataID, dataName, dataType, dataValue) {
      if (dataValue !== undefined && dataValue !== "") {
        let setData = {
          dataID: dataID,
          dataName: dataName,
          dataType: dataType,
          dataValue: dataValue
        }
        if (dataType === "日期" && dataValue != "") {
          if (this.isValidDate(dataValue)) {
            this.attrData.dataMetaData.push(setData)
          } else {
            this.$message.error("您输入的值不是日期格式")
          }
        } else {
          const index = this.attrData.dataMetaData.findIndex(obj =>
            obj.dataID === setData.dataID &&
            obj.dataName === setData.dataName &&
            obj.dataType === setData.dataType
          );
          if (index !== -1) {
            if (this.attrData.dataMetaData[index].dataValue === setData.dataValue) {
              return false
            } else {
              this.attrData.dataMetaData[index] = setData
              this.tableKey = new Date().getTime();
            }
          } else {
            this.attrData.dataMetaData.push(setData)
          }
        }
      }
    },

    /**
     * @责任人：hyj
     * @方法名：compareObject
     * @方法描述：对比修改之后和修改之前的数据
     * @入参：
     * @返回值：
     * @修改时间：2023.6.30
     * @修改类型（新增、删除、修改等）：新增
     * @修改描述：hyj
     * */
    compareObject(flag, data) {
      // debugger
      let xData = []
      for (let key in data) {
        let y_value = flag[key];
        let x_value = data[key];
        if (y_value != x_value) {
          let yData = {
            dataID: '',
            dataValue: ''
          }
          yData.dataID = key
          yData.dataValue = x_value
          xData.push(yData)
        }
      }
      return xData
    },

    /**
     * @责任人：lz
     * @方法名：setMetaDataTypeChange
     * @方法描述：对文档属性对话框元数据tab的类型中，日期选项是否可选进行限制
     * @入参：selectValue
     * @返回值：
     * @修改时间：2023.3.28
     * @修改类型（新增、删除、修改等）：新增
     * @修改描述：hyj-2024.5.28-数据名称日期和文本绑定修改
     * */
    setMetaDataTypeChange(selectValue) {
      if (selectValue !== 'CWRQ' && selectValue !== 'YFRQ') {
        if (this.checkValueInArray(selectValue, this.attrData.formMetaDataCr.nameOptions)) {
          this.attrData.formMetaDataCr.typeOptions[1].disabled = true
          this.attrData.formMetaDataCr.typeOptions[0].disabled = false
          this.attrData.formMetaDataCr.dataType = "文本"
        } else {
          this.attrData.formMetaDataCr.typeOptions[1].disabled = false
          this.attrData.formMetaDataCr.typeOptions[0].disabled = false
        }
      } else {
        this.attrData.formMetaDataCr.typeOptions[1].disabled = false
        this.attrData.formMetaDataCr.typeOptions[0].disabled = true
        this.attrData.formMetaDataCr.dataType = "日期"
      }
    },
    /**
     * @责任人：hyj
     * @方法名：checkValueInArray
     * @方法描述：查询关键字是否和数组中的值相等
     * @入参：value(关键字),array(数组)
     * @返回值：
     * @修改时间：2024.5.28
     * @修改类型（新增、删除、修改等）：新增
     * @修改描述：
     * */
    checkValueInArray(value, array) {
      // 遍历数组，检查是否有元素与给定值相等
      for (let i = 0; i < array.length; i++) {
        if (array[i].value === value) {
          // 如果找到相等的值，返回true
          return true;
        }
      }
      // 如果遍历完数组都没有找到相等的值，返回false
      return false;
    },


  }

}
</script>

<style scoped>
.printNum .el-input__inner {
  text-align: left;
}

.el-form-item--mini.el-form-item,
.el-form-item--small.el-form-item {
  margin-bottom: 0px;
}

.el-descriptions__header {
  margin-bottom: 0px;
}

.el-table .cell {
  white-space: pre-wrap;
}
</style>

<style scoped lang="scss">
.fileInfo_true {
  width: 65%;
}

.fileInfo_false {
  width: 100%;
}

.formItem {
  font-size: 12px;
}

/**文档属性中描述信息字体大小 */
/deep/ .formItem .el-form-item__label {
  font-size: 12px;
  padding-right: 12px;
  padding-left: 12px;
}

/deep/ .formItemGW .el-form-item__label {
  font-size: 12px;
}

.selectDataType {
  width: 100%;
}

/deep/ .el-form-item {
  margin-bottom: 0;
}

/deep/ .dataRange .el-range-separator {
  padding: 0px;
}
</style>
