<template>
  <div>
    <hooper group="group1">
      <slide> slide 1 </slide>
      <slide> slide 2 </slide>
      <slide> slide 3 </slide>
      <slide> slide 4 </slide>
      <slide> slide 5 </slide>
      <slide> slide 6 </slide>
    </hooper>

    <hooper group="group1" :itemsToShow="3" :centerMode="true">
      <slide> slide 1 </slide>
      <slide> slide 2 </slide>
      <slide> slide 3 </slide>
      <slide> slide 4 </slide>
      <slide> slide 5 </slide>
      <slide> slide 6 </slide>

      <hooper-navigation slot="hooper-addons"></hooper-navigation>
      <hooper-pagination slot="hooper-addons"></hooper-pagination>
    </hooper>
  </div>
</template>
<script>
/**
 * https://madewith.cn/640
 * https://baianat.github.io/hooper/
 * npm i hooper
 */
import {
  Hooper,
  Slide,
  Navigation as HooperNavigation,
  Progress as HooperProgress,
  Pagination as HooperPagination
} from "hooper";
import "hooper/dist/hooper.css";

export default {
  components: {
    Hooper,
    Slide,
    HooperNavigation,
    HooperProgress,
    HooperPagination
  },
  data() {
    return {};
  },
  mounted() {}
};
</script>
<style lang="less" scoped>
.hooper2 {
  width: 400px;
  height: 200px;
  margin: 200px;
  background: #eee;
}
</style>
