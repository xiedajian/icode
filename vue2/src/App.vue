<template>
  <div id="app">
    <div id="nav">
      <router-link class="menu" to="/">Home</router-link>
      <router-link class="menu" to="/about">About</router-link>
      <router-link v-for="item in navs" :key="item" class="menu" :to="`/${item}`">{{item}}</router-link>
    </div>
    <router-view class="main" />
  </div>
</template>
<script>
import {navs} from './router'
export default {
  data() {
    return {
      navs: navs,
    };
  },
  mounted() {}
};
</script>
<style lang="less">
* {
  padding: 0;
  margin: 0;
}
html,
body {
  width: 100%;
  height: 100%;
}
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  height: 100%;
  display: flex;
  #nav {
    padding: 30px;
    flex: 0 0 200px;
    background: #a5caf0;
    color: #fff;
    display: flex;
    flex-direction: column;
    line-height: 1.5;
  }
  .main {
    flex: 1;
  }
}
</style>
