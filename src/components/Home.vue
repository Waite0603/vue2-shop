<template>
  <el-container>
    <el-header>
      <div class="left">
        <img src="../assets/imgs/shop.png" alt="">
        <span>电商后台管理系统</span>
      </div>
      <div class="right">
        <span>欢迎您: {{ userInfo.data.username }}</span>
        <el-button type="danger" size="mini" @click="signUp">退出</el-button>
      </div>
    </el-header>
    <el-container>
      <el-aside :width="isCollapse ? '64px' : '200px'" >
        <!-- 切换菜单折叠和显示 -->
        <div class="toggle-button" @click="isCollapse = !isCollapse">
          |||
        </div>
        <el-menu
            :default-active="$route.path"
            unique-opened
            router
            :collapse="isCollapse"
            :collapse-transition="false"
        >
          <el-submenu :index="item.id + ''" v-for="item in menuList" :key="item.id">
            <template slot="title">
              <i :class="menuIcon[item.id]"></i>
              <span>{{ item.authName }}</span>
            </template>
            <el-menu-item :index="'/' + subItem.path" v-for="subItem in item.children" :key="subItem.id">
              <i class="el-icon-menu"></i>
              {{ subItem.authName }}
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  name: "Home",
  data() {
    return {
      userInfo: null,
      menuList: [],
      menuIcon: {
        '201': 'iconfont icon-shouye',
        '125': 'iconfont icon-users',
        '103': 'iconfont icon-tijikongjian',
        '101': 'iconfont icon-shangpin',
        '102': 'iconfont icon-danju',
      },
      // 控制折叠菜单
      isCollapse: false
    }
  },
  created() {
    this.userInfo = JSON.parse(sessionStorage.getItem("userInfo"))
    this.getMenuList()
  },
  methods: {
    signUp() {
      this.$confirm('是否退出登录?', '提示', {
        confirmButtonText: '退出',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        sessionStorage.clear()
        this.$router.push('login')
        this.$message({
          type: 'success',
          message: '退出成功!'
        });
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消退出'
        });
      });
    },
    // 获取左侧菜单列表
    async getMenuList() {
      const {data: res} = await this.$http.get('menus')
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      this.menuList = res.data
      // console.log(this.menuList)
    }
  }
}
</script>

<style lang="less" scoped>

</style>
