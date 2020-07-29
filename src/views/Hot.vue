<template>
  <div class="palylist">
    <div class="loading" v-if="showLoading">
      <img src="../assets/loading.svg" alt />
    </div>
    <HomeLink></HomeLink>
    <van-pull-refresh
      v-model="isLoading"
      success-text="刷新成功"
      @refresh="onRefresh"
    >
      <div class="bg">
        <img src="../assets/bgb.png" alt />
        <div class="text">
          <img src="../assets/index_icon_2x.png" alt />
        </div>
        <span>{{ updatetime() }}</span>
      </div>

      <div class="list">
        <ul>
          <transition-group
            name="out-in"
            enter-active-class="animated fadeInUp"
          >
            <li
              @click="getId(item.id, item)"
              class="box"
              v-for="(item, index) in randomsongList()"
              :key="'index' + item.id"
            >
              <div class="snum">{{ index + 1 }}</div>
              <div class="main">
                <h3
                  :class="{ active: currentSong && currentSong.id === item.id }"
                >
                  {{ item.name }}
                </h3>
                <div class="info">
                  <i class="icon icon-quality"></i>
                  <span class="ars">{{ joinArs(item.ar) }}</span>
                  -{{ item.al.name }}
                </div>
              </div>

              <img
                class="icon icon-play"
                style="background:none"
                v-if="currentSong && item.id === currentSong.id"
                src="../assets/playing.svg"
                alt
              />
              <i v-else class="icon icon-play"></i>
            </li>
          </transition-group>
        </ul>

        <div class="more" @click="more">
          <h3 style="color:#666666">
            点击加载更多<van-icon name="arrow-down" />
          </h3>
        </div>
      </div>
    </van-pull-refresh>
  </div>
</template>
<script>
import HomeLink from "@/components/HomeLink.vue";
import Vue from "vue";
import { Toast } from "vant";
import { PullRefresh } from "vant";
Vue.use(PullRefresh);
export default {
  props: {
    currentSong: Object
  },
  components: {
    HomeLink
  },
  data() {
    return {
      addmore: 0,
      songList: [],
      timestrr: 1,
      count: 0,
      isLoading: false,
      showLoading: false
    };
  },

  //点击增加30首
  methods: {
    more() {
      this.addmore += 1;
      if (this.addmore > 3) {
        this.addmore = 3;
        Toast("没有更多啦~");
      }
    },
    //下拉刷新
    onRefresh() {
      setTimeout(() => {
        Toast("刷新成功");
        this.isLoading = false;
        this.count++;
      }, 500);
    },
    //获取歌曲ID并往上传
    getId(id, item) {
      this.showLoading = true;
      if (this.$store.state.defaultSongsheet.length == 0) {
        this.$store.state.index = 0;
      } else {
        let index = this.$store.state.defaultSongsheet.findIndex(
          item => item.id === id
        );
        if (index === -1) {
          this.$store.state.index = this.$store.state.index + 1;
        } else {
          this.$store.state.index = index;
        }
      }
      this.axios
        .get("/song/detail", {
          params: {
            ids: id
          }
        })
        .then(response => {
          // console.log(response.data.songs[0]);
          this.$emit("tanslate-song", response.data.songs[0]);
          let isExist = this.$store.state.defaultPlayList.some(element => {
            return element.id == item.id;
          });
          let isExistt = this.$store.state.defaultSongsheet.some(element => {
            return element.id == item.id;
          });
          if (!isExist) this.$store.state.defaultPlayList.push(item);
          if (!isExistt) this.$store.state.defaultSongsheet.push(item);
          this.showLoading = false;
        })
        .catch(function(error) {
          console.log(error);
        });
    },
    //获取歌曲列表
    getSongList() {
      this.axios
        .get("/top/list", {
          params: {
            idx: 1
          }
        })
        .then(response => {
          // 如果数据正确
          this.songList = response.data.playlist.tracks;
          this.timestrr = response.data.playlist.updateTime;
          // console.log(updatetime());
          // console.log(this.songList, "getSongList");
          // console.log(this.timestrr);
          // 获取到的数据放入本地存储
          window.localStorage.setItem(
            "songList",
            // 过期时间1小时
            JSON.stringify({
              expire: Date.now() + 3 * 60 * 60 * 1000,
              result: response.data.playlist.tracks
            })
          );
          window.localStorage.setItem(
            "timestrr",
            // 过期时间1小时
            JSON.stringify({
              expire: Date.now() + 3 * 60 * 60 * 1000,
              result: response.data.playlist.updateTime
            })
          );
        })
        .catch(function(error) {
          console.log(error);
        });
    },
    //作者们
    joinArs(ars) {
      return ars.map(ar => ar.name).join(" / ");
    },

    // 截取前99个
    randomsongList() {
      if (this.addmore === 0) {
        return [...this.songList].slice(0, 30);
      }
      if (this.addmore === 1) {
        return [...this.songList].slice(0, 60);
      }
      if (this.addmore === 2) {
        return [...this.songList].slice(0, 90);
      }
      if (this.addmore === 3) {
        return [...this.songList].slice(0, 99);
      }
    },
    //更新时间
    updatetime() {
      let timestr = new Date(this.timestrr);
      let month = timestr.getMonth() + 1;
      let day = timestr.getDate();

      let datetime =
        "更新日期：" +
        (Array(2).join(0) + month).slice(-2) +
        "-" +
        (Array(2).join(0) + day).slice(-2);

      return datetime;
    }
  },
  created() {
    // 每次创建组件都拿数据 太频繁 本地存储
    const cacheSongList = JSON.parse(window.localStorage.getItem("songList"));
    const cacheTimestrr = JSON.parse(window.localStorage.getItem("timestrr"));
    if (cacheSongList && cacheSongList.expire > Date.now()) {
      // 存在并且还没有过期
      this.timestrr = cacheTimestrr.result;
      this.songList = cacheSongList.result;
    } else {
      // 已经过期
      this.getSongList();
    }
  },
  watch: {
    "$store.state.index"(newValue) {
      //因为newValue会判断为true, 0判断为False，所以当等于0时，不传数据。
      if (newValue || newValue == 0) {
        this.$emit(
          "tanslate-song",
          this.$store.state.defaultSongsheet[newValue]
        );
      }
    }
  }
};
</script>
<style lang="less" scoped>
.loading {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  // background: rgba(0, 0, 0, 0.4);
  display: flex;
  z-index: 999;
  justify-content: center;
  align-items: center;
  img {
    width: 106px;
  }
}
.list {
  padding-bottom: 15px;
  h1 {
    padding: 0 10px;
    font-size: 13px;
    background-color: #eeeff0;
    line-height: 20px;
  }
  .box {
    padding: 0 0 0 10px;
    display: flex;
    margin: 10px 0;
    align-items: center;
    .snum {
      color: #79b8ff;
      width: 18px;
      text-align: center;
    }
    .main {
      padding: 0 0 0 10px;
      flex: 1;
      width: 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;

      h3 {
        color: #555555;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        &.active {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          color: #77b6fc;
        }
        .alias {
          color: rgb(189, 189, 189);
        }
      }
      .info {
        padding: 0;
        font-size: 12px;
        line-height: 2em;
        color: rgb(189, 189, 189);
      }
    }
  }

  .icon {
    background-image: url("../assets/index_icon_2x.png");
    display: inline-block;
    background-size: 166px auto;

    &.icon-quality {
      width: 12px;
      height: 8px;
      margin: 0 5px 0 2px;
    }
    &.icon-play {
      width: 25px;
      height: 25px;
      background-position-x: -23px;
      margin: 0 10px;
    }
  }
}
.more {
  padding-bottom: 20px;
  text-align: center;
  font-size: 14px;
}
.bg {
  padding-top: 40px;
  position: relative;
  .text {
    width: 170px;
    height: 90px;
    position: absolute;
    top: 20%;
    left: 0;
    img {
      position: absolute;
      clip: rect(30px 170px 100px 20px);
    }
  }
  span {
    color: rgba(255, 255, 255, 0.8);
    font-size: 12px;
    position: absolute;
    bottom: 18%;
    left: 6.5%;
  }
}
</style>
