<template>
  <div class="palylist">
    <div class="loading" v-if="showLoading">
      <img src="../assets/loading.svg" alt />
    </div>
    <template v-if="songListDetail">
      <div class="header">
        <div
          class="mask"
          :style="{ backgroundImage: `url(${songListDetail.coverImgUrl})` }"
        ></div>
        <div class="fl">
          <img :src="songListDetail.coverImgUrl" alt />
          <span class="playcount">
            <i class="fa fa-headphones"></i>
            {{ playCountParse(songListDetail.playCount) }}
          </span>
          <span class="icon">歌单</span>
        </div>
        <div class="fr">
          <h3>{{ songListDetail.name }}</h3>
          <img :src="songListDetail.creator.avatarUrl" alt />
          <span>{{ songListDetail.creator.nickname }}</span>
        </div>
      </div>

      <!-- 歌曲描述 -->
      <div class="info">
        <div class="tags">
          <span>标签：</span>
          <i v-for="(tag, index) in songListDetail.tags" :key="index">{{
            tag
          }}</i>
        </div>
        <div class="desc" :class="{ show: showMoreDesc }">
          <span>简介：</span>
          <span>{{ songListDetail.description }}</span>
        </div>
        <div class="more" @click="showMoreDesc = !showMoreDesc">
          <i v-if="showMoreDesc" class="fa fa-angle-up"></i>
          <i v-else class="fa fa-angle-down"></i>
        </div>
      </div>
    </template>
    <div class="list" v-if="sheetList">
      <h1>歌曲列表</h1>
      <ul>
        <li
          @click="getId(item.id, item)"
          class="box"
          v-for="(item, index) in sheetList"
          :key="index"
        >
          <div class="snum">{{ index + 1 }}</div>
          <div class="main">
            <h3 :class="{ active: currentSong && currentSong.id === item.id }">
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
      </ul>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    currentSong: Object
  },
  data() {
    return {
      songListId: this.$route.query.id,
      songListDetail: null,
      sheetList: [],
      showMoreDesc: false,
      showLoading: false
    };
  },
  methods: {
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
    //计算
    playCountParse(n) {
      if (n > 100000000) return (n / 100000000).toFixed(1) + "亿";
      if (n > 10000) return (n / 10000).toFixed(1) + "万";
    },
    //作者们
    joinArs(ars) {
      return ars.map(ar => ar.name).join(" / ");
    }
  },

  beforeRouteEnter(to, from, next) {
    // 可以通过传一个回调给 next来访问组件实例。在导航被确认的时候执行回调，并且把组件实例作为回调方法的参数。
    // console.log(this)

    // 获取数据 并存入本地
    const cacheSheetList = JSON.parse(
      window.localStorage.getItem("sl-" + to.query.id)
    );
    const cacheSongListDetail = JSON.parse(
      window.localStorage.getItem("sl-" + to.query.id)
    );
    if (cacheSongListDetail && cacheSongListDetail.expire > Date.now()) {
      // 存在并且还没有过期
      // this.songListDetail = cacheSongListDetail.result;
      // 守卫回调
      next(vm => {
        // 通过 `vm` 访问组件实例
        vm.songListId = Number(to.query.id);
        vm.songListDetail = cacheSongListDetail.playlist;
        vm.sheetList = cacheSheetList.trackslist;
      });
    } else {
      // 已经过期
      window.axios
        .get("/playlist/detail", {
          params: {
            id: to.query.id
          }
        })
        .then(response => {
          // 如果数据正确
          let trackslist = response.data.playlist.tracks;
          let playlist = response.data.playlist;

          // 获取到的数据放入本地存储
          window.localStorage.setItem(
            "sl-" + to.query.id,
            // 过期时间1小时
            JSON.stringify({
              expire: Date.now() + 3 * 60 * 60 * 1000,
              playlist: response.data.playlist,
              trackslist: response.data.playlist.tracks
            })
          );

          // 守卫回调
          next(vm => {
            // 通过 `vm` 访问组件实例
            vm.songListId = Number(to.query.id);
            vm.songListDetail = playlist;
            vm.sheetList = trackslist;
          });
        })
        .catch(function(error) {
          console.log(error);
        });
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
  },
  beforeRouteLeave(to, from, next) {
    // 导航离开该组件的对应路由时调用
    // 可以访问组件实例 `this`
    // console.log(to, from, "即将离开home");
    this.showMoreDesc = false;
    next();
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
    color: #555555;
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
      padding-left: 10px;
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
img {
  max-width: 100%;
}
.header {
  display: flex;
  padding: 30px 15px;
  position: relative;
  overflow: hidden;
  color: white;
  .mask {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: -1;
    filter: blur(30px) brightness(0.8);
    transform: scale(1.5);
    background-position: center;
  }
  .fl {
    flex: 4;
    position: relative;
    font-size: 12px;
    line-height: 18px;
    .xxx() {
      position: absolute;
      left: 0;
      top: 0;
    }
    .playcount {
      .xxx();
      width: 100%;
      text-align: right;
      padding: 0 5px;

      background: rgba(0, 0, 0, 0.3);
    }
    .icon {
      .xxx();
      top: 15px;
      background: #bb3b3f;
      padding: 0 10px;

      border-top-right-radius: 1em;
      border-bottom-right-radius: 1em;
    }
  }
  .fr {
    flex: 6;
    padding-left: 15px;
    h3 {
      padding: 5px 0 20px 0;
    }
    img {
      width: 30px;
      height: 30px;
      border-radius: 50%;
      vertical-align: middle;
    }
    span {
      font-size: 14px;
      padding-left: 15px;
    }
  }
}

.info {
  padding: 0 10px;
  line-height: 1.5em;
  font-size: 14px;
  .tags {
    margin: 10px 0;
    span {
      vertical-align: middle;
    }
    i {
      font-size: 12px;
      margin-right: 5px;
      font-style: normal;
      border: 1px solid lightgray;
      border-radius: 12px;
      padding: 2px 5px;
    }
  }
  .desc {
    height: 4.5em;
    overflow: hidden;
    text-overflow: ellipsis;
    // background: red;
    &.show {
      height: auto;
    }
    span {
      white-space: pre-wrap;

      vertical-align: baseline;
    }
  }
  .more {
    overflow: hidden;
    i {
      float: right;
      font-size: 16px;
    }
  }
}
</style>
