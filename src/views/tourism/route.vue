<template>
  <div class="page">
    <el-card>
      <div slot="header" class="header">
        <div class="filters">
          <el-input
            v-model="query.name"
            placeholder="路线名称"
            clearable
            style="width: 200px; margin-right: 10px"
          />
          <el-select v-model="query.companyId" placeholder="选择公司" clearable style="width: 200px; margin-right: 10px">
            <el-option v-for="company in companyOptions" :key="company.id" :label="company.name" :value="company.id" />
          </el-select>
          <el-select v-model="query.bizStatus" placeholder="经营状态" clearable style="width: 150px; margin-right: 10px">
            <el-option label="发布" :value="1" />
            <el-option label="待审核" :value="2" />
          </el-select>
          <el-button type="primary" icon="el-icon-search" @click="handleSearch">搜索</el-button>
          <el-button icon="el-icon-refresh" @click="handleReset">重置</el-button>
        </div>
        <el-button type="primary" icon="el-icon-plus" @click="openDialog()">新增路线</el-button>
      </div>

      <el-table :data="tableData" border stripe>
        <el-table-column type="index" label="序号" width="60" />
        <el-table-column prop="name" label="路线名称" min-width="200" show-overflow-tooltip />
        <el-table-column prop="companyName" label="所属公司" min-width="180" show-overflow-tooltip>
          <template slot-scope="scope">
            <span>{{ scope.row.companyName || '—' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="routeType" label="类型" min-width="140" />
        <el-table-column prop="themeTags" label="主题标签" min-width="200" show-overflow-tooltip />
        <el-table-column prop="days" label="行程天数" width="100" align="center" />
        <el-table-column prop="difficulty" label="难度" width="120" />
        <el-table-column prop="priceRange" label="价格区间" min-width="140" />
        <el-table-column prop="bizStatus" label="经营状态" width="110">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.bizStatus === 1 || scope.row.bizStatus === '1'" type="success">发布</el-tag>
            <el-tag v-else-if="scope.row.bizStatus === 2 || scope.row.bizStatus === '2' || scope.row.bizStatus === 3 || scope.row.bizStatus === '3'" type="info">待审核</el-tag>
            <span v-else>—</span>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" min-width="170" />
        <el-table-column label="操作" width="250" fixed="right">
          <template slot-scope="scope">
            <el-button type="primary" size="mini" @click="openDialog(scope.row)">编辑</el-button>
            <el-button
              v-if="isAdmin && (scope.row.bizStatus === 2 || scope.row.bizStatus === '2' || scope.row.bizStatus === 3 || scope.row.bizStatus === '3')"
              size="mini"
              type="success"
              @click="handlePublish(scope.row)"
            >
              <i class="el-icon-check"></i> 上架
            </el-button>
            <el-button
              v-if="isAdmin && (scope.row.bizStatus === 1 || scope.row.bizStatus === '1')"
              size="mini"
              type="warning"
              @click="handleUnpublish(scope.row)"
            >
              <i class="el-icon-close"></i> 下架
            </el-button>
            <el-button type="danger" size="mini" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pager">
        <el-pagination
          :current-page="pagination.page"
          :page-size="pagination.pageSize"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          :page-sizes="[10, 20, 50]"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>

    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="1000px" :close-on-click-modal="false">
      <el-form ref="form" :model="form" :rules="rules" label-width="140px" label-position="right">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="路线名称" prop="name">
              <el-input v-model="form.name" maxlength="200" />
              <div class="word-count">{{ (form.name || '').length }}/200</div>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="所属公司">
              <el-select v-model="form.companyId" placeholder="请选择公司" filterable clearable style="width: 100%">
                <el-option v-for="company in companyOptions" :key="company.id" :label="company.name" :value="company.id" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="类型">
              <el-select v-model="form.routeType" placeholder="选择或输入" filterable allow-create clearable style="width: 100%">
                <el-option v-for="opt in routeTypeOptions" :key="opt.id" :label="opt.typeName || opt.name" :value="opt.typeName || opt.name" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="主题标签">
              <el-select
                v-model="themeTagsArray"
                multiple
                filterable
                allow-create
                default-first-option
                collapse-tags
                placeholder="可多选，逗号分隔存储"
                style="width: 100%"
              >
                <el-option v-for="opt in routeThemeOptions" :key="opt.id" :label="opt.themeName || opt.name" :value="opt.themeName || opt.name" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="行程天数">
              <el-input-number v-model="form.days" :min="0" :max="365" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="行程难度">
              <el-input v-model="form.difficulty" maxlength="50" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="价格区间">
              <el-input v-model="form.priceRange" maxlength="100" placeholder="如：2000-5000元/人" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="经营状态" prop="bizStatus">
              <el-select v-model="form.bizStatus" placeholder="请选择" style="width: 100%" :disabled="!isAdmin">
                <el-option label="发布" :value="1" />
                <el-option label="待审核" :value="2" />
              </el-select>
              <div v-if="!isAdmin" class="status-tip" style="margin-top: 5px; color: #909399; font-size: 12px;">
                <i class="el-icon-info"></i>
                商家用户不能修改经营状态，请联系管理员审核
              </div>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="起点地址" prop="originAddress">
              <el-input v-model="form.originAddress" maxlength="200" placeholder="请选择或输入起点地址" />
              <div class="address-actions">
                <el-button type="primary" plain size="mini" @click="openMapDialog('origin')" style="margin-right: 6px;">地图选址</el-button>
                <el-button type="default" plain size="mini" @click="getCurrentLocation('origin')">获取当前位置</el-button>
              </div>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="终点地址" prop="destAddress">
              <el-input v-model="form.destAddress" maxlength="200" placeholder="请选择或输入终点地址" />
              <div class="address-actions">
                <el-button type="primary" plain size="mini" @click="openMapDialog('dest')" style="margin-right: 6px;">地图选址</el-button>
                <el-button type="default" plain size="mini" @click="getCurrentLocation('dest')">获取当前位置</el-button>
              </div>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="目标人群">
              <el-input v-model="form.targetCrowd" maxlength="200" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="行程安排">
              <el-input type="textarea" :rows="2" v-model="form.itinerary" maxlength="1000" />
              <div class="word-count">{{ (form.itinerary || '').length }}/1000</div>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="安全措施">
              <el-input type="textarea" :rows="2" v-model="form.safetyMeasures" maxlength="1000" />
              <div class="word-count">{{ (form.safetyMeasures || '').length }}/1000</div>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="服务保障">
              <el-input type="textarea" :rows="2" v-model="form.serviceGuarantee" maxlength="1000" />
              <div class="word-count">{{ (form.serviceGuarantee || '').length }}/1000</div>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="费用包含">
              <el-input type="textarea" :rows="2" v-model="form.costIncluded" maxlength="1000" />
              <div class="word-count">{{ (form.costIncluded || '').length }}/1000</div>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="费用不包含">
              <el-input type="textarea" :rows="2" v-model="form.costExcluded" maxlength="1000" />
              <div class="word-count">{{ (form.costExcluded || '').length }}/1000</div>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitLoading">确定</el-button>
      </div>
    </el-dialog>

    <!-- 地图选址对话框 -->
    <el-dialog
      title="地图选址"
      :visible.sync="mapDialogVisible"
      width="800px"
      @close="closeMapDialog"
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
        <div id="routeMapContainer" style="width: 100%; height: 400px" />
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
        <el-button @click="mapDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmLocation">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listTourRoute, getTourRoute, createTourRoute, updateTourRoute, deleteTourRoute, publishTourRoute, unpublishTourRoute } from '@/api/tourRoute'
import { listTourCompany } from '@/api/tourCompany'
import { listRouteType } from '@/api/routeType'
import { listRouteTheme } from '@/api/routeTheme'
import { getCurrentUser } from '@/api/user'

export default {
  name: 'TourRoute',
  data() {
    return {
      query: {
        name: '',
        companyId: null,
        bizStatus: null
      },
      tableData: [],
      pagination: {
        page: 1,
        pageSize: 10,
        total: 0
      },
      baseUrl: process.env.VUE_APP_BASE_API || '',
      dialogVisible: false,
      dialogTitle: '新增路线',
      submitLoading: false,
      isAdmin: false, // 是否为管理员
      form: {
        id: null,
        name: '',
        companyId: null,
        routeType: '',
        themeTags: '',
        originAddress: '',
        originLat: null,
        originLng: null,
        destAddress: '',
        destLat: null,
        destLng: null,
        days: null,
        difficulty: '',
        itinerary: '',
        bizStatus: 1,
        targetCrowd: '',
        priceRange: '',
        safetyMeasures: '',
        serviceGuarantee: '',
        costIncluded: '',
        costExcluded: ''
      },
      rules: {
        name: [{ required: true, message: '请输入路线名称', trigger: 'blur' }],
        originAddress: [{ required: true, message: '请输入起点地址', trigger: 'blur' }],
        destAddress: [{ required: true, message: '请输入终点地址', trigger: 'blur' }],
        bizStatus: [{ required: true, message: '请选择经营状态', trigger: 'change' }]
      },
      companyOptions: [],
      routeTypeOptions: [],
      routeThemeOptions: [],
      themeTagsArray: [],
      mapDialogVisible: false,
      map: null,
      marker: null,
      selectedLatitude: null,
      selectedLongitude: null,
      selectedAddress: '',
      mapTarget: 'origin',
      searchAddress: '',
      searchLoading: false,
      addressSuggestions: [],
      showSuggestions: false,
      autoComplete: null
    }
  },
  async mounted() {
    await this.checkUserPermission()
    await this.loadCompanies()
    this.loadRouteTypes()
    this.loadRouteThemes()
    this.loadAMapScript()
    this.loadData()
  },
  methods: {
    async loadData() {
      const params = {
        page: this.pagination.page,
        limit: this.pagination.pageSize,
        ...this.query
      }
      const res = await listTourRoute(params)
      if (res && res.code === 200) {
        const data = res.data || {}
        const list = data.records || data.list || []
        // 处理公司名称显示，确保保留所有字段（包括 bizStatus）
        this.tableData = list.map(item => {
          const company = this.companyOptions.find(c => c.id === item.companyId)
          return {
            ...item,
            companyName: company ? company.name : null,
            // 确保 bizStatus 被保留（如果后端返回了的话）
            bizStatus: item.bizStatus !== undefined ? item.bizStatus : null
          }
        })
        this.pagination.total = data.total || 0
        // 调试：打印第一条数据的 bizStatus
        if (this.tableData.length > 0) {
          console.log('旅游线路数据示例:', {
            id: this.tableData[0].id,
            name: this.tableData[0].name,
            bizStatus: this.tableData[0].bizStatus,
            isAdmin: this.isAdmin
          })
        }
      } else {
        // 如果数据加载失败，清空表格
        this.tableData = []
        this.pagination.total = 0
      }
    },
    async loadCompanies() {
      const res = await listTourCompany({ page: 1, limit: 999, status: 1 })
      if (res && res.code === 200) {
        const raw = res.data || {}
        const list = raw.records || raw.list || []
        this.companyOptions = Array.isArray(list) ? list : []
        // 公司数据加载完成后，刷新表格中的公司名称显示
        this.refreshCompanyNames()
      }
    },

    // 刷新表格中的公司名称显示
    refreshCompanyNames() {
      if (this.tableData.length > 0 && this.companyOptions.length > 0) {
        this.tableData = this.tableData.map(item => {
          const company = this.companyOptions.find(c => c.id === item.companyId)
          return {
            ...item,
            companyName: company ? company.name : null
          }
        })
      }
    },
    handleSearch() {
      this.pagination.page = 1
      this.loadData()
    },
    handleReset() {
      this.query = { name: '', companyId: null, bizStatus: null }
      this.handleSearch()
    },
    handleSizeChange(val) {
      this.pagination.pageSize = val
      this.pagination.page = 1
      this.loadData()
    },
    handlePageChange(val) {
      this.pagination.page = val
      this.loadData()
    },
    async loadRouteTypes() {
      const res = await listRouteType({ page: 1, limit: 999, status: 1 })
      if (res && res.code === 200) {
        const raw = res.data || {}
        const list = raw.records || raw.list || []
        this.routeTypeOptions = Array.isArray(list) ? list : []
      }
    },
    async loadRouteThemes() {
      const res = await listRouteTheme({ page: 1, limit: 999, status: 1 })
      if (res && res.code === 200) {
        const raw = res.data || {}
        const list = raw.records || raw.list || []
        this.routeThemeOptions = Array.isArray(list) ? list : []
      }
    },
    async openDialog(row) {
      // 确保权限检查已完成
      if (this.isAdmin === false) {
        await this.checkUserPermission()
      }

      if (row) {
        this.dialogTitle = '编辑路线'
        const res = await getTourRoute(row.id)
        if (res && res.code === 200) {
          this.form = { ...res.data }
          this.themeTagsArray = this.form.themeTags ? this.form.themeTags.split(',').filter(Boolean).map(s => s.trim()) : []
        }
      } else {
        this.dialogTitle = '新增路线'
        this.resetForm()
      }
      this.dialogVisible = true
      this.$nextTick(() => {
        if (this.$refs.form) this.$refs.form.clearValidate()
      })
    },
    resetForm() {
      this.form = {
        id: null,
        name: '',
        companyId: null,
        routeType: '',
        themeTags: '',
        originAddress: '',
        originLat: null,
        originLng: null,
        destAddress: '',
        destLat: null,
        destLng: null,
        days: null,
        difficulty: '',
        itinerary: '',
        bizStatus: 2, // 默认待审核
        targetCrowd: '',
        priceRange: '',
        safetyMeasures: '',
        serviceGuarantee: '',
        costIncluded: '',
        costExcluded: ''
      }
      this.themeTagsArray = []
      this.selectedLatitude = null
      this.selectedLongitude = null
      this.selectedAddress = ''
    },
    async checkUserPermission() {
      try {
        const userInfo = await getCurrentUser()
        const data = userInfo && userInfo.data ? userInfo.data : userInfo
        const userId = (data && data.userId) || (data && data.id)
        // 判断是否为管理员：userId === 10011 或 roleIds 包含 1
        const roleIds = data && data.roleIds ? data.roleIds : []
        this.isAdmin = userId === 10011 || (roleIds && roleIds.includes(1))
        console.log('用户权限检查:', { userId, isAdmin: this.isAdmin })
      } catch (error) {
        console.error('获取用户权限失败:', error)
        this.isAdmin = false
      }
    },
    // 上架线路（将状态改为1-发布）
    handlePublish(row) {
      this.$confirm('确定要上架该线路吗？上架后将在小程序端显示', '上架确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        publishTourRoute(row.id).then(response => {
          this.$message.success('上架成功')
          this.loadData()
        }).catch(error => {
          const errorMsg = (error && error.msg) || (error && error.message) || '上架失败'
          this.$message.error(errorMsg)
        })
      }).catch(() => {})
    },
    // 下架线路（将状态改为3-待审核）
    handleUnpublish(row) {
      this.$confirm('确定要下架该线路吗？下架后将不在小程序端显示', '下架确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        unpublishTourRoute(row.id).then(response => {
          this.$message.success('下架成功')
          this.loadData()
        }).catch(error => {
          const errorMsg = (error && error.msg) || (error && error.message) || '下架失败'
          this.$message.error(errorMsg)
        })
      }).catch(() => {})
    },
    handleSubmit() {
      this.$refs.form.validate(async(valid) => {
        if (!valid) return

        // 主题标签数组转为逗号分隔
        const payload = { ...this.form }
        if (Array.isArray(this.themeTagsArray)) {
          payload.themeTags = this.themeTagsArray.join(',')
        }

        // 普通商户新增线路时，强制设置为待审核状态（2）
        if (!this.form.id && !this.isAdmin) {
          payload.bizStatus = 2
        }

        this.submitLoading = true
        const api = this.form.id ? updateTourRoute : createTourRoute
        const res = await api(payload)
        this.submitLoading = false

        if (res && res.code === 200) {
          this.$message.success(this.form.id ? '更新成功' : '创建成功')
          this.dialogVisible = false
          this.loadData()
        } else {
          this.$message.error(res.msg || '操作失败')
        }
      })
    },
    handleDelete(row) {
      this.$confirm('确认删除该路线？', '提示', { type: 'warning' })
        .then(async() => {
          const res = await deleteTourRoute(row.id)
          if (res && res.code === 200) {
            this.$message.success('删除成功')
            this.loadData()
          } else {
            this.$message.error(res.msg || '删除失败')
          }
        })
        .catch(() => {})
    },
    // 地图脚本检查
    loadAMapScript() {
      if (!window.AMap) {
        this.$message.error('高德地图脚本未加载，请检查 index.html 中的 key 和 securityJsCode')
      }
    },
    openMapDialog(target = 'origin') {
      this.mapTarget = target
      this.selectedAddress = target === 'dest' ? this.form.destAddress : this.form.originAddress
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
      if (typeof window.AMap === 'undefined') {
        return
      }
      // 预留自动完成初始化
    },

    // 处理搜索输入
    handleSearchInput(value) {
      if (!value || !value.trim()) {
        this.addressSuggestions = []
        this.showSuggestions = false
        return
      }

      if (typeof window.AMap === 'undefined') {
        return
      }

      // 使用高德地图的PlaceSearch进行搜索建议
      window.AMap.plugin('AMap.PlaceSearch', () => {
        try {
          const placeSearch = new window.AMap.PlaceSearch({
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
    handleSearchBlur() {
      setTimeout(() => {
        this.showSuggestions = false
      }, 200)
    },

    // 选择地址
    selectAddress(item) {
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

        this.marker = new window.AMap.Marker({
          position: position,
          map: this.map,
          title: address
        })
      }

      this.$message.success('地址定位成功')
    },

    // 通过地址搜索位置
    searchLocationByAddress() {
      if (!this.searchAddress || !this.searchAddress.trim()) {
        this.$message.warning('请输入要搜索的地址')
        return
      }

      if (typeof window.AMap === 'undefined') {
        this.$message.error('高德地图API未加载，请检查网络连接')
        return
      }

      if (!this.map) {
        this.$message.warning('地图未初始化，请稍候再试')
        return
      }

      this.searchLoading = true

      window.AMap.plugin('AMap.Geocoder', () => {
        try {
          const geocoder = new window.AMap.Geocoder({
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

                this.marker = new window.AMap.Marker({
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
    initMap() {
      if (!window.AMap) {
        this.$message.warning('地图加载中，请稍候...')
        setTimeout(() => {
          if (window.AMap) {
            this.initMap()
          }
        }, 500)
        return
      }

      const container = document.getElementById('routeMapContainer')
      if (!container) return

      const targetLat = this.mapTarget === 'dest' ? this.form.destLat : this.form.originLat
      const targetLng = this.mapTarget === 'dest' ? this.form.destLng : this.form.originLng
      this.selectedLatitude = targetLat
      this.selectedLongitude = targetLng

      const center = targetLat && targetLng ? [targetLng, targetLat] : [116.397428, 39.90923]

      this.map = new window.AMap.Map('routeMapContainer', {
        zoom: 13,
        center
      })

      if (targetLat && targetLng) {
        this.marker = new window.AMap.Marker({
          position: [targetLng, targetLat],
          map: this.map
        })
      }

      this.map.on('click', (e) => {
        const lng = e.lnglat.getLng()
        const lat = e.lnglat.getLat()

        if (this.marker) {
          this.marker.setPosition([lng, lat])
        } else {
          this.marker = new window.AMap.Marker({
            position: [lng, lat],
            map: this.map
          })
        }

        this.selectedLongitude = lng
        this.selectedLatitude = lat
        this.getAddressByCoordinates(lat, lng)

        if (this.mapTarget === 'dest') {
          this.form.destLat = lat
          this.form.destLng = lng
        } else {
          this.form.originLat = lat
          this.form.originLng = lng
        }
      })
    },
    getAddressByCoordinates(lat, lng) {
      if (!window.AMap) return

      window.AMap.plugin('AMap.Geocoder', () => {
        const geocoder = new window.AMap.Geocoder()
        geocoder.getAddress([lng, lat], (status, result) => {
          if (status === 'complete' && result.info === 'OK' && result.regeocode) {
            this.selectedAddress = result.regeocode.formattedAddress
            if (this.selectedAddress) {
              if (this.mapTarget === 'dest') {
                this.form.destAddress = this.selectedAddress
              } else {
                this.form.originAddress = this.selectedAddress
              }
            }
          } else {
            this.selectedAddress = ''
          }
        })
      })
    },
    confirmLocation() {
      if (!this.selectedLatitude || !this.selectedLongitude) {
        this.$message.warning('请先在地图上选择位置')
        return
      }

      if (this.mapTarget === 'dest') {
        this.form.destLat = this.selectedLatitude
        this.form.destLng = this.selectedLongitude
        if (this.selectedAddress) this.form.destAddress = this.selectedAddress
      } else {
        this.form.originLat = this.selectedLatitude
        this.form.originLng = this.selectedLongitude
        if (this.selectedAddress) this.form.originAddress = this.selectedAddress
      }

      this.mapDialogVisible = false
      this.$message.success('位置已选择')
    },
    closeMapDialog() {
      this.searchAddress = ''
      this.searchLoading = false
      this.addressSuggestions = []
      this.showSuggestions = false

      if (this.autoComplete) {
        this.autoComplete = null
      }

      if (this.map) {
        this.map.destroy()
        this.map = null
        this.marker = null
      }
      this.selectedLatitude = null
      this.selectedLongitude = null
      this.selectedAddress = ''
    },
    getCurrentLocation(target = 'origin') {
      this.mapTarget = target

      if (!window.AMap) {
        this.$message.error('高德地图API未加载，请检查网络')
        return
      }

      window.AMap.plugin('AMap.Geolocation', () => {
        try {
          const geolocation = new window.AMap.Geolocation({
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
            if (status === 'complete' && result.position) {
              const lat = result.position.lat
              const lng = result.position.lng

              this.selectedLatitude = lat
              this.selectedLongitude = lng
              this.getAddressByCoordinates(lat, lng)

              if (this.map) {
                const pos = [lng, lat]
                this.map.setCenter(pos)
                this.map.setZoom(15)
                if (this.marker) this.map.remove(this.marker)
                this.marker = new window.AMap.Marker({ position: pos, map: this.map })
              }

              if (this.mapTarget === 'dest') {
                this.form.destLat = lat
                this.form.destLng = lng
              } else {
                this.form.originLat = lat
                this.form.originLng = lng
              }

              this.$message.success('获取当前位置成功')
            } else {
              this.$message.error('获取当前位置失败')
            }
          })
        } catch (e) {
          this.$message.error('定位服务异常')
        }
      })
    }
  }
}
</script>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.filters {
  display: flex;
  align-items: center;
}

.pager {
  margin-top: 16px;
  text-align: right;
}

.address-actions {
  margin-top: 6px;
  display: flex;
  gap: 6px;
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

.word-count {
  text-align: right;
  color: #909399;
  font-size: 12px;
  margin-top: 4px;
  line-height: 1;
}

.status-tip {
  margin-top: 5px;
  color: #909399;
  font-size: 12px;
  display: flex;
  align-items: center;
}

.status-tip i {
  margin-right: 4px;
  color: #409eff;
}
</style>

