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
      <el-table-column v-if="false" prop="id" label="ID" width="80" />
      <el-table-column label="封面" width="100">
        <template slot-scope="scope">
          <el-image
            v-if="scope.row.coverImage"
            :src="getImageUrl(scope.row.coverImage)"
            :preview-src-list="[getImageUrl(scope.row.coverImage)]"
            fit="cover"
            style="width: 60px; height: 40px; border-radius: 4px;"
            @error="handleImageError"
          />
          <span v-else style="color: #999; font-size: 12px;">暂无图片</span>
        </template>
      </el-table-column>
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
      <el-table-column prop="createTime" label="创建时间" width="160" />
      <el-table-column label="操作" width="200" fixed="right">
        <template slot-scope="scope">
          <div class="operation-buttons">
            <el-button size="mini" type="primary" @click="handleEdit(scope.row)">
              <i class="el-icon-edit"></i> 编辑
            </el-button>
            <el-button
              v-if="scope.row.linkAddress"
              size="mini"
              type="success"
              @click="viewOrders(scope.row)"
            >
              <i class="el-icon-view"></i> 查看订单
            </el-button>
            <el-button size="mini" type="danger" @click="handleDelete(scope.row)">
              <i class="el-icon-delete"></i> 删除
            </el-button>
          </div>
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
      width="900px"
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

        <!-- 地址输入 -->
        <el-form-item label="地址" prop="address">
          <el-input
            v-model="homestayForm.address"
            placeholder="请输入地址"
            style="width: 100%;"
          />
        </el-form-item>

        <!-- 经纬度输入区域 -->
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="纬度" prop="latitude">
              <el-input-number
                v-model="homestayForm.latitude"
                :precision="6"
                :min="-90"
                :max="90"
                placeholder="请输入纬度"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="经度" prop="longitude">
              <el-input-number
                v-model="homestayForm.longitude"
                :precision="6"
                :min="-180"
                :max="180"
                placeholder="请输入经度"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 地图定位区域 -->
        <el-form-item label="地图定位">
          <div class="map-container">
            <div class="map-buttons">
              <el-button size="small" type="primary" @click="openMapDialog">
                打开地图选择位置
              </el-button>
              <el-button size="small" @click="getCurrentLocation">
                获取当前位置
              </el-button>
              <el-button size="small" @click="clearCoordinates">
                清除坐标
              </el-button>
            </div>
            <div v-if="homestayForm.latitude && homestayForm.longitude" class="coordinates-display">
              <p>当前位置：纬度 {{ homestayForm.latitude }}, 经度 {{ homestayForm.longitude }}</p>
              <p v-if="homestayForm.address">地址：{{ homestayForm.address }}</p>
            </div>
          </div>
        </el-form-item>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="营业状态" prop="status">
              <el-select v-model="homestayForm.status" placeholder="请选择状态" style="width: 100%">
                <el-option label="营业" :value="1" />
                <el-option label="暂停营业" :value="2" />
                <el-option label="已下架" :value="3" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="星级" prop="starLevel">
              <el-rate
                v-model="homestayForm.starLevel"
                :max="5"
                show-text
                text-color="#ff9900"
                score-template="{value}星"
              />
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

        <!-- 订单链接设置 -->
        <el-form-item label="订单链接" prop="linkAddress">
          <el-input
            v-model="homestayForm.linkAddress"
            placeholder="请输入订单页面链接地址"
            style="width: 100%;"
          >
            <template slot="prepend">http://</template>
          </el-input>
          <div class="link-tip">
            <i class="el-icon-info"></i>
            设置后，用户可以通过"查看订单"按钮访问该民宿的订单页面
          </div>
        </el-form-item>

        <!-- 封面图上传 -->
        <el-form-item label="封面图" prop="coverImage">
          <el-upload
            ref="coverUpload"
            :auto-upload="false"
            :on-change="handleCoverImageChange"
            :before-upload="beforeCoverImageUpload"
            :file-list="coverImageList"
            accept="image/*"
            :limit="1"
            action=""
            list-type="picture-card"
          >
            <i class="el-icon-plus"></i>
            <div slot="tip" class="el-upload__tip">
              只能上传jpg/png文件，且不超过2MB
            </div>
          </el-upload>
        </el-form-item>

        <!-- 资质凭证上传 -->
        <el-form-item label="资质凭证" prop="qualificationImages">
          <div class="qualification-upload-container">
            <!-- 特别说明 -->
            <div class="special-notice">
              <i class="el-icon-info"></i>
              <span>特别说明：产权资质仅用于验证房源真实与合法性，不会用于任何对外展示、宣传上，请上传真实有效的、可证明房屋产权归属的资质图片，图片中<strong style="color: #F56C6C;">必须包含完整且清晰可见的房屋地址信息！</strong></span>
            </div>

            <!-- 资质类型选择 -->
            <div class="qualification-types">
              <div class="type-title">资质类型1</div>
              <el-radio-group v-model="selectedQualificationType" class="type-buttons">
                <el-radio-button label="property">房产证</el-radio-button>
                <el-radio-button label="lease">租赁合同</el-radio-button>
                <el-radio-button label="utility">水/电/燃气缴费记录</el-radio-button>
                <el-radio-button label="other">其他</el-radio-button>
              </el-radio-group>
            </div>

            <!-- 资质说明 -->
            <div class="qualification-instructions">
              <div v-if="selectedQualificationType === 'property'" class="instructions">
                <div class="instruction-item">
                  <span class="number">1.</span>
                  <span>房产证中地址必须与房源所填写详细地址、户型结构、面积保持一致</span>
                </div>
                <div class="instruction-item">
                  <span class="number">2.</span>
                  <span>若房东存在多套房源请上传多张证书</span>
                </div>
              </div>
              <div v-if="selectedQualificationType === 'lease'" class="instructions">
                <div class="instruction-item">
                  <span class="number">1.</span>
                  <span>租赁合同必须包含完整的房屋地址信息</span>
                </div>
                <div class="instruction-item">
                  <span class="number">2.</span>
                  <span>合同期限应覆盖民宿经营期间</span>
                </div>
              </div>
              <div v-if="selectedQualificationType === 'utility'" class="instructions">
                <div class="instruction-item">
                  <span class="number">1.</span>
                  <span>缴费记录必须显示完整的房屋地址</span>
                </div>
                <div class="instruction-item">
                  <span class="number">2.</span>
                  <span>记录时间应在最近6个月内</span>
                </div>
              </div>
              <div v-if="selectedQualificationType === 'other'" class="instructions">
                <div class="instruction-item">
                  <span class="number">1.</span>
                  <span>其他资质文件必须包含房屋地址信息</span>
                </div>
                <div class="instruction-item">
                  <span class="number">2.</span>
                  <span>文件应能证明房屋使用权或所有权</span>
                </div>
              </div>
            </div>

            <!-- 帮助信息 -->
            <div class="help-section">
              <i class="el-icon-question"></i>
              <span>什么样的资质符合平台审核标准？</span>
            </div>

            <!-- 图片上传区域 -->
            <div class="upload-section">
              <div class="upload-title">{{ getQualificationTypeName(selectedQualificationType) }}</div>
              <div class="upload-instruction">
                请将含有地址信息的图片上传为第一张图片，此图片将会用于房屋资质审核
              </div>
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
                  <i class="el-icon-camera"></i>
                  <div class="upload-text">{{ getCurrentQualificationImages().length }}/15</div>
                </el-upload>
              </div>
            </div>
          </div>
        </el-form-item>

        <el-form-item label="民宿简介">
          <el-input
            v-model="homestayForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入民宿简介、特色亮点"
          />
        </el-form-item>
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">确定</el-button>
      </div>
    </el-dialog>

    <!-- 地图选择对话框 -->
    <el-dialog
      title="选择位置"
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
        <div id="mapContainer" style="width: 100%; height: 500px;"></div>
        <div class="map-info">
          <p>请在地图上点击选择位置，或使用上方搜索框输入地址进行定位</p>
          <p v-if="selectedLatitude && selectedLongitude">
            选中位置：纬度 {{ selectedLatitude }}, 经度 {{ selectedLongitude }}
          </p>
          <p v-if="selectedAddress">
            地址：{{ selectedAddress }}
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
import { getHomestayList, addHomestay, updateHomestay, deleteHomestay } from '@/api/homestay'
import { getVillageList } from '@/api/village'
import request from '@/utils/request'

export default {
  name: 'VillageHomestayList',

  data() {
    return {
      loading: false,
      villageLoading: false,
      mapDialogVisible: false,
      homestayList: [],
      villageList: [],
      total: 0,
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
      coverImageList: [],
      // 分类存储每个资质类型的图片
      qualificationImagesByType: {
        property: [],
        lease: [],
        utility: [],
        other: []
      },
      selectedQualificationType: 'property',
      baseUrl: '',
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
        latitude: null,
        longitude: null,
        coverImage: '',
        qualificationImages: '',
        linkAddress: ''
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
        contactPhone: [
          { required: true, message: '请输入负责人电话', trigger: 'blur' },
          { pattern: /^1[3-9]\d{9}$/, message: '请输入以1开头的11位手机号码', trigger: 'blur' }
        ]
      }
    }
  },

  created() {
    console.log('=== 组件创建，开始获取数据 ===')
    this.getBaseUrl()
    this.getVillageList()
    this.getList()
  },

  methods: {
    // 获取基础URL - 修改：与餐饮模块保持一致
    getBaseUrl() {
      this.baseUrl = process.env.VUE_APP_BASE_API || 'https://dzk.czt666.cn/api'
      console.log('基础URL:', this.baseUrl)
    },

    // 获取图片完整URL
    getImageUrl(imagePath) {
      if (!imagePath) return ''

      console.log('原始图片路径:', imagePath)

      // 如果已经是完整URL，直接返回
      if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        console.log('完整URL，直接返回:', imagePath)
        return imagePath
      }

      // 如果是相对路径，拼接基础URL
      if (imagePath.startsWith('/uploads/')) {
        const fullUrl = this.baseUrl + imagePath
        console.log('相对路径，拼接后:', fullUrl)
        return fullUrl
      }

      // 如果只是文件名，添加默认路径
      const fullUrl = this.baseUrl + '/uploads/' + imagePath
      console.log('文件名，添加路径后:', fullUrl)
      return fullUrl
    },

    // 图片加载错误处理
    handleImageError(event) {
      console.log('图片加载失败:', event.target.src)
    },

    // 上传图片到服务器
    async uploadImage(file) {
      const formData = new FormData()
      formData.append('file', file)

      try {
        const response = await request({
          url: '/api/file/upload',
          method: 'post',
          data: formData,
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })

        console.log('图片上传响应:', response)

        // 根据您的后端接口，返回的数据结构是 { filename, originalName, size, url }
        if (response && response.filename) {
          return response.filename
        } else if (response && response.data && response.data.filename) {
          return response.data.filename
        } else {
          throw new Error('上传响应格式错误')
        }
      } catch (error) {
        console.error('图片上传失败:', error)
        this.$message.error('图片上传失败')
        throw error
      }
    },

    // 获取乡村列表
    getVillageList() {
      console.log('=== 开始获取乡村列表 ===')
      this.villageLoading = true

      getVillageList().then(response => {
        console.log('=== 乡村列表API响应 ===')
        console.log('完整响应：', response)

        if (Array.isArray(response)) {
          this.villageList = response
          console.log('=== 乡村数据设置成功 ===')
        } else if (response && response.code === 200) {
          this.villageList = response.data || []
          console.log('=== 乡村数据设置成功（标准格式）===')
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
      this.loading = true

      getHomestayList(this.queryParams).then(response => {
        console.log('=== 民宿列表API响应 ===')
        console.log('完整响应：', response)

        if (Array.isArray(response)) {
          this.homestayList = response
          this.total = response.length
        } else if (response.code === 200) {
          this.homestayList = response.data.records || []
          this.total = response.data.total
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
      console.log('=== handleEdit 被调用 ===', row)

      if (!row || !row.id) {
        this.$message.error('数据错误，无法编辑')
        return
      }

      this.dialogTitle = '编辑民宿'
      this.dialogVisible = true
      this.homestayForm = { ...row }

      // 处理封面图
      if (row.coverImage) {
        this.coverImageList = [{
          name: 'cover.jpg',
          url: this.getImageUrl(row.coverImage)
        }]
      } else {
        this.coverImageList = []
      }

      // 处理资质凭证图片 - 分类加载
      this.loadQualificationImagesByType(row.qualificationImages)
    },

    // 加载分类的资质图片
    loadQualificationImagesByType(qualificationImages) {
      // 重置所有类型的图片
      this.qualificationImagesByType = {
        property: [],
        lease: [],
        utility: [],
        other: []
      }

      if (qualificationImages) {
        try {
          const imagesData = JSON.parse(qualificationImages)
          if (Array.isArray(imagesData)) {
            // 如果是旧格式（只有图片文件名数组），默认归类到房产证
            imagesData.forEach((img, index) => {
              this.qualificationImagesByType.property.push({
                name: `property_${index + 1}.jpg`,
                url: this.getImageUrl(img)
              })
            })
          } else if (typeof imagesData === 'object') {
            // 如果是新格式（按类型分类的对象）
            Object.keys(imagesData).forEach(type => {
              if (this.qualificationImagesByType[type] && Array.isArray(imagesData[type])) {
                this.qualificationImagesByType[type] = imagesData[type].map((img, index) => ({
                  name: `${type}_${index + 1}.jpg`,
                  url: this.getImageUrl(img)
                }))
              }
            })
          }
        } catch (e) {
          console.error('解析资质凭证图片失败:', e)
        }
      }
    },

    // 获取当前选中类型的图片列表
    getCurrentQualificationImages() {
      return this.qualificationImagesByType[this.selectedQualificationType] || []
    },

    // 查看订单
    viewOrders(row) {
      if (row.linkAddress) {
        window.open(row.linkAddress, '_blank')
      } else {
        this.$message.warning('该民宿未设置订单页面链接')
      }
    },

    // 删除
    handleDelete(row) {
      console.log('=== handleDelete 被调用 ===', row)

      if (!row || !row.id) {
        this.$message.error('数据错误，无法删除')
        return
      }

      this.$confirm('确定要删除该民宿吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        console.log('确认删除，id:', row.id)

        deleteHomestay(row.id).then(response => {
          console.log('删除响应:', response)

          // 修复响应处理逻辑 - 支持多种响应格式
          const isSuccess = Array.isArray(response) ||
            (response && (response.code === 1 || response.code === 200 || response.code === '200')) ||
            (response && response.data) ||
            (response && !response.msg && !response.message) ||
            (!response) // 空响应也认为成功

          if (isSuccess) {
            this.$message.success('删除成功')
            this.getList() // 刷新列表
          } else {
            this.$message.error(response.msg || response.message || '删除失败')
          }
        }).catch(error => {
          console.error('删除失败:', error)
          // 如果错误响应中有数据，可能也是成功
          if (error.response && error.response.status === 200) {
            this.$message.success('删除成功')
            this.getList()
          } else {
            this.$message.error(error.message || '删除失败')
          }
        })
      }).catch(() => {
        console.log('取消删除')
      })
    },

    // 提交表单 - 修改：保存时添加 /uploads/ 前缀
    async submitForm() {
      this.$refs.homestayForm.validate(async (valid) => {
        if (valid) {
          try {
            // 处理封面图上传 - 修改：添加 /uploads/ 前缀
            if (this.coverImageList.length > 0) {
              const coverImage = this.coverImageList[0]
              if (coverImage.raw) {
                console.log('上传封面图:', coverImage.name)
                const fileName = await this.uploadImage(coverImage.raw)
                this.homestayForm.coverImage = '/uploads/' + fileName
              } else if (coverImage.url) {
                // 如果已有URL，提取 /uploads/ 路径部分
                const match = /\/uploads\/[^/]+$/.exec(coverImage.url)
                this.homestayForm.coverImage = match ? match[0] : coverImage.url
              }
            } else {
              this.homestayForm.coverImage = ''
            }

            // 处理资质凭证图片上传 - 修改：添加 /uploads/ 前缀
            const qualificationImagesData = {}
            for (const type in this.qualificationImagesByType) {
              const images = []
              for (const item of this.qualificationImagesByType[type]) {
                if (item.raw) {
                  console.log(`上传${type}资质图片:`, item.name)
                  const fileName = await this.uploadImage(item.raw)
                  images.push('/uploads/' + fileName)
                } else if (item.url) {
                  // 如果已有URL，提取 /uploads/ 路径部分
                  const match = /\/uploads\/[^/]+$/.exec(item.url)
                  images.push(match ? match[0] : item.url)
                }
              }
              if (images.length > 0) {
                qualificationImagesData[type] = images
              }
            }
            this.homestayForm.qualificationImages = JSON.stringify(qualificationImagesData)

            console.log('提交的表单数据:', this.homestayForm)

            const api = this.homestayForm.id ? updateHomestay : addHomestay
            const response = await api(this.homestayForm)

            console.log('提交响应：', response)

            // 修复响应处理逻辑 - 支持多种响应格式
            const isSuccess = Array.isArray(response) ||
              (response && (response.code === 1 || response.code === 200 || response.code === '200')) ||
              (response && response.data) ||
              (response && !response.msg && !response.message) ||
              (!response) // 空响应也认为成功

            if (isSuccess) {
              this.$message.success(this.homestayForm.id ? '更新成功' : '新增成功')
              this.dialogVisible = false
              this.resetForm() // 重置表单
              this.getList() // 刷新列表
            } else {
              this.$message.error(response.msg || response.message || '操作失败')
            }
          } catch (error) {
            console.error('提交失败:', error)
            // 如果错误响应中有数据，可能也是成功
            if (error.response && error.response.status === 200) {
              this.$message.success(this.homestayForm.id ? '更新成功' : '新增成功')
              this.dialogVisible = false
              this.resetForm()
              this.getList()
            } else {
              this.$message.error(error.message || '操作失败')
            }
          }
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
        latitude: null,
        longitude: null,
        coverImage: '',
        qualificationImages: '',
        linkAddress: ''
      }
      this.coverImageList = []
      this.qualificationImagesByType = {
        property: [],
        lease: [],
        utility: [],
        other: []
      }
      this.selectedQualificationType = 'property'

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
    },

    // 获取资质类型名称
    getQualificationTypeName(type) {
      const typeMap = {
        property: '房产证',
        lease: '租赁合同',
        utility: '水/电/燃气缴费记录',
        other: '其他'
      }
      return typeMap[type] || '房产证'
    },

    // 地图相关方法
    openMapDialog() {
      this.mapDialogVisible = true
      this.$nextTick(() => {
        setTimeout(() => {
          this.initMap()
          this.initAutoComplete()
        }, 300)
      })
    },

    // 初始化自动完成功能
    initAutoComplete() {
      if (typeof AMap === 'undefined') {
        return
      }

      AMap.plugin('AMap.AutoComplete', () => {
        try {
          this.autoComplete = new AMap.AutoComplete({
            city: '全国',
            input: 'searchAddress' // 这里不使用input绑定，而是手动调用
          })
        } catch (error) {
          console.error('自动完成初始化失败:', error)
        }
      })
    },

    // 处理搜索输入
    handleSearchInput(value) {
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
            type: '', // 不限制类型
            pageSize: 5, // 最多显示5个建议
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
    handleSearchBlur() {
      // 延迟隐藏，以便点击建议项时能触发选择
      setTimeout(() => {
        this.showSuggestions = false
      }, 200)
    },

    // 选择地址
    selectAddress(item) {
      this.searchAddress = item.name
      this.showSuggestions = false

      // 定位到选中的地址
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

        // 移除旧标记
        if (this.marker) {
          this.map.remove(this.marker)
        }

        // 添加新标记
        this.marker = new AMap.Marker({
          position: position,
          map: this.map,
          title: address
        })
      }

      this.$message.success('地址定位成功')
    },

    initMap() {
      if (typeof AMap === 'undefined') {
        this.$message.error('高德地图API未加载，请检查网络连接')
        return
      }

      const container = document.getElementById("mapContainer")
      if (!container) {
        this.$message.error('地图容器不存在')
        return
      }

      if (container.offsetWidth === 0 || container.offsetHeight === 0) {
        setTimeout(() => {
          this.initMap()
        }, 200)
        return
      }

      try {
        if (this.map) {
          this.map.destroy()
          this.map = null
        }

        this.map = new AMap.Map("mapContainer", {
          zoom: 15,
          viewMode: '3D',
          pitch: 0,
          rotation: 0
        })

        if (this.homestayForm.latitude && this.homestayForm.longitude) {
          const position = [this.homestayForm.longitude, this.homestayForm.latitude]
          this.map.setCenter(position)
          this.map.setZoom(15)

          this.marker = new AMap.Marker({
            position: position,
            map: this.map
          })
        } else {
          this.map.setCenter([116.397428, 39.90923])
          this.map.setZoom(11)
        }

        AMap.plugin(['AMap.Scale', 'AMap.ToolBar'], () => {
          this.map.addControl(new AMap.Scale({
            position: 'LB'
          }))

          this.map.addControl(new AMap.ToolBar({
            position: 'RT'
          }))
        })

        this.map.on('complete', () => {
          console.log('地图加载完成')

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

            // 获取地址
            this.getAddressByCoordinates(lat, lng)

            // 更新选中地址
            this.selectedAddress = ''
          })
        })

        console.log('地图初始化成功')
      } catch (error) {
        console.error('地图初始化失败:', error)
        this.$message.error('地图初始化失败：' + error.message)
      }
    },

    // 通过坐标获取地址（使用高德地图JS API地理编码）
    getAddressByCoordinates(lat, lng) {
      console.log('开始获取地址，坐标:', lat, lng)

      // 验证坐标
      if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
        this.$message.warning('坐标无效，无法获取地址')
        return
      }

      // 检查AMap是否加载
      if (typeof AMap === 'undefined') {
        this.$message.error('高德地图API未加载，请检查网络连接')
        return
      }

      // 加载地理编码插件
      AMap.plugin('AMap.Geocoder', () => {
        try {
          const geocoder = new AMap.Geocoder({
            city: '全国',
            radius: 1000,
            extensions: 'all'
          })

          geocoder.getAddress([lng, lat], (status, result) => {
            console.log('地理编码状态:', status, '结果:', result)

            if (status === 'complete' && result.info === 'OK') {
              let address = result.regeocode.formattedAddress

              if (!address || address === '') {
                const addrComponent = result.regeocode.addressComponent
                const parts = []

                if (addrComponent.province) parts.push(addrComponent.province)
                if (addrComponent.city) parts.push(addrComponent.city)
                if (addrComponent.district) parts.push(addrComponent.district)
                if (addrComponent.township) parts.push(addrComponent.township)
                if (addrComponent.street) parts.push(addrComponent.street)
                if (addrComponent.streetNumber) parts.push(addrComponent.streetNumber)

                address = parts.join('')
              }

              if (address && address !== '') {
                this.homestayForm.address = address
                this.selectedAddress = address
                this.$message.success('地址获取成功')
              } else {
                this.$message.warning('无法获取该位置的地址信息，请手动输入')
                this.selectedAddress = ''
              }
            } else {
              console.error('地理编码失败:', status, result)

              if (result && result.info === 'INVALID_USER_SCODE') {
                this.$message.error('安全密钥错误，请检查高德开放平台控制台中的安全密钥配置')
              } else {
                this.$message.warning('无法获取该位置的地址信息：' + (result.info || '未知错误'))
              }
            }
          })
        } catch (error) {
          console.error('地理编码异常:', error)
          this.$message.error('地理编码服务异常：' + error.message)
        }
      })
    },

    // 获取当前位置 - 使用高德地图定位API（支持HTTP环境）
    getCurrentLocation() {
      // 检查高德地图API是否加载
      if (typeof AMap === 'undefined') {
        this.$message.error('高德地图API未加载，请检查网络连接')
        return
      }

      // 加载定位插件
      AMap.plugin('AMap.Geolocation', () => {
        try {
          const geolocation = new AMap.Geolocation({
            enableHighAccuracy: true, // 是否使用高精度定位
            timeout: 10000, // 超时时间
            maximumAge: 0, // 定位结果缓存时间
            convert: true, // 自动偏移坐标
            showButton: false, // 不显示定位按钮
            buttonDom: null,
            showMarker: false,
            showCircle: false,
            panToLocation: false,
            zoomToAccuracy: false
          })

          // 获取当前位置
          geolocation.getCurrentPosition((status, result) => {
            console.log('定位状态:', status, '结果:', result)

            if (status === 'complete') {
              // 定位成功
              const lat = result.position.lat
              const lng = result.position.lng

              this.homestayForm.latitude = lat
              this.homestayForm.longitude = lng

              // 如果地图已打开，更新地图中心点和标记
              if (this.map) {
                const position = [lng, lat]
                this.map.setCenter(position)
                this.map.setZoom(15)

                if (this.marker) {
                  this.map.remove(this.marker)
                }

                this.marker = new AMap.Marker({
                  position: position,
                  map: this.map
                })
              }

              // 获取地址
              this.getAddressByCoordinates(lat, lng)
              this.$message.success('获取当前位置成功')
            } else {
              // 定位失败
              console.error('定位失败:', result)
              let errorMsg = '获取当前位置失败'

              if (result && result.message) {
                errorMsg += '：' + result.message
              } else if (status === 'error') {
                errorMsg += '：定位服务异常，请检查网络连接或浏览器定位权限'
              } else if (status === 'timeout') {
                errorMsg += '：定位超时，请重试'
              }

              this.$message.error(errorMsg)
            }
          })
        } catch (error) {
          console.error('定位异常:', error)
          this.$message.error('定位服务异常：' + error.message)
        }
      })
    },

    // 清除坐标
    clearCoordinates() {
      this.homestayForm.latitude = null
      this.homestayForm.longitude = null
      this.homestayForm.address = ''
      this.$message.info('已清除坐标和地址')
    },

    // 确认位置选择
    confirmLocation() {
      if (this.selectedLatitude && this.selectedLongitude) {
        this.homestayForm.latitude = this.selectedLatitude
        this.homestayForm.longitude = this.selectedLongitude
        if (this.selectedAddress) {
          this.homestayForm.address = this.selectedAddress
        }
        this.$message.success('位置选择成功')
        this.closeMapDialog()
      } else {
        this.$message.warning('请先在地图上选择位置')
      }
    },

    // 通过地址搜索位置
    searchLocationByAddress() {
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

      // 使用高德地图地理编码服务进行地址搜索
      AMap.plugin('AMap.Geocoder', () => {
        try {
          const geocoder = new AMap.Geocoder({
            city: '全国', // 全国范围搜索
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

                // 设置选中位置
                this.selectedLatitude = lat
                this.selectedLongitude = lng
                this.selectedAddress = address

                // 移动地图中心到该位置
                const position = [lng, lat]
                this.map.setCenter(position)
                this.map.setZoom(16)

                // 移除旧标记
                if (this.marker) {
                  this.map.remove(this.marker)
                }

                // 添加新标记
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
              console.error('地址搜索失败:', status, result)
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

    // 关闭地图对话框
    closeMapDialog() {
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

      if (this.marker) {
        if (this.map) {
          this.map.remove(this.marker)
        }
        this.marker = null
      }

      if (this.map) {
        this.map.destroy()
        this.map = null
      }
    },

    // 图片上传相关方法
    handleCoverImageChange(file, fileList) {
      this.coverImageList = fileList
    },

    beforeCoverImageUpload(file) {
      const isImage = file.type.startsWith('image/')
      const isLt2M = file.size / 1024 / 1024 < 2

      if (!isImage) {
        this.$message.error('只能上传图片文件!')
        return false
      }
      if (!isLt2M) {
        this.$message.error('图片大小不能超过2MB!')
        return false
      }
      return false
    },

    handleQualificationImageChange(file, fileList) {
      // 更新当前选中类型的图片列表
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
        this.$message.error('图片大小不能超过2MB!')
        return false
      }
      return false
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

.map-container {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 10px;
}

.map-buttons {
  margin-bottom: 10px;
}

.map-buttons .el-button {
  margin-right: 10px;
}

.coordinates-display {
  background-color: #f5f7fa;
  padding: 8px;
  border-radius: 4px;
  margin-top: 10px;
}

.coordinates-display p {
  margin: 0;
  color: #606266;
  font-size: 14px;
}

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

.link-tip {
  margin-top: 5px;
  color: #909399;
  font-size: 12px;
}

.link-tip i {
  margin-right: 4px;
}

/* 操作按钮样式优化 - 修复对齐问题 */
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

/* 按钮颜色优化 */
.operation-buttons .el-button--primary {
  background-color: #409EFF;
  border-color: #409EFF;
}

.operation-buttons .el-button--success {
  background-color: #67C23A;
  border-color: #67C23A;
}

.operation-buttons .el-button--danger {
  background-color: #F56C6C;
  border-color: #F56C6C;
}

/* 确保按钮在表格单元格中正确对齐 */
.el-table .cell {
  padding: 8px;
}

.operation-buttons {
  padding: 0;
  margin: 0;
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

/* 修复数字与文字对齐问题 */
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
</style>

