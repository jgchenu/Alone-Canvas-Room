<template>
    <div class="loginPage">
            <p>点击允许授权照片权限</p>
            <img src="https://raw.githubusercontent.com/jgchenu/Alone-Canvas-Room/master/logo.jpg" alt="logo">
            <button @opensetting="onGetSetting" open-type="openSetting" class="loginButton">允许</button>
            
    </div>
</template>

<script>
import util from '@/utils/index.js'
export default {
  methods: {
    onGetSetting(event) {
      if (event.target.authSetting["scope.writePhotosAlbum"]) {
        util.showSuccess("授权成功");
        setTimeout(() => {
          wx.navigateBack({
            delta: 1
          });
        }, 1000);
      }else{
        util.showModel('提示','授权失败，请点击允许授权')
      }
    }
  },
  data() {
    return {};
  }
};
</script>

<style lang="less" scoped>
.loginPage {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  .loginButton {
    margin-top: 100rpx;
    height: 80rpx;
    line-height: 80rpx;
    padding: 0 100rpx;
    background: #3bacf9;
    color: #fff;
  }
  p {
    margin-top: 200rpx;
    color: #3bacf9;
    text-align: center;
  }
  img {
    margin-top: 40rpx;
    border-radius: 50%;
    width: 200rpx;
    height: 200rpx;
    box-shadow: 0 0 6rpx #3BACF9;
  }
}
</style>

