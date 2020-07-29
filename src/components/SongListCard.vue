<template>
  <li class="card" @click="routerToPlayListPage(songList.id)">
    <div class="thumb">
      <img :src="songList.picUrl" />
      <span>
        <i class="fa fa-headphones"></i>
        {{ playCountParse(songList.playCount) }}
      </span>
    </div>
    <h5>{{ songList.name }}</h5>
  </li>
</template>

<script>
export default {
  props: {
    songList: {
      type: Object,
      default: () => {
        return {
          // id: 4969079749,
          // type: 0,
          // name: "欧美 | 欢快小调拯救你的不开心",
          // copywriter: "编辑推荐：音乐是治愈人心的良药",
          // picUrl:
          //   "https://p2.music.126.net/nflx5ZxSSPivvGnyS5WRGw==/109951164906376339.jpg",
          // canDislike: false,
          // trackNumberUpdateTime: 1586934907095,
          // playCount: 1209355,
          // trackCount: 100,
          // highQuality: false,
          // alg: "featured"
        };
      }
    }
  },
  methods: {
    //计算
    playCountParse(n) {
      if (n > 100000000) return (n / 100000000).toFixed(1) + "亿";
      if (n > 10000) return (n / 10000).toFixed(1) + "万";
    },

    // 导航
    routerToPlayListPage(id) {
      this.$router.push({ path: "playlist", query: { id: id } });
    }
  }
};
</script>

<style lang="less" scoped>
.card {
  flex-basis: 30%;
  flex-grow: 1;
  margin-bottom: 5px;
  &:nth-child(3n + 2) {
    margin: 0 3px;
  }
  .thumb {
    position: relative;
    img {
      vertical-align: middle;
    }
    span {
      position: absolute;
      top: 0;
      right: 0;
      color: white;
    }
  }
  h5 {
    color: #555555;
    font-size: 14px;
    margin: 3px 0 5px 0;
    line-height: 1.2em;
    height: 2.4em;
    overflow: hidden;
  }
}
</style>
