<template>
  <div class="app-container">
    <div style="height: 850px;overflow-y: auto">
      <el-input
        placeholder="请输入姓名"
        v-model="value"
        style="width:240px"
      ></el-input>
      <el-button type="primary" @click="searchLogList">搜索</el-button>
      <el-button type="primary">展示数据</el-button>
      <el-button type="warning" @click="dialogVisible = true"
        >系统日志</el-button
      >

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
          prop="date"
          label="操作日期"
          width="180"
          sortable
        >
        </el-table-column>
        <el-table-column
          align="center"
          prop="creator"
          label="操作人"
          width="180"
        >
        </el-table-column>
        <el-table-column
          align="center"
          prop="subtype"
          label="操作类型"
          width="180"
        >
        </el-table-column>
        <!-- <el-table-column
          align="center"
          prop="extra"
          label="扩展信息"
          width="180"
        >
        </el-table-column> -->

        <el-table-column
          align="center"
          prop="res"
          label="执行结果"
          width="180"
          :filters="[
            { text: '成功', value: 0 },
            { text: '失败', value: 1 }
          ]"
          :filter-method="filterTag"
          filter-placement="bottom-end"
        >
          <template slot-scope="scope">
            <el-tag
              :type="scope.row.res === 0 ? 'success' : 'danger'"
              disable-transitions
              >{{ formatResult(scope.row.res) }}</el-tag
            >
          </template>
        </el-table-column>
        <el-table-column
          align="left"
          header-align="center"
          prop="action"
          label="操作详情"
        >
          <template slot-scope="scope">
            <div v-html="highlightText(scope.row.action)"></div>
          </template>
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
// import SockJS from "sockjs-client";
// import Stomp from "stompjs";
// import API_CONFIG from "../../../config/index.js";

export default {
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
      keyword: "打开"
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
        url: "/log/listOperateLog",
        method: "get",
        params: this.listQuery
      }).then(data => {
        this.listLoading = false;
        this.list = data.list;
        this.totalCount = data.totalCount;
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
      this.gridDataDetail.id = this.list[$index].id;
      const text = this.list[$index].extra;
      const jsonString = `{${text
        .replace(/FileDO|\(|\)/g, "")
        .split(", ")
        .map(pair => {
          const [key, value] = pair.split("=");
          return `"${key}": "${value}"`;
        })
        .join(", ")}}`;
      // 转换为JSON对象
      const jsonObject = JSON.parse(jsonString);
      this.gridDataDetail.req = JSON.stringify(jsonObject, null, 2);
      console.log(jsonObject);
      this.form.name = this.list[$index].name;
      this.dialogFormVisible = true;
    },
    filterTag(value, row) {
      return row.res === value;
    },
    formatResult(result) {
      return result === 0 ? "成功" : "失败";
    },
    tableRowClassName({ row, rowIndex }) {
      if (row.res === 1) {
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
      //检索列表,前端
      var _this = this;
      var list = [];
      this.list.map(function(item) {
        if (item.name.search(_this.value.trim()) != -1) {
          list.push(item);
          //console.log(list);
        }
      });
      this.list = list;
      //return list;
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
