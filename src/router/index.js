import Vue from 'vue'
import Router from 'vue-router'
// in development env not use Lazy Loading,because Lazy Loading too many pages will cause webpack hot update too slow.so only in production use Lazy Loading
/* layout */
import Layout from '../views/layout/Layout'

const _import = require('./_import_' + process.env.NODE_ENV)
Vue.use(Router)
export const constantRouterMap = [
  // 设置默认首页
  { path: '/', redirect: '/admin/home/homepage', hidden: true },
  { path: '/404', component: _import('404'), hidden: true },
  {
    path: '/login',
    component: () => import('../views/login/index.vue'),
    name: 'login',
    meta: {
      title: '登录'
    }
  },
  // { path: '*', redirect: '/404', hidden: true }
]

export const asyncRouterMap = [
  {
    path: '/admin',
    name: 'adminIndex',
    redirect: '/admin/user',
    hidden: true
  },
  {
    path: "/admin/home",
    component: Layout,
    name: "home",
    redirect: "/admin/homepage",
    children: [
      {
        path: "homepage",
        name: "首页",
        component: () => import("@/views/homepage/homepage.vue"),
        meta: {
          title: "首页",
          icon: 'table'
        },
        // menu: "config"
      }
    ]
  },
  {
    path: '/admin/village',
    component: Layout,
    redirect: '/admin/village/subject/list',
    name: 'ECadminVillage',
    meta: { title: '乡村宣传', icon: 'table' },
    children: [
      {
            path: 'list',
            name: '村庄列表',
            component: _import('village/index'), // 你之前的分页页面：src/views/village/index.vue
            meta: { title: '村庄列表', icon: 'user' }
      },
      {
        path: 'news',
        name: '主题管理',
        component: _import('village/news'),
        meta: { title: '主题管理', icon: 'password' },
        menu: 'role'
      },
    ]
  },
  {
    path: '/admin/homestay',
    component: Layout,
    redirect: '/admin/homestay/subject',
    name: 'ECadminHomestay',
    meta: { title: '民宿经营', icon: 'table' },
    children: [
      {
        path: 'subject',
        name: '主体信息管理',
        component: _import('homestay/subject'),
        meta: { title: '主体信息管理', icon: 'user' },
        menu: 'user'
      },
      {
        path: 'business',
        name: '商业经营管理',
        component: _import('homestay/business'),
        meta: { title: '商业经营管理', icon: 'password' },
        menu: 'role'
      },
    ]
  },
  {
    path: '/admin/tourism',
    component: Layout,
    redirect: '/admin/tourism/subject',
    name: 'ECadminTourism',
    meta: { title: '旅游经营', icon: 'table' },
    children: [
      {
        path: 'subject',
        name: '主体信息管理',
        component: _import('tourism/subject'),
        meta: { title: '主体信息管理', icon: 'user' },
        menu: 'user'
      },
      {
        path: 'business',
        name: '商业经营管理',
        component: _import('tourism/business'),
        meta: { title: '商业经营管理', icon: 'password' },
        menu: 'role'
      },
    ]
  },
  {
    path: '/admin/study',
    component: Layout,
    redirect: '/admin/study/subject',
    name: 'ECadminStudy',
    meta: { title: '研学基地', icon: 'table' },
    children: [
      {
        path: 'subject',
        name: '主体信息管理',
        component: _import('study/subject'),
        meta: { title: '主体信息管理', icon: 'user' },
        menu: 'user'
      },
      {
        path: 'business',
        name: '商业经营管理',
        component: _import('study/business'),
        meta: { title: '商业经营管理', icon: 'password' },
        menu: 'role'
      },
    ]
  },
  {
    path: '/admin/elderlyCare',
    component: Layout,
    redirect: '/admin/elderlyCare/subject',
    name: 'ECadmineElderlyCare',
    meta: { title: '养老经营', icon: 'table' },
    children: [
      {
        path: 'subject',
        name: '主体信息管理',
        component: _import('elderlyCare/subject'),
        meta: { title: '主体信息管理', icon: 'user' },
        menu: 'user'
      },
      {
        path: 'business',
        name: '商业经营管理',
        component: _import('elderlyCare/business'),
        meta: { title: '商业经营管理', icon: 'password' },
        menu: 'role'
      },
    ]
  },
  {
    path: '/admin/products',
    component: Layout,
    redirect: '/admin/products/subject',
    name: 'ECadmineProduction',
    meta: { title: '农产品销售', icon: 'table' },
    children: [
      {
        path: 'subject',
        name: '主体信息管理',
        component: _import('products/subject'),
        meta: { title: '主体信息管理', icon: 'user' },
        menu: 'user'
      },
      {
        path: 'business',
        name: '商业经营管理',
        component: _import('products/business'),
        meta: { title: '商业经营管理', icon: 'password' },
        menu: 'role'
      },
    ]
  },
  {
    path: '/admin/restaurant',
    component: Layout,
    redirect: '/admin/restaurant/subject',
    name: 'ECadmineRestaurant',
    meta: { title: '餐饮销售', icon: 'table' },
    children: [
      {
        path: 'subject',
        name: '主体信息管理',
        component: _import('restaurant/subject'),
        meta: { title: '主体信息管理', icon: 'user' },
        menu: 'user'
      },
      {
        path: 'business',
        name: '商业经营管理',
        component: _import('restaurant/business'),
        meta: { title: '商业经营管理', icon: 'password' },
        menu: 'role'
      },
    ]
  },
  {
    path: '/admin/store',
    component: Layout,
    redirect: '/admin/store/data',
    name: 'ECadminStore',
    meta: { title: '产业数智仓库', icon: 'table' },
    children: [
      {
        path: 'data',
        name: '数据汇聚管理',
        component: _import('store/data'),
        meta: { title: '数据汇聚管理', icon: 'user' },
        menu: 'user'
      },
      {
        path: 'monitor',
        name: '产业驾驶舱',
        component: _import('store/monitor'),
        meta: { title: '产业驾驶舱', icon: 'password' },
        menu: 'role'
      },
    ]
  },
  {
    path: '/admin/user',
    component: Layout,
    redirect: '/admin/user/index',
    name: 'adminManage',
    meta: { title: '系统用户管理', icon: 'table' },
    children: [
      {
        path: 'index',
        name: '用户管理',
        component: _import('user/user'),
        meta: { title: '用户管理', icon: 'user' },
        menu: 'user'
      },
      {
        path: 'role',
        name: '权限管理',
        component: _import('user/role'),
        meta: { title: '权限管理', icon: 'password' },
        menu: 'role'
      },
      {
        path: "log",
        name: "登录日志",
        component: _import("authlog/index"),
        meta: { title: "登录日志", icon: "user" },
        menu: "log"
      },
      {
        path: "operatelog",
        name: "操作日志",
        component: _import("operatelog/index"),
        meta: { title: "操作日志", icon: "password" },
        menu: "log"
      },
      {
        path: 'sysmonitor',   // hyjnew ofdviewer --> viewer
        component: () => import('@/views/sysMonitor/sysMonitor.vue'),
        name: 'sysMonitor',
        props: true,
        meta: {
          keepAlive: true,
          title: '监控详情',
          icon:"monitor"
        },
        menu: 'log',
      },
    ]
  },
  // { path: '*', redirect: '/404', hidden: true }
]

export const asyncConstRouterMap = [
 {
    path: '/admin',
    name: 'adminIndex',
    redirect: '/admin/user',
    hidden: true
  },
  { path: '*', redirect: '/404', hidden: true }
]

const router = new Router({
  // mode: 'history', //后端支持可开
  base: 'ecadmin',
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRouterMap
})
export default router
