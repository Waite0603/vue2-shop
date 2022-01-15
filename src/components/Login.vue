<template>
  <div class="login-container">
    <div class="login-left">
      <img src="../assets/imgs/login_img.png">
    </div>

    <div class="login-form">
      <!--头像-->
      <div class="avatar-box">
        <img src="../assets/imgs/login_logo.png">
      </div>
      <div class="login-title">
        电商后台管理系统
      </div>
      <!--登录表单-->
      <el-form ref="loginFormRef" class="login-submit" :model="loginForm" :rules="loginRules">
        <el-form-item prop="username">
          <el-input placeholder="请输入用户名" v-model="loginForm.username">
            <i slot="prefix" class="iconfont icon-user"></i>
          </el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input placeholder="请输入密码" v-model="loginForm.password" show-password>
            <i slot="prefix" class="iconfont icon-lock_fill"></i>
          </el-input>
        </el-form-item>
        <el-button type="primary" class="login-button" @click="login">登录</el-button>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 表单数据绑定对象
      loginForm: {
        username: '',
        password: ''
      },
      // 表单校验规则
      loginRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 5, max: 15, message: '长度在 5 到 15 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    login(){
      // 对表单进行校验
      // async 用于申明一个 function 是异步的，而 await 用于等待一个异步方法执行完成。
      this.$refs.loginFormRef.validate(async valid => {
        if (!valid) return
        const res = await this.$http.post('/login', this.loginForm)
        // console.log(res)
        if (res.data.meta.status !==  200) {
          this.$message({
            showClose: true,
            message: res.data.meta.msg,
            type: 'error'
          });
        }
        else {
          this.$message.success("登录成功")
          // 将用户信息保存在 sessionStoreage, 字符串
          sessionStorage.setItem('userInfo', JSON.stringify(res.data))
          await this.$router.push('/home')
        }
      })
    }
  }
}
</script>

<style lang="less" scoped>

</style>
