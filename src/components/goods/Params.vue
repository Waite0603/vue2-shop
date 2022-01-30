<template>
  <div>
    <!-- 导航栏 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>分类参数</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
      <el-alert
          title="注意: 只允许为第三级分类设置相关参数!"
          type="warning"
          show-icon>
      </el-alert>
      <el-row class="param_row">
        <el-col>
          <span>选择商品分类:</span>
          <el-cascader
              v-model="selectedKey"
              :options="cateList"
              :props="{ label: 'cat_name', value: 'cat_id', children: 'children', expandTrigger: 'hover' }"
              @change="handleChange" clearable></el-cascader>
        </el-col>
      </el-row>
      <el-tabs v-model="activeName" @tab-click="handleClick">
        <el-tab-pane label="动态参数" name="many">
          <el-button type="primary" round :disabled="this.selectedKey.length !== 3" @click="addDialogVisible = true">
            添加元素
          </el-button>
          <el-table :data="paramsData" stripe border>
            <el-table-column label="明细" type="expand">
              <template slot-scope="scope">
                <el-tag
                    :key="i"
                    v-for="(item, i) in scope.row.attr_vals"
                    @close="handleClose(scope.row, i)" closable>
                  {{ item }}
                </el-tag>
                <el-input
                    class="input-new-tag"
                    v-if="scope.row.inputVisible"
                    v-model="scope.row.inputValue"
                    ref="saveTagInput"
                    size="small"
                    @keyup.enter.native="handleInputConfirm(scope.row)"
                    @blur="handleInputConfirm(scope.row)"
                    style="width: 120px"
                ></el-input>
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag
                </el-button>
              </template>
            </el-table-column>
            <el-table-column label="序号" type="index"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button size="mini" type="primary" icon="el-icon-edit" @click="showEditDialog(scope.row.attr_id)">
                  编辑
                </el-button>
                <el-button size="mini" type="danger" icon="el-icon-edit" @click="removeParams(scope.row.attr_id)">删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="静态属性" name="only">
          <el-button type="primary" round :disabled="this.selectedKey.length !== 3" @click="addDialogVisible = true">
            添加属性
          </el-button>
          <el-table :data="paramsData" stripe border>
            <el-table-column label="明细" type="expand">
              <template slot-scope="scope">
                <el-tag
                    :key="i"
                    v-for="(item, i) in scope.row.attr_vals"
                    @close="handleClose(scope.row, i)" closable>
                  {{ item }}
                </el-tag>
                <el-input
                    class="input-new-tag"
                    v-if="scope.row.inputVisible"
                    v-model="scope.row.inputValue"
                    ref="saveTagInput"
                    size="small"
                    @keyup.enter.native="handleInputConfirm(scope.row)"
                    @blur="handleInputConfirm(scope.row)"
                    style="width: 120px"
                ></el-input>
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag
                </el-button>
              </template>
            </el-table-column>
            <el-table-column label="序号" type="index"></el-table-column>
            <el-table-column label="属性名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button size="mini" type="primary" icon="el-icon-edit" @click="showEditDialog(scope.row.attr_id)">
                  编辑
                </el-button>
                <el-button size="mini" type="danger" icon="el-icon-edit" @click="removeParams(scope.row.attr_id)">删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 添加对话框 -->
    <el-dialog :title="'添加' + title" :visible.sync="addDialogVisible" width="50%" @close="addDialogClosed">
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
        <el-form-item :label="title" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改对话框 -->
    <el-dialog :title="'修改' + title" :visible.sync="editDialogVisible" width="50%" @close="editDialogClosed">
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
        <el-form-item :label="title" prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParams">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  name: "Params",
  data() {
    return {
      cateList: [],
      selectedKey: '',
      activeName: 'many',
      paramsData: [],
      addDialogVisible: false,
      editDialogVisible: false,
      addForm: {},
      addFormRules: {
        attr_name: [{required: true, message: '请输入参数名称', trigger: 'blur'}],
      },
      editForm: {},
      editFormRules: {
        attr_name: [{required: true, message: '请输入参数名称', trigger: 'blur'}],
      },
    }
  },

  created() {
    this.getCateList()
  },

  methods: {
    async getCateList() {
      const {data: res} = await this.$http.get('categories')
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.cateList = res.data
      // console.log(this.cateList)
    },

    handleClick() {
      this.getParamsList()
    },

    handleChange() {
      this.getParamsList()
    },

    // 获取分类参数数据
    async getParamsList() {
      if (this.selectedKey.length !== 3) {
        this.selectedKey = []
        return
      }

      const {data: res} = await this.$http.get(`categories/${this.selectedKey[2]}/attributes`,
          {params: {sel: this.activeName}})

      // 对参数明细进行处理
      res.data.forEach(i => {
        i.attr_vals = i.attr_vals ? i.attr_vals.split(' ') : []
        i.inputVisible = false// 控制文本框显示
        i.inputValue = ''
      })

      // console.log(res.data)
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.paramsData = res.data
    },

    // 监听添加对话框的关闭事件
    addDialogClosed() {
      this.$refs.addFormRef.resetFields()
    },

    // 添加参数
    addParams() {
      this.$refs.addFormRef.validate(async (valid) => {
        if (!valid) {
          return
        }
        const {data: res} = await this.$http.post(`categories/${this.selectedKey[2]}/attributes`, {
          attr_name: this.addForm.attr_name,
          attr_sel: this.activeName,
        })
        console.log(res)
        if (res.meta.status !== 201) {
          return this.$message.error('添加参数失败')
        }

        this.addDialogVisible = false
        await this.getParamsList()
        this.$message.success('添加参数成功！')
      })
    },

    // 删除参数
    removeParams(id) {
      this.$confirm('确定要删除该参数吗', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
          .then(async () => {
            const {data: res} = await this.$http.delete(`categories/${this.selectedKey[2]}/attributes/${id}`)
            if (res.meta.status !== 200) {
              return this.$message.error('删除参数失败')
            }
            await this.getParamsList()
            this.$message.success('删除参数成功！')
          })
          .catch(() => {
            this.$message.info('已取消删除！')
          })
    },

    // 显示编辑对话框
    async showEditDialog(id) {
      const {data: res} = await this.$http.get(`categories/${this.selectedKey[2]}/attributes/${id}`, {
        params: {attr_sel: this.activeName},
      })
      if (res.meta.status !== 200) {
        return this.$message.error('查询参数信息失败')
      }
      this.editForm = res.data
      this.editDialogVisible = true
    },

    // 监听修改对话框的关闭事件
    editDialogClosed() {
      this.$refs.editFormRef.resetFields()
    },

    // 修改参数
    editParams() {
      this.$refs.editFormRef.validate(async (valid) => {
        if (!valid) {
          return
        }
        const {data: res} = await this.$http.put(`categories/${this.selectedKey[2]}/attributes/${this.editForm.attr_id}`, {
          attr_name: this.editForm.attr_name,
          attr_sel: this.activeName,
          attr_vals: this.editForm.attr_vals,
        })
        if (res.meta.status !== 200) {
          return this.$message.error('修改参数名称失败')
        }
        this.editDialogVisible = false
        await this.getParamsList()
        this.$message.success('修改参数名称成功！')
      })
    },

    handleClose(row, i) {
      row.attr_vals.pop(row.attr_vals[i])
      this.updateParamsDetail(row)
    },

    showInput(row) {
      row.inputVisible = true
      this.$nextTick(() => {
        this.$refs.saveTagInput.$refs.input.focus();
      });
    },

    handleInputConfirm(row) {
      if (row.inputValue.trim()) {
        row.attr_vals.push(row.inputValue)
        this.updateParamsDetail(row)
        row.inputValue = ''
      }
      row.inputVisible = false
    },

    async updateParamsDetail(row) {
      console.log(row)
      const {data: res} = await this.$http.put(`categories/${this.selectedKey[2]}/attributes/${row.attr_id}`,
          {
            attr_name: row.attr_name,
            attr_sel: row.attr_sel,
            attr_vals: row.attr_vals.join(' ')
          })
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.$message.success("更新参数成功")
    }

  },

  computed: {
    title() {
      return this.activeName === 'many' ? '动态参数' : '静态属性'
    },
  }
}
</script>

<style scoped>

</style>
