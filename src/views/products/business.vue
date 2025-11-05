<template>
  <div class="app-container">
    <el-card shadow="never">
      <div slot="header" class="clearfix">
        <span>购物车</span>
      </div>

      <!-- 查询（仅分页查询） -->
      <el-form :inline="true" :model="queryForm" size="small" @submit.native.prevent>
        <el-form-item label="用户ID">
          <el-input
            v-model.trim="queryForm.userId"
            placeholder="请输入用户ID"
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
        <el-form-item label="商品ID">
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
        <el-table-column prop="skuId" label="商品ID" width="140" />
        <el-table-column prop="createTime" label="创建时间" min-width="180" />
        <el-table-column prop="updateTime" label="更新时间" min-width="180" />
        <el-table-column label="操作" width="120" fixed="right">
          <template slot-scope="{ row }">
            <el-button type="danger" size="mini" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        class="mt16"
        background
        layout="total, sizes, prev, pager, next, jumper"
        :current-page="pagination.page"
        :page-size="pagination.pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="pagination.total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
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
  methods: {
    async handleSearch(page = this.pagination.page) {
      if (!this.queryForm.userId) {
        this.$message.warning('请先输入用户ID')
        return
      }
      this.loading = true
      try {
        const params = {
          userId: Number(this.queryForm.userId),
          page: Number(page) || 1,
          pageSize: Number(this.pagination.pageSize) || 10
        }
        const res = await pageCart(params)
        console.log('cart/page params:', params, 'resp:', res)
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
    // 新增（保留）
    async handleAdd() {
      if (!this.addForm.userId || !this.addForm.skuId) {
        this.$message.warning('请填写用户ID与商品ID')
        return
      }
      try {
        const res = await addCart({
          userId: Number(this.addForm.userId),
          skuId: Number(this.addForm.skuId)
        })
        if (res.code === 200 || res.code === 1) {
          this.$message.success('加入购物车成功')
          if (this.queryForm.userId && String(this.queryForm.userId) === String(this.addForm.userId)) {
            await this.handleSearch()
          }
          this.addForm.userId = ''
          this.addForm.skuId = ''
        } else {
          this.$message.error(res.msg || '加入失败')
        }
      } catch (e) {
        this.$message.error('请求异常')
      }
    },

    // 删除（保留）
    async handleDelete(row) {
      try {
        await this.$confirm('确认删除该商品吗？', '提示', { type: 'warning' })
        const res = await deleteCartItem(row.userId, row.skuId)
        if (res.code === 200 || res.code === 1) {
          this.$message.success('删除成功')
          this.handleSearch()
        } else {
          this.$message.error(res.msg || '删除失败')
        }
      } catch (e) {
        if (e !== 'cancel') this.$message.error('请求异常')
      }
    },

    // 分页交互
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
</style>
