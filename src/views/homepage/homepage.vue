<template>
  <div class="app-container dashboard">
    <!-- 背景图片容器 -->
    <div class="dashboard-background"></div>
    
    <!-- 内容容器 -->
    <div class="dashboard-content">
      <div class="dashboard-header">
        <h1>数据聚合系统仪表板</h1>
        <p>实时监控和管理系统中的所有数据源</p>
      </div>

      <!-- 关键指标概览 -->
      <el-row :gutter="20" class="stats-cards">
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon bg-primary">
                <i class="el-icon-files"></i>
              </div>
              <div class="stat-info">
                <div class="stat-title">数据源总数</div>
                <div class="stat-number">{{ stats.totalSources }}</div>
              </div>
            </div>
          </el-card>
        </el-col>
       
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon bg-success">
                <i class="el-icon-check"></i>
              </div>
              <div class="stat-info">
                <div class="stat-title">活跃数据源</div>
                <div class="stat-number">{{ stats.activeSources }}</div>
              </div>
            </div>
          </el-card>
        </el-col>
        
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon bg-warning">
                <i class="el-icon-tickets"></i>
              </div>
              <div class="stat-info">
                <div class="stat-title">总记录数</div>
                <div class="stat-number">{{ formatNumber(stats.totalRecords) }}</div>
              </div>
            </div>
          </el-card>
        </el-col>
        
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon bg-info">
                <i class="el-icon-monitor"></i>
              </div>
              <div class="stat-info">
                <div class="stat-title">系统状态</div>
                <div class="stat-number">
                  <el-tag :type="stats.status === 'normal' ? 'success' : 'danger'">
                    {{ stats.status === 'normal' ? '正常' : '异常' }}
                  </el-tag>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 数据源记录数柱状图 -->
      <el-row :gutter="20" class="main-content">
        <el-col :span="24">
          <el-card class="chart-card">
            <div slot="header" class="clearfix">
              <span>数据源记录数统计</span>
            </div>
            <div id="records-chart" class="chart-container"></div>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import MD5 from "js-md5"
import * as echarts from 'echarts'
import DataAggregationUtil from '@/utils/dataAggregationUtil'

export default {
  name: 'HomePage',
  data() {
    return {
      stats: {
        totalSources: 0,
        activeSources: 0,
        totalRecords: 0,
        todayRecords: 0,
        status: 'normal'
      },
      sources: [],
      charts: {
        recordsChart: null
      }
    }
  },
  mounted() {
    this.loadData()
    // 等待DOM渲染完成后初始化图表
    this.$nextTick(() => {
      this.initCharts()
    })
  },
  beforeDestroy() {
    // 销毁图表实例
    if (this.charts.recordsChart) {
      this.charts.recordsChart.dispose()
    }
  },
  methods: {
    async loadData() {
      try {
        const data = await DataAggregationUtil.getAggregationStats()
        this.stats = {
          totalSources: data.totalSources,
          activeSources: data.activeSources,
          totalRecords: data.totalRecords,
          todayRecords: data.todayRecords,
          status: data.status
        }
        this.sources = data.sources
        
        // 数据加载完成后更新图表
        this.$nextTick(() => {
          this.updateCharts()
        })
      } catch (error) {
        console.error('加载数据失败:', error)
        this.$message.error('数据加载失败: ' + error.message)
      }
    },
    
    // 初始化图表
    initCharts() {
      // 数据源记录数柱状图
      const recordsChartDom = document.getElementById('records-chart')
      if (recordsChartDom) {
        this.charts.recordsChart = echarts.init(recordsChartDom, null, {
          renderer: 'canvas'
        })
      }
      
      // 设置初始图表配置
      this.updateCharts()
    },
    
    // 更新图表数据
    updateCharts() {
      // 数据源记录数柱状图
      if (this.charts.recordsChart) {
        // 提取数据源名称和记录数
        const sourceNames = this.sources.map(source => source.name)
        const recordCounts = this.sources.map(source => source.records)
        
        const recordsOption = {
          backgroundColor: 'transparent', // 设置图表背景透明
          title: {
            text: '各数据源记录数统计',
            left: 'center',
            textStyle: {
              color: '#333' // 设置标题文字颜色
            }
          },
          tooltip: {
            trigger: 'axis',
            axisPointer: {
              type: 'shadow'
            },
            backgroundColor: 'rgba(255,255,255,0.9)', // 提示框背景色
            textStyle: {
              color: '#333' // 提示框文字颜色
            }
          },
          grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true,
            backgroundColor: 'transparent' // 设置网格区域背景透明
          },
          xAxis: {
            type: 'category',
            data: sourceNames,
            axisTick: {
              alignWithLabel: true
            },
            axisLine: {
              lineStyle: {
                color: '#666' // X轴线颜色
              }
            },
            axisLabel: {
              color: '#333' // X轴标签颜色
            }
          },
          yAxis: {
            type: 'value',
            axisLine: {
              lineStyle: {
                color: '#666' // Y轴线颜色
              }
            },
            axisLabel: {
              color: '#333' // Y轴标签颜色
            },
            splitLine: {
              lineStyle: {
                color: '#ccc', // 分割线颜色
                opacity: 0.5 // 分割线透明度
              }
            }
          },
          series: [{
            name: '记录数',
            type: 'bar',
            barWidth: '60%',
            data: recordCounts,
            itemStyle: {
              color: new echarts.graphic.LinearGradient(
                0, 0, 0, 1,
                [
                  { offset: 0, color: '#83bff6' },
                  { offset: 0.5, color: '#188df0' },
                  { offset: 1, color: '#188df0' }
                ]
              )
            },
            emphasis: {
              itemStyle: {
                color: new echarts.graphic.LinearGradient(
                  0, 0, 0, 1,
                  [
                    { offset: 0, color: '#2378f7' },
                    { offset: 0.7, color: '#2378f7' },
                    { offset: 1, color: '#83bff6' }
                  ]
                )
              }
            }
          }]
        }
        
        this.charts.recordsChart.setOption(recordsOption, true)
      }
    },
    
    formatNumber(num) {
      return DataAggregationUtil.formatNumber(num)
    }
  }
}
</script>

<style scoped>
.dashboard {
  padding: 20px;
  position: relative;
  min-height: 100%;
}

.dashboard {
  position: relative;
  min-height: 100%;
}

.dashboard-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: url('~@/assets/web/loginadmin.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  opacity: 0.4; /* 背景透明度 */
  z-index: 0; /* 放置在内容后面 */
}

.dashboard-content {
  position: relative;
  z-index: 1; /* 确保内容在背景之上 */
}

.dashboard-content {
  position: relative;
}

.dashboard-header {
  margin-bottom: 30px;
}

.dashboard-header h1 {
  font-size: 28px;
  color: #303133;
  margin-bottom: 10px;
}

.dashboard-header p {
  font-size: 16px;
  color: #606266;
}

.stats-cards {
  margin-bottom: 30px;
}

.stat-card {
  height: 120px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  background-color: rgba(255, 255, 255, 0.7); /* 半透明白色背景 */
}

.stat-content {
  display: flex;
  align-items: center;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.7); /* 半透明白色背景，提高透明度以增强可读性 */
  border-radius: 8px;
  padding: 10px;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20px;
  font-size: 24px;
  color: white;
}

.bg-primary {
  background-color: #409EFF;
}

.bg-success {
  background-color: #67C23A;
}

.bg-warning {
  background-color: #E6A23C;
}

.bg-info {
  background-color: #909399;
}

.stat-info {
  flex: 1;
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
}

.main-content {
  margin-bottom: 30px;
}

.chart-card {
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  background-color: rgba(255, 255, 255, 0.7); /* 半透明白色背景 */
}

.chart-container {
  width: 100%;
  height: 400px;
}
</style>