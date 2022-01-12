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
          <el-input placeholder="请输入搜索名字" class="input-with-select" v-model="queryInfo.query" clearable @clear="this.getUserList">
            <el-button slot="append" icon="el-icon-search" @click="this.getUserList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary"> 添加用户</el-button>
        </el-col>
      </el-row>

      <el-table
          :data="userList"
          stripe
          border
          style="width: 100%">
        <el-table-column
            label="序号"
            type="index">
        </el-table-column>
        <el-table-column
            prop="username"
            label="姓名">
        </el-table-column>
        <el-table-column
            prop="email"
            label="邮箱">
        </el-table-column>
        <el-table-column
            prop="mobile"
            label="电话">
        </el-table-column>
        <el-table-column
            prop="role_name"
            label="角色">
        </el-table-column>
        <el-table-column
            label="状态">
          <!-- 自定义列模板, 使用作用域插槽, 通过 scope.row 拿到当前行的数据-->
          <template slot-scope="scope">
            <el-switch
                v-model="scope.row.mg_state"
                @change="userStateChange(scope.row)">
            </el-switch>
          </template>
        </el-table-column>
        <el-table-column
            label="操作">
          <template>
            <el-tooltip effect="dark" content="Top Center 提示文字" placement="top" :enterable="false">
              <el-button type="primary" icon="el-icon-edit" size="mini"></el-button>
            </el-tooltip>
            <el-tooltip effect="dark" content="Top Center 提示文字" placement="top" :enterable="false">
              <el-button type="danger" icon="el-icon-delete" size="mini"></el-button>
            </el-tooltip>
            <el-tooltip effect="dark" content="分配角色" placement="top" :enterable="false">
              <el-button type="warning" icon="el-icon-setting" size="mini"></el-button>
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
      // 数据总条数
      total: 0
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
      // console.log(this.userList)
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
        if (res.meta.status !== 200){
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

    }
  }
}
</script>

<style lang="less" scoped>

</style>
