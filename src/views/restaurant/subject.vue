<template>
  <div class="restaurant-page">
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
        <el-form-item label="所属乡村">
          <el-select
            v-model="filters.villageId"
            placeholder="选择所属乡村"
            clearable
            :loading="villageLoading"
            style="width: 200px"
          >
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
          <el-button type="success" @click="openDialog()">新增</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    <el-card>
      <el-table :data="tableData" border stripe>
        <el-table-column type="index" label="序号" width="60" />
        <el-table-column label="门店图" width="120">
          <template slot-scope="scope">
            <el-image
              v-if="scope.row.logoUrl"
              :src="getImageUrl(scope.row.logoUrl)"
              :preview-src-list="[getImageUrl(scope.row.logoUrl)]"
              fit="cover"
              style="width: 80px; height: 60px; border-radius: 4px; cursor: pointer;"
              @error="() => {}"
            />
            <span v-else style="color: #999; font-size: 12px;">暂无图片</span>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="门店名称" min-width="200" show-overflow-tooltip />
        <el-table-column label="经营状态" width="120">
          <template slot-scope="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'">
              {{ row.status === 1 ? '营业' : '停业' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="经营时间" width="150">
          <template slot-scope="{ row }">
            <span v-if="row.businessStartTime && row.businessEndTime">
              {{ row.businessStartTime }} - {{ row.businessEndTime }}
            </span>
            <span v-else style="color: #999;">--</span>
          </template>
        </el-table-column>
        <el-table-column prop="villageName" label="所属乡村" width="180" />
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
    <el-dialog
      :title="dialogTitle"
      :visible.sync="dialogVisible"
      width="720px"
      :close-on-click-modal="false"
      @close="resetForm"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="门店名称" prop="name">
          <el-input v-model="form.name" maxlength="100" show-word-limit />
        </el-form-item>
        <el-form-item label="关联用户" prop="userId">
          <el-select
            v-model="form.userId"
            filterable
            placeholder="选择用户"
            :loading="userLoading"
            style="width: 100%"
          >
            <el-option
              v-for="item in userOptions"
              :key="item.id"
              :label="item.username"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="所属乡村" prop="villageId">
          <el-select
            v-model="form.villageId"
            filterable
            placeholder="选择所属乡村"
            :loading="villageLoading"
            style="width: 100%"
          >
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
            ref="logoUpload"
            :auto-upload="false"
            :on-change="handleLogoChange"
            :before-upload="beforeLogoUpload"
            :file-list="logoList"
            accept="image/*"
            :limit="1"
            action=""
            list-type="picture-card"
          >
            <i class="el-icon-plus" />
            <div slot="tip" class="el-upload__tip">只能上传 jpg/png 文件，且不超过 2MB</div>
          </el-upload>
        </el-form-item>
        <el-form-item label="门店地址" prop="address">
          <el-input v-model="form.address" maxlength="200" show-word-limit />
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
            ref="businessUpload"
            :auto-upload="false"
            :on-change="(file, list) => handleLicenseChange('business', file, list)"
            :before-upload="beforeLicenseUpload"
            :file-list="businessList"
            accept="image/*"
            :limit="15"
            action=""
            list-type="picture-card"
          >
            <i class="el-icon-plus" />
            <div slot="tip" class="el-upload__tip">最多上传 15 张，每张不超过 2MB</div>
          </el-upload>
        </el-form-item>
        <el-form-item label="食品许可证">
          <el-upload
            ref="foodUpload"
            :auto-upload="false"
            :on-change="(file, list) => handleLicenseChange('food', file, list)"
            :before-upload="beforeLicenseUpload"
            :file-list="foodList"
            accept="image/*"
            :limit="15"
            action=""
            list-type="picture-card"
          >
            <i class="el-icon-plus" />
            <div slot="tip" class="el-upload__tip">最多上传 15 张，每张不超过 2MB</div>
          </el-upload>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">保存</el-button>
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
import request from '@/utils/request'
import { getToken } from '@/utils/auth'

export default {
  name: 'RestaurantPage',
  data () {
    return {
      filters: { name: '', status: null, villageId: null },
      pagination: { pageNum: 1, pageSize: 10, total: 0 },
      tableData: [],
      villageOptions: [],
      villageLoading: false,
      userOptions: [],
      userLoading: false,
      dialogVisible: false,
      dialogTitle: '新增门店',
      submitLoading: false,
      form: this.initForm(),
      logoList: [],
      businessList: [],
      foodList: [],
      baseUrl: '',
      uploadHeaders: {},
      rules: {
        name: [
          { required: true, message: '请输入门店名称', trigger: 'blur' },
          { max: 100, message: '不超过100字符', trigger: 'blur' }
        ],
        userId: [{ required: true, message: '请选择关联用户', trigger: 'change' }],
        villageId: [{ required: true, message: '请选择所属乡村', trigger: 'change' }],
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
    this.getBaseUrl()
    this.refreshUploadHeaders()
    this.loadVillageOptions()
    this.loadUserOptions()
    this.loadData()
  },
  methods: {
    getBaseUrl () {
      this.baseUrl = process.env.VUE_APP_BASE_API || 'http://8.145.38.163:8020'
    },
    refreshUploadHeaders () {
      this.uploadHeaders = { token: getToken() || '' }
    },
    getImageUrl (imagePath) {
      if (!imagePath) return ''
      if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return imagePath
      }
      if (imagePath.startsWith('/uploads/')) {
        return this.baseUrl + imagePath
      }
      return this.baseUrl + '/uploads/' + imagePath
    },
    async uploadImage (file) {
      const formData = new FormData()
      formData.append('file', file)
      const response = await request({
        url: '/api/file/upload',
        method: 'post',
        data: formData,
        headers: { 'Content-Type': 'multipart/form-data', ...this.uploadHeaders }
      })
      if (response && response.data && response.data.filename) {
        return response.data.filename
      }
      if (response && response.filename) {
        return response.filename
      }
      throw new Error('上传响应格式错误')
    },
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
    async loadVillageOptions () {
      this.villageLoading = true
      try {
        const res = await getVillageList()
        if (Array.isArray(res)) {
          this.villageOptions = res
        } else if (res && res.code === 200) {
          this.villageOptions = res.data || []
        } else {
          this.$message.error('获取乡村列表失败：数据格式异常')
        }
      } catch (e) {
        this.$message.error('获取乡村列表失败，请检查网络连接')
      } finally {
        this.villageLoading = false
      }
    },
    async loadUserOptions () {
      this.userLoading = true
      try {
        const res = await listUserOptions()
        if (res && res.data) {
          this.userOptions = res.data || []
        } else if (Array.isArray(res)) {
          this.userOptions = res
        } else {
          this.userOptions = []
        }
      } catch (e) {
        this.$message.error('获取用户列表失败，请检查网络连接')
        this.userOptions = []
      } finally {
        this.userLoading = false
      }
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
      this.refreshUploadHeaders()
      if (row) {
        this.dialogTitle = '编辑门店'
        // 确保下拉选项已加载后再加载详情
        Promise.all([
          this.loadVillageOptions(),
          this.loadUserOptions()
        ]).then(() => {
          this.loadDetail(row.id)
        })
      } else {
        this.dialogTitle = '新增门店'
        this.form = this.initForm()
        this.logoList = []
        this.businessList = []
        this.foodList = []
      }
    },
    // 修复：确保所有数据正确加载，包括关联用户和所属乡村
    async loadDetail (id) {
      try {
        const res = await getRestaurant(id)
        const data = res.data || res

        // 确保所有字段都正确赋值，特别注意类型转换
        this.form = {
          id: data.id || null,
          name: data.name || '',
          // 确保 userId 类型匹配（可能是 Long 或 Number）
          userId: data.userId ? Number(data.userId) : null,
          // 确保 villageId 类型匹配（可能是 Integer 或 Number）
          villageId: data.villageId ? Number(data.villageId) : null,
          status: data.status !== undefined && data.status !== null ? Number(data.status) : 1,
          // 确保时间字段正确加载
          businessStartTime: data.businessStartTime || '',
          businessEndTime: data.businessEndTime || '',
          logoUrl: data.logoUrl || '',
          address: data.address || '',
          coordinateLat: data.coordinateLat || null,
          coordinateLng: data.coordinateLng || null,
          phone: data.phone || '',
          notice: data.notice || '',
          licenseUrls: data.licenseUrls || ''
        }

        // 加载Logo
        if (this.form.logoUrl) {
          this.logoList = [{
            name: this.form.logoUrl.split('/').pop(),
            url: this.getImageUrl(this.form.logoUrl),
            status: 'success'
          }]
        } else {
          this.logoList = []
        }

        // 加载证照图片
        this.businessList = []
        this.foodList = []
        if (this.form.licenseUrls) {
          try {
            const licenses = JSON.parse(this.form.licenseUrls)
            if (Array.isArray(licenses)) {
              licenses.forEach((item, idx) => {
                if (item.type === 'business') {
                  this.businessList.push({
                    uid: `business-${idx}`,
                    name: item.url ? item.url.split('/').pop() : 'business',
                    url: this.getImageUrl(item.url),
                    status: 'success'
                  })
                } else if (item.type === 'food') {
                  this.foodList.push({
                    uid: `food-${idx}`,
                    name: item.url ? item.url.split('/').pop() : 'food',
                    url: this.getImageUrl(item.url),
                    status: 'success'
                  })
                }
              })
            }
          } catch (e) {
            console.error('解析证照图片失败', e)
          }
        }

        // 使用 $nextTick 确保下拉选项已渲染
        this.$nextTick(() => {
          // 强制更新表单验证状态
          if (this.$refs.formRef) {
            this.$refs.formRef.clearValidate()
          }
        })
      } catch (e) {
        console.error('加载详情失败', e)
        this.$message.error('加载门店详情失败：' + (e.message || '未知错误'))
      }
    },
    handleLogoChange (file, fileList) {
      this.logoList = fileList
    },
    beforeLogoUpload (file) {
      const isImage = file.type.startsWith('image/')
      const isLt2M = file.size / 1024 / 1024 < 2
      if (!isImage) {
        this.$message.error('只能上传图片文件!')
        return false
      }
      if (!isLt2M) {
        this.$message.error('图片大小不能超过 2MB!')
        return false
      }
      return false
    },
    handleLicenseChange (type, file, fileList) {
      if (type === 'business') {
        this.businessList = fileList
      } else if (type === 'food') {
        this.foodList = fileList
      }
    },
    beforeLicenseUpload (file) {
      const isImage = file.type.startsWith('image/')
      const isLt2M = file.size / 1024 / 1024 < 2
      if (!isImage) {
        this.$message.error('只能上传图片文件!')
        return false
      }
      if (!isLt2M) {
        this.$message.error('图片大小不能超过 2MB!')
        return false
      }
      return false
    },
    async handleSubmit () {
      this.$refs.formRef.validate(async valid => {
        if (!valid) return

        this.submitLoading = true
        try {
          // 1. 上传Logo
          if (this.logoList.length > 0) {
            const logo = this.logoList[0]
            if (logo.raw) {
              const fileName = await this.uploadImage(logo.raw)
              this.form.logoUrl = '/uploads/' + fileName
            } else if (logo.url) {
              const match = logo.url.match(/\/uploads\/[^/]+$/)
              if (match) {
                this.form.logoUrl = match[0]
              } else {
                this.form.logoUrl = logo.url
              }
            }
          } else {
            this.form.logoUrl = ''
          }

          // 2. 上传证照图片
          const licenseArray = []

          for (const item of this.businessList) {
            let url = ''
            if (item.raw) {
              const fileName = await this.uploadImage(item.raw)
              url = '/uploads/' + fileName
            } else if (item.url) {
              const match = item.url.match(/\/uploads\/[^/]+$/)
              if (match) {
                url = match[0]
              } else {
                url = item.url
              }
            }
            if (url) {
              licenseArray.push({ type: 'business', url })
            }
          }

          for (const item of this.foodList) {
            let url = ''
            if (item.raw) {
              const fileName = await this.uploadImage(item.raw)
              url = '/uploads/' + fileName
            } else if (item.url) {
              const match = item.url.match(/\/uploads\/[^/]+$/)
              if (match) {
                url = match[0]
              } else {
                url = item.url
              }
            }
            if (url) {
              licenseArray.push({ type: 'food', url })
            }
          }

          this.form.licenseUrls = JSON.stringify(licenseArray)

          // 3. 提交表单
          if (this.form.id) {
            await updateRestaurant(this.form)
            this.$message.success('更新成功')
          } else {
            await createRestaurant(this.form)
            this.$message.success('新增成功')
          }

          this.dialogVisible = false
          this.loadData()
        } catch (e) {
          this.$message.error('操作失败：' + (e.message || '未知错误'))
        } finally {
          this.submitLoading = false
        }
      })
    },
    handleDelete (id) {
      this.$confirm('删除后，门店信息不可恢复，确认是否删除？', '提示', { type: 'warning' })
        .then(async () => {
          await deleteRestaurant(id)
          this.$message.success('删除成功')
          this.loadData()
        })
        .catch(() => {})
    },
    resetForm () {
      if (this.$refs.formRef) {
        this.$refs.formRef.resetFields()
      }
      this.form = this.initForm()
      this.logoList = []
      this.businessList = []
      this.foodList = []
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
.time-sep {
  margin: 0 8px;
  color: #666;
}
.logo-uploader ::v-deep .el-upload--picture-card {
  width: 120px;
  height: 120px;
}
</style>
