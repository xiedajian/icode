<template>
  <div>
    <div class="menu-test">
      <!--"middle"类型, 四个子菜单，动画引入animate.css库，白色遮罩，圆形自定义开关按钮，默认菜单颜色配置-->
      <!-- type String 必填项,指明菜单的类型,有6种：top,bottom,left,right,middle,middle-around -->
      <circle-menu
        type="middle-around"
        :number="4"
        animate="animated jello"
        mask="white"
        circle
      >
        <button type="button" slot="item_btn">O</button>
        <a slot="item_1" class="fa fa-twitter fa-lg">A</a>
        <a slot="item_2" class="fa fa-weixin fa-lg">B</a>
        <a slot="item_3" class="fa fa-weibo fa-lg">C</a>
        <a slot="item_4" class="fa fa-github fa-lg">D</a>
      </circle-menu>
    </div>
  </div>
</template>
<script>
/**
 * https://madewith.cn/630
 * npm i vue-circle-menu
 */
import CircleMenu from "vue-circle-menu";
export default {
  components: {
    CircleMenu
  },
  data() {
    return {};
  },
  mounted() {}
};
</script>
<style lang="less" scoped>
.menu-test {
  width: 200px;
  height: 200px;
  margin-top: 200px;
}
</style>
