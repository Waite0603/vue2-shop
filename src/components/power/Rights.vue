<template>
  <div>
    <!-- 导航栏 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>权限列表</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card>
      <el-table :data="rightsList" stripe border style="width: 100%">
        <el-table-column label="序号" type="index">
        </el-table-column>
        <el-table-column prop="authName" label="权限姓名">
        </el-table-column>
        <el-table-column prop="path" label="路径">
        </el-table-column>
        <el-table-column label="角色">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.level === '0'">一级</el-tag>
            <el-tag type="success" v-if="scope.row.level === '1'">二级</el-tag>
            <el-tag type="warning" v-if="scope.row.level === '2'">三级</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
export default {
  name: "Rights",
  data() {
    return{
      rightsList: []
    }
  },


  created() {
    this.getRightsList()
  },


  methods: {
    async getRightsList() {
      const {data: res} = await this.$http.get('rights/list')
      if (res.meta.status != 200) return this.$message.error(res.meta.msg)
      this.rightsList = res.data
      console.log(this.rightsList)
    }
  }
}
</script>

<style scoped>

</style>
