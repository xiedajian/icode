<template>
  <div>
    <!-- 单独使用 -->
    <smart-widget title="Default Widget">
      <p>It's default widget.</p>
    </smart-widget>

    <!-- 与 vue-grid-layout 一起使用 -->
    <smart-widget-grid :layout="layout">
      <smart-widget slot="0" simple>
        <div class="layout-center">
          <h3>Simple Widget Without Header</h3>
        </div>
      </smart-widget>
      <smart-widget slot="1" title="Default Widget">
        <div class="layout-center">
          <h3>Default Widget With Header</h3>
        </div>
      </smart-widget>
      <smart-widget slot="2" title="Full Screen" fullscreen>
        <div class="layout-center">
          <h3>Make any widget full screen</h3>
        </div>
      </smart-widget>
    </smart-widget-grid>
  </div>
</template>
<script>
/**
 * https://madewith.cn/742
 * https://xiaoluoboding.github.io/vue-smart-widget/#/home
 * npm i vue-smart-widget
 * Vue.use(VueSmartWidget)
 * 使用 SmartWidgetGrid 依赖 vue-grid-layout
 */
export default {
  components: {},
  data() {
    return {
      layout: [
        { x: 0, y: 0, w: 4, h: 4, i: "0" },
        { x: 4, y: 0, w: 4, h: 4, i: "1" },
        { x: 8, y: 0, w: 4, h: 4, i: "2" }
      ]
    };
  },
  mounted() {}
};
</script>
