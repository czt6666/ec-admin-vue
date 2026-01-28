<template>
  <div class="app-container">
    <!-- 搜索 -->
    <div class="filter-container">
      <el-form :inline="true" :model="listQuery" class="demo-form-inline">
        <el-form-item label="基地名称">
          <el-input v-model="listQuery.baseName" placeholder="请输入基地名称" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="运行单位">
          <el-input v-model="listQuery.operationUnit" placeholder="请输入运行单位" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="营业状态">
          <el-select v-model="listQuery.businessStatus" placeholder="全部" clearable style="width: 200px">
            <el-option v-for="item in businessStatusOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearchList"><i class="el-icon-search" /> 搜索</el-button>
          <el-button @click="handleResetSearch"><i class="el-icon-refresh" /> 重置</el-button>
          <el-button type="primary" @click="handleAdd"><i class="el-icon-plus" /> 新增基地</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 标题 -->
    <div class="title-container">
      <i class="el-icon-tickets" style="color:#409EFF;"></i>
      <span class="title-text">研学基地列表</span>
    </div>

    <!-- 表格 -->
    <div class="table-container">
      <el-table ref="tourBaseTable" :data="list" style="width: 100%;" v-loading="listLoading" border stripe>
        <el-table-column prop="id" label="编号" width="80" align="center" />
        <el-table-column prop="baseName" label="基地名称" min-width="150" align="center" />
        <el-table-column prop="userName" label="关联用户" width="140" align="center" show-overflow-tooltip />
        <el-table-column prop="operationUnit" label="运行单位" min-width="150" align="center" />
        <el-table-column prop="address" label="基地地址" min-width="200" align="center" />
        <el-table-column prop="businessStatus" label="营业状态" width="100" align="center">
          <template slot-scope="scope">
            <el-tag :type="scope.row.businessStatus === 1 ? 'success' : 'info'">
              {{ getBusinessStatusText(scope.row.businessStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="contactPerson" label="联系人" width="100" align="center" />
        <el-table-column prop="contactPhone" label="联系电话" width="120" align="center" />
        <el-table-column prop="createTime" label="创建时间" width="180" align="center">
          <template slot-scope="scope">{{ scope.row.createTime | formatDateTime }}</template>
        </el-table-column>
        <el-table-column label="操作" width="260" align="center" fixed="right">
          <template slot-scope="scope">
            <el-button size="mini" type="primary" @click="handleUpdate(scope.$index, scope.row)">编辑</el-button>
            <el-button
              v-if="isAdmin && scope.row.businessStatus !== 1"
              size="mini"
              type="success"
              @click="handlePublish(scope.row)"
            >上架</el-button>
            <el-button
              v-if="isAdmin && scope.row.businessStatus === 1"
              size="mini"
              type="warning"
              @click="handleUnpublish(scope.row)"
            >下架</el-button>
            <el-button size="mini" type="danger" @click="handleDelete(scope.$index, scope.row)">删除</el-button>
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
        :total="total"
      />
    </div>

    <!-- 新增/编辑 -->
    <el-dialog :title="isEdit ? '编辑研学基地' : '添加研学基地'" :visible.sync="dialogVisible" width="650px" :close-on-click-modal="false">
      <el-form :model="tourBase" :rules="rules" ref="tourBaseForm" label-width="120px" size="small">
        <el-form-item label="基地名称" prop="baseName">
          <el-input v-model="tourBase.baseName" style="width: 350px" />
        </el-form-item>
        <el-form-item label="运行单位" prop="operationUnit">
          <el-input v-model="tourBase.operationUnit" style="width: 350px" />
        </el-form-item>
        <!-- 地址 + 地图选址 -->
        <el-form-item label="基地地址" prop="address">
          <el-input v-model="tourBase.address" placeholder="请输入基地地址或使用地图选址" style="width: 320px" />
          <el-button type="primary" plain size="mini" @click="openMapDialog" style="margin-left: 8px;">地图选址</el-button>
          <el-button type="default" plain size="mini" @click="getCurrentLocation" style="margin-left: 4px;">获取当前位置</el-button>
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
          </el-col>
          <el-col :span="12">
          </el-col>
        </el-row>
        <el-form-item label="法定代表人" prop="legalRepresentative">
          <el-input v-model="tourBase.legalRepresentative" style="width: 350px" />
        </el-form-item>
        <el-form-item label="统一社会信用代码" prop="unifiedSocialCreditCode">
          <el-input v-model="tourBase.unifiedSocialCreditCode" style="width: 350px" />
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
            :maxlength="300"
            placeholder="请输入基地特色说明"
            style="width: 350px"
          />
          <div class="word-count">{{ (tourBase.featureDesc || '').length }}/300</div>
        </el-form-item>
        <el-form-item label="关联用户" prop="userId" v-if="isAdmin">
          <el-select
            v-model="tourBase.userId"
            filterable
            placeholder="选择关联用户（仅管理员可改）"
            :loading="userLoading"
            style="width: 350px"
          >
            <el-option
              v-for="item in userOptions"
              :key="item.id"
              :label="item.username"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="营业状态" prop="businessStatus">
          <el-radio-group v-model="tourBase.businessStatus" :disabled="businessStatusDisabled">
            <el-radio :label="1">营业中</el-radio>
            <el-radio :label="2">待审核</el-radio>
          </el-radio-group>
          <div v-if="businessStatusDisabled" class="form-tip">商户新增/编辑时营业状态由系统自动设置</div>
        </el-form-item>
        <el-form-item label="联系人" prop="contactPerson">
          <el-input v-model="tourBase.contactPerson" style="width: 350px" />
        </el-form-item>
        <el-form-item label="联系电话" prop="contactPhone">
          <el-input v-model="tourBase.contactPhone" style="width: 350px" />
        </el-form-item>
        <el-form-item label="研学类型" prop="selectedTypeIds">
          <el-select v-model="tourBase.selectedTypeIds" multiple placeholder="请选择研学类型" style="width: 350px">
            <el-option v-for="item in tourTypeOptions" :key="item.id" :label="item.typeName" :value="item.id" />
          </el-select>
          <div class="type-info">可多选研学类型</div>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleDialogConfirm">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 地图选择 -->
    <el-dialog title="选择基地位置" :visible.sync="mapDialogVisible" width="80%" :before-close="closeMapDialog">
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
        <div id="tourBaseMapContainer" style="width: 100%; height: 500px;"></div>
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
import { formatDate } from '@/utils/date'
import { fetchList, createTourBase, updateTourBase, deleteTourBase, fetchTourTypes, getAssociatedTypes, saveBaseTypes, publishStudyBase, unpublishStudyBase } from '@/api/study/tourBase'
import { getCurrentUser, listUserOptions } from '@/api/user'

const defaultListQuery = { pageNum: 1, pageSize: 10, baseName: null, operationUnit: null, businessStatus: null }
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
      listQuery: { ...defaultListQuery },
      list: [],
      total: 0,
      listLoading: false,
      dialogVisible: false,
      isEdit: false,
      tourBase: { ...defaultTourBase },
      tourTypeOptions: [],
      businessStatusOptions: [
        { label: '全部', value: null },
        { label: '营业中', value: 1 },
        { label: '待审核', value: 2 }
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
      },
      // 地图状态
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
      isAdmin: null, // true:管理员，false:商户，null:未判定
      userOptions: [],
      userLoading: false
    }
  },
  computed: {
    businessStatusDisabled() {
      // 非管理员不允许手动改营业状态（后端也会强制校验）
      return this.isAdmin === false
    }
  },
  created() {
    this.checkUserPermission().finally(() => {
      this.getList()
    })
    this.loadTourTypes()
  },
  filters: {
    formatDateTime(time) {
      if (!time) return ''
      const date = new Date(time)
      return formatDate(date, 'yyyy-MM-dd hh:mm:ss')
    }
  },
  methods: {
    // 判断当前用户是否为管理员（userId=10011 或 roleIds 包含 1）
    async checkUserPermission() {
      try {
        const res = await getCurrentUser()
        const data = res && res.data ? res.data : res
        const userId = (data && data.userId) || (data && data.id)
        const roleIds = Array.isArray(data && data.roleIds) ? data.roleIds : []
        this.isAdmin = userId === 10011 || roleIds.includes(1)
        if (this.isAdmin) {
          await this.loadUserOptions()
        }
      } catch (e) {
        // 拉取失败则按商户处理，后端仍有二次校验
        this.isAdmin = false
      }
    },
    // 拉取后台用户列表（仅管理员可选商户用户）
    async loadUserOptions() {
      this.userLoading = true
      try {
        const res = await listUserOptions('studyBase:add')
        if (res && res.data) {
          this.userOptions = res.data || []
        } else if (Array.isArray(res)) {
          this.userOptions = res
        } else {
          this.userOptions = []
        }
      } catch (e) {
        this.userOptions = []
      } finally {
        this.userLoading = false
      }
    },
    handleResetSearch() {
      this.listQuery = { ...defaultListQuery }
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
      this.tourBase = { ...defaultTourBase }
      // 商户新增时，businessStatus默认为2（暂停/待审核）
      if (!this.isAdmin) {
        this.tourBase.businessStatus = 2
      }
    },
    handleDelete(index, row) {
      this.$confirm('是否要删除该研学基地？', '提示', { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' })
        .then(() => deleteTourBase(row.id))
        .then(() => { this.$message.success('删除成功！'); this.getList() })
        .catch(() => {})
    },
    handlePublish(row) {
      this.$confirm('确定要上架该研学基地吗？', '提示', { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' })
        .then(() => publishStudyBase(row.id))
        .then(() => { this.$message.success('上架成功！'); this.getList() })
        .catch(err => {
          const errorMsg = (err.response && err.response.data && err.response.data.message) || err.message || '上架失败'
          this.$message.error(errorMsg)
        })
    },
    handleUnpublish(row) {
      this.$confirm('确定要下架该研学基地吗？', '提示', { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' })
        .then(() => unpublishStudyBase(row.id))
        .then(() => { this.$message.success('下架成功！'); this.getList() })
        .catch(err => {
          const errorMsg = (err.response && err.response.data && err.response.data.message) || err.message || '下架失败'
          this.$message.error(errorMsg)
        })
    },
    handleUpdate(index, row) {
      this.dialogVisible = true
      this.isEdit = true
      getAssociatedTypes(row.id).then(res => {
        const baseInfo = { ...row }
        baseInfo.selectedTypeIds = (res.data || []).map(item => item.id)
        this.tourBase = baseInfo
        // 如果是管理员且userId不在选项中，添加到选项列表
        if (this.isAdmin && this.tourBase.userId && !this.userOptions.find(o => o.id === this.tourBase.userId)) {
          this.userOptions.push({ id: this.tourBase.userId, username: this.tourBase.userName || `用户${this.tourBase.userId}` })
        }
      })
    },
    handleDialogConfirm() {
      this.$refs.tourBaseForm.validate(valid => {
        if (!valid) {
          this.$message.error('验证失败')
          return
        }
        const payload = { ...this.tourBase }
        const selectedTypeIds = payload.selectedTypeIds || []
        delete payload.selectedTypeIds

        // 商户模式：不能修改businessStatus和userId
        if (!this.isAdmin) {
          if (this.isEdit) {
            // 编辑时，删除businessStatus和userId，由后端保持原值
            delete payload.businessStatus
            delete payload.userId
          } else {
            // 新增时，businessStatus设为2（待审核），userId由后端自动设置
            payload.businessStatus = 2
            delete payload.userId
          }
        }

        const saveTypes = (baseId) => {
          if (selectedTypeIds.length > 0 && baseId) {
            return saveBaseTypes(baseId, selectedTypeIds)
          }
          return Promise.resolve()
        }

        if (this.isEdit) {
          updateTourBase(payload)
            .then(() => saveTypes(payload.id))
            .then(() => { this.$message.success('修改成功'); this.dialogVisible = false; this.getList() })
            .catch(err => {
              const errorMsg = (err.response && err.response.data && err.response.data.message) || err.message || '修改失败'
              this.$message.error(errorMsg)
            })
        } else {
          createTourBase(payload)
            .then(res => {
              const baseId = res.data
              return saveTypes(baseId)
            })
            .then(() => { this.$message.success('添加成功'); this.dialogVisible = false; this.getList() })
            .catch(err => {
              const errorMsg = (err.response && err.response.data && err.response.data.message) || err.message || '添加失败'
              this.$message.error(errorMsg)
            })
        }
      })
    },
    getList() {
      this.listLoading = true
      fetchList(this.listQuery)
        .then(res => {
          this.listLoading = false
          if (res && res.data) {
            if (res.data.records) {
              this.list = res.data.records
              this.total = res.data.total || 0
            } else if (res.data.list) {
              this.list = res.data.list
              this.total = res.data.total || 0
            } else {
              this.list = res.data
              this.total = (res.data && res.data.length) || 0
            }
          } else {
            this.list = []
            this.total = 0
          }
        })
        .catch(() => {
          this.listLoading = false
          this.list = []
          this.total = 0
        })
    },
    loadTourTypes() {
      fetchTourTypes().then(res => { this.tourTypeOptions = res.data || [] })
    },
    getBusinessStatusText(status) {
      // 统一前端展示为两种状态：营业中 / 待审核
      if (status === 1) {
        return '营业中'
      }
      // 其他状态（2 暂停、3 已注销等历史值）统一视为“待审核”
      return '待审核'
    },
    /* 地图相关 */
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
      // 预留自动完成初始化
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

        this.marker = new AMap.Marker({
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
    initMap() {
      if (typeof AMap === 'undefined') {
        this.$message.error('高德地图API未加载，请检查网络连接')
        return
      }
      const container = document.getElementById('tourBaseMapContainer')
      if (!container) { this.$message.error('地图容器不存在'); return }
      if (container.offsetWidth === 0 || container.offsetHeight === 0) {
        setTimeout(() => { this.initMap() }, 200)
        return
      }
      if (this.map) { this.map.destroy(); this.map = null }
      this.map = new AMap.Map('tourBaseMapContainer', { zoom: 15, viewMode: '3D' })
      if (this.tourBase.latitude && this.tourBase.longitude) {
        const position = [this.tourBase.longitude, this.tourBase.latitude]
        this.map.setCenter(position); this.map.setZoom(15)
        this.marker = new AMap.Marker({ position, map: this.map })
      } else {
        this.map.setCenter([116.397428, 39.90923]); this.map.setZoom(11)
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
          if (this.marker) this.map.remove(this.marker)
          this.marker = new AMap.Marker({ position: [lng, lat], map: this.map })
          this.getAddressByCoordinates(lat, lng)
        })
      })
    },
    getAddressByCoordinates(lat, lng) {
      if (!lat || !lng || isNaN(lat) || isNaN(lng)) { this.$message.warning('坐标无效，无法获取地址'); return }
      if (typeof AMap === 'undefined') { this.$message.error('高德地图API未加载，请检查网络连接'); return }
      AMap.plugin('AMap.Geocoder', () => {
        const geocoder = new AMap.Geocoder({ city: '全国', radius: 1000, extensions: 'all' })
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
              this.tourBase.address = address
              this.selectedAddress = address
            }
          } else {
            this.$message.warning('无法获取该位置的地址信息')
          }
        })
      })
    },
    getCurrentLocation() {
      if (typeof AMap === 'undefined') { this.$message.error('高德地图API未加载，请检查网络连接'); return }
      AMap.plugin('AMap.Geolocation', () => {
        const geolocation = new AMap.Geolocation({
          enableHighAccuracy: true, timeout: 10000, maximumAge: 0, convert: true,
          showButton: false, showMarker: false, showCircle: false, panToLocation: false, zoomToAccuracy: false
        })
        geolocation.getCurrentPosition((status, result) => {
          if (status === 'complete') {
            const lat = result.position.lat
            const lng = result.position.lng
            this.tourBase.latitude = lat
            this.tourBase.longitude = lng
            if (this.map) {
              const position = [lng, lat]
              this.map.setCenter(position); this.map.setZoom(15)
              if (this.marker) this.map.remove(this.marker)
              this.marker = new AMap.Marker({ position, map: this.map })
            }
            this.getAddressByCoordinates(lat, lng)
            this.$message.success('获取当前位置成功')
          } else {
            this.$message.error('获取当前位置失败')
          }
        })
      })
    },
    confirmLocation() {
      if (this.selectedLatitude && this.selectedLongitude) {
        this.tourBase.latitude = this.selectedLatitude
        this.tourBase.longitude = this.selectedLongitude
        if (this.selectedAddress) {
          this.tourBase.address = this.selectedAddress
        }
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
    }
  }
}
</script>

<style scoped>
.filter-container { background-color: #f5f7fa; padding: 20px; border-radius: 4px; margin-bottom: 20px; }

.title-container { display: flex; align-items: center; background-color: #f5f7fa; padding: 15px 20px; border-radius: 4px; margin-bottom: 20px; }

.title-text { font-size: 18px; font-weight: bold; margin-left: 10px; }

.table-container { margin-bottom: 15px; }

.pagination-container { display: flex; justify-content: center; margin-top: 20px; }

.type-info { font-size: 12px; color: #999; margin-top: 5px; }

/* 地图弹窗样式 */
.map-dialog-content { position: relative; }

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

.map-info { margin-top: 10px; padding: 10px; background-color: #f5f7fa; border-radius: 4px; }

.map-info p { margin: 5px 0; color: #606266; }

.word-count {
  text-align: right;
  color: #909399;
  font-size: 12px;
  margin-top: 4px;
  line-height: 1;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
}
</style>

