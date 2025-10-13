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
    path: '/admin/subject',
    component: Layout,
    redirect: '/admin/subject/news',
    name: 'ECadminSubject',
    meta: { title: '产业主体管理', icon: 'table' },
    children: [
      {
        path: 'news',
        name: '乡村宣传',
        component: _import('subject/news'),
        meta: { title: '乡村宣传', icon: 'user' },
        menu: 'user'
      },
      {
        path: 'homestay',
        name: '民宿经营',
        component: _import('subject/homestay'),
        meta: { title: '民宿经营', icon: 'password' },
        menu: 'role'
      },
    ]
  },
  {
    path: '/admin/resource',
    component: Layout,
    redirect: '/admin/resource/homestay',
    name: 'ECadminResource',
    meta: { title: '产业资源管理', icon: 'table' },
    children: [
      {
        path: 'homestay',
        name: '康养民宿',
        component: _import('resource/homestay'),
        meta: { title: '康养民宿', icon: 'user' },
        menu: 'user'
      },
      {
        path: 'pension',
        name: '养老驿站',
        component: _import('resource/pension'),
        meta: { title: '养老驿站', icon: 'password' },
        menu: 'role'
      },
    ]
  },
  {
    path: '/admin/store',
    component: Layout,
    redirect: '/admin/store/homestay',
    name: 'ECadminStore',
    meta: { title: '产业资源管理', icon: 'table' },
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
