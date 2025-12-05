<template>
  <div class="app-container">
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span>养老模式管理</span>
        <el-button
          style="float: right;"
          type="primary"
          icon="el-icon-plus"
          @click="handleAdd"
        >
          新增养老模式
        </el-button>
      </div>

      <!-- 搜索条件 -->
      <el-form :inline="true" :model="listQuery" class="demo-form-inline">
        <el-form-item label="模式名称">
          <el-input
            v-model="listQuery.modeName"
            placeholder="请输入模式名称"
            clearable
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-select
            v-model="listQuery.status"
            placeholder="请选择状态"
            clearable
          >
            <el-option label="启用" :value="1" />
            <el-option label="禁用" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            icon="el-icon-search"
            @click="handleFilter"
          >
            查询
          </el-button>
          <el-button icon="el-icon-refresh" @click="resetFilter">
            重置
          </el-button>
        </el-form-item>
      </el-form>

      <!-- 表格数据 -->
      <el-table
        v-loading="listLoading"
        :data="list"
        border
        highlight-current-row
        style="width: 100%;"
      >
        <el-table-column label="ID" prop="id" align="center" width="80" />
        <el-table-column label="服务模式名称" prop="modeName" align="center" />
        <el-table-column label="排序" prop="sort" align="center" width="100" />
        <el-table-column label="状态" align="center" width="100">
          <template slot-scope="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'">
              {{ row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          label="创建时间"
          prop="createTime"
          align="center"
          width="180"
        >
          <template slot-scope="{ row }">
            {{ row.createTime | parseTime('{y}-{m}-{d} {h}:{i}:{s}') }}
          </template>
        </el-table-column>
        <el-table-column
          label="操作"
          align="center"
          width="180"
          class-name="small-padding fixed-width"
        >
          <template slot-scope="{ row, $index }">
            <div class="operation-buttons">
              <el-button
                type="primary"
                size="mini"
                @click="handleUpdate(row)"
              >
                编辑
              </el-button>
              <el-button
                v-if="row.status === 1"
                size="mini"
                type="warning"
                @click="handleModifyStatus(row, 0)"
              >
                禁用
              </el-button>
              <el-button
                v-else
                size="mini"
                type="success"
                @click="handleModifyStatus(row, 1)"
              >
                启用
              </el-button>
              <el-button
                size="mini"
                type="danger"
                @click="handleDelete(row, $index)"
              >
                删除
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <pagination
        v-show="total > 0"
        :total="total"
        :page.sync="listQuery.page"
        :limit.sync="listQuery.limit"
        @pagination="getList"
      />

      <!-- 添加或修改对话框 -->
      <el-dialog
        :title="dialogType === 'create' ? '新增养老模式' : '编辑养老模式'"
        :visible.sync="dialogFormVisible"
        width="500px"
      >
        <el-form
          ref="dataForm"
          :model="temp"
          :rules="rules"
          label-width="100px"
          style="width: 400px; margin-left: 20px;"
        >
          <el-form-item label="模式名称" prop="modeName">
            <el-input
              v-model="temp.modeName"
              placeholder="请输入服务模式名称"
            />
          </el-form-item>
          <el-form-item label="排序" prop="sort">
            <el-input-number
              v-model="temp.sort"
              controls-position="right"
              :min="0"
              :max="99999"
            />
          </el-form-item>
          <el-form-item label="状态" prop="status">
            <el-radio-group v-model="temp.status">
              <el-radio :label="1">启用</el-radio>
              <el-radio :label="0">禁用</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="dialogFormVisible = false">
            取消
          </el-button>
          <el-button
            type="primary"
            @click="dialogType === 'create' ? createData() : updateData()"
          >
            确认
          </el-button>
        </div>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
import {
  getList,
  createServiceMode,
  updateServiceMode,
  deleteServiceMode,
  updateStatus
} from '@/api/elderlyCare/serviceMode'
import Pagination from '@/components/Pagination'

export default {
  name: 'ElderlyServiceMode',
  components: { Pagination },
  filters: {
    statusFilter(status) {
      const statusMap = {
        1: 'success',
        0: 'danger'
      }
      return statusMap[status]
    }
  },
  data() {
    return {
      list: [],
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 10,
        modeName: undefined,
        status: undefined
      },
      temp: {
        id: undefined,
        modeName: '',
        sort: 0,
        status: 1
      },
      dialogFormVisible: false,
      dialogType: '',
      rules: {
        modeName: [
          { required: true, message: '模式名称不能为空', trigger: 'blur' },
          { min: 1, max: 100, message: '长度在 1 到 100 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.listLoading = true
      getList(this.listQuery).then(response => {
        this.list = response.data.records
        this.total = response.data.total
        this.listLoading = false
      })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    resetFilter() {
      this.listQuery = {
        page: 1,
        limit: 10,
        modeName: undefined,
        status: undefined
      }
      this.getList()
    },
    handleAdd() {
      this.dialogType = 'create'
      this.resetTemp()
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    handleUpdate(row) {
      this.temp = Object.assign({}, row)
      this.dialogType = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    handleDelete(row, index) {
      this.$confirm('确认删除该养老模式吗？', '提示', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async() => {
        await deleteServiceMode(row.id)
        this.$message({
          message: '删除成功',
          type: 'success'
        })
        this.getList()
      }).catch(err => {
        console.error(err)
      })
    },
    handleModifyStatus(row, status) {
      const action = status === 1 ? '启用' : '禁用'
      this.$confirm(`确认${action}该养老模式吗？`, '提示', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async() => {
        await updateStatus({ id: row.id, status: status })
        this.$message({
          message: `${action}成功`,
          type: 'success'
        })
        row.status = status
      }).catch(err => {
        console.error(err)
      })
    },
    resetTemp() {
      this.temp = {
        id: undefined,
        modeName: '',
        sort: 0,
        status: 1
      }
    },
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          createServiceMode(this.temp).then(() => {
            this.dialogFormVisible = false
            this.$message({
              message: '创建成功',
              type: 'success'
            })
            this.getList()
          })
        }
      })
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.temp)
          updateServiceMode(tempData).then(() => {
            this.dialogFormVisible = false
            this.$message({
              message: '更新成功',
              type: 'success'
            })
            this.getList()
          })
        }
      })
    }
  }
}
</script>

<style scoped>
.app-container {
  padding: 20px;
}

/* 操作按钮容器 */
.operation-buttons {
  display: flex;
  justify-content: center;
  gap: 5px;
  flex-wrap: nowrap;
}

/* 响应式按钮 */
.operation-buttons .el-button {
  margin: 0;
  padding: 7px 10px;
  font-size: 12px;
}

/* 在小屏幕上调整按钮大小 */
@media (max-width: 768px) {
  .operation-buttons {
    gap: 3px;
  }
  
  .operation-buttons .el-button {
    padding: 5px 8px;
    font-size: 11px;
  }
}

/* 表格操作列宽度自适应 */
.el-table .small-padding.fixed-width {
  width: 180px !important;
}
</style>