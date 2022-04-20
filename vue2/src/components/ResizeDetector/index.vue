<template>
  <div>
    <slot></slot>
  </div>
</template>

<script>
import { addListener, removeListener } from "resize-detector";
import debounce from "lodash/debounce";
export default {
  name: "resize-detector",
  computed: {
    resizeObserver() {
      return this.$listeners.resize && this.$el;
    }
  },
  methods: {
    resize() {
      this.$emit("resize", {
        width: this.$el.clientWidth,
        height: this.$el.clientHeight
      });
    }
  },
  mounted() {
    if (this.resizeObserver) {
      this.__resizeHandler = debounce(
        () => {
          this.resize();
        },
        200,
        { leading: true }
      );
      addListener(this.$el, this.__resizeHandler);
    }
  },
  beforeDestroy() {
    if (this.resizeObserver) {
      removeListener(this.$el, this.__resizeHandler);
    }
  }
};
</script>
