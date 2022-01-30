<template>
  <div>
    <!-- 导航栏 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
      <el-alert
          title="添加商品信息"
          type="info"
          show-icon
          :closable="false"
          center
      ></el-alert>

      <el-steps :active="activeIndex - 0" finish-status="success" align-center :space="200">
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>

      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-position="top">
        <el-tabs v-model="activeIndex" tab-position="left" :before-leave="beforeTabLeave" @tab-click="tabClicked">
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-row>
              <el-col :span="11">
                <el-form-item label="商品价格" prop="goods_price">
                  <el-input v-model.number="addForm.goods_price" type="number"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="2">
                &nbsp;
              </el-col>
              <el-col :span="11">
                <el-form-item label="商品重量" prop="goods_weight">
                  <el-input v-model.number="addForm.goods_weight" type="number"></el-input>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="11">
                <el-form-item label="商品数量" prop="goods_number">
                  <el-input v-model.number="addForm.goods_number" type="number"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="2">
                &nbsp;
              </el-col>
              <el-col :span="11">
                <el-form-item label="商品分类">
                  <el-cascader v-model="addForm.goods_cat" :options="cateList" :props="{
                label: 'cat_name', value: 'cat_id', children: 'children', expandTrigger: 'hover',}"
                               @change="handleChange" style="width: 100%"></el-cascader>
                </el-form-item>
              </el-col>
            </el-row>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <el-form-item v-for="item in manyData" :key="item.attr_id" :label="item.attr_name">
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox v-for="(value, i) in item.attr_vals" :key="i" :label="value" border
                             style="margin-right: 10px"></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item v-for="item in onlyData" :key="item.attr_id" :label="item.attr_name">
              <el-input v-model="item.attr_vals">
              </el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <!-- action 指定图片要上传的后台 api 地址-->
            <el-upload
                :action="uploadURL"
                :on-preview="handlePreview"
                :on-remove="handleRemove"
                list-type="picture"
                :headers="headerObj"
                :on-success="handleSuccess">
              <el-button size="small" type="primary">点击上传</el-button>
              <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <quill-editor v-model="addForm.goods_introduce"/>
            <!-- 添加按钮 -->
            <el-button type="primary" style="margin-top: 10px" class="btn-add" @click="addGoods()">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>

      <!-- 图片预览 -->
      <el-dialog title="图片预览" :visible.sync="previewVisible" width="50%">
        <img :src="previewPath" class="preview-img" style="width: 100%"/>
      </el-dialog>

    </el-card>
  </div>
</template>

<script>
import _ from 'lodash'
export default {
  name: "Add",
  data() {
    return {
      activeIndex: '0',
      addForm: {
        goods_name: '',
        goods_price: null,
        goods_weight: null,
        goods_number: null,
        // 商品所属分类的数组
        goods_cat: [],
        pics: [],
        goods_introduce: '',
        attrs: []
      },
      addFormRules: {
        goods_name: [{required: true, message: '请输入商品名称', trigger: 'blur'}],
        goods_price: [{required: true, message: '请输入商品价格', trigger: 'blur'}],
        goods_weight: [{required: true, message: '请输入商品重量', trigger: 'blur'}],
        goods_number: [{required: true, message: '请输入商品数量', trigger: 'blur'}],
      },
      cateList: [],
      manyData: [],
      onlyData: [],
      // 上传图片的URL地址
      uploadURL: 'http://www.tangxiaoyang.vip:8888/api/v2/upload',
      // 文件上传时的请求头
      headerObj: {
        Authorization: JSON.parse(sessionStorage.getItem('userInfo')).data.token,
      },
      previewVisible: false,
      previewPath: ''
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    async getCateList() {
      const {data: res} = await this.$http.get('categories')
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类失败')
      }
      this.cateList = res.data
    },
    // 监听级联选择器的改变事件
    handleChange() {
      if (this.addForm.goods_cat.length !== 3) {
        this.addForm.goods_cat = []
      }
    },
    beforeTabLeave() {
      if (this.addForm.goods_cat.length !== 3) {
        this.$message.error("请选择商品分类")
        return false
      }
    },
    async tabClicked() {
      // 判断是动态参数还是静态属性
      if (this.activeIndex === '1') {
        const {data: res} = await this.$http.get(`categories/${this.cateId}/attributes`, {
          params: {sel: 'many'},
        })
        if (res.meta.status !== 200) return this.$message.error('获取动态参数失败')
        res.data.forEach((item) => {
          item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
        })
        this.manyData = res.data
      } else if (this.activeIndex === '2') {
        const {data: res} = await this.$http.get(`categories/${this.cateId}/attributes`, {
          params: {sel: 'only'},
        })
        if (res.meta.status !== 200) return this.$message.error('获取动态属性失败')
        this.onlyData = res.data
      }
    },

    // 预览图片
    handlePreview(file) {
      console.log(file)
      this.previewPath = file.url
      this.previewVisible = true
      console.log(this.addForm)
    },
    // 移除图片
    handleRemove(file) {
      // 1.获取将要删除的图片的临时路径
      const filePath = file.response.data.tmp_path
      // 2.从pics数组中，找到这个图片对应的索引值
      const i = this.addForm.pics.findIndex((item) => {
        item.pic === filePath
      })
      // 3.从pics数组中移除
      this.addForm.pics.splice(i, 1)
    },
    // 监听图片上传成功
    handleSuccess(response) {
      this.addForm.pics.push({
        pic: response.data.tmp_path,
      })
    },
    // 添加商品
    addGoods(){
      this.$refs.addFormRef.validate(async valid => {
        if(!valid){
          return
        }

        /**
         *  准备请求前的数据
         */
        // 处理商品所属分类的数据
        // this.addForm.goods_cat = this.addForm.goods_cat.join(',') // 会导致级联选择器关联的goods_cat发生异常
        // const form = this.addForm // 浅拷贝
        // 使用lodash工具
        const form = _.cloneDeep(this.addForm) // 深拷贝
        form.goods_cat = form.goods_cat.join(',')

        // 处理动态参数
        this.manyData.forEach(item => {
          form.attrs.push({
            attr_id: item.attr_id,
            attr_value: item.attr_vals.join(' ')
          })
        })

        // 处理静态属性
        this.onlyData.forEach(item => {
          form.attrs.push({
            attr_id: item.attr_id,
            attr_value: item.attr_vals
          })
        })

        /**
         *  发送请求，添加商品
         */
        const {data:res} = await this.$http.post('goods',form)
        if(res.meta.status !== 201){
          return this.$message.error('添加商品失败')
        }
        this.$message.success('添加商品成功！')
        await this.$router.push('/goods')
      })
    }
  },
  computed: {
    cateId() {
      return this.addForm.goods_cat.length === 3 ? this.addForm.goods_cat[2] : null
    }
  }
}
</script>

<style scoped lang="less">

</style>
