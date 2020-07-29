<template>
  <div>
    <HomeLink></HomeLink>
    <div class="loading" v-if="showLoading">
      <img src="../assets/loading.svg" alt />
    </div>
    <form action="/" style="padding-top:45px">
      <van-search
        v-model="value"
        shape="round"
        placeholder="请输入歌手、歌名搜索歌曲"
        @search="onSearch"
        @focus="onFcus"
        @blur="onBlur"
        @input="onInput"
        @clear="onClear"
      />
    </form>
    <div class="searchRes">
      <ul class="songs" v-show="songing">
        <li
          v-for="(item, index) in songs"
          :key="index"
          @click="getId(item.id, item)"
        >
          <div class="main">
            <h3 :class="{ active: currentSong && currentSong.id === item.id }">
              {{ item.name }}
            </h3>

            <div class="info">
              <i class="icon icon-quality"></i>
              <span class="artists">{{ joinArtists(item.artists) }}</span>

              <span class="album">-{{ item.album.name }}</span>
            </div>
          </div>
          <img
            class="icon icon-play"
            style="background:none"
            v-if="currentSong && currentSong.id === item.id"
            src="../assets/playing.svg"
            alt
          />
          <i v-else class="icon icon-play"></i>
        </li>
      </ul>
    </div>

    <div v-show="hotting">
      <van-divider :style="{ color: '#7EBBFF', padding: '0 16px' }"
        >热门搜索</van-divider
      >
      <ul class="hot">
        <li v-for="(item, index) in hots" :key="index" @click="tosearch(item)">
          {{ item.first }}
        </li>
      </ul>
    </div>
    <div v-show="past">
      <van-divider :style="{ color: '#7EBBFF', padding: '0 16px' }"
        >搜索历史</van-divider
      >
      <ul class="history">
        <li
          v-for="(item, index) in this.$store.state.historySearch"
          :key="index"
          @click="history(index)"
        >
          {{ item }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import HomeLink from "@/components/HomeLink.vue";
import Vue from "vue";
import { Search } from "vant";
Vue.use(Search);
export default {
  name: "Home",
  components: {
    HomeLink
  },
  data() {
    return {
      songing: false,
      hotting: true,
      songs: [],
      hots: [],
      value: "",
      past: true,
      showLoading: false
    };
  },
  props: {
    currentSong: Object
  },
  methods: {
    //作者们
    joinArtists(artists) {
      return artists.map(artist => artist.name).join(" / ");
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
          if (!isExist)
            this.$store.state.defaultPlayList.push(response.data.songs[0]);
          if (!isExistt)
            this.$store.state.defaultSongsheet.push(response.data.songs[0]);
          this.showLoading = false;
        })
        .catch(function(error) {
          console.log(error);
        });
    },
    //确认搜索
    onSearch(val) {
      if (this.value == "") {
        return;
      }
      this.past = false;
      this.songing = true;
      this.showLoading = true;
      this.axios
        // const searchURL = "https://music.kele8.cn/search/suggest?keywords=%E6%B5%B7%E9%98%94%E5%A4%A9%E7%A9%BA&type=mobile";

        .get("/search", {
          params: {
            keywords: val,
            limit: 10
          }
        })
        .then(response => {
          this.songs = response.data.result.songs;
          this.showLoading = false;
          // console.log(response.data.result.songs);
        })
        .catch(function(error) {
          console.log(error);
        });

      this.hotting = false;

      if (this.value == "") {
        this.hotting = true;
      }
      //判断是否重复
      let isExist = this.$store.state.historySearch.some(element => {
        return element == val;
      });
      if (!isExist) this.$store.state.historySearch.push(this.value);
    },
    //获取焦点
    onFcus() {
      this.hotting = false;
      this.past = false;
    },
    //失去焦点
    onBlur() {
      this.hotting = true;
      this.past = true;
      if (this.songing == true) {
        this.hotting = false;
        this.past = false;
      }
      this.songs = [];
    },
    //输入中
    onInput() {
      this.hotting = false;
      this.past = false;
      this.songing = true;
      if (this.value == "") {
        this.past = true;
        this.hotting = true;
        this.songing = false;
      }
    },
    //点击清除
    onClear() {
      this.hotting = true;
      this.songing = false;
      this.past = true;
      this.songs = [];
    },
    //搜索历史 搜索
    history(index) {
      this.value = this.$store.state.historySearch[index];
      this.onFcus();
      this.onInput();
    },
    //热门搜索 搜索
    tosearch(item) {
      this.value = item.first;
      this.onFcus();
      this.onInput();
    }
  },

  mounted() {
    const searchURL = "https://music.kele8.cn/search/hot";
    this.$axios
      .get(searchURL)
      .then(res => {
        if (res.data.error_code == 201) {
          alert("搜索数据不存在");
          return;
        }
        this.hots = res.data.result.hots;
      })
      .catch(error => {
        console.log(error);
      });
  },
  watch: {
    value(newValue) {
      if (newValue == "") {
        return;
      }
    }
  },
  beforeRouteLeave(to, from, next) {
    // 导航离开该组件的对应路由时调用
    // 可以访问组件实例 `this`
    // console.log(to, from, "即将离开home");
    this.songing = false;
    this.value = "";
    this.hotting = true;
    this.past = true;
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
.history {
  padding: 10px 20px 20px;
  display: flex;
  flex-wrap: wrap;
  text-align: center;

  li {
    margin: 4px 7px 4px 7px;
    color: #555555;
    line-height: 130%;
    margin: 5px;
    padding: 5px 10px;
    border: 1px solid #d3d3d3;
    border-radius: 10px;
    font-size: 13px;
  }
}
.songs {
  padding: 10px 20px 20px;
  li {
    display: flex;
    margin: 10px 0;
    align-items: center;

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
  }
}
.hot {
  padding: 0 16px;
  display: flex;
  flex-wrap: wrap;
  text-align: center;

  li {

    color: #555555;
    line-height: 130%;
    margin: 4px 7px 4px 7px;
    padding: 5px 10px;
    border: 1px solid #d3d3d3;
    border-radius: 10px;
    font-size: 13px;
  }
}
</style>
