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
        <el-form-item label="地址">
          <el-input
            v-model="queryParams.address"
            placeholder="请输入地址"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="营业状态">
          <el-select
            v-model="queryParams.status"
            placeholder="请选择状态"
            clearable
            style="width: 150px"
          >
            <el-option label="营业" :value="1" />
            <el-option label="暂停营业" :value="2" />
            <el-option label="已下架" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item label="星级">
          <el-select
            v-model="queryParams.starLevel"
            placeholder="请选择星级"
            clearable
            style="width: 120px"
          >
            <el-option label="未评" :value="0" />
            <el-option label="1星" :value="1" />
            <el-option label="2星" :value="2" />
            <el-option label="3星" :value="3" />
            <el-option label="4星" :value="4" />
            <el-option label="5星" :value="5" />
          </el-select>
        </el-form-item>
        <el-form-item label="负责人">
          <el-input
            v-model="queryParams.contactName"
            placeholder="请输入负责人姓名"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery">
            <i class="el-icon-search"></i> 搜索
          </el-button>
          <el-button @click="resetQuery">
            <i class="el-icon-refresh"></i> 重置
          </el-button>
          <el-button type="success" @click="handleAdd">
            <i class="el-icon-plus"></i> 新增
          </el-button>
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
      <el-table-column label="星级" width="120">
        <template slot-scope="scope">
          <el-rate
            v-model="scope.row.starLevel"
            disabled
            show-score
            text-color="#ff9900"
          />
        </template>
      </el-table-column>
      <el-table-column prop="roomCount" label="客房数" width="80" />
      <el-table-column prop="bedCount" label="床位数" width="80" />
      <el-table-column prop="maxCapacity" label="最大接待" width="100" />
      <el-table-column prop="contactName" label="负责人" width="100" />
      <el-table-column prop="contactPhone" label="联系电话" width="120" />
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
      width="800px"
      @close="resetForm"
    >
      <el-form
        ref="homestayForm"
        :model="homestayForm"
        :rules="homestayRules"
        label-width="120px"
      >
        <el-row :gutter="20">
          <el-col :span="12">
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
          </el-col>
          <el-col :span="12">
            <el-form-item label="民宿名称" prop="homestayName">
              <el-input v-model="homestayForm.homestayName" placeholder="请输入民宿名称" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="地址" prop="address">
          <el-input v-model="homestayForm.address" placeholder="请输入地址" />
        </el-form-item>

        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="营业状态" prop="status">
              <el-select v-model="homestayForm.status" placeholder="请选择状态" style="width: 100%">
                <el-option label="营业" :value="1" />
                <el-option label="暂停营业" :value="2" />
                <el-option label="已下架" :value="3" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="星级" prop="starLevel">
              <el-select v-model="homestayForm.starLevel" placeholder="请选择星级" style="width: 100%">
                <el-option label="未评" :value="0" />
                <el-option label="1星" :value="1" />
                <el-option label="2星" :value="2" />
                <el-option label="3星" :value="3" />
                <el-option label="4星" :value="4" />
                <el-option label="5星" :value="5" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="房价(元/月)" prop="price">
              <el-input-number v-model="homestayForm.price" :min="0" :precision="2" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="客房数量" prop="roomCount">
              <el-input-number v-model="homestayForm.roomCount" :min="0" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="床位总数" prop="bedCount">
              <el-input-number v-model="homestayForm.bedCount" :min="0" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="最大接待人数" prop="maxCapacity">
              <el-input-number v-model="homestayForm.maxCapacity" :min="0" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="负责人姓名" prop="contactName">
              <el-input v-model="homestayForm.contactName" placeholder="请输入负责人姓名" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="负责人电话" prop="contactPhone">
              <el-input v-model="homestayForm.contactPhone" placeholder="请输入负责人电话" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="民宿简介">
          <el-input
            v-model="homestayForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入民宿简介、特色亮点"
          />
        </el-form-item>

        <el-form-item label="封面图URL">
          <el-input v-model="homestayForm.coverImage" placeholder="请输入封面图URL" />
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
        homestayName: '',
        address: '',
        status: null,
        starLevel: null,
        contactName: ''
      },
      dialogVisible: false,
      dialogTitle: '',
      homestayForm: {
        id: null,
        villageId: null,
        homestayName: '',
        address: '',
        status: 1,
        starLevel: 0,
        roomCount: 0,
        bedCount: 0,
        maxCapacity: 0,
        contactName: '',
        contactPhone: '',
        description: '',
        price: 0,
        coverImage: ''
      },
      homestayRules: {
        villageId: [{ required: true, message: '请选择所属乡村', trigger: 'change' }],
        homestayName: [{ required: true, message: '请输入民宿名称', trigger: 'blur' }],
        address: [{ required: true, message: '请输入地址', trigger: 'blur' }],
        status: [{ required: true, message: '请选择营业状态', trigger: 'change' }],
        roomCount: [{ required: true, message: '请输入客房数量', trigger: 'blur' }],
        bedCount: [{ required: true, message: '请输入床位总数', trigger: 'blur' }],
        maxCapacity: [{ required: true, message: '请输入最大接待人数', trigger: 'blur' }],
        contactName: [{ required: true, message: '请输入负责人姓名', trigger: 'blur' }],
        contactPhone: [{ required: true, message: '请输入负责人电话', trigger: 'blur' }]
      }
    }
  },
  created() {
    console.log('=== 组件创建，开始获取数据 ===')
    this.getVillageList()
    this.getList()
  },
  methods: {
    // 获取乡村列表
    getVillageList() {
      console.log('=== 开始获取乡村列表 ===')
      this.villageLoading = true

      getVillageList().then(response => {
        console.log('=== 乡村列表API响应 ===')
        console.log('完整响应：', response)
        console.log('响应类型：', typeof response)
        console.log('是否为数组：', Array.isArray(response))

        // 直接处理数组响应
        if (Array.isArray(response)) {
          this.villageList = response
          console.log('=== 乡村数据设置成功 ===')
          console.log('乡村列表：', this.villageList)
          console.log('乡村列表长度：', this.villageList.length)
        } else if (response && response.code === 1) {
          // 如果是标准格式
          this.villageList = response.data || []
          console.log('=== 乡村数据设置成功（标准格式）===')
          console.log('乡村列表：', this.villageList)
        } else {
          console.error('乡村API返回格式异常：', response)
          this.$message.error('获取乡村列表失败：数据格式异常')
        }
        this.villageLoading = false
      }).catch(error => {
        console.error('=== 乡村API请求失败 ===')
        console.error('错误信息：', error)
        this.villageLoading = false
        this.$message.error('获取乡村列表失败，请检查网络连接')
      })
    },

    // 获取民宿列表
    getList() {
      console.log('=== 开始获取民宿列表 ===')
      console.log('查询参数：', this.queryParams)
      this.loading = true

      getHomestayList(this.queryParams).then(response => {
        console.log('=== 民宿列表API响应 ===')
        console.log('完整响应：', response)
        console.log('响应码：', response.code)
        console.log('响应消息：', response.msg)
        console.log('响应数据：', response.data)

        if (Array.isArray(response)) {
          this.homestayList = response
          this.total = response.length
          console.log('=== 民宿数据设置成功（数组格式）===')
          console.log('民宿列表：', this.homestayList)
          console.log('总数：', this.total)
        } else if (response.code === 1) {
          this.homestayList = response.data.records || []
          this.total = response.data.total
          console.log('=== 民宿数据设置成功（标准格式）===')
          console.log('民宿列表：', this.homestayList)
          console.log('总数：', this.total)
        } else {
          console.error('API返回错误：', response.msg)
          this.$message.error(response.msg || '获取数据失败')
        }
        this.loading = false
      }).catch(error => {
        console.error('=== API请求失败 ===')
        console.error('错误信息：', error)
        this.loading = false
        this.$message.error('网络连接失败, 请检查网络连接')
      })
    },

    // 搜索
    handleQuery() {
      this.queryParams.page = 1
      this.getList()
    },

    // 重置搜索
    resetQuery() {
      this.queryParams = {
        page: 1,
        pageSize: 10,
        villageId: null,
        homestayName: '',
        address: '',
        status: null,
        starLevel: null,
        contactName: ''
      }
      this.getList()
    },

    // 分页大小改变
    handleSizeChange(val) {
      this.queryParams.pageSize = val
      this.queryParams.page = 1
      this.getList()
    },

    // 当前页改变
    handleCurrentChange(val) {
      this.queryParams.page = val
      this.getList()
    },

    // 新增
    handleAdd() {
      this.dialogTitle = '新增民宿'
      this.dialogVisible = true
      this.resetForm()
    },

    // 编辑
    handleEdit(row) {
      this.dialogTitle = '编辑民宿'
      this.dialogVisible = true
      this.homestayForm = { ...row }
    },

    // 删除
    handleDelete(row) {
      this.$confirm('确定要删除该民宿吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteHomestay(row.id).then(response => {
          console.log('删除响应：', response)
          // 删除API的响应处理也需要检查格式
          if (Array.isArray(response) || (response && response.code === 1)) {
            this.$message.success('删除成功')
            this.getList()
          } else {
            this.$message.error(response.msg || '删除失败')
          }
        }).catch(() => {
          this.$message.error('删除失败')
        })
      })
    },

    // 提交表单
    submitForm() {
      this.$refs.homestayForm.validate((valid) => {
        if (valid) {
          const api = this.homestayForm.id ? updateHomestay : addHomestay
          api(this.homestayForm).then(response => {
            console.log('提交响应：', response)
            // 新增/编辑API的响应处理也需要检查格式
            if (Array.isArray(response) || (response && response.code === 1)) {
              this.$message.success(this.homestayForm.id ? '更新成功' : '新增成功')
              this.dialogVisible = false
              this.getList()
            } else {
              this.$message.error(response.msg || '操作失败')
            }
          }).catch(() => {
            this.$message.error('操作失败')
          })
        }
      })
    },

    // 重置表单
    resetForm() {
      this.homestayForm = {
        id: null,
        villageId: null,
        homestayName: '',
        address: '',
        status: 1,
        starLevel: 0,
        roomCount: 0,
        bedCount: 0,
        maxCapacity: 0,
        contactName: '',
        contactPhone: '',
        description: '',
        price: 0,
        coverImage: ''
      }
      this.$nextTick(() => {
        if (this.$refs.homestayForm) {
          this.$refs.homestayForm.clearValidate()
        }
      })
    },

    // 获取状态类型
    getStatusType(status) {
      const statusMap = {
        1: 'success',
        2: 'warning',
        3: 'danger'
      }
      return statusMap[status] || 'info'
    },

    // 获取状态文本
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
