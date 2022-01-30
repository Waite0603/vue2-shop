<template>
  <div>
    <!-- 导航栏 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
      <el-row :gutter="20">
        <el-col :span="7">
          <el-input placeholder="请输入搜索名字" class="input-with-select" v-model="queryInfo.query" clearable
                    @clear="this.getUserList">
            <el-button slot="append" icon="el-icon-search" @click="this.getUserList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="dialogVisible=true"> 添加用户</el-button>
        </el-col>
      </el-row>

      <el-table :data="userList" stripe border style="width: 100%">
        <el-table-column label="序号" type="index">
        </el-table-column>
        <el-table-column prop="username" label="姓名">
        </el-table-column>
        <el-table-column prop="email" label="邮箱">
        </el-table-column>
        <el-table-column prop="mobile" label="电话">
        </el-table-column>
        <el-table-column prop="role_name" label="角色">
        </el-table-column>
        <el-table-column label="状态">
          <!-- 自定义列模板, 使用作用域插槽, 通过 scope.row 拿到当前行的数据-->
          <template slot-scope="scope">
            <el-switch v-model="scope.row.mg_state" @change="userStateChange(scope.row)">
            </el-switch>
          </template>
        </el-table-column>
        <el-table-column
            label="操作">
          <template slot-scope="scope">
            <el-tooltip effect="dark" content="修改用户信息" placement="top" :enterable="false">
              <el-button type="primary" icon="el-icon-edit" size="mini" @click="editUserInfo(scope.row)"></el-button>
            </el-tooltip>
            <el-tooltip effect="dark" content="删除角色" placement="top" :enterable="false">
              <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteUser(scope.row)"></el-button>
            </el-tooltip>
            <el-tooltip effect="dark" content="分配角色" placement="top" :enterable="false">
              <el-button type="warning" icon="el-icon-setting" size="mini" @click="showRoleDialog(scope.row)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

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
        @close="addDisalogClosed">
      <el-form ref="addFormRef" :model="addForm" :rules="addFormRules" label-width="80px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password" show-password></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改用户信息 -->
    <el-dialog title="修改用户信息" :visible.sync="editUserDialog" width="50%" @close="editUserDialog = false">
      <el-form ref="editFormRef" :model="editForm" :rules="editFormRules" label-width="80px">
        <el-form-item label="用户名">
          <el-input v-model="editForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="mobile">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editUserDialog = false">取 消</el-button>
        <el-button type="primary" @click="editUser">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 分配用户 -->
    <el-dialog title="分配用户" :visible.sync="roleUserDialog" width="30%" @close="setRoleDialog">
      <div>
        <p>当前用户名: {{ roleUserInfo.username }}</p>
        <p>当前角色: {{ roleUserInfo.role_name }}</p>
        分配新角色:
        <el-select v-model="selectdRoleId" placeholder="请选择" size="mini">
          <el-option
              v-for="item in rolesList"
              :key="item.id"
              :label="item.roleName"
              :value="item.id">
          </el-option>
        </el-select>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="roleUserDialog = false">取 消</el-button>
        <el-button type="primary" @click="allotRole">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "Users",
  data() {
    return {
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 5
      },
      // 用户列表数据
      userList: [],
      rolesList: [],
      // 数据总条数
      total: 0,
      dialogVisible: false,
      editUserDialog: false,
      roleUserDialog: false,
      // 添加用户的表单对象
      addForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      editForm: {},
      roleUserInfo: {},
      selectdRoleId: null,
      // 添加用户的表单对象校验规则
      addFormRules: {
        username: [
          {required: true, message: '请输入用户名', trigger: 'blur'},
          {min: 3, max: 10, message: '用户名长度在 3 到 10 个字符', trigger: 'blur'}
        ],
        password: [
          {required: true, message: '请输入密码', trigger: 'blur'},
          {min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur'}
        ],
        email: [
          {required: true, message: '请输入邮箱', trigger: 'blur'},
          {
            pattern: '^[a-z0-9A-Z]+[- | a-z0-9A-Z . _]+@([a-z0-9A-Z]+(-[a-z0-9A-Z]+)?\\.)+[a-z]{2,}$',
            message: "请输入正确邮箱",
            trigger: 'blur'
          }
        ],
        mobile: [
          {required: true, message: '请输入手机号码', trigger: 'blur'},
          {
            pattern: '^1(3[0-9]|4[01456879]|5[0-35-9]|6[2567]|7[0-8]|8[0-9]|9[0-35-9])\\d{8}$',
            message: '请输入正确手机号',
            trigger: 'blur'
          }
        ],
      },

      editFormRules: {
        email: [
          {required: true, message: '请输入邮箱', trigger: 'blur'},
          {
            pattern: '^[a-z0-9A-Z]+[- | a-z0-9A-Z . _]+@([a-z0-9A-Z]+(-[a-z0-9A-Z]+)?\\.)+[a-z]{2,}$',
            message: "请输入正确邮箱",
            trigger: 'blur'
          }
        ],
        mobile: [
          {required: true, message: '请输入手机号码', trigger: 'blur'},
          {
            pattern: '^1(3[0-9]|4[01456879]|5[0-35-9]|6[2567]|7[0-8]|8[0-9]|9[0-35-9])\\d{8}$',
            message: '请输入正确手机号',
            trigger: 'blur'
          }
        ],
      },
    }
  },
  created() {
    this.getUserList()
  },
  methods: {
    async getUserList() {
      const {data: res} = await this.$http.get('users', {
        params: this.queryInfo
      })
      // console.log(res)
      if (res.meta.status !== 200) {
        return this.$message.error('获取用户列表失败')
      }
      this.userList = res.data.users
      this.total = res.data.total
      // console.log(this.total)
    },

    // 监听 pagesize 改变的事件
    handleSizeChange(pagesize) {
      this.queryInfo.pagesize = pagesize
      // console.log(this.queryInfo)
      this.getUserList()
    },

    // 监听 pagenum 改变的事件
    handleCurrentChange(pagenum) {
      this.queryInfo.pagenum = pagenum
      // console.log(this.pagenum)
      this.getUserList()
    },

    // 监听switch 状态的改变
    userStateChange(userInfo) {
      // console.log(userInfo.mg_state);
      this.$confirm('是否改变用户状态?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const {data: res} = await this.$http.put(`users/${userInfo.id}/state/${userInfo.mg_state}`)
        // console.log(res)
        if (res.meta.status !== 200) {
          userInfo.mg_state = !userInfo.mg_state
          return this.$message({
            type: 'info',
            message: res.meta.msg
          });
        }
        this.$message({
          type: 'success',
          message: '状态改变成功'
        });
      }).catch(() => {
        userInfo.mg_state = !userInfo.mg_state
        this.$message({
          type: 'info',
          message: '状态改变已取消'
        });
      });
    },

    // 监听添加用户对话框关闭事件
    addDisalogClosed() {
      this.$refs.addFormRef.resetFields()
      this.dialogVisible = false
    },

    addUser() {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return
        const {data: res} = await this.$http.post('users', this.addForm)
        // console.log(res)
        if (res.meta.status !== 201) {
          return this.$message({
            showClose: true,
            message: res.meta.msg,
            type: 'error'
          })
        }
        this.$message({
          showClose: true,
          message: "用户添加成功",
          type: 'success'
        })
        await this.getUserList()
        this.dialogVisible = false
      })
    },

    async editUserInfo(userInfo) {
      const {data: res} = await this.$http.get(`users/${userInfo.id}`)
      // console.log(res)
      if (res.meta.status !== 200) return this.$message.error("用户查询失败")
      this.editForm = res.data
      this.editUserDialog = true
    },

    editUser() {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return
        const res = await this.$http.put(`users/${this.editForm.id}`, {
          email: this.editForm.email,
          mobile: this.editForm.mobile
        })
        // console.log(res.data)
        if (res.data.meta.status !== 200) {
          return this.$message({
            showClose: true,
            message: res.data.meta.msg,
            type: 'error'
          })
        }
        this.$message({
          showClose: true,
          message: res.data.meta.msg,
          type: 'success'
        })
        await this.getUserList()
        this.editUserDialog = false
      })
    },

    deleteUser(userInfo) {
      const userSelfInfo = JSON.parse(sessionStorage.getItem('userInfo'))
      if (userSelfInfo.data.id === userInfo.id) {
        return this.$message.error("不允许删除自己账号")
      }
      this.$confirm('是否确定删除该用户?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const res = await this.$http.delete(`users/${userInfo.id}`)
        if (res.data.meta.status !== 200) return this.$message.error(res.data.meta.msg)
        // console.log(res)
        this.$message({
          type: 'success',
          message: '删除成功!'
        });
        await this.getUserList()
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        });
      });
    },


    async showRoleDialog(userInfo) {
      this.roleUserDialog = true
      // console.log(userInfo)
      this.roleUserInfo = userInfo
      // 获取角色列表
      const {data: res} = await this.$http.get('roles')
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.rolesList = res.data
      // console.log(this.rolesList)
    },

    setRoleDialog() {
      this.selectdRoleId = null
      this.roleUserInfo = {}
    },

    async allotRole() {
      if (!this.selectdRoleId) return this.$message.warning("请选择角色")
      const {data: res} = await this.$http.put(`users/${this.roleUserInfo.id}/role`, {rid: this.selectdRoleId})
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.$message.success("设置成功")
      await this.getUserList()
      this.roleUserDialog = false
    }
  }
}
</script>

<style lang="less" scoped>

</style>
