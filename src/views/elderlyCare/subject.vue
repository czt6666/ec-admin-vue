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
            <el-option label="待审核" :value="2" />
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
        <!-- 导入/导出仅管理员可见 -->
        <el-button
          v-if="isAdmin"
          type="success"
          icon="el-icon-upload2"
          @click="handleImport"
        >导入</el-button>
        <el-button
          v-if="isAdmin"
          type="warning"
          icon="el-icon-download"
          @click="handleExport"
        >导出</el-button>
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
        <el-table-column prop="userName" label="关联用户" width="140" show-overflow-tooltip />
        <el-table-column prop="introduction" label="简介" min-width="200" show-overflow-tooltip />
        <el-table-column prop="unifiedSocialCreditCode" label="统一社会信用代码" width="180" />
        <el-table-column prop="legalRepresentative" label="法定代表人" width="120" />
        <el-table-column prop="serviceMode" label="服务模式" min-width="160" show-overflow-tooltip />
        <el-table-column label="主体类型" min-width="140" show-overflow-tooltip>
          <template slot-scope="scope">
            {{ getSubjectTypeName(scope.row.subjectTypeId) || '—' }}
          </template>
        </el-table-column>
        <el-table-column prop="roomConfig" label="房型配置" min-width="140" show-overflow-tooltip />
        <el-table-column prop="careLevel" label="护理等级" min-width="140" show-overflow-tooltip />
        <el-table-column prop="priceRange" label="价格区间" min-width="140" show-overflow-tooltip />
        <el-table-column prop="officialPhone" label="官方联系电话" width="150" />
        <el-table-column label="营业状态" width="100" align="center">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.businessStatus === 1" type="success">营业中</el-tag>
            <el-tag v-else-if="scope.row.businessStatus === 2 || scope.row.businessStatus === 3" type="info">待审核</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="totalBeds" label="总床数" width="100" align="center" />
        <el-table-column prop="createTime" label="创建时间" width="180" align="center">
          <template slot-scope="scope">
            {{ formatDateTime(scope.row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="260" align="center" fixed="right">
          <template slot-scope="scope">
            <el-button type="primary" size="small" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button
              v-if="isAdmin && scope.row.businessStatus !== 1"
              type="success"
              size="small"
              @click="handlePublish(scope.row)"
            >上架</el-button>
            <el-button
              v-if="isAdmin && scope.row.businessStatus === 1"
              type="warning"
              size="small"
              @click="handleUnpublish(scope.row)"
            >下架</el-button>
            <el-button type="danger" size="small" @click="handleDelete(scope.row)">删除</el-button>
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
              <el-input v-model="form.name" placeholder="请输入驿站名称" maxlength="200" />
              <div class="word-count">{{ (form.name || '').length }}/200</div>
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
              />
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
            <el-form-item label="经营地址" prop="businessAddress">
              <el-input
                v-model="form.businessAddress"
                type="textarea"
                :rows="2"
                placeholder="请输入经营地址"
                maxlength="500"
              />
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
              <el-input
                v-model="form.establishmentDate"
                placeholder="请输入成立日期，如：2020-01-01"
                maxlength="50"
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
            <el-form-item label="关联用户" prop="userId">
              <el-select
                v-model="form.userId"
                filterable
                placeholder="选择关联用户（仅管理员可改）"
                :loading="userLoading"
                style="width: 100%"
                :disabled="businessStatusDisabled"
              >
                <el-option
                  v-for="item in userOptions"
                  :key="item.id"
                  :label="item.username"
                  :value="item.id"
                />
              </el-select>
              <div v-if="businessStatusDisabled" class="form-tip">商户新增/编辑时自动绑定当前登录用户</div>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="紧急联系人" prop="emergencyContact">
              <el-input v-model="form.emergencyContact" placeholder="请输入紧急联系人" maxlength="100" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="紧急联系电话" prop="emergencyPhone">
              <el-input v-model="form.emergencyPhone" placeholder="请输入紧急联系电话" maxlength="50" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="营业状态" prop="businessStatus">
              <el-select
                v-model="form.businessStatus"
                placeholder="请选择"
                style="width: 100%"
                :disabled="businessStatusDisabled"
              >
                <el-option label="营业中" :value="1" />
                <el-option label="待审核" :value="2" />
              </el-select>
              <div v-if="businessStatusDisabled" class="form-tip">商户新增/编辑时营业状态由后台审核决定</div>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="服务模式">
              <el-select
                v-model="form.serviceMode"
                multiple
                collapse-tags
                filterable
                placeholder="请选择服务模式"
                style="width: 100%"
              >
                <el-option v-for="opt in serviceModeOptions" :key="opt.id" :label="opt.name" :value="opt.name" />
              </el-select>
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

        <el-form-item label="机构简介">
          <el-input
            v-model="form.introduction"
            type="textarea"
            :rows="3"
            placeholder="请输入机构简介"
            maxlength="1024"
          />
          <div class="word-count">{{ (form.introduction || '').length }}/1024</div>
        </el-form-item>

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
            <div slot="tip" class="el-upload__tip">只能上传 jpg/png 文件，单张不超过 400KB，总共不超过 2MB，最多20张</div>
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
        <div id="mapContainer" style="width: 100%; height: 400px" />
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

    <!-- 导入对话框 -->
    <el-dialog
      title="导入驿站信息"
      :visible.sync="importDialogVisible"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-upload
        ref="upload"
        :auto-upload="false"
        :on-change="handleFileChange"
        :file-list="fileList"
        :limit="1"
        accept=".xlsx,.xls"
        action=""
        drag
      >
        <i class="el-icon-upload" />
        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
        <div slot="tip" class="el-upload__tip">只能上传 xlsx/xls 文件，且不超过 10MB</div>
      </el-upload>
      <div slot="footer" class="dialog-footer">
        <el-button @click="importDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="importLoading" @click="handleImportSubmit">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listStation, getStation, createStation, updateStation, deleteStation, uploadFile, importStation, exportStation, publishStation, unpublishStation } from '@/api/station'
import { getList as getSubjectTypeList } from '@/api/elderlyCare/subjectType'
import { getList as getServiceModeList } from '@/api/elderlyCare/serviceMode'
import { getCurrentUser, listUserOptions } from '@/api/user'

export default {
  name: 'StationManagement',
  data() {
    return {
      loading: false,
      submitLoading: false,
      isAdmin: null, // true:管理员，false:商户，null:未判定
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
        userId: null,
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
        serviceMode: [],
        elderlyLicenseNo: '',
        medicalLicenseNo: '',
        foodLicenseNo: '',
        fireAcceptanceNo: '',
        businessStatus: 2, // 默认暂停/待审核；管理员可改为营业中
        totalBeds: 0,
        roomConfig: [],
        careLevel: [],
        priceRange: '',
        environmentPhotos: '',
        introduction: ''
      },
      rules: {
        name: [
          { required: true, message: '请输入驿站名称', trigger: 'blur' }
        ],
        userId: [
          { required: false, message: '请选择关联用户', trigger: 'change' }
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
      searchAddress: '',
      searchLoading: false,
      addressSuggestions: [],
      showSuggestions: false,
      autoComplete: null,
      // 预览与拼接使用的基础地址，可按环境修改
      baseUrl: process.env.VUE_APP_BASE_API || 'https://dzk.czt666.cn/api',
      roomConfigOptions: ['单人', '多人'],
      importDialogVisible: false,
      importLoading: false,
      fileList: [],
      careLevelOptions: ['自理', '半自理', '非自理'],
      subjectTypeOptions: [],
      serviceModeOptions: [],
      userOptions: [],
      userLoading: false
    }
  },
  computed: {
    businessStatusDisabled() {
      // 非管理员不允许手动改营业状态（后端也会强制校验）
      return this.isAdmin === false
    },
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
    this.checkUserPermission().finally(() => {
      this.loadData()
    })
    this.loadSubjectTypes()
    this.loadServiceModes()
    // 加载高德地图API
    this.loadAMapScript()
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
        const res = await listUserOptions()
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
    // 加载主体类型选项（真实接口）
    async loadSubjectTypes() {
      try {
        const res = await getSubjectTypeList({ page: 1, limit: 9999, status: 1 })
        if (res && res.code === 200) {
          const raw = res.data || {}
          const list = raw.records || raw.list || raw || []
          this.subjectTypeOptions = (Array.isArray(list) ? list : []).map(item => ({
            id: item.id,
            name: item.typeName
          }))
        }
      } catch (e) {
        this.$message.error('加载主体类型失败')
      }
    },
    // 加载服务模式选项（真实接口）
    async loadServiceModes() {
      try {
        const res = await getServiceModeList({ page: 1, limit: 9999, status: 1 })
        if (res && res.code === 200) {
          const raw = res.data || {}
          const list = raw.records || raw.list || raw || []
          this.serviceModeOptions = (Array.isArray(list) ? list : []).map(item => ({
            id: item.id,
            name: item.modeName
          }))
        }
      } catch (e) {
        this.$message.error('加载服务模式失败')
      }
    },
    // 拼接图片完整 URL（与民宿等模块保持一致）
    getImageUrl(imagePath) {
      if (!imagePath) return ''
      let p = (imagePath || '').trim()

      // 已经是完整 URL
      if (p.startsWith('http://') || p.startsWith('https://')) {
        return p
      }

      // 归一化路径：如果包含 /uploads/，从这里开始截断，去掉可能存在的 /api 前缀
      const idx = p.indexOf('/uploads/')
      if (idx !== -1) {
        p = p.substring(idx) // 形如 "/uploads/xxx"
      }

      const base = this.baseUrl || (process.env.VUE_APP_BASE_API || 'https://dzk.czt666.cn/api')

      // 如果是以 /uploads/ 开头，直接拼在 base 后面（会变成 .../api/uploads/xxx）
      if (p.startsWith('/uploads/')) {
        return base + p
      }

      // 否则视为纯文件名，补上 /uploads 前缀
      return `${base}/uploads/${p}`
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
      // 商户无需也不能选用户；管理员可选择关联用户
      if (!this.isAdmin) {
        this.form.userId = null
      }
      this.dialogVisible = true
      this.$nextTick(() => this.$refs.form && this.$refs.form.clearValidate())
    },
    // 编辑
    async handleEdit(row) {
      this.dialogTitle = '编辑驿站'
      this.isEdit = true
      try {
        const res = await getStation(row.id)
        if (res.code === 200) {
          this.form = { ...res.data }
          // 关联用户回显（仅管理员可见，可在 options 中追加）
          if (this.isAdmin && this.form.userId && !this.userOptions.find(o => o.id === this.form.userId)) {
            this.userOptions.push({ id: this.form.userId, username: this.form.userName || `用户${this.form.userId}` })
          }
          // 多选字段回显
          this.form.roomConfig = res.data.roomConfig ? res.data.roomConfig.split(',').filter(Boolean) : []
          this.form.careLevel = res.data.careLevel ? res.data.careLevel.split(',').filter(Boolean) : []
          // 服务模式回显：将逗号分隔字符串转为数组
          if (res.data.serviceMode) {
            const modeNames = res.data.serviceMode.split(',').filter(Boolean).map(s => s.trim())
            this.form.serviceMode = modeNames
            // 确保选项中包含当前值（如果选项中没有，添加到选项中）
            modeNames.forEach(modeName => {
              if (!this.serviceModeOptions.find(o => o.name === modeName)) {
                this.serviceModeOptions.push({ id: null, name: modeName })
              }
            })
          } else {
            this.form.serviceMode = []
          }
          // 主体类型回显：确保选项中包含当前值
          if (this.form.subjectTypeId && !this.subjectTypeOptions.find(o => o.id === this.form.subjectTypeId)) {

          }
          // 处理环境照片（现在后端返回数组格式）
          if (this.form.environmentPhotos && Array.isArray(this.form.environmentPhotos)) {
            this.photoList = this.form.environmentPhotos.map(url => {
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
    // 上架驿站（仅管理员）
    handlePublish(row) {
      this.$confirm('确定要上架该驿站吗？上架后将在小程序端显示', '上架确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async() => {
        try {
          const res = await publishStation(row.id)
          if (res && res.code === 200) {
            this.$message.success('上架成功')
            this.loadData()
          } else {
            this.$message.error((res && res.msg) || '上架失败')
          }
        } catch (e) {
          this.$message.error((e && e.message) || '上架失败')
        }
      }).catch(() => {})
    },
    // 下架驿站（仅管理员）
    handleUnpublish(row) {
      this.$confirm('确定要下架该驿站吗？下架后将不在小程序端显示', '下架确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async() => {
        try {
          const res = await unpublishStation(row.id)
          if (res && res.code === 200) {
            this.$message.success('下架成功')
            this.loadData()
          } else {
            this.$message.error((res && res.msg) || '下架失败')
          }
        } catch (e) {
          this.$message.error((e && e.message) || '下架失败')
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
        if (Array.isArray(payload.serviceMode)) {
          payload.serviceMode = payload.serviceMode.join(',')
        }

        // 商户不允许手动改营业状态，也不提交 userId；后端有二次校验
        if (this.isAdmin === false) {
          if (this.isEdit) {
            delete payload.businessStatus
          } else {
            payload.businessStatus = 2
          }
          delete payload.userId
        }

        // 上传环境照片（保存后端返回的相对路径 /uploads/xxx）
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
        userId: null,
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
        serviceMode: [],
        elderlyLicenseNo: '',
        medicalLicenseNo: '',
        foodLicenseNo: '',
        fireAcceptanceNo: '',
        businessStatus: 2,
        totalBeds: 0,
        roomConfig: [],
        careLevel: [],
        priceRange: '',
        environmentPhotos: '',
        introduction: ''
      }
      this.photoList = []
      this.selectedAddress = ''
      this.selectedLatitude = null
      this.selectedLongitude = null
      if (this.$refs.form) {
        this.$refs.form.resetFields()
      }
    },
    // 根据主体类型ID获取名称
    getSubjectTypeName(id) {
      if (!id) return ''
      const found = this.subjectTypeOptions.find(o => o.id === id)
      return found ? found.name : ''
    },
    // 对话框关闭
    handleDialogClose() {
      this.resetForm()
    },
    // 照片上传前检查
    beforePhotoUpload(file) {
      const isImage = file.type.startsWith('image/')
      const isLt400K = file.size / 1024 < 400

      if (!isImage) {
        this.$message.error('只能上传图片文件!')
        return false
      }
      if (!isLt400K) {
        this.$message.error('图片大小不能超过400KB!')
        return false
      }
      return true
    },
    // 照片变化
    handlePhotoChange(file, fileList) {
      // 计算所有图片的总大小（单位：字节）
      let totalSize = 0
      for (const item of fileList) {
        if (item.raw) {
          totalSize += item.raw.size
        } else if (item.size) {
          totalSize += item.size
        }
      }

      // 检查总大小是否超过2MB
      const totalSizeMB = totalSize / 1024 / 1024
      if (totalSizeMB > 2) {
        this.$message.error(`所有图片总大小不能超过2MB，当前总大小：${totalSizeMB.toFixed(2)}MB`)
        // 移除最后一张图片
        this.photoList = fileList.slice(0, -1)
        return
      }

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
        this.selectedAddress = ''

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
    },
    // 导入
    handleImport() {
      if (!this.isAdmin) {
        this.$message.warning('仅管理员可以导入驿站信息')
        return
      }
      this.importDialogVisible = true
      this.fileList = []
    },
    // 文件选择变化
    handleFileChange(file, fileList) {
      this.fileList = fileList
    },
    // 提交导入
    async handleImportSubmit() {
      if (this.fileList.length === 0) {
        this.$message.warning('请选择要导入的文件')
        return
      }
      const file = this.fileList[0].raw
      if (!file) {
        this.$message.warning('文件不存在')
        return
      }
      // 检查文件类型
      const fileName = file.name
      const fileExt = fileName.substring(fileName.lastIndexOf('.') + 1).toLowerCase()
      if (fileExt !== 'xlsx' && fileExt !== 'xls') {
        this.$message.warning('只能上传 xlsx/xls 文件')
        return
      }
      // 检查文件大小（10MB）
      if (file.size > 10 * 1024 * 1024) {
        this.$message.warning('文件大小不能超过 10MB')
        return
      }
      this.importLoading = true
      try {
        const res = await importStation(file)
        if (res && res.code === 200) {
          const result = res.data
          const successCount = result.successCount || 0
          const errorCount = result.errorCount || 0
          const errorMessages = result.errorMessages || []
          let message = `导入完成！成功：${successCount} 条，失败：${errorCount} 条`
          if (errorMessages.length > 0) {
            message += '\n错误详情：\n' + errorMessages.slice(0, 10).join('\n')
            if (errorMessages.length > 10) {
              message += `\n...还有 ${errorMessages.length - 10} 条错误`
            }
          }
          if (errorCount > 0) {
            this.$message({
              message: message,
              type: 'warning',
              duration: 10000
            })
          } else {
            this.$message.success(message)
          }
          this.importDialogVisible = false
          this.fileList = []
          this.loadData()
        } else {
          this.$message.error(res.msg || '导入失败')
        }
      } catch (error) {
        console.error('导入失败', error)
        let errorMsg = '未知错误'
        if (error.response && error.response.data) {
          if (typeof error.response.data === 'string') {
            errorMsg = error.response.data
          } else if (error.response.data.msg) {
            errorMsg = error.response.data.msg
          } else if (error.response.data.message) {
            errorMsg = error.response.data.message
          }
        } else if (error.message) {
          errorMsg = error.message
        }
        this.$message.error('导入失败：' + errorMsg)
      } finally {
        this.importLoading = false
      }
    },
    // 导出
    async handleExport() {
      if (!this.isAdmin) {
        this.$message.warning('仅管理员可以导出驿站信息')
        return
      }
      try {
        this.$message.info('正在导出，请稍候...')
        // 直接使用 axios 或 request 的底层实现来处理 blob
        const axios = require('axios').default || require('axios')
        const response = await axios.get(`${this.baseUrl}/admin/ecadmin/station/export`, {
          responseType: 'blob'
        })

        // axios 返回的 blob 在 response.data 中
        const blob = response.data

        // 验证 blob 是否有效
        if (!blob || !(blob instanceof Blob)) {
          // 尝试读取错误信息（可能是 JSON 格式的错误响应）
          const text = await blob.text()
          try {
            const errorData = JSON.parse(text)
            throw new Error(errorData.msg || errorData.message || '导出失败')
          } catch (e) {
            throw new Error('服务器返回了无效的数据格式')
          }
        }

        if (blob.size === 0) {
          throw new Error('导出的文件为空')
        }

        // 创建下载链接
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        const fileName = `驿站信息_${new Date().toISOString().slice(0, 10).replace(/-/g, '')}.xlsx`
        link.setAttribute('download', fileName)
        document.body.appendChild(link)
        link.click()
        // 延迟移除，确保下载开始
        setTimeout(() => {
          document.body.removeChild(link)
          window.URL.revokeObjectURL(url)
        }, 100)
        this.$message.success('导出成功')
      } catch (error) {
        console.error('导出失败', error)
        const errorMsg = error.message || error.toString() || '未知错误'
        this.$message.error('导出失败：' + errorMsg)
      }
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
  align-items: center;
  gap: 10px;
}

.pagination-container {
  margin-top: 20px;
  text-align: right;
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


