<template>
  <div class="app-container">
    <!-- 搜索栏 -->
    <el-card class="filter-container" shadow="never">
      <div>
        <i class="el-icon-search"></i>
        <span>筛选搜索</span>
        <el-button
          style="float: right"
          type="primary"
          size="small"
          @click="handleSearchList"
        >
          查询
        </el-button>
        <el-button
          style="float: right; margin-right: 15px"
          size="small"
          @click="handleResetSearch"
        >
          重置
        </el-button>
      </div>
      <div style="margin-top: 15px">
        <el-form :inline="true" :model="listQuery" size="small" label-width="140px">
          <el-form-item label="方案名称：">
            <el-input
              v-model="listQuery.planName"
              placeholder="方案名称"
              clearable
              style="width: 200px"
            ></el-input>
          </el-form-item>
          <el-form-item label="所属基地：">
            <el-select
              v-model="listQuery.baseId"
              placeholder="请选择基地"
              clearable
              style="width: 200px"
            >
              <el-option
                v-for="item in baseOptions"
                :key="item.id"
                :label="item.baseName"
                :value="item.id">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="方案状态：">
            <el-select
              v-model="listQuery.status"
              placeholder="请选择状态"
              clearable
              style="width: 200px"
            >
              <el-option
                v-for="item in statusOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </div>
    </el-card>
    
    <!-- 操作按钮区域 -->
    <div class="operation-buttons">
      <el-button
        type="primary"
        size="small"
        @click="handleAdd"
      >
        新增方案
      </el-button>
    </div>
    
    <!-- 数据表格 -->
    <div class="table-container">
      <el-table
        ref="productTable"
        :data="list"
        style="width: 100%"
        v-loading="listLoading"
        border
      >
        <el-table-column label="编号" width="80" align="center">
          <template slot-scope="scope">{{ scope.row.id }}</template>
        </el-table-column>
        <el-table-column label="方案名称" align="center">
          <template slot-scope="scope">{{ scope.row.planName }}</template>
        </el-table-column>
        <el-table-column label="所属基地" align="center">
          <template slot-scope="scope">
            {{ getBaseName(scope.row.baseId) }}
          </template>
        </el-table-column>
        <el-table-column label="研学时长" align="center">
          <template slot-scope="scope">{{ scope.row.duration }}</template>
        </el-table-column>
        <el-table-column label="适用人群" align="center">
          <template slot-scope="scope">{{ scope.row.suitableCrowd }}</template>
        </el-table-column>
        <el-table-column label="方案状态" align="center">
          <template slot-scope="scope">
            <el-tag :type="scope.row.status | statusFilter">
              {{ scope.row.status | statusTextFilter }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" align="center">
          <template slot-scope="scope">{{ scope.row.createTime | formatDateTime }}</template>
        </el-table-column>
        <el-table-column label="操作" width="200" align="center">
          <template slot-scope="scope">
            <el-button
              size="mini"
              type="primary"
              plain
              @click="handleUpdate(scope.$index, scope.row)"
            >
              编辑
            </el-button>
            <el-button
              size="mini"
              type="danger"
              plain
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
      :title="isEdit?'编辑研学方案':'添加研学方案'"
      :visible.sync="dialogVisible"
      width="800px"
      :close-on-click-modal="false"
    >
      <el-form
        :model="tourPlan"
        :rules="rules"
        ref="tourPlanForm"
        label-width="120px"
        size="small"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="方案名称" prop="planName">
              <el-input v-model="tourPlan.planName" style="width: 100%"/>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="所属基地" prop="baseId">
              <el-select v-model="tourPlan.baseId" placeholder="请选择基地" style="width: 100%">
                <el-option
                  v-for="item in baseOptions"
                  :key="item.id"
                  :label="item.baseName"
                  :value="item.id">
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="研学时长" prop="duration">
              <el-input v-model="tourPlan.duration" placeholder="如：3小时/1天/2天1夜" style="width: 100%"/>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="适用人群" prop="suitableCrowd">
              <el-input v-model="tourPlan.suitableCrowd" placeholder="如：小学生,初中生,亲子家庭" style="width: 100%"/>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item label="研学路线" prop="route">
          <el-input 
            type="textarea" 
            v-model="tourPlan.route" 
            :rows="3" 
            placeholder="如：展厅参观→实践区→分享总结"
            style="width: 100%"
          />
        </el-form-item>
        
        <el-form-item label="方案简介" prop="briefIntro">
          <el-input 
            type="textarea" 
            v-model="tourPlan.briefIntro" 
            :rows="3" 
            placeholder="请输入方案简介"
            style="width: 100%"
          />
        </el-form-item>
        
        <el-form-item label="方案内容" prop="details">
          <el-input 
            type="textarea" 
            v-model="tourPlan.details" 
            :rows="5" 
            placeholder="请输入方案具体内容"
            style="width: 100%"
          />
        </el-form-item>
        
        <el-form-item label="方案状态" prop="status">
          <el-radio-group v-model="tourPlan.status">
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
  createTourPlan, 
  updateTourPlan, 
  deleteTourPlan
} from '@/api/study/tourPlan'
import { list as fetchBases } from '@/api/study/tourBase'

const defaultListQuery = {
  pageNum: 1,
  pageSize: 10,
  planName: null,
  baseId: null,
  status: null
}

const defaultTourPlan = {
  id: null,
  planName: null,
  baseId: null,
  route: null,
  briefIntro: null,
  details: null,
  suitableCrowd: null,
  duration: null,
  status: 1
}

export default {
  name: 'TourPlan',
  data() {
    return {
      listQuery: Object.assign({}, defaultListQuery),
      list: null,
      total: 0,
      listLoading: false,
      dialogVisible: false,
      isEdit: false,
      tourPlan: Object.assign({}, defaultTourPlan),
      baseOptions: [],
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
      ],
      rules: {
        planName: [
          { required: true, message: '请输入方案名称', trigger: 'blur' },
          { min: 2, max: 200, message: '长度在 2 到 200 个字符', trigger: 'blur' }
        ],
        baseId: [
          { required: true, message: '请选择所属基地', trigger: 'change' }
        ],
        route: [
          { required: true, message: '请输入研学路线', trigger: 'blur' }
        ],
        duration: [
          { required: true, message: '请输入研学时长', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.getList()
    this.loadBases()
  },
  filters: {
    formatDateTime(time) {
      if (time == null || time === '') {
        return ''
      }
      const date = new Date(time)
      return formatDate(date, 'yyyy-MM-dd hh:mm:ss')
    },
    statusFilter(status) {
      const statusMap = {
        0: 'info',
        1: 'success'
      }
      return statusMap[status]
    },
    statusTextFilter(status) {
      const statusTextMap = {
        0: '禁用',
        1: '启用'
      }
      return statusTextMap[status]
    }
  },
  methods: {
    handleResetSearch() {
      this.listQuery = Object.assign({}, defaultListQuery)
      this.handleSearchList()
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
      this.tourPlan = Object.assign({}, defaultTourPlan)
    },
    handleDelete(index, row) {
      this.$confirm('是否要删除该研学方案？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteTourPlan(row.id).then(response => {
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
      this.tourPlan = Object.assign({}, row)
    },
    handleDialogConfirm() {
      this.$refs['tourPlanForm'].validate((valid) => {
        if (valid) {
          const tourPlan = Object.assign({}, this.tourPlan)
          
          if (this.isEdit) {
            updateTourPlan(tourPlan).then(response => {
              this.$message({
                message: '修改成功！',
                type: 'success'
              })
              this.dialogVisible = false
              this.getList()
            })
          } else {
            createTourPlan(tourPlan).then(response => {
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
          if (response.data.records) {
            this.list = response.data.records
            this.total = response.data.total || 0
          } else if (response.data.list) {
            this.list = response.data.list
            this.total = response.data.total || 0
          } else {
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
    },
    loadBases() {
      fetchBases().then(response => {
        this.baseOptions = response.data
      })
    },
    getBaseName(baseId) {
      const base = this.baseOptions.find(item => item.id === baseId)
      return base ? base.baseName : ''
    }
  }
}
</script>

<style scoped>
.filter-container {
  margin-bottom: 20px;
}

.operation-buttons {
  margin-bottom: 20px;
}

.table-container {
  margin-bottom: 20px;
}

.pagination-container {
  display: flex;
  justify-content: center;
}
</style>