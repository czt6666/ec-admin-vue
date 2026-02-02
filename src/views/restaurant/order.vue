<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input
        v-model="searchForm.orderNo"
        placeholder="订单编号"
        style="width: 200px;"
        class="filter-item"
        @keyup.enter.native="handleFilter"
      />
      <el-select
        v-model="searchForm.restaurantId"
        placeholder="餐厅"
        clearable
        style="width: 200px;"
        class="filter-item"
      >
        <el-option
          v-for="restaurant in restaurantList"
          :key="restaurant.id"
          :label="restaurant.name"
          :value="restaurant.id"
        />
      </el-select>
      <el-select
        v-model="searchForm.orderStatus"
        placeholder="订单状态"
        clearable
        style="width: 150px;"
        class="filter-item"
      >
        <el-option label="待处理" :value="1" />
        <el-option label="已确认" :value="2" />
        <el-option label="已完成" :value="3" />
        <el-option label="已取消" :value="4" />
      </el-select>
      <el-button
        class="filter-item"
        type="primary"
        icon="el-icon-search"
        @click="handleFilter"
      >
        搜索
      </el-button>
    </div>

    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="orderList"
      border
      fit
      highlight-current-row
      style="width: 100%;"
    >
      <el-table-column label="订单编号" prop="orderNo" align="center" width="150">
        <template slot-scope="{row}">
          <span>{{ row.orderNo }}</span>
        </template>
      </el-table-column>
      
      <el-table-column label="餐厅" prop="restaurantName" align="center" width="200">
        <template slot-scope="{row}">
          <span>{{ row.restaurantName }}</span>
        </template>
      </el-table-column>
      
      <el-table-column label="用户ID" prop="userId" align="center" width="100">
        <template slot-scope="{row}">
          <span>{{ row.userId }}</span>
        </template>
      </el-table-column>
      
      <el-table-column label="订单金额" prop="totalAmount" align="center" width="120">
        <template slot-scope="{row}">
          <span>¥{{ row.totalAmount }}</span>
        </template>
      </el-table-column>
      
      <el-table-column label="订单状态" align="center" width="120">
        <template slot-scope="{row}">
          <el-tag :type="getOrderStatusType(row.orderStatus)">
            {{ getOrderStatusText(row.orderStatus) }}
          </el-tag>
        </template>
      </el-table-column>
      
      <el-table-column label="备注" prop="remark" align="center" width="200">
        <template slot-scope="{row}">
          <span>{{ row.remark || '-' }}</span>
        </template>
      </el-table-column>
      
      <el-table-column label="创建时间" prop="createTime" align="center" width="160">
        <template slot-scope="{row}">
          <span>{{ parseTime(row.createTime) }}</span>
        </template>
      </el-table-column>
      
      <el-table-column label="操作" align="center" width="180" class-name="small-padding fixed-width">
        <template slot-scope="{row}">
          <el-button type="primary" size="mini" @click="showDetail(row)">
            查看详情
          </el-button>
          <el-button 
            v-if="row.orderStatus === 1" 
            type="success" 
            size="mini" 
            @click="updateOrderStatus(row, 2)"
          >
            确认订单
          </el-button>
          <el-button 
            v-if="row.orderStatus === 2" 
            type="warning" 
            size="mini" 
            @click="updateOrderStatus(row, 3)"
          >
            完成订单
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="currentPage"
      :limit.sync="pageSize"
      @pagination="getList"
    />

    <!-- 订单详情对话框 -->
    <el-dialog title="订单详情" :visible.sync="dialogDetailVisible" width="60%">
      <div v-if="currentOrder">
        <h4>订单信息</h4>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="订单编号">{{ currentOrder.orderNo }}</el-descriptions-item>
          <el-descriptions-item label="餐厅">{{ currentOrder.restaurantName }}</el-descriptions-item>
          <el-descriptions-item label="用户ID">{{ currentOrder.userId }}</el-descriptions-item>
          <el-descriptions-item label="订单金额">¥{{ currentOrder.totalAmount }}</el-descriptions-item>
          <el-descriptions-item label="订单状态">
            <el-tag :type="getOrderStatusType(currentOrder.orderStatus)">
              {{ getOrderStatusText(currentOrder.orderStatus) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ parseTime(currentOrder.createTime) }}</el-descriptions-item>
          <el-descriptions-item label="备注" :span="2">{{ currentOrder.remark || '无' }}</el-descriptions-item>
        </el-descriptions>

        <h4 class="mt-20">菜品列表</h4>
        <el-table :data="currentOrder.orderItems || []" border style="width: 100%">
          <el-table-column prop="dishName" label="菜品名称" width="300" />
          <el-table-column prop="dishPrice" label="单价" width="100">
            <template slot-scope="{row}">
              ¥{{ row.dishPrice }}
            </template>
          </el-table-column>
          <el-table-column prop="quantity" label="数量" width="80" />
          <el-table-column prop="subtotalAmount" label="小计" width="120">
            <template slot-scope="{row}">
              ¥{{ row.subtotalAmount }}
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogDetailVisible = false">关闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getOrderList, getOrderDetail, updateOrderStatus } from '@/api/orders'
import { listRestaurant } from '@/api/restaurant'
import { parseTime } from '@/utils'

export default {
  data() {
    return {
      tableKey: 0,
      orderList: [],
      restaurantList: [],
      total: 0,
      listLoading: true,
      currentPage: 1,
      pageSize: 10,
      searchForm: {
        orderNo: '',
        restaurantId: null,
        orderStatus: null
      },
      dialogDetailVisible: false,
      currentOrder: null
    }
  },
  created() {
    this.getList()
    this.loadRestaurants()
  },
  methods: {
    getList() {
      this.listLoading = true
      const params = {
        pageNum: this.currentPage,
        pageRow: this.pageSize,
        ...(this.searchForm.orderNo && { orderNo: this.searchForm.orderNo }),
        ...(this.searchForm.restaurantId && { restaurantId: this.searchForm.restaurantId }),
        ...(this.searchForm.orderStatus && { orderStatus: this.searchForm.orderStatus })
      }

      getOrderList(params).then(response => {
        this.orderList = response.data.records || []
        this.total = response.data.total || 0
        this.listLoading = false
      }).catch(error => {
        console.error('获取订单列表失败:', error)
        this.listLoading = false
      })
    },
    loadRestaurants() {
      listRestaurant({ pageNum: 1, pageRow: 1000 }).then(response => {
        this.restaurantList = response.data.records || []
      }).catch(error => {
        console.error('获取餐厅列表失败:', error)
      })
    },
    handleFilter() {
      this.currentPage = 1
      this.getList()
    },
    showDetail(row) {
      getOrderDetail(row.id).then(response => {
        this.currentOrder = response.data
        this.dialogDetailVisible = true
      }).catch(error => {
        this.$message.error('获取订单详情失败: ' + error.message)
      })
    },
    updateOrderStatus(row, newStatus) {
      this.$confirm(`确定要将订单状态更新为${this.getOrderStatusText(newStatus)}吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        updateOrderStatus({
          orderId: row.id,
          orderStatus: newStatus
        }).then(response => {
          this.$message.success('订单状态更新成功')
          this.getList() // 刷新列表
        }).catch(error => {
          this.$message.error('订单状态更新失败: ' + error.message)
        })
      }).catch(() => {
        // 用户取消操作
      })
    },
    getOrderStatusText(status) {
      const statusMap = {
        1: '待处理',
        2: '已确认',
        3: '已完成',
        4: '已取消'
      }
      return statusMap[status] || '未知'
    },
    getOrderStatusType(status) {
      const typeMap = {
        1: 'info',
        2: 'warning',
        3: 'success',
        4: 'danger'
      }
      return typeMap[status]
    },
    parseTime
  }
}
</script>

<style scoped>
.mt-20 {
  margin-top: 20px;
}

.ml-10 {
  margin-left: 10px;
}

.stat-item {
  text-align: center;
  padding: 20px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
}

.stat-number {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 14px;
  color: #909399;
}

.box-card {
  width: 100%;
}
</style>