<template>
  <div class="app-container">
    <div class="filter-container">
      <el-form>
        <el-form-item>
          <el-button type="primary" icon="plus" @click="handleAddSource">添加数据源
          </el-button>
        </el-form-item>
        <el-form-item>
          <h2>数据汇聚管理</h2>
        </el-form-item>
      </el-form>
    </div>

    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stats-cards">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-title">数据源总数</div>
            <div class="stat-number">{{ stats.totalSources }}</div>
            <div class="stat-footer">
              <span class="active-sources">活跃: {{ stats.activeSources }}</span>
            </div>
          </div>
        </el-card>
      </el-col>
     
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-title">总记录数</div>
            <div class="stat-number">{{ formatNumber(stats.totalRecords) }}</div>
            <div class="stat-footer">
              <!-- <span class="today-records">今日新增: {{ formatNumber(stats.todayRecords) }}</span> -->
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-title">系统状态</div>
            <div class="stat-number">
              <el-tag :type="stats.status === 'normal' ? 'success' : 'danger'">
                {{ stats.status === 'normal' ? '正常' : '异常' }}
              </el-tag>
            </div>
            <div class="stat-footer">
              <span>数据同步正常</span>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-title">操作</div>
            <div class="stat-buttons">
              <el-button type="primary" size="small" @click="refreshData">刷新数据</el-button>
              <el-button type="success" size="small" @click="syncAll">全部同步</el-button>
            </div>
            <div class="stat-footer">
              <span>手动触发操作</span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 数据源列表 -->
    <el-card class="source-list-card">
      <div slot="header" class="clearfix">
        <span>数据源列表</span>
        <el-button style="float: right; padding: 3px 0" type="text" @click="refreshData">刷新</el-button>
      </div>
      
      <el-table :data="sources" style="width: 100%" v-loading="loading">
        <el-table-column prop="name" label="数据源名称" width="150"></el-table-column>
        <!-- <el-table-column prop="type" label="类型" width="150">
          <template slot-scope="scope">
            <el-tag size="mini">{{ scope.row.type }}</el-tag>
          </template>
        </el-table-column> -->
        <el-table-column prop="status" label="状态" width="60">
          <template slot-scope="scope">
            <el-tag :type="getStatusType(scope.row.status)" size="mini">
              {{ scope.row.status === 'active' ? '活跃' : '非活跃' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="records" label="记录数" width="120" align="center" class-name="record-count-column">
          <template slot-scope="scope">
            {{ formatNumber(scope.row.records) }}
          </template>
        </el-table-column>
        <el-table-column label="最后同步时间" width="180" class-name="last-sync-column">
          <template slot-scope="scope">
            {{ formatLastSyncTime(scope.row.lastSyncTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="frequency" label="同步频率" width="120">
          <template slot-scope="scope">
            {{ DataAggregationUtil.getFrequency(scope.row.syncFrequency) }}
          </template>
        </el-table-column>
        <el-table-column prop="nextSync" label="下次同步" min-width="160"></el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template slot-scope="scope">
            <el-button size="mini" @click="viewDetail(scope.row)">详情</el-button>
            <el-button size="mini" type="primary" @click="syncSource(scope.row)">同步</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 数据源详情对话框 -->
    <el-dialog title="数据源详情" :visible.sync="detailDialogVisible" width="50%">
      <el-form :model="currentSource" label-width="100px">
        <el-form-item label="数据源名称:">
          <span>{{ currentSource.name }}</span>
        </el-form-item>
        <el-form-item label="状态:">
          <el-tag :type="getStatusType(currentSource.status)">
            {{ currentSource.status === 'active' ? '活跃' : '非活跃' }}
          </el-tag>
        </el-form-item>
        <el-form-item label="数据类型:">
          <span>{{ currentSource.type }}</span>
        </el-form-item>
        <el-form-item label="记录数:">
          <span>{{ formatNumber(currentSource.records) }}</span>
        </el-form-item>
        <el-form-item label="最后同步:">
          <span>{{ formatLastSyncTime(currentSource.lastSync) }}</span>
        </el-form-item>
        <el-form-item label="同步频率:">
          <span>{{ currentSource.frequency }}</span>
          <el-button type="text" @click="editFrequency(currentSource)" style="margin-left: 20px;">编辑</el-button>
        </el-form-item>
        <el-form-item label="下次同步:">
          <span>{{ currentSource.nextSync }}</span>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="detailDialogVisible = false">关 闭</el-button>
      </span>
    </el-dialog>

    <!-- 编辑同步频率对话框 -->
    <el-dialog title="编辑同步频率" :visible.sync="frequencyDialogVisible" width="40%">
      <el-form :model="editingSource" label-width="120px">
        <el-form-item label="数据源名称:">
          <span>{{ editingSource.name }}</span>
        </el-form-item>
        <el-form-item label="同步频率:">
          <el-select v-model="editingSource.syncFrequency" placeholder="请选择同步频率">
            <el-option label="每分钟" value="* * * * * ?"></el-option>
            <el-option label="每小时" value="0 0 * * * ?"></el-option>
            <el-option label="每天" value="0 0 0 * * ?"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="自定义表达式:" v-if="editingSource.syncFrequency === 'custom'">
          <el-input v-model="customCron" placeholder="请输入cron表达式"></el-input>
        </el-form-item>
        <el-form-item label="表达式说明:">
          <div style="font-size: 12px; color: #666;">
            <p>Cron表达式格式: 秒 分 时 日 月 周</p>
            <p>例如: "0 0 * * * ?" 表示每小时执行</p>
          </div>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="frequencyDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="confirmEditFrequency">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 添加数据源对话框 -->
    <el-dialog title="添加数据源" :visible.sync="addDialogVisible" width="40%">
      <el-form :model="newSource" label-width="100px">
        <el-form-item label="数据源名称">
          <el-input v-model="newSource.name" placeholder="请输入数据源名称"></el-input>
        </el-form-item>
        <el-form-item label="表名">
          <el-input v-model="newSource.tableName" placeholder="请输入数据库表名"></el-input>
        </el-form-item>
        <el-form-item label="同步频率">
          <el-select v-model="newSource.syncFrequency" placeholder="请选择同步频率">
            <el-option label="每分钟" value="* * * * * ?"></el-option>
            <el-option label="每小时" value="0 0 * * * ?"></el-option>
            <el-option label="每天" value="0 0 0 * * ?"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="confirmAddSource">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import MD5 from "js-md5"
import DataAggregationUtil from '@/utils/dataAggregationUtil'
import * as dataSourceApi from '@/api/dataSource'

export default {
  name: 'DataAggregation',
  data() {
    return {
      loading: false,
      stats: {
        totalSources: 0,
        activeSources: 0,
        totalRecords: 0,
        todayRecords: 0,
        status: 'normal'
      },
      sources: [],
      detailDialogVisible: false,
      addDialogVisible: false,
      frequencyDialogVisible: false,
      currentSource: {},
      editingSource: {},
      newSource: {
        name: '',
        tableName: '',
        syncFrequency: '0 0 * * * ?'  // 默认每小时
      },
      customCron: '',
      // 将 DataAggregationUtil 添加到 data 中以避免 Vue 警告
      DataAggregationUtil: DataAggregationUtil
    }
  },
  mounted() {
    this.loadData();
  },
  methods: {
    async loadData() {
      this.loading = true;
      try {
        const data = await DataAggregationUtil.getAggregationStats();
        this.stats = {
          totalSources: data.totalSources,
          activeSources: data.activeSources,
          totalRecords: data.totalRecords,
          todayRecords: data.todayRecords,
          status: data.status
        };
        this.sources = data.sources.map(source => ({
        ...source,
        type: this.getSourceType(source.name),
        frequency: DataAggregationUtil.getFrequency(source.syncFrequency),
        nextSync: this.calculateNextSync(DataAggregationUtil.getFrequency(source.syncFrequency))
      }));
      } catch (error) {
        console.error('加载数据失败:', error);
        this.$message.error('数据加载失败: ' + error.message);
      } finally {
        this.loading = false;
      }
    },
    
    refreshData() {
      this.loadData();
      this.$message.success('数据已刷新');
    },
    
    async syncAll() {
      try {
        const response = await dataSourceApi.syncAllDataSources();
        this.$message.success('所有数据源同步任务已启动');
        // 刷新数据
        await this.loadData();
      } catch (error) {
        console.error('同步所有数据源失败:', error);
        this.$message.error('同步失败: ' + error.message);
      }
    },
    
    viewDetail(row) {
      DataAggregationUtil.getSourceDetail(row.id).then(detail => {
        this.currentSource = detail;
        this.detailDialogVisible = true;
      });
    },
    

    
    async syncSource(row) {
      try {
        await dataSourceApi.syncDataSource(row.id);
        this.$message.success(`${row.name} 同步任务已启动`);
        // 刷新数据
        await this.loadData();
      } catch (error) {
        console.error(`同步数据源 ${row.name} 失败:`, error);
        this.$message.error(`${row.name} 同步失败: ${error.message}`);
      }
    },
    
    // 编辑同步频率
    editFrequency(row) {
      this.detailDialogVisible = false;
      this.editingSource = { ...row };
      // 设置默认的同步频率选项
      const syncFrequency = row.syncFrequency || '0 0 * * * ?';
      // 匹配预设的选项值
      const presetValues = ['* * * * * ?', '0 0 * * * ?', '0 0 0 * * ?'];
      this.editingSource.syncFrequency = presetValues.includes(syncFrequency) ? syncFrequency : syncFrequency; // 保持原值而不是强制设置为默认值
      this.frequencyDialogVisible = true;
    },
    
    // 确认编辑同步频率
    async confirmEditFrequency() {
      try {
        // 调用API更新同步频率
        await dataSourceApi.updateDataSourceFrequency(this.editingSource.id, this.editingSource.syncFrequency);
        
        this.frequencyDialogVisible = false;
        this.$message.success('同步频率更新成功');
        // 刷新数据
        await this.loadData();
      } catch (error) {
        console.error('更新同步频率失败:', error);
        this.$message.error('更新失败: ' + error.message);
      }
    },
    
    handleAddSource() {
      this.addDialogVisible = true;
      this.newSource = {
        name: '',
        tableName: '',
        syncFrequency: '0 0 * * * ?'  // 默认每小时
      };
    },
    
    async confirmAddSource() {
      if (!this.newSource.name) {
        this.$message.warning('请填写数据源名称');
        return;
      }
      
      if (!this.newSource.tableName) {
        this.$message.warning('请填写表名');
        return;
      }
      
      try {
        await dataSourceApi.createDataSource({
          name: this.newSource.name,
          tableName: this.newSource.tableName,
          status: 1,
          syncFrequency: this.newSource.syncFrequency
        });
        
        this.addDialogVisible = false;
        this.$message.success('数据源添加成功');
        // 刷新数据
        await this.loadData();
      } catch (error) {
        console.error('添加数据源失败:', error);
        this.$message.error('添加失败: ' + error.message);
      }
    },
    
    updateStats() {
      this.stats.totalSources = this.sources.length;
      this.stats.activeSources = this.sources.filter(source => source.status === 'active').length;
    },
    
    formatNumber(num) {
      return DataAggregationUtil.formatNumber(num);
    },
    
    formatLastSyncTime(dateTimeStr) {
      if (!dateTimeStr || dateTimeStr === '-') {
        return '-';
      }
      
      try {
        // 将字符串转换为Date对象
        const date = new Date(dateTimeStr);
        
        // 检查日期是否有效
        if (isNaN(date.getTime())) {
          return '-';
        }
        
        // 格式化为本地时间字符串
        return date.toLocaleString('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        }).replace(/\//g, '-');
      } catch (error) {
        console.error('格式化时间出错:', error);
        return '-';
      }
    },
    
    getStatusType(status) {
      return DataAggregationUtil.getStatusType(status);
    },
    
    getSourceType(name) {
      const typeMap = {
        '民宿经营数据': '民宿经营',
        '旅游经营数据': '旅游经营',
        '研学基地数据': '研学基地',
        '养老经营数据': '养老经营',
        '农产品销售数据': '农产品销售',
        '餐饮销售数据': '餐饮销售',
        '乡村宣传数据': '乡村宣传',
        '用户行为数据': '用户行为分析'
      };
      return typeMap[name] || '其他数据';
    },
    
    calculateNextSync(frequency) {
      if (!frequency) return '-';
      
      const now = new Date();
      switch (frequency) {
        case '每分钟':
          return '持续同步';
        case '每小时':
          now.setHours(now.getHours() + 1);
          now.setMinutes(0);
          now.setSeconds(0);
          break;
        case '每天':
          now.setDate(now.getDate() + 1);
          now.setHours(0);
          now.setMinutes(0);
          now.setSeconds(0);
          break;
        default:
          return '-';
      }
      return now.toLocaleString('zh-CN', { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit', 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit'
      }).replace(/\//g, '-');
    }
  }
}
</script>

<style scoped>
.stats-cards {
  margin-bottom: 20px;
}

.stat-card {
  height: 120px;
}

.stat-content {
  text-align: center;
}

.stat-title {
  font-size: 14px;
  color: #606266;
  margin-bottom: 10px;
}

.stat-number {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 10px;
}

.stat-footer {
  font-size: 12px;
  color: #909399;
}

.stat-buttons {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-bottom: 10px;
}

.source-list-card {
  margin-top: 20px;
}

.active-sources {
  color: #67c23a;
}

.today-records {
  color: #409eff;
}

/* 增加记录数列和最后同步时间列之间的间距 */
.record-count-column {
  padding-right: 15px !important;
}

.last-sync-column {
  padding-left: 15px !important;
}

/* 减小表格行高 */
::v-deep .el-table td {
  padding: 4px 0 !important;
}

::v-deep .el-table th {
  padding: 6px 0 !important;
}

::v-deep .el-card__body {
  padding: 20px;
}
</style>
