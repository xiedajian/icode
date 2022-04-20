import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'

Vue.use(VueRouter)

let navs = [
  'photo-sphere-viewer',
  'vue-marquee-text',
  'vue-swing',
  'vue-moveable',
  'vue-grid-layout',
  'vue-smart-widget',
  'vue-circle-menu',
  'vue-feedback-reaction',
  'hooper',
  'resize-detector',
  'echarts',
]

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('../views/About.vue')
  },
  ...navs.map(v => {
    return {
      path: `/${v}`,
      component: () => import(`../views/${v}.vue`)
    }
  })
]



const router = new VueRouter({
  routes
})

export default router
export {navs}
