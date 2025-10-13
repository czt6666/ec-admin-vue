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
          prop="creator"
          label="登录用户"
          width="180"
        >
        </el-table-column>
        <el-table-column
          align="center"
          prop="date"
          label="登录日期"
          width="180"
          sortable
        >
        </el-table-column>
        <el-table-column
          align="center"
          prop="method"
          label="校验方式"
          width="180"
        >
        </el-table-column>
        <!-- <el-table-column align="center" prop="result" label="操作结果" width="180">
        </el-table-column> -->
        <el-table-column
          align="center"
          prop="time"
          label="执行时长(ms)"
          width="180"
        >
        </el-table-column>
        <el-table-column
          align="center"
          prop="name"
          label="结果"
          width="180"
          :filters="[
            { text: '登录成功', value: '登录成功' },
            { text: '注销登录', value: '注销登录' },
            { text: '登录失败', value: '登录失败' }
          ]"
          :filter-method="filterTag"
          filter-placement="bottom-end"
        >
          <template slot-scope="scope">
            <el-tag
              :type="
                scope.row.name === '登录成功'
                  ? 'success'
                  : scope.row.name === '注销登录'
                  ? 'warning'
                  : scope.row.name === '登录失败'
                  ? 'danger'
                  : 'info'
              "
              disable-transitions
              >{{ scope.row.name }}</el-tag
            >
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
      <el-dialog title="操作详情" :visible.sync="dialogFormVisible">
        <el-form :value="gridDataDetail">
          <el-form-item label="日志id" :label-width="formLabelWidth">
            <el-input :value="gridDataDetail.id" autocomplete="off"></el-input>
          </el-form-item>
          <el-form-item label="登录结果" :label-width="formLabelWidth">
            <el-input
              :value="gridDataDetail.name"
              autocomplete="off"
            ></el-input>
          </el-form-item>
          <el-form-item label="登录时间" :label-width="formLabelWidth">
            <el-input
              :value="gridDataDetail.date"
              autocomplete="off"
            ></el-input>
          </el-form-item>
          <el-form-item label="操作请求" :label-width="formLabelWidth">
            <el-input :value="gridDataDetail.req" autocomplete="off"></el-input>
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
export default {
  data() {
    return {
      gridDataDetail: {
        id: "",
        name: "",
        date: "",
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
      }
    };
  },
  created() {
    this.getList();
  },
  methods: {
    getList() {
      //查询列表
      // if (!this.hasPerm('log:list')) {
      //   return
      // }
      this.listLoading = true;
      this.api({
        url: "/log/listLog",
        method: "get",
        params: this.listQuery
      }).then(data => {
        this.listLoading = false;
        this.list = data.list;
        this.totalCount = data.totalCount;
      });
    },
    showDetailLog($index) {
      this.gridDataDetail.id = this.list[$index].id;
      this.gridDataDetail.name = this.list[$index].name;
      this.gridDataDetail.date = this.list[$index].date;
      this.gridDataDetail.req = this.list[$index].req;
      this.form.name = this.list[$index].name;
      this.dialogFormVisible = true;
    },
    filterTag(value, row) {
      return row.name === value;
    },
    tableRowClassName({ row, rowIndex }) {
      if (row.name === "登录失败") {
        return "error-row";
      } else if (row.name === "注销登录") {
        return "warning-row";
      }
      return "";
    },
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

.el-table .warning-row {
  background: #f8a54686;
}
</style>
