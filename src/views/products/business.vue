<template>
  <div class="app-container">
    <el-card shadow="never">
      <div slot="header" class="clearfix">
        <span>购物车</span>
      </div>

      <!-- 查询（用户ID可选） -->
      <el-form :inline="true" :model="queryForm" size="small" @submit.native.prevent>
        <el-form-item label="用户ID">
          <el-input
            v-model.trim="queryForm.userId"
            placeholder="请输入用户ID（可留空）"
            clearable
            @keyup.enter.native="handleSearch"
            style="width:220px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 加入购物车（保留） -->
      <el-form :inline="true" :model="addForm" size="small" class="mt16" @submit.native.prevent>
        <el-form-item label="用户ID">
          <el-input v-model.trim="addForm.userId" placeholder="用户ID" style="width:180px" />
        </el-form-item>
        <el-form-item label="商品规格ID">
          <el-input v-model.trim="addForm.skuId" placeholder="SKU ID" style="width:180px" />
        </el-form-item>
        <el-form-item>
          <el-button type="success" @click="handleAdd">加入购物车</el-button>
        </el-form-item>
      </el-form>

      <!-- 列表 -->
      <el-table
        v-loading="loading"
        :data="tableData"
        border
        class="mt16"
        :header-cell-style="{ background: '#f5f7fa' }"
        empty-text="暂无数据"
      >
        <el-table-column prop="userId" label="用户ID" width="100" />
        <el-table-column label="商品信息" min-width="200">
          <template slot-scope="{ row }">
            <div style="display: flex; align-items: center;">
              <el-image
                v-if="row.previewImage"
                :src="row.previewImage"
                style="width: 60px; height: 60px; margin-right: 10px; border-radius: 4px;"
                fit="cover"
                :preview-src-list="[row.previewImage]"
              />
              <div>
                <div style="font-weight: bold; margin-bottom: 4px;">{{ row.title || '-' }}</div>
                <div style="font-size: 12px; color: #909399;">{{ row.intro || '-' }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="规格" width="150">
          <template slot-scope="{ row }">
            <el-tag size="small" type="info">{{ row.specs || '-' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="价格" width="100" align="right">
          <template slot-scope="{ row }">
            <span style="color: #f56c6c; font-weight: bold;">¥{{ (row.price / 100).toFixed(2) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="库存" width="80" align="center">
          <template slot-scope="{ row }">
            <span :style="{ color: row.stock > 0 ? '#67c23a' : '#f56c6c' }">
              {{ row.stock || 0 }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="商品状态" width="100" align="center">
          <template slot-scope="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'" size="small">
              {{ row.status === 1 ? '上架' : '下架' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="skuId" label="SKU ID" width="100" />
        <el-table-column prop="createTime" label="创建时间" min-width="180" />
        <el-table-column prop="updateTime" label="更新时间" min-width="180" />
        <el-table-column label="操作" width="120" fixed="right">
          <template slot-scope="{ row }">
            <el-button type="danger" size="mini" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页（右下角对齐） -->
      <div class="mt16 pager-right">
        <el-pagination
          background
          layout="total, sizes, prev, pager, next, jumper"
          :current-page="pagination.page"
          :page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script>
import { addCart, deleteCartItem, pageCart } from '@/api/cart'

export default {
  name: 'CartBusiness',
  data() {
    return {
      loading: false,
      queryForm: { userId: '' },
      addForm: { userId: '', skuId: '' },
      tableData: [],
      pagination: { page: 1, pageSize: 10, total: 0 }
    }
  },
  created() {
    this.handleSearch(1)
  },
  methods: {
    async handleSearch(page = this.pagination.page) {
      this.loading = true
      try {
        const params = {
          page: Number(page) || 1,
          pageSize: Number(this.pagination.pageSize) || 10
        }
        if (this.queryForm.userId !== '' && this.queryForm.userId != null) {
          params.userId = Number(this.queryForm.userId)
        }

        const res = await pageCart(params)
        if (res && (res.code === 200 || res.code === 1 || res.code === '200' || res.code === '1')) {
          const d = res.data || {}
          const rows = Array.isArray(d.list) ? d.list : []
          this.tableData = rows
          this.pagination.total = Number(d.total || 0)
          this.pagination.page = Number(d.page || params.page)
          this.pagination.pageSize = Number(d.pageSize || this.pagination.pageSize)
        } else {
          this.$message.error((res && res.msg) || '查询失败')
        }
      } catch (e) {
        console.error('cart/page error:', e)
        this.$message.error('请求异常')
      } finally {
        this.loading = false
      }
    },
    handleReset() {
      this.queryForm.userId = ''
      this.pagination.page = 1
      this.pagination.pageSize = 10
      this.handleSearch(1)
    },
    async handleAdd() {
      if (!this.addForm.userId || !this.addForm.skuId) {
        this.$message.warning('请填写用户ID与商品规格ID')
        return
      }
      try {
        const res = await addCart({
          userId: Number(this.addForm.userId),
          skuId: Number(this.addForm.skuId)
        })
        if (res.code === 200 || res.code === 1) {
          this.$message.success('加入购物车成功')
          await this.handleSearch(this.pagination.page)
          this.addForm.userId = ''
          this.addForm.skuId = ''
        } else {
          // 显示后端返回的具体错误信息（如"商品已下架，无法加入购物车"）
          this.$message.error(res.msg || res.message || '加入失败')
        }
      } catch (e) {
        // 捕获网络异常等，显示详细错误信息
        console.error('加入购物车异常:', e)

      }
    },
    async handleDelete(row) {
      try {
        await this.$confirm('确认删除该商品吗？', '提示', { type: 'warning' })
        const res = await deleteCartItem(row.userId, row.skuId)
        if (res.code === 200 || res.code === 1) {
          this.$message.success('删除成功')
          this.handleSearch(this.pagination.page)
        } else {
          this.$message.error(res.msg || '删除失败')
        }
      } catch (e) {
        if (e !== 'cancel') this.$message.error('请求异常')
      }
    },
    handleSizeChange(size) {
      this.pagination.pageSize = size
      this.pagination.page = 1
      this.handleSearch(1)
    },
    handleCurrentChange(p) {
      this.handleSearch(p)
    }
  }
}
</script>

<style scoped>
.mt16 { margin-top: 16px; }
.pager-right {
  display: flex;
  justify-content: flex-end;
}
</style>
