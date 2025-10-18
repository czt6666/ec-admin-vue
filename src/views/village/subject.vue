<template>
  <div class="app-container">
    <div class="filter-container">
      <el-form :inline="true" :model="listQuery" class="demo-form-inline">
        <el-form-item>
          <el-button type="primary" icon="plus" @click="showCreate">添加
          </el-button>
        </el-form-item>
        <el-form-item>
          <span class="title-text">新闻信息管理</span>
        </el-form-item>
        <el-form-item>
          <el-input v-model="listQuery.keyword" placeholder="请输入新闻标题或关键词" style="width: 200px;"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleFilter">查询</el-button>
        </el-form-item>
      </el-form>
    </div>

    <el-table v-loading="listLoading" :data="list" border fit highlight-current-row>
      <el-table-column align="center" label="序号" width="80">
        <template slot-scope="scope">
          <span>{{ getIndex(scope.$index) }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="title" label="新闻标题" align="center" width="300"></el-table-column>
      <el-table-column prop="authorId" label="编写用户ID" align="center"></el-table-column>
      <el-table-column prop="villageId" label="隶属乡村ID" align="center"></el-table-column>
      <el-table-column prop="themeName" label="主题" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.themeName || scope.row.theme }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="发布时间" align="center"></el-table-column>
      <el-table-column label="操作" width="150" align="center">
        <template slot-scope="scope">
          <el-button type="primary" size="mini" @click="showUpdate(scope.$index)">编辑</el-button>
          <el-button type="danger" size="mini" @click="removeNews(scope.$index)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-container">
      <el-pagination
        background
        layout="prev, pager, next, jumper"
        :total="totalCount"
        :page-size="listQuery.pageRow"
        :current-page.sync="listQuery.pageNum"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      ></el-pagination>
    </div>

    <el-dialog
      :title="dialogStatus === 'create' ? '新增新闻' : '编辑新闻'"
      :visible.sync="dialogFormVisible"
      width="800px"
    >
      <el-form :model="tempNews" :rules="rules" ref="newsForm">
        <el-row :gutter="10">
          <el-col :span="12">
            <el-form-item label="新闻标题" prop="title">
              <el-input v-model="tempNews.title" placeholder="请输入新闻标题"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="主题" prop="theme">
              <el-input v-model="tempNews.theme" placeholder="请输入主题"></el-input>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="10">
          <el-col :span="12">
            <el-form-item label="编写用户ID" prop="authorId">
              <el-input v-model="tempNews.authorId" placeholder="请输入用户ID"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="隶属乡村ID" prop="villageId">
              <el-input v-model="tempNews.villageId" placeholder="请输入乡村ID"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="新闻图片" prop="imageUrl">
          <el-upload
            class="upload-demo"
            action=""
            :on-change="handleImageChange"
            :auto-upload="false"
            :file-list="tempNews.imageFile ? [tempNews.imageFile] : []"
            list-type="picture-card"
            :limit="1"
            :on-exceed="() => $message.warning('最多上传1张图片')"
          >
            <i class="el-icon-plus"></i>   
          </el-upload>
        </el-form-item>
        <el-form-item label="新闻内容" prop="content">
          <el-input
            v-model="tempNews.content"
            type="textarea"
            :rows="10"
            placeholder="请输入新闻内容"
          ></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import {mapGetters} from 'vuex'

export default {
  name: 'NewsManage',
  data() {
    return {
      // 列表数据
      list: [],
      totalCount: 0,
      listLoading: false,
      // 查询参数
      listQuery: {
        pageNum: 1,
        pageRow: 10,
        keyword: ''
      },
      // 对话框状态
      dialogFormVisible: false,
      dialogStatus: 'create',
      // 临时新闻数据
      tempNews: {
        id: '',
        title: '',
        authorId: '',

        villageId: '',

        theme: '',
        imageUrl: '',
        imageFile: null,
        content: ''
      },
      // 下拉选择数据
      users: [],
      villages: [],
      themes: [],
      // 表单验证规则
      rules: {
        title: [
          { required: true, message: '请输入新闻标题', trigger: 'blur' }
        ],
        authorId: [
          { required: true, message: '请输入用户ID', trigger: 'blur' }
        ],
        villageId: [
          { required: true, message: '请输入乡村ID', trigger: 'blur' }
        ],

        theme: [
          { required: true, message: '请输入主题', trigger: 'blur' }
        ],
        content: [
          { required: true, message: '请输入新闻内容', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.getList()
    this.getUsersAndVillages()
    this.getThemes()
  },
  methods: {
    // 获取列表数据
    getList() {
      this.listLoading = true
      this.api({
        url: '/village/news/list',
        method: 'get',
        params: this.listQuery
      }).then(data => {
        this.listLoading = false
        this.list = data.list || []
        this.totalCount = data.totalCount || 0
      }).catch(() => {
        this.listLoading = false
      })
    },
    // 获取用户和乡村数据
    getUsersAndVillages() {
      // 获取用户列表
      this.api({
        url: '/user/getAllUsers',
        method: 'get'
      }).then(data => {
        this.users = data.list || []
      })

      // 获取乡村列表
      this.api({
        url: '/village/getVillages',
        method: 'get'
      }).then(data => {
        this.villages = data.list || []
      })
    },
    // 获取主题数据（从后端标签接口获取）
    getThemes() {
      this.api({
        url: '/tags/getInfo',
        method: 'post',
        data: {}
      }).then(data => {
        const list = data.list || []
        this.themes = list.map(item => ({
          id: item.id || item.tagId || item.value,
          name: item.name || item.tagName || item.label || item.value
        }))
      })
    },
    // 处理页码变化
    handleCurrentChange(val) {
      this.listQuery.pageNum = val
      this.getList()
    },
    // 处理每页条数变化
    handleSizeChange(val) {
      this.listQuery.pageRow = val
      this.getList()
    },
    // 处理查询
    handleFilter() {
      this.listQuery.pageNum = 1
      this.getList()
    },
    // 获取表格序号
    getIndex($index) {
      return (this.listQuery.pageNum - 1) * this.listQuery.pageRow + $index + 1
    },
    // 显示新增对话框
    showCreate() {
      this.dialogStatus = 'create'
      this.tempNews = {
        id: '',
        title: '',
        authorId: '',
        villageId: '',
        theme: '',
        imageUrl: '',
        imageFile: null,
        content: ''
      }
      // 默认填充当前登录用户
      const uid = this.$store.getters.userId
      if (uid) this.tempNews.authorId = uid
      // 默认填充首个乡村（如果有）
      const v = (this.villages && this.villages.length) ? this.villages[0] : null
      if (v) {
        this.tempNews.villageId = v.villageId || v.id
      }
      this.dialogFormVisible = true
    },
    // 显示编辑对话框
    showUpdate($index) {
      this.dialogStatus = 'update'
      const news = this.list[$index]
      this.tempNews = Object.assign({}, news)
      // 转换图片URL为文件对象
      const url = news.imageUrl
      this.tempNews.imageFile = url ? {
        name: (url || '').split('/').pop(),
        url: url,
        status: 'success'
      } : null
      this.dialogFormVisible = true
    },
    // 处理图片变化（仅限1张）
    handleImageChange(file, fileList) {
      const lastFile = fileList[fileList.length - 1]
      this.tempNews.imageFile = lastFile
      // 这里简化处理，实际项目中应该上传图片获取URL
      this.tempNews.imageUrl = lastFile ? (lastFile.url || URL.createObjectURL(lastFile.raw)) : ''
    },
    // 已移除：在此页面不支持添加主题
    // 提交表单
    submitForm() {
      this.$refs.newsForm.validate((valid) => {
        if (valid) {
          const submitData = { ...this.tempNews }

          // 移除不需要提交的字段
          delete submitData.imageFile
          delete submitData.themeName
          if (this.dialogStatus === 'create') {
            delete submitData.id
            this.createNews(submitData)
          } else {
            this.updateNews(submitData)
          }
        } else {
          return false
        }
      })
    },
    // 创建新闻
    createNews(data) {
      this.api({
        url: '/village/news/add',
        method: 'post',
        data: data
      }).then(() => {
        this.$message.success('添加成功')
        this.dialogFormVisible = false
        this.getList()
      }).catch(() => {
        this.$message.error('添加失败')
      })
    },
    // 更新新闻
    updateNews(data) {
      this.api({
        url: '/village/news/update',
        method: 'post',
        data: data
      }).then(() => {
        this.$message.success('更新成功')
        this.dialogFormVisible = false
        this.getList()
      }).catch(() => {
        this.$message.error('更新失败')
      })
    },
    // 删除新闻
    removeNews($index) {
      const news = this.list[$index]
      this.$confirm('确定要删除该新闻吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.api({
          url: '/village/news/delete',
          method: 'post',
          data: { id: news.id }
        }).then(() => {
          this.$message.success('删除成功')
          this.getList()
        }).catch(() => {
          this.$message.error('删除失败')
        })
      }).catch(() => {
        this.$message.info('已取消删除')
      })
    }
  }
}
</script>
<style scoped>
.filter-container {
  padding-bottom: 10px;
}
.title-text {
  font-size: 18px;
  font-weight: bold;
  margin-left: 20px;
}
.pagination-container {
  margin-top: 20px;
  text-align: right;
}
.el-upload--picture-card {
  width: 120px;
  height: 120px;
}

</style>
