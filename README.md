# Geduo-music

项目描述：
本项目是一款模仿网易云音乐的APP，使用Vue和webpack构建的单页面应用，能够浏览各个歌单，搜索播放音乐，收藏喜欢的音乐，在播放栏中能浏览歌词，设置播放模式，下载音乐，上下首切歌，分享等常用功能。

责任描述：
1.	使用Vue CLI快速搭建开发环境，使用vue ui管理项目配置，使用Vue Router实现路由切换。
2.	使用Flex响应式布局，适应不同大小屏幕的手机。添加loading效果，提升用户体验。
3.	使用 Vuex 抽离数据实现跨组件的数据传递，实现添加/清空播放列表，记录搜索历史。
4.	将axios请求到的数据放入localstorage，并设置有效期，既能实时更新，又减少了请求次数。
5.	项目使用组件化开发，能大幅提高应用开发效率、测试性、复用性等。使用 Less 预编译语言，定义全局样式。
6.	用户可左右滑动返回上一个页面，但是不会返回广告页。添加上拉加载，下拉刷新功能。

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Lints and fixes files
```
npm run lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).
