<template>
  <div>
    <!-- 导航栏 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" round @click="showAddDialog">添加商品</el-button>
        </el-col>
      </el-row>

      <!-- tree-table -->
      <tree-table :data="cateList" :columns="colums" :selection-type="false" :expand-type="false" :show-index="true"
                  stripe border>
        <!-- 是否有效 -->
        <template slot="isOk" slot-scope="scope">
          <i class="el-icon-error" style="color: red" v-if="scope.row.cate_deleted"></i>
          <i class="el-icon-success" style="color: green" v-else></i>
        </template>
        <template slot="order" slot-scope="scope">
          <el-tag size="mini" v-if="scope.row.cat_level === 0">一级</el-tag>
          <el-tag size="mini" v-else-if="scope.row.cat_level === 1" type="warning">二级</el-tag>
          <el-tag size="mini" v-else type="success">三级</el-tag>
        </template>
        <template slot="operate" slot-scope="scope">
          <el-button size="mini" type="primary" icon="el-icon-edit" @click="showEditDialog(scope.row.cat_id)">编辑</el-button>
          <el-button size="mini" type="danger" icon="el-icon-edit" @click="removeCateById(scope.row.cat_id)">删除</el-button>
        </template>
      </tree-table>

      <!-- 分页 -->
      <div class="block">
        <el-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="queryInfo.pagenum"
            :page-sizes="[1, 2, 5, 10]"
            :page-size="queryInfo.pagesize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total">
        </el-pagination>
      </div>
    </el-card>

    <!-- 添加用户 -->
    <el-dialog
        title="添加用户"
        :visible.sync="dialogVisible"
        width="50%"
        @close="addDialogClosed">
      <el-form ref="addFormRef" :model="addForm" :rules="addFormRules" label-width="80px">
        <el-form-item label="分类名字" prop="cat_name">
          <el-input v-model="addForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类">
          <div class="block">
            <el-cascader
                v-model="selectedKeys"
                :options="parentCateList"
                :props="{ label: 'cat_name', value: 'cat_id', children: 'children', expandTrigger: 'hover', checkStrictly: true }"
                @change="handleChange"
                style="width: 100%" filterable>
            </el-cascader>
          </div>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 编辑分类 -->
    <el-dialog title="编辑分类" :visible.sync="editDialogVisible" width="50%" @close="editDialogClosed">
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="editForm.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editCate">确 定</el-button>
      </span>
    </el-dialog>

  </div>
</template>

<script>
export default {
  name: "Cate",
  data() {
    return {
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      addForm: {
        cat_name: '',
        cat_pid: 0,
        cat_level: 0
      },
      // 分类列表
      cateList: [],
      parentCateList: [],
      editForm: {},editFormRules: {
        cat_name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }],
      },
      // 总条数
      total: 0,
      dialogVisible: false,
      editDialogVisible: false,
      addFormRules: {
        cat_name: [
          {required: true, message: '请输入分类名字', trigger: 'blur'},
        ]
      },
      // tree-table 列的定义
      colums: [
        {
          label: '分类名称',
          prop: 'cat_name'
        },
        {
          label: '是否有效',
          // 将当前页定义为模板列
          type: 'template',
          // 调用模板
          template: 'isOk'
        },
        {
          label: '排序',
          // 将当前页定义为模板列
          type: 'template',
          // 调用模板
          template: 'order'
        },
        {
          label: '操作',
          // 将当前页定义为模板列
          type: 'template',
          // 调用模板
          template: 'operate'
        }
      ],
      selectedKeys: []
    }
  },

  created() {
    this.getCateList()
  },

  methods: {
    async getCateList() {
      const {data: res} = await this.$http.get('categories', {params: this.queryInfo})
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.cateList = res.data.result
      this.total = res.data.total
    },

    async getParentCateList() {
      const {data: res} = await this.$http.get('categories', {params: {type: 2}})
      console.log(res)
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.parentCateList = res.data
    },

    showAddDialog() {
      this.getParentCateList()
      this.dialogVisible = true
    },
    // 监听 pagesize 改变的事件
    handleSizeChange(pagesize) {
      this.queryInfo.pagesize = pagesize
      // console.log(this.queryInfo)
      this.getCateList()
    },

    // 监听 pagenum 改变的事件
    handleCurrentChange(pagenum) {
      this.queryInfo.pagenum = pagenum
      // console.log(this.pagenum)
      this.getCateList()
    },

    handleChange() {
      if (this.selectedKeys.length > 0) {
        this.addForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1]
        this.addForm.cat_level = this.selectedKeys.length
      }
      else {
        this.addForm.cat_pid = 0
        this.addForm.cat_level = 0
      }
    },

    addCate() {
      this.$refs.addFormRef.validate(async vaild => {
        if (!vaild) return
        const {data: res} = await this.$http.post('categories', this.addForm)
        console.log(res)
        console.log(this.addForm)
        if (res.meta.status !== 201) return this.$message.error(res.meta.msg)
        this.dialogVisible = false
        await this.getCateList()
        this.$message.success("添加成功")
      })
    },

    // 监听添加对话框的关闭事件
    addDialogClosed(){
      this.$refs.addFormRef.resetFields()
      this.selectedKeys = []
      this.addForm.cat_pid = 0
      this.addForm.cat_level = 0
    },

    editCate(){
      this.$refs.editFormRef.validate(async valid => {
        if(!valid){
          return
        }
        const {data:res} = await this.$http.put(`categories/${this.editForm.cat_id}`,{
          cat_name:this.editForm.cat_name
        })
        if(res.meta.status !== 200){
          return this.$message.error('修改分类失败')
        }
        this.editDialogVisible = false
        await this.getCateList()
        this.$message.success('修改分类成功！')
      })
    },

    editDialogClosed(){
      this.$refs.editFormRef.resetFields()
    },

    async showEditDialog(cateId){
      const {data:res} = await this.$http.get(`categories/${cateId}`)
      if(res.meta.status !== 200){
        return this.$message.error('查询分类失败')
      }
      this.editForm = res.data
      this.editDialogVisible = true
    },

    removeCateById(cateId){
      this.$confirm('确定要删除该分类吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const {data:res} = await this.$http.delete(`categories/${cateId}`)
        if(res.meta.status !== 200){
          return this.$message.error('删除分类失败')
        }
        this.getCateList()
        this.$message.success('删除分类成功！')
      }).catch(() => {
        this.$message.info('已取消删除！')
      });
    }
  }
}
</script>

<style scoped>

</style>
