<template>
  <div class="page">
    <el-card>
      <div slot="header" class="header">
        <div class="filters">
          <el-input
            v-model="query.name"
            placeholder="公司名称"
            clearable
            style="width: 200px; margin-right: 10px"
          />
          <el-select v-model="query.status" placeholder="营业状态" clearable style="width: 150px; margin-right: 10px">
            <el-option label="营业中" :value="1" />
            <el-option label="暂停" :value="2" />
            <el-option label="已注销" :value="3" />
          </el-select>
          <el-button type="primary" icon="el-icon-search" @click="handleSearch">搜索</el-button>
          <el-button icon="el-icon-refresh" @click="handleReset">重置</el-button>
        </div>
        <el-button type="primary" icon="el-icon-plus" @click="openDialog()">新增公司</el-button>
      </div>
      <el-table :data="tableData" border stripe>
        <el-table-column type="index" label="序号" width="60" />
        <el-table-column prop="name" label="公司名称" min-width="200" show-overflow-tooltip />
        <el-table-column label="Logo" width="110" align="center">
          <template slot-scope="scope">
            <el-image
              v-if="scope.row.logoUrl"
              :src="getImageUrl(scope.row.logoUrl)"
              :preview-src-list="[getImageUrl(scope.row.logoUrl)]"
              style="width: 64px; height: 64px; border-radius: 4px"
              fit="cover"
            >
              <div slot="error" style="font-size: 12px; color: #999;">加载失败</div>
            </el-image>
            <span v-else>—</span>
          </template>
        </el-table-column>
        <el-table-column prop="shortName" label="简称" min-width="120" show-overflow-tooltip />
        <el-table-column prop="unifiedSocialCreditCode" label="统一社会信用代码" min-width="180" />
        <el-table-column prop="legalRepresentative" label="法定代表人" min-width="140" />
        <el-table-column prop="businessStatus" label="营业状态" width="100">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.businessStatus === 1" type="success">营业中</el-tag>
            <el-tag v-else-if="scope.row.businessStatus === 2" type="warning">暂停</el-tag>
            <el-tag v-else-if="scope.row.businessStatus === 3" type="info">已注销</el-tag>
            <span v-else>—</span>
          </template>
        </el-table-column>
        <el-table-column prop="officialPhone" label="官方联系电话" min-width="140" />
        <el-table-column prop="emergencyPhone" label="紧急联系电话" min-width="140" />
        <el-table-column prop="website" label="官网" min-width="160" show-overflow-tooltip />
        <el-table-column prop="createTime" label="创建时间" min-width="170" />
        <el-table-column label="操作" width="180" fixed="right">
          <template slot-scope="scope">
            <el-button type="primary" size="mini" @click="openDialog(scope.row)">编辑</el-button>
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
    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="900px" :close-on-click-modal="false">
      <el-form ref="form" :model="form" :rules="rules" label-width="140px" label-position="right">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="公司名称" prop="name">
              <el-input v-model="form.name" maxlength="200" />
              <div class="word-count">{{ (form.name || '').length }}/200</div>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="公司简称">
              <el-input v-model="form.shortName" maxlength="100" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="注册地址" prop="registeredAddress">
              <el-input type="textarea" :rows="2" v-model="form.registeredAddress" maxlength="500" />
              <div class="input-footer">
                <div class="word-count">{{ (form.registeredAddress || '').length }}/500</div>
                <div class="address-actions">
                  <el-button type="primary" plain size="mini" @click="openMapDialog('registered')" style="margin-right: 6px;">
                    地图选址
                  </el-button>
                  <el-button type="default" plain size="mini" @click="getCurrentLocation('registered')">
                    获取当前位置
                  </el-button>
                </div>
              </div>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="经营地址">
              <el-input type="textarea" :rows="2" v-model="form.businessAddress" maxlength="500" />
              <div class="input-footer">
                <div class="word-count">{{ (form.businessAddress || '').length }}/500</div>
                <div class="address-actions">
                  <el-button type="primary" plain size="mini" @click="openMapDialog('business')" style="margin-right: 6px;">
                    地图选址
                  </el-button>
                  <el-button type="default" plain size="mini" @click="getCurrentLocation('business')">
                    获取当前位置
                  </el-button>
                </div>
              </div>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="经营范围">
              <el-input type="textarea" :rows="2" v-model="form.businessScope" maxlength="500" />
              <div class="word-count">{{ (form.businessScope || '').length }}/500</div>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="营业状态" prop="businessStatus">
              <el-select v-model="form.businessStatus" placeholder="请选择" style="width: 100%">
                <el-option label="营业中" :value="1" />
                <el-option label="暂停" :value="2" />
                <el-option label="已注销" :value="3" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="统一社会信用代码">
              <el-input v-model="form.unifiedSocialCreditCode" maxlength="50" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="法定代表人">
              <el-input v-model="form.legalRepresentative" maxlength="100" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="注册资本（万元）">
              <el-input-number v-model="form.registeredCapital" :min="0" :precision="2" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="成立日期">
              <el-date-picker
                v-model="form.establishmentDate"
                type="date"
                placeholder="选择日期"
                value-format="yyyy-MM-dd"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="营业期限">
              <el-input v-model="form.businessTerm" maxlength="200" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="官方联系电话" prop="officialPhone">
              <el-input v-model="form.officialPhone" maxlength="50" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="紧急联系人">
              <el-input v-model="form.emergencyContact" maxlength="100" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="紧急联系电话" prop="emergencyPhone">
              <el-input v-model="form.emergencyPhone" maxlength="50" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="官方邮箱">
              <el-input v-model="form.officialEmail" maxlength="100" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="官方网站">
              <el-input v-model="form.website" maxlength="200" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="Logo 图">
              <el-upload
                class="logo-uploader"
                action=""
                list-type="picture-card"
                :limit="1"
                :file-list="logoFileList"
                :on-change="handleLogoChange"
                :on-remove="handleLogoRemove"
                :before-upload="beforeLogoUpload"
                accept="image/*"
                :auto-upload="false"
                :class="{ 'avatar-upload-hidden': logoFileList.length >= 1 }"
              >
                <i class="el-icon-plus" />
              </el-upload>
              <div class="el-upload__tip">仅限图片，最大2MB，上传后自动填充并回显</div>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="简介 / 特色亮点">
              <el-input type="textarea" :rows="2" v-model="form.intro" maxlength="500" />
              <div class="word-count">{{ (form.intro || '').length }}/500</div>
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
        <div id="mapContainer" style="width: 100%; height: 400px" />
        <div class="map-info">
          <p><strong>地址：</strong>{{ selectedAddress }}</p>
          <p><strong>坐标：</strong>{{ selectedLatitude }}, {{ selectedLongitude }}</p>
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
import { listTourCompany, getTourCompany, createTourCompany, updateTourCompany, deleteTourCompany } from '@/api/tourCompany'
import request from '@/utils/request'

export default {
  name: 'TourCompany',
  data() {
    return {
      query: {
        name: '',
        status: null
      },
      tableData: [],
      pagination: {
        page: 1,
        pageSize: 10,
        total: 0
      },
      baseUrl: process.env.VUE_APP_BASE_API || '',
      dialogVisible: false,
      dialogTitle: '新增公司',
      submitLoading: false,
      form: {
        id: null,
        name: '',
        shortName: '',
        registeredAddress: '',
        businessAddress: '',
        businessScope: '',
        businessStatus: 1,
        unifiedSocialCreditCode: '',
        legalRepresentative: '',
        registeredCapital: null,
        establishmentDate: null,
        businessTerm: '',
        officialPhone: '',
        emergencyContact: '',
        emergencyPhone: '',
        officialEmail: '',
        intro: '',
        logoUrl: '',
        website: '',
        registeredLatitude: null,
        registeredLongitude: null,
        businessLatitude: null,
        businessLongitude: null
      },
      rules: {
        name: [{ required: true, message: '请输入公司名称', trigger: 'blur' }],
        registeredAddress: [{ required: true, message: '请输入注册地址', trigger: 'blur' }],
        officialPhone: [
          { required: true, message: '请输入官方联系电话', trigger: 'blur' },
          { validator: this.validateMobile, trigger: 'blur' }
        ],
        emergencyPhone: [
          { validator: this.validateMobileOptional, trigger: 'blur' }
        ],
        businessStatus: [{ required: true, message: '请选择营业状态', trigger: 'change' }]
      },
      logoFileList: [],
      mapDialogVisible: false,
      map: null,
      marker: null,
      selectedAddress: '',
      selectedLatitude: null,
      selectedLongitude: null,
      mapTarget: 'registered'
    }
  },
  mounted() {
    this.getBaseUrl()
    this.loadData()
    this.loadAMapScript()
  },
  methods: {
    // 获取基础URL
    getBaseUrl() {
      this.baseUrl = process.env.VUE_APP_BASE_API || 'https://dzk.czt666.cn/api'
    },
    async loadData() {
      const params = {
        page: this.pagination.page,
        limit: this.pagination.pageSize,
        ...this.query
      }
      const res = await listTourCompany(params)
      if (res && res.code === 200) {
        const data = res.data || {}
        this.tableData = data.records || data.list || []
        this.pagination.total = data.total || 0
      }
    },
    handleSearch() {
      this.pagination.page = 1
      this.loadData()
    },
    handleReset() {
      this.query = { name: '', status: null }
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
    async openDialog(row) {
      if (row) {
        this.dialogTitle = '编辑公司'
        const res = await getTourCompany(row.id)
        if (res && res.code === 200) {
          this.form = { ...res.data }
          // Logo 回显
          if (this.form.logoUrl) {
            this.logoFileList = [{
              name: this.form.logoUrl.split('/').pop(),
              url: this.getImageUrl(this.form.logoUrl)
            }]
          } else {
            this.logoFileList = []
          }
          // 坐标回显
          if (this.form.registeredLatitude && this.form.registeredLongitude) {
            this.selectedLatitude = this.form.registeredLatitude
            this.selectedLongitude = this.form.registeredLongitude
          } else if (this.form.businessLatitude && this.form.businessLongitude) {
            this.selectedLatitude = this.form.businessLatitude
            this.selectedLongitude = this.form.businessLongitude
          } else {
            this.selectedLatitude = null
            this.selectedLongitude = null
          }
        }
      } else {
        this.dialogTitle = '新增公司'
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
        shortName: '',
        registeredAddress: '',
        businessAddress: '',
        businessScope: '',
        businessStatus: 1,
        unifiedSocialCreditCode: '',
        legalRepresentative: '',
        registeredCapital: null,
        establishmentDate: null,
        businessTerm: '',
        officialPhone: '',
        emergencyContact: '',
        emergencyPhone: '',
        officialEmail: '',
        intro: '',
        logoUrl: '',
        website: '',
        registeredLatitude: null,
        registeredLongitude: null,
        businessLatitude: null,
        businessLongitude: null
      }
      this.logoFileList = []
      this.selectedAddress = ''
      this.selectedLatitude = null
      this.selectedLongitude = null
    },
    handleSubmit() {
      this.$refs.form.validate(async(valid) => {
        if (!valid) return

        this.submitLoading = true
        try {
          // 处理 Logo 上传（与民宿逻辑一致：手动上传，取返回的文件名/路径）
          if (this.logoFileList.length > 0) {
            const logo = this.logoFileList[0]
            if (logo.raw) {
              const fileName = await this.uploadImage(logo.raw)
              this.form.logoUrl = fileName
            } else if (logo.url) {
              this.form.logoUrl = this.extractLogoValue(logo)
            }
          } else {
            this.form.logoUrl = ''
          }

          const api = this.form.id ? updateTourCompany : createTourCompany
          const res = await api(this.form)

          if (res && res.code === 200) {
            this.$message.success(this.form.id ? '更新成功' : '创建成功')
            this.dialogVisible = false
            this.loadData()
          } else {
            this.$message.error(res.msg || '操作失败')
          }
        } catch (err) {
          this.$message.error(err.message || '操作失败')
        } finally {
          this.submitLoading = false
        }
      })
    },
    handleDelete(row) {
      this.$confirm('确认删除该公司？', '提示', { type: 'warning' })
        .then(async() => {
          const res = await deleteTourCompany(row.id)
          if (res && res.code === 200) {
            this.$message.success('删除成功')
            this.loadData()
          } else {
            this.$message.error(res.msg || '删除失败')
          }
        })
        .catch(() => {})
    },
    getImageUrl(imagePath) {
      if (!imagePath) return ''
      if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return imagePath
      }
      if (imagePath.startsWith('/uploads/')) {
        return this.baseUrl + imagePath
      }
      if (imagePath.startsWith('/')) {
        return this.baseUrl + imagePath
      }
      return this.baseUrl ? `${this.baseUrl}/uploads/${imagePath}` : imagePath
    },
    handleLogoChange(file, fileList) {
      if (fileList.length > 1) {
        this.$message.warning('Logo 仅限 1 张，已保留最新选择')
      }
      // 只保留最后一张
      this.logoFileList = fileList.slice(-1)
    },
    beforeLogoUpload(file) {
      const isImage = file.type.startsWith('image/')
      const isLt2M = file.size / 1024 / 1024 < 2
      if (!isImage) {
        this.$message.error('只能上传图片文件')
      }
      if (!isLt2M) {
        this.$message.error('图片大小不能超过 2MB')
      }
      // 阻止自动上传，走手动流程
      return false
    },
    handleLogoRemove() {
      this.form.logoUrl = ''
      this.logoFileList = []
    },
    async uploadImage(file) {
      const formData = new FormData()
      formData.append('file', file)
      const res = await request({
        url: '/api/file/upload',
        method: 'post',
        data: formData,
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      if (res && res.filename) return res.filename
      if (res && res.data && res.data.filename) return res.data.filename
      if (res && res.data && res.data.url) return res.data.url
      throw new Error('上传响应格式错误')
    },
    // 提取已有文件的值（与民宿逻辑一致，优先 filename，其次 url）
    extractLogoValue(file) {
      if (!file) return ''
      if (file.raw) return null // 交由上传处理
      if (file.url) {
        // 如果是完整 URL，直接返回
        if (file.url.startsWith('http://') || file.url.startsWith('https://')) {
          return file.url
        }
        // 如果带 baseUrl 前缀，去掉 baseUrl 只保留 /uploads/xxx
        if (this.baseUrl && file.url.startsWith(this.baseUrl)) {
          return file.url.replace(this.baseUrl, '')
        }
        // 其他情况仅取文件名
        return file.url.split('/').pop()
      }
      return ''
    },
    // 地图脚本检查
    loadAMapScript() {
      if (!window.AMap) {
        this.$message.error('高德地图脚本未加载，请检查 index.html 中的 key 和 securityJsCode')
      }
    },
    openMapDialog(target = 'registered') {
      this.mapTarget = target
      this.mapDialogVisible = true
      this.$nextTick(() => {
        this.initMap()
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
      const container = document.getElementById('mapContainer')
      if (!container) return

      const targetLat = this.mapTarget === 'business' ? this.form.businessLatitude : this.form.registeredLatitude
      const targetLng = this.mapTarget === 'business' ? this.form.businessLongitude : this.form.registeredLongitude
      const center = targetLat && targetLng ? [targetLng, targetLat] : [116.397428, 39.90923]

      this.map = new window.AMap.Map('mapContainer', {
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
      })
    },
    getAddressByCoordinates(lat, lng) {
      if (!window.AMap) return

      window.AMap.plugin('AMap.Geocoder', () => {
        const geocoder = new window.AMap.Geocoder()
        geocoder.getAddress([lng, lat], (status, result) => {
          if (status === 'complete' && result.info === 'OK') {
            this.selectedAddress = result.regeocode.formattedAddress
            if (this.selectedAddress) {
              if (this.mapTarget === 'business') {
                this.form.businessAddress = this.selectedAddress
              } else {
                this.form.registeredAddress = this.selectedAddress
              }
            }
          } else {
            this.selectedAddress = ''
          }
        })
      })
    },
    confirmLocation() {
      if (this.selectedLatitude && this.selectedLongitude) {
        if (this.mapTarget === 'business') {
          this.form.businessLatitude = this.selectedLatitude
          this.form.businessLongitude = this.selectedLongitude
          if (this.selectedAddress) this.form.businessAddress = this.selectedAddress
        } else {
          this.form.registeredLatitude = this.selectedLatitude
          this.form.registeredLongitude = this.selectedLongitude
          if (this.selectedAddress) this.form.registeredAddress = this.selectedAddress
        }
        this.mapDialogVisible = false
        this.$message.success('位置已选择')
      } else {
        this.$message.warning('请先在地图上选择位置')
      }
    },
    closeMapDialog() {
      if (this.map) {
        this.map.destroy()
        this.map = null
        this.marker = null
      }
    },
    getCurrentLocation(target = 'registered') {
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
              if (this.map) {
                const pos = [lng, lat]
                this.map.setCenter(pos)
                this.map.setZoom(15)
                if (this.marker) this.map.remove(this.marker)
                this.marker = new window.AMap.Marker({ position: pos, map: this.map })
              }
              this.getAddressByCoordinates(lat, lng)
              if (this.mapTarget === 'business') {
                this.form.businessLatitude = lat
                this.form.businessLongitude = lng
              } else {
                this.form.registeredLatitude = lat
                this.form.registeredLongitude = lng
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
    },
    // 手机号校验（必填）
    validateMobile(rule, value, callback) {
      const reg = /^1[3-9]\d{9}$/
      if (!value) return callback(new Error('请输入官方联系电话'))
      if (!reg.test(String(value).trim())) return callback(new Error('请输入以1开头的11位手机号'))
      callback()
    },
    // 手机号校验（可空）
    validateMobileOptional(rule, value, callback) {
      const reg = /^1[3-9]\d{9}$/
      if (!value) return callback()
      if (!reg.test(String(value).trim())) return callback(new Error('请输入以1开头的11位手机号'))
      callback()
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
  display: flex;
  gap: 6px;
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

.avatar-upload-hidden /deep/ .el-upload--picture-card {
  display: none;
}

.word-count {
  text-align: right;
  color: #909399;
  font-size: 12px;
  margin-top: 4px;
  line-height: 1;
}

.input-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 4px;
}

.input-footer .word-count {
  margin-top: 0;
}
</style>

