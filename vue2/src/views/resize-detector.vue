<template>
  <resize-detector @resize="resize">
    {{size}}
  </resize-detector>
</template>

<script>

/**
 * resize-detector
 * 监听容器尺寸变化
 */


import ResizeDetector from "@/components/ResizeDetector";

export default {
  components: {
    ResizeDetector
  },
  data() {
    return {
      size:{}
    };
  },
  methods: {
    resize(e) {
      console.log(e)
      this.size = e
    }
  }
};
</script>
