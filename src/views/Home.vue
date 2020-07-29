<template>
  <div>
    <HomeLink></HomeLink>
    <van-pull-refresh
      v-model="isLoading"
      success-text="刷新成功"
      @refresh="onRefresh"
    >
      <div class="home">
        <div class="loading" v-if="showLoading" @touchmove.prevent>
          <img src="../assets/loading.svg" alt />
        </div>

        <div class="personalized">
          <CardTitle style="margin-top:30px">推荐歌单</CardTitle>
          <ul class="songlist">
            <SongListCard
              v-for="(item, index) in randomPersonalizeds()"
              :key="index"
              :songList="item"
            ></SongListCard>
          </ul>
        </div>

        <div class="newsong">
          <CardTitle>推荐音乐</CardTitle>
          <ul>
            <SongItem
              v-for="(item, index) in newsongs"
              :key="index"
              :songItem="item"
              @tanslate-song="$emit('tanslate-song', $event)"
              :options="{ info: true, close: false }"
              :currentSong="currentSong"
            ></SongItem>
          </ul>
        </div>
      </div>
    </van-pull-refresh>
  </div>
</template>

<script>
import CardTitle from "@/components/CardTitle.vue";
import SongListCard from "@/components/SongListCard.vue";
import HomeLink from "@/components/HomeLink.vue";
import SongItem from "@/components/SongItem.vue";
import Vue from "vue";
import { Toast } from "vant";
import { PullRefresh } from "vant";

Vue.use(PullRefresh);
// npm install vue-prevent-browser-back --save
import preventBack from "vue-prevent-browser-back"; //歌曲下载

export default {
  mixins: [preventBack], //注入
  name: "Home",
  props: {
    currentSong: Object
  },
  data() {
    return {
      personalizeds: [],
      newsongs: [],
      showLoading: false,
      count: 0,
      isLoading: false
    };
  },
  components: {
    CardTitle,
    SongListCard,
    HomeLink,
    SongItem
  },
  methods: {
    //下拉刷新
    onRefresh() {
      setTimeout(() => {
        Toast("刷新成功");
        this.isLoading = false;
        this.count++;
      }, 500);
    },
    // 获取推荐歌单
    getPersonalized() {
      this.axios
        .get("/personalized")
        .then(response => {
          // 如果数据正确
          this.personalizeds = response.data.result;
          // 获取到的数据放入本地存储
          window.localStorage.setItem(
            "personalizeds",
            // 过期时间1小时
            JSON.stringify({
              expire: Date.now() + 1 * 60 * 60 * 1000,
              result: response.data.result
            })
          );
        })
        .catch(function(error) {
          console.log(error);
        });
    },
    //获取推荐音乐
    getNewSong() {
      this.axios
        .get("/personalized/newsong")
        .then(response => {
          // 如果数据正确
          // console.log(response);
          this.newsongs = response.data.result;
          // 获取到的数据放入本地存储
          window.localStorage.setItem(
            "newsongs",
            // 过期时间1小时
            JSON.stringify({
              expire: Date.now() + 1 * 60 * 60 * 1000,
              result: response.data.result
            })
          );
        })
        .catch(function(error) {
          console.log(error);
        });
    },

    // 取前六个推荐歌单
    randomPersonalizeds() {
      // 截取前六个
      return [...this.personalizeds].slice(0, 6);
    }
  },
  created() {
    // 每次创建组件都拿数据 太频繁 本地存储
    const cachePersonalizeds = JSON.parse(
      window.localStorage.getItem("personalizeds")
    );
    if (cachePersonalizeds && cachePersonalizeds.expire > Date.now()) {
      // 存在并且还没有过期
      this.personalizeds = cachePersonalizeds.result;
    } else {
      // 已经过期
      this.getPersonalized();
    }

    const cacheNewsongs = JSON.parse(window.localStorage.getItem("newsongs"));
    if (cacheNewsongs && cacheNewsongs.expire > Date.now()) {
      // 存在并且还没有过期
      this.newsongs = cacheNewsongs.result;
    } else {
      // 已经过期
      this.getNewSong();
    }
  },

  // 路由守卫
  beforeRouteEnter(to, from, next) {
    next(vm => {
      vm.showLoading = false;
    });
  },

  beforeRouteLeave(to, from, next) {
    // 导航离开该组件的对应路由时调用
    // 可以访问组件实例 `this`
    // console.log(to, from, "即将离开home");
    this.showLoading = true;
    next();
  }
};
</script>

<style lang="less" scoped>
.songlist {
  display: flex;
  flex-wrap: wrap;
}
.home {
  position: relative;
  padding: 20px 5px 20px;
}
.loading {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  z-index: 999;
  justify-content: center;
  align-items: center;
  img {
    width: 106px;
  }
}
</style>
