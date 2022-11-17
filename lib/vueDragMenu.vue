/*
 * @Author: aFei
 * @Date: 2022-11-17 14:27:47
*/
/*
 * @LastEditors: aFei
 * @LastEditTime: 2022-11-17 14:53:55
 */
<template>
  <div :class="['vue-drag-menu', cname]">1</div>
</template>
<script>
export default {
  name: "vueDragMenu",
  props: {
    cname: {
      // 自定义class
      type: String,
      default: "",
    },
  },
  data() {
    return {};
  },
  created() {},
  methods: {},
  watch: {},
};
</script>

<!--基础样式-->
<style>
@import "style/vueDragMenu.css";
</style>