<template>
  <div class="app-container">
    <!-- 搜索区域 -->
    <div class="filter-container">
      <el-form :inline="true" :model="queryParams" class="demo-form-inline">
        <el-form-item label="菜品分类">
          <el-input
            v-model="queryParams.categoryName"
            placeholder="请输入菜品分类"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="餐厅名称">
          <el-input
            v-model="queryParams.restaurantName"
            placeholder="请输入餐厅名称"
            clearable
            style="width: 200px"
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
    </div>

    <!-- 表格 -->
    <el-table 
      v-loading="loading" 
      :data="dishCategoryList" 
      row-key="id" 
      border 
      style="width: 100%"
    >
      <el-table-column prop="categoryName" label="菜品分类" min-width="160" />
      <el-table-column prop="restaurantName" label="餐厅名称" min-width="160" />
      <el-table-column prop="updateTime" label="更新时间" width="160" />
      <el-table-column label="操作" width="160" fixed="right">
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
      <el-table-column label="排序" align="center" width="100">
  <template slot-scope="scope">
    <div class="sort-buttons">
      <el-button 
        type="primary" 
        size="mini"
        icon="el-icon-arrow-up"
        circle
        @click="moveUp(scope.$index)"
        :disabled="scope.$index === 0"
      ></el-button>
      <el-button 
        type="primary" 
        size="mini"
        icon="el-icon-arrow-down"
        circle
        @click="moveDown(scope.$index)"
        :disabled="scope.$index === dishCategoryList.length - 1"
      ></el-button>
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
      <el-form ref="dishCategoryFormRef" :model="dishCategoryForm" :rules="dishCategoryRules" label-width="120px">
        <el-form-item label="菜品分类" prop="categoryName">
          <el-input v-model="dishCategoryForm.categoryName" placeholder="请输入菜品分类" maxlength="50" show-word-limit />
        </el-form-item>
        
        <el-form-item label="餐厅名称" prop="restaurantName">
          <el-select v-model="dishCategoryForm.restaurantName" placeholder="请选择餐厅" style="width: 100%">
            <el-option
              v-for="item in restaurantOptions"
              :key="item.id"
              :label="item.name"
              :value="item.name">
            </el-option>
          </el-select>
        </el-form-item>
        
        <el-form-item label="状态" prop="status">
          <el-select v-model="dishCategoryForm.status" placeholder="请选择状态" style="width: 100%">
            <el-option label="启用" :value="1" />
            <el-option label="禁用" :value="0" />
          </el-select>
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
import { getDishCategoryList, createDishCategory, updateDishCategory, deleteDishCategory, updateDishCategorySort } from '@/api/dishCategory'
import { listRestaurantNamesByUser } from '@/api/restaurant'

export default {
  name: 'DishCategory',
  components: { 
  },
  data() {
    return {
      // 表格数据
      dishCategoryList: [],
      // 饭店选项列表
      restaurantOptions: [],
      // 加载状态
      loading: false,
      // 总数
      total: 0,
      // 查询参数
      queryParams: {
        page: 1,
        pageSize: 10,
        categoryName: '',
        restaurantName: '',
        status: ''
      },
      // 对话框可见性
      dialogVisible: false,
      // 对话框标题
      dialogTitle: '',
      // 是否编辑模式
      isEdit: false,
      // 表单数据
      dishCategoryForm: {
        id: '',
        categoryName: '',
        restaurantName: '', // 动态获取餐厅名称
        status: 1
      },
      // 表单验证规则
      dishCategoryRules: {
        categoryName: [
          { required: true, message: '请输入菜品分类', trigger: 'blur' },
          { min: 1, max: 50, message: '菜品分类长度在 1 到 50 个字符', trigger: 'blur' }
        ],
        restaurantName: [
          { required: true, message: '请输入餐厅名称', trigger: 'blur' },
          { min: 1, max: 100, message: '餐厅名称长度在 1 到 100 个字符', trigger: 'blur' }
        ],
        status: [
          { required: true, message: '请选择状态', trigger: 'change' }
        ]
      },
      
    }
  },
  created() {
    this.getDishCategoryList()
    this.loadRestaurantList()
  },
  
  
  
  methods: {
    // 获取餐厅列表
    async loadRestaurantList() {
      try {
        const userId = this.$store.getters.userId
        const response = await listRestaurantNamesByUser(userId)
        if (response && (response.code === 200 || response.code === '200')) {
          // 处理返回的字符串数组格式 ["测试饭店","111"]
          this.restaurantOptions = (response.data || []).map(name => ({
            id: name,
            name: name
          }))
          console.log('Restaurant Options:', this.restaurantOptions)
        } else {
          this.$message.error('获取餐厅列表失败')
        }
      } catch (error) {
        console.error('获取餐厅列表失败:', error)
        this.$message.error('获取餐厅列表失败，请重试')
      }
    },
    
    async getDishCategoryList() {
      this.loading = true
      try {
        const response = await getDishCategoryList({
          ...this.queryParams,
          userId: this.$store.getters.userId
        })
        
        // 输出response和response code用于调试
        console.log('API Response:', response)
        console.log('Response Code:', response ? response.code : 'undefined')
        
        // 修复：增强响应判断逻辑，确保正确处理后端返回的数据
        if (response && (response.code === 200 || response.code === '200')) {
          // 确保数据结构正确并设置默认值
          this.dishCategoryList = (response.data && response.data.records) || []
          this.total = (response.data && response.data.total) || 0
        } else {
          // 优化错误处理，优先使用后端返回的错误信息
          const errorMsg = (response && response.msg) ? response.msg : '获取菜品分类列表失败'
          this.$message.error(errorMsg)
          this.dishCategoryList = []
          this.total = 0
        }
      } catch (error) {
        console.error('获取菜品分类列表失败:', error)
        this.$message.error('获取菜品分类列表失败，请重试')
        this.dishCategoryList = []
        this.total = 0
      } finally {
        this.loading = false
      }
    },
    
    // 向上移动
    async moveUp(index) {
      if (index > 0) {
        // 交换位置
        [this.dishCategoryList[index], this.dishCategoryList[index - 1]] = 
        [this.dishCategoryList[index - 1], this.dishCategoryList[index]]
        
        // 更新排序
        await this.updateSort()
      }
    },
    
    // 向下移动
    async moveDown(index) {
      if (index < this.dishCategoryList.length - 1) {
        // 交换位置
        [this.dishCategoryList[index], this.dishCategoryList[index + 1]] = 
        [this.dishCategoryList[index + 1], this.dishCategoryList[index]]
        
        // 更新排序
        await this.updateSort()
      }
    },
    
    // 更新排序
    async updateSort() {
      try {
        // 构造排序数据
        const sortData = this.dishCategoryList.map((item, index) => ({
          id: item.id,
          sortNum: index + 1
        }))
        
        // 调用API更新排序
        const response = await updateDishCategorySort(sortData)
        
        if (response && (response.code === 200 || response.code === '200')) {
          this.$message.success('排序更新成功')
          // 成功后重新获取列表以确保数据一致性
          await this.getDishCategoryList()
        } else {
          const errorMsg = (response && response.msg) ? response.msg : '排序更新失败'
          this.$message.error(errorMsg)
          // 如果更新失败，重新获取列表以恢复原始顺序
          await this.getDishCategoryList()
        }
      } catch (error) {
        console.error('排序更新失败:', error)
        this.$message.error('排序更新失败，请重试')
        // 如果更新失败，重新获取列表以恢复原始顺序
        await this.getDishCategoryList()
      }
    },

    // 搜索
    handleQuery() {
      this.queryParams.page = 1
      this.getDishCategoryList()
    },
    
    // 重置搜索条件
    resetQuery() {
      this.queryParams = {
        page: 1,
        pageSize: 10,
        categoryName: '',
        restaurantName: '',
        status: ''
      }
      this.getDishCategoryList()
    },
    
    // 新增
    handleAdd() {
      this.isEdit = false
      this.dialogTitle = '新增菜品分类'
      this.resetForm()
      this.dialogVisible = true
    },
    
    // 编辑
    handleEdit(row) {
      this.isEdit = true
      this.dialogTitle = '编辑菜品分类'
      this.dishCategoryForm = { ...row }
      // 不再硬编码餐厅名称
      this.dialogVisible = true
    },
    
    // 删除
    handleDelete(row) {
      this.$confirm('确定要删除该菜品分类吗？', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          const response = await deleteDishCategory(row.id)
          
          if (response && (response.code === 200 || response.code === '200')) {
            this.$message.success('删除成功')
            this.getDishCategoryList()
          } else {
            // 优化错误处理，优先使用后端返回的错误信息
            const errorMsg = (response && response.msg) ? response.msg : '删除失败'
            this.$message.error(errorMsg)
          }
        } catch (error) {
            console.error('删除菜品分类失败:', error)
            this.$message.error('删除失败，请重试')
          }
      }).catch(() => {
        // 取消删除
      })
    },
    
    // 提交表单
    async submitForm() {
      this.$refs.dishCategoryFormRef.validate(async (valid) => {
        if (valid) {
          try {
            const formData = {
              ...this.dishCategoryForm,
              userId: this.$store.getters.userId
            }
            
            let response
            if (this.isEdit) {
              response = await updateDishCategory(formData)
            } else {
              response = await createDishCategory(formData)
            }
            
            // 更健壮的响应处理，增加更多成功状态的判断
            console.log('API响应:', response)
            if (response && (response.code === 200 || response.code === '200' || response.success || response.result === true)) {
              this.$message.success(this.isEdit ? '更新成功' : '新增成功')
              this.dialogVisible = false
              this.getDishCategoryList()
            } else {
              console.error('操作失败，响应码:', response ? response.code : 'undefined')
              // 修复：当response.msg为null时提供默认错误消息
              const errorMsg = response && response.msg ? response.msg : (this.isEdit ? '更新失败' : '新增失败')
              this.$message.error(errorMsg)
            }
          } catch (error) {
            console.error(this.isEdit ? '更新菜品分类失败:' : '新增菜品分类失败:', error)
            this.$message.error(this.isEdit ? '更新失败，请重试' : '新增失败，请重试')
          }
        }
      })
    },
    
    // 重置表单
    resetForm() {
      this.dishCategoryForm = {
        id: '',
        categoryName: '',
        restaurantName: '', // 动态获取餐厅名称
        status: 1
      }
      if (this.$refs.dishCategoryFormRef) {
        this.$refs.dishCategoryFormRef.resetFields()
      }
    },
    
    // 分页大小变化
    handleSizeChange(val) {
      this.queryParams.pageSize = val
      this.queryParams.page = 1
      this.getDishCategoryList()
    },
    
    // 当前页码变化
    handleCurrentChange(val) {
      this.queryParams.page = val
      this.getDishCategoryList()
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

.filter-container {
  margin-bottom: 20px;
}

.operation-buttons {
  display: flex;
  gap: 0;
}

.operation-buttons .el-button {
  padding: 6px 10px;
  font-size: 13px;
}

.sort-buttons {
  display: flex;
  justify-content: center;
  gap: 5px;
}

.sort-buttons .el-button {
  margin: 0;
  padding: 5px 8px;
  font-size: 12px;
  background-color: #fff;
  border-color: #fff;
  color: #606266;
}

.sort-buttons .el-button:hover {
  background-color: #f5f7fa;
  border-color: #fff;
  color: #606266;
}

.sort-buttons .el-button:first-child {
  margin-right: 5px;
}

.sort-buttons .el-button:focus {
  color: #606266;
  border-color: #fff;
}
</style>