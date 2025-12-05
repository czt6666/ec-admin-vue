<template>
  <div class="station-container">
    <!-- 搜索区域 -->
    <el-card class="search-card">
      <el-form :inline="true" :model="queryParams" class="search-form">
        <el-form-item label="驿站名称">
          <el-input
            v-model="queryParams.name"
            placeholder="请输入驿站名称或关键字"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="营业状态">
          <el-select v-model="queryParams.status" placeholder="请选择" clearable style="width: 150px">
            <el-option label="营业中" :value="1" />
            <el-option label="暂停营业" :value="2" />
            <el-option label="已注销" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="handleSearch">搜索</el-button>
          <el-button icon="el-icon-refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 操作区域 -->
    <el-card class="table-card">
      <div slot="header" class="card-header">
        <el-button type="primary" icon="el-icon-plus" @click="handleAdd">新增驿站</el-button>
      </div>

      <!-- 表格 -->
      <el-table
        v-loading="loading"
        :data="tableData"
        border
        style="width: 100%"
      >
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column prop="name" label="驿站名称" min-width="200" show-overflow-tooltip />
        <el-table-column prop="unifiedSocialCreditCode" label="统一社会信用代码" width="180" />
        <el-table-column prop="legalRepresentative" label="法定代表人" width="120" />
        <el-table-column prop="serviceMode" label="服务模式" min-width="160" show-overflow-tooltip />
        <el-table-column prop="roomConfig" label="房型配置" min-width="140" show-overflow-tooltip />
        <el-table-column prop="careLevel" label="护理等级" min-width="140" show-overflow-tooltip />
        <el-table-column prop="priceRange" label="价格区间" min-width="140" show-overflow-tooltip />
        <el-table-column prop="officialPhone" label="官方联系电话" width="150" />
        <el-table-column label="营业状态" width="100" align="center">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.businessStatus === 1" type="success">营业中</el-tag>
            <el-tag v-else-if="scope.row.businessStatus === 2" type="warning">暂停营业</el-tag>
            <el-tag v-else-if="scope.row.businessStatus === 3" type="info">已注销</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="totalBeds" label="总床数" width="100" align="center" />
        <el-table-column prop="createTime" label="创建时间" width="180" align="center">
          <template slot-scope="scope">
            {{ formatDateTime(scope.row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" align="center" fixed="right">
          <template slot-scope="scope">
            <el-button type="text" size="small" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button type="text" size="small" style="color: #f56c6c" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          :current-page="pagination.page"
          :page-sizes="[10, 20, 50, 100]"
          :page-size="pagination.pageSize"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>

    <!-- 新增/编辑对话框 -->
    <el-dialog
      :title="dialogTitle"
      :visible.sync="dialogVisible"
      width="1200px"
      :close-on-click-modal="false"
      @close="handleDialogClose"
    >
      <el-form
        ref="form"
        :model="form"
        :rules="rules"
        label-width="140px"
        label-position="right"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="驿站名称" prop="name">
              <el-input v-model="form.name" placeholder="请输入驿站名称" maxlength="200" show-word-limit />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="统一社会信用代码" prop="unifiedSocialCreditCode">
              <el-input v-model="form.unifiedSocialCreditCode" placeholder="请输入统一社会信用代码" maxlength="50" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="注册地址" prop="registeredAddress">
              <el-input
                v-model="form.registeredAddress"
                type="textarea"
                :rows="2"
                placeholder="请输入注册地址"
                maxlength="500"
                show-word-limit
              />
              <div class="address-actions">
                <el-button type="primary" plain size="mini" @click="openMapDialog('registered')" style="margin-right: 6px;">
                  地图选址
                </el-button>
                <el-button type="default" plain size="mini" @click="getCurrentLocation('registered')">
                  获取当前位置
                </el-button>
              </div>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="经营地址" prop="businessAddress">
              <el-input
                v-model="form.businessAddress"
                type="textarea"
                :rows="2"
                placeholder="请输入经营地址"
                maxlength="500"
                show-word-limit
              />
              <div class="address-actions">
                <el-button type="primary" plain size="mini" @click="openMapDialog('business')" style="margin-right: 6px;">
                  地图选址
                </el-button>
                <el-button type="default" plain size="mini" @click="getCurrentLocation('business')">
                  获取当前位置
                </el-button>
              </div>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="法定代表人" prop="legalRepresentative">
              <el-input v-model="form.legalRepresentative" placeholder="请输入法定代表人" maxlength="100" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="主体类型">
              <el-select
                v-model="form.subjectTypeId"
                placeholder="请选择主体类型"
                clearable
                filterable
                style="width: 100%"
              >
                <el-option v-for="opt in subjectTypeOptions" :key="opt.id" :label="opt.name" :value="opt.id" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="注册资本（万元）">
              <el-input-number
                v-model="form.registeredCapital"
                :precision="2"
                :min="0"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="成立日期">
              <el-date-picker
                v-model="form.establishmentDate"
                type="date"
                placeholder="选择成立日期"
                value-format="yyyy-MM-dd"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="营业期限">
              <el-input v-model="form.businessTerm" placeholder="如：长期/2020-01-01至2050-01-01" maxlength="200" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="官方联系电话" prop="officialPhone">
              <el-input v-model="form.officialPhone" placeholder="请输入官方联系电话" maxlength="50" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="官方邮箱">
              <el-input v-model="form.officialEmail" placeholder="请输入官方邮箱" maxlength="100" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="紧急联系人" prop="emergencyContact">
              <el-input v-model="form.emergencyContact" placeholder="请输入紧急联系人" maxlength="100" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="紧急联系电话" prop="emergencyPhone">
              <el-input v-model="form.emergencyPhone" placeholder="请输入紧急联系电话" maxlength="50" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="营业状态" prop="businessStatus">
              <el-select v-model="form.businessStatus" placeholder="请选择" style="width: 100%">
                <el-option label="营业中" :value="1" />
                <el-option label="暂停营业" :value="2" />
                <el-option label="已注销" :value="3" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="服务模式">
              <el-input
                v-model="form.serviceMode"
                placeholder="如：机构住养,日间照料,上门服务,综合型（逗号分隔）"
                maxlength="200"
                show-word-limit
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="总床数">
              <el-input-number v-model="form.totalBeds" :min="0" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="房型配置">
              <el-select
                v-model="form.roomConfig"
                multiple
                collapse-tags
                filterable
                placeholder="请选择房型配置"
                style="width: 100%"
              >
                <el-option v-for="opt in roomConfigOptions" :key="opt" :label="opt" :value="opt" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="护理等级">
              <el-select
                v-model="form.careLevel"
                multiple
                collapse-tags
                filterable
                placeholder="请选择护理等级"
                style="width: 100%"
              >
                <el-option v-for="opt in careLevelOptions" :key="opt" :label="opt" :value="opt" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="价格区间">
              <el-input v-model="form.priceRange" placeholder="如：2000-5000元/月" maxlength="100" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="养老机构设立许可证编号">
              <el-input v-model="form.elderlyLicenseNo" placeholder="请输入许可证编号" maxlength="100" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="医疗机构执业许可证编号">
              <el-input v-model="form.medicalLicenseNo" placeholder="请输入许可证编号" maxlength="100" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="食品经营许可证编号">
              <el-input v-model="form.foodLicenseNo" placeholder="请输入许可证编号" maxlength="100" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="消防验收合格证明编号">
              <el-input v-model="form.fireAcceptanceNo" placeholder="请输入证明编号" maxlength="100" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="环境照片">
          <el-upload
            ref="photoUpload"
            :auto-upload="false"
            :on-change="handlePhotoChange"
            :on-remove="handlePhotoRemove"
            :before-upload="beforePhotoUpload"
            :file-list="photoList"
            accept="image/*"
            :limit="20"
            action=""
            list-type="picture-card"
          >
            <i class="el-icon-plus" />
            <div slot="tip" class="el-upload__tip">只能上传 jpg/png 文件，且不超过 2MB，最多20张</div>
          </el-upload>
        </el-form-item>
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
import { listStation, getStation, createStation, updateStation, deleteStation, uploadFile } from '@/api/station'

export default {
  name: 'StationManagement',
  data() {
    return {
      loading: false,
      submitLoading: false,
      queryParams: {
        name: '',
        status: null,
        keyword: ''
      },
      tableData: [],
      pagination: {
        page: 1,
        pageSize: 10,
        total: 0
      },
      dialogVisible: false,
      dialogTitle: '新增驿站',
      isEdit: false,
      form: {
        id: null,
        name: '',
        registeredAddress: '',
        businessAddress: '',
        registeredLatitude: null,
        registeredLongitude: null,
        businessLatitude: null,
        businessLongitude: null,
        unifiedSocialCreditCode: '',
        legalRepresentative: '',
        registeredCapital: null,
        establishmentDate: null,
        businessTerm: '',
        officialPhone: '',
        emergencyContact: '',
        emergencyPhone: '',
        officialEmail: '',
        subjectTypeId: null,
        serviceMode: '',
        elderlyLicenseNo: '',
        medicalLicenseNo: '',
        foodLicenseNo: '',
        fireAcceptanceNo: '',
        businessStatus: 1,
        totalBeds: 0,
        roomConfig: [],
        careLevel: [],
        priceRange: '',
        environmentPhotos: ''
      },
      rules: {
        name: [
          { required: true, message: '请输入驿站名称', trigger: 'blur' }
        ],
        registeredAddress: [
          { required: true, message: '请输入注册地址', trigger: 'blur' }
        ],
        businessAddress: [
          { required: true, message: '请输入经营地址', trigger: 'blur' }
        ],
        unifiedSocialCreditCode: [
          { required: true, message: '请输入统一社会信用代码', trigger: 'blur' }
        ],
        legalRepresentative: [
          { required: true, message: '请输入法定代表人', trigger: 'blur' }
        ],
        officialPhone: [
          { required: true, message: '请输入官方联系电话', trigger: 'blur' },
          { pattern: /^\d{11}$/, message: '请输入11位数字手机号', trigger: 'blur' }
        ],
        emergencyContact: [
          { required: true, message: '请输入紧急联系人', trigger: 'blur' }
        ],
        emergencyPhone: [
          { required: true, message: '请输入紧急联系电话', trigger: 'blur' },
          { pattern: /^\d{11}$/, message: '请输入11位数字手机号', trigger: 'blur' }
        ],
        businessStatus: [
          { required: true, message: '请选择营业状态', trigger: 'change' }
        ]
      },
      photoList: [],
      mapDialogVisible: false,
      map: null,
      marker: null,
      selectedAddress: '',
      selectedLatitude: null,
      selectedLongitude: null,
      mapTarget: 'registered', // 'registered' | 'business'
      // 预览与拼接使用的基础地址，可按环境修改
      baseUrl: process.env.VUE_APP_BASE_API || 'http://localhost:8020',
      roomConfigOptions: ['单人', '多人'],
      careLevelOptions: ['自理', '半自理', '非自理'],
      subjectTypeOptions: []
    }
  },
  computed: {
    registeredCoordinateText() {
      if (this.form.registeredLatitude && this.form.registeredLongitude) {
        return `${this.form.registeredLatitude}, ${this.form.registeredLongitude}`
      }
      return ''
    },
    businessCoordinateText() {
      if (this.form.businessLatitude && this.form.businessLongitude) {
        return `${this.form.businessLatitude}, ${this.form.businessLongitude}`
      }
      return ''
    }
  },
  mounted() {
    // 可按需从 /api/file/getConfig 获取 baseUrl，这里使用环境变量/默认值
    this.loadData()
    this.loadSubjectTypes()
    // 加载高德地图API
    this.loadAMapScript()
  },
  methods: {
    // 加载主体类型选项（需后端提供接口）
    async loadSubjectTypes() {
      try {
        // TODO: 替换为真实接口，如 getSubjectTypeList()
        // 假数据占位，后端返回格式假定为 [{id: 1, name: '养老机构'}, ...]
        // const res = await getSubjectTypeList()
        // if (res.code === 200) this.subjectTypeOptions = res.data || []
        this.subjectTypeOptions = [
          { id: 1, name: '养老机构' },
          { id: 2, name: '社区养老' },
          { id: 3, name: '居家养老' },
          { id: 4, name: '老年医院' },
          { id: 5, name: '养老服务中心' }
        ]
      } catch (e) {
        this.$message.error('加载主体类型失败')
      }
    },
    // 拼接图片完整 URL
    getImageUrl(imagePath) {
      if (!imagePath) return ''
      // 已经是完整 URL
      if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return imagePath
      }
      // 后端返回的 /uploads/ 相对路径
      if (imagePath.startsWith('/uploads/')) {
        return `${this.baseUrl}${imagePath}`
      }
      // 仅文件名的场景
      return `${this.baseUrl}/uploads/${imagePath}`
    },
    // 加载数据
    async loadData() {
      this.loading = true
      try {
        const params = {
          page: this.pagination.page,
          pageSize: this.pagination.pageSize,
          ...this.queryParams
        }
        const res = await listStation(params)
        if (res.code === 200) {
          this.tableData = res.data.records || res.data.list || []
          this.pagination.total = res.data.total || 0
        }
      } catch (error) {
        this.$message.error('加载数据失败')
      } finally {
        this.loading = false
      }
    },
    // 搜索
    handleSearch() {
      this.pagination.page = 1
      this.loadData()
    },
    // 重置
    handleReset() {
      this.queryParams = {
        name: '',
        status: null,
        keyword: ''
      }
      this.handleSearch()
    },
    // 分页大小改变
    handleSizeChange(val) {
      this.pagination.pageSize = val
      this.pagination.page = 1
      this.loadData()
    },
    // 页码改变
    handlePageChange(val) {
      this.pagination.page = val
      this.loadData()
    },
    // 新增
    handleAdd() {
      this.dialogTitle = '新增驿站'
      this.isEdit = false
      this.resetForm()
      this.dialogVisible = true
    },
    // 编辑
    async handleEdit(row) {
      this.dialogTitle = '编辑驿站'
      this.isEdit = true
      try {
        const res = await getStation(row.id)
        if (res.code === 200) {
          this.form = { ...res.data }
          // 多选字段回显
          this.form.roomConfig = res.data.roomConfig ? res.data.roomConfig.split(',').filter(Boolean) : []
          this.form.careLevel = res.data.careLevel ? res.data.careLevel.split(',').filter(Boolean) : []
          // 主体类型回显：确保选项中包含当前值
          if (this.form.subjectTypeId && !this.subjectTypeOptions.find(o => o.id === this.form.subjectTypeId)) {
            this.subjectTypeOptions.push({ id: this.form.subjectTypeId, name: `类型${this.form.subjectTypeId}` })
          }
          // 处理环境照片
          if (this.form.environmentPhotos) {
            const photos = this.form.environmentPhotos.split(',').filter(p => p)
            this.photoList = photos.map(url => {
              const clean = url.trim()
              return {
                url: this.getImageUrl(clean),
                name: clean.split('/').pop()
              }
            })
          } else {
            this.photoList = []
          }
          // 坐标回显：优先注册地址，其次经营地址
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
          this.dialogVisible = true
        }
      } catch (error) {
        this.$message.error('获取详情失败')
      }
    },
    // 删除
    handleDelete(row) {
      this.$confirm('删除后，驿站信息不可恢复，确认是否删除？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async() => {
        try {
          const res = await deleteStation(row.id)
          if (res.code === 200) {
            this.$message.success('删除成功')
            this.loadData()
          } else {
            this.$message.error(res.msg || '删除失败')
          }
        } catch (error) {
          this.$message.error('删除失败')
        }
      }).catch(() => {})
    },
    // 提交表单
    async handleSubmit() {
      this.$refs.form.validate(async(valid) => {
        if (!valid) return

        // 前端重复名称校验（同一页数据防重，后端仍需最终校验）
        const dup = this.tableData.find(
          item => item.name === this.form.name && item.id !== this.form.id
        )
        if (dup) {
          this.$message.error('驿站名称已存在，请更换名称')
          return
        }

        // 将多选下拉转为逗号分隔字符串提交
        const payload = { ...this.form }
        if (Array.isArray(payload.roomConfig)) {
          payload.roomConfig = payload.roomConfig.join(',')
        }
        if (Array.isArray(payload.careLevel)) {
          payload.careLevel = payload.careLevel.join(',')
        }

        // 上传环境照片
        const newPhotos = []
        for (const file of this.photoList) {
          if (file.raw) {
            // 新上传的文件
            try {
              const uploadRes = await uploadFile(file.raw)
              if (uploadRes.code === 200) {
                // 保存相对路径，后端返回 url 为 /uploads/xxx
                newPhotos.push(uploadRes.data.url)
              }
            } catch (error) {
              this.$message.error(`上传图片 ${file.name} 失败`)
              return
            }
          } else if (file.url) {
            // 已存在的文件
            const url = file.url.startsWith('http') ? file.url.replace(/^https?:\/\/[^/]+/, '') : file.url
            newPhotos.push(url)
          }
        }
        payload.environmentPhotos = newPhotos.join(',')

        this.submitLoading = true
        try {
          const api = this.isEdit ? updateStation : createStation
          const res = await api(payload)
          if (res.code === 200) {
            this.$message.success(this.isEdit ? '更新成功' : '新增成功')
            this.dialogVisible = false
            this.loadData()
          } else {
            this.$message.error(res.msg || '操作失败')
          }
        } catch (error) {
          this.$message.error('操作失败')
        } finally {
          this.submitLoading = false
        }
      })
    },
    // 重置表单
    resetForm() {
      this.form = {
        id: null,
        name: '',
        registeredAddress: '',
        businessAddress: '',
        registeredLatitude: null,
        registeredLongitude: null,
        businessLatitude: null,
        businessLongitude: null,
        unifiedSocialCreditCode: '',
        legalRepresentative: '',
        registeredCapital: null,
        establishmentDate: null,
        businessTerm: '',
        officialPhone: '',
        emergencyContact: '',
        emergencyPhone: '',
        officialEmail: '',
        subjectTypeId: null,
        serviceMode: '',
        elderlyLicenseNo: '',
        medicalLicenseNo: '',
        foodLicenseNo: '',
        fireAcceptanceNo: '',
        businessStatus: 1,
        totalBeds: 0,
        roomConfig: [],
        careLevel: [],
        priceRange: '',
        environmentPhotos: ''
      }
      this.photoList = []
      this.selectedAddress = ''
      this.selectedLatitude = null
      this.selectedLongitude = null
      if (this.$refs.form) {
        this.$refs.form.resetFields()
      }
    },
    // 对话框关闭
    handleDialogClose() {
      this.resetForm()
    },
    // 照片上传前检查
    beforePhotoUpload(file) {
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
      return true
    },
    // 照片变化
    handlePhotoChange(file, fileList) {
      this.photoList = fileList
    },
    // 照片移除
    handlePhotoRemove(file, fileList) {
      this.photoList = fileList
    },
    // 格式化日期时间
    formatDateTime(dateTime) {
      if (!dateTime) return ''
      const date = new Date(dateTime)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')
      const seconds = String(date.getSeconds()).padStart(2, '0')
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
    },
    // 加载高德地图脚本
    loadAMapScript() {
      if (!window.AMap) {
        this.$message.error('高德地图脚本未加载，请检查 index.html 中的 key 和 securityJsCode')
      }

    },
    // 打开地图对话框
    openMapDialog(target = 'registered') {
      this.mapTarget = target
      this.mapDialogVisible = true
      this.$nextTick(() => {
        this.initMap()
      })
    },
    // 初始化地图
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

      // 如果有已有坐标，使用已有坐标，否则使用默认坐标（北京）
      const targetLat = this.mapTarget === 'business' ? this.form.businessLatitude : this.form.registeredLatitude
      const targetLng = this.mapTarget === 'business' ? this.form.businessLongitude : this.form.registeredLongitude
      const center = targetLat && targetLng
        ? [targetLng, targetLat]
        : [116.397428, 39.90923]

      this.map = new window.AMap.Map('mapContainer', {
        zoom: 13,
        center: center
      })

      // 添加标记
      if (targetLat && targetLng) {
        this.marker = new window.AMap.Marker({
          position: [targetLng, targetLat],
          map: this.map
        })
      }

      // 地图点击事件
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

        // 逆地理编码获取地址
        this.getAddressByCoordinates(lat, lng)
      })
    },
    // 根据坐标获取地址
    getAddressByCoordinates(lat, lng) {
      if (!window.AMap) return

      // 1.x 版本需先加载插件，否则会出现“Geocoder is not a constructor”
      window.AMap.plugin('AMap.Geocoder', () => {
        const geocoder = new window.AMap.Geocoder()
        geocoder.getAddress([lng, lat], (status, result) => {
          if (status === 'complete' && result.info === 'OK') {
            this.selectedAddress = result.regeocode.formattedAddress
            // 按当前目标同步地址（注册/经营）
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
    // 确认位置
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
    // 关闭地图对话框
    closeMapDialog() {
      if (this.map) {
        this.map.destroy()
        this.map = null
        this.marker = null
      }
    },
    // 获取当前位置（高德定位，与民宿逻辑保持一致）
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
              // 同步到目标坐标
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
    // 清除坐标（与民宿逻辑保持一致）
    clearCoordinates(target = 'registered') {
      if (target === 'business') {
        this.form.businessLatitude = null
        this.form.businessLongitude = null
      } else {
        this.form.registeredLatitude = null
        this.form.registeredLongitude = null
      }
      this.selectedLatitude = null
      this.selectedLongitude = null
      this.selectedAddress = ''
      this.$message.info('已清除坐标')
    }
  }
}
</script>

<style scoped>
.station-container {
  padding: 20px;
}

.search-card {
  margin-bottom: 20px;
}

.search-form {
  margin-bottom: 0;
}

.table-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pagination-container {
  margin-top: 20px;
  text-align: right;
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

