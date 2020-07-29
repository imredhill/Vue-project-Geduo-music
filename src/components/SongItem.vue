<template>
  <div>
    <div class="loading" v-if="showLoading">
      <img src="../assets/loading.svg" alt />
    </div>
    <li class="songitem" @click="getId(songItem.id, songItem)">
      <span class="order" v-if="options.order !== undefined">
        {{ options.order + 1 }}
      </span>
      <div
        class="main"
        :style="{ marginLeft: options.order !== undefined ? '0px' : '10px' }"
      >
        <h3 :class="{ active: currentSong && currentSong.id === songItem.id }">
          {{ songItem.name }}
        </h3>

        <div class="info" v-if="options.info !== false">
          <i class="icon icon-quality"></i>
          <span class="artists">{{ joinArtists(songItem.song.artists) }}</span>

          <span class="album">-{{ songItem.song.album.name }}</span>
        </div>
      </div>
      <img
        class="icon icon-play"
        style="background:none"
        v-if="currentSong && currentSong.id === songItem.id"
        src="../assets/playing.svg"
        alt
      />
      <i v-else class="icon icon-play"></i>
      <div
        class="close"
        v-if="options.close !== false"
        @click.stop="del(dataIndex)"
      >
        <i class="fa fa-close"></i>
      </div>
    </li>
  </div>
</template>

<script>
export default {
  data() {
    return {
      showLoading: false
    };
  },
  props: {
    dataIndex: Number,
    options: Object,
    songItem: Object,
    currentSong: Object
  },
  methods: {
    //删除一首歌
    del(dataIndex) {
      if (this.currentSong.id == this.songItem.id) {
        // console.log(this.currentSong.id, this.songItem.id);
        console.log("播放的歌是删除的歌");
        this.$store.state.deleteSong = true;
      }
      this.$store.state.defaultSongsheet.splice(dataIndex, 1);
      this.$store.state.defaultPlayList.splice(dataIndex, 1);
      if (!this.$store.state.defaultSongsheet.length) {
        this.$store.state.delSong = true;
      }
    },
    //作者们
    joinArtists(artists) {
      return artists.map(artist => artist.name).join(" / ");
    },
    //获取歌曲ID并往上传
    getId(id, songItem) {
      this.showLoading = true;
      if (this.$store.state.defaultSongsheet.length == 0) {
        this.$store.state.index = 0;
      } else {
        let index = this.$store.state.defaultSongsheet.findIndex(
          item => item.id === id
        );
        if (index === -1) {
          this.$store.state.index = this.$store.state.defaultPlayList.length;
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
          //判断是否重复
          let isExist = this.$store.state.defaultPlayList.some(element => {
            return element.id == songItem.id;
          });
          let isExistt = this.$store.state.defaultSongsheet.some(element => {
            return element.id == songItem.id;
          });
          if (!isExist)
            this.$store.state.defaultPlayList.push(response.data.songs[0]);
          if (!isExistt)
            this.$store.state.defaultSongsheet.push(response.data.songs[0]);

          this.showLoading = false;
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
    },
    "$store.state.defaultSongsheet"(newVal) {
      if (newVal.length == 0) {
        this.$emit("tanslate-song", null);
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
  display: flex;
  z-index: 999;
  justify-content: center;
  align-items: center;
  img {
    width: 106px;
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

.songitem {
  display: flex;
  margin: 10px 0;
  align-items: center;

  .order {
    font-size: 18px;
    width: 2em;
    // background: red;
    text-align: center;
    color: rgb(189, 189, 189);
  }
  .main {
    flex: 1;
    width: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-left: 10px;
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
    }
    .info {
      font-size: 12px;
      line-height: 2em;
      color: rgb(189, 189, 189);
    }
  }
  .close i {
    color: #c2c2c2;
    padding-right: 16px;
    display: flex;
    justify-content: center;
    align-items: center;
  }
}
</style>
