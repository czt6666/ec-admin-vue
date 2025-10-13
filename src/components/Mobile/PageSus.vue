<template>

</template>

<style module>
.pageSus {
  position: fixed;
  width: 200px;
  height: 100px;
  background-color: red;
  z-index: 999;
  bottom: 200px;
}
</style>

<script>
export default {
  name: 'PageSus',
  data() {
    return {
      pageSus: null
    }
  },
  mounted() {
    this.init();
  },
  beforeDestroy() {
    this.destroy()
  },
  methods: {
    init() {
      this.pageSus = document.createElement("div");
      document.body.appendChild(this.pageSus);
      this.pageSus.classList.add("pageSus")
    },
    destroy() {
      document.body.removeChild(this.pageSus);
      this.pageSus = null;
    }
  }
}
</script>
