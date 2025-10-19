<template>
  <div class="app-container">
    <!-- 搜索区域 -->
    <div class="filter-container">
      <el-form :inline="true" :model="queryParams" class="demo-form-inline">
        <el-form-item label="所属乡村">
          <el-select
            v-model="queryParams.villageId"
            placeholder="请选择乡村"
            clearable
            style="width: 200px"
          >
            <el-option label="测试乡村1" :value="1" />
            <el-option label="测试乡村2" :value="2" />
            <el-option label="测试乡村3" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item label="民宿名称">
          <el-input
            v-model="queryParams.homestayName"
            placeholder="请输入民宿名称"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="地址">
          <el-input
            v-model="queryParams.address"
            placeholder="请输入地址"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="营业状态">
          <el-select
            v-model="queryParams.status"
            placeholder="请选择状态"
            clearable
            style="width: 150px"
          >
            <el-option label="营业" :value="1" />
            <el-option label="暂停营业" :value="2" />
            <el-option label="已下架" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item label="星级">
          <el-select
            v-model="queryParams.starLevel"
            placeholder="请选择星级"
            clearable
            style="width: 120px"
          >
            <el-option label="未评" :value="0" />
            <el-option label="1星" :value="1" />
            <el-option label="2星" :value="2" />
            <el-option label="3星" :value="3" />
            <el-option label="4星" :value="4" />
            <el-option label="5星" :value="5" />
          </el-select>
        </el-form-item>
        <el-form-item label="负责人">
          <el-input
            v-model="queryParams.contactName"
            placeholder="请输入负责人姓名"
            clearable
            style="width: 200px"
          />
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
      :data="homestayList"
      border
      style="width: 100%"
    >
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="homestayName" label="民宿名称" width="150" />
      <el-table-column prop="address" label="地址" show-overflow-tooltip />
      <el-table-column label="营业状态" width="100">
        <template slot-scope="scope">
          <el-tag :type="getStatusType(scope.row.status)">
            {{ getStatusText(scope.row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="星级" width="120">
        <template slot-scope="scope">
          <el-rate
            v-model="scope.row.starLevel"
            disabled
            show-score
            text-color="#ff9900"
          />
        </template>
      </el-table-column>
      <el-table-column prop="roomCount" label="客房数" width="80" />
      <el-table-column prop="bedCount" label="床位数" width="80" />
      <el-table-column prop="maxCapacity" label="最大接待" width="100" />
      <el-table-column prop="contactName" label="负责人" width="100" />
      <el-table-column prop="contactPhone" label="联系电话" width="120" />
      <el-table-column prop="price" label="房价(元/月)" width="120">
        <template slot-scope="scope">
          <span style="color: #f56c6c; font-weight: bold;">
            ¥{{ scope.row.price }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200" fixed="right">
        <template slot-scope="scope">
          <el-button size="mini" @click="handleEdit(scope.row)">编辑</el-button>
          <el-button size="mini" type="danger" @click="handleDelete(scope.row)">删除</el-button>
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
  </div>
</template>

<script>
import { getHomestayList, addHomestay, updateHomestay, deleteHomestay } from '@/api/homestay'

export default {
  name: 'VillageHomestayList',
  data() {
    return {
      loading: false,
      homestayList: [],
      total: 0,
      queryParams: {
        page: 1,
        pageSize: 10,
        villageId: null,
        homestayName: '',
        address: '',
        status: null,
        starLevel: null,
        contactName: ''
      }
    }
  },
  created() {
    console.log('=== 组件创建，开始获取民宿列表 ===')
    this.getList()
  },
  methods: {
    // 获取民宿列表
    getList() {
      console.log('=== 开始获取民宿列表 ===')
      console.log('查询参数：', this.queryParams)
      this.loading = true

      getHomestayList(this.queryParams).then(response => {
        console.log('=== 民宿列表API响应 ===')
        console.log('完整响应：', response)
        console.log('响应码：', response.code)
        console.log('响应消息：', response.msg)
        console.log('响应数据：', response.data)

        if (response.code === 1) {
          this.homestayList = response.data.records || []
          this.total = response.data.total
          console.log('=== 数据设置成功 ===')
          console.log('民宿列表：', this.homestayList)
          console.log('总数：', this.total)
        } else {
          console.error('API返回错误：', response.msg)
          this.$message.error(response.msg || '获取数据失败')
        }
        this.loading = false
      }).catch(error => {
        console.error('=== API请求失败 ===')
        console.error('错误信息：', error)
        this.loading = false
        this.$message.error('网络连接失败, 请检查网络连接')
      })
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
        villageId: null,
        homestayName: '',
        address: '',
        status: null,
        starLevel: null,
        contactName: ''
      }
      this.getList()
    },

    // 分页大小改变
    handleSizeChange(val) {
      this.queryParams.pageSize = val
      this.queryParams.page = 1
      this.getList()
    },

    // 当前页改变
    handleCurrentChange(val) {
      this.queryParams.page = val
      this.getList()
    },

    // 新增
    handleAdd() {
      this.$message.info('新增功能待实现')
    },

    // 编辑
    handleEdit(row) {
      this.$message.info('编辑功能待实现')
    },

    // 删除
    handleDelete(row) {
      this.$message.info('删除功能待实现')
    },

    // 获取状态类型
    getStatusType(status) {
      const statusMap = {
        1: 'success',
        2: 'warning',
        3: 'danger'
      }
      return statusMap[status] || 'info'
    },

    // 获取状态文本
    getStatusText(status) {
      const statusMap = {
        1: '营业',
        2: '暂停营业',
        3: '已下架'
      }
      return statusMap[status] || '未知'
    }
  }
}
</script>

<style scoped>
.filter-container {
  margin-bottom: 20px;
}

.pagination-container {
  margin-top: 20px;
  text-align: right;
}
</style>
