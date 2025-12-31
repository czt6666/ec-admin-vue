<template>
  <div class="app-container">
    <div class="filter-container">
      <el-form :inline="true" :model="searchForm" size="small">
        <el-form-item label="商品名称">
          <el-input v-model="searchForm.title" placeholder="请输入商品名称" clearable></el-input>
        </el-form-item>
        <el-form-item label="店铺名称">
          <el-input v-model="searchForm.shopName" placeholder="请输入店铺名称" clearable></el-input>
        </el-form-item>
        <el-form-item label="上架状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
            <el-option label="已上架" value="1"></el-option>
            <el-option label="已下架" value="0"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="创建时间">
          <el-date-picker
            v-model="searchDateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="yyyy-MM-dd"
            @change="handleDateRangeChange"
          ></el-date-picker>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="handleSearch">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
      <el-form>
        <el-form-item>
          <el-button type="primary" icon="el-icon-plus" @click="showCreate">添加</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 商品列表表格 -->
    <el-table
      v-loading="listLoading"
      :data="productList"
      style="width: 100%"
      border
    >
      <el-table-column
        type="index"
        label="序号"
        width="80"
        align="center"
      ></el-table-column>

      <!-- 预览图列暂时注释掉 -->
      <!-- <el-table-column
        label="预览图"
        width="100"
        align="center"
      >
        <template slot-scope="scope">
          <el-image
            v-if="scope.row.previewImages && scope.row.previewImages.length > 0"
            :src="formatImageUrl(scope.row.previewImages[0])"
            style="width: 60px; height: 60px;"
            fit="cover"
          ></el-image>
          <span v-else>无图片</span>
        </template>
      </el-table-column> -->

      <!-- 商品详情图列暂时注释掉 -->
      <!-- <el-table-column
        label="商品详情图"
        width="100"
        align="center"
      >
        <template slot-scope="scope">
          <el-image
            v-if="scope.row.detailImages && scope.row.detailImages.length > 0"
            :src="formatImageUrl(scope.row.detailImages[0])"
            style="width: 60px; height: 60px;"
            fit="cover"
          ></el-image>
          <span v-else>无图片</span>
        </template>
      </el-table-column> -->

      <el-table-column
        prop="title"
        label="商品名称"
        min-width="200"
      ></el-table-column>

      <el-table-column
        prop="shopName"
        label="店铺名称"
        min-width="150"
      ></el-table-column>

      <el-table-column
        prop="description"
        label="商品简介"
        min-width="200"
      ></el-table-column>

      <el-table-column
        prop="productUrl"
        label="商品链接"
        min-width="180"
      >
        <template slot-scope="scope">
          <a :href="scope.row.productUrl" target="_blank" v-if="scope.row.productUrl">{{ scope.row.productUrl }}</a>
          <span v-else>无链接</span>
        </template>
      </el-table-column>

      <el-table-column
        prop="status"
        label="上架状态"
        width="100"
        align="center"
      >
        <template slot-scope="scope">
          <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">
            {{ scope.row.status === 1 ? '已上架' : '已下架' }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column
        prop="createTime"
        label="创建时间"
        width="180"
      ></el-table-column>

      <el-table-column
        prop="updateTime"
        label="更新时间"
        width="180"
      ></el-table-column>

      <el-table-column
        prop="viewCount"
        label="浏览量"
        width="100"
        align="center"
      ></el-table-column>

      <el-table-column
        prop="cartCount"
        label="加购物车次数"
        width="120"
        align="center"
      ></el-table-column>

      <el-table-column
        label="操作"
        width="100"
        align="center"
        fixed="right"
      >
        <template slot-scope="scope">
          <div style="display: flex; flex-direction: column; gap: 10px; align-items: center; width: 100%;">
            <el-button
              type="primary"
              size="small"
              icon="el-icon-edit"
              @click="showUpdate(scope.row, scope.$index)"
              style="width: 80px; padding: 8px 0;"
            >编辑</el-button>
            <el-button
              type="danger"
              size="small"
              icon="el-icon-delete"
              @click="handleDelete(scope.$index)"
              style="width: 80px; padding: 8px 0;"
            >删除</el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination-container">
      <el-pagination
        background
        layout="prev, pager, next, jumper"
        :total="total"
        :page-size="pageSize"
        :current-page="currentPage"
        @current-change="handleCurrentChange"
        @size-change="handleSizeChange"
      ></el-pagination>
    </div>

    <!-- 添加/编辑对话框 -->
    <el-dialog
      :title="dialogTitle"
      :visible.sync="dialogVisible"
      width="600px"
    >
      <el-form
        ref="productForm"
        :model="tempProduct"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="预览图" prop="previewImages">
          <el-upload
            action="#"
            list-type="picture"
            :file-list="tempProduct.fileList"
            :on-change="handleFileChange"
            :before-upload="beforePreviewImageUpload"
            :before-remove="beforePreviewImageRemove"
            :auto-upload="false"
            multiple
          >
            <el-button size="small" type="primary">选择图片</el-button>
            <div slot="tip" class="el-upload__tip">支持多图上传（上传图片大小应小于10m）</div>
          </el-upload>
        </el-form-item>

        <el-form-item label="商品名称" prop="title">
          <el-input v-model="tempProduct.title" placeholder="请输入商品名称"></el-input>
        </el-form-item>
        <el-form-item label="商品简介" prop="description">
          <el-input
            v-model="tempProduct.description"
            type="textarea"
            :rows="3"
            :maxlength="200"
            placeholder="请输入商品简介"
          ></el-input>
          <div class="word-count">{{ (tempProduct.description || '').length }}/200</div>
        </el-form-item>

        <el-form-item label="商品链接" prop="productUrl">
          <el-input v-model="tempProduct.productUrl" placeholder="请输入商品链接"></el-input>
        </el-form-item>

        <el-form-item label="商品详情图" prop="detailImages">
          <el-upload
            action="#"
            list-type="picture"
            :file-list="tempProduct.detailFileList"
            :on-change="handleDetailFileChange"
            :before-upload="beforeDetailImageUpload"
            :before-remove="beforeDetailImageRemove"
            :auto-upload="false"
            multiple
          >
            <el-button size="small" type="primary">选择图片</el-button>
            <div slot="tip" class="el-upload__tip">支持多图上传（上传图片大小应小于10m）</div>
          </el-upload>
        </el-form-item>

        <el-form-item label="上架状态" prop="status">
          <el-switch
            v-model="tempProduct.status"
            active-value="1"
            inactive-value="0"
            active-text="已上架"
            inactive-text="已下架"
          ></el-switch>
        </el-form-item>

        <!-- 规格管理 -->
        <el-form-item label="商品规格" prop="specifications">
          <el-table
            :data="tempProduct.specifications"
            style="width: 100%;"
            border
          >
            <el-table-column label="销售规格">
              <template slot-scope="scope">
                <el-form-item
                  :prop="`specifications.${scope.$index}.specName`"
                  style="min-height: 60px;"
                >
                  <el-input
                    v-model="scope.row.specName"
                    placeholder="如：红色/L"
                    clearable
                  ></el-input>
                </el-form-item>
              </template>
            </el-table-column>
            <el-table-column label="价格">
              <template slot-scope="scope">
                <el-form-item
                  :prop="`specifications.${scope.$index}.price`"
                  :rules="[
                    { required: true, message: '价格为必填项', trigger: 'blur,change' },
                    { type: 'number', min: 0, message: '价格必须为非负数', trigger: 'blur,change' }
                  ]"
                  style="min-height: 60px;"
                >
                  <el-input
                    v-model.number="scope.row.price"
                    placeholder="请输入价格"
                    type="number"
                    clearable
                  ></el-input>
                </el-form-item>
              </template>
            </el-table-column>
            <el-table-column label="库存">
              <template slot-scope="scope">
                <el-form-item
                  :prop="`specifications.${scope.$index}.stock`"
                  :rules="[
                    { required: true, message: '库存为必填项', trigger: 'blur,change' },
                    { type: 'number', min: 0, message: '库存必须为非负数', trigger: 'blur,change' }
                  ]"
                  style="min-height: 60px;"
                >
                  <el-input
                    v-model.number="scope.row.stock"
                    placeholder="请输入库存"
                    type="number"
                    clearable
                  ></el-input>
                </el-form-item>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="80">
              <template slot-scope="scope">
                <el-button
                  v-if="tempProduct.specifications.length > 1"
                  type="danger"
                  size="small"
                  icon="el-icon-delete"
                  @click="removeSpecification(scope.$index)"
                ></el-button>
                <el-button
                  v-if="scope.$index === tempProduct.specifications.length - 1"
                  type="primary"
                  size="small"
                  icon="el-icon-plus"
                  @click="addSpecification"
                ></el-button>
              </template>
            </el-table-column>
          </el-table>
            <div style="color: #909399; font-size: 12px; margin-top: 5px;">
              * 说明：销售规格、价格、库存均为必填项，价格、库存必须为非负数
            </div>
        </el-form-item>
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'ProductManagement',
  data() {
    return {
      // 商品列表数据
      productList: [],
      // 分页相关
      total: 0,
      currentPage: 1,
      pageSize: 10,
      listLoading: false,
      // 筛选条件
      searchForm: {
        title: '',
        shopName: '',
        status: '',
        startTime: '',
        endTime: ''
      },
      // 日期范围（用于日期选择器）
      searchDateRange: null,
      // 对话框相关
      dialogVisible: false,
      dialogTitle: '添加商品',
      tempProduct: {
          id: '',
          previewImages: [],
          detailImages: [],
          title: '',
          shopName: '',
          description: '',
          productUrl: '',
          status: '1',
          fileList: [],
          detailFileList: [],
          specifications: [
            {
              id: '',
              specName: '',
              price: '',
              stock: ''
            }
          ]
        },
      // 表单验证规则
      rules: {
        title: [
          { required: true, message: '请输入商品名称', trigger: 'blur' }
        ],
        description: [
          { required: true, message: '请输入商品简介', trigger: 'blur' }
        ],
        productUrl: [
          { required: true, message: '请输入商品链接', trigger: 'blur' }
        ],
        previewImages: [
          { required: false, type: 'array', message: '请选择预览图', trigger: 'change' }
        ],
        detailImages: [
          { required: false, type: 'array', message: '请选择详情图', trigger: 'change' }
        ]
      }
    }
  },

  methods: {
    // 获取商品列表
    getProductList() {
      this.listLoading = true
      // 构建筛选参数
      const params = {
        pageNum: this.currentPage,
        pageRow: this.pageSize,
        // 只传递有值的筛选条件
        ...(this.searchForm.title && { title: this.searchForm.title }),
        ...(this.searchForm.shopName && { shopName: this.searchForm.shopName }),
        ...(this.searchForm.status !== '' && { status: this.searchForm.status }),
        ...(this.searchForm.startTime && { startTime: this.searchForm.startTime }),
        ...(this.searchForm.endTime && { endTime: this.searchForm.endTime })
      }

      // 遍历当前用户的roleIds，如果有1，就不传userId参数，如果没有1，就传userId参数
      // 注意：不传递roleIds参数本身
      const roleIds = this.$store.getters.roleIds || [];
      const hasRoleOne = roleIds.includes(1);
      if (!hasRoleOne && this.$store.getters.userId) {
        // 将userId转换为Long类型
        params.userId = parseInt(this.$store.getters.userId, 10)
      }

      // 打印请求参数到控制台，便于调试
      console.log('商品列表请求参数:', params)

      this.api({
        url: '/products/subject/list',
        method: 'get',
        params: params
      }).then(data => {
        this.listLoading = false
        // 打印返回数据格式到控制台
        console.log('商品列表返回数据格式:', data)
        // 根据后端返回格式调整字段名
        this.productList = data.records || []
        this.total = data.total || 0
      }).catch(error => {
        this.listLoading = false
        console.error('获取商品列表失败:', error)
        // 显示更详细的错误信息
        if (error && error.message) {
          this.$message.error('获取商品列表失败: ' + error.message)
        } else {
          this.$message.error('获取商品列表失败')
        }
      })
    },

    // 显示添加对话框
    showCreate() {
      this.dialogTitle = '添加商品'
      this.tempProduct = {
        id: '',
        previewImages: [],
        detailImages: [],
        title: '',
        shopName: '',
        description: '',
        productUrl: '',
        status: '1',
        fileList: [],
        detailFileList: [],
        specifications: [
          {
            id: '',
            specName: '',
            price: '',
            stock: ''
          }
        ]
      }
      this.dialogVisible = true
    },

    // 处理详情图文件变化（仅验证，不上传）
    handleDetailFileChange(file, fileList) {
      // 检查是否有无效文件并显示错误提示
      const invalidFiles = fileList.filter(item => {
        // 只检查新添加的原始文件
        if (!item.raw) return false

        const isImage = item.raw.type && item.raw.type.startsWith('image/')
        const isLt10M = item.raw.size && item.raw.size / 1024 / 1024 < 10

        // 如果文件不是图片或大于10MB，显示错误提示
        if (!isImage) {
          this.$message.error(`详情图 ${item.name} 只能是图片文件!`)
          return true
        }
        if (!isLt10M) {
          this.$message.error(`详情图 ${item.name} 大小不能超过10MB!`)
          return true
        }

        return false
      })

      // 过滤掉验证失败的文件
      const validFileList = fileList.filter(item => {
        // 检查文件是否有效
        const isImage = item.raw ? (item.raw.type && item.raw.type.startsWith('image/')) : true
        const isLt10M = item.raw ? (item.raw.size && item.raw.size / 1024 / 1024 < 10) : true
        return isImage && isLt10M
      })

      this.tempProduct.detailFileList = validFileList

      // 对于已经上传成功的文件（编辑模式下的已有图片）和新选择的文件，保存其URL
      // 格式化为后端期望的字符串数组格式
      this.tempProduct.detailImages = validFileList
        .filter(item => item.status === 'success' && item.url)
        .map(item => {
          // 从URL中提取文件名（如果是完整URL）
          if (item.url.includes('/')) {
            return item.url.split('/').pop();
          }
          return item.url;
        })
    },

    // 批量上传详情图
    async uploadDetailImages() {
      const uploadPromises = this.tempProduct.detailFileList
        .filter(item => item.raw && item.status !== 'success')
        .map(async (item) => {
          try {
            const imageUrl = await this.uploadImage(item.raw)
            // 返回文件名而非对象
            if (imageUrl.includes('/')) {
              return imageUrl.split('/').pop();
            }
            return imageUrl;
          } catch (error) {
            console.error(`上传详情图 ${item.name} 失败:`, error)
            throw error
          }
        })

      const uploadedImages = await Promise.all(uploadPromises)

      // 直接合并字符串数组
      this.tempProduct.detailImages = [...this.tempProduct.detailImages, ...uploadedImages]
    },

    // 显示编辑对话框
    showUpdate(row, index) {
      this.dialogTitle = '编辑商品'
      // 处理图片URL，确保它们是完整的URL格式
      const processImageUrl = (imageUrl) => {
        // 如果已经是完整的URL或blob URL，直接返回
        if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://') || imageUrl.startsWith('blob:')) {
          return imageUrl;
        }
        // 否则假设是文件名，需要通过formatImageUrl处理
        return this.formatImageUrl(imageUrl);
      }

      this.tempProduct = {
        ...row,
        shopName: row.shopName || '',
        // 将图片URL数组转换为文件列表格式
        fileList: row.previewImages && row.previewImages.length > 0
          ? row.previewImages.map((url, index) => ({
              name: `预览图${index + 1}`,
              url: processImageUrl(url),
              // 标记为已上传成功
              status: 'success'
            }))
          : [],
        detailFileList: row.detailImages && row.detailImages.length > 0
          ? row.detailImages.map((url, index) => ({
              name: `详情图${index + 1}`,
              url: processImageUrl(url),
              // 标记为已上传成功
              status: 'success'
            }))
          : []
      }
      // 确保多图数组存在
      this.tempProduct.previewImages = row.previewImages || []
      this.tempProduct.detailImages = row.detailImages || []
      // 处理规格数据
      this.tempProduct.specifications = row.specifications && row.specifications.length > 0
        ? row.specifications
        : [
            {
              id: '',
              specName: '',
              price: '',
              stock: ''
            }
          ]
      this.dialogVisible = true
    },

    // 预览图上传前校验
    beforePreviewImageUpload(file) {
      const isImage = file.type.startsWith('image/')
      const isLt10M = file.size / 1024 / 1024 < 10

      if (!isImage) {
        this.$message.error('预览图只能上传图片文件!')
        return Promise.reject(new Error('预览图只能上传图片文件!'))
      }
      if (!isLt10M) {
        this.$message.error('预览图大小不能超过10MB!')
        return Promise.reject(new Error('预览图大小不能超过10MB!'))
      }
      return true
    },

    // 详情图上传前校验
    beforeDetailImageUpload(file) {
      const isImage = file.type.startsWith('image/')
      const isLt10M = file.size / 1024 / 1024 < 10

      if (!isImage) {
        this.$message.error('详情图只能上传图片文件!')
        return Promise.reject(new Error('详情图只能上传图片文件!'))
      }
      if (!isLt10M) {
        this.$message.error('详情图大小不能超过10MB!')
        return Promise.reject(new Error('详情图大小不能超过10MB!'))
      }
      return true
    },

    // 预览图移除前处理
    beforePreviewImageRemove(file, fileList) {
      // 当before-upload返回false时，会自动触发此方法
      // 我们需要确保文件从fileList中移除
      const isImage = file.type && file.type.startsWith('image/')
      const isLt10M = file.size && file.size / 1024 / 1024 < 10

      // 如果文件不满足条件，允许移除
      if (!isImage || !isLt10M) {
        return true
      }

      // 其他情况也允许移除
      return true
    },

    // 详情图移除前处理
    beforeDetailImageRemove(file, fileList) {
      // 当before-upload返回false时，会自动触发此方法
      // 我们需要确保文件从fileList中移除
      const isImage = file.type && file.type.startsWith('image/')
      const isLt10M = file.size && file.size / 1024 / 1024 < 10

      // 如果文件不满足条件，允许移除
      if (!isImage || !isLt10M) {
        return true
      }

      // 其他情况也允许移除
      return true
    },

    // 处理文件变化（仅验证，不上传）
    handleFileChange(file, fileList) {
      // 检查是否有无效文件并显示错误提示
      const invalidFiles = fileList.filter(item => {
        // 只检查新添加的原始文件
        if (!item.raw) return false

        const isImage = item.raw.type && item.raw.type.startsWith('image/')
        const isLt10M = item.raw.size && item.raw.size / 1024 / 1024 < 10

        // 如果文件不是图片或大于10MB，显示错误提示
        if (!isImage) {
          this.$message.error(`预览图 ${item.name} 只能是图片文件!`)
          return true
        }
        if (!isLt10M) {
          this.$message.error(`预览图 ${item.name} 大小不能超过10MB!`)
          return true
        }

        return false
      })

      // 过滤掉验证失败的文件
      const validFileList = fileList.filter(item => {
        // 检查文件是否有效
        const isImage = item.raw ? (item.raw.type && item.raw.type.startsWith('image/')) : true
        const isLt10M = item.raw ? (item.raw.size && item.raw.size / 1024 / 1024 < 10) : true
        return isImage && isLt10M
      })

      this.tempProduct.fileList = validFileList

      // 对于已经上传成功的文件（编辑模式下的已有图片）和新选择的文件，保存其URL
      // 格式化为后端期望的字符串数组格式
      this.tempProduct.previewImages = validFileList
        .filter(item => item.status === 'success' && item.url)
        .map(item => {
          // 从URL中提取文件名（如果是完整URL）
          if (item.url.includes('/')) {
            return item.url.split('/').pop();
          }
          return item.url;
        })
    },

    // 批量上传预览图
    async uploadPreviewImages() {
      const uploadPromises = this.tempProduct.fileList
        .filter(item => item.raw && item.status !== 'success')
        .map(async (item) => {
          try {
            const imageUrl = await this.uploadImage(item.raw)
            // 返回文件名而非对象
            if (imageUrl.includes('/')) {
              return imageUrl.split('/').pop();
            }
            return imageUrl;
          } catch (error) {
            console.error(`上传图片 ${item.name} 失败:`, error)
            throw error
          }
        })

      const uploadedImages = await Promise.all(uploadPromises)

      // 直接合并字符串数组
      this.tempProduct.previewImages = [...this.tempProduct.previewImages, ...uploadedImages]
    },

    // 提交表单
    async submitForm() {
      this.$refs.productForm.validate(async (valid) => {
        if (valid) {
          try {
            // 检查销售规格是否重复
            const specNames = this.tempProduct.specifications.map(spec => spec.specName.trim())
            const uniqueSpecNames = new Set(specNames)

            if (specNames.length !== uniqueSpecNames.size) {
              this.$message.error('销售规格不能重复')
              return
            }

            // 显示加载状态
            this.$loading({
              lock: true,
              text: '正在上传图片...',
              spinner: 'el-icon-loading',
              background: 'rgba(0, 0, 0, 0.7)'
            })

            // 在提交表单前统一上传所有图片
            await Promise.all([
              this.uploadPreviewImages(),
              this.uploadDetailImages()
            ])

            const formData = {
              title: this.tempProduct.title,
              description: this.tempProduct.description,
              productUrl: this.tempProduct.productUrl,
              // 直接使用字符串数组格式
            previewImages: this.tempProduct.previewImages.filter(url => url),
            detailImages: this.tempProduct.detailImages.filter(url => url),
              status: this.tempProduct.status,
              specifications: this.tempProduct.specifications
            }

            if (this.dialogTitle === '添加商品') {
              await this.createProduct(formData)
            } else {
              await this.updateProduct({...formData, id: this.tempProduct.id})
            }
          } catch (error) {
            this.$message.error('操作失败，请重试')
            console.error('提交失败:', error)
          } finally {
            // 关闭加载状态
            this.$loading().close()
          }
        }
      })
    },

    // 创建商品
    async createProduct(data) {
      // 添加当前用户ID到请求数据中
      const requestData = {
        ...data,
        userId: this.$store.getters.userId
      };

      try {
        await this.api({
          url: '/products/subject/add',
          method: 'post',
          data: requestData
        })
        this.$message.success('添加成功')
        this.dialogVisible = false
        this.getProductList()
      } catch (error) {
        this.$message.error('添加失败')
        throw error // 向上抛出错误以便submitForm捕获
      }
    },

    // 更新商品
    async updateProduct(data) {
      try {
        await this.api({
          url: '/products/subject/update',
          method: 'post',
          data: data
        })
        this.$message.success('更新成功')
        this.dialogVisible = false
        this.getProductList()
      } catch (error) {
        this.$message.error('更新失败')
        throw error // 向上抛出错误以便submitForm捕获
      }
    },

    // 删除商品
    handleDelete(index) {
      const product = this.productList[index]
      this.$confirm('确定要删除该商品吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.api({
          url: '/products/subject/delete',
          method: 'post',
          data: { id: product.id }
        }).then(() => {
          this.$message.success('删除成功')
          this.getProductList()
        }).catch(() => {
          this.$message.error('删除失败')
        })
      })
    },

    // 分页事件处理
    handleCurrentChange(val) {
      this.currentPage = val
      this.getProductList()
    },

    handleSizeChange(val) {
      this.pageSize = val
      this.currentPage = 1
      this.getProductList()
    },

    // 搜索功能
    handleSearch() {
      this.currentPage = 1 // 搜索时重置到第一页
      this.getProductList()
    },

    // 重置搜索条件
    resetSearch() {
      this.searchForm = {
        title: '',
        shopName: '',
        status: '',
        startTime: '',
        endTime: ''
      }
      this.searchDateRange = null
      this.currentPage = 1
      this.getProductList()
    },

    // 日期范围变化处理
    handleDateRangeChange(value) {
      if (value && value.length === 2) {
        this.searchForm.startTime = value[0]
        this.searchForm.endTime = value[1]
      } else {
        this.searchForm.startTime = ''
        this.searchForm.endTime = ''
      }
    },

    // 添加规格
    addSpecification() {
      this.tempProduct.specifications.push({
        id: '',
        specName: '',
        price: '',
        stock: ''
      })
    },

    // 删除规格
    removeSpecification(index) {
      this.tempProduct.specifications.splice(index, 1)
    },

    // 上传图片到服务器
    async uploadImage(file) {
      const formData = new FormData()
      formData.append('file', file)

      try {
        const response = await this.api({
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
  },

  mounted() {
    // 组件挂载时获取商品列表
    this.getProductList()
  }
}
</script>

<style scoped>
.app-container {
  padding: 20px;
}

.filter-container {
  margin-bottom: 20px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
.word-count {
  text-align: right;
  color: #909399;
  font-size: 12px;
  margin-top: 4px;
  line-height: 1;
}
</style>
