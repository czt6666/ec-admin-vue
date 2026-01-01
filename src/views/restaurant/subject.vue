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

    <!-- 新增/编辑对话框 -->
    <el-dialog
      :title="dialogTitle"
      :visible.sync="dialogVisible"
      width="720px"
      :close-on-click-modal="false"
      @close="resetForm"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="门店名称" prop="name">
          <el-input v-model="form.name" maxlength="100" />
          <div class="word-count">{{ (form.name || '').length }}/100</div>
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

        <!-- 门店Logo -->
        <el-form-item label="门店Logo">
          <el-upload
            ref="logoUpload"
            :auto-upload="false"
            :on-change="handleLogoChange"
            :on-remove="handleLogoRemove"
            :before-upload="beforeLogoUpload"
            :file-list="logoList"
            accept="image/*"
            :limit="1"
            action=""
            list-type="picture-card"
            :class="{ 'logo-upload-hidden': logoList.length >= 1 }"
          >
            <i class="el-icon-plus" />
            <div slot="tip" class="el-upload__tip">只能上传 jpg/png 文件，且不超过 2MB</div>
          </el-upload>
        </el-form-item>

        <!-- 门店地址 + 地图选址 -->
        <el-form-item label="门店地址" prop="address">
          <el-input
            v-model="form.address"
            maxlength="200"
            placeholder="请输入门店地址或使用地图选址"
            style="width: 320px"
          />
          <el-button type="primary" plain size="mini" @click="openMapDialog" style="margin-left: 8px;">
            地图选址
          </el-button>
          <el-button type="default" plain size="mini" @click="getCurrentLocation" style="margin-left: 4px;">
            获取当前位置
          </el-button>
        </el-form-item>

        <el-form-item label="联系电话" prop="phone">
          <el-input v-model="form.phone" maxlength="20" />
        </el-form-item>
        <el-form-item label="门店公告" prop="notice">
          <el-input
            type="textarea"
            v-model="form.notice"
            maxlength="300"
            :rows="3"
          />
          <div class="word-count">{{ (form.notice || '').length }}/300</div>
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

    <!-- 地图选择对话框 -->
    <el-dialog
      title="选择门店位置"
      :visible.sync="mapDialogVisible"
      width="80%"
      :before-close="closeMapDialog"
    >
      <div class="map-dialog-content">
        <!-- 地址搜索区域 -->
        <div class="map-search-container">
          <div class="search-input-wrapper">
            <el-input
              v-model="searchAddress"
              placeholder="请输入地址进行搜索定位"
              clearable
              @input="handleSearchInput"
              @focus="showSuggestions = true"
              @blur="handleSearchBlur"
              class="map-search-input"
            >
              <el-button
                slot="append"
                type="primary"
                icon="el-icon-search"
                @click="searchLocationByAddress"
                :loading="searchLoading"
              >
                搜索
              </el-button>
            </el-input>
            <!-- 地址建议下拉列表 -->
            <div v-if="showSuggestions && addressSuggestions.length > 0" class="address-suggestions">
              <div
                v-for="(item, index) in addressSuggestions"
                :key="index"
                class="suggestion-item"
                @mousedown="selectAddress(item)"
              >
                <i class="el-icon-location"></i>
                <div class="suggestion-content">
                  <div class="suggestion-name">{{ item.name }}</div>
                  <div class="suggestion-address">{{ item.address }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div id="restaurantMapContainer" style="width: 100%; height: 500px;"></div>
        <div class="map-info">
          <p>请在地图上点击选择位置，或使用上方搜索框输入地址进行定位</p>
          <p v-if="selectedLatitude && selectedLongitude">
            <strong>坐标：</strong>{{ selectedLatitude }}, {{ selectedLongitude }}
          </p>
          <p v-if="selectedAddress">
            <strong>地址：</strong>{{ selectedAddress }}
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
      // 地图相关
      mapDialogVisible: false,
      map: null,
      marker: null,
      selectedLatitude: null,
      selectedLongitude: null,
      selectedAddress: '',
      searchAddress: '',
      searchLoading: false,
      addressSuggestions: [],
      showSuggestions: false,
      autoComplete: null,
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
      this.baseUrl = process.env.VUE_APP_BASE_API || 'https://dzk.czt666.cn/api'
    },
    refreshUploadHeaders () {
      this.uploadHeaders = { token: getToken() || '' }
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
      const data = response && response.data ? response.data : {}
      if (data.filename) return data.filename
      if (response && response.filename) return response.filename
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
      const data = res && res.data ? res.data : {}
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
    async loadDetail (id) {
      try {
        const res = await getRestaurant(id)
        const data = res && res.data ? res.data : res
        this.form = {
          id: data.id || null,
          name: data.name || '',
          userId: data.userId ? Number(data.userId) : null,
          villageId: data.villageId ? Number(data.villageId) : null,
          status: data.status !== undefined && data.status !== null ? Number(data.status) : 1,
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
        if (this.form.logoUrl) {
          this.logoList = [{
            name: this.form.logoUrl.split('/').pop(),
            url: this.getImageUrl(this.form.logoUrl),
            status: 'success'
          }]
        } else {
          this.logoList = []
        }
        this.businessList = []
        this.foodList = []
        if (this.form.licenseUrls) {
          try {
            const licenses = JSON.parse(this.form.licenseUrls)
            if (Array.isArray(licenses)) {
              for (let i = 0; i < licenses.length; i++) {
                const item = licenses[i]
                if (item.type === 'business') {
                  this.businessList.push({
                    uid: 'business-' + i,
                    name: item.url ? item.url.split('/').pop() : 'business',
                    url: this.getImageUrl(item.url),
                    status: 'success'
                  })
                } else if (item.type === 'food') {
                  this.foodList.push({
                    uid: 'food-' + i,
                    name: item.url ? item.url.split('/').pop() : 'food',
                    url: this.getImageUrl(item.url),
                    status: 'success'
                  })
                }
              }
            }
          } catch (e) {
            console.error('解析证照图片失败', e)
          }
        }
        this.$nextTick(() => {
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
    handleLogoRemove (file, fileList) {
      this.logoList = fileList
    },
    beforeLogoUpload (file) {
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
    handleLicenseChange (type, file, fileList) {
      if (type === 'business') {
        this.businessList = fileList
      } else if (type === 'food') {
        this.foodList = fileList
      }
    },
    beforeLicenseUpload (file) {
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
    // 地图：打开弹窗
    openMapDialog () {
      this.mapDialogVisible = true
      this.$nextTick(() => {
        setTimeout(() => {
          this.initMap()
          this.initAutoComplete()
        }, 300)
      })
    },

    // 初始化自动完成功能
    initAutoComplete () {
      if (typeof AMap === 'undefined') {
        return
      }
      // 预留自动完成初始化
    },

    // 处理搜索输入
    handleSearchInput (value) {
      if (!value || !value.trim()) {
        this.addressSuggestions = []
        this.showSuggestions = false
        return
      }

      if (typeof AMap === 'undefined') {
        return
      }

      // 使用高德地图的PlaceSearch进行搜索建议
      AMap.plugin('AMap.PlaceSearch', () => {
        try {
          const placeSearch = new AMap.PlaceSearch({
            city: '全国',
            type: '',
            pageSize: 5,
            pageIndex: 1
          })

          placeSearch.search(value.trim(), (status, result) => {
            if (status === 'complete' && result.poiList && result.poiList.pois) {
              this.addressSuggestions = result.poiList.pois.map(poi => ({
                name: poi.name,
                address: poi.address || poi.district + poi.adname,
                location: poi.location,
                lng: poi.location.lng,
                lat: poi.location.lat
              }))
              this.showSuggestions = true
            } else {
              this.addressSuggestions = []
            }
          })
        } catch (error) {
          console.error('搜索建议获取失败:', error)
        }
      })
    },

    // 处理搜索框失焦
    handleSearchBlur () {
      setTimeout(() => {
        this.showSuggestions = false
      }, 200)
    },

    // 选择地址
    selectAddress (item) {
      this.searchAddress = item.name
      this.showSuggestions = false

      const lng = item.lng
      const lat = item.lat
      const address = item.address ? `${item.name} - ${item.address}` : item.name

      this.selectedLatitude = lat
      this.selectedLongitude = lng
      this.selectedAddress = address

      if (this.map) {
        const position = [lng, lat]
        this.map.setCenter(position)
        this.map.setZoom(16)

        if (this.marker) {
          this.map.remove(this.marker)
        }

        this.marker = new AMap.Marker({
          position: position,
          map: this.map,
          title: address
        })
      }

      this.$message.success('地址定位成功')
    },

    // 通过地址搜索位置
    searchLocationByAddress () {
      if (!this.searchAddress || !this.searchAddress.trim()) {
        this.$message.warning('请输入要搜索的地址')
        return
      }

      if (typeof AMap === 'undefined') {
        this.$message.error('高德地图API未加载，请检查网络连接')
        return
      }

      if (!this.map) {
        this.$message.warning('地图未初始化，请稍候再试')
        return
      }

      this.searchLoading = true

      AMap.plugin('AMap.Geocoder', () => {
        try {
          const geocoder = new AMap.Geocoder({
            city: '全国',
            radius: 1000
          })

          geocoder.getLocation(this.searchAddress.trim(), (status, result) => {
            this.searchLoading = false

            if (status === 'complete' && result.info === 'OK') {
              const geocode = result.geocodes[0]
              if (geocode) {
                const lng = geocode.location.lng
                const lat = geocode.location.lat
                const address = geocode.formattedAddress || this.searchAddress

                this.selectedLatitude = lat
                this.selectedLongitude = lng
                this.selectedAddress = address

                const position = [lng, lat]
                this.map.setCenter(position)
                this.map.setZoom(16)

                if (this.marker) {
                  this.map.remove(this.marker)
                }

                this.marker = new AMap.Marker({
                  position: position,
                  map: this.map,
                  title: address
                })

                this.$message.success('地址定位成功')
              } else {
                this.$message.warning('未找到该地址，请尝试更详细的地址信息')
              }
            } else {
              let errorMsg = '地址搜索失败'
              if (result && result.info) {
                if (result.info === 'INVALID_USER_SCODE') {
                  errorMsg = '安全密钥错误，请检查高德开放平台配置'
                } else {
                  errorMsg += '：' + result.info
                }
              }
              this.$message.error(errorMsg)
            }
          })
        } catch (error) {
          this.searchLoading = false
          console.error('地址搜索异常:', error)
          this.$message.error('地址搜索服务异常：' + error.message)
        }
      })
    },

    // 初始化高德地图
    initMap () {
      if (typeof AMap === 'undefined') {
        this.$message.error('高德地图API未加载，请检查网络连接')
        return
      }

      const container = document.getElementById('restaurantMapContainer')
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

        this.map = new AMap.Map('restaurantMapContainer', {
          zoom: 15,
          viewMode: '3D'
        })

        if (this.form.coordinateLat && this.form.coordinateLng) {
          const position = [this.form.coordinateLng, this.form.coordinateLat]
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
            this.selectedAddress = ''

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
                this.form.address = address
                this.selectedAddress = address
              } else {
                this.$message.warning('无法获取该位置的地址信息，请手动输入')
                this.selectedAddress = ''
              }
            } else {
              this.$message.warning('无法获取该位置的地址信息')
              this.selectedAddress = ''
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
              this.form.coordinateLat = lat
              this.form.coordinateLng = lng

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
      this.form.coordinateLat = null
      this.form.coordinateLng = null
      this.$message.info('已清除坐标')
    },

    confirmLocation () {
      if (this.selectedLatitude && this.selectedLongitude) {
        this.form.coordinateLat = this.selectedLatitude
        this.form.coordinateLng = this.selectedLongitude
        if (this.selectedAddress) {
          this.form.address = this.selectedAddress
        }
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
      this.selectedAddress = ''
      this.searchAddress = ''
      this.searchLoading = false
      this.addressSuggestions = []
      this.showSuggestions = false

      if (this.autoComplete) {
        this.autoComplete = null
      }

      if (this.marker && this.map) {
        this.map.remove(this.marker)
      }
      this.marker = null
      if (this.map) {
        this.map.destroy()
        this.map = null
      }
    },

    async handleSubmit () {
      this.$refs.formRef.validate(async valid => {
        if (!valid) return

        this.submitLoading = true
        try {
          // 1. Logo
          if (this.logoList.length > 0) {
            const logo = this.logoList[0]
            if (logo.raw) {
              const fileName = await this.uploadImage(logo.raw)
              this.form.logoUrl = '/uploads/' + fileName
            } else if (logo.url) {
              const match = /\/uploads\/[^/]+$/.exec(logo.url)
              this.form.logoUrl = match ? match[0] : logo.url
            }
          } else {
            this.form.logoUrl = ''
          }

          // 2. 证照
          const licenseArray = []
          for (let i = 0; i < this.businessList.length; i++) {
            const item = this.businessList[i]
            let url = ''
            if (item.raw) {
              const fileName = await this.uploadImage(item.raw)
              url = '/uploads/' + fileName
            } else if (item.url) {
              const match = /\/uploads\/[^/]+$/.exec(item.url)
              url = match ? match[0] : item.url
            }
            if (url) licenseArray.push({ type: 'business', url })
          }
          for (let i = 0; i < this.foodList.length; i++) {
            const item = this.foodList[i]
            let url = ''
            if (item.raw) {
              const fileName = await this.uploadImage(item.raw)
              url = '/uploads/' + fileName
            } else if (item.url) {
              const match = /\/uploads\/[^/]+$/.exec(item.url)
              url = match ? match[0] : item.url
            }
            if (url) licenseArray.push({ type: 'food', url })
          }
          this.form.licenseUrls = JSON.stringify(licenseArray)

          // 3. 提交
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
      this.$confirm('删除后，门店信息不可恢复，确认是否删除？', '删除确认', {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning',
        center: true,
        dangerouslyUseHTMLString: false,
        beforeClose: (action, instance, done) => {
          if (action === 'confirm') {
            instance.confirmButtonLoading = true
            deleteRestaurant(id)
              .then(() => {
                this.$message.success('删除成功')
                this.loadData()
                done()
              })
              .catch(() => {
                instance.confirmButtonLoading = false
                this.$message.error('删除失败')
              })
          } else {
            done()
          }
        }
      }).catch(() => {})
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

/* 坐标输入 */
.coord-inputs {
  display: flex;
  gap: 12px;
}

/* 灰色提示 */
.gray-tip {
  margin-top: 4px;
  font-size: 12px;
  color: #999;
}

/* 已有 Logo 时隐藏上传按钮（+） */
.logo-upload-hidden /deep/ .el-upload--picture-card {
  display: none;
}

/* 地图弹窗 */
.map-dialog-content {
  position: relative;
}

.map-search-container {
  margin-bottom: 15px;
}

.search-input-wrapper {
  position: relative;
  width: 100%;
}

.map-search-input {
  width: 100%;
}

.address-suggestions {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: #fff;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  z-index: 2000;
  max-height: 300px;
  overflow-y: auto;
  margin-top: 5px;
}

.suggestion-item {
  display: flex;
  align-items: flex-start;
  padding: 12px 15px;
  cursor: pointer;
  transition: background-color 0.2s;
  border-bottom: 1px solid #f5f7fa;
}

.suggestion-item:last-child {
  border-bottom: none;
}

.suggestion-item:hover {
  background-color: #f5f7fa;
}

.suggestion-item i {
  color: #409eff;
  font-size: 18px;
  margin-right: 10px;
  margin-top: 2px;
  flex-shrink: 0;
}

.suggestion-content {
  flex: 1;
  min-width: 0;
}

.suggestion-name {
  font-size: 14px;
  color: #303133;
  font-weight: 500;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.suggestion-address {
  font-size: 12px;
  color: #909399;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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

.word-count {
  text-align: right;
  color: #909399;
  font-size: 12px;
  margin-top: 4px;
  line-height: 1;
}
</style>

