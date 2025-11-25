<template>
  <div class="restaurant-page">
    <!-- 筛选 -->
    <el-card shadow="hover" class="filter-card">
      <el-form :inline="true" :model="filters">
        <el-form-item label="门店名称">
          <el-input v-model="filters.name" placeholder="输入门店名称" clearable />
        </el-form-item>

        <el-form-item label="经营状态">
          <el-radio-group v-model="filters.status">
            <el-radio-button :label="1">营业</el-radio-button>
            <el-radio-button :label="0">停业</el-radio-button>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="所属村">
          <el-select v-model="filters.villageId" placeholder="选择所属村" clearable>
            <el-option
              v-for="item in villageOptions"
              :key="item.id"
              :label="item.villageName || item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>

        <el-form-item>
          <el-button type="success" @click="openDialog()">新增</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 列表 -->
    <el-card>
      <el-table :data="tableData" border stripe>
        <el-table-column type="index" label="序号" width="60" />
        <el-table-column prop="id" label="门店ID" width="120" />
        <el-table-column prop="name" label="门店名称" min-width="200" show-overflow-tooltip />
        <el-table-column label="经营状态" width="120">
          <template slot-scope="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'">
              {{ row.status === 1 ? '营业' : '停业' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="villageName" label="所属村" width="180" />
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column prop="updateTime" label="更新时间" width="180" />
        <el-table-column label="操作" width="160" fixed="right">
          <template slot-scope="{ row }">
            <el-button type="primary" size="small" @click="openDialog(row)">编辑</el-button>
            <el-button type="danger" size="small" @click="handleDelete(row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination">
        <el-pagination
          :current-page.sync="pagination.pageNum"
          :page-size.sync="pagination.pageSize"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @current-change="loadData"
          @size-change="loadData"
        />
      </div>
    </el-card>

    <!-- 新增/编辑弹窗 -->
    <el-dialog
      :title="dialogTitle"
      :visible.sync="dialogVisible"
      width="720px"
      :close-on-click-modal="false"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="门店名称" prop="name">
          <el-input v-model="form.name" maxlength="100" show-word-limit />
        </el-form-item>

        <el-form-item label="关联用户" prop="userId">
          <el-select v-model="form.userId" filterable placeholder="选择用户">
            <el-option
              v-for="item in userOptions"
              :key="item.id"
              :label="item.username"
              :value="item.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="所属村" prop="villageId">
          <el-select v-model="form.villageId" filterable placeholder="选择所属村">
            <el-option
              v-for="item in villageOptions"
              :key="item.id"
              :label="item.villageName || item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="经营状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio :label="1">营业</el-radio>
            <el-radio :label="0">停业</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="营业时间" required>
          <el-time-picker
            v-model="form.businessStartTime"
            format="HH:mm"
            value-format="HH:mm"
            placeholder="开始时间"
          />
          <span class="time-sep">至</span>
          <el-time-picker
            v-model="form.businessEndTime"
            format="HH:mm"
            value-format="HH:mm"
            placeholder="结束时间"
          />
        </el-form-item>

        <el-form-item label="门店Logo">
          <el-upload
            class="logo-uploader"
            action="/admin/upload"
            list-type="picture-card"
            :limit="1"
            :file-list="logoList"
            :on-success="handleLogoSuccess"
            :on-remove="handleLogoRemove"
          >
            <i class="el-icon-plus" />
          </el-upload>
        </el-form-item>

        <el-form-item label="门店地址" prop="address">
          <el-input v-model="form.address" maxlength="200" show-word-limit />
        </el-form-item>

        <el-form-item label="门店坐标" required>
          <div class="coord-inputs">
            <el-input-number v-model="form.coordinateLat" placeholder="纬度" :precision="6" :step="0.000001" />
            <el-input-number v-model="form.coordinateLng" placeholder="经度" :precision="6" :step="0.000001" />
          </div>
        </el-form-item>

        <el-form-item label="联系电话" prop="phone">
          <el-input v-model="form.phone" maxlength="20" show-word-limit />
        </el-form-item>

        <el-form-item label="门店公告" prop="notice">
          <el-input
            type="textarea"
            v-model="form.notice"
            maxlength="500"
            show-word-limit
            :rows="3"
          />
        </el-form-item>

        <el-form-item label="营业执照">
          <el-upload
            action="/admin/upload"
            list-type="picture-card"
            :limit="15"
            :file-list="businessList"
            :on-success="(res, file, list) => handleLicenseSuccess('business', res, list)"
            :on-remove="(file, list) => handleLicenseRemove('business', list)"
          >
            <i class="el-icon-plus" />
          </el-upload>
        </el-form-item>

        <el-form-item label="食品许可证">
          <el-upload
            action="/admin/upload"
            list-type="picture-card"
            :limit="15"
            :file-list="foodList"
            :on-success="(res, file, list) => handleLicenseSuccess('food', res, list)"
            :on-remove="(file, list) => handleLicenseRemove('food', list)"
          >
            <i class="el-icon-plus" />
          </el-upload>
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">保存</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import {
  listRestaurant,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
  getRestaurant
} from '@/api/restaurant'
import { getVillageList } from '@/api/village'
import { listUserOptions } from '@/api/user'

export default {
  name: 'RestaurantBusiness',
  data () {
    return {
      filters: { name: '', status: null, villageId: null },
      pagination: { pageNum: 1, pageSize: 10, total: 0 },
      tableData: [],
      villageOptions: [],
      userOptions: [],
      dialogVisible: false,
      dialogTitle: '新增门店',
      form: this.initForm(),
      logoList: [],
      businessList: [],
      foodList: [],
      rules: {
        name: [
          { required: true, message: '请输入门店名称', trigger: 'blur' },
          { max: 100, message: '不超过100字符', trigger: 'blur' }
        ],
        userId: [{ required: true, message: '请选择关联用户', trigger: 'change' }],
        villageId: [{ required: true, message: '请选择所属村', trigger: 'change' }],
        status: [{ required: true, message: '请选择状态', trigger: 'change' }],
        businessStartTime: [{ required: true, message: '请选择开始时间', trigger: 'change' }],
        businessEndTime: [{ required: true, message: '请选择结束时间', trigger: 'change' }],
        address: [
          { required: true, message: '请输入门店地址', trigger: 'blur' },
          { max: 200, message: '不超过200字符', trigger: 'blur' }
        ],
        phone: [{ max: 20, message: '不超过20字符', trigger: 'blur' }],
        notice: [{ max: 500, message: '不超过500字符', trigger: 'blur' }]
      }
    }
  },
  created () {
    this.loadOptions()
    this.loadData()
  },
  methods: {
    initForm () {
      return {
        id: null,
        name: '',
        userId: null,
        villageId: null,
        status: 1,
        businessStartTime: '',
        businessEndTime: '',
        logoUrl: '',
        address: '',
        coordinateLat: null,
        coordinateLng: null,
        phone: '',
        notice: '',
        licenseUrls: ''
      }
    },
    async loadOptions () {
      const [users, villages] = await Promise.all([
        listUserOptions(),
        getVillageList()
      ])
      this.userOptions = users.data || []
      this.villageOptions = villages.data || []
    },
    async loadData () {
      const params = {
        ...this.filters,
        pageNum: this.pagination.pageNum,
        pageSize: this.pagination.pageSize
      }
      const res = await listRestaurant(params)
      const data = res.data || {}
      this.tableData = data.records || []
      this.pagination.total = data.total || 0
    },
    handleSearch () {
      this.pagination.pageNum = 1
      this.loadData()
    },
    handleReset () {
      this.filters = { name: '', status: null, villageId: null }
      this.handleSearch()
    },
    openDialog (row) {
      this.dialogVisible = true
      if (row) {
        this.dialogTitle = '编辑门店'
        this.loadDetail(row.id)
      } else {
        this.dialogTitle = '新增门店'
        this.form = this.initForm()
        this.logoList = []
        this.businessList = []
        this.foodList = []
      }
    },
    async loadDetail (id) {
      const { data } = await getRestaurant(id)
      this.form = { ...this.initForm(), ...data }
      if (this.form.logoUrl) {
        this.logoList = [{ name: 'logo', url: this.form.logoUrl }]
      }
      const licenses = JSON.parse(this.form.licenseUrls || '[]')
      this.businessList = licenses
        .filter(item => item.type === 'business')
        .map(item => ({ name: item.url.split('/').pop(), url: item.url }))
      this.foodList = licenses
        .filter(item => item.type === 'food')
        .map(item => ({ name: item.url.split('/').pop(), url: item.url }))
    },
    handleLogoSuccess (response, file, fileList) {
      const url = fileList[0].url || response.url
      this.form.logoUrl = url
      this.logoList = [{ name: file.name, url }]
    },
    handleLogoRemove () {
      this.form.logoUrl = ''
      this.logoList = []
    },
    handleLicenseSuccess (type, response, fileList) {
      const list = fileList.map(f => ({
        type,
        url: f.url || response.url,
        name: f.name
      }))
      if (type === 'business') {
        this.businessList = list
      } else {
        this.foodList = list
      }
    },
    handleLicenseRemove (type, fileList) {
      const list = fileList.map(f => ({ type, url: f.url, name: f.name }))
      if (type === 'business') {
        this.businessList = list
      } else {
        this.foodList = list
      }
    },
    collectLicense () {
      const merged = [
        ...this.businessList.map(item => ({ type: 'business', url: item.url })),
        ...this.foodList.map(item => ({ type: 'food', url: item.url }))
      ]
      this.form.licenseUrls = JSON.stringify(merged)
    },
    handleSubmit () {
      this.$refs.formRef.validate(async valid => {
        if (!valid) return
        this.collectLicense()
        if (this.form.id) {
          await updateRestaurant(this.form)
          this.$message.success('更新成功')
        } else {
          await createRestaurant(this.form)
          this.$message.success('新增成功')
        }
        this.dialogVisible = false
        this.loadData()
      })
    },
    handleDelete (id) {
      this.$confirm('删除后，门店信息不可恢复，确认是否删除？', '提示', {
        type: 'warning'
      })
        .then(async () => {
          await deleteRestaurant(id)
          this.$message.success('删除成功')
          this.loadData()
        })
        .catch(() => {})
    }
  }
}
</script>

<style scoped>
.restaurant-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.filter-card {
  margin-bottom: -8px;
}
.pagination {
  margin-top: 16px;
  text-align: right;
}
.coord-inputs {
  display: flex;
  gap: 12px;
  width: 100%;
}
.time-sep {
  margin: 0 8px;
  color: #666;
}
.logo-uploader ::v-deep .el-upload--picture-card,
.el-upload--picture-card {
  width: 120px;
  height: 120px;
}
</style>
