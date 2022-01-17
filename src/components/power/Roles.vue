<template>
  <div>
    <!-- 导航栏 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" round @click="dialogVisible = true">添加角色</el-button>
        </el-col>
      </el-row>
      <el-table :data="roleUsersInfo" stripe border style="width: 100%">
        <!-- 展开列 -->
        <el-table-column label="明细" type="expand">
          <template slot-scope="scope">
            <!-- 一级权限 -->
            <el-row v-for="(item1, i1) in scope.row.children" :key="item1.id"
                    :class="{bdBottom: true, rolesExpand: true, bdTop: i1===0, vcenter: true}">
              <el-col :span="5">
                <el-tag closable @close="removeRightById(scope.row, item1.id)"> {{ item1.authName }}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <el-col :span="19">
                <el-row v-for="(item2, i2) in item1.children" :key="item2.id" :class="{bdTop: i2 !== 0, vcenter: true}">
                  <!-- 二级权限 -->
                  <el-col :span="6">
                    <el-tag closable type="success" @close="removeRightById(scope.row, item2.id)">
                      {{ item2.authName }}
                    </el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <el-tag closable type="warning" v-for="item3 in item2.children"
                            :key="item3.id" @close="removeRightById(scope.row, item3.id)">
                      {{ item3.authName }}
                    </el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column label="序号" type="index">
        </el-table-column>
        <el-table-column prop="roleName" label="角色姓名">
        </el-table-column>
        <el-table-column prop="roleDesc" label="角色描述">
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditRole(scope.row.id)">编辑</el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteRole(scope.row.id)">删除</el-button>
            <el-button type="warning" icon="el-icon-share" size="mini" @click="showRightDialog(scope.row)">分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>


    <!-- 添加用户 -->
    <el-dialog
        title="添加用户"
        :visible.sync="dialogVisible"
        width="50%"
        @close="addDisalogClosed">
      <el-form ref="addFormRef" :model="addForm" :rules="addFormRules" label-width="80px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改用户 -->
    <el-dialog
        title="修改用户"
        :visible.sync="editDialogVisible"
        width="50%"
        @close="editDisalogClosed">
      <el-form ref="editFormRef" :model="editRolesFrom" :rules="addFormRules" label-width="80px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="editRolesFrom.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="editRolesFrom.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUser">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 分配权限 -->
    <el-dialog
        title="分配权限"
        :visible.sync="rightDialogVisible"
        width="50%"
        @close="rightDisalogClosed">
      <el-tree ref="treeRef" :data="rightsList" :props="treeProps" node-key="id" show-checkbox default-expand-all
               :default-checked-keys="defaultKeys"></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="rightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "Roles",
  data() {
    return {
      roleUsersInfo: [],
      dialogVisible: false,
      editDialogVisible: false,
      rightDialogVisible: false,
      rightsList: [],
      defaultKeys: [], // 默认选中节点值的 id 值数组
      editRolesFrom: {},
      roleId: '',
      addForm: {
        roleName: '',
        roleDesc: ''
      },
      addFormRules: {
        roleName: [
          {required: true, message: '请输入角色名称', trigger: 'blur'}
        ],
        roleDesc: [
          {required: true, message: '请输入角色描述', trigger: 'blur'}
        ]
      },
      // 树形菜单配置对象
      treeProps: {
        label: 'authName',
        children: 'children'
      },

    }
  },

  created() {
    this.getRolesList()
  },

  methods: {
    async getRolesList() {
      const {data: res} = await this.$http.get('roles/')
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.roleUsersInfo = res.data
      // console.log(this.roleUsersInfo)
    },

    addDisalogClosed() {
      this.$refs.addFormRef.resetFields()
      this.dialogVisible = false
    },

    addUser() {
      this.$refs.addFormRef.validate(async vaild => {
        if (!vaild) return
        const {data: res} = await this.$http.post('roles', this.addForm)
        if (res.meta.status !== 201) return this.$message.error(res.meta.msg)
        this.$message.success("添加角色成功")
        await this.getRolesList()
        this.dialogVisible = false
      })
    },

    async showEditRole(roleId) {
      const {data: res} = await this.$http.get(`roles/${roleId}`)
      // console.log(res)
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.editRolesFrom = res.data
      // console.log(this.editRolesFrom)
      this.editDialogVisible = true
    },

    editUser() {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return
        const {data: res} = await this.$http.put(`roles/${this.editRolesFrom.roleId}`,
            {roleName: this.editRolesFrom.roleName, roleDesc: this.editRolesFrom.roleDesc})
        // console.log(res)
        if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
        this.$message.success("修改成功")
        this.editDialogVisible = false
      })
    },

    editDisalogClosed() {
      this.$refs.editFormRef.resetFields()
      this.dialogVisible = false
    },

    deleteRole(roleId) {
      this.$confirm('此操作将永久删除该角色, 是否继续?', '提示', {
        confirmButtonText: '继续',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const {data: res} = await this.$http.delete(`roles/${roleId}`)
        if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
        await this.getRolesList()
        this.$message({
          type: 'success',
          message: '删除成功!'
        });
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        });
      });
    },

    removeRightById(role, rightId) {
      this.$confirm('是否确定删除该权限?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const {data: res} = await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
        if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
        this.$message({
          type: 'success',
          message: '删除成功!'
        });
        role.children = res.data
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        });
      });
    },

    async showRightDialog(role) {
      this.roleId = role.id
      // console.log(role)
      // 获取角色下所有三级权限 id
      role.children.forEach(item => {
        if (!item.children) return this.defaultKeys.push(item.id)
        item.children.forEach(i => {
          if (!i.children) return this.defaultKeys.push(i.id)
          i.children.forEach(j => {
            if (!j.children) return this.defaultKeys.push(j.id)
          })
        })
      })
      // console.log(this.defaultKeys)
      const {data: res} = await this.$http.get('rights/tree')
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.rightsList = res.data
      // console.log(this.rightsList)

      this.rightDialogVisible = true
    },

    async allotRights() {
      const keysList = this.$refs.treeRef.getCheckedKeys().concat(this.$refs.treeRef.getHalfCheckedKeys())
      const keysStr = keysList.join(',')

      const {data: res} = await this.$http.post(`roles/${this.roleId}/rights`, {rids: keysStr})
      // console.log(res)
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      await this.getRolesList()
      this.$message.success("分配权限成功")
      this.rightDialogVisible = false
    },

    rightDisalogClosed() {
      this.rightDialogVisible = false
      this.defaultKeys = []
    }
  }
}
</script>

<style scoped>
.el-tag {
  margin: 6px;
  text-align: center;
}

.rolesExpand {
  margin-left: 40px;
  margin-right: 30px;
}

.bdBottom {
  border-bottom: 1px solid #eee;
}

.bdTop {
  border-top: 1px solid #eee;
}

.vcenter {
  display: flex;
  align-items: center;
}
</style>
