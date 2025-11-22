<template>
  <div class="app-container">
    <!-- 搜索区域 -->
    <div class="filter-container">
      <el-form :inline="true" :model="queryParams" class="demo-form-inline">
        <el-form-item label="店铺名称">
          <el-input
            v-model="queryParams.shopName"
            placeholder="请输入店铺名称"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="产品类型">
          <el-input
            v-model="queryParams.productType"
            placeholder="请输入产品类型"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="经营状态">
          <el-select
            v-model="queryParams.businessStatus"
            placeholder="请选择状态"
            clearable
            style="width: 150px"
          >
            <el-option label="营业" :value="1" />
            <el-option label="停业" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item label="所属村">
          <el-select
            v-model="queryParams.village"
            placeholder="请选择所属村"
            clearable
            filterable
            style="width: 200px"
            :loading="villageLoading"
            @focus="loadVillageList"
          >
            <el-option
              v-for="item in villageList"
              :key="item.id"
              :label="item.villageName"
              :value="item.villageName"
            />
          </el-select>
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
    <el-table v-loading="loading" :data="shopList" border style="width: 100%">
      <el-table-column prop="displayNo" label="序号" width="120" />
      <el-table-column label="店铺图片" width="120">
        <template slot-scope="scope">
          <el-image
            v-if="scope.row.shopAvatar"
            :src="getImageUrl(scope.row.shopAvatar)"
            :preview-src-list="[getImageUrl(scope.row.shopAvatar)]"
            fit="cover"
            style="width: 80px; height: 60px; border-radius: 4px;"
            @error="() => {}"
          />
          <span v-else style="color: #999; font-size: 12px;">暂无图片</span>
        </template>
      </el-table-column>
      <el-table-column prop="shopName" label="店铺名称" min-width="160" />
      <el-table-column prop="productType" label="产品类型" width="140" />
      <el-table-column label="经营状态" width="120">
        <template slot-scope="scope">
          <el-tag :type="scope.row.businessStatus === 1 ? 'success' : 'danger'">
            {{ scope.row.businessStatus === 1 ? '营业' : '停业' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="village" label="所属村" width="140" />
      <el-table-column prop="createTime" label="创建时间" width="160" />
      <el-table-column prop="updateTime" label="更新时间" width="160" />
      <el-table-column label="操作" width="200" fixed="right">
        <template slot-scope="scope">
          <div class="operation-buttons">
            <el-button size="mini" type="primary" @click="handleEdit(scope.row)">
              <i class="el-icon-edit"></i> 编辑
            </el-button>
            <el-button size="mini" type="danger" @click="handleDelete(scope.row)">
              <i class="el-icon-delete"></i> 删除
            </el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>

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

    <!-- 新增/编辑弹窗 -->
    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="900px" @close="resetForm">
      <el-form ref="shopFormRef" :model="shopForm" :rules="shopRules" label-width="120px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="店铺名称" prop="shopName">
              <el-input v-model="shopForm.shopName" placeholder="请输入店铺名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="店铺缩写" prop="shopAbbreviation">
              <el-input v-model="shopForm.shopAbbreviation" placeholder="请输入店铺缩写" :disabled="isEdit" />
              <div class="form-tip">店铺缩写将用作商家账号用户名</div>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="产品类型" prop="productType">
              <el-input v-model="shopForm.productType" placeholder="请输入产品类型" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="经营状态" prop="businessStatus">
              <el-select v-model="shopForm.businessStatus" placeholder="请选择状态" style="width: 100%">
                <el-option label="营业" :value="1" />
                <el-option label="停业" :value="0" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="所属村" prop="village">
          <el-select v-model="shopForm.village" placeholder="请选择所属村" filterable style="width: 100%">
            <el-option
              v-for="item in villageList"
              :key="item.id"
              :label="item.villageName"
              :value="item.villageName"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="店铺简介" prop="shopIntro">
          <el-input v-model="shopForm.shopIntro" type="textarea" :rows="3" placeholder="请输入店铺简介" />
        </el-form-item>

        <!-- 店铺头像 -->
        <el-form-item label="店铺头像" prop="shopAvatar">
          <el-upload
            ref="avatarUpload"
            :auto-upload="false"
            :on-change="handleAvatarChange"
            :before-upload="beforeAvatarUpload"
            :file-list="avatarList"
            accept="image/*"
            :limit="1"
            action=""
            list-type="picture-card"
          >
            <i class="el-icon-plus" />
            <div slot="tip" class="el-upload__tip">只能上传 jpg/png 文件，且不超过 2MB</div>
          </el-upload>
        </el-form-item>

        <el-form-item label="店铺地址" prop="shopAddress">
          <el-input v-model="shopForm.shopAddress" placeholder="请输入店铺地址" />
        </el-form-item>

        <!-- 资质凭证 -->
        <el-form-item label="资质凭证" prop="qualificationFiles">
          <div class="qualification-upload-container">
            <div class="special-notice">
              <i class="el-icon-info"></i>
              <span>请按类别上传完整、清晰的资质文件，图片需包含完整地址及关键信息。</span>
            </div>

            <div class="qualification-types">
              <div class="type-title">资质类型</div>
              <el-radio-group v-model="selectedQualificationType" class="type-buttons">
                <el-radio-button label="license">营业执照</el-radio-button>
                <el-radio-button label="industry">行业专项许可证</el-radio-button>
                <el-radio-button label="property">场地证明</el-radio-button>
                <el-radio-button label="other">其他资质</el-radio-button>
              </el-radio-group>
            </div>

            <div class="qualification-instructions">
              <div v-if="selectedQualificationType === 'license'" class="instructions">
                <div class="instruction-item">
                  <span class="number">1.</span>
                  <span>上传最新有效的营业执照，须完整展示统一社会信用代码、法人、经营范围等信息。</span>
                </div>
                <div class="instruction-item">
                  <span class="number">2.</span>
                  <span>如为分支机构，需附上级单位授权或备案材料。</span>
                </div>
              </div>
              <div v-if="selectedQualificationType === 'industry'" class="instructions">
                <div class="instruction-item">
                  <span class="number">1.</span>
                  <span>餐饮/食品：食品经营许可证；涉及餐饮加工时补充餐饮服务许可证。</span>
                </div>
                <div class="instruction-item">
                  <span class="number">2.</span>
                  <span>药品、出版、演出等特殊行业请上传对应行政许可。</span>
                </div>
              </div>
              <div v-if="selectedQualificationType === 'property'" class="instructions">
                <div class="instruction-item">
                  <span class="number">1.</span>
                  <span>房产权属证明、租赁合同、水电缴费凭证等可证明经营场所合法使用权的材料。</span>
                </div>
                <div class="instruction-item">
                  <span class="number">2.</span>
                  <span>如为租赁，合同需覆盖经营期且签章齐全。</span>
                </div>
              </div>
              <div v-if="selectedQualificationType === 'other'" class="instructions">
                <div class="instruction-item">
                  <span class="number">1.</span>
                  <span>可上传食品卫生检测、消防、品牌授权、ISO 认证等补充资质。</span>
                </div>
                <div class="instruction-item">
                  <span class="number">2.</span>
                  <span>资料需在有效期内，确保文字清晰可读。</span>
                </div>
              </div>
            </div>

            <div class="help-section">
              <i class="el-icon-question"></i>
              <span>若未按要求提供资料，将影响审核通过。</span>
            </div>

            <div class="upload-section">
              <div class="upload-title">{{ getQualificationTypeName(selectedQualificationType) }}</div>
              <div class="upload-instruction">含关键信息的图片请置于第一张，系统支持最多 15 张。</div>
              <div class="upload-area">
                <el-upload
                  ref="qualificationUpload"
                  :auto-upload="false"
                  :on-change="handleQualificationImageChange"
                  :before-upload="beforeQualificationImageUpload"
                  :file-list="getCurrentQualificationImages()"
                  accept="image/*"
                  :limit="15"
                  action=""
                  list-type="picture-card"
                  class="qualification-upload"
                >
                  <i class="el-icon-camera" />
                  <div class="upload-text">{{ getCurrentQualificationImages().length }}/15</div>
                </el-upload>
              </div>
            </div>
          </div>
        </el-form-item>
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="submitForm">
          确定
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getShopList, getShopById, createShop, updateShop, deleteShop } from '@/api/shop'
import { getVillageList } from '@/api/village'
import request from '@/utils/request'
import { getToken } from '@/utils/auth'

export default {
  name: 'ShopManagement',
  data() {
    return {
      loading: false,
      villageLoading: false,
      submitLoading: false,
      dialogVisible: false,
      dialogTitle: '',
      isEdit: false,
      shopList: [],
      villageList: [],
      total: 0,
      baseUrl: '',
      uploadHeaders: { token: getToken() || '' },
      avatarList: [],
      qualificationImagesByType: {
        license: [],
        industry: [],
        property: [],
        other: []
      },
      selectedQualificationType: 'license',
      queryParams: {
        page: 1,
        pageSize: 10,
        shopName: '',
        productType: '',
        businessStatus: null,
        village: ''
      },
      shopForm: {
        id: null,
        shopName: '',
        shopAbbreviation: '',
        productType: '',
        businessStatus: 1,
        village: '',
        shopIntro: '',
        shopAvatar: '',
        shopAddress: '',
        qualificationFiles: ''
      },
      shopRules: {
        shopName: [{ required: true, message: '请输入店铺名称', trigger: 'blur' }],
        shopAbbreviation: [{ required: true, message: '请输入店铺缩写', trigger: 'blur' }],
        productType: [{ required: true, message: '请输入产品类型', trigger: 'blur' }],
        businessStatus: [{ required: true, message: '请选择经营状态', trigger: 'change' }],
        village: [{ required: true, message: '请选择所属村', trigger: 'change' }]
      }
    }
  },
  created() {
    this.getBaseUrl()
    this.getVillageList()
    this.getList()
  },
  methods: {
    getBaseUrl() {
      this.baseUrl = process.env.VUE_APP_BASE_API || 'http://8.145.38.163:8020'
    },
    refreshUploadHeaders() {
      this.uploadHeaders = { token: getToken() || '' }
    },
    loadVillageList() {
      if (!this.villageList.length) {
        this.getVillageList()
      }
    },
    getQualificationTypeName(type) {
      const map = {
        license: '营业执照',
        industry: '行业专项许可证',
        property: '场地证明',
        other: '其他资质'
      }
      return map[type] || '资质'
    },
    getCurrentQualificationImages() {
      return this.qualificationImagesByType[this.selectedQualificationType] || []
    },
    getImageUrl(imagePath) {
      if (!imagePath) return ''
      if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return imagePath
      }
      if (imagePath.startsWith('/uploads/')) {
        return this.baseUrl + imagePath
      }
      return this.baseUrl + '/uploads/' + imagePath
    },
    async uploadImage(file) {
      const formData = new FormData()
      formData.append('file', file)
      const response = await request({
        url: '/api/file/upload',
        method: 'post',
        data: formData,
        headers: { 'Content-Type': 'multipart/form-data', ...this.uploadHeaders }
      })
      if (response && response.filename) return response.filename
      if (response && response.data && response.data.filename) return response.data.filename
      throw new Error('上传响应格式错误')
    },
    async getVillageList() {
      this.villageLoading = true
      try {
        const res = await getVillageList()
        if (Array.isArray(res)) {
          this.villageList = res
        } else if (res && (res.code === 200 || res.code === '200')) {
          this.villageList = res.data || []
        } else if (res && res.data && Array.isArray(res.data)) {
          this.villageList = res.data
        } else {
          this.$message.error('获取村庄列表失败：数据格式异常')
          this.villageList = []
        }
      } catch (error) {
        this.$message.error('获取村庄列表失败，请检查网络连接')
        this.villageList = []
      } finally {
        this.villageLoading = false
      }
    },
    async getList() {
      this.loading = true
      try {
        const res = await getShopList(this.queryParams)
        if (Array.isArray(res)) {
          this.shopList = res.map((item, idx) => ({
            ...item,
            displayNo: item.displayNo && item.displayNo >= 1
              ? item.displayNo
              : idx + 1 + (this.queryParams.page - 1) * this.queryParams.pageSize
          }))
          this.total = res.length
        } else if (res && (res.code === 200 || res.code === '200')) {
          const records = (res.data && res.data.records) || []
          this.shopList = records.map((item, idx) => ({
            ...item,
            displayNo: item.displayNo && item.displayNo >= 1
              ? item.displayNo
              : idx + 1 + (this.queryParams.page - 1) * this.queryParams.pageSize
          }))
          this.total = (res.data && res.data.total) || 0
        } else {
          this.$message.error((res && res.msg) || '获取店铺列表失败')
        }
      } catch (error) {
        this.$message.error('获取店铺列表失败')
      } finally {
        this.loading = false
      }
    },
    handleQuery() {
      this.queryParams.page = 1
      this.getList()
    },
    resetQuery() {
      this.queryParams = {
        page: 1,
        pageSize: 10,
        shopName: '',
        productType: '',
        businessStatus: null,
        village: ''
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
      this.dialogTitle = '新增店铺'
      this.isEdit = false
      this.refreshUploadHeaders()
      this.resetForm()
      this.dialogVisible = true
    },
    async handleEdit(row) {
      if (!row || !row.id) {
        this.$message.error('数据错误，无法编辑')
        return
      }
      this.dialogTitle = '编辑店铺'
      this.isEdit = true
      this.refreshUploadHeaders()
      try {
        const res = await getShopById(row.id)
        const data = res && (res.code === 200 || res.code === '200') ? res.data : row
        if (!data) {
          this.$message.error('获取店铺详情失败')
          return
        }
        this.shopForm = {
          id: data.id,
          shopName: data.shopName || '',
          shopAbbreviation: data.shopAbbreviation || '',
          productType: data.productType || '',
          businessStatus: data.businessStatus !== undefined ? data.businessStatus : 1,
          village: data.village || '',
          shopIntro: data.shopIntro || '',
          shopAvatar: data.shopAvatar || '',
          shopAddress: data.shopAddress || '',
          qualificationFiles: data.qualificationFiles || ''
        }

        if (data.shopAvatar) {
          this.avatarList = [{
            name: data.shopAvatar.split('/').pop(),
            url: this.getImageUrl(data.shopAvatar),
            status: 'success'
          }]
        } else {
          this.avatarList = []
        }

        this.qualificationImagesByType = { license: [], industry: [], property: [], other: [] }
        if (data.qualificationFiles) {
          try {
            const parsed = JSON.parse(data.qualificationFiles)
            if (Array.isArray(parsed)) {
              this.qualificationImagesByType.license = parsed.map((url, idx) => ({
                uid: idx, name: url.split('/').pop(), url: this.getImageUrl(url), status: 'success'
              }))
            } else if (typeof parsed === 'object') {
              Object.keys(parsed).forEach((key) => {
                if (this.qualificationImagesByType[key] && Array.isArray(parsed[key])) {
                  this.qualificationImagesByType[key] = parsed[key].map((url, idx) => ({
                    uid: `${key}-${idx}`, name: url.split('/').pop(), url: this.getImageUrl(url), status: 'success'
                  }))
                }
              })
            }
          } catch (error) {
            this.qualificationImagesByType.license = []
          }
        }

        this.dialogVisible = true
      } catch (error) {
        this.$message.error('获取店铺详情失败')
      }
    },
    handleDelete(row) {
      if (!row || !row.id) {
        this.$message.error('数据错误，无法删除')
        return
      }
      this.$confirm(`确定删除店铺「${row.shopName}」吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async () => {
          try {
            const res = await deleteShop(row.id)
            const success = Array.isArray(res) ||
              (res && (res.code === 200 || res.code === '200')) ||
              (res && res.data) ||
              (!res)
            if (success) {
              this.$message.success('删除成功')
              this.getList()
            } else {
              this.$message.error((res && res.msg) || '删除失败')
            }
          } catch (error) {
            this.$message.error('删除失败')
          }
        })
        .catch(() => {})
    },
    handleAvatarChange(file, fileList) {
      this.avatarList = fileList
    },
    beforeAvatarUpload(file) {
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
    handleQualificationImageChange(file, fileList) {
      this.qualificationImagesByType[this.selectedQualificationType] = fileList
    },
    beforeQualificationImageUpload(file) {
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
    async submitForm() {
      this.$refs.shopFormRef.validate(async (valid) => {
        if (!valid) return
        this.submitLoading = true
        try {
          if (this.avatarList.length > 0) {
            const avatar = this.avatarList[0]
            if (avatar.raw) {
              const fileName = await this.uploadImage(avatar.raw)
              this.shopForm.shopAvatar = fileName
            } else if (avatar.url) {
              this.shopForm.shopAvatar = avatar.url.split('/').pop()
            }
          } else {
            this.shopForm.shopAvatar = ''
          }

          const filesObj = { license: [], industry: [], property: [], other: [] }
          for (const type of Object.keys(this.qualificationImagesByType)) {
            const fileList = this.qualificationImagesByType[type]
            for (const item of fileList) {
              if (item.raw) {
                const fileName = await this.uploadImage(item.raw)
                filesObj[type].push(fileName)
              } else if (item.url) {
                filesObj[type].push(item.url.split('/').pop())
              }
            }
          }
          this.shopForm.qualificationFiles = JSON.stringify(filesObj)

          const api = this.isEdit ? updateShop : createShop
          const payload = this.isEdit ? { ...this.shopForm, id: this.shopForm.id } : this.shopForm
          const res = await api(payload)
          const success = Array.isArray(res) ||
            (res && (res.code === 200 || res.code === '200')) ||
            (res && res.data) ||
            (!res)
          if (success) {
            this.$message.success(this.isEdit ? '更新成功' : '新增成功')
            this.dialogVisible = false
            this.getList()
            this.resetForm()
          } else {
            this.$message.error((res && res.msg) || '操作失败')
          }
        } catch (error) {
          this.$message.error(error.message || '操作失败')
        } finally {
          this.submitLoading = false
        }
      })
    },
    resetForm() {
      if (this.$refs.shopFormRef) {
        this.$refs.shopFormRef.resetFields()
      }
      this.shopForm = {
        id: null,
        shopName: '',
        shopAbbreviation: '',
        productType: '',
        businessStatus: 1,
        village: '',
        shopIntro: '',
        shopAvatar: '',
        shopAddress: '',
        qualificationFiles: ''
      }
      this.avatarList = []
      this.qualificationImagesByType = {
        license: [],
        industry: [],
        property: [],
        other: []
      }
      this.selectedQualificationType = 'license'
      this.isEdit = false
    }
  }
}
</script>
<style scoped>
.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
