<template>
  <div class="page">
    <el-card>
      <div slot="header" class="header">
        <div class="filters">
          <el-select v-model="query.targetType" placeholder="选择类型" style="width: 220px" clearable filterable>
            <el-option label="旅游线路" value="tour_route" />
            <el-option label="养老驿站" value="elderly_station" />
            <el-option label="研学方案" value="study_plan" />
            <el-option label="研学活动" value="study_activity" />
            <el-option label="民宿" value="homestay" />
            <el-option label="农产品" value="product" />
            <el-option label="餐饮" value="restaurant" />
          </el-select>
          <span style="margin: 0 4px;">近</span>
          <el-input-number v-model="query.days" :min="1" :max="90" size="small" style="width: 120px;" />
          <span style="margin-left: 4px;">天</span>
          <el-button type="primary" icon="el-icon-search" @click="handleSearch" style="margin-left: 10px;">查询</el-button>
          <el-button icon="el-icon-refresh" @click="handleReset">重置</el-button>
        </div>
      </div>

      <el-table :data="tableData" border stripe>
        <el-table-column type="index" label="序号" width="60" />
        <el-table-column prop="targetType" label="类型" width="120">
          <template slot-scope="scope">
            {{ getTypeLabel(scope.row.targetType) }}
          </template>
        </el-table-column>
        <el-table-column prop="targetName" label="对象名称" min-width="200">
          <template slot-scope="scope">
            {{ scope.row.targetName || scope.row.targetId || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="collectCount" label="收藏人数" width="140" />
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
  </div>
</template>

<script>
import { listCollectHotspot } from '@/api/collect'

export default {
  name: 'CollectHotspot',
  data() {
    return {
      query: {
        targetType: null, // 默认显示所有类型
        days: 7
      },
      tableData: [],
      pagination: {
        page: 1,
        pageSize: 10,
        total: 0
      }
    }
  },
  mounted() {
    this.loadData()
  },
  methods: {
    getTypeLabel(type) {
      const typeMap = {
        'tour_route': '旅游线路',
        'elderly_station': '养老驿站',
        'study_plan': '研学方案',
        'study_activity': '研学活动',
        'homestay': '民宿',
        'product': '农产品',
        'restaurant': '餐饮'
      }
      return typeMap[type] || type || '-'
    },
    async loadData() {
      const params = {
        page: this.pagination.page,
        limit: this.pagination.pageSize,
        days: this.query.days
      }
      // 如果选择了类型，才传递 targetType 参数
      if (this.query.targetType) {
        params.targetType = this.query.targetType
      }
      const res = await listCollectHotspot(params)
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
      this.query = { targetType: null, days: 7 }
      this.pagination.page = 1
      this.loadData()
    },
    handleSizeChange(val) {
      this.pagination.pageSize = val
      this.pagination.page = 1
      this.loadData()
    },
    handlePageChange(val) {
      this.pagination.page = val
      this.loadData()
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
  gap: 10px;
}
.pager {
  margin-top: 16px;
  text-align: right;
}
</style>


