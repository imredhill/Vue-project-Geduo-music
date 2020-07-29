import Vue from "vue";
import VueRouter from "vue-router";
import Home from "../views/Home.vue";
import Hot from "../views/Hot.vue";
import Search from "../views/Search.vue";
import Playlist from "../views/Playlist.vue";
import Advert from "../views/Advertpage.vue";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "Advert",
    component: Advert,
    redirect: "/advertpage" //默认进入广告页
  },
  {
    path: "/advertpage",
    name: "广告页",
    component: () => import("../views/Advertpage.vue"),
    // 独享路由守卫、
    beforeEnter: (to, from, next) => {
      // 通过存储过程，判断存储中是否有数据
      // localStorage 关闭浏览器数据存在，只有清除数据缓存才消失
      if (localStorage.advertpage) {
        // 1.有数据，进入广告页
        next();
      } else {
        // 2.没有数据，进入引导页
        localStorage.advertpage = true;
        next();
      }
    }
  },
  {
    path: "/home",
    name: "Home",
    component: Home
  },
  {
    path: "/hot",
    name: "Hot",
    component: Hot
  },
  {
    path: "/search",
    name: "Search",
    component: Search
  },
  {
    path: "/playlist",
    name: "Playlist",
    component: Playlist,
    meta: {
      requiresAuth: true
    }
  }
];

const router = new VueRouter({
  mode: "history",
  routes,
  scrollBehavior() {
    // return 期望滚动到哪个的位置
    return {
      x: 0,
      y: 0
    };
  }
});

export default router;
