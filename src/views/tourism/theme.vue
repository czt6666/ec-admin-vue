<template>
  <div class="page">
    <el-card>
      <div slot="header" class="header">
        <div class="filters">
          <el-input
            v-model="query.themeName"
            placeholder="主题名称"
            clearable
            style="width: 200px; margin-right: 10px"
          />
          <el-select v-model="query.status" placeholder="状态" clearable style="width: 140px; margin-right: 10px">
            <el-option label="启用" :value="1" />
            <el-option label="停用" :value="0" />
          </el-select>
          <el-button type="primary" icon="el-icon-search" @click="handleSearch">搜索</el-button>
          <el-button icon="el-icon-refresh" @click="handleReset">重置</el-button>
        </div>
        <el-button type="primary" icon="el-icon-plus" @click="openDialog()">新增主题</el-button>
      </div>

      <el-table :data="tableData" border stripe>
        <el-table-column type="index" label="序号" width="60" />
        <el-table-column prop="themeName" label="主题名称" min-width="160" />
        <el-table-column prop="themeCode" label="编码" min-width="140" />
        <el-table-column prop="status" label="状态" width="100">
          <template slot-scope="scope">
            <el-tag :type="scope.row.status === 1 ? 'success' : 'info'">
              {{ scope.row.status === 1 ? '启用' : '停用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" min-width="170" />
        <el-table-column label="操作" width="180" fixed="right">
          <template slot-scope="scope">
            <el-button type="primary" size="mini" @click="openDialog(scope.row)">编辑</el-button>
            <el-button type="danger" size="mini" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pager">
        <el-pagination
          :current-page="pagination.page"
          :page-size="pagination.pageSize"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          :page-sizes="[10, 20, 50]"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>

    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="480px">
      <el-form :model="form" :rules="rules" ref="form" label-width="90px">
        <el-form-item label="主题名称" prop="themeName">
          <el-input v-model="form.themeName" maxlength="100" />
        </el-form-item>
        <el-form-item label="编码">
          <el-input v-model="form.themeCode" maxlength="100" />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="form.sort" :min="0" />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="form.status">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">停用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listRouteTheme, createRouteTheme, updateRouteTheme, deleteRouteTheme } from '@/api/routeTheme'

export default {
  name: 'RouteTheme',
  data() {
    return {
      query: {
        themeName: '',
        status: null
      },
      tableData: [],
      pagination: {
        page: 1,
        pageSize: 10,
        total: 0
      },
      dialogVisible: false,
      dialogTitle: '新增主题',
      form: {
        id: null,
        themeName: '',
        themeCode: '',
        sort: 0,
        status: 1
      },
      rules: {
        themeName: [{ required: true, message: '请输入主题名称', trigger: 'blur' }]
      }
    }
  },
  mounted() {
    this.loadData()
  },
  methods: {
    async loadData() {
      const params = {
        page: this.pagination.page,
        limit: this.pagination.pageSize,
        ...this.query
      }
      const res = await listRouteTheme(params)
      if (res && res.code === 200) {
        const data = res.data || {}
        this.tableData = data.records || data.list || []
        this.pagination.total = data.total || 0
      }
    },
    handleSearch() {
      this.pagination.page = 1
      this.loadData()
    },
    handleReset() {
      this.query = { themeName: '', status: null }
      this.handleSearch()
    },
    handleSizeChange(val) {
      this.pagination.pageSize = val
      this.pagination.page = 1
      this.loadData()
    },
    handlePageChange(val) {
      this.pagination.page = val
      this.loadData()
    },
    openDialog(row) {
      if (row) {
        this.dialogTitle = '编辑主题'
        this.form = { ...row }
      } else {
        this.dialogTitle = '新增主题'
        this.form = { id: null, themeName: '', themeCode: '', sort: 0, status: 1 }
      }
      this.dialogVisible = true
      this.$nextTick(() => {
        if (this.$refs.form) this.$refs.form.clearValidate()
      })
    },
    handleSubmit() {
      this.$refs.form.validate(async(valid) => {
        if (!valid) return
        const api = this.form.id ? updateRouteTheme : createRouteTheme
        const res = await api(this.form)
        if (res && res.code === 200) {
          this.$message.success(this.form.id ? '更新成功' : '创建成功')
          this.dialogVisible = false
          this.loadData()
        } else {
          this.$message.error(res.msg || '操作失败')
        }
      })
    },
    handleDelete(row) {
      this.$confirm('确认删除该主题？', '提示', { type: 'warning' })
        .then(async() => {
          const res = await deleteRouteTheme(row.id)
          if (res && res.code === 200) {
            this.$message.success('删除成功')
            this.loadData()
          } else {
            this.$message.error(res.msg || '删除失败')
          }
        })
        .catch(() => {})
    }
  }
}
</script>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.filters {
  display: flex;
  align-items: center;
}
.pager {
  margin-top: 16px;
  text-align: right;
}
</style>

