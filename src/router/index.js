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
          icon: '/static/icons/png/viewpageicon.png'
        },
        // menu: "config"
      }
    ]
  },
  {
    path: '/admin/village',
    component: Layout,
    redirect: '/admin/village/subject',
    name: 'ECadminVillage',
    meta: { title: '乡村宣传', icon: 'map' },
    children: [
      {
        path: 'subject',
        name: '实时资讯',
        component: _import('village/ActualTimeSubject'),
        meta: { title: '实时资讯', icon: 'document' },
        menu: 'user'
      },
       {
        path: 'subject2',
        name: '常态新闻',
        component: _import('village/subject'),
        meta: { title: '常态新闻', icon: 'document' },
        menu: 'user'
      },
      {
        path: 'list',
        name: '村庄列表',
        component: _import('village/list'),
        meta: { title: '村庄列表', icon: 'list' },
        menu: 'user'
      },
      {
        path: 'news',
        name: '主题管理',
        component: _import('village/news'),
        meta: { title: '主题管理', icon: 'tag' },
        menu: 'user'
      },
    ]
  },
  {
    path: '/admin/homestay',
    component: Layout,
    redirect: '/admin/homestay/subject',
    name: 'ECadminHomestay',
    meta: { title: '民宿经营', icon: 'hotel' },
    children: [
      {
        path: 'list',
        name: '民宿经营',
        component: _import('homestay/index'),
        meta: { title: '民宿经营', icon: 'list' },
        menu: 'user'
      },

    ]
  },
  {
    path: '/admin/tourism',
    component: Layout,
    redirect: '/admin/tourism/company',
    name: 'ECadminTourism',
    meta: { title: '旅游经营', icon: 'travel' },
    children: [
      {
        path: 'company',
        name: '旅游公司管理',
        component: _import('tourism/company'), // 新路径
        meta: { title: '旅游公司管理', icon: 'business' },
        menu: 'tourCompany'
      },
      {
        path: 'route',
        name: '线路管理',
        component: _import('tourism/route'), // 新路径
        meta: { title: '线路管理', icon: 'map' },
        menu: 'tourRoute'
      },
      // 可选：线路类型、线路主题的字典页
      {
        path: 'route-type',
        name: '线路类型管理',
        component: _import('tourism/type'),
        meta: { title: '线路类型管理', icon: 'tag' },
        menu: 'tourCompany'
      },
      {
        path: 'route-theme',
        name: '线路主题管理',
        component: _import('tourism/theme'),
        meta: { title: '线路主题管理', icon: 'tag' },
        menu: 'tourCompany'
      }
    ]
  },
  {
    path: '/admin/study',
    component: Layout,
    redirect: '/admin/study/tourBase',
    name: 'ECadminStudy',
    meta: { title: '研学基地', icon: 'study' },
    children: [
      {
        path: 'tourBase',
        name: '研学基地管理',
        component: _import('study/tourBase'),
        meta: { title: '研学基地管理', icon: 'education' },
        menu: 'user'
      },
      {
        path: 'tourType',
        name: '研学类型管理',
        component: _import('study/tourType'),
        meta: { title: '研学类型管理', icon: 'tag' },
        menu: 'user'
      },
      {
        path: 'tourPlan',
        name: '研学方案管理',
        component: _import('study/tourPlan'),
        meta: { title: '研学方案管理', icon: 'document' },
        menu: 'user'
      },
      {
        path: 'tourActivity',
        name: '研学活动管理',
        component: _import('study/tourActivity'),
        meta: { title: '研学活动管理', icon: 'activity' },
        menu: 'user'
      },
    ]
  },
  {
    path: '/admin/elderlyCare',
    component: Layout,
    redirect: '/admin/elderlyCare/serviceMode',
    name: 'ECadmineElderlyCare',
    meta: { title: '养老经营', icon: 'pension' },
    children: [
      {
        path: 'serviceMode',
        name: '养老模式管理',
        component: _import('elderlyCare/serviceMode'),
        meta: { title: '养老模式管理', icon: 'heart' },
        menu: 'station'
      },
      {
        path: 'subjectType',
        name: '养老驿站类型管理',
        component: _import('elderlyCare/subjectType/index'),
        meta: { title: '养老驿站类型管理', icon: 'tag' },
        menu: 'station'
      },
      {
        path: 'subject',
        name: '养老驿站管理',
        component: _import('elderlyCare/subject'),
        meta: { title: '养老驿站管理', icon: 'heart' },
        menu: 'station'
      },
    ]
  },
  {
    path: '/admin/products',
    component: Layout,
    redirect: '/admin/products/subject',
    name: 'ECadmineProduction',
    meta: { title: '农产品销售', icon: 'food' },
    children: [
      {
        path: 'subject',
        name: '商品管理',
        component: _import('products/subject'),
        meta: { title: '商品管理', icon: 'document' },
        menu: 'product'
      },
      {
        path: 'shop',
        name: '店铺管理',
        component: _import('products/shop'),
        meta: { title: '店铺管理', icon: 'business' },
        menu: 'shop'
      },
    ]
  },
  {
    path: '/admin/restaurant',
    component: Layout,
    redirect: '/admin/restaurant/subject',
    name: 'ECadmineRestaurant',
    meta: { title: '餐饮销售', icon: 'food' },
    children: [
      {
        path: 'subject',
        name: '门店管理',
        component: _import('restaurant/subject'),
        meta: { title: '门店管理', icon: 'business' },
        menu: 'restaurant'
      },
      {
        path: 'business',
        name: '商业经营管理',
        component: _import('restaurant/business'),
        meta: { title: '商业经营管理', icon: 'business' },
        menu: 'dish'
      },
      {
        path: 'dishCategory',
        name: '菜品分类管理',
        component: _import('restaurant/dishCategory'),
        meta: { title: '菜品分类管理', icon: 'tag' },
        menu: 'dishCategory'
      }
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
        meta: { title: '数据汇聚管理', icon: 'document' },
        menu: 'user'
      },
      {
        path: 'monitor',
        name: '各类型热度分析',
        component: _import('store/monitor'),
        meta: { title: '各类型热度分析', icon: 'monitor' },
        menu: 'role'
      },
    ]
  },
  {
    path: '/admin/user',
    component: Layout,
    redirect: '/admin/user/index',
    name: 'adminManage',
    meta: { title: '系统用户管理', icon: 'user' },
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
        meta: { title: '权限管理', icon: 'setting' },
        menu: 'role'
      },
      {
        path: "log",
        name: "登录日志",
        component: _import("authlog/index"),
        meta: { title: "登录日志", icon: "document" },
        menu: "log"
      },
      {
        path: "operatelog",
        name: "操作日志",
        component: _import("operatelog/index"),
        meta: { title: "操作日志", icon: "document" },
        menu: "operateLog"
      },
      // {
      //   path: 'sysmonitor',   // hyjnew ofdviewer --> viewer
      //   component: () => import('@/views/sysMonitor/sysMonitor.vue'),
      //   name: 'sysMonitor',
      //   props: true,
      //   meta: {
      //     keepAlive: true,
      //     title: '监控详情',
      //     icon:"monitor"
      //   },
      //   menu: 'log',
      // },
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
