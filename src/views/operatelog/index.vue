<template>
  <div class="app-container">
    <div style="height: 850px;overflow-y: auto">
      <el-input
        placeholder="请输入操作人"
        v-model="value"
        style="width:240px"
      ></el-input>
        <el-button class="filter-item" type="primary" icon="el-icon-search" @click="searchLogList">
          搜索
        </el-button>
        <el-button :loading="downloadLoading" class="filter-item" type="primary" icon="el-icon-download" @click="handleDownload">
          导出
        </el-button>
      <!-- <el-button type="primary" @click="searchLogList">搜索</el-button> -->
      <!-- <el-button type="warning" @click="dialogVisible = true"
        >系统日志</el-button
      > -->

      <el-dialog
        title="系统日志"
        :visible.sync="dialogVisible"
        width="70%"
        :before-close="handleClose"
        v-model="res"
      >
        <div style="margin-bottom: 5px">
          <span>
            <el-button @click="openSocket" type="primary">开启日志</el-button>
            <el-button @click="closeSocket" type="danger">关闭日志</el-button>
          </span>
        </div>

        <div
          id="logScroll"
          ref="logContainer"
          v-html="res"
          style="background: black;height: 90%; overflow-y: auto"
        ></div>
        <!-- <p>{{ res }}</p> -->
        <span slot="footer" class="dialog-footer">
          <el-button @click="dialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="dialogVisible = false"
            >确 定</el-button
          >
        </span>
      </el-dialog>
<!--       
      <div class="filter-container">
        <el-button class="filter-item" type="primary" icon="el-icon-search" @click="searchLogList">
          搜索
        </el-button>
        <el-button :loading="downloadLoading" class="filter-item" type="primary" icon="el-icon-download" @click="handleDownload">
          导出
        </el-button>
      </div> -->
      
        <el-table
        :data="list"
        v-loading="listLoading"
        border
        fit
        highlight-current-row
        :row-class-name="tableRowClassName"
        :default-sort="{ prop: 'id', order: 'descending' }"
      >
        <el-table-column
          align="center"
          prop="id"
          label="日志编号"
          width="180"
          sortable
        >
        </el-table-column>
        <el-table-column
          align="center"
          prop="createTime"
          label="操作日期"
          width="180"
          sortable
        >
          <template slot-scope="scope">
            {{ scope.row.createTime | formatDate }}
          </template>
        </el-table-column>
        <el-table-column
          align="center"
          prop="username"
          label="操作人"
          width="180"
        >
        </el-table-column>
        <el-table-column
          align="center"
          prop="operation"
          label="操作类型"
          width="180"
        >
        </el-table-column>
        <el-table-column
          align="center"
          prop="method"
          label="请求方法"
          width="250"
        >
        </el-table-column>

        <el-table-column
          align="center"
          prop="success"
          label="执行结果"
          width="180"
          :filters="[
            { text: '成功', value: 1 },
            { text: '失败', value: 0 }
          ]"
          :filter-method="filterTag"
          filter-placement="bottom-end"
        >
          <template slot-scope="scope">
            <el-tag
              :type="scope.row.success === 1 ? 'success' : 'danger'"
              disable-transitions
              >{{ formatResult(scope.row.success) }}</el-tag
            >
          </template>
        </el-table-column>
        <el-table-column
          align="center"
          prop="costTime"
          label="耗时(ms)"
          width="120"
        >
        </el-table-column>
        <el-table-column
          align="center"
          prop="ipAddress"
          label="IP地址"
          width="150"
        >
        </el-table-column>
        <el-table-column
          label="操作"
          align="center"
          class-name="small-padding fixed-width"
        >
          <template slot-scope="scope">
            <el-button
              size="mini"
              type="text"
              icon="el-icon-view"
              @click.native="showDetailLog(scope.$index)"
              >详细
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="listQuery.pageNum"
        :page-size="listQuery.pageRow"
        :total="totalCount"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
      >
      </el-pagination>
      <el-dialog title="扩展信息" :visible.sync="dialogFormVisible">
        <el-form :value="gridDataDetail">
          <el-form-item label="日志id" :label-width="formLabelWidth">
            <el-input :value="gridDataDetail.id" autocomplete="off"></el-input>
          </el-form-item>
          <el-form-item label="扩展信息" :label-width="formLabelWidth">
            <!-- <textarea
              rows="10"
              cols="50"
              v-model="gridDataDetail.req"
            ></textarea> -->
            <el-input
              type="textarea"
              :rows="5"
              :value="gridDataDetail.req"
              autocomplete="off"
            ></el-input>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="dialogFormVisible = false">取 消</el-button>
          <el-button type="primary" @click="dialogFormVisible = false"
            >确 定</el-button
          >
        </div>
      </el-dialog>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
// import SockJS from "sockjs-client";
// import Stomp from "stompjs";
// import API_CONFIG from "../../../config/index.js";

export default {
  filters: {
    formatDate(value) {
      if (!value) return '';
      const date = new Date(value);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    }
  },
  data() {
    return {
      dialogVisible: false,
      res: "",
      gridDataDetail: {
        id: "",
        req: ""
      },
      form: {
        name: "",
        region: "",
        date1: "",
        date2: "",
        delivery: false,
        type: [],
        resource: "",
        desc: ""
      },
      value: "", //搜索输入
      formLabelWidth: "120px",
      dialogFormVisible: false,
      totalCount: 0, //分页组件--数据总条数
      list: [], //表格的数据
      listLoading: false, //数据加载等待动画
      listQuery: {
        pageNum: 1, //页码
        pageRow: 50, //每页条数
        name: ""
      },
      keyword: "打开",
      downloadLoading: false
    };
  },
  created() {
    this.getList();
  },
  watch: {
    log: {
      handler(newVal, oldVa1) {
        // 当 logs 数组发生变化时，执行此函数
        this.$nextTick(() => {
          // 确保 DOM 已经更新
          this.scrollToBottom();
        });
      }
    }
  },
  methods: {
    getList() {
      //查询列表
      // if (!this.hasPerm('log:list')) {
      //   return
      // }
      this.listLoading = true;
      this.api({
        url: "/operateLog/list",
        method: "get",
        params: {
          page: this.listQuery.pageNum,
          size: this.listQuery.pageRow,
          username: this.listQuery.name
        }
      }).then(res => {
        this.listLoading = false;
        // 处理后端返回的数据格式
        if (res && res.records) {
          this.list = res.records;
          this.totalCount = res.total;
        } else {
          this.list = [];
          this.totalCount = 0;
        }
      }).catch(error => {
        this.listLoading = false;
        this.$message.error('获取操作日志失败: ' + error.message);
      });
    },
    // getExtraData() {
    //   const id = this.extraData;
    //   this.api({
    //     url: "/log/detailOperateLog/${id}",
    //     method: "get"
    //   }).then(data => {
    //     this.extraData = data.extra;
    //   });
    // },
    scrollToBottom() {
      // 滚动到底部
      this.$refs.logContainer.scrollTop = this.$refs.logContainer.scrollHeight;
    },
    showDetailLog($index) {
      const log = this.list[$index];
      this.gridDataDetail.id = log.id;
      
      // 构建详细信息对象
      const detailInfo = {
        "操作用户ID": log.userId,
        "操作用户名": log.username,
        "操作类型": log.operation,
        "请求方法": log.method,
        "请求参数": log.requestParams,
        "响应结果": log.responseResult,
        "IP地址": log.ipAddress,
        "操作时间": log.createTime,
        "耗时(毫秒)": log.costTime,
        "是否成功": log.success === 1 ? "成功" : "失败",
        "错误信息": log.errorMessage
      };
      
      this.gridDataDetail.req = JSON.stringify(detailInfo, null, 2);
      this.dialogFormVisible = true;
    },
    filterTag(value, row) {
      return row.success === value;
    },
    formatResult(result) {
      return result === 1 ? "成功" : "失败";
    },
    tableRowClassName({ row, rowIndex }) {
      if (row.success === 0) {
        return "error-row";
      }
      // else if (rowIndex === 3) {
      //   return "success-row";
      // }
      return "";
    },
    // 高亮显示匹配的文本
    highlightText(text) {
      // 匹配括号「」中的文本并高亮显示
      const matches = text.match(/「([^「」]+)」/g);
      if (matches) {
        matches.forEach(match => {
          const highlightedText = `<span style="color: orange;">${match}</span>`;
          text = text.replace(match, highlightedText);
        });
      }
      return text;
    },
    // handleClose(done) {
    //   this.$confirm("确认关闭？")
    //     .then(_ => {
    //       done();
    //     })
    //     .catch(_ => {});
    // },
    // openSocket() {
    //   if (this.stompClient == null) {
    //     this.res =
    //       "<div style='color: #18d035;font-size: 14px'>通道连接成功,静默等待....</div>";
    //     // this.$refs['logContainerDiv'].append();
    //     // 建立连接对象
    //     let socket = new SockJS(
    //       "http://" + API_CONFIG.dev.host + ":" + "8020" + "/websocket?token=kl"
    //     );
    //     // 获取STOMP子协议的客户端对象
    //     this.stompClient = Stomp.over(socket);
    //     this.stompClient.connect({ token: "kl" }, () => {
    //       this.stompClient.subscribe(
    //         "/topic/pullLogger",
    //         event => {
    //           let div = document.getElementById("logScroll");
    //           let content = JSON.parse(event.body);
    //           let leverhtml = "";
    //           let className =
    //             "<span style='color: #229379'>" + content.className + "</span>";
    //           switch (content.level) {
    //             case "INFO":
    //               leverhtml =
    //                 "<span style='color: #90ad2b'>" + content.level + "</span>";
    //               break;
    //             case "DEBUG":
    //               leverhtml =
    //                 "<span style='color: #A8C023'>" + content.level + "</span>";
    //               break;
    //             case "WARN":
    //               leverhtml =
    //                 "<span style='color: #fffa1c'>" + content.level + "</span>";
    //               break;
    //             case "ERROR":
    //               leverhtml =
    //                 "<span style='color: #e3270e'>" + content.level + "</span>";
    //               break;
    //           }
    //           this.res +=
    //             "<div style='color: #18d035;font-size: 14px'>" +
    //             content.timestamp +
    //             " " +
    //             leverhtml +
    //             " --- [" +
    //             content.threadName +
    //             "] " +
    //             className +
    //             " ：" +
    //             content.body +
    //             "</div>";
    //           // this.$refs['logContainerDiv'].append(content.timestamp + " " + leverhtml + " --- [" + content.threadName + "] " + className + " ：" + content.body + "<br/>");
    //           if (content.exception != "") {
    //             this.res += "<div>" + content.exception + "</div>";
    //             // this.$refs['logContainerDiv'].append();
    //           }
    //           if (content.cause != "") {
    //             this.res += "<div>" + content.cause + "</div>";
    //             // this.$refs['logContainerDiv'].append(content.cause);
    //           }
    //           div.scrollTop = div.scrollHeight;
    //           // this.$refs['logContainer'].scrollTo(this.$refs['logContainerDiv'].height() - this.$refs['logContainer'].height());
    //         },
    //         {
    //           token: "kltoen"
    //         }
    //       );
    //     });
    //   }
    // },
    // closeSocket() {
    //   if (this.stompClient != null) {
    //     this.stompClient.disconnect();
    //     this.stompClient = null;
    //   }
    // },

    handleClose(done) {
      this.$confirm("确认关闭？")
        .then(_ => {
          done();
        })
        .catch(_ => {});
    },
    handleSizeChange(val) {
      //改变每页数量
      this.listQuery.pageRow = val;
      this.handleFilter();
    },
    handleCurrentChange(val) {
      //改变页码
      this.listQuery.pageNum = val;
      this.getList();
    },
    handleFilter() {
      //改变了查询条件,从第一页开始查询
      this.listQuery.pageNum = 1;
      this.getList();
    },
    getIndex($index) {
      //表格序号
      return (this.listQuery.pageNum - 1) * this.listQuery.pageRow + $index + 1;
    },
    searchLogList() {
      //检索列表
      this.listQuery.name = this.value.trim();
      this.handleFilter();
    },
    
    handleDownload() {
      this.downloadLoading = true;
      
      // 创建一个独立的axios实例用于文件下载，避免拦截器的影响
      const downloadApi = axios.create({
        baseURL: window.webofdConfig.BASE_URL,
        timeout: 180000,
        responseType: 'blob'
      });
      
      // 添加请求拦截器添加token
      downloadApi.interceptors.request.use(config => {
        const token = this.$store.getters.token;
        if (token) {
          config.headers['token'] = token;
        }
        return config;
      }, error => {
        return Promise.reject(error);
      });
      
      // 添加响应拦截器处理错误
      downloadApi.interceptors.response.use(
        response => {
          return response;
        },
        error => {
          return Promise.reject(error);
        }
      );
      
      // 调用后端导出接口
      downloadApi({
        url: '/operateLog/export',
        method: 'get',
        params: {
          username: this.listQuery.name || undefined,
          operation: undefined, // 可以根据需要添加筛选条件
          startTime: undefined,
          endTime: undefined
        }
      }).then(response => {
        // 检查是否有错误响应（当后端返回错误时，可能返回JSON而不是预期的文件）
        if (response.data.type && response.data.type === 'application/json') {
          // 如果是JSON响应，说明后端返回了错误信息
          const reader = new FileReader();
          reader.onload = () => {
            try {
              const errorMsg = JSON.parse(reader.result).msg || '导出失败';
              this.$message.error(errorMsg);
            } catch (e) {
              this.$message.error('导出失败');
            }
          };
          reader.readAsText(response.data);
          return;
        }
        
        // 创建Blob对象
        const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        // 创建下载链接
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        // 从响应头获取文件名，如果无法获取则使用默认名称
        const contentDisposition = response.headers['content-disposition'];
        console.log('Content-Disposition:', contentDisposition); // 调试日志
        let fileName = '操作日志.xlsx';
        let fileNameMatch = null;
        
        if (contentDisposition) {
          // 尝试匹配RFC 6266标准的filename*参数（包含编码信息）
          fileNameMatch = contentDisposition.match(/filename\\*?=\\s*"[^"]*UTF-8''([^;\\r\\n"]*)"/i);
          console.log('RFC 6266 match:', fileNameMatch); // 调试日志
          if (fileNameMatch) {
            fileName = decodeURIComponent(fileNameMatch[1]);
          } else {
            // 尝试匹配普通的filename参数
            fileNameMatch = contentDisposition.match(/filename\\*?=\\s*"?([^;\\r\\n"]*)"?"?/);
            console.log('Regular match:', fileNameMatch); // 调试日志
            if (fileNameMatch) {
              fileName = fileNameMatch[1].replace(/"/g, '');
              // 如果fileName是URL编码的，尝试解码
              try {
                fileName = decodeURIComponent(fileName);
              } catch (e) {
                // 如果解码失败，使用原始值
              }
            }
          }
        }
        
        // 如果文件名中没有时间戳（即不包含下划线后的数字部分），则添加时间戳
        if (!fileName.includes('_') || !/\d{14}/.test(fileName)) {
          const now = new Date();
          const timestamp = now.getFullYear() + 
                           String(now.getMonth() + 1).padStart(2, '0') + 
                           String(now.getDate()).padStart(2, '0') + 
                           String(now.getHours()).padStart(2, '0') + 
                           String(now.getMinutes()).padStart(2, '0') + 
                           String(now.getSeconds()).padStart(2, '0');
          fileName = `操作日志_${timestamp}.xlsx`;
        }
        
        console.log('Final fileName:', fileName); // 调试日志
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }).catch(error => {
        console.error('导出失败:', error);
        // 检查错误是否包含响应数据
        if (error.response && error.response.data) {
          // 如果错误响应是blob类型，尝试读取错误信息
          if (error.response.data instanceof Blob) {
            const reader = new FileReader();
            reader.onload = () => {
              try {
                const errorMsg = JSON.parse(reader.result).msg || '导出失败';
                this.$message.error(errorMsg);
              } catch (e) {
                this.$message.error('导出失败');
              }
            };
            reader.readAsText(error.response.data);
          } else {
            this.$message.error('导出失败: ' + (error.message || '未知错误'));
          }
        } else {
          this.$message.error('导出失败: ' + (error.message || '未知错误'));
        }
      }).finally(() => {
        this.downloadLoading = false;
      });
    },
    
    getOperateLogDetail(id) {
      // 获取操作日志详情
      return this.api({
        url: `/operateLog/detail/${id}`,
        method: "get"
      });
    }
  }
};
</script>
<style>
.el-table .error-row {
  background: rgba(221, 19, 19, 0.596);
}

.el-table .success-row {
  background: #f0f9eb;
}

.el-dialog__body {
  height: 70vh;
  overflow: auto;
}
</style>
