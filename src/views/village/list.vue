<template>
  <div class="app-container">
    <!-- 工具栏 -->
    <div class="filter-container">
      <el-button type="primary" icon="el-icon-plus" @click="showAddDialog">
        新增村庄
      </el-button>
      <el-button type="success" icon="el-icon-upload2" @click="showImportDialog">
        导入村庄
      </el-button>
      <el-button
        type="warning"
        icon="el-icon-download"
        @click="exportVillages"
        :loading="exportLoading"
      >
        {{ exportLoading ? '导出中...' : '导出村庄' }}
      </el-button>
    </div>

    <!-- 数据表格 -->
    <el-table
      v-loading="loading"
      :data="tableData"
      border
      style="width: 100%"
    >
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="villageName" label="村庄名称" min-width="120" />
      <el-table-column prop="address" label="详细地址" min-width="150" />
      <el-table-column prop="secretaryName" label="村书记" width="100" />
      <el-table-column prop="secretaryPhone" label="联系方式" width="120" />
      <el-table-column prop="totalArea" label="总面积(亩)" width="100" />
      <el-table-column prop="householdCount" label="户数" width="80" />
      <el-table-column prop="managerCount" label="管理人数" width="100" />
      <el-table-column prop="createTime" label="创建时间" width="160" />
      <el-table-column label="操作" width="150" fixed="right">
        <template slot-scope="scope">
          <el-button size="mini" type="primary" @click="edit(scope.row)">
            编辑
          </el-button>
          <el-button size="mini" type="danger" @click="remove(scope.row)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination-container">
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="query.page"
        :page-sizes="[10, 20, 50, 100]"
        :page-size="query.pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      />
    </div>

    <!-- 新增/编辑对话框 -->
    <el-dialog
      :title="dialogTitle"
      :visible.sync="dialogVisible"
      width="600px"
      @close="resetForm"
    >
      <el-form
        ref="villageForm"
        :model="villageForm"
        :rules="rules"
        label-width="120px"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="村庄名称" prop="villageName">
              <el-input v-model="villageForm.villageName" placeholder="请输入村庄名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="详细地址" prop="address">
              <el-input v-model="villageForm.address" placeholder="请输入详细地址" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="村庄描述" prop="villageDescription">
          <el-input
            v-model="villageForm.villageDescription"
            type="textarea"
            :rows="3"
            placeholder="请输入村庄描述"
          />
        </el-form-item>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="村书记姓名" prop="secretaryName">
              <el-input v-model="villageForm.secretaryName" placeholder="请输入村书记姓名" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系方式" prop="secretaryPhone">
              <el-input v-model="villageForm.secretaryPhone" placeholder="请输入联系方式" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="户数" prop="householdCount">
              <el-input-number
                v-model="villageForm.householdCount"
                :min="0"
                placeholder="请输入户数"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="管理人数" prop="managerCount">
              <el-input-number
                v-model="villageForm.managerCount"
                :min="0"
                placeholder="请输入管理人数"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="总面积(亩)" prop="totalArea">
              <el-input-number
                v-model="villageForm.totalArea"
                :min="0"
                :precision="2"
                placeholder="请输入总面积"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="耕地面积(亩)" prop="farmlandArea">
              <el-input-number
                v-model="villageForm.farmlandArea"
                :min="0"
                :precision="2"
                placeholder="请输入耕地面积"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="林地面积(亩)" prop="forestArea">
              <el-input-number
                v-model="villageForm.forestArea"
                :min="0"
                :precision="2"
                placeholder="请输入林地面积"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="水域面积(亩)" prop="waterArea">
              <el-input-number
                v-model="villageForm.waterArea"
                :min="0"
                :precision="2"
                placeholder="请输入水域面积"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="建设用地面积(亩)" prop="constructionArea">
          <el-input-number
            v-model="villageForm.constructionArea"
            :min="0"
            :precision="2"
            placeholder="请输入建设用地面积"
            style="width: 100%"
          />
        </el-form-item>
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm" :loading="submitLoading">
          确定
        </el-button>
      </div>
    </el-dialog>

    <!-- 导入对话框 -->
    <el-dialog
      title="导入村庄信息"
      :visible.sync="importDialogVisible"
      width="500px"
      @close="resetImportForm"
    >
      <div class="import-content">
        <el-alert
          title="导入说明"
          type="info"
          :closable="false"
          style="margin-bottom: 20px;"
        >
          <div>
            <p>1. 请按照Excel格式填写数据</p>
            <p>2. 必填字段：村庄名称、详细地址</p>
            <p>3. 联系方式必须是11位数字，以1开头</p>
            <p>4. 支持批量导入，建议单次导入不超过1000条</p>
            <p>5. 文件格式：Excel (.xlsx)</p>
          </div>
        </el-alert>

        <el-form ref="importForm" :model="importForm" label-width="100px">
          <el-form-item label="选择文件" prop="file">
            <el-upload
              ref="upload"
              :auto-upload="false"
              :on-change="handleFileChange"
              :before-upload="beforeUpload"
              :file-list="fileList"
              accept=".xlsx,.xls"
              :limit="1"
              action=""
            >
              <el-button size="small" type="primary">选择文件</el-button>
              <div slot="tip" class="el-upload__tip">
                只能上传xlsx/xls文件，且不超过10MB
              </div>
            </el-upload>
          </el-form-item>
        </el-form>
      </div>

      <div slot="footer" class="dialog-footer">
        <el-button @click="importDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleImport" :loading="importLoading">
          开始导入
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { fetchVillagePage, addVillage, updateVillage, getVillageById, deleteVillage, forceDeleteVillage, checkDeleteConstraints, importVillages, exportVillages } from '@/api/village'

export default {
  name: 'VillageList',
  data() {
    return {
      loading: false,
      submitLoading: false,
      importLoading: false,
      exportLoading: false,
      tableData: [],
      total: 0,
      query: {
        page: 1,
        pageSize: 10
      },
      dialogVisible: false,
      importDialogVisible: false,
      dialogTitle: '新增村庄',
      isEdit: false,
      editId: null,
      fileList: [],
      importForm: {
        file: null
      },
      villageForm: {
        villageName: '',
        address: '',
        villageDescription: '',
        secretaryName: '',
        secretaryPhone: '',
        householdCount: null,
        managerCount: 150,
        totalArea: null,
        farmlandArea: null,
        forestArea: null,
        waterArea: null,
        constructionArea: null,
        latitude: null,
        longitude: null
      },
      rules: {
        villageName: [
          { required: true, message: '请输入村庄名称', trigger: 'blur' }
        ],
        address: [
          { required: true, message: '请输入详细地址', trigger: 'blur' }
        ],
        secretaryPhone: [
          { required: false, message: '请输入联系方式', trigger: 'blur' },
          { pattern: /^1[3-9]\d{9}$/, message: '请输入以1开头的11位手机号码', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.getData()
  },
  methods: {
    // 获取数据
    async getData() {
      this.loading = true
      try {
        const response = await fetchVillagePage(this.query)
        this.tableData = response.records || []
        this.total = response.total || 0
      } catch (e) {
        this.$message.error('加载失败')
      } finally {
        this.loading = false
      }
    },

    // 显示新增对话框
    showAddDialog() {
      this.dialogTitle = '新增村庄'
      this.isEdit = false
      this.editId = null
      this.dialogVisible = true
      this.resetForm()
    },

    // 显示导入对话框
    showImportDialog() {
      this.importDialogVisible = true
      this.resetImportForm()
    },

    // 导出村庄
    exportVillages() {
      this.$confirm('确定要导出村庄信息吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'info'
      }).then(() => {
        this.handleExport()
      }).catch(() => {
        this.$message.info('已取消导出')
      })
    },

    // 处理导出
    async handleExport() {
      this.exportLoading = true

      try {
        console.log('开始导出...')
        console.log('请求URL：', 'http://localhost:8020/admin/ecadmin/village/export')

        const response = await exportVillages()
        console.log('导出响应：', response)
        console.log('响应类型：', typeof response)
        console.log('响应长度：', response ? response.length : 'undefined')

        // 检查响应是否为空
        if (!response) {
          throw new Error('导出文件为空')
        }

        // 创建blob对象
        const blob = new Blob([response], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        })

        console.log('Blob大小：', blob.size)

        if (blob.size === 0) {
          throw new Error('导出文件大小为0')
        }

        // 创建下载链接
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url

        // 生成文件名（带时间戳）
        const now = new Date()
        const dateStr = now.getFullYear() + '-' +
          String(now.getMonth() + 1).padStart(2, '0') + '-' +
          String(now.getDate()).padStart(2, '0') + '_' +
          String(now.getHours()).padStart(2, '0') + '-' +
          String(now.getMinutes()).padStart(2, '0') + '-' +
          String(now.getSeconds()).padStart(2, '0')

        link.download = `村庄信息_${dateStr}.xlsx`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        // 清理URL对象
        window.URL.revokeObjectURL(url)

        this.$message.success('导出成功')
      } catch (error) {
        console.error('导出失败：', error)
        console.error('错误详情：', error.stack)
        this.$message.error('导出失败：' + (error.message || '未知错误'))
      } finally {
        this.exportLoading = false
      }
    },

    // 文件选择变化
    handleFileChange(file, fileList) {
      this.fileList = fileList
      this.importForm.file = file.raw
    },

    // 上传前验证
    beforeUpload(file) {
      const isExcel = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        file.type === 'application/vnd.ms-excel'
      const isLt10M = file.size / 1024 / 1024 < 10

      if (!isExcel) {
        this.$message.error('只能上传Excel文件!')
        return false
      }
      if (!isLt10M) {
        this.$message.error('文件大小不能超过10MB!')
        return false
      }
      return false // 阻止自动上传
    },

    // 处理导入
    handleImport() {
      if (!this.importForm.file) {
        this.$message.warning('请选择要导入的文件')
        return
      }

      this.importLoading = true
      const formData = new FormData()
      formData.append('file', this.importForm.file)

      importVillages(formData).then(response => {
        console.log('导入响应：', response)

        // 处理不同的响应格式
        let successCount = 0
        let errorCount = 0

        if (response && response.data) {
          successCount = response.data.successCount || 0
          errorCount = response.data.errorCount || 0
        } else if (response && response.successCount !== undefined) {
          successCount = response.successCount || 0
          errorCount = response.errorCount || 0
        } else if (Array.isArray(response)) {
          successCount = response.length
          errorCount = 0
        }

        this.$message.success(`导入成功！共导入 ${successCount} 条数据`)
        if (errorCount > 0) {
          this.$message.warning(`有 ${errorCount} 条数据导入失败，请检查数据格式`)
        }
        this.importDialogVisible = false
        this.getData()
      }).catch(error => {
        console.error('导入失败：', error)
        this.$message.error('导入失败：' + (error.message || '未知错误'))
      }).finally(() => {
        this.importLoading = false
      })
    },

    // 重置导入表单
    resetImportForm() {
      this.importForm.file = null
      this.fileList = []
      this.$refs.upload && this.$refs.upload.clearFiles()
    },

    // 编辑
    async edit(row) {
      this.dialogTitle = '编辑村庄'
      this.isEdit = true
      this.editId = row.id
      this.dialogVisible = true

      try {
        const village = await getVillageById(row.id)
        this.villageForm = { ...village }
      } catch (e) {
        this.$message.error('获取村庄详情失败')
        this.dialogVisible = false
      }
    },

    // 删除单个村庄
    async remove(row) {
      try {
        const constraintResponse = await checkDeleteConstraints(row.id)
        console.log('约束检查响应：', constraintResponse)

        let canDelete = false
        let message = '未知错误'

        if (constraintResponse && constraintResponse.data) {
          canDelete = constraintResponse.data.canDelete || false
          message = constraintResponse.data.message || '未知错误'
        } else if (constraintResponse && constraintResponse.canDelete !== undefined) {
          canDelete = constraintResponse.canDelete || false
          message = constraintResponse.message || '未知错误'
        } else {
          console.warn('约束检查响应格式异常，直接尝试删除')
          canDelete = true
          message = '直接删除'
        }

        if (!canDelete) {
          this.$confirm(
            `${message}，是否强制删除？删除后相关数据也会被删除！`,
            '删除确认',
            {
              confirmButtonText: '强制删除',
              cancelButtonText: '取消',
              type: 'warning',
              distinguishCancelAndClose: true
            }
          ).then(async () => {
            try {
              await forceDeleteVillage(row.id)
              this.$message.success('删除成功')
              this.getData()
            } catch (e) {
              this.$message.error('删除失败：' + (e.message || '未知错误'))
            }
          }).catch(() => {
            this.$message.info('已取消删除')
          })
        } else {
          this.$confirm(`确定要删除村庄"${row.villageName}"吗？`, '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(async () => {
            try {
              await deleteVillage(row.id)
              this.$message.success('删除成功')
              this.getData()
            } catch (e) {
              this.$message.error('删除失败：' + (e.message || '未知错误'))
            }
          }).catch(() => {
            this.$message.info('已取消删除')
          })
        }
      } catch (e) {
        console.error('检查删除约束失败：', e)
        this.$confirm(`确定要删除村庄"${row.villageName}"吗？`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(async () => {
          try {
            await deleteVillage(row.id)
            this.$message.success('删除成功')
            this.getData()
          } catch (deleteError) {
            this.$message.error('删除失败：' + (deleteError.message || '未知错误'))
          }
        }).catch(() => {
          this.$message.info('已取消删除')
        })
      }
    },

    // 提交表单
    async submitForm() {
      this.$refs.villageForm.validate(async (valid) => {
        if (valid) {
          this.submitLoading = true
          try {
            if (this.isEdit) {
              await updateVillage(this.villageForm)
              this.$message.success('修改成功')
            } else {
              await addVillage(this.villageForm)
              this.$message.success('添加成功')
            }
            this.dialogVisible = false
            this.getData()
          } catch (e) {
            this.$message.error('操作失败')
          } finally {
            this.submitLoading = false
          }
        }
      })
    },

    // 重置表单
    resetForm() {
      this.villageForm = {
        villageName: '',
        address: '',
        villageDescription: '',
        secretaryName: '',
        secretaryPhone: '',
        householdCount: null,
        managerCount: 150,
        totalArea: null,
        farmlandArea: null,
        forestArea: null,
        waterArea: null,
        constructionArea: null,
        latitude: null,
        longitude: null
      }
      this.isEdit = false
      this.editId = null
      if (this.$refs.villageForm) {
        this.$refs.villageForm.resetFields()
      }
    },

    // 分页大小改变
    handleSizeChange(val) {
      this.query.pageSize = val
      this.query.page = 1
      this.getData()
    },

    // 当前页改变
    handleCurrentChange(val) {
      this.query.page = val
      this.getData()
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

.dialog-footer {
  text-align: right;
}

.import-content {
  padding: 10px 0;
}
</style>
