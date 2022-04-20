<template>
  <!-- <div class="echarts-box" @resize="resize"></div> -->

  <!-- 监听容器变化，触发resize  -->
  <resize-detector class="echarts-box" @resize="resize"></resize-detector>
</template>

<script>
import * as Echarts from "./echarts.min.js";
// import * as Echarts from "echarts";
import ResizeDetector from "../ResizeDetector";

export default {
  components: {
    ResizeDetector
  },
  props: {
    option: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      myChart: {}
    };
  },
  watch: {
    option: {
      deep: true,
      handler(v) {
        this.setOption(v);
      }
    }
  },
  created() {
    this.$nextTick(() => {
      this.initEchart();
    });
  },
  methods: {
    resize(e) {
      console.log(e);
      this.myChart.resize && this.myChart.resize();
    },
    initEchart() {
      //   debugger;
      this.myChart = Echarts.init(this.$el);
      //   this.myChart.setOption(this.option);
      this.setOption();
    },
    setOption() {
      //   debugger;
      this.myChart.setOption(this.option);
    }
  }
};
</script>
<style scoped>
.echarts-box {
  width: 100%;
  height: 100%;
}
</style>
