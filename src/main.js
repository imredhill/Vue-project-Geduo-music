import Vue from "vue";
import "./plugins/axios";
import App from "./App.vue";
import router from "./router";
// vant组件库
// $cnpm i vant -S
import vant from "vant";
import "vant/lib/index.css";

// 动画效果
// npm install animate.css --save
import "animate.css/animate.css";
import store from "./store";
Vue.config.productionTip = false;

Vue.use(vant);
new Vue({
  router,
  store,
  render: h => h(App)
}).$mount("#app");
