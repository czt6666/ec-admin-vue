<template>
  <div class="app-container">
    <!-- 搜索和操作栏 -->
    <div class="filter-container">
      <el-form :inline="true" :model="listQuery" class="demo-form-inline">
        <el-form-item label="活动名称">
          <el-input v-model="listQuery.activityName" placeholder="请输入活动名称" />
        </el-form-item>
        <el-form-item label="关联方案">
          <el-select v-model="listQuery.planId" placeholder="请选择关联方案" clearable>
            <el-option
              v-for="item in planOptions"
              :key="item.id"
              :label="item.planName"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="活动状态">
          <el-select v-model="listQuery.status" placeholder="请选择活动状态" clearable>
            <el-option
              v-for="item in statusOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="handleFilter">
            搜索
          </el-button>
          <el-button type="primary" icon="el-icon-plus" @click="handleCreate">
            新增活动
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 表格数据 -->
    <el-table
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%;"
    >
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="activityName" label="活动名称" min-width="150" />
      <el-table-column prop="planId" label="关联方案ID" width="100" />
      <el-table-column label="报名时间" width="200">
        <template slot-scope="scope">
          {{ scope.row.applyStartDate }} 至 {{ scope.row.applyEndDate }}
        </template>
      </el-table-column>
      <el-table-column label="活动时间" width="200">
        <template slot-scope="scope">
          {{ scope.row.activityStartDate }} 至 {{ scope.row.activityEndDate }}
        </template>
      </el-table-column>
      <el-table-column prop="price" label="价格(元)" width="100" />
      <el-table-column label="招生情况" width="120">
        <template slot-scope="scope">
          {{ scope.row.registeredNum }} / {{ scope.row.recruitNum }}
        </template>
      </el-table-column>
      <el-table-column prop="status" label="活动状态" width="100">
        <template slot-scope="scope">
          <el-tag :type="getStatusTagType(scope.row.status)">
            {{ getStatusText(scope.row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="创建时间" width="160" />
      <el-table-column label="操作" align="center" width="200" class-name="small-padding fixed-width" fixed="right">
        <template slot-scope="{ row }">
          <el-button type="primary" size="mini" @click="handleUpdate(row)">
            编辑
          </el-button>
          <el-button size="mini" type="danger" @click="handleDelete(row)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="listQuery.pageNum"
      :limit.sync="listQuery.pageSize"
      @pagination="getList"
    />

    <!-- 新增/编辑对话框 -->
    <el-dialog :title="dialogStatus === 'create' ? '新增研学活动' : '编辑研学活动'" :visible.sync="dialogFormVisible">
      <el-form
        ref="dataForm"
        :model="temp"
        :rules="rules"
        label-position="left"
        label-width="120px"
        style="width: 500px; margin-left: 50px;"
      >
        <el-form-item label="活动名称" prop="activityName">
          <el-input v-model="temp.activityName" />
        </el-form-item>
        <el-form-item label="关联方案" prop="planId">
          <el-select v-model="temp.planId" placeholder="请选择关联方案" style="width: 100%">
            <el-option
              v-for="item in planOptions"
              :key="item.id"
              :label="item.planName"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="报名开始日期" prop="applyStartDate">
          <el-date-picker
            v-model="temp.applyStartDate"
            type="date"
            placeholder="选择报名开始日期"
            value-format="yyyy-MM-dd"
            :picker-options="pickerOptions"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="报名结束日期" prop="applyEndDate">
          <el-date-picker
            v-model="temp.applyEndDate"
            type="date"
            placeholder="选择报名结束日期"
            value-format="yyyy-MM-dd"
            :picker-options="pickerOptions"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="活动开始日期" prop="activityStartDate">
          <el-date-picker
            v-model="temp.activityStartDate"
            type="date"
            placeholder="选择活动开始日期"
            value-format="yyyy-MM-dd"
            :picker-options="pickerOptions"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="活动结束日期" prop="activityEndDate">
          <el-date-picker
            v-model="temp.activityEndDate"
            type="date"
            placeholder="选择活动结束日期"
            value-format="yyyy-MM-dd"
            :picker-options="pickerOptions"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="活动价格(元)" prop="price">
          <el-input-number
            v-model="temp.price"
            :precision="2"
            :step="0.1"
            :min="0"
            controls-position="right"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="招生人数" prop="recruitNum">
          <el-input-number
            v-model="temp.recruitNum"
            :min="0"
            controls-position="right"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="已报名人数" prop="registeredNum">
          <el-input-number
            v-model="temp.registeredNum"
            :min="0"
            controls-position="right"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="活动状态" prop="status">
          <el-select v-model="temp.status" placeholder="请选择活动状态" style="width: 100%">
            <el-option
              v-for="item in statusOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="活动备注" prop="remark">
          <el-input
            v-model="temp.remark"
            type="textarea"
            :autosize="{ minRows: 2, maxRows: 4 }"
            placeholder="请输入活动备注"
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          取消
        </el-button>
        <el-button type="primary" @click="dialogStatus === 'create' ? createData() : updateData()">
          确认
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  fetchList,
  createActivity,
  updateActivity,
  deleteActivity,
  getActivity
} from '@/api/study/tourActivity'
import { fetchList as fetchPlanList } from '@/api/study/tourPlan'
import Pagination from '@/components/Pagination'

export default {
  name: 'StudyTourActivity',
  components: { Pagination },
  data() {
    return {
      list: [],
      total: 0,
      listQuery: {
        pageNum: 1,
        pageSize: 10,
        activityName: undefined,
        planId: undefined,
        status: undefined
      },
      planOptions: [],
      statusOptions: [
        { value: 1, label: '报名中' },
        { value: 2, label: '报名结束' },
        { value: 3, label: '活动进行中' },
        { value: 4, label: '活动结束' },
        { value: 5, label: '取消' }
      ],
      temp: {
        id: undefined,
        activityName: '',
        planId: undefined,
        applyStartDate: '',
        applyEndDate: '',
        activityStartDate: '',
        activityEndDate: '',
        price: 0,
        recruitNum: 0,
        registeredNum: 0,
        status: 1,
        remark: ''
      },

      dialogFormVisible: false,
      dialogStatus: '',
      pickerOptions: {
        disabledDate: (time) => {
          return time.getTime() > Date.now()
        }
      }
    }
  },
  created() {
    this.getList()
    this.getPlanList()
  },
  computed: {
    rules() {
      return {
        activityName: [{ required: true, message: '活动名称不能为空', trigger: 'blur' }],
        planId: [{ required: true, message: '关联方案不能为空', trigger: 'change' }],
        price: [{ required: true, message: '活动价格不能为空', trigger: 'blur' }],
        recruitNum: [{ required: true, message: '招生人数不能为空', trigger: 'blur' }]
      }
    }
  },
  methods: {
    getList() {
      fetchList(this.listQuery).then(response => {
        this.list = response.data.list
        this.total = response.data.total
      })
    },
    getPlanList() {
      fetchPlanList({ pageNum: 1, pageSize: 1000 }).then(response => {
        this.planOptions = response.data.records
      })
    },
    handleFilter() {
      this.listQuery.pageNum = 1
      this.getList()
    },
    resetTemp() {
      this.temp = {
        id: undefined,
        activityName: '',
        planId: undefined,
        applyStartDate: '',
        applyEndDate: '',
        activityStartDate: '',
        activityEndDate: '',
        price: 0,
        recruitNum: 0,
        registeredNum: 0,
        status: 1,
        remark: ''
      }
    },
    handleCreate() {
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    createData() {
      // 首先执行基础表单验证
      this.$refs['dataForm'].validate(async (valid) => {
        if (valid) {
          // 然后进行日期逻辑验证
          if (!(await this.validateDateLogic())) {
            return
          }
          createActivity(this.temp).then(() => {
            this.getList()
            this.dialogFormVisible = false
            this.$message({
              message: '创建成功',
              type: 'success'
            })
          })
        }
      })
    },
    handleUpdate(row) {
      this.temp = Object.assign({}, row)
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateData() {
      // 首先执行基础表单验证
      this.$refs['dataForm'].validate(async (valid) => {
        if (valid) {
          // 然后进行日期逻辑验证
          if (!(await this.validateDateLogic())) {
            return
          }
          const tempData = Object.assign({}, this.temp)
          updateActivity(tempData).then(() => {
            this.getList()
            this.dialogFormVisible = false
            this.$message({
              message: '更新成功',
              type: 'success'
            })
          })
        }
      })
    },
    handleDelete(row) {
      this.$confirm('确认删除该研学活动?', '提示', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteActivity(row.id).then(() => {
          this.getList()
          this.$message({
            message: '删除成功',
            type: 'success'
          })
        })
      })
    },
    handleApplyDateChange(dateRange) {
      if (dateRange && dateRange.length === 2) {
        this.temp.applyStartDate = dateRange[0];
        this.temp.applyEndDate = dateRange[1];
        // 触发验证
        if (this.$refs['dataForm']) {
          this.$refs['dataForm'].validateField('applyStartDate');
          this.$refs['dataForm'].validateField('applyEndDate');
        }
      } else {
        this.temp.applyStartDate = '';
        this.temp.applyEndDate = '';
      }
    },
    handleActivityDateChange(dateRange) {
      if (dateRange && dateRange.length === 2) {
        this.temp.activityStartDate = dateRange[0];
        this.temp.activityEndDate = dateRange[1];
        // 触发验证
        if (this.$refs['dataForm']) {
          this.$refs['dataForm'].validateField('activityStartDate');
          this.$refs['dataForm'].validateField('activityEndDate');
        }
      } else {
        this.temp.activityStartDate = '';
        this.temp.activityEndDate = '';
      }
    },
    validateApplyDateRange(rule, value, callback) {
      if (this.temp.applyStartDate && this.temp.applyEndDate) {
        if (new Date(this.temp.applyStartDate) > new Date(this.temp.applyEndDate)) {
          callback(new Error('报名开始日期不能晚于报名结束日期'))
        } else {
          callback()
        }
      } else {
        callback()
      }
    },
    validateActivityDateRange(rule, value, callback) {
      if (this.temp.activityStartDate && this.temp.activityEndDate) {
        if (new Date(this.temp.activityStartDate) > new Date(this.temp.activityEndDate)) {
           callback(new Error('活动开始日期不能晚于活动结束日期'))
         } else if (new Date(this.temp.activityEndDate) < new Date(this.temp.applyStartDate)) {
           callback(new Error('活动结束日期不能早于报名开始日期'))
          } else {
            callback()
        }
      } else {
        callback()
      }
    },
    // 在提交时验证日期逻辑
    validateDateLogic() {
      return new Promise((resolve) => {
        // 验证报名日期范围
        if (this.temp.applyStartDate && this.temp.applyEndDate) {
          if (new Date(this.temp.applyStartDate) > new Date(this.temp.applyEndDate)) {
            this.$message({
              message: '报名开始日期不能晚于报名结束日期',
              type: 'error'
            });
            resolve(false);
            return;
          }
        }
        
        // 验证活动日期范围
        if (this.temp.activityStartDate && this.temp.activityEndDate) {
          if (new Date(this.temp.activityStartDate) > new Date(this.temp.activityEndDate)) {
            this.$message({
              message: '活动开始日期不能晚于活动结束日期',
              type: 'error'
            });
            resolve(false);
            return;
          }
        }
        
        // 验证活动结束日期不能早于报名开始日期
        if (this.temp.applyStartDate && this.temp.activityEndDate) {
          if (new Date(this.temp.activityEndDate) < new Date(this.temp.applyStartDate)) {
            this.$message({
              message: '活动结束日期不能早于报名开始日期',
              type: 'error'
            });
            resolve(false);
            return;
          }
        }
        
        resolve(true);
      });
    },
    getStatusText(status) {
      const statusMap = {
        1: '报名中',
        2: '报名结束',
        3: '活动进行中',
        4: '活动结束',
        5: '取消'
      }
      return statusMap[status] || '未知状态'
    },
    getStatusTagType(status) {
      const typeMap = {
        1: 'primary',
        2: 'warning',
        3: 'success',
        4: 'info',
        5: 'danger'
      }
      return typeMap[status] || 'info'
    }
  }
}
</script>

<style scoped>
.filter-container {
  margin-bottom: 20px;
}
.line {
  text-align: center;
}
.date-range {
  display: flex;
  align-items: center;
  width: 100%;
}

.app-container {
  padding-top: 20px;
}

/* 操作列样式优化 */
.el-table__fixed-right {
  height: 100% !important;
}

.el-table__fixed-right-patch {
  background-color: #fff;
}

.fixed-width .el-button {
  margin: 2px;
}
</style>