<template>
  <div class="app-container">
    <!-- 搜索区域 -->
    <div class="filter-container">
      <el-form :inline="true" :model="listQuery" class="demo-form-inline">
        <el-form-item label="研学类型名称">
          <el-input
            v-model="listQuery.typeName"
            placeholder="请输入研学类型名称"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="listQuery.status" placeholder="全部" clearable style="width: 200px">
            <el-option
              v-for="item in statusOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSearchList">
            <i class="el-icon-search"></i> 搜索
          </el-button>
          <el-button @click="handleResetSearch">
            <i class="el-icon-refresh"></i> 重置
          </el-button>
          <el-button type="primary" @click="handleAdd">
            <i class="el-icon-plus"></i> 新增
          </el-button>
        </el-form-item>
      </el-form>
    </div>
    
   
    
    <!-- 数据表格 -->
    <div class="table-container">
      <el-table
        ref="productTable"
        :data="list"
        style="width: 100%;"
        v-loading="listLoading"
        border
        stripe
      >
        <el-table-column prop="id" label="编号" width="80" align="center"></el-table-column>
        <el-table-column prop="typeName" label="研学类型名称" align="center"></el-table-column>
        <el-table-column prop="sort" label="排序" width="100" align="center"></el-table-column>
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template slot-scope="scope">
            <el-switch
              @change="handleStatusChange(scope.$index, scope.row)"
              :active-value="1"
              :inactive-value="0"
              v-model="scope.row.status">
            </el-switch>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" align="center">
          <template slot-scope="scope">{{ scope.row.createTime | formatDateTime }}</template>
        </el-table-column>
        <el-table-column label="操作" width="150" align="center">
          <template slot-scope="scope">
            <el-button
              size="mini"
              type="primary"
              @click="handleUpdate(scope.$index, scope.row)"
            >
              编辑
            </el-button>
            <el-button
              size="mini"
              type="danger"
              @click="handleDelete(scope.$index, scope.row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    
    <!-- 分页 -->
    <div class="pagination-container">
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page.sync="listQuery.pageNum"
        :page-size="listQuery.pageSize"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
    </div>
    
    <!-- 添加/编辑对话框 -->
    <el-dialog
      :title="isEdit?'编辑研学类型':'添加研学类型'"
      :visible.sync="dialogVisible"
      width="500px"
    >
      <el-form
        :model="tourType"
        :rules="rules"
        ref="tourTypeForm"
        label-width="100px"
        size="small"
      >
        <el-form-item label="类型名称" prop="typeName">
          <el-input v-model="tourType.typeName" style="width: 300px"/>
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="tourType.sort" :min="0" style="width: 300px"/>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="tourType.status">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleDialogConfirm">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { formatDate } from '@/utils/date'
import { 
  fetchList, 
  createTourType, 
  updateTourType, 
  deleteTourType, 
  updateStatus 
} from '@/api/study/tourType'

const defaultListQuery = {
  pageNum: 1,
  pageSize: 10,
  typeName: null,
  status: null
}

const defaultTourType = {
  id: null,
  typeName: null,
  sort: 0,
  status: 1
}

export default {
  name: 'TourType',
  data() {
    return {
      listQuery: Object.assign({}, defaultListQuery),
      list: null,
      total: 0,
      listLoading: false,
      dialogVisible: false,
      isEdit: false,
      tourType: Object.assign({}, defaultTourType),
      statusOptions: [
        {
          label: '全部',
          value: null
        },
        {
          label: '启用',
          value: 1
        },
        {
          label: '禁用',
          value: 0
        }
      ]
    }
  },
  created() {
    this.getList()
  },
  filters: {
    formatDateTime(time) {
      if (time == null || time === '') {
        return ''
      }
      const date = new Date(time)
      return formatDate(date, 'yyyy-MM-dd hh:mm:ss')
    }
  },
  methods: {
    handleResetSearch() {
      this.listQuery = Object.assign({}, defaultListQuery)
    },
    handleSearchList() {
      this.listQuery.pageNum = 1
      this.getList()
    },
    handleSizeChange(val) {
      this.listQuery.pageNum = 1
      this.listQuery.pageSize = val
      this.getList()
    },
    handleCurrentChange(val) {
      this.listQuery.pageNum = val
      this.getList()
    },
    handleAdd() {
      this.dialogVisible = true
      this.isEdit = false
      this.tourType = Object.assign({}, defaultTourType)
    },
    handleStatusChange(index, row) {
      this.$confirm('是否要修改该状态？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        updateStatus({ id: row.id, status: row.status }).then(response => {
          this.$message({
            message: '修改成功！',
            type: 'success'
          })
        }).catch(() => {
          // 失败时回退状态
          row.status = row.status === 1 ? 0 : 1
        })
      }).catch(() => {
        // 取消时回退状态
        row.status = row.status === 1 ? 0 : 1
      })
    },
    handleDelete(index, row) {
      this.$confirm('是否要删除该研学类型？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteTourType(row.id).then(response => {
          this.$message({
            message: '删除成功！',
            type: 'success'
          })
          this.getList()
        })
      })
    },
    handleUpdate(index, row) {
      this.dialogVisible = true
      this.isEdit = true
      this.tourType = Object.assign({}, row)
    },
    handleDialogConfirm() {
      this.$refs['tourTypeForm'].validate((valid) => {
        if (valid) {
          const tourType = Object.assign({}, this.tourType)
          if (this.isEdit) {
            updateTourType(tourType).then(response => {
              this.$message({
                message: '修改成功！',
                type: 'success'
              })
              this.dialogVisible = false
              this.getList()
            })
          } else {
            createTourType(tourType).then(response => {
              this.$message({
                message: '添加成功！',
                type: 'success'
              })
              this.dialogVisible = false
              this.getList()
            })
          }
        } else {
          this.$message({
            message: '验证失败',
            type: 'error'
            })
          return false
        }
      })
    },
    getList() {
      this.listLoading = true
      fetchList(this.listQuery).then(response => {
        this.listLoading = false
        if (response && response.data) {
          // 根据响应数据结构处理
          if (response.data.records) {
            // 如果是分页数据结构 (PageResult)
            this.list = response.data.records
            this.total = response.data.total || 0
          } else if (response.data.list) {
            // 如果是简单列表结构
            this.list = response.data.list
            this.total = response.data.total || 0
          } else {
            // 如果是直接数组结构
            this.list = response.data
            this.total = response.data.length || 0
          }
        } else {
          this.list = []
          this.total = 0
        }
      }).catch(() => {
        this.listLoading = false
        this.list = []
        this.total = 0
      })
    }
  }
}
</script>

<style scoped>
.filter-container {
  background-color: #f5f7fa;
  padding: 20px;
  border-radius: 4px;
  margin-bottom: 20px;
}

.operate-container {
  background-color: #f5f7fa;
  padding: 15px;
  border-radius: 4px;
  margin-bottom: 20px;
}

.table-container {
  margin-bottom: 15px;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}
</style>