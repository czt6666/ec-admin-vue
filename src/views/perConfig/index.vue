<template>
    <div v-if="isIE8">
        <div class="ie8-compatibility">
            <h1>IE8 兼容性提示</h1>
            <p>您的浏览器为IE8，请确保您使用的是最新版本的浏览器，并考虑升级到其他浏览器。</p>
        </div>
    </div>
    <div v-else>
        <h1>正常显示</h1>
    </div>
</template>

<script>
export default {
    data() {
        return {
            isIE8: false
        };
    },
    mounted() {
        if (/msie 8/i.test(navigator.userAgent)) {
            this.isIE8 = true;
        }
    }
};
</script>

<style>
.ie8-compatibility {
    background-color: #f0f0f0;
    padding: 20px;
    text-align: center;
}
</style>
  