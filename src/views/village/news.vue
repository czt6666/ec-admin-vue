<template>
  <div class="app-container">
    <div class="filter-container">
      <el-form :inline="true" :model="listQuery" class="demo-form-inline">
        <el-form-item>
          <el-button type="primary" icon="plus" @click="showCreate">添加</el-button>
        </el-form-item>
        <el-form-item>
          <span class="title-text">主题管理</span>
        </el-form-item>
        <el-form-item>
          <el-input v-model="listQuery.keyword" placeholder="请输入主题关键词" style="width: 200px;"></el-input>
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
      <el-table-column prop="id" label="ID" align="center" width="120"></el-table-column>
      <el-table-column prop="name" label="主题" align="center"></el-table-column>
      <el-table-column label="操作" width="150" align="center">
        <template slot-scope="scope">
          <el-button type="primary" size="mini" @click="showUpdate(scope.$index)">编辑</el-button>
          <el-button type="danger" size="mini" @click="removeTag(scope.$index)">删除</el-button>
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

    <el-dialog :title="dialogStatus === 'create' ? '新增主题' : '编辑主题'" :visible.sync="dialogFormVisible" width="500px">
      <el-form :model="tempTag" :rules="rules" ref="tagForm">
        <el-form-item label="主题" prop="name">
          <el-input v-model="tempTag.name" placeholder="请输入主题"></el-input>
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
export default {
  name: 'ThemeManage',
  data() {
    return {
      list: [],
      totalCount: 0,
      listLoading: false,
      dialogFormVisible: false,
      dialogStatus: 'create',
      listQuery: {
        pageNum: 1,
        pageRow: 10,
        keyword: ''
      },
      tempTag: {
        id: '',
        name: ''
      },
      rules: {
        name: [{ required: true, message: '请输入主题', trigger: 'blur' }]
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    // 列表（分页 + 关键词）
    getList() {
      this.listLoading = true
      this.api({
        url: '/village/news/theme/list',
        method: 'get',
        params: this.listQuery
      }).then(data => {
        this.listLoading = false
        const list = data.list || []
        this.list = list.map(item => ({ id: item.id, name: item.name }))
        this.totalCount = data.totalCount || 0
      }).catch(() => {
        this.listLoading = false
      })
    },
    // 计算序号（考虑分页）
    getIndex($index) {
      return (this.listQuery.pageNum - 1) * this.listQuery.pageRow + $index + 1
    },
    // 查询按钮
    handleFilter() {
      this.listQuery.pageNum = 1
      this.getList()
    },
    // 分页事件
    handleCurrentChange(val) {
      this.listQuery.pageNum = val
      this.getList()
    },
    handleSizeChange(val) {
      this.listQuery.pageRow = val
      this.getList()
    },
    // 新增弹窗
    showCreate() {
      this.dialogStatus = 'create'
      this.tempTag = { id: '', name: '' }
      this.dialogFormVisible = true
    },
    // 编辑弹窗
    showUpdate($index) {
      this.dialogStatus = 'update'
      const tag = this.list[$index]
      this.tempTag = { id: tag.id, name: tag.name }
      this.dialogFormVisible = true
    },
    // 提交（新增/编辑）
    submitForm() {
      this.$refs.tagForm.validate((valid) => {
        if (!valid) return
        const name = (this.tempTag.name || '').trim()
        if (!name || name.length > 30) {
          this.$message.error('主题不能为空且不超过30个字符')
          return
        }
        const payload = { id: this.tempTag.id, name }
        if (this.dialogStatus === 'create') {
          this.createTag({ name: payload.name })
        } else {
          this.updateTag(payload)
        }
      })
    },
    // 新增
    createTag(data) {
      this.api({
        url: '/village/news/theme/add',
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        data: JSON.stringify({ name: data.name })
      }).then(() => {
        this.$message.success('添加成功')
        this.dialogFormVisible = false
        this.getList()
      }).catch(() => {
        this.$message.error('添加失败')
      })
    },
    // 更新
    updateTag(data) {
      this.api({
        url: '/village/news/theme/update',
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        data: JSON.stringify({ id: data.id, name: data.name })
      }).then(() => {
        this.$message.success('更新成功')
        this.dialogFormVisible = false
        this.getList()
      }).catch(() => {
        this.$message.error('更新失败')
      })
    },
    // 删除
    removeTag($index) {
      const tag = this.list[$index]
      this.$confirm('确定要删除该主题吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.api({
          url: '/village/news/theme/delete',
          method: 'post',
          headers: { 'Content-Type': 'application/json' },
          data: JSON.stringify({ id: tag.id })
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
.filter-container { padding-bottom: 10px; }
.title-text { font-size: 18px; font-weight: bold; margin-left: 20px; }
.pagination-container { margin-top: 20px; text-align: right; }
</style>
