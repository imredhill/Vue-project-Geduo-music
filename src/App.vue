<template>
  <div id="app" @touchstart="touchstart" @touchend="touchend">
    <!-- 一级路由出口 -->
    <transition name="out-in" enter-active-class="animated fadeIn">
      <keep-alive>
        <router-view
          @tanslate-song="currentSong = $event"
          :currentSong="currentSong"
        ></router-view>
      </keep-alive>
    </transition>
    <!-- 播放器 边栏 -->
    <PlayBar
      @tanslate-song="currentSong = $event"
      v-if="currentSong"
      :currentSong="currentSong"
    ></PlayBar>
  </div>
</template>
<script>
import PlayBar from "@/components/PlayBar";

export default {
  components: {
    PlayBar
  },
  data() {
    return {
      currentSong: null,
      touchstartX: 0
    };
  },

  methods: {
    touchstart(event) {
      // console.log("开始", event.changedTouches[0].clientX);
      this.touchstartX = event.changedTouches[0].clientX;
      this.touchstartY = event.changedTouches[0].clientY;
    },
    touchend(event) {
      // console.log("结束", event.changedTouches[0].clientX);

      // 判断左滑动 返回上一页
      if (event.changedTouches[0].clientX - this.touchstartX > 100) {
        if (this.$store.state.slide == true) {
          return;
        }
        this.touchstartX = 0;
        this.touchstartY = 0;
        this.$router.go(-1);
      }

      if (event.changedTouches[0].clientX - this.touchstartX < -100) {
        if (this.$store.state.slide == true) {
          return;
        }
        this.touchstartX = 0;
        this.touchstartY = 0;
        this.$router.go(-1);
      }
    }
  },
  mounted() {
    // 使用 popstate 事件进行监听返回、后退、上一页操作。
    history.pushState(null, null, document.URL);
    window.addEventListener("popstate", function() {
      history.pushState(null, null, document.URL);
    });
  }
};
</script>
<style lang="less" scoped>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  // padding:5px 5px 20px;
}
</style>
