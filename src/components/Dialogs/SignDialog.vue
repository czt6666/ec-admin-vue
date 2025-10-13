<template>
    <el-dialog id="signDialog" :visible.sync="esealVisible" center title="签章" width="30%" :lock-scroll="false"
        :modal-append-to-body="false">
        <el-form :inline="true" :model="esealForm" class="demo-form-inline">
            <el-form-item label="签章列表">
                <el-card shadow="never" style="width: 165px;">
                    <el-tree ref="signRef" :current-node-key="eseal.currentNodeKey" :data="eseal.reaultData"
                        :default-expanded-keys="eseal.expandedKeys" :props="eseal.defaultProps" class="tree"
                        highlight-current node-key="id" @node-click="handleSignNodeClick"></el-tree>
                    <!-- <span>演示印章</span> -->
                </el-card>
            </el-form-item>
            <!-- <div class="verticalBar1"></div> -->

            <el-form-item label="签章预览">
                <el-card shadow="never">
                    <img id="signImg" alt="" src="" />
                </el-card>
                <!-- <img src="../../assets/images/svg/topMenu/sign.png"> -->
            </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
            <el-button @click="closeDialog">取 消</el-button>
            <el-button type="primary" @click="esealMoveMenu($event)">确 定</el-button>
        </span>
    </el-dialog>
</template>
<script>
import { mapGetters } from "vuex";
import { default as UnitConversion } from "../../utils/unitConversion";
import { urlToBase64 } from "../../utils/UseableTool";
export default {
    name: "signDialog",
    data() {
        return {
            esealVisible: false, //签章点击显示窗口
            firstGetEseal: false, //是否第一次获取签章组件信息
            esealImg: false, //印章是否显示
            esealForm: {},
            eseal: {
                reaultData: [], //树形结构的返回结果
                defaultProps: {
                    children: "children",
                    label: "label"
                }, // 树形结构的节点控制
                currentNodeKey: 0, //当前选中节点ID
                expandedKeys: [], //展开的父节点
                currentData: {}, //当前选中节点的数据
                signId: 0,// 选中印章ID
                signImg: {
                    imgUrl: "",
                    imgWidth: "",
                    imgHeight: ""
                }
            },

        }
    },
    computed: {
        ...mapGetters(['fileId']),
    },
    methods: {
        openDialog() {
            this.esealVisible = true
            this.getEsealCompontData()
        },

        closeDialog() {
            this.esealVisible = false
        },

        /**
        * @责任人：hyj
        * @方法名：getEsealCompontData
         * @方法描述：获取组件印章信息
         * @入参：
        * @返回值：
        * @修改时间：2024.1.12
        * @修改类型（新增、删除、修改等）：新增
        * @修改描述：hyj
        * */
        getEsealCompontData() {
            // 设置鼠标状态，退出其他编辑
            this.$store.commit("SET_CURSOR_TYPE", { cursorSwitch: 1 });
            if (this.firstGetEseal) {
            } else {
                this.firstGetEseal = true
                let esealData = {
                    fileId: this.fileId
                }
                this.api({
                    url: 'sign/getEsealCompontData',
                    method: 'post',
                    data: esealData
                }).then(data => {
                    this.eseal.reaultData = data.result
                    this.eseal.expandedKeys.push(this.eseal.reaultData[0].id)
                    this.$nextTick(() => {
                        this.$nextTick(() => {
                            this.eseal.currentNodeKey = this.eseal.reaultData[0].children[0].id;
                            this.$refs["signRef"].setCurrentKey(this.eseal.currentNodeKey);
                            this.handleSignNodeClick(this.eseal.reaultData[0].children[0])
                        });
                    });
                    let signImg = document.getElementById("signImg");
                    signImg.src = this.eseal.reaultData[0].children[0].signUrl;
                    signImg.width = UnitConversion.mmConversionPx(this.eseal.reaultData[0].children[0].width)
                    signImg.height = UnitConversion.mmConversionPx(this.eseal.reaultData[0].children[0].height)
                });
            }
        },
        /**
      * @责任人：hyj
      * @方法名：handleSignNodeClick
      * @方法描述：点击签章节点按钮
      * @入参：
      * @返回值：
      * @修改时间：2024.1.12
      * @修改类型（新增、删除、修改等）：新增
      * @修改描述：hyj
      * */
        handleSignNodeClick(data) {
            //根节点SIS
            if (data.children.length > 0) {

            } else {
                this.eseal.signId = data.index;
                const signImg = document.getElementById("signImg");
                signImg.src = data.signUrl;
                signImg.width = UnitConversion.mmConversionPx(data.width)
                signImg.height = UnitConversion.mmConversionPx(data.height)
                this.eseal.signImg.imgUrl = data.signUrl;
                this.eseal.signImg.imgWidth = signImg.width;
                this.eseal.signImg.imgHeight = signImg.height;
                if (signImg.width === 0 || signImg.height === 0) {
                    signImg.src = expiredSign;
                    signImg.width = 128
                    signImg.height = 128
                    this.eseal.signImg.imgUrl = "";
                    this.eseal.signImg.imgWidth = 0;
                    this.eseal.signImg.imgHeight = 0;
                }
            }
        },

        /**
         * @责任人：hyj
         * @方法名：esealMove
         * @方法描述：确认按钮调用签章移动函数
         * @入参：
         * @返回值：
         * @修改时间：2023
         * @修改类型（新增、删除、修改等）：修改
         * @修改描述：新增函数
         * */
        esealMoveMenu(e) {
            if (this.eseal.signImg.imgUrl === "" || this.eseal.signImg.imgWidth === 0 || this.eseal.signImg.imgHeight === 0) {
                this.$alert('此印章已损坏！请切换其他印章！！！', '提示！', {
                    confirmButtonText: '确定',

                });
            } else {
                //关闭窗口
                // debugger
                this.esealVisible = false;
                if (this.eseal.signImg.imgWidth === 0 || this.eseal.signImg.imgHeight === 0) {

                } else {
                    this.esealImg = true
                    // }
                    return new Promise((resolve, reject) => {
                        (async () => {
                            try {
                                await this.$bus.$emit("esealMove", e, this.esealVisible, this.esealImg, this.eseal.signId)
                                urlToBase64(this.eseal.signImg.imgUrl).then((res) => {
                                    this.removeImgBg(res, document.getElementById("esealImg"))
                                })
                                resolve();
                            } catch (e) {
                                console.log("捕获到异常：", e);
                                reject(e);
                            }
                        })();
                    })
                }
            }
        },

        /**
 * @责任人：hyj
 * @方法名：removeImgBg
 * @方法描述：清除背景颜色
 * @入参：
 * @返回值：
 * @修改时间：2024.1.24
 * @修改类型（新增、删除、修改等）：新增
 * @修改描述：hyj
 * */
        removeImgBg(base64, target) {
            const rgba = [255, 255, 255, 255];
            const tolerance = 60;  // 容差率
            const canvas = document.createElement('canvas');
            const canvasText = canvas.getContext('2d');
            const img = new Image();
            img.src = base64;
            let imgData = null;
            let [r0, g0, b0, a0] = rgba;
            let r, g, b, a;
            img.onload = () => {
                canvas.width = img.width;
                canvas.height = img.height;
                canvasText.drawImage(img, 0, 0);
                imgData = canvasText.getImageData(0, 0, 200, 700);
                for (let i = 0; i < imgData.data.length; i += 4) {
                    r = imgData.data[i];
                    g = imgData.data[i + 1];
                    b = imgData.data[i + 2];
                    a = imgData.data[i + 3];
                    const t = Math.sqrt((r - r0) ** 2 + (g - g0) ** 2 + (b - b0) ** 2 + (a - a0) ** 2);
                    if (t < tolerance) {
                        imgData.data[i] = 0;
                        imgData.data[i + 1] = 0;
                        imgData.data[i + 2] = 0;
                        imgData.data[i + 3] = 0;
                    }
                }
                canvasText.putImageData(imgData, 0, 0);
                target.src = canvas.toDataURL('image/png')
                target.width = this.eseal.signImg.imgWidth;
                target.height = this.eseal.signImg.imgHeight;
            }
        },


    }
}
</script>
