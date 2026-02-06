<template>
  <div class="app-container">
    <!-- 搜索区域 -->
    <div class="filter-container">
      <el-form :inline="true" :model="listQuery" class="demo-form-inline">
        <el-form-item label="方案名称：">
          <el-input
            v-model="listQuery.planName"
            placeholder="方案名称"
            clearable
            style="width: 200px"
          ></el-input>
        </el-form-item>
        <el-form-item label="所属基地：">
          <el-select
            v-model="listQuery.baseId"
            placeholder="请选择基地"
            clearable
            style="width: 200px"
          >
            <el-option
              v-for="item in baseOptions"
              :key="item.id"
              :label="item.baseName"
              :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="方案状态：">
          <el-select
            v-model="listQuery.status"
            placeholder="请选择状态"
            clearable
            style="width: 200px"
          >
            <el-option
              v-for="item in statusOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSearchList">
            <i class="el-icon-search"></i> 搜索
          </el-button>
          <el-button @click="handleResetSearch">
            <i class="el-icon-refresh"></i> 重置
          </el-button>
          <el-button type="primary" @click="handleAdd">
            <i class="el-icon-plus"></i> 新增方案
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 数据表格 -->
    <div class="table-container">
      <el-table
        ref="productTable"
        :data="list"
        style="width: 100%"
        v-loading="listLoading"
        border
      >
        <el-table-column label="编号" width="80" align="center">
          <template slot-scope="scope">{{ scope.row.id }}</template>
        </el-table-column>
        <el-table-column label="方案名称" align="center">
          <template slot-scope="scope">{{ scope.row.planName }}</template>
        </el-table-column>
        <el-table-column label="所属基地" align="center">
          <template slot-scope="scope">
            {{ getBaseName(scope.row.baseId) }}
          </template>
        </el-table-column>
        <el-table-column label="研学时长" align="center">
          <template slot-scope="scope">{{ scope.row.duration }}</template>
        </el-table-column>
        <el-table-column label="适用人群" align="center">
          <template slot-scope="scope">{{ scope.row.suitableCrowd }}</template>
        </el-table-column>
        <el-table-column label="方案状态" align="center">
          <template slot-scope="scope">
            <el-tag :type="scope.row.status | statusFilter">
              {{ scope.row.status | statusTextFilter }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" align="center">
          <template slot-scope="scope">{{ scope.row.createTime | formatDateTime }}</template>
        </el-table-column>
        <el-table-column label="操作" width="260" align="center">
          <template slot-scope="scope">
            <el-button
              size="mini"
              type="primary"
              @click="handleUpdate(scope.$index, scope.row)"
            >
              编辑
            </el-button>
            <el-button
              v-if="isAdmin && scope.row.status === 0"
              size="mini"
              type="success"
              @click="handlePublish(scope.row)"
            >
              上架
            </el-button>
            <el-button
              v-if="isAdmin && scope.row.status === 1"
              size="mini"
              type="warning"
              @click="handleUnpublish(scope.row)"
            >
              下架
            </el-button>
            <el-button
              size="mini"
              type="danger"
              @click="handleDelete(scope.$index, scope.row)"
            >
              删除
            </el-button>
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
        :total="total">
      </el-pagination>
    </div>

    <!-- 添加/编辑对话框 -->
    <el-dialog
      :title="isEdit?'编辑研学方案':'添加研学方案'"
      :visible.sync="dialogVisible"
      width="800px"
      :close-on-click-modal="false"
    >
      <el-form
        :model="tourPlan"
        :rules="rules"
        ref="tourPlanForm"
        label-width="120px"
        size="small"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="方案名称" prop="planName">
              <el-input v-model="tourPlan.planName" style="width: 100%"/>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="所属基地" prop="baseId">
              <el-select v-model="tourPlan.baseId" placeholder="请选择基地" style="width: 100%">
                <el-option
                  v-for="item in baseOptions"
                  :key="item.id"
                  :label="item.baseName"
                  :value="item.id">
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="研学时长" prop="duration">
              <el-input v-model="tourPlan.duration" placeholder="如：3小时/1天/2天1夜" style="width: 100%"/>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="适用人群" prop="suitableCrowd">
              <el-input v-model="tourPlan.suitableCrowd" placeholder="如：小学生,初中生,亲子家庭" style="width: 100%"/>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="研学路线" prop="route">
          <el-input
            type="textarea"
            v-model="tourPlan.route"
            :rows="3"
            :maxlength="200"
            show-word-limit
            placeholder="如：展厅参观→实践区→分享总结"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="方案简介" prop="briefIntro">
          <el-input
            type="textarea"
            v-model="tourPlan.briefIntro"
            :rows="3"
            :maxlength="200"
            show-word-limit
            placeholder="请输入方案简介"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="方案内容" prop="details">
          <el-input
            type="textarea"
            v-model="tourPlan.details"
            :rows="5"
            :maxlength="300"
            show-word-limit
            placeholder="请输入方案具体内容"
            style="width: 100%"
          />
        </el-form-item>

        <!-- 方案状态仅管理员可见，普通用户隐藏 -->
        <el-form-item v-if="isAdmin" label="方案状态" prop="status">
          <el-radio-group v-model="tourPlan.status">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
        
        <!-- 封面图上传 -->
        <el-form-item label="封面图片" prop="coverFileList">
          <el-upload
            action="/api/upload"
            list-type="picture-card"
            :file-list="coverFileList"
            :on-change="handleCoverFileChange"
            :on-remove="handleCoverFileRemove"
            :before-upload="beforeCoverUpload"
            :before-remove="beforeCoverImageRemove"
            :auto-upload="false"
            :limit="1"
            :on-exceed="handleCoverExceed"
          >
            <i class="el-icon-plus avatar-uploader-icon"></i>
            <div slot="tip" class="el-upload__tip">支持JPG、PNG格式，单张图片大小应小于5MB，只能上传1张</div>
          </el-upload>
        </el-form-item>
        
        <!-- 详情图上传 -->
        <el-form-item label="详情图片" prop="detailImages">
          <el-upload
            action="/api/upload"
            list-type="picture"
            :file-list="detailFileList"
            :on-change="handleDetailFileChange"
            :on-remove="handleDetailFileRemove"
            :before-upload="beforeDetailImageUpload"
            :before-remove="beforeDetailImageRemove"
            :auto-upload="false"
            multiple
          >
            <el-button size="small" type="primary">选择详情图</el-button>
            <div slot="tip" class="el-upload__tip">支持多图上传（上传图片大小应小于5MB）</div>
          </el-upload>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleDialogConfirm">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { formatDate } from '@/utils/date'
import {
  fetchList,
  createTourPlan,
  updateTourPlan,
  deleteTourPlan,
  publishTourPlan,
  unpublishTourPlan
} from '@/api/study/tourPlan'
import { list as fetchBases } from '@/api/study/tourBase'

const defaultListQuery = {
  pageNum: 1,
  pageSize: 10,
  planName: null,
  baseId: null,
  status: null
}

const defaultTourPlan = {
  id: null,
  planName: null,
  baseId: null,
  route: null,
  briefIntro: null,
  details: null,
  suitableCrowd: null,
  duration: null,
  status: 1
}

export default {
  name: 'TourPlan',
  data() {
    return {
      listQuery: Object.assign({}, defaultListQuery),
      list: null,
      total: 0,
      listLoading: false,
      dialogVisible: false,
      isEdit: false,
      tourPlan: Object.assign({}, defaultTourPlan),
      baseOptions: [],
      statusOptions: [
        {
          label: '全部',
          value: null
        },
        {
          label: '启用',
          value: 1
        },
        {
          label: '禁用',
          value: 0
        }
      ],
      isAdmin: false,
      // 图片上传相关
      fileList: [],
      images: [],
      coverFileList: [],
      coverImage: null,
      detailFileList: [],
      detailImages: [],
      rules: {
        planName: [
          { required: true, message: '请输入方案名称', trigger: 'blur' },
          { min: 2, max: 200, message: '长度在 2 到 200 个字符', trigger: 'blur' }
        ],
        baseId: [
          { required: true, message: '请选择所属基地', trigger: 'change' }
        ],
        route: [
          { required: true, message: '请输入研学路线', trigger: 'blur' }
        ],
        duration: [
          { required: true, message: '请输入研学时长', trigger: 'blur' }
        ]
      }
    }
  },
  async created() {
    await this.checkUserPermission()
    this.getList()
    this.loadBases()
  },
  filters: {
    formatDateTime(time) {
      if (time == null || time === '') {
        return ''
      }
      const date = new Date(time)
      return formatDate(date, 'yyyy-MM-dd hh:mm:ss')
    },
    statusFilter(status) {
      const statusMap = {
        0: 'info',
        1: 'success'
      }
      return statusMap[status]
    },
    statusTextFilter(status) {
      const statusTextMap = {
        0: '禁用',
        1: '启用'
      }
      return statusTextMap[status]
    }
  },
  methods: {
    async checkUserPermission() {
      try {
        const userModule = await import('@/api/user')
        const getCurrentUser = userModule.getCurrentUser
        const userInfo = await getCurrentUser()
        const data = userInfo && userInfo.data ? userInfo.data : userInfo
        const userId = (data && data.userId) || (data && data.id)
        const roleIds = data && data.roleIds ? data.roleIds : []
        this.isAdmin = userId === 10011 || (roleIds && roleIds.includes(1))
      } catch (e) {
        this.isAdmin = false
      }
    },
    handleResetSearch() {
      this.listQuery = Object.assign({}, defaultListQuery)
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
      this.tourPlan = Object.assign({}, defaultTourPlan)
      // 普通用户新增方案时，默认状态为禁用/下架，且前端不展示状态字段
      if (!this.isAdmin) {
        this.tourPlan.status = 0
      }
      // 重置图片相关变量
      this.coverFileList = []
      this.detailFileList = []
    },
    handleDelete(index, row) {
      this.$confirm('是否要删除该研学方案？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteTourPlan(row.id).then(response => {
          this.$message({
            message: '删除成功！',
            type: 'success'
          })
          this.getList()
        })
      })
    },
    handleUpdate(index, row) {
      this.dialogVisible = true
      this.isEdit = true
      this.tourPlan = Object.assign({}, row)
      
      // 加载图片数据
      this.loadImages(row.id)
    },
    
    // 加载图片数据
    async loadImages(planId) {
      try {
        const { getImages } = await import('@/api/study/tourPlan')
        const response = await getImages(planId)
        
        if (response && response.code === 200) {
          const images = response.data || []
          
          // 分离封面图和详情图
          const coverImages = images.filter(img => img.isCover === 1 || img.isCover === true)
          const detailImages = images.filter(img => img.isCover === 0 || img.isCover === false)
          
          // 设置封面图文件列表
          this.coverFileList = coverImages.map(img => ({
            name: img.imageName || '封面图',
            url: this.formatImageUrl(img.imageUrl),
            id: img.id
          }))
          
          // 设置详情图文件列表
          this.detailFileList = detailImages.map(img => ({
            name: img.imageName || '详情图',
            url: this.formatImageUrl(img.imageUrl),
            id: img.id
          }))
        }
      } catch (error) {
        console.error('加载图片数据失败:', error)
        this.$message.error('加载图片数据失败')
      }
    },
    
    // 封面图上传前验证
    beforeCoverUpload(file) {
      const isJPG = file.type === 'image/jpeg' || file.type === 'image/png'
      const isLt5M = file.size / 1024 / 1024 < 5

      if (!isJPG) {
        this.$message.error('封面图只能是 JPG 或 PNG 格式!')
      }
      if (!isLt5M) {
        this.$message.error('封面图大小不能超过 5MB!')
      }
      return isJPG && isLt5M
    },
    
    // 处理封面图文件变化
    handleCoverFileChange(file, fileList) {
      // 只保留一个文件（限制为1个）
      if (fileList.length > 1) {
        fileList = [fileList[fileList.length - 1]]
      }
      
      // 验证图片格式和大小
      const validFiles = fileList.filter(item => {
        if (!item.raw) return true; // 已上传的文件无需验证
        
        const isImage = item.raw.type && item.raw.type.startsWith('image/')
        const isLt5M = item.raw.size && item.raw.size / 1024 / 1024 < 5
        
        if (!isImage) {
          this.$message.error(`${item.name} 只能是图片文件!`)
          return false
        }
        if (!isLt5M) {
          this.$message.error(`${item.name} 大小不能超过 5MB!`)
          return false
        }
        return true
      })
      
      // 更新封面图文件列表
      this.coverFileList = validFiles
    },
    
    // 封面图删除前验证
    beforeCoverImageRemove(file, fileList) {
      return this.$confirm(`确定要移除封面图 ${file.name}？`)
    },
    
    // 封面图上传超出限制
    handleCoverExceed(files, fileList) {
      this.$message.warning('封面图只能上传1张')
      // 保留最后一个上传的文件
      this.coverFileList = [fileList[fileList.length - 1]]
    },
    
    // 处理封面图文件删除
    handleCoverFileRemove(file, fileList) {
      console.log('封面图被删除:', file, '剩余文件列表:', fileList)
      this.coverFileList = fileList
    },
    
    // 处理详情图文件变化
    handleDetailFileChange(file, fileList) {
      // 验证图片格式和大小
      const validFiles = fileList.filter(item => {
        if (!item.raw) return true; // 已上传的文件无需验证
        
        const isImage = item.raw.type && item.raw.type.startsWith('image/')
        const isLt5M = item.raw.size && item.raw.size / 1024 / 1024 < 5
        
        if (!isImage) {
          this.$message.error(`${item.name} 只能是图片文件!`)
          return false
        }
        if (!isLt5M) {
          this.$message.error(`${item.name} 大小不能超过 5MB!`)
          return false
        }
        return true
      })
      
      // 更新详情图文件列表
      this.detailFileList = validFiles
      
    },
    
    // 详情图上传前验证
    beforeDetailImageUpload(file) {
      const isImage = file.type && file.type.startsWith('image/')
      const isLt5M = file.size && file.size / 1024 / 1024 < 5
      
      if (!isImage) {
        this.$message.error('只能上传图片文件!')
        return false
      }
      if (!isLt5M) {
        this.$message.error('图片大小不能超过 5MB!')
        return false
      }
      return isImage && isLt5M
    },
    
    // 详情图删除前验证
    beforeDetailImageRemove(file, fileList) {
      return this.$confirm(`确定要移除图片 ${file.name}？`)
    },
    
    // 处理详情图文件删除
    handleDetailFileRemove(file, fileList) {
      console.log('详情图被删除:', file, '剩余文件列表:', fileList)
      this.detailFileList = fileList
    },
    
    handlePublish(row) {
      this.$confirm('确定要上架该研学方案吗？上架后将在小程序端显示', '上架确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        publishTourPlan(row.id).then(() => {
          this.$message.success('上架成功')
          this.getList()
        }).catch(error => {
          this.$message.error((error && error.msg) || (error && error.message) || '上架失败')
        })
      }).catch(() => {})
    },
    handleUnpublish(row) {
      this.$confirm('确定要下架该研学方案吗？下架后将不在小程序端显示', '下架确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        unpublishTourPlan(row.id).then(() => {
          this.$message.success('下架成功')
          this.getList()
        }).catch(error => {
          this.$message.error((error && error.msg) || (error && error.message) || '下架失败')
        })
      }).catch(() => {})
    },
    async handleDialogConfirm() {
      this.$refs['tourPlanForm'].validate((valid) => {
        if (valid) {
          const tourPlan = Object.assign({}, this.tourPlan)

          if (this.isEdit) {
            updateTourPlan(tourPlan).then(async response => {
              // 处理图片数据
              await this.handleImages(tourPlan.id)
              
              this.$message({
                message: '修改成功！',
                type: 'success'
              })
              this.dialogVisible = false
              this.getList()
            })
          } else {
            createTourPlan(tourPlan).then(async response => {
              // 处理图片数据
              if (response && response.data && response.data.id) {
                await this.handleImages(response.data.id)
              }
              
              this.$message({
                message: '添加成功！',
                type: 'success'
              })
              this.dialogVisible = false
              this.getList()
            })
          }
        } else {
          this.$message({
            message: '验证失败',
            type: 'error'
          })
          return false
        }
      })
    },
    
    // 处理图片数据
    async handleImages(planId) {
      const request = await import('@/utils/request')
      
      // 所有需要保存的图片数据（只处理当前列表中存在的图片）
      const allImagesData = [];

      // 处理封面图
      if (this.coverFileList && this.coverFileList.length > 0) {
        for (let i = 0; i < this.coverFileList.length; i++) {
          const file = this.coverFileList[i];
          
          // 如果是新文件（有raw属性），需要上传
          if (file.raw) {
            try {
              const formData = new FormData();
              formData.append('file', file.raw);
              
              const response = await request.default({
                url: '/api/file/upload',
                method: 'post',
                data: formData,
                headers: { 'Content-Type': 'multipart/form-data' }
              });
              
              if (response && response.code === 200) {
                allImagesData.push({
                  relatedId: planId,
                  relatedType: 'plan',
                  imageUrl: response.data.url,
                  imageName: file.name,
                  sortOrder: i,
                  isCover: 1
                });
              }
            } catch (error) {
              this.$message.error('封面图上传失败');
              console.error('封面图上传失败:', error);
              return;
            }
          } else if (file.url) {
            // 对于现有的图片文件（有url但没有raw），直接添加到待保存列表
            const imageUrl = this.formatImageUrl(file.url);
            allImagesData.push({
              relatedId: planId,
              relatedType: 'plan',
              imageUrl: imageUrl,
              imageName: file.name || '封面图',
              sortOrder: i,
              isCover: 1,
              id: file.id // 保留原有图片的ID，以便后端知道这是现有图片
            });
          }
        }
      }
      
      // 处理详情图
      if (this.detailFileList && this.detailFileList.length > 0) {
        for (let i = 0; i < this.detailFileList.length; i++) {
          const file = this.detailFileList[i];
          
          // 如果是新文件（有raw属性），需要上传
          if (file.raw) {
            try {
              const formData = new FormData();
              formData.append('file', file.raw);
              
              const response = await request.default({
                 url: '/api/file/upload',
                 method: 'post',
                 data: formData,
                 headers: { 'Content-Type': 'multipart/form-data' }
               });
              
              if (response && response.code === 200) {
                allImagesData.push({
                  relatedId: planId,
                  relatedType: 'plan',
                  imageUrl: response.data.url,
                  imageName: file.name,
                  sortOrder: this.coverFileList.length + i,
                  isCover: 0
                });
              }
            } catch (error) {
              this.$message.error('详情图上传失败');
              console.error('详情图上传失败:', error);
              return;
            }
          } else if (file.url) {
            // 对于现有的图片文件（有url但没有raw），直接添加到待保存列表
            const imageUrl = this.formatImageUrl(file.url);
            allImagesData.push({
              relatedId: planId,
              relatedType: 'plan',
              imageUrl: imageUrl,
              imageName: file.name || '详情图',
              sortOrder: this.coverFileList.length + i,
              isCover: 0,
              id: file.id // 保留原有图片的ID，以便后端知道这是现有图片
            });
          }
        }
      }
      
      // 保存图片到数据库
      if (allImagesData.length > 0) {
        try {
          const { saveImages } = await import('@/api/study/tourPlan')
          console.log('保存所有图片到数据库:', allImagesData);
          const saveResponse = await saveImages(planId, allImagesData);
          console.log('保存图片响应:', saveResponse);
          if (saveResponse && saveResponse.code === 200) {
            this.$message.success('图片保存成功');
          }
        } catch (error) {
          this.$message.error('保存图片到数据库失败');
          console.error('保存图片到数据库失败:', error);
        }
      }
    },
    
    // 格式化图片URL，确保在不同环境下都能正确访问
    formatImageUrl(imageUrl) {
      if (!imageUrl) return '';
      
      // 如果已经是完整的URL（以http或https开头），直接返回
      if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
        return imageUrl;
      }
      
      // 如果是绝对路径（以/开头），但不是以/api/开头，则添加/api/前缀
      if (imageUrl.startsWith('/')) {
        if (imageUrl.startsWith('/api/')) {
          return imageUrl; // 已经有api前缀，直接返回
        }
        // 假设原始图片路径是 /uploads/* 格式，需要改为 /api/uploads/*
        return '/api' + imageUrl;
      }
      
      // 如果是相对路径，添加 /api/ 前缀（例如 uploads/* -> /api/uploads/*）
      return '/api/' + imageUrl;
    },
    
    getList() {
      this.listLoading = true
      fetchList(this.listQuery).then(response => {
        this.listLoading = false
        if (response && response.data) {
          if (response.data.records) {
            this.list = response.data.records
            this.total = response.data.total || 0
          } else if (response.data.list) {
            this.list = response.data.list
            this.total = response.data.total || 0
          } else {
            this.list = response.data
            this.total = response.data.length || 0
          }
        } else {
          this.list = []
          this.total = 0
        }
      }).catch(() => {
        this.listLoading = false
        this.list = []
        this.total = 0
      })
    },
    loadBases() {
      fetchBases().then(response => {
        this.baseOptions = response.data
      })
    },
    getBaseName(baseId) {
      const base = this.baseOptions.find(item => item.id === baseId)
      return base ? base.baseName : ''
    }
  }
}
</script>

<style scoped>
.filter-container {
  margin-bottom: 20px;
}

.operation-buttons {
  margin-bottom: 20px;
}

.table-container {
  margin-bottom: 20px;
}

.pagination-container {
  display: flex;
  justify-content: center;
}
</style>
