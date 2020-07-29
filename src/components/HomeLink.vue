<template>
  <div class="top">
    <ul id="nav">
      <li>
        <router-link to="/home">歌多</router-link>
      </li>
      <li>
        <router-link to="/hot">热歌榜</router-link>
      </li>
      <li>
        <router-link to="/search">搜索</router-link>
      </li>
    </ul>
  </div>
</template>

<script>
export default {};
</script>

<style lang="less" scoped>
@blue: #79b8ff;
.top {
  position: fixed;
  z-index: 66;
  width: 100%;
  top: 0;
  background: white;
}
#nav {
  display: flex;
  text-align: center;
  border-bottom: 1px solid transparent;
  height: 40px;
  box-sizing: border-box;

  li {
    flex: 1;
  }
  a {
    color: #555555;
    text-decoration: none;
    line-height: 38px;
    padding: 5px 3px;
    box-sizing: border-box;
    // font-weight: 550;
    &.router-link-exact-active {
      color: @blue;
      border-bottom: 1px solid @blue;
    }
  }
}
</style>
