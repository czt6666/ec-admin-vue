<template>
  <div class="app-container">
    <!-- 工具栏 -->
    <div class="filter-container">
      <el-button type="primary" icon="el-icon-plus" @click="showAddDialog">
        新增村庄
      </el-button>
      <el-button type="success" icon="el-icon-refresh" @click="getData">
        刷新
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
  </div>
</template>

<script>
import { fetchVillagePage, addVillage, updateVillage, getVillageById, deleteVillage } from '@/api/village'

export default {
  name: 'VillageList',
  data() {
    return {
      loading: false,
      submitLoading: false,
      tableData: [],
      total: 0,
      query: {
        page: 1,
        pageSize: 10
      },
      dialogVisible: false,
      dialogTitle: '新增村庄',
      isEdit: false,
      editId: null,
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
        constructionArea: null
      },
      rules: {
        villageName: [
          { required: true, message: '请输入村庄名称', trigger: 'blur' }
        ],
        address: [
          { required: true, message: '请输入详细地址', trigger: 'blur' }
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
        const payload = await fetchVillagePage(this.query)
        const records = payload && payload.records ? payload.records : []
        const total = payload && payload.total ? payload.total : 0

        // 按ID排序（升序）
        records.sort((a, b) => a.id - b.id)

        this.tableData = records
        this.total = total
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
    remove(row) {
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
          this.$message.error('删除失败')
        }
      }).catch(() => {
        this.$message.info('已取消删除')
      })
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
        constructionArea: null
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
</style>
