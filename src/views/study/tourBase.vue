<template>
  <div class="app-container">
    <!-- 搜索区域 -->
    <div class="filter-container">
      <el-form :inline="true" :model="listQuery" class="demo-form-inline">
        <el-form-item label="基地名称">
          <el-input
            v-model="listQuery.baseName"
            placeholder="请输入基地名称"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="运行单位">
          <el-input
            v-model="listQuery.operationUnit"
            placeholder="请输入运行单位"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="营业状态">
          <el-select v-model="listQuery.businessStatus" placeholder="全部" clearable style="width: 200px">
            <el-option
              v-for="item in businessStatusOptions"
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
            <i class="el-icon-plus"></i> 新增基地
          </el-button>
        </el-form-item>
      </el-form>
    </div>
    
    <!-- 数据列表标题 -->
    <div class="title-container">
      <i class="el-icon-tickets" style="color: #409EFF;"></i>
      <span class="title-text">研学基地列表</span>
    </div>
    
    <!-- 数据表格 -->
    <div class="table-container">
      <el-table
        ref="tourBaseTable"
        :data="list"
        style="width: 100%;"
        v-loading="listLoading"
        border
        stripe
      >
        <el-table-column prop="id" label="编号" width="80" align="center"></el-table-column>
        <el-table-column prop="baseName" label="基地名称" min-width="150" align="center"></el-table-column>
        <el-table-column prop="operationUnit" label="运行单位" min-width="150" align="center"></el-table-column>
        <el-table-column prop="address" label="基地地址" min-width="200" align="center"></el-table-column>
        <el-table-column prop="businessStatus" label="营业状态" width="100" align="center">
          <template slot-scope="scope">
            <el-tag :type="scope.row.businessStatus === 1 ? 'success' : scope.row.businessStatus === 2 ? 'warning' : 'danger'">
              {{ getBusinessStatusText(scope.row.businessStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="contactPerson" label="联系人" width="100" align="center"></el-table-column>
        <el-table-column prop="contactPhone" label="联系电话" width="120" align="center"></el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" align="center">
          <template slot-scope="scope">{{ scope.row.createTime | formatDateTime }}</template>
        </el-table-column>
        <el-table-column label="操作" width="200" align="center" fixed="right">
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
      :title="isEdit?'编辑研学基地':'添加研学基地'"
      :visible.sync="dialogVisible"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form
        :model="tourBase"
        :rules="rules"
        ref="tourBaseForm"
        label-width="120px"
        size="small"
      >
        <el-form-item label="基地名称" prop="baseName">
          <el-input v-model="tourBase.baseName" style="width: 350px"/>
        </el-form-item>
        <el-form-item label="运行单位" prop="operationUnit">
          <el-input v-model="tourBase.operationUnit" style="width: 350px"/>
        </el-form-item>
        <el-form-item label="基地地址" prop="address">
          <el-input v-model="tourBase.address" style="width: 350px"/>
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="地址纬度" prop="latitude">
              <el-input-number v-model="tourBase.latitude" :precision="6" :step="0.000001" style="width: 100%"/>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="地址经度" prop="longitude">
              <el-input-number v-model="tourBase.longitude" :precision="6" :step="0.000001" style="width: 100%"/>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="法定代表人" prop="legalRepresentative">
          <el-input v-model="tourBase.legalRepresentative" style="width: 350px"/>
        </el-form-item>
        <el-form-item label="统一社会信用代码" prop="unifiedSocialCreditCode">
          <el-input v-model="tourBase.unifiedSocialCreditCode" style="width: 350px"/>
        </el-form-item>
        <el-form-item label="资质证明" prop="qualificationCert">
          <el-input 
            type="textarea" 
            v-model="tourBase.qualificationCert" 
            :rows="3" 
            placeholder="请输入资质证明URL，多个URL用逗号分隔"
            style="width: 350px"
          />
        </el-form-item>
        <el-form-item label="基地特色说明" prop="featureDesc">
          <el-input 
            type="textarea" 
            v-model="tourBase.featureDesc" 
            :rows="3" 
            placeholder="请输入基地特色说明"
            style="width: 350px"
          />
        </el-form-item>
        <el-form-item label="营业状态" prop="businessStatus">
          <el-radio-group v-model="tourBase.businessStatus">
            <el-radio :label="1">营业中</el-radio>
            <el-radio :label="2">暂停营业</el-radio>
            <el-radio :label="3">已注销</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="联系人" prop="contactPerson">
          <el-input v-model="tourBase.contactPerson" style="width: 350px"/>
        </el-form-item>
        <el-form-item label="联系电话" prop="contactPhone">
          <el-input v-model="tourBase.contactPhone" style="width: 350px"/>
        </el-form-item>
        <el-form-item label="研学类型" prop="selectedTypeIds">
          <el-select 
            v-model="tourBase.selectedTypeIds" 
            multiple 
            placeholder="请选择研学类型" 
            style="width: 350px"
          >
            <el-option
              v-for="item in tourTypeOptions"
              :key="item.id"
              :label="item.typeName"
              :value="item.id">
            </el-option>
          </el-select>
          <div class="type-info">可多选研学类型</div>
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
  createTourBase, 
  updateTourBase, 
  deleteTourBase,
  fetchTourTypes,
  getAssociatedTypes,
  saveBaseTypes
} from '@/api/study/tourBase'

const defaultListQuery = {
  pageNum: 1,
  pageSize: 10,
  baseName: null,
  operationUnit: null,
  businessStatus: null
}

const defaultTourBase = {
  id: null,
  baseName: null,
  operationUnit: null,
  address: null,
  latitude: null,
  longitude: null,
  legalRepresentative: null,
  unifiedSocialCreditCode: null,
  qualificationCert: null,
  featureDesc: null,
  businessStatus: 1,
  contactPerson: null,
  contactPhone: null,
  selectedTypeIds: []
}

export default {
  name: 'TourBase',
  data() {
    return {
      listQuery: Object.assign({}, defaultListQuery),
      list: null,
      total: 0,
      listLoading: false,
      dialogVisible: false,
      isEdit: false,
      tourBase: Object.assign({}, defaultTourBase),
      tourTypeOptions: [],
      businessStatusOptions: [
        {
          label: '全部',
          value: null
        },
        {
          label: '营业中',
          value: 1
        },
        {
          label: '暂停营业',
          value: 2
        },
        {
          label: '已注销',
          value: 3
        }
      ],
      rules: {
        baseName: [
          { required: true, message: '请输入基地名称', trigger: 'blur' },
          { min: 2, max: 200, message: '长度在 2 到 200 个字符', trigger: 'blur' }
        ],
        operationUnit: [
          { required: true, message: '请输入运行单位', trigger: 'blur' },
          { min: 2, max: 200, message: '长度在 2 到 200 个字符', trigger: 'blur' }
        ],
        address: [
          { required: true, message: '请输入基地地址', trigger: 'blur' },
          { min: 5, max: 500, message: '长度在 5 到 500 个字符', trigger: 'blur' }
        ],
        contactPerson: [
          { required: true, message: '请输入联系人', trigger: 'blur' },
          { min: 2, max: 100, message: '长度在 2 到 100 个字符', trigger: 'blur' }
        ],
        contactPhone: [
          { required: true, message: '请输入联系电话', trigger: 'blur' },
          { pattern: /^1[3-9]\d{9}$|^0\d{2,3}-?\d{7,8}$/, message: '请输入正确的电话号码', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.getList()
    this.loadTourTypes()
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
      this.tourBase = Object.assign({}, defaultTourBase)
    },
    handleDelete(index, row) {
      this.$confirm('是否要删除该研学基地？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteTourBase(row.id).then(response => {
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
      // 先获取基地信息
      getAssociatedTypes(row.id).then(response => {
        const baseInfo = Object.assign({}, row)
        baseInfo.selectedTypeIds = response.data.map(item => item.id)
        this.tourBase = baseInfo
      })
    },

    handleDialogConfirm() {
      this.$refs['tourBaseForm'].validate((valid) => {
        if (valid) {
          const tourBase = Object.assign({}, this.tourBase)
          // 移除selectedTypeIds属性，因为它不是数据库字段
          const selectedTypeIds = tourBase.selectedTypeIds || []
          delete tourBase.selectedTypeIds
          
          if (this.isEdit) {
            updateTourBase(tourBase).then(response => {
              // 保存类型关联关系
              if (selectedTypeIds.length > 0) {
                saveBaseTypes(tourBase.id, selectedTypeIds).then(() => {
                  this.$message({
                    message: '修改成功！',
                    type: 'success'
                  })
                  this.dialogVisible = false
                  this.getList()
                })
              } else {
                this.$message({
                  message: '修改成功！',
                  type: 'success'
                })
                this.dialogVisible = false
                this.getList()
              }
            })
          } else {
            createTourBase(tourBase).then(response => {
              const baseId = response.data
              // 保存类型关联关系
              if (selectedTypeIds.length > 0 && baseId) {
                saveBaseTypes(baseId, selectedTypeIds).then(() => {
                  this.$message({
                    message: '添加成功！',
                    type: 'success'
                  })
                  this.dialogVisible = false
                  this.getList()
                })
              } else {
                this.$message({
                  message: '添加成功！',
                  type: 'success'
                })
                this.dialogVisible = false
                this.getList()
              }
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
    loadTourTypes() {
      fetchTourTypes().then(response => {
        this.tourTypeOptions = response.data
      })
    },
    getBusinessStatusText(status) {
      switch (status) {
        case 1: return '营业中'
        case 2: return '暂停营业'
        case 3: return '已注销'
        default: return '未知状态'
      }
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

.title-container {
  display: flex;
  align-items: center;
  background-color: #f5f7fa;
  padding: 15px 20px;
  border-radius: 4px;
  margin-bottom: 20px;
}

.title-text {
  font-size: 18px;
  font-weight: bold;
  margin-left: 10px;
}

.table-container {
  margin-bottom: 15px;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.type-info {
  font-size: 12px;
  color: #999;
  margin-top: 5px;
}
</style>