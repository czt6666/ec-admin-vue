import * as dataSourceApi from '@/api/dataSource'

/**
 * 数据汇聚工具类
 */
class DataAggregationUtil {
  /**
   * 获取数据汇聚统计信息
   * @returns {Promise}
   */
  static async getAggregationStats() {
    try {
      // 获取数据源统计信息
      const statsResult = await dataSourceApi.getDataSourceStats();
      const statsData = statsResult.data || {};
      
      // 获取数据源列表
      const sourcesResult = await dataSourceApi.getDataSources();
      const sourcesData = Array.isArray(sourcesResult.data) ? sourcesResult.data : [];
      
      return {
        totalSources: statsData.totalSources || 0,
        activeSources: statsData.activeSources || 0,
        totalRecords: statsData.totalRecords || 0,
        todayRecords: statsData.todayRecords || 0,
        status: statsData.systemStatus || 'normal',
        sources: sourcesData.map(source => ({
          id: source.id,
          name: source.name,
          status: source.status === 1 ? 'active' : 'inactive',
          records: source.recordCount || 0,
          lastSyncTime: source.lastSyncTime || '-',
          syncFrequency: source.syncFrequency || '0 0 * * * ?' // 添加syncFrequency字段
        }))
      };
    } catch (error) {
      console.error('获取数据汇聚统计信息失败:', error);
      throw error;
    }
  }

  /**
   * 获取数据源详情
   * @param {Number} sourceId 数据源ID
   * @returns {Promise}
   */
  static async getSourceDetail(sourceId) {
    try {
      const result = await dataSourceApi.getDataSourceById(sourceId);
      const sourceData = result.data || {};
      
      return {
        id: sourceData.id,
        name: sourceData.name,
        status: sourceData.status === 1 ? 'active' : 'inactive',
        records: sourceData.recordCount || 0,
        lastSync: sourceData.lastSyncTime || '-',
        type: this.getSourceType(sourceData.name),
        syncFrequency: sourceData.syncFrequency || '0 0 * * * ?',
        frequency: this.getFrequency(sourceData.syncFrequency || '0 0 * * * ?'),
        nextSync: this.calculateNextSync(sourceData.syncFrequency || '0 0 * * * ?')
      };
    } catch (error) {
      console.error('获取数据源详情失败:', error);
      throw error;
    }
  }

  /**
   * 格式化数字显示
   * @param {Number} num 数字
   * @returns {String}
   */
  static formatNumber(num) {
    // 处理空值情况
    if (num === undefined || num === null) {
      return '0';
    }
    
    if (num >= 1000000) {
      return (num / 1000000).toFixed(2) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  }

  /**
   * 获取状态标签类型
   * @param {String} status 状态
   * @returns {String}
   */
  static getStatusType(status) {
    const statusMap = {
      'active': 'success',
      'inactive': 'danger',
      'warning': 'warning'
    };
    return statusMap[status] || 'info';
  }
  
  /**
   * 获取数据源类型
   * @param {String} name 数据源名称
   * @returns {String}
   */
  static getSourceType(name) {
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
  }
  
  /**
   * 根据cron表达式获取同步频率描述
   * @param {String} cronExpression cron表达式
   * @returns {String}
   */
  static getFrequency(cronExpression) {
    if (!cronExpression) return '每小时';
    
    // 解析cron表达式
    const parts = cronExpression.split(' ');
    if (parts.length < 6) return '每小时';
    
    const minute = parts[1];
    const hour = parts[2];
    
    // 每分钟执行: 0 * * * * ?
    if (minute === '*') return '每分钟';
    
    // 每小时执行: 0 0 * * * ?
    if (minute === '0' && hour === '*') return '每小时';
    
    // 每天执行: 0 0 0 * * ?
    if (minute === '0' && hour === '0') return '每天';
    
    // 默认返回每小时
    return '每小时';
  }
  
  /**
   * 根据cron表达式计算下次同步时间
   * @param {String} cronExpression cron表达式
   * @returns {String}
   */
  static calculateNextSync(cronExpression) {
    const now = new Date();
    
    // 如果是持续同步
    if (cronExpression.includes('* * * *')) {
      return '持续同步';
    }
    
    // 解析cron表达式
    const parts = cronExpression.split(' ');
    if (parts.length < 6) {
      now.setHours(now.getHours() + 1);
      return now.toLocaleString('zh-CN', { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit', 
        hour: '2-digit', 
        minute: '2-digit' 
      }).replace(/\//g, '-');
    }
    
    const minute = parts[1];
    const hour = parts[2];
    
    // 每小时同步
    if (minute === '0' && hour === '*') {
      now.setHours(now.getHours() + 1);
    }
    // 每天同步
    else if (minute === '0' && hour !== '*' && hour !== '?') {
      now.setDate(now.getDate() + 1);
      now.setHours(parseInt(hour));
      now.setMinutes(0);
    }
    // 其他情况，默认1小时后
    else {
      now.setHours(now.getHours() + 1);
    }
    
    return now.toLocaleString('zh-CN', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit', 
      hour: '2-digit', 
      minute: '2-digit' 
    }).replace(/\//g, '-');
  }
}

export default DataAggregationUtil;