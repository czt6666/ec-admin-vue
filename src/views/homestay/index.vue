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
      <el-table-column prop="latitude" label="纬度" width="100" />
      <el-table-column prop="longitude" label="经度" width="100" />
      <el-table-column label="操作" width="200" fixed="right">
        <template slot-scope="scope">
          <el-button size="mini" @click="handleEdit(scope.row)">编辑</el-button>
          <el-button
            v-if="scope.row.linkAddress"
            size="mini"
            type="success"
            @click="viewOrders(scope.row)"
          >
            查看订单
          </el-button>
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

        <el-form-item label="地址" prop="address">
          <el-input v-model="homestayForm.address" placeholder="请输入地址" />
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
            </div>
          </div>
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
              <el-rate
                v-model="homestayForm.starLevel"
                :max="5"
                show-text
                text-color="#ff9900"
                text-template="{value}星"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="链接地址" prop="linkAddress">
              <el-input v-model="homestayForm.linkAddress" placeholder="请输入链接地址" />
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
          <el-upload
            ref="qualificationUpload"
            :auto-upload="false"
            :on-change="handleQualificationImageChange"
            :before-upload="beforeQualificationImageUpload"
            :file-list="qualificationImageList"
            accept="image/*"
            :limit="5"
            action=""
            list-type="picture-card"
          >
            <i class="el-icon-plus"></i>
            <div slot="tip" class="el-upload__tip">
              最多上传5张图片，支持jpg/png格式，每张不超过2MB
            </div>
          </el-upload>
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
        <div id="mapContainer" style="width: 100%; height: 500px;"></div>
        <div class="map-info">
          <p>请在地图上点击选择位置</p>
          <p v-if="selectedLatitude && selectedLongitude">
            选中位置：纬度 {{ selectedLatitude }}, 经度 {{ selectedLongitude }}
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
      coverImageList: [],
      qualificationImageList: [],
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

      // 处理封面图
      if (row.coverImage) {
        this.coverImageList = [{
          name: 'cover.jpg',
          url: row.coverImage
        }]
      }

      // 处理资质凭证图片
      if (row.qualificationImages) {
        try {
          const images = JSON.parse(row.qualificationImages)
          this.qualificationImageList = images.map((img, index) => ({
            name: `qualification_${index + 1}.jpg`,
            url: img
          }))
        } catch (e) {
          console.error('解析资质凭证图片失败:', e)
        }
      }
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
          // 处理封面图
          if (this.coverImageList.length > 0) {
            this.homestayForm.coverImage = this.coverImageList[0].url
          }

          // 处理资质凭证图片
          if (this.qualificationImageList.length > 0) {
            const images = this.qualificationImageList.map(item => item.url)
            this.homestayForm.qualificationImages = JSON.stringify(images)
          }

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
        latitude: null,
        longitude: null,
        coverImage: '',
        qualificationImages: '',
        linkAddress: ''
      }
      this.coverImageList = []
      this.qualificationImageList = []
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

    // 地图相关方法
    openMapDialog() {
      this.mapDialogVisible = true
      this.$nextTick(() => {
        this.initMap()
      })
    },

    initMap() {
      if (window.AMap) {
        this.map = new AMap.Map('mapContainer', {
          zoom: 13,
          center: this.homestayForm.latitude && this.homestayForm.longitude
            ? [this.homestayForm.longitude, this.homestayForm.latitude]
            : [116.397428, 39.90923]
        })

        this.map.on('click', (e) => {
          this.selectedLatitude = e.lnglat.getLat()
          this.selectedLongitude = e.lnglat.getLng()

          if (this.marker) {
            this.map.remove(this.marker)
          }

          this.marker = new AMap.Marker({
            position: [this.selectedLongitude, this.selectedLatitude],
            title: '选中位置'
          })
          this.map.add(this.marker)
        })

        if (this.homestayForm.latitude && this.homestayForm.longitude) {
          this.selectedLatitude = this.homestayForm.latitude
          this.selectedLongitude = this.homestayForm.longitude
          this.marker = new AMap.Marker({
            position: [this.homestayForm.longitude, this.homestayForm.latitude],
            title: '当前位置'
          })
          this.map.add(this.marker)
        }
      } else {
        this.$message.error('地图API未加载，请检查网络连接')
      }
    },

    getCurrentLocation() {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            this.homestayForm.latitude = position.coords.latitude
            this.homestayForm.longitude = position.coords.longitude
            this.$message.success('获取当前位置成功')
          },
          (error) => {
            this.$message.error('获取当前位置失败：' + error.message)
          }
        )
      } else {
        this.$message.error('浏览器不支持地理位置获取')
      }
    },

    clearCoordinates() {
      this.homestayForm.latitude = null
      this.homestayForm.longitude = null
      this.$message.info('已清除坐标')
    },

    confirmLocation() {
      if (this.selectedLatitude && this.selectedLongitude) {
        this.homestayForm.latitude = this.selectedLatitude
        this.homestayForm.longitude = this.selectedLongitude
        this.$message.success('位置选择成功')
        this.closeMapDialog()
      } else {
        this.$message.warning('请先在地图上选择位置')
      }
    },

    closeMapDialog() {
      this.mapDialogVisible = false
      this.selectedLatitude = null
      this.selectedLongitude = null
      if (this.marker) {
        this.map.remove(this.marker)
        this.marker = null
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
      this.qualificationImageList = fileList
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
</style>
