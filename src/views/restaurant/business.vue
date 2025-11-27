<template>
  <div class="app-container">
    <!-- 搜索区域 -->
    <el-form :inline="true" :model="queryParams" class="demo-form-inline">
      <el-form-item label="餐厅名称">
        <el-input
          v-model="queryParams.restaurantName"
          placeholder="请输入餐厅名称"
          clearable
          style="width: 200px"
        />
      </el-form-item>
      <el-form-item label="菜品分类">
        <el-input
          v-model="queryParams.categoryName"
          placeholder="请输入菜品分类"
          clearable
          style="width: 180px"
        />
      </el-form-item>
      <el-form-item label="菜品名称">
        <el-input
          v-model="queryParams.dishName"
          placeholder="请输入菜品名称"
          clearable
          style="width: 180px"
        />
      </el-form-item>
      <el-form-item label="状态">
        <el-select
          v-model="queryParams.status"
          placeholder="请选择状态"
          clearable
          style="width: 120px"
        >
          <el-option label="启用" :value="1" />
          <el-option label="禁用" :value="0" />
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
      </el-form-item>
    </el-form>

    <!-- 表格 -->
    <el-table v-loading="loading" :data="dishList" border style="width: 100%">
      <el-table-column prop="restaurantName" label="餐厅名称" min-width="180" />
      <el-table-column prop="categoryName" label="菜品分类" min-width="160" />
      <el-table-column prop="dishName" label="菜品名称" min-width="180" />
      <el-table-column prop="price" label="售价" width="100">
        <template slot-scope="scope">
          ¥{{ scope.row.price }}
        </template>
      </el-table-column>
      <el-table-column prop="unit" label="售卖单位" width="120" />
      <el-table-column label="状态" width="100">
        <template slot-scope="scope">
          <el-tag :type="scope.row.dishStatus === 1 ? 'success' : 'danger'">
            {{ scope.row.dishStatus === 1 ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="创建时间" width="160" />
      <el-table-column prop="updateTime" label="更新时间" width="160" />
      <el-table-column label="操作" width="180" fixed="right">
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

    <!-- 新增/编辑弹窗 -->
    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="600px" @close="resetForm">
      <el-form ref="dishFormRef" :model="dishForm" :rules="dishRules" label-width="120px">
        <el-form-item label="餐厅名称" prop="restaurantId">
          <el-select v-model="dishForm.restaurantId" placeholder="请选择餐厅" filterable style="width: 100%">
            <el-option
              v-for="item in restaurantList"
              :key="item.id"
              :label="item.restaurantName"
              :value="item.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="菜品分类" prop="categoryId">
          <el-select v-model="dishForm.categoryId" placeholder="请选择菜品分类" filterable style="width: 100%">
            <el-option
              v-for="item in categoryList"
              :key="item.id"
              :label="item.restaurantName + ' - ' + item.categoryName"
              :value="item.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="菜品名称" prop="dishName">
          <el-input v-model="dishForm.dishName" placeholder="请输入菜品名称" maxlength="100" show-word-limit />
        </el-form-item>

        <el-form-item label="售价" prop="price">
          <el-input v-model.number="dishForm.price" type="number" placeholder="请输入售价" />
        </el-form-item>

        <el-form-item label="售卖单位" prop="unit">
          <el-input v-model="dishForm.unit" placeholder="请输入售卖单位（如：份、个、份）" maxlength="5" show-word-limit />
        </el-form-item>

        <el-form-item label="状态" prop="status">
          <el-select v-model="dishForm.status" placeholder="请选择状态" style="width: 100%">
            <el-option label="启用" :value="1" />
            <el-option label="禁用" :value="0" />
          </el-select>
        </el-form-item>

        <el-form-item label="菜品描述" prop="description">
          <el-input v-model="dishForm.description" type="textarea" :rows="3" placeholder="请输入菜品描述" maxlength="30" show-word-limit />
        </el-form-item>
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="submitForm">
          确定
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { 
  listRestaurantNamesByUser,
  getDishList, 
  getDishDetail, 
  createDish, 
  updateDish, 
  deleteDish 
} from '@/api/restaurant'
import { getDishCategoryList } from '@/api/dishCategory'
import request from '@/utils/shop_api'

export default {
  name: 'DishManagement',
  computed: {
    ...mapGetters(['userId'])
  },
  data() {
    return {
      loading: false,
      submitLoading: false,
      dialogVisible: false,
      dialogTitle: '',
      isEdit: false,
      dishList: [],
      restaurantList: [],
      categoryList: [],
      total: 0,
      queryParams: {
        page: 1,
        pageSize: 10,
        restaurantName: '',
        categoryName: '',
        dishName: '',
        status: null
      },
      dishForm: {
        id: null,
        restaurantId: null,
        categoryId: null,
        dishName: '',
        price: 0,
        unit: '',
        status: 1,
        description: '',
        coverImgUrl: '',
        fileList: []
      },
      dishRules: {
        restaurantId: [{ required: true, message: '请选择餐厅', trigger: 'change' }],
        categoryId: [{ required: true, message: '请选择菜品分类', trigger: 'change' }],
        dishName: [
          { required: true, message: '请输入菜品名称', trigger: 'blur' },
          { min: 1, max: 100, message: '菜品名称长度应在1到100个字符之间', trigger: 'blur' }
        ],
        price: [{ required: true, message: '请输入售价', trigger: 'blur' }, { type: 'number', min: 0, message: '售价不能小于0' }],
        unit: [
          { required: true, message: '请输入售卖单位', trigger: 'blur' },
          { min: 1, max: 5, message: '售卖单位长度应在1到5个字符之间', trigger: 'blur' }
        ],
        description: [
          { min: 0, max: 30, message: '菜品描述长度不能超过30个字符', trigger: 'blur' }
        ],
        status: [{ required: true, message: '请选择状态', trigger: 'change' }]
      }
    }
  },
  created() {
    this.getList()
    this.loadRestaurantList()
    this.loadCategoryList()
  },
  methods: {
    // 获取餐厅列表
    async loadRestaurantList() {
      try {
        const res = await listRestaurantNamesByUser(this.userId)
        if (res && (res.code === 200 || res.code === '200')) {
          // API返回的是餐厅名称数组，需要转换为对象数组以适配模板
          this.restaurantList = Array.isArray(res.data) 
            ? res.data.map((name, index) => ({ id: index + 1, restaurantName: name }))
            : []
        }
      } catch (error) {
        this.$message.error('获取餐厅列表失败')
      }
    },

    // 获取菜品分类列表
    async loadCategoryList() {
      try {
        const res = await getDishCategoryList({ userId: this.userId })
        if (res && (res.code === 200 || res.code === '200')) {
          this.categoryList = (res.data && res.data.records) || []
        }
      } catch (error) {
        this.$message.error('获取菜品分类列表失败')
      }
    },

    // 获取菜品列表
    async getList() {
      this.loading = true
      try {
        const res = await getDishList({ ...this.queryParams, userId: this.userId })
        if (res && (res.code === 200 || res.code === '200')) {
          this.dishList = res.data.records || []
          this.total = res.data.total || 0
        } else {
          this.$message.error((res && res.msg) || '获取菜品列表失败')
        }
      } catch (error) {
        this.$message.error('获取菜品列表失败')
      } finally {
        this.loading = false
      }
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
        restaurantName: '',
        categoryName: '',
        dishName: '',
        status: null
      }
      this.getList()
    },

    // 分页大小改变
    handleSizeChange(val) {
      this.queryParams.pageSize = val
      this.queryParams.page = 1
      this.getList()
    },

    // 当前页码改变
    handleCurrentChange(val) {
      this.queryParams.page = val
      this.getList()
    },

    // 添加菜品
    handleAdd() {
      this.dialogTitle = '新增菜品'
      this.isEdit = false
      this.resetForm()
      this.dialogVisible = true
    },

    // 编辑菜品
    async handleEdit(row) {
      if (!row || !row.id) {
        this.$message.error('数据错误，无法编辑')
        return
      }
      this.dialogTitle = '编辑菜品'
      this.isEdit = true
      try {
        const res = await getDishDetail(row.id, { userId: this.userId })
        if (res && (res.code === 200 || res.code === '200')) {
          // 处理图片URL，确保它们是完整的URL格式
          const processImageUrl = (imageUrl) => {
            // 如果已经是完整的URL或blob URL，直接返回
            if (imageUrl && (imageUrl.startsWith('http://') || imageUrl.startsWith('https://') || imageUrl.startsWith('blob:'))) {
              return imageUrl;
            }
            // 否则假设是文件名，需要通过formatImageUrl处理
            return this.formatImageUrl(imageUrl);
          }
          
          this.dishForm = {
            id: res.data.id,
            restaurantId: res.data.restaurantId,
            categoryId: res.data.categoryId,
            dishName: res.data.dishName || '',
            price: res.data.price || 0,
            unit: res.data.unit || '',
            status: res.data.dishStatus !== undefined ? res.data.dishStatus : 1,
            description: res.data.description || '',
            coverImgUrl: res.data.coverImgUrl || res.data.cover_img_url || res.data.previewImage || '',
            fileList: (res.data.coverImgUrl || res.data.cover_img_url || res.data.previewImage) ? [{
              name: '菜品预览图',
              url: processImageUrl(res.data.coverImgUrl || res.data.cover_img_url || res.data.previewImage),
              status: 'success'
            }] : []
          }
          this.dialogVisible = true
        }
      } catch (error) {
        this.$message.error('获取菜品详情失败')
      }
    },

    // 删除菜品
    handleDelete(row) {
      if (!row || !row.id) {
        this.$message.error('数据错误，无法删除')
        return
      }
      this.$confirm(`确定删除菜品「${row.dishName}」吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async () => {
          try {
            const res = await deleteDish({ id: row.id, userId: this.userId })
            if (res && (res.code === 200 || res.code === '200')) {
              this.$message.success('删除成功')
              this.getList()
            } else {
              this.$message.error((res && res.msg) || '删除失败')
            }
          } catch (error) {
            this.$message.error('删除失败')
          }
        })
        .catch(() => {})
    },

    // 提交表单
    submitForm() {
      this.$refs.dishFormRef.validate(async (valid) => {
        if (!valid) return
        this.submitLoading = true
        try {
          // 如果有新选择的图片文件，先上传图片
          if (this.dishForm.fileList && this.dishForm.fileList.length > 0 && this.dishForm.fileList[0].raw) {
            try {
              const imageUrl = await this.uploadImage(this.dishForm.fileList[0].raw)
              this.dishForm.coverImgUrl = imageUrl
            } catch (uploadError) {
              this.$message.error('图片上传失败')
              this.submitLoading = false
              return
            }
          }
          
          // 构造发送到后端的数据，使用coverImgUrl字段
          const payload = { 
            ...this.dishForm, 
            userId: this.userId,
            previewImage: undefined, // 移除旧字段
            cover_img_url: undefined // 移除旧字段
          }
          const res = await (this.isEdit ? updateDish(payload) : createDish(payload))
          if (res && (res.code === 200 || res.code === '200')) {
            this.$message.success(this.isEdit ? '更新成功' : '新增成功')
            this.dialogVisible = false
            this.getList()
            this.resetForm()
          } else {
            this.$message.error((res && res.msg) || '操作失败')
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
      if (this.$refs.dishFormRef) {
        this.$refs.dishFormRef.resetFields()
      }
      this.dishForm = {
        id: null,
        restaurantId: null,
        categoryId: null,
        dishName: '',
        price: 0,
        unit: '',
        status: 1,
        description: '',
        coverImgUrl: '',
        fileList: []
      }
      
      // 如果是新增菜品，设置默认餐厅ID为1（测试餐厅）
      if (!this.isEdit) {
        this.dishForm.restaurantId = 1
      }
      
      this.isEdit = false
    },
    
    // 图片上传前校验
    beforeImageUpload(file) {
      const isImage = file.type.startsWith('image/')
      const isLt2M = file.size / 1024 / 1024 < 2

      if (!isImage) {
        this.$message.error('菜品预览图只能上传图片文件!')
        return false
      }
      if (!isLt2M) {
        this.$message.error('菜品预览图大小不能超过2MB!')
        return false
      }
      return true
    },
    
    // 图片移除前处理
    beforeImageRemove(file, fileList) {
      return true
    },
    
    // 处理文件变化（仅验证，不上传）
    handleFileChange(file, fileList) {
      // 检查是否有无效文件并显示错误提示
      const invalidFiles = fileList.filter(item => {
        // 只检查新添加的原始文件
        if (!item.raw) return false
        
        const isImage = item.raw.type && item.raw.type.startsWith('image/')
        const isLt2M = item.raw.size && item.raw.size / 1024 / 1024 < 2
        
        // 如果文件不是图片或大于2MB，显示错误提示
        if (!isImage) {
          this.$message.error(`菜品预览图 ${item.name} 只能是图片文件!`)
          return true
        }
        if (!isLt2M) {
          this.$message.error(`菜品预览图 ${item.name} 大小不能超过2MB!`)
          return true
        }
        
        return false
      })
      
      // 过滤掉验证失败的文件
      const validFileList = fileList.filter(item => {
        // 检查文件是否有效
        const isImage = item.raw ? (item.raw.type && item.raw.type.startsWith('image/')) : true
        const isLt2M = item.raw ? (item.raw.size && item.raw.size / 1024 / 1024 < 2) : true
        return isImage && isLt2M
      })
      
      this.dishForm.fileList = validFileList
      
      // 保存图片URL
      if (validFileList.length > 0 && validFileList[0].raw) {
        this.dishForm.coverImgUrl = validFileList[0].raw.name
      } else if (validFileList.length > 0 && validFileList[0].url) {
        // 编辑时已存在的图片
        this.dishForm.coverImgUrl = validFileList[0].url
      } else {
        this.dishForm.coverImgUrl = ''
      }
    },
    
    // 上传图片到服务器
    async uploadImage(file) {
      const formData = new FormData()
      formData.append('file', file)

      try {
        // 使用shop_api作为请求实例
        const response = await request({
          url: '/api/file/upload',
          method: 'post',
          data: formData,
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })

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
    
    // 将相对图片路径转为可访问的完整URL（用于显示）
    formatImageUrl(url) {
      if (!url) return ''
      if (url.startsWith('http') || url.startsWith('data:')) return url
      
      const baseUrl = (window.webofdConfig && window.webofdConfig.BASE_URL) || ''
      
      // 如果URL已经是完整路径格式（包含/），则直接与BASE_URL拼接
      if (url.includes('/')) {
        return baseUrl + url
      }
      
      // 如果只是纯文件名，则添加默认的uploads路径前缀
      // 这样纯文件名格式的图片也能正确显示
      return baseUrl + '/uploads/' + url
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
.operation-buttons {
  display: flex;
  gap: 10px;
}
</style>
