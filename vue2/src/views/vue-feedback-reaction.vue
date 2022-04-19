<template>
  <div class="app">
    <vue-feedback-reaction v-model="feedback" />
  </div>
</template>
<script>
/**
 * https://madewith.cn/690
 * npm i vue-feedback-reaction
 */
import { VueFeedbackReaction } from "vue-feedback-reaction";

export default {
  components: {
    VueFeedbackReaction
  },
  data() {
    return {
      feedback: ""
    };
  }
};
</script>
