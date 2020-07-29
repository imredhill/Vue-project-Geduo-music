import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    slide: " ",
    defaultPlayList: [],
    defaultSongsheet: [],
    index: 0,
    favoritSongs: [],
    historySearch: [],
    delSong: false,
    deleteSong: false
  },
  mutations: {},
  actions: {},
  modules: {}
});
