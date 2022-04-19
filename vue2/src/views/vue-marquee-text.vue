<template>
  <div>
    <!--简单字幕文字 -->
    <marquee-text>
      Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy
      eirmod tempor invidunt ut labore et dolore magna.
    </marquee-text>

    <!-- 重复短语字幕 -->
    <marquee-text :repeat="10"> Short text =( </marquee-text>

    <!-- 滚动时间 -->
    <marquee-text :duration="30">
      Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy
      eirmod tempor invidunt ut labore et dolore magna.
    </marquee-text>
  </div>
</template>
<script>
//
/**
 * https://madewith.cn/604
 * https://github.com/EvodiaAut/vue-marquee-text-component
 * npm i vue-marquee-text-component@1.2.0
 * 注意：vue3 和 vue2 需用不同版本，vue2使用1.x
 */
import MarqueeText from "vue-marquee-text-component";
export default {
  components: {
    MarqueeText
  },
  data() {
    return {};
  },
  mounted() {}
};
</script>
