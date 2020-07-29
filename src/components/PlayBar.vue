<template>
  <div class="playbar">
    <!-- bottom -->
    <div class="playbarbottom" @click="showFullscreen(currentSong)">
      <img
        class="thumb"
        :class="{ active: playing }"
        :src="currentSong.al.picUrl"
        alt
      />
      <div class="info">
        <h5 style="color: #555555;">{{ currentSong.name }}</h5>
        <span>{{ joinArs(currentSong.ar) }}</span>
      </div>
      <div class="progress" @click.stop="playing = !playing">
        <canvas width="36" height="36" id="canvas"></canvas>
        <i v-if="playing" class="fa fa-pause"></i>
        <i v-else class="fa fa-play"></i>
      </div>
      <div class="playlist">
        <i class="fa fa-bars" @click.stop="showPlayList"></i>
      </div>
    </div>

    <!-- 播放列表 -->
    <transition
      name="custom-classes-transition"
      enter-active-class="animated slideInUp"
      leave-active-class="animated slideOutDown"
    >
      <ul v-if="showPll" class="defaultPlayList">
        <SongItem
          v-for="(item, index) in this.$store.state.defaultPlayList"
          :key="index"
          :songItem="item"
          :options="{ order: index, info: false, close: false }"
          @tanslate-song="$emit('tanslate-song', $event)"
          :currentSong="currentSong"
        ></SongItem>
      </ul>
    </transition>

    <!-- fullscreen -->
    <transition
      name="custom-classes-transition"
      enter-active-class="animated fadeInUp"
      leave-active-class="animated fadeOutDown"
    >
      <div class="fullscreenplay" v-show="showFull">
        <div
          class="mask"
          :style="{ backgroundImage: `url(${currentSong.al.picUrl})` }"
        ></div>
        <header>
          <van-icon class="left" name="arrow-left" @click="close" size="24" />
          <div class="info">
            <h3>{{ currentSong.name }}</h3>
            <span>{{ joinArs(currentSong.ar) }}</span>
          </div>
          <van-icon
            class="right"
            name="share"
            size="24"
            @click="showShare = true"
          />
          <van-share-sheet
            v-model="showShare"
            title="立即分享给好友"
            :options="options"
            @select="onSelect"
          />
        </header>

        <div
          v-show="showCircle"
          class="circle"
          :class="{ active: playing }"
          @click="showCircle = false"
        >
          <div class="needle"></div>
          <div class="glue">
            <img :src="currentSong.al.picUrl" alt />
          </div>
        </div>
        <div v-show="!showCircle" class="lyric-box" @click="showCircle = true">
          <ul
            class="scroll"
            :style="{ transform: `translateY(${-currentLyricIndex * 28}px)` }"
          >
            <li
              v-for="(item, index) in parsedLyric"
              :class="{ active: index === currentLyricIndex }"
              :key="index"
            >
              {{ item.text }}
            </li>
          </ul>
        </div>
        <!-- 三个点，歌曲详情 -->
        <van-popup
          v-model="showD"
          round
          position="right"
          :style="{ height: '100%' }"
          class="detail"
        >
          <p>
            <i class="fa fa-user-circle-o"></i>
            歌手：{{ joinArs(currentSong.ar) }}
          </p>
          <p>
            <i class="fa fa-circle-o-notch"></i>
            专辑：{{ currentSong.al.name }}
          </p>
          <p><i class="fa fa-link"></i> 来源：歌单[我的音乐]</p>
          <p><i class="fa fa-youtube-play"></i> 相关视频</p>
          <p><i class="fa fa-bell-o"></i> 设为铃声</p>

          <p><i class="fa fa-music"></i> 相似推荐</p>
          <p><i class="fa fa-opencart"></i> 购买单曲</p>
          <p><i class="fa fa-clock-o"></i> 定时停止播放</p>
          <p><i class="fa fa-warning"></i> 举报</p>
          <p><i class="fa fa-ban"></i> 屏蔽歌曲或歌手</p>
        </van-popup>
        <footer>
          <div class="option">
            <!-- 收藏 -->
            <div class="like">
              <i
                v-if="like"
                @click.stop="lightDown"
                class="fa fa-heart"
                style="color:#77b6fc"
              ></i>
              <i v-else @click.stop="lightUp" class="fa fa-heart-o"></i>
            </div>
            <i class="fa fa-download" @click="goDownload"></i>
            <i class="fa fa-ellipsis-v" @click="showDetail"></i>
          </div>
          <!-- 播放器按钮 -->
          <div class="bar">
            <div class="time1">
              <span></span>
            </div>
            <div class="progressbar">
              <div class="layer"></div>
              <input type="range" value="0" min="0" step="0.01" max="100" />
              <div class="slider">
                <i></i>
              </div>
            </div>
            <div class="time2">
              <span></span>
            </div>
          </div>
          <div class="player">
            <div class="playstate" @click.stop="changestate">
              <i v-if="playstate === 1" class="fa fa-refresh fa-spin"></i>
              <i
                v-if="playstate === 2"
                class="fa fa-circle-o-notch fa-spin"
              ></i>
              <i v-if="playstate === 3" class="fa fa-random"></i>
            </div>
            <i class="fa fa-step-backward" @click.stop="prev"></i>
            <div class="condition" @click.stop="playing = !playing">
              <i
                v-if="playing"
                class="fa fa-pause-circle-o"
                style="font-size: 48px;"
              ></i>
              <i
                v-else
                class="fa fa-play-circle-o"
                style="font-size: 48px;"
              ></i>
            </div>
            <i class="fa fa-step-forward" @click.stop="next"></i>

            <i class="fa fa-bars" @click="showPopup"></i>
          </div>
        </footer>
        <van-popup
          class="Songsheet"
          v-model="show"
          round
          position="bottom"
          :style="{ height: '35%' }"
        >
          <ul v-if="show" class="defaultSongsheet">
            <van-icon
              size="22"
              name="delete"
              color="#C2C2C2"
              @click="clean"
              style="position:absolute;right:7%;top:5%"
            />
            <SongItem
              v-for="(item, index) in this.$store.state.defaultSongsheet"
              :key="index"
              :dataIndex="index"
              :songItem="item"
              :options="{ order: index, info: false, close: true }"
              @tanslate-song="$emit('tanslate-song', $event)"
              :currentSong="currentSong"
            ></SongItem>
          </ul>
        </van-popup>
      </div>
    </transition>

    <audio :src="currentSongUrl" autoplay controls height="30"></audio>
  </div>
</template>

<script>
import SongItem from "@/components/SongItem";
import Vue from "vue";
import { Toast } from "vant";
import { ShareSheet } from "vant";
import { Popup } from "vant";
import { Dialog } from "vant";
import saveAs from "file-saver";
var FileSaver = require("file-saver");

Vue.use(Popup);
Vue.use(Dialog);
Vue.use(ShareSheet);
export default {
  props: {
    currentSong: Object
  },
  components: {
    SongItem
  },
  data() {
    return {
      closing: true,
      playstate: 1,
      showShare: false,
      showD: false,
      options: [
        { name: "微信", icon: "wechat" },
        { name: "微博", icon: "weibo" },
        { name: "复制链接", icon: "link" },
        { name: "分享海报", icon: "poster" },
        { name: "二维码", icon: "qrcode" }
      ],
      playing: false,
      showFull: false,
      showCircle: false,
      currentLyric: null,
      currentLyricIndex: 0,
      showPll: false,
      show: false,
      like: false,
      defaultPlayList: [this.currentSong],
      defaultSongsheet: [this.currentSong]
    };
  },
  methods: {
    //列表为空
    showPlayList() {
      if (!this.$store.state.defaultSongsheet.length) {
        Toast("快去听歌吧~");
      } else {
        this.showPll = !this.showPll;
      }
    },
    //洗牌随机算法
    shuffle(randomlist) {
      var l = randomlist.length;
      var index;
      if (l > 0) {
        index = Math.floor(Math.random() * l);
      }
      return index;
    },
    //改变播放状态
    changestate() {
      this.playstate++;
      if (this.playstate > 3) {
        this.playstate = 1;
      }
      switch (this.playstate) {
        case 1:
          Toast("列表循环");
          break;
        case 2:
          Toast("单曲循环");
          break;
        case 3:
          Toast("随机播放");
          break;
      }
      this.currentStatus();
    },
    //播放状态
    currentStatus() {
      var audio = this.$el.querySelector("audio");
      switch (this.playstate) {
        case 1:
          audio.onended = () => {
            this.$store.state.index += 1;
            if (
              this.$store.state.index >
              this.$store.state.defaultSongsheet.length - 1
            ) {
              this.$store.state.index = 0;
            }
            audio.src = `https://music.163.com/song/media/outer/url?id=${
              this.$store.state.defaultSongsheet[this.$store.state.index].id
            }.mp3`;
          };
          break;

        case 2:
          audio.onended = () => {
            audio.src = `https://music.163.com/song/media/outer/url?id=${
              this.$store.state.defaultSongsheet[this.$store.state.index].id
            }.mp3`;
          };
          break;

        case 3:
          // console.log("播放列表的index", this.$store.state.defaultSongsheet.length);
          audio.onended = () => {
            this.$store.state.index = this.shuffle(
              this.$store.state.defaultSongsheet
            );
            let randomSong = this.$store.state.defaultSongsheet[
              this.$store.state.index
            ];
            if (audio.src.indexOf(randomSong.id) != -1) {
              this.$store.state.index = this.shuffle(
                this.$store.state.defaultSongsheet
              );
              randomSong = this.$store.state.defaultSongsheet[
                this.$store.state.index
              ];
            }
            audio.src = `https://music.163.com/song/media/outer/url?id=${randomSong.id}.mp3`;
          };
          break;
      }
    },

    //点赞喜欢歌曲
    lightUp() {
      Toast("收藏成功");
      this.like = true;
      // console.log("当前喜欢的歌", this.currentSong.id);
      let isExist = this.$store.state.favoritSongs.some(element => {
        return element.id == this.currentSong.id;
      });
      if (!isExist) this.$store.state.favoritSongs.push(this.currentSong);
      // console.log("添加的歌", this.$store.state.favoritSongs);
    },
    //取消喜欢歌曲
    lightDown(index) {
      this.like = false;
      this.$store.state.favoritSongs.splice(index, 1);
      // console.log("现在的收藏", this.$store.state.favoritSongs);
      Toast("取消收藏");
    },

    //清除播放列表
    clean() {
      Toast("清空列表");
      var audio = this.$el.querySelector("audio");
      audio.pause();
      this.playing = false;
      this.showFull = false;
      this.show = false;
      this.$store.state.defaultPlayList = [];
      this.$store.state.defaultSongsheet = [];
      this.$emit("tanslate-song", null);
    },
    //展示播放详情
    showFullscreen(currentSong) {
      var arr = this.$store.state.favoritSongs;
      for (let i = 0; i < arr.length; i++) {
        const element = arr[i];
        if (element.id == currentSong.id) {
          this.like = true;
        }
      }
      this.showFull = true;
      this.$store.state.slide = true;
    },
    //关闭播放详情
    close() {
      this.showFull = false;
      this.$store.state.slide = "";
      this.like = false;
    },
    //去下载
    goDownload() {
      Dialog.confirm({
        title: "下载歌曲",
        message: "点击确认开始下载"
      })
        .then(() => {
          FileSaver.saveAs(
            `https://music.163.com/song/media/outer/url?id=${this.currentSong.id}.mp3`
          );
        })
        .catch(() => {
          // on cancel
        });
    },
    //详情
    showDetail() {
      this.showD = true;
    },
    //弹出层
    showPopup() {
      if (!this.$store.state.defaultSongsheet.length) {
        Toast("快去听歌吧~");
      } else {
        this.show = !this.show;
      }
    },
    //分享
    onSelect(option) {
      Toast(option.name);
      this.showShare = false;
    },
    //作者们
    joinArs(ars) {
      return ars.map(ar => ar.name).join(" / ");
    },
    //上一首
    prev() {
      var audio = this.$el.querySelector("audio");
      this.$store.state.index -= 1;

      if (this.$store.state.index < 0) {
        this.$store.state.index = this.$store.state.defaultSongsheet.length - 1;
      }
      audio.src = `https://music.163.com/song/media/outer/url?id=${
        this.$store.state.defaultSongsheet[this.$store.state.index].id
      }.mp3`;
    },
    //下一首
    next() {
      var audio = this.$el.querySelector("audio");
      this.$store.state.index += 1;
      if (
        this.$store.state.index >
        this.$store.state.defaultSongsheet.length - 1
      ) {
        this.$store.state.index = 0;
      }
      audio.src = `https://music.163.com/song/media/outer/url?id=${
        this.$store.state.defaultSongsheet[this.$store.state.index].id
      }.mp3`;
    },
    //画圆进度条
    drawProgress() {
      var canvas = this.$el.querySelector("#canvas");
      var audio = this.$el.querySelector("audio");
      var duration = this.currentSong.dt;
      var progressbar = this.$el.querySelector(".progressbar input");
      var slideri = this.$el.querySelector(".slider i");
      var layer = this.$el.querySelector(".layer");
      // console.log(this.currentSong);

      audio.ontimeupdate = () => {
        /** @type {HTMLCanvasElement} */
        // 获取canvas元素/
        var context = canvas.getContext("2d");
        context.clearRect(0, 0, 36, 36);
        context.beginPath();
        context.arc(18, 18, 17, 0, 2 * Math.PI);
        context.closePath();
        context.strokeStyle = "lightgray";
        // 描边样式
        context.lineWidth = "1";
        // 描边宽度
        context.stroke(); // 路径描边

        context.beginPath();
        context.arc(
          18,
          18,
          17,
          -0.5 * Math.PI,
          -0.5 * Math.PI + 2 * Math.PI * ((audio.currentTime * 1000) / duration)
        );
        context.strokeStyle = "rgba(127,187,255,0.9)";
        // 描边样式
        context.lineWidth = "2";
        // 描边宽度
        context.stroke(); // 路径描边

        // 滚动歌词
        let index;
        for (let i = 0; i < this.parsedLyric.length; i++) {
          if (audio.currentTime + 0.15 < this.parsedLyric[i].time) {
            index = i - 1;
            break;
          }
        }
        if (index === undefined) {
          index = this.parsedLyric.length - 1;
        }
        this.currentLyricIndex = index;
        if (isNaN(audio.duration)) {
          return;
        }

        // 更新进度条
        progressbar.value = (audio.currentTime / audio.duration) * 100;
        layer.style.width = progressbar.value + "%";
        slideri.style.left = progressbar.value - 2 + "%";

        // 更新时间
        document.querySelectorAll(".time1 span")[0].innerText = countTime(
          audio.currentTime
        );
      };
      //拖动进度条
      progressbar.onchange = function() {
        audio.currentTime = (this.value * audio.duration) / 100;
      };

      //时间过滤
      function countTime(n) {
        var x = Math.floor(n);
        var m = Math.floor(x / 60);
        var s = x % 60;
        m = m > 9 ? m : "0" + m;
        s = s > 9 ? s : "0" + s;
        return m + ":" + s;
      }
      //播放时间更新
      audio.ondurationchange = function() {
        document.querySelectorAll(".time2 span")[0].innerText = countTime(
          audio.duration
        );
      };
    },
    //歌词
    getLyric() {
      var cachedLyric = window.localStorage.getItem(
        "lyric" + this.currentSong.id
      );

      if (cachedLyric) {
        this.currentLyric = cachedLyric;
      } else {
        window.axios
          .get("lyric", {
            params: {
              id: this.currentSong.id
            }
          })
          .then(response => {
            this.currentLyric = response.data.lrc.lyric;

            window.localStorage.setItem(
              "lyric" + this.currentSong.id,
              response.data.lrc.lyric
            );
          });
      }
    }
  },

  computed: {
    currentSongUrl() {
      if (this.currentSong)
        return `https://music.163.com/song/media/outer/url?id=${this.currentSong.id}.mp3`;
      else return "";
    },
    //截取歌词
    parsedLyric() {
      if (this.currentLyric) {
        return this.currentLyric.split("\n").map(item => {
          var regex = /\d{2}:\d{2}\.\d+/i;
          if (item.search(regex) !== -1) {
            var time = item.match(regex)[0];
            var m = time.substr(0, 2);
            var s = time.substr(3, 2);
            var n = time.substr(5);
            return {
              time: Number(m) * 60 + Number(s) + Number(n),
              text: item.substr(11) || "---------"
            };
          } else {
            return {};
          }
        });
      } else {
        return null;
      }
    }
  },

  mounted() {
    var audio = this.$el.querySelector("audio");
    this.drawProgress();
    console.log(saveAs);
    audio.onplay = () => {
      // console.log("开始播放");
      this.playing = true;
    };
    audio.onpause = () => {
      // console.log("暂停播放");
      this.playing = false;
    };
    this.currentStatus();
  },

  watch: {
    playing(value) {
      var audio = this.$el.querySelector("audio");
      if (value) {
        audio.play();
      } else {
        audio.pause();
      }
    },
    //删除完时
    "$store.state.delSong"(newval) {
      // console.log(newval);
      if (newval == true) {
        this.playing = false;
        this.showFull = false;
        this.show = false;
      }
    },

    //删除当前播放歌时
    "$store.state.deleteSong"(val) {
      if (val == true) {
        this.next();
        this.$store.state.deleteSong = false;
      }
    },
    currentSong() {
      this.getLyric();
      this.drawProgress();
    }
  },
  updated() {
    this.getLyric();
  }
};
</script>

<style lang="less" scoped>
@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
.progressbar {
  height: 35px;
  width: 67%;
  position: relative;
  .layer {
    position: absolute;
    top: 17px;
    left: 0;
    width: 0;
    z-index: 9;
    height: 3px;
    background: #77b6fc;
  }
}

.progressbar input {
  width: 100%;
  opacity: 0;
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  z-index: 7;
}

.slider {
  width: 100%;
  height: 3px;
  background-color: #bdc3c7;
  position: relative;
  top: 17px;
  left: 0;
  z-index: 6;
}
.time1 {
  padding-right: 10px;
}
.time2 {
  padding-left: 10px;
}
.slider i {
  content: "";
  width: 8px;
  height: 8px;
  background: #bdc3c7;
  position: absolute;
  left: 0px;
  bottom: -2px;
  border-radius: 50%;
}
.Songsheet {
  padding: 30px 15px 15px;
  background-color: #f4f4f4;
}
.detail {
  background-color: #bdc3c7;
  padding: 15px;
  width: 47%;

  p {
    color: #555555;
    height: 10%;
    line-height: 63px;
    font-size: 13px;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
    i {
      color: #77b6fc;
      padding-right: 5px;
    }
  }
}
.playbarbottom {
  padding: 5px 0;
  background: white;
  border-top: 1px solid rgba(128, 128, 128, 0.2);
  display: flex;
  align-items: center;
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  z-index: 10;
  .margin () {
    margin: 0 10px;
  }
  .thumb {
    .margin;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    animation: rotate 6s linear infinite;
    animation-play-state: paused;
    &.active {
      animation-play-state: running;
    }
  }
  .info {
    flex: 1;
    font-size: 12px;
    line-height: 18px;
    span {
      color: gray;
    }
  }
  .progress {
    .margin;
    width: 28px;
    height: 28px;
    position: relative;
    #canvas {
      width: 100%;
    }
    i {
      position: absolute;
      top: 50%;
      left: 50%;
      color: #77b6fc;
      font-size: 12px;
      display: block;
      margin-top: -6px;
      margin-left: -6px;
      line-height: 1em;
      width: 12px;
      height: 12px;
      text-align: center;
    }
  }
  .playlist {
    .margin;
    width: 28px;
    height: 28px;
    position: relative;
    border: 1px solid #77b6fc;
    border-radius: 50%;
    i {
      position: absolute;
      top: 50%;
      left: 50%;
      color: #77b6fc;
      font-size: 12px;
      display: block;
      margin-top: -6px;
      margin-left: -6px;
      line-height: 1em;
      width: 12px;
      height: 12px;
      text-align: center;
    }
  }
}

.defaultPlayList {
  position: fixed;
  bottom: 50px;
  left: 2.5%;
  width: 95%;
  background: white;
  border-radius: 15px;
  box-shadow: 0 0 15px 0 rgba(0, 0, 0, 0.3);
}
.fullscreenplay {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 77;
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  .mask {
    filter: blur(24px) brightness(0.5);
    transform: scale(2);
    width: 100%;
    height: 100%;
    background-size: cover;
    background-position: center;
    background-color: rgba(10, 10, 100, 0.1);
    position: absolute;
    z-index: -1;
  }
  header {
    height: 50px;
    display: flex;
    // background: lightblue;
    padding-top: 3px;
    margin-bottom: 24px;
    .left {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 14%;
      height: 100%;
      color: #bdc3c7;
    }
    .info {
      text-align: center;
      width: 72%;
      font-size: 14px;
      line-height: 24px;
      h3 {
        color: whitesmoke;
      }
      span {
        color: lightgrey;
      }
    }
    .right {
      float: right;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 14%;
      height: 100%;
      color: #bdc3c7;
    }
  }
  .circle {
    flex: 1;
    text-align: center;
    position: relative;
    .glue {
      padding: 54px;
      // background: red;
      background-image: url("../assets/disc_light-ip6.png"),
        url("../assets/disc-ip6.png");
      background-size: 100%;
      border-radius: 50%;
      display: inline-block;
      margin-top: 84px;
      animation: rotate 6s linear infinite;
      animation-play-state: paused;

      img {
        width: 180px;
        height: 180px;
        border-radius: 50%;
        vertical-align: middle;
      }
    }
    .needle {
      width: 96px;
      height: 137px;
      background-image: url("../assets/needle.png");
      // background-color: lightblue;
      background-size: 100%;
      position: absolute;
      top: 0;
      left: 50%;
      z-index: 1;
      margin-left: -16px;
      transform: rotate(-12deg);
      transform-origin: 16px 0;
      transition: all 0.3s;
    }
    &.active {
      .needle {
        transform: rotate(0deg);
      }
      .glue {
        animation-play-state: running;
      }
    }
  }
  .lyric-box {
    flex: 1;
    overflow: hidden;
    position: relative;

    .scroll {
      text-align: center;
      position: absolute;
      width: 100%;
      height: 70%;
      top: 50%;
      margin-top: -1em;
      transition: transform 0.3s;
      li {
        line-height: 2em;
        font-size: 14px;
        height: 2em;
        color: lightgray;
        &.active {
          color: #7cbaff;
        }
      }
    }
  }
  footer {
    transform: translateZ(0); //主要是加了这个，下面的div就不抖动了
    height: 170px;
    color: #bdc3c7;
    // background: lightblue;
    position: relative;
    .bar {
      padding: 10px 0;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .option {
      display: flex;
      padding: 10px 0;
      i {
        text-align: center;
        flex: 1;
        font-size: 28px;
        // color: ;
      }
      .like {
        text-align: center;
        flex: 1;
        width: 100%;
      }
    }
    .player {
      display: flex;
      padding: 10px 0;
      justify-content: center;
      align-items: center;
      .playstate {
        text-align: center;
        flex: 1;
      }
      i {
        text-align: center;
        flex: 1;
        font-size: 28px;
        // color: ;
      }
    }
  }
}
.fadeIn {
  animation-duration: 0.3s;
}
</style>
