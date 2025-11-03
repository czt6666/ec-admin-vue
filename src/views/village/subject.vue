<template>
  <div class="app-container">
    <div class="filter-container">
      <el-form :inline="true" :model="listQuery" class="demo-form-inline">
        <el-form-item>
          <el-button type="primary" icon="plus" @click="showCreate">添加
          </el-button>
        </el-form-item>
        <el-form-item>
          <span class="title-text">新闻信息管理</span>
        </el-form-item>
        <el-form-item>
          <el-input v-model="listQuery.keyword" placeholder="请输入新闻标题或关键词" style="width: 200px;"></el-input>
        </el-form-item>
        <!-- 发布状态筛选移到右侧，不在查询表单内 -->
        <!-- 原位置已移除 -->
        <el-form-item>
          <el-button type="primary" @click="handleFilter">查询</el-button>
        </el-form-item>
      </el-form>
      <div class="status-filter">
        <el-select v-model="listQuery.publishStatus" placeholder="发布状态" clearable style="width: 160px;" @change="onPublishStatusChange">
          <el-option label="草稿" :value="1" />
          <el-option label="已发布" :value="2" />
          <el-option label="已下线" :value="3" />
        </el-select>
        <el-select v-model="listQuery.themeFilterList" multiple clearable filterable placeholder="筛选主题" style="width: 240px; margin-left: 10px;" @change="onThemeFilterChange">
          <el-option v-for="t in themes" :key="String(t.id)" :label="t.name" :value="t.name" />
        </el-select>
      </div>
    </div>

    <el-table v-loading="listLoading" :data="list" border fit highlight-current-row>
      <el-table-column align="center" label="序号" width="80">
        <template slot-scope="scope">
          <span>{{ getIndex(scope.$index) }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="title" label="新闻标题" align="center" width="300"></el-table-column>
      <el-table-column prop="author" label="作者" align="center"></el-table-column>
      <el-table-column prop="villagename" label="乡村名称" align="center" :formatter="formatVillageName"></el-table-column>
      <el-table-column prop="themename" label="主题" align="center">
      </el-table-column>
      <!-- 新增：发布状态列 -->
      <el-table-column label="发布状态" align="center" width="120">
        <template slot-scope="scope">
          <span>{{ publishStatusText(scope.row) }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="imageUrl" label="图片" align="center" width="120">
        <template slot-scope="scope">
          <img v-if="scope.row.imageUrl" :src="scope.row.imageUrl" alt="图片" style="width:60px;height:60px;object-fit:cover;border-radius:4px;" />
          <span v-else>—</span>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="发布时间" align="center"></el-table-column>
      <el-table-column label="操作" width="150" align="center">
        <template slot-scope="scope">
          <el-button type="primary" size="mini" @click="showUpdate(scope.$index)">编辑</el-button>
          <el-button type="danger" size="mini" @click="removeNews(scope.$index)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-container">
      <el-pagination
        background
        layout="prev, pager, next, jumper"
        :total="totalCount"
        :page-size="listQuery.pageRow"
        :current-page.sync="listQuery.pageNum"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      ></el-pagination>
    </div>

    <el-dialog
      :title="dialogStatus === 'create' ? '新增新闻' : '编辑新闻'"
      :visible.sync="dialogFormVisible"
      width="800px"
    >
      <el-form :model="tempNews" :rules="rules" ref="newsForm">
        <el-row :gutter="10">
          <el-col :span="12">
            <el-form-item label="新闻标题" prop="title">
              <el-input v-model="tempNews.title" placeholder="请输入新闻标题"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="主题" prop="themename">
              <el-select v-model="tempNews.themenameList" multiple placeholder="请选择主题" filterable style="width: 100%" @change="onThemeChange">
                <el-option v-for="item in themes" :key="String(item.id)" :label="item.name" :value="item.name" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="10">
          <el-col :span="12">
            <el-form-item label="用户" prop="author">
              <el-input v-model="tempNews.author" placeholder="请输入作者"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="村庄" prop="villagename">
              <el-select v-model="tempNews.villagename" placeholder="请选择村庄" filterable style="width: 100%" @change="onVillageChange">
                <el-option v-for="v in villages" :key="String(v.id || v.villageName || v.name)" :label="v.villageName || v.name" :value="v.villageName || v.name" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="10">
          <el-col :span="12">
            <el-form-item label="发布状态" prop="publishStatus">
              <el-select v-model="tempNews.publishStatus" placeholder="请选择发布状态" style="width: 100%">
                <el-option label="草稿" value="草稿" />
                <el-option label="已发布" value="已发布" />
                <el-option label="已下线" value="已下线" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="新闻图片" prop="imageUrl">
          <el-upload
            :class="['upload-demo', tempNews.imageFile ? 'has-file' : '']"
            ref="imageUpload"
            action=""
            :before-upload="validateImageBeforeUpload"
            accept="image/*"
            :on-change="handleImageChange"
            :on-remove="handleImageRemove"
            :auto-upload="false"
            :file-list="tempNews.imageFile ? [tempNews.imageFile] : []"
            list-type="picture-card"
            :limit="1"
            :on-exceed="() => $message.warning('最多上传1张图片')"
          >
            <i class="el-icon-plus" v-if="!tempNews.imageFile"></i>
          </el-upload>
          <div class="upload-tip">最多上传1张，图片大小不超过10MB</div>
        </el-form-item>
        <el-form-item prop="content" class="content-editor-item">
          <div class="content-label">新闻内容</div>
          <div ref="contentEditor" class="quill-editor"></div>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import {mapGetters} from 'vuex'
import { fetchVillagePage } from '@/api/village'
import E from 'wangeditor'

export default {
  name: 'NewsManage',
  data() {
    return {
      // 列表数据
      list: [],
      totalCount: 0,
      listLoading: false,
      // 查询参数
      listQuery: {
        pageNum: 1,
        pageRow: 10,
        keyword: '',
        publishStatus: null,
        themeFilterList: []
      },
      // 对话框状态
      dialogFormVisible: false,
      dialogStatus: 'create',
      // 临时新闻数据
      tempNews: {
        id: '',
        title: '',
        author: '',
        villagename: '',
        themename: '',
        themenameList: [],
        imageUrl: '',
        imageFile: null,
        content: '',
        publishStatus: ''
      },
      // 编辑器实例
      wEditor: null,
      // 下拉选择数据
      users: [],
      villages: [],
      themes: [],
      // 上传状态标记：是否选中了超过限制的图片
      oversizeImageSelected: false,
      // 表单验证规则
      rules: {
        title: [
          { required: true, message: '请输入新闻标题', trigger: 'blur' },
          { type: 'string', max: 15, message: '标题不能超过15个字', trigger: 'change' }
        ],
        author: [
          { required: true, message: '请输入作者', trigger: 'blur' }
        ],
        villagename: [
          { required: true, message: '请选择村庄', trigger: 'change' }
        ],
        themename: [
          { required: true, message: '请选择主题', trigger: 'change' }
        ],
        content: [
          { required: true, message: '请输入新闻内容', trigger: 'blur' }
        ]
      }
    }
  },
  computed: {
    // 保留占位，当前不使用前端过滤
  },
  watch: {
    dialogFormVisible(val) {
      if (val) {
        this.$nextTick(() => {
          this.initWangEditor()
        })
      } else {
        this.destroyWangEditor()
      }
    }
  },
  created() {
    this.getThemeNamesFromNews()
    this.getList()
    this.getUsersAndVillages()
  },
  methods: {
    initWangEditor() {
      try {
        if (!E) {
          this.$message.error('编辑器资源未加载')
          return
        }
        // 已存在则刷新内容，避免重复创建
        if (this.wEditor && this.$refs.contentEditor) {
          const html = this.tempNews.content || ''
          try {
            this.wEditor.txt && this.wEditor.txt.html(html)
          } catch (_) {}
          return
        }
        if (this.$refs.contentEditor) this.$refs.contentEditor.innerHTML = ''
        this.wEditor = new E(this.$refs.contentEditor)
        this.wEditor.config.menus = [
          'head','bold','italic','underline','strikeThrough','indent',
          'fontSize','fontName','foreColor','backColor','lineHeight',
          'list','justify','image','undo','redo'
        ]
        this.wEditor.config.height = 360
        this.wEditor.config.onchange = (html) => {
          this.tempNews.content = html
        }
        this.wEditor.config.customUploadImg = async (files, insertImgFn) => {
          if (!files || !files.length) return
          const file = files[0]
          try {
            const resp = await this.uploadImage(file)
            const url = (resp && resp.url) ? resp.url : ''
            const fullUrl = this.formatImageUrl(url)
            if (fullUrl) insertImgFn(fullUrl)
            else this.$message.error('图片上传失败')
          } catch (e) {
            this.$message.error('图片上传失败')
          }
        }
        this.wEditor.create()
        try {
          const html = this.tempNews.content || ''
          this.wEditor.txt && this.wEditor.txt.html(html)
        } catch (_) {}
      } catch (e) {
        console.error(e)
      }
    },
    destroyWangEditor() {
      try {
        if (this.wEditor) {
          try { this.wEditor.destroy && this.wEditor.destroy() } catch (_) {}
          this.wEditor = null
        }
        if (this.$refs.contentEditor) {
          this.$refs.contentEditor.innerHTML = ''
        }
      } catch (_) {}
    },
    // 已移除：Quill 图片处理方法
    // 获取列表数据（useStatus 控制是否携带发布状态参数）
    getList(useStatus = true) {
      this.listLoading = true
      // 拼装查询参数：只选择必要字段，避免同时传 publishStatus/publish_status
      const params = {
        pageNum: this.listQuery.pageNum,
        pageRow: this.listQuery.pageRow,
        keyword: this.listQuery.keyword
      }
      if (useStatus) {
        const val = this.listQuery.publishStatus
        if (val != null && val !== '') {
          params.publish_status = val
        }
      }
      this.api({
        url: '/village/news/list',
        method: 'get',
        params
      }).then(data => {
        this.listLoading = false
        const raw = data.list || []
        // 兼容后端返回 total/totalCount
        this.totalCount = (data.total != null ? data.total : (data.totalCount || 0))
        // 如果当前页在筛选后为空但仍有总数，自动回到第一页补齐显示
        if (raw.length === 0 && this.totalCount > 0 && this.listQuery.pageNum > 1) {
          this.listQuery.pageNum = 1
          this.getList(useStatus)
          return
        }
        this.list = raw.map(n => ({
          ...n,
          publishStatus: (n.publishStatus != null ? n.publishStatus : (n.publish_status != null ? n.publish_status : (n.status != null ? n.status : n.publishState))),
          author: n.author || n.authorName || '',
          villagename: n.villagename || n.villageName || (n.villageId != null ? String(n.villageId) : ''),
          themename: n.themename || n.themeName || n.theme || '',
          rawImageUrl: n.imageUrl,
          imageUrl: this.formatImageUrl(n.imageUrl)
        }))
        const selected = Array.isArray(this.listQuery.themeFilterList) ? this.listQuery.themeFilterList : []
        if (selected.length > 0) {
          const selSet = new Set(selected.map(s => String(s)))
          this.list = this.list.filter(item => {
            const names = Array.isArray(item.themename) ? item.themename : String(item.themename || '').split(',').map(s => s.trim()).filter(Boolean)
            return names.some(name => selSet.has(name))
          })
          this.totalCount = this.list.length
        }
      }).catch(() => {
        this.listLoading = false
      })
    },
    // 发布状态显示（将数值或其他字段名统一映射为中文）
    publishStatusText(row) {
      const val = row && (row.publishStatus != null ? row.publishStatus
        : (row.publish_status != null ? row.publish_status
          : (row.status != null ? row.status : row.publishState)))
      return this.statusTextFromValue(val)
    },
    statusTextFromValue(val) {
      const map = { 1: '草稿', 2: '已发布', 3: '已下线' }
      const num = Number(val)
      if (!isNaN(num) && map[num]) return map[num]
      const text = String(val || '').trim()
      // 兼容后端返回中文或空（含“未发布”的老文案）
      if (['草稿', '未发布', '已发布', '已下线'].includes(text)) return text
      return '草稿'
    },
    statusCodeFromText(text) {
      const map = { '未发布': 1, '草稿': 1, '已发布': 2, '已下线': 3 }
      return map[String(text || '').trim()] || 1
    },
    // 获取用户和乡村数据
    getUsersAndVillages() {
      // 获取用户列表
      // this.api({
      //   url: '/user/getAllUsers',
      //   method: 'get'
      // }).then(data => {
      //   this.users = data.list || []
      // })

      // 获取村庄列表（复用列表页分页查询写法）
      fetchVillagePage({ page: 1, pageSize: 1000 }).then(payload => {
        const records = payload && payload.records ? payload.records : []
        this.villages = records.map(v => ({
          id: v.id,
          villageName: v.villageName || v.name || ''
        }))
      }).catch(() => {
        this.villages = []
      })
    },
    // 获取主题数据（从后端标签接口获取）
    // getThemes() {
    //   this.api({
    //     url: '/tags/getInfo',
    //     method: 'post',
    //     data: {}
    //   }).then(data => {
    //     const list = data.list || []
    //     this.themes = list.map(item => ({
    //       id: item.id || item.tagId || item.value,
    //       name: item.name || item.tagName || item.label || item.value
    //     }))
    //   })
    // },
    getThemeNamesFromNews() {
      this.api({
        url: '/village/news/theme/list',
        method: 'get',
        params: { pageNum: 1, pageRow: 1000, keyword: '' }
      }).then(data => {
        const list = data.list || []
        const extra = list.map(item => ({
          id: String(item.id != null ? item.id : (item.tagId != null ? item.tagId : item.value)),
          name: item.name || item.tagName || item.label || item.value
        }))
        const seen = new Set((this.themes || []).map(t => t.name))
        const merged = (this.themes || []).slice()
        extra.forEach(t => { if (!seen.has(t.name)) { seen.add(t.name); merged.push(t) } })
        this.themes = merged
      }).catch(() => {})
    },
    // 处理页码变化
    handleCurrentChange(val) {
      this.listQuery.pageNum = val
      this.getList()
    },
    // 处理每页条数变化
    handleSizeChange(val) {
      this.listQuery.pageRow = val
      this.getList()
    },
    // 处理查询（仅内容关键词，不携带发布状态）
    handleFilter() {
      this.listQuery.pageNum = 1
      this.getList(false)
    },
    // 获取表格序号
    getIndex($index) {
      return (this.listQuery.pageNum - 1) * this.listQuery.pageRow + $index + 1
    },
    // 显示新增对话框
    showCreate() {
      this.dialogStatus = 'create'
      this.tempNews = {
        id: '',
        title: '',
        author: '',
        villagename: '',
        themename: '',
        themenameList: [],
        imageUrl: '',
        imageFile: null,
        content: '',
        publishStatus: ''
      }
      // 每次打开弹窗都刷新主题列表，避免主题管理页新增后这里不更新
      this.getThemeNamesFromNews()
      this.dialogFormVisible = true
    },
    // 显示编辑对话框
    showUpdate($index) {
      this.dialogStatus = 'update'
      const news = this.list[$index]
      const tname = news.themename || news.themeName || news.theme || ''
      const vname = news.villagename || news.villageName || news.villageId || ''
      const author = news.author || news.authorId || ''
      const rawUrl = news.rawImageUrl || news.imageUrl
      const previewUrl = this.formatImageUrl(rawUrl)
      const tlist = Array.isArray(tname) ? tname : String(tname || '').split(',').map(s => s.trim()).filter(Boolean)
      const statusVal = (news.publishStatus != null ? news.publishStatus : (news.publish_status != null ? news.publish_status : (news.status != null ? news.status : news.publishState)))
      // 将可能为ID的村庄字段映射为名称，用于编辑表单显示
      const vid = (news.villageId != null && news.villageId !== '')
        ? news.villageId
        : (/^\d+$/.test(String(vname)) ? Number(vname) : null)
      const vDisplayName = vid != null ? (this.resolveVillageNameById(vid) || '') : String(vname || '')
      this.tempNews = {
        id: news.id || '',
        title: news.title || '',
        author: author || '',
        // 这里保持表单显示名称（不是ID）
        villagename: vDisplayName ? String(vDisplayName) : '',
        themename: tname ? String(tname) : '',
        themenameList: tlist,
        imageUrl: rawUrl || '',
        imageFile: previewUrl ? {
          name: (rawUrl || '').split('/').pop(),
          url: previewUrl,
          status: 'success'
        } : null,
        content: news.content || '',
        publishStatus: this.statusTextFromValue(statusVal)
      }
      // 编辑时也刷新主题列表，确保最新主题可选
      this.getThemeNamesFromNews()
      this.dialogFormVisible = true
      // 若编辑器已存在，仅刷新内容避免重复初始化
      this.$nextTick(() => {
        if (this.wEditor) {
          try {
            const html = this.tempNews.content || ''
            this.wEditor.txt && this.wEditor.txt.html(html)
          } catch (_) {}
        }
      })
    },
    onThemeChange(val) {
      if (Array.isArray(val)) {
        this.tempNews.themenameList = val
        this.tempNews.themename = val.length ? val.join(',') : ''
      } else {
        this.tempNews.themenameList = val ? [String(val)] : []
        this.tempNews.themename = val === '' ? '' : String(val)
      }
    },
    onVillageChange(val) {
      this.tempNews.villagename = val === '' ? '' : String(val)
    },
    // 解析村庄名称（根据ID查找名称，用于显示表单初始化与表格格式化）
    resolveVillageNameById(id) {
      const villages = Array.isArray(this.villages) ? this.villages : []
      const target = villages.find(v => String(v.id) === String(id))
      return target ? (target.villageName || target.name || '') : ''
    },
    // 处理图片变化（仅限1张）
    handleImageChange(file, fileList) {
      const lastFile = fileList[fileList.length - 1]
      const raw = (file && file.raw) || (lastFile && lastFile.raw)
      if (!raw) {
        this.$message.warning('请选择图片文件')
        return
      }
      // 大小校验：不超过10MB（双重校验）
      const maxSize = 10 * 1024 * 1024
      if ((raw.size || file.size || 0) > maxSize) {
        this.$message.error('图片大小不能超过10MB')
        this.tempNews.imageFile = null
        this.tempNews.imageUrl = ''
        this.$refs.imageUpload && this.$refs.imageUpload.clearFiles()
        return
      }
      // 说明：this.api 会直接返回 res.info 或 res.data，这里按 data 结构 { url, fileName } 读取
      this.uploadImage(raw).then(payload => {
        const url = payload && payload.url ? payload.url : ''
        // 将相对路径拼接为可访问的完整URL，避免在前端域下404（仅用于预览）
        const fullUrl = url && (url.startsWith('http') ? url : (window.webofdConfig && window.webofdConfig.BASE_URL ? (window.webofdConfig.BASE_URL + url) : url))
        if (fullUrl) {
          // 存库使用后端返回的原始URL（相对路径）
          this.tempNews.imageUrl = url
          // 预览使用可访问的完整URL
          this.tempNews.imageFile = {
            name: lastFile && lastFile.name ? lastFile.name : (file && file.name ? file.name : ''),
            url: fullUrl,
            status: 'success'
          }
        } else {
          this.$message.error('图片上传失败')
          this.tempNews.imageUrl = ''
          this.tempNews.imageFile = null
        }
      }).catch(() => {
        this.$message.error('图片上传失败')
        this.tempNews.imageUrl = ''
        this.tempNews.imageFile = null
      })
    },
    // 缺失方法补充：删除已选图片
    handleImageRemove() {
      this.tempNews.imageFile = null
      this.tempNews.imageUrl = ''
    },
    // 将相对图片路径转为可访问的完整URL（用于显示）
    formatImageUrl(url) {
      if (!url) return ''
      if (url.startsWith('http') || url.startsWith('data:')) return url
      return (window.webofdConfig && window.webofdConfig.BASE_URL ? (window.webofdConfig.BASE_URL + url) : url)
    },
    // 解析村庄名称对应的ID（提交时将名称映射为ID），若未找到且为数字字符串，则使用该数字作为ID
    resolveVillageIdByName(name) {
      const s = String(name || '').trim()
      if (!s) return null
      const vs = Array.isArray(this.villages) ? this.villages : []
      const m = vs.find(v => (v.villageName || v.name) === s)
      if (m && m.id != null) return m.id
      const num = Number(s)
      return isNaN(num) ? null : num
    },
    // 上传图片
    uploadImage(file) {
      const formData = new FormData()
      formData.append('file', file)
      return this.api({
        url: '/village/news/uploadImage',
        method: 'post',
        data: formData,
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
    },
    // 已移除：在此页面不支持添加主题
    // 提交表单
    submitForm() {
      this.$refs.newsForm.validate((valid) => {
        if (!valid) return false

        const resolvedVillageId = this.resolveVillageIdByName(this.tempNews.villagename)
        // 明确构造基础字段，避免拷贝后删除的混乱
        const baseData = {
          title: this.tempNews.title,
          author: this.tempNews.author,
          themeName: this.tempNews.themename,
          imageUrl: this.tempNews.imageUrl,
          content: this.tempNews.content,
          // 后端期望 village_id；为兼容可能的驼峰字段，一并传递
          villageId: resolvedVillageId,
          village_id: resolvedVillageId
        }

        // 发布状态：文本->数值，同时兼容驼峰/下划线
        const statusCode = this.statusCodeFromText(this.tempNews.publishStatus)
        baseData.publishStatus = statusCode
        baseData.publish_status = statusCode

         if (this.dialogStatus === 'create') {
           const data = {
             ...baseData
           }
           // 新增不传 id
           this.createNews(data)
         } else {
           const data = {
             ...baseData,
            // 编辑：需传 id
            id: this.tempNews.id
           }
           this.updateNews(data)
         }
      })
    },
    // 创建新闻
    createNews(data) {
      this.api({
        url: '/village/news/add',
        method: 'post',
        data: data
      }).then(() => {
        this.$message.success('添加成功')
        this.dialogFormVisible = false
        this.getList()
      }).catch(() => {
        this.$message.error('添加失败')
      })
    },
    // 更新新闻
    updateNews(data) {
      this.api({
        url: '/village/news/update',
        method: 'post',
        data: data
      }).then(() => {
        this.$message.success('更新成功')
        this.dialogFormVisible = false
        this.getList()
      }).catch(() => {
        this.$message.error('更新失败')
      })
    },
    // 删除新闻
    removeNews($index) {
      const news = this.list[$index]
      this.$confirm('确定要删除该新闻吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.api({
          url: '/village/news/delete',
          method: 'post',
          data: { id: news.id }
        }).then(() => {
          this.$message.success('删除成功')
          this.getList()
        }).catch(() => {
          this.$message.error('删除失败')
        })
      }).catch(() => {
        this.$message.info('已取消删除')
      })
    },
    // 将表格中的乡村ID映射为名称显示
    formatVillageName(row, column, cellValue, index) {
      const villages = Array.isArray(this.villages) ? this.villages : []
      const fromCell = cellValue != null ? String(cellValue) : ''
      const fromRowName = row.villageName || row.villagename || ''
      const fromRowId = row.villageId
      let id = null
      if (fromRowId != null && fromRowId !== '') {
        id = fromRowId
      } else if (/^\d+$/.test(fromCell)) {
        id = Number(fromCell)
      } else if (/^\d+$/.test(String(fromRowName))) {
        id = Number(fromRowName)
      }
      if (id != null) {
        const found = villages.find(v => String(v.id) === String(id))
        if (found) {
          return found.villageName || found.name || String(id)
        }
        return String(id)
      }
      return String(fromRowName || fromCell || '')
    },
    // 发布状态筛选变化：重置到第一页并重新获取列表（后端分页过滤）
    onPublishStatusChange() {
      this.listQuery.pageNum = 1
      this.getList()
    },
    // 主题多选筛选变化：重置到第一页并进行本地过滤刷新
    onThemeFilterChange() {
      this.listQuery.pageNum = 1
      this.getList(false)
    }
  }
}
</script>
<style scoped>
.filter-container {
  padding-bottom: 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.status-filter {
  min-width: 180px;
  text-align: right;
}
.title-text {
  font-size: 18px;
  font-weight: bold;
  margin-left: 20px;
}
.pagination-container {
  margin-top: 20px;
  text-align: right;
}
.el-upload--picture-card {
  width: 120px;
  height: 120px;
}
.upload-tip {
  margin-top: 4px;
  font-size: 12px;
  color: #909399;
}
.content-editor-item ::v-deep .el-form-item__label {
  float: none !important;
  display: block;
  width: 100% !important;
  margin: 0 0 6px 0;
  padding: 0;
}
.content-editor-item ::v-deep .el-form-item__content {
  margin-left: 0 !important;
  display: block;
}
.quill-editor {
  min-height: 240px;
}
.content-editor-item .content-label {
  display: block;
  margin: 0 0 6px 0;
  color: #606266;
  line-height: 20px;
}
.content-editor-item.is-required .content-label::before {
  content: '*';
  color: #f56c6c;
  margin-right: 4px;
}
</style>
