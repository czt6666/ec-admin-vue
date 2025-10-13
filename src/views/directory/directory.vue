<template>
  <div class="app-container">
    <div class="filter-container">
      <el-form  :model="searchInfo" :inline="true" >
          <el-form-item style="align-self: auto; margin-left: auto" label="机构代码：">
            <!--          <el-button type="primary" icon="plus" @click="showCreate()" v-permission="'certificate:add'">添加-->
            <!--          </el-button>-->
            <!--            orgCode:机构代码-->
            <el-input
              placeholder="请输入内容"
              style="width: 100%; "
              v-model="searchInfo.orgCode">
<!--              <i slot="suffix" class="el-input__icon el-icon-search" style="font-size: large; column-fill: auto" @click="searchByCode"></i>-->
            </el-input>
          </el-form-item>
          <el-form-item style="align-self: auto; margin-left: 50px" label="机构名称：">
            <!--          orgName:机构名称-->
            <el-input
              placeholder="请输入内容"
              style="width: 100%"
              v-model="searchInfo.orgName">
<!--              <i slot="suffix" class="el-input__icon el-icon-search" style="font-size: large" @click="searchByName"></i>-->
            </el-input>
          </el-form-item>

<!--        <el-form-item style="align-self: auto;margin-left: 50px" label="时间：">-->
<!--          &lt;!&ndash;          updateTime_s:机构名称&ndash;&gt;-->
<!--          <el-input-->
<!--            placeholder="请输入内容"-->
<!--            style="width: 100%"-->
<!--            v-model="searchInfo.updateTime_s">-->
<!--          </el-input>-->
<!--        </el-form-item>-->

        <el-form-item style="align-self: auto;margin-left: 50px">
          <el-button type="primary" icon="el-icon-search" @click="searchDirectory"> 搜索 </el-button>
        </el-form-item>

      </el-form>
    </div>
    <el-table :data="list" v-loading="listLoading"  border fit
               highlight-current-row min-width = "100%">
      <el-table-column align="center" label="序号" width="100">
        <template slot-scope="scope">
          <span v-text="getIndex(scope.$index)"> </span>
        </template>
      </el-table-column>
      <el-table-column align="center"  prop="name" label="目录" min-width="200"/>
      <el-table-column align="center" prop="userid" label="机构代码" width="200"/>
      <el-table-column align="center" prop="createTime" label="创建时间" width="200"/>
      <el-table-column align="center" prop="updateTime" label="最近修改时间" width="200"/>
      <el-table-column align="center" label="管理" width="100" >
        <template slot-scope="scope">
          <el-dropdown trigger="click" >
            <span class="el-dropdown-link" >
          <!--设置下拉菜单的样式为“...”-->
                <i class="el-icon-more" style="font-size: large"></i>
            </span>
            <el-dropdown-menu slot="dropdown" >
              <el-dropdown-item @click.native="showshareDirectory(scope.$index)" v-permission="'directory:share'">共享</el-dropdown-item>
              <el-dropdown-item @click.native ="removeDirectory(scope.$index)"  v-permission="'directory:delete'">删除</el-dropdown-item>
              <el-dropdown-item>备份</el-dropdown-item>
              <el-dropdown-item>下载</el-dropdown-item>
              <el-dropdown-item>查看日志</el-dropdown-item>

            </el-dropdown-menu>
          </el-dropdown>
<!--          <el-button type="danger" icon="delete" @click="removeDirectory(scope.$index)" v-permission="'directory:delete'">删除</el-button>-->
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
      layout="total, sizes, prev, pager, next, jumper">
    </el-pagination>
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form class="small-space" :model="tempDirectory" label-position="left" label-width="80px"
               style='width: 500px; margin-left:50px;'>
        <el-form-item label="机构代码">
          <el-input type="textarea" style="width:50%"  show-word-limit v-model="tempDirectory.shareid"  maxlength="50">
          </el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button v-if="dialogStatus==='share'" type="success" @click="shareDirectory()">共享</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
export default {
  watch:{
    searchInfo(){
      if (this.searchInfo.orgCode === ""){
        this.getList()
      }
    }
},
  data() {
    return {
      totalCount: 0, //分页组件--数据总条数
      backlist: [],//表格备份，用于搜索后恢复原有表格
      list: [],//表格的数据
      listLoading: false,//数据加载等待动画
      listQuery: {
        pageNum: 1,//页码
        pageRow: 50,//每页条数
        name: ''
      },
      dialogStatus: 'share',
      dialogFormVisible: false,
      dialogSchFormVisible: false,
      textMap: {
        update: '编辑',
        share: '共享目录',
      },
      searchInfo:{ //搜索条件数据
        orgCode: null,
        orgName:"",
        //updateTime_s:""
      },
      // cacheInfo:{
      //   orgCode:'',
      //   orgName:"123",
      //   updateTime_s:""
      // },
      // searchResult:{
      //   dirName:""
      //
      // },
      tempDirectory: {
        id: "",
        shareid: "",

      }
    }
  },
  created() {
    this.getList();
  },

  methods: {
    getList() {
      //查询列表
      if (!this.hasPerm('directory:list')) {
        return
      }
      this.listLoading = true;
      this.api({
        url: "/directory/listDirectory",
        method: "get",
        params: this.listQuery
      }).then(data => {
        this.listLoading = false;
        this.list = data.list;
        console.log(data.list)
        this.totalCount = data.totalCount;
      })
    },
    handleSizeChange(val) {
      //改变每页数量
      this.listQuery.pageRow = val
      this.handleFilter();
    },
    handleCurrentChange(val) {
      //改变页码
      this.listQuery.pageNum = val
      this.getList();
    },
    handleFilter() {
      //改变了查询条件,从第一页开始查询
      this.listQuery.pageNum = 1
      this.getList()
    },
    getIndex($index) {
      //表格序号
      return (this.listQuery.pageNum - 1) * this.listQuery.pageRow + $index + 1
    },

    searchDirectory(){
      let _vue = this;
      _vue.api({
        url: "/directory/searchDirectory",
        method: "get",
        params: _vue.searchInfo
      }).then(data => {
        console.log(data)
        console.log(data.list)

        _vue.list = data.list;

      })

    },
    // searchByName(){
    //   console.log("test name")
    // },


    showUpdate($index) {
      //显示修改对话框
      this.tempDirectory.id = this.list[$index].id;
      this.tempDirectory.name = this.list[$index].name;
      this.dialogStatus = "update"
      this.dialogFormVisible = true
    },
    createCertificate() {
      //保存新证照
      this.api({
        url: "/certificate/addCertificate",
        method: "post",
        data: this.tempDirectory
      }).then(() => {
        this.getList();
        this.dialogFormVisible = false
      })
    },
    // updateCertificate() {
    //   //修改证照
    //   this.api({
    //     url: "/certificate/updateCertificate",
    //     method: "post",
    //     data: this.tempDirectory
    //   }).then(() => {
    //     this.getList();
    //     this.dialogFormVisible = false
    //   })
    // },
    updateCertificate() {
      //修改证照
      this.api({
        url: "/certificate/renameCertificate",
        method: "post",
        data: this.tempDirectory
      }).then(() => {
        this.getList();
        this.dialogFormVisible = false
      })
    },
    showshareDirectory($index){
      //显示共享对话框
      // let _vue = this;
      this.tempDirectory.id = this.list[$index].id;
      this.tempDirectory.shareid = "";
      this.dialogStatus = "share"
      this.dialogFormVisible = true
    },
    shareDirectory(){
      let _vue = this;
      _vue.api({
        url: "/directory/shareDirectory",
        method: "post",
        data: this.tempDirectory
      }).then(() => {
        _vue.getList();
        _vue.dialogFormVisible = false
      })
    },
    removeDirectory($index) {
      let _vue = this;

      this.$confirm('确定删除此目录?', '提示', {
        confirmButtonText: '确定',
        showCancelButton: false,
        type: 'warning'
      }).then(() => {
        let directory = _vue.list[$index];
        console.log(directory)
        _vue.api({
          url: "/directory/deleteDirectory",
          method: "post",
          data: directory

        }).then(() => {
          this.$message.success('删除成功')
          _vue.getList()
        }).catch(() => {
          _vue.$message.error("删除失败")
        })
      })
    },
  }
}

</script>

