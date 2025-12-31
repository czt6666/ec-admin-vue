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
          <el-tooltip content="非管理员暂不允许新增店铺" placement="top" effect="dark">
            <i class="el-icon-info" style="margin-left: 8px; color: #909399; cursor: help; font-size: 16px;"></i>
          </el-tooltip>
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
              <el-input
                v-model="shopForm.shopName"
                placeholder="请输入店铺名称"
                :maxlength="100"
              />
              <div class="word-count">{{ (shopForm.shopName || '').length }}/100</div>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="店铺缩写" prop="shopAbbreviation">
              <el-input v-model="shopForm.shopAbbreviation" placeholder="请输入店铺缩写" :disabled="isEdit" />
              <div class="gray-tip">店铺缩写将用作商家账号用户名，添加后不支持修改</div>
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
          <el-input
            v-model="shopForm.shopIntro"
            type="textarea"
            :rows="3"
            placeholder="请输入店铺简介"
            :maxlength="300"
          />
          <div class="word-count">{{ (shopForm.shopIntro || '').length }}/300</div>
        </el-form-item>

        <!-- 店铺头像 -->
        <el-form-item label="店铺头像" prop="shopAvatar">
          <el-upload
            ref="avatarUpload"
            :auto-upload="false"
            :on-change="handleAvatarChange"
            :on-remove="handleAvatarRemove"
            :before-upload="beforeAvatarUpload"
            :file-list="avatarList"
            accept="image/*"
            :limit="1"
            action=""
            list-type="picture-card"
            :class="{ 'avatar-upload-hidden': avatarList.length >= 1 }"
          >
            <i class="el-icon-plus" />
            <div slot="tip" class="el-upload__tip">只能上传 jpg/png 文件，且不超过 2MB</div>
          </el-upload>
        </el-form-item>

        <!-- 店铺地址 + 地图选址 -->
        <el-form-item label="店铺地址" prop="shopAddress">
          <el-input
            v-model="shopForm.shopAddress"
            placeholder="请输入店铺地址或使用地图选址"
            style="width: 320px"
          />
          <el-button type="primary" plain size="mini" @click="openMapDialog" style="margin-left: 8px;">
            地图选址
          </el-button>
          <el-button type="default" plain size="mini" @click="getCurrentLocation" style="margin-left: 4px;">
            获取当前位置
          </el-button>
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

    <!-- 地图选择对话框 -->
    <el-dialog
      title="选择店铺位置"
      :visible.sync="mapDialogVisible"
      width="80%"
      :before-close="closeMapDialog"
    >
      <div class="map-dialog-content">
        <div id="shopMapContainer" style="width: 100%; height: 500px;"></div>
        <div class="map-info">
          <p>请在地图上点击选择位置</p>
          <p v-if="selectedLatitude && selectedLongitude">
            选中位置：纬度 {{ selectedLatitude }}，经度 {{ selectedLongitude }}
          </p>
        </div>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="closeMapDialog">取消</el-button>
        <el-button type="primary" @click="confirmLocation">确定选择</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getShopList, getShopById, createShop, updateShop, deleteShop } from '@/api/shop'
import { getVillageList } from '@/api/village'
import { getCurrentUser } from '@/api/user'
import request from '@/utils/request'
import { getToken } from '@/utils/auth'

export default {
  name: 'ShopManagement',

  data () {
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
      // 地图相关
      mapDialogVisible: false,
      map: null,
      marker: null,
      selectedLatitude: null,
      selectedLongitude: null,
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
        latitude: null,
        longitude: null,
        qualificationFiles: ''
      },
      shopRules: {
        shopName: [{ required: true, message: '请输入店铺名称', trigger: 'blur' }],
        shopAbbreviation: [{ required: true, message: '请输入店铺缩写', trigger: 'blur' }],
        productType: [{ required: true, message: '请输入产品类型', trigger: 'blur' }],
        businessStatus: [{ required: true, message: '请选择经营状态', trigger: 'change' }],
        village: [{ required: true, message: '请选择所属村', trigger: 'change' }]
      },
      isAdmin: false // 是否为管理员
    }
  },

  created () {
    this.getBaseUrl()
    this.getVillageList()
    this.getList()
    this.checkUserPermission()
  },

  methods: {
    getBaseUrl () {
      this.baseUrl = process.env.VUE_APP_BASE_API || 'https://dzk.czt666.cn/api'
    },

    refreshUploadHeaders () {
      this.uploadHeaders = { token: getToken() || '' }
    },

    loadVillageList () {
      if (!this.villageList.length) {
        this.getVillageList()
      }
    },

    getQualificationTypeName (type) {
      const map = {
        license: '营业执照',
        industry: '行业专项许可证',
        property: '场地证明',
        other: '其他资质'
      }
      return map[type] || '资质'
    },

    getCurrentQualificationImages () {
      return this.qualificationImagesByType[this.selectedQualificationType] || []
    },

    getImageUrl (imagePath) {
      if (!imagePath) return ''

      if (imagePath.indexOf('http://') === 0 || imagePath.indexOf('https://') === 0) {
        return imagePath
      }

      if (imagePath.indexOf('/uploads/') === 0) {
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

      if (response && response.filename) return response.filename
      if (response && response.data && response.data.filename) return response.data.filename

      throw new Error('上传响应格式错误')
    },

    async getVillageList () {
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
      } catch (e) {
        this.$message.error('获取村庄列表失败，请检查网络连接')
        this.villageList = []
      } finally {
        this.villageLoading = false
      }
    },

    async getList () {
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
      } catch (e) {
        this.$message.error('获取店铺列表失败')
      } finally {
        this.loading = false
      }
    },

    handleQuery () {
      this.queryParams.page = 1
      this.getList()
    },

    resetQuery () {
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

    handleSizeChange (val) {
      this.queryParams.pageSize = val
      this.queryParams.page = 1
      this.getList()
    },

    handleCurrentChange (val) {
      this.queryParams.page = val
      this.getList()
    },

    handleAdd () {
      this.dialogTitle = '新增店铺'
      this.isEdit = false
      this.refreshUploadHeaders()
      this.resetForm()
      this.dialogVisible = true
    },

    async handleEdit (row) {
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
          latitude: data.latitude || null,
          longitude: data.longitude || null,
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
              for (const key in parsed) {
                if (parsed.hasOwnProperty(key) &&
                  this.qualificationImagesByType[key] &&
                  Array.isArray(parsed[key])) {
                  this.qualificationImagesByType[key] = parsed[key].map((url, idx) => ({
                    uid: key + '-' + idx,
                    name: url.split('/').pop(),
                    url: this.getImageUrl(url),
                    status: 'success'
                  }))
                }
              }
            }
          } catch (e) {
            this.qualificationImagesByType.license = []
          }
        }

        this.dialogVisible = true
      } catch (e) {
        this.$message.error('获取店铺详情失败')
      }
    },

    handleDelete (row) {
      if (!row || !row.id) {
        this.$message.error('数据错误，无法删除')
        return
      }

      this.$confirm('确定删除店铺「' + row.shopName + '」吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
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
        } catch (e) {
          this.$message.error('删除失败')
        }
      }).catch(() => {})
    },

    handleAvatarChange (file, fileList) {
      this.avatarList = fileList
    },

    handleAvatarRemove (file, fileList) {
      this.avatarList = fileList
    },

    beforeAvatarUpload (file) {
      const isImage = file.type && file.type.indexOf('image/') === 0
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

    handleQualificationImageChange (file, fileList) {
      this.qualificationImagesByType[this.selectedQualificationType] = fileList
    },

    beforeQualificationImageUpload (file) {
      const isImage = file.type && file.type.indexOf('image/') === 0
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

    // 地图相关
    openMapDialog () {
      this.mapDialogVisible = true
      this.$nextTick(() => {
        setTimeout(() => {
          this.initMap()
        }, 300)
      })
    },

    initMap () {
      if (typeof AMap === 'undefined') {
        this.$message.error('高德地图API未加载，请检查网络连接')
        return
      }

      const container = document.getElementById('shopMapContainer')

      if (!container) {
        this.$message.error('地图容器不存在')
        return
      }

      if (container.offsetWidth === 0 || container.offsetHeight === 0) {
        setTimeout(() => { this.initMap() }, 200)
        return
      }

      try {
        if (this.map) {
          this.map.destroy()
          this.map = null
        }

        this.map = new AMap.Map('shopMapContainer', {
          zoom: 15,
          viewMode: '3D'
        })

        if (this.shopForm.latitude && this.shopForm.longitude) {
          const position = [this.shopForm.longitude, this.shopForm.latitude]
          this.map.setCenter(position)
          this.map.setZoom(15)
          this.marker = new AMap.Marker({ position, map: this.map })
        } else {
          this.map.setCenter([116.397428, 39.90923])
          this.map.setZoom(11)
        }

        AMap.plugin(['AMap.Scale', 'AMap.ToolBar'], () => {
          this.map.addControl(new AMap.Scale({ position: 'LB' }))
          this.map.addControl(new AMap.ToolBar({ position: 'RT' }))
        })

        this.map.on('complete', () => {
          this.map.on('click', (e) => {
            const lng = e.lnglat.getLng()
            const lat = e.lnglat.getLat()

            this.selectedLatitude = lat
            this.selectedLongitude = lng

            if (this.marker) {
              this.map.remove(this.marker)
            }

            this.marker = new AMap.Marker({
              position: [lng, lat],
              map: this.map
            })

            this.getAddressByCoordinates(lat, lng)
          })
        })
      } catch (e) {
        console.error('地图初始化失败:', e)
        this.$message.error('地图初始化失败：' + e.message)
      }
    },

    getAddressByCoordinates (lat, lng) {
      if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
        this.$message.warning('坐标无效，无法获取地址')
        return
      }

      if (typeof AMap === 'undefined') {
        this.$message.error('高德地图API未加载，请检查网络连接')
        return
      }

      AMap.plugin('AMap.Geocoder', () => {
        try {
          const geocoder = new AMap.Geocoder({
            city: '全国',
            radius: 1000,
            extensions: 'all'
          })

          geocoder.getAddress([lng, lat], (status, result) => {
            if (status === 'complete' && result.info === 'OK') {
              let address = result.regeocode.formattedAddress

              if (!address) {
                const comp = result.regeocode.addressComponent
                const parts = []

                if (comp.province) parts.push(comp.province)
                if (comp.city) parts.push(comp.city)
                if (comp.district) parts.push(comp.district)
                if (comp.township) parts.push(comp.township)
                if (comp.street) parts.push(comp.street)
                if (comp.streetNumber) parts.push(comp.streetNumber)

                address = parts.join('')
              }

              if (address) {
                this.shopForm.shopAddress = address
              } else {
                this.$message.warning('无法获取该位置的地址信息，请手动输入')
              }
            } else {
              this.$message.warning('无法获取该位置的地址信息')
            }
          })
        } catch (e) {
          console.error('地理编码异常:', e)
          this.$message.error('地理编码服务异常：' + e.message)
        }
      })
    },

    getCurrentLocation () {
      if (typeof AMap === 'undefined') {
        this.$message.error('高德地图API未加载，请检查网络连接')
        return
      }

      AMap.plugin('AMap.Geolocation', () => {
        try {
          const geolocation = new AMap.Geolocation({
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
            convert: true,
            showButton: false,
            showMarker: false,
            showCircle: false,
            panToLocation: false,
            zoomToAccuracy: false
          })

          geolocation.getCurrentPosition((status, result) => {
            if (status === 'complete') {
              const lat = result.position.lat
              const lng = result.position.lng

              this.shopForm.latitude = lat
              this.shopForm.longitude = lng

              if (this.map) {
                const position = [lng, lat]
                this.map.setCenter(position)
                this.map.setZoom(15)
                if (this.marker) this.map.remove(this.marker)
                this.marker = new AMap.Marker({ position, map: this.map })
              }

              this.getAddressByCoordinates(lat, lng)
              this.$message.success('获取当前位置成功')
            } else {
              this.$message.error('获取当前位置失败')
            }
          })
        } catch (e) {
          console.error('定位异常:', e)
          this.$message.error('定位服务异常：' + e.message)
        }
      })
    },

    clearCoordinates () {
      this.shopForm.latitude = null
      this.shopForm.longitude = null
      this.$message.info('已清除坐标')
    },

    confirmLocation () {
      if (this.selectedLatitude && this.selectedLongitude) {
        this.shopForm.latitude = this.selectedLatitude
        this.shopForm.longitude = this.selectedLongitude
        this.$message.success('位置选择成功')
        this.closeMapDialog()
      } else {
        this.$message.warning('请先在地图上选择位置')
      }
    },

    closeMapDialog () {
      this.mapDialogVisible = false
      this.selectedLatitude = null
      this.selectedLongitude = null

      if (this.marker && this.map) {
        this.map.remove(this.marker)
      }
      this.marker = null

      if (this.map) {
        this.map.destroy()
        this.map = null
      }
    },

    // 提交表单 - 修改：保存时添加 /uploads/ 前缀
    async submitForm () {
      this.$refs.shopFormRef.validate(async (valid) => {
        if (!valid) return

        this.submitLoading = true

        try {
          // 头像 - 修改：添加 /uploads/ 前缀
          if (this.avatarList.length > 0) {
            const avatar = this.avatarList[0]
            if (avatar.raw) {
              const fileName = await this.uploadImage(avatar.raw)
              this.shopForm.shopAvatar = '/uploads/' + fileName
            } else if (avatar.url) {
              // 如果已有URL，提取 /uploads/ 路径部分
              const match = /\/uploads\/[^/]+$/.exec(avatar.url)
              this.shopForm.shopAvatar = match ? match[0] : avatar.url.split('/').pop()
            }
          } else {
            this.shopForm.shopAvatar = ''
          }

          // 资质 - 修改：添加 /uploads/ 前缀
          const filesObj = { license: [], industry: [], property: [], other: [] }

          for (const type in this.qualificationImagesByType) {
            if (!this.qualificationImagesByType.hasOwnProperty(type)) continue

            const fileList = this.qualificationImagesByType[type]

            for (let i = 0; i < fileList.length; i++) {
              const item = fileList[i]

              if (item.raw) {
                const fileName = await this.uploadImage(item.raw)
                filesObj[type].push('/uploads/' + fileName)
              } else if (item.url) {
                // 如果已有URL，提取 /uploads/ 路径部分
                const match = /\/uploads\/[^/]+$/.exec(item.url)
                filesObj[type].push(match ? match[0] : item.url.split('/').pop())
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
        } catch (e) {
          this.$message.error(e.message || '操作失败')
        } finally {
          this.submitLoading = false
        }
      })
    },

    resetForm () {
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
        latitude: null,
        longitude: null,
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

/* 灰色提示 */
.gray-tip {
  margin-top: 4px;
  font-size: 12px;
  color: #999;
}

/* 有头像时隐藏"+"按钮 */
.avatar-upload-hidden /deep/ .el-upload--picture-card {
  display: none;
}

/* 地图弹窗样式 */
.map-dialog-content {
  position: relative;
}

.map-info {
  margin-top: 10px;
  padding: 10px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.map-info p {
  margin: 5px 0;
  color: #606266;
}

/* 操作按钮样式 */
.operation-buttons {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: stretch;
  width: 100%;
}

.operation-buttons .el-button {
  width: 100%;
  text-align: center;
  justify-content: center;
  padding: 8px 12px;
  font-size: 12px;
  border-radius: 4px;
  transition: all 0.3s ease;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.operation-buttons .el-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.operation-buttons .el-button i {
  margin-right: 6px;
  font-size: 14px;
  flex-shrink: 0;
}

/* 资质上传样式 */
.qualification-upload-container {
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 20px;
}

.special-notice {
  background: #f0f9ff;
  border: 1px solid #b3d8ff;
  border-radius: 6px;
  padding: 12px 16px;
  margin-bottom: 20px;
  display: flex;
  align-items: flex-start;
}

.special-notice i {
  color: #409eff;
  margin-right: 8px;
  margin-top: 2px;
  font-size: 16px;
}

.special-notice span {
  color: #303133;
  font-size: 14px;
  line-height: 1.5;
}

.qualification-types {
  margin-bottom: 20px;
}

.type-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 12px;
}

.type-buttons {
  display: flex;
  gap: 8px;
}

.type-buttons .el-radio-button {
  flex: 1;
}

.type-buttons .el-radio-button__inner {
  width: 100%;
  text-align: center;
  border-radius: 6px;
  border: 1px solid #dcdfe6;
  background: #f5f7fa;
  color: #606266;
  transition: all 0.3s;
}

.type-buttons .el-radio-button__orig-radio:checked + .el-radio-button__inner {
  background: #ffd700;
  border-color: #ffd700;
  color: #303133;
  font-weight: 600;
}

.qualification-instructions {
  margin-bottom: 16px;
}

.instructions {
  background: #f8f9fa;
  border-radius: 6px;
  padding: 16px;
}

.instruction-item {
  display: flex;
  align-items: flex-start;
  margin-bottom: 8px;
}

.instruction-item:last-child {
  margin-bottom: 0;
}

.instruction-item .number {
  color: #409eff;
  font-weight: 600;
  margin-right: 8px;
  min-width: 20px;
  line-height: 1.5;
  display: inline-block;
  vertical-align: top;
}

.instruction-item span:last-child {
  color: #606266;
  font-size: 14px;
  line-height: 1.5;
  display: inline-block;
  vertical-align: top;
  flex: 1;
}

.help-section {
  background: #fff7e6;
  border: 1px solid #ffd591;
  border-radius: 6px;
  padding: 12px 16px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s;
}

.help-section:hover {
  background: #fff2d9;
}

.help-section i {
  color: #fa8c16;
  margin-right: 8px;
  font-size: 16px;
}

.help-section span {
  color: #d46b08;
  font-size: 14px;
  font-weight: 500;
}

.upload-section {
  margin-bottom: 20px;
}

.upload-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 8px;
}

.upload-instruction {
  color: #909399;
  font-size: 14px;
  margin-bottom: 16px;
  line-height: 1.5;
}

.upload-area {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.qualification-upload {
  flex: 1;
}

.qualification-upload .el-upload--picture-card {
  width: 120px;
  height: 120px;
  border: 2px dashed #d9d9d9;
  border-radius: 8px;
  background: #fafafa;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
}

.qualification-upload .el-upload--picture-card:hover {
  border-color: #409eff;
  background: #f0f9ff;
}

.qualification-upload .el-upload--picture-card i {
  font-size: 32px;
  color: #c0c4cc;
  margin-bottom: 8px;
}

.upload-text {
  font-size: 12px;
  color: #909399;
}
.word-count {
  text-align: right;
  color: #909399;
  font-size: 12px;
  margin-top: 4px;
  line-height: 1;
}
</style>

