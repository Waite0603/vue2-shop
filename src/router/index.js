import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login.vue'

Vue.use(VueRouter)

const routes = [
    {
        path: '/',
        redirect: '/login'
    },
    {
        path: '/login',
        component: Login
    },
    {
        path: '/home',
        component: () => import('../components/Home.vue'),
        redirect: '/welcome',
        children: [
            {
                path: '/welcome',
                component: () => import('../components/home/Welcome')
            },
            {
                path: '/users',
                component: () => import('../components/user/Users.vue')
            },
        ]
    }
]

const router = new VueRouter({
    routes
})

// 配置路由守卫
router.beforeEach((to, from, next) => {
    if (to.path === '/login') {
        return next()
    } else {
        const userInfo = JSON.parse(sessionStorage.getItem('userInfo'))
        if (!userInfo) {
            return next('/login')
        }
        next()
    }
})
export default router
