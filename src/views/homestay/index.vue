<template>
  <div class="app-container">
    <!-- 搜索区域 -->
    <div class="filter-container">
      <el-form :inline="true" :model="queryParams" class="demo-form-inline">
        <el-form-item label="所属乡村">
          <el-select
            v-model="queryParams.villageId"
            placeholder="请选择乡村"
            clearable
            style="width: 200px"
            :loading="villageLoading"
          >
            <el-option
              v-for="village in villageList"
              :key="village.id"
              :label="village.villageName"
              :value="village.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="民宿名称">
          <el-input
            v-model="queryParams.homestayName"
            placeholder="请输入民宿名称"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery">搜索</el-button>
          <el-button @click="resetQuery">重置</el-button>
          <el-button type="success" @click="handleAdd">新增</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 表格 -->
    <el-table
      v-loading="loading"
      :data="homestayList"
      border
      style="width: 100%"
    >
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="homestayName" label="民宿名称" width="150" />
      <el-table-column prop="address" label="地址" show-overflow-tooltip />
      <el-table-column label="营业状态" width="100">
        <template slot-scope="scope">
          <el-tag :type="getStatusType(scope.row.status)">
            {{ getStatusText(scope.row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="roomCount" label="客房数" width="80" />
      <el-table-column prop="contactName" label="负责人" width="100" />
      <el-table-column prop="price" label="房价(元/月)" width="120">
        <template slot-scope="scope">
          <span style="color: #f56c6c; font-weight: bold;">
            ¥{{ scope.row.price }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200" fixed="right">
        <template slot-scope="scope">
          <el-button size="mini" @click="handleEdit(scope.row)">编辑</el-button>
          <el-button size="mini" type="danger" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination-container">
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryParams.page"
        :page-sizes="[10, 20, 50, 100]"
        :page-size="queryParams.pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      />
    </div>

    <!-- 新增/编辑对话框 -->
    <el-dialog
      :title="dialogTitle"
      :visible.sync="dialogVisible"
      width="600px"
      @close="resetForm"
    >
      <el-form
        ref="homestayForm"
        :model="homestayForm"
        :rules="homestayRules"
        label-width="120px"
      >
        <el-form-item label="所属乡村" prop="villageId">
          <el-select v-model="homestayForm.villageId" placeholder="请选择乡村" style="width: 100%">
            <el-option
              v-for="village in villageList"
              :key="village.id"
              :label="village.villageName"
              :value="village.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="民宿名称" prop="homestayName">
          <el-input v-model="homestayForm.homestayName" placeholder="请输入民宿名称" />
        </el-form-item>
        <el-form-item label="地址" prop="address">
          <el-input v-model="homestayForm.address" placeholder="请输入地址" />
        </el-form-item>
        <el-form-item label="营业状态" prop="status">
          <el-select v-model="homestayForm.status" placeholder="请选择状态" style="width: 100%">
            <el-option label="营业" :value="1" />
            <el-option label="暂停营业" :value="2" />
            <el-option label="已下架" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item label="客房数量" prop="roomCount">
          <el-input-number v-model="homestayForm.roomCount" :min="0" style="width: 100%" />
        </el-form-item>
        <el-form-item label="负责人姓名" prop="contactName">
          <el-input v-model="homestayForm.contactName" placeholder="请输入负责人姓名" />
        </el-form-item>
        <el-form-item label="负责人电话" prop="contactPhone">
          <el-input v-model="homestayForm.contactPhone" placeholder="请输入负责人电话" />
        </el-form-item>
        <el-form-item label="房价(元/月)" prop="price">
          <el-input-number v-model="homestayForm.price" :min="0" :precision="2" style="width: 100%" />
        </el-form-item>
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getHomestayList, addHomestay, updateHomestay, deleteHomestay } from '@/api/homestay'
import { getVillageList } from '@/api/village'

export default {
  name: 'VillageHomestayList',
  data() {
    return {
      loading: false,
      villageLoading: false,
      homestayList: [],
      villageList: [],
      total: 0,
      queryParams: {
        page: 1,
        pageSize: 10,
        villageId: null,
        homestayName: ''
      },
      dialogVisible: false,
      dialogTitle: '',
      homestayForm: {
        id: null,
        villageId: null,
        homestayName: '',
        address: '',
        status: 1,
        roomCount: 0,
        contactName: '',
        contactPhone: '',
        price: 0
      },
      homestayRules: {
        villageId: [{ required: true, message: '请选择所属乡村', trigger: 'change' }],
        homestayName: [{ required: true, message: '请输入民宿名称', trigger: 'blur' }],
        address: [{ required: true, message: '请输入地址', trigger: 'blur' }],
        status: [{ required: true, message: '请选择营业状态', trigger: 'change' }],
        roomCount: [{ required: true, message: '请输入客房数量', trigger: 'blur' }],
        contactName: [{ required: true, message: '请输入负责人姓名', trigger: 'blur' }],
        contactPhone: [{ required: true, message: '请输入负责人电话', trigger: 'blur' }]
      }
    }
  },
  created() {
    this.getVillageList()
    this.getList()
  },
  methods: {
    getVillageList() {
      this.villageLoading = true
      getVillageList().then(response => {
        if (Array.isArray(response)) {
          this.villageList = response
        } else if (response && response.code === 1) {
          this.villageList = response.data || []
        } else {
          this.$message.error('获取乡村列表失败')
        }
        this.villageLoading = false
      }).catch(error => {
        this.villageLoading = false
        this.$message.error('获取乡村列表失败')
      })
    },

    getList() {
      this.loading = true
      getHomestayList(this.queryParams).then(response => {
        if (Array.isArray(response)) {
          this.homestayList = response
          this.total = response.length
        } else if (response && response.code === 1) {
          this.homestayList = response.data.records || []
          this.total = response.data.total
        } else {
          this.$message.error('获取数据失败')
        }
        this.loading = false
      }).catch(error => {
        this.loading = false
        this.$message.error('网络连接失败')
      })
    },

    handleQuery() {
      this.queryParams.page = 1
      this.getList()
    },

    resetQuery() {
      this.queryParams = {
        page: 1,
        pageSize: 10,
        villageId: null,
        homestayName: ''
      }
      this.getList()
    },

    handleSizeChange(val) {
      this.queryParams.pageSize = val
      this.queryParams.page = 1
      this.getList()
    },

    handleCurrentChange(val) {
      this.queryParams.page = val
      this.getList()
    },

    handleAdd() {
      this.dialogTitle = '新增民宿'
      this.dialogVisible = true
      this.resetForm()
    },

    handleEdit(row) {
      this.dialogTitle = '编辑民宿'
      this.dialogVisible = true
      this.homestayForm = { ...row }
    },

    handleDelete(row) {
      this.$confirm('确定要删除该民宿吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteHomestay(row.id).then(response => {
          if (Array.isArray(response) || (response && response.code === 1)) {
            this.$message.success('删除成功')
            this.getList()
          } else {
            this.$message.error('删除失败')
          }
        }).catch(() => {
          this.$message.error('删除失败')
        })
      })
    },

    submitForm() {
      this.$refs.homestayForm.validate((valid) => {
        if (valid) {
          const api = this.homestayForm.id ? updateHomestay : addHomestay
          api(this.homestayForm).then(response => {
            if (Array.isArray(response) || (response && response.code === 1)) {
              this.$message.success(this.homestayForm.id ? '更新成功' : '新增成功')
              this.dialogVisible = false
              this.getList()
            } else {
              this.$message.error('操作失败')
            }
          }).catch(() => {
            this.$message.error('操作失败')
          })
        }
      })
    },

    resetForm() {
      this.homestayForm = {
        id: null,
        villageId: null,
        homestayName: '',
        address: '',
        status: 1,
        roomCount: 0,
        contactName: '',
        contactPhone: '',
        price: 0
      }
      this.$nextTick(() => {
        if (this.$refs.homestayForm) {
          this.$refs.homestayForm.clearValidate()
        }
      })
    },

    getStatusType(status) {
      const statusMap = {
        1: 'success',
        2: 'warning',
        3: 'danger'
      }
      return statusMap[status] || 'info'
    },

    getStatusText(status) {
      const statusMap = {
        1: '营业',
        2: '暂停营业',
        3: '已下架'
      }
      return statusMap[status] || '未知'
    }
  }
}
</script>

<style scoped>
.filter-container {
  margin-bottom: 20px;
}

.pagination-container {
  margin-top: 20px;
  text-align: right;
}

.dialog-footer {
  text-align: right;
}
</style>
