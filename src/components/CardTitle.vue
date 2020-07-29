<template>
  <div class="title">
    <h3>
      <slot></slot>
    </h3>
  </div>
</template>

<style lang="less" scoped>
@blue: #79b8ff;
.title {
  padding-left: 7px;
}
h3 {
  color: #555555;
  border-left: 2px solid @blue;
  font-size: 16px;
  line-height: 16px;
  padding-left: 17px;
  margin: 15px 0 20px 0;
}
</style>
