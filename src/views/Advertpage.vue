<template>
  <div class="advert">
    <div class="text">
      <!-- 广告页advertpage.vue -->
      <button @click="goHome">跳过{{ num }}S</button>
    </div>

    <img src="../assets/advert.png" alt="" />
  </div>
</template>

<script>
export default {
  data() {
    return {
      num: 3,
      cleardata: null
    };
  },
  methods: {
    goHome() {
      this.$router.push("/home"); //跳转首页
    }
  },
  created() {
    // 倒计时
    this.cleardata = setInterval(() => {
      if (this.num == 0) {
        // 跳转首页
        this.$router.push("/home"); //跳转首页
        clearInterval(this.cleardata);
      } else {
        this.num--;
      }
    }, 1000);
  }
};
</script>

<style lang="less" scoped>
::-webkit-scrollbar {
  display: none;
}
.app {
  padding: 0;
}
.advert {
  height: 100%;
  overflow: hidden;
  .text {
    text-align: center;
    background-color: #f0fbff;
    position: absolute;
    font-size: 13px;
    top: 1%;
    right: 1%;
    button {
      border: none;
      outline: none;
      background-color: #f0fbff;
    }
  }

  img {
    width: 100%;
  }
}
</style>
