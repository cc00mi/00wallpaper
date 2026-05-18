<template>
  <view v-if="currentInfo" class="preview">
    <swiper circular :current="currentIndex" @change="swiperChange">
      <swiper-item v-for="(item, index) in classList" :key="item._id">
        <image :src="item.picurl" mode="aspectFill" @click="maskChange"></image>
      </swiper-item>
    </swiper>

    <view v-if="maskState" class="mask">
      <view class="goBack" :style="{ top: getStatusBarHeight() + 'px' }" @click="goback">
        <uni-icons type="back" color="#fff" size="20"></uni-icons>
      </view>
      <view class="count">{{ currentIndex + 1 }} / {{ classList.length }}</view>
      <view class="Time">
        <uni-dateformat :date="new Date()" format="hh:mm"></uni-dateformat>
      </view>
      <view class="date">
        <uni-dateformat :date="new Date()" format="MM月dd日"></uni-dateformat>
      </view>
      <view class="footer">
        <view class="box" @click="clickinfo">
          <uni-icons type="info" size="28"></uni-icons>
          <view class="text">信息</view>
        </view>

        <view class="box" @click="clickscore">
          <uni-icons type="star" size="28"></uni-icons>
          <view class="text">{{ currentInfo.score }}分</view>
        </view>

        <view class="box" @click="clickDownload">
          <uni-icons type="download" size="23"></uni-icons>
          <view class="text">下载</view>
        </view>
      </view>
    </view>

    <uni-popup ref="infopopup" type="bottom">
      <view class="infopopup">
        <view class="popHeader">
          <view></view>
          <view class="title">壁纸信息</view>
          <view class="close" @click="clickinfoclose">
            <uni-icons type="closeempty" size="18" color="#999"></uni-icons>
          </view>
        </view>

        <scroll-view scroll-y>
          <view class="content">
            <view class="row">
              <view class="label">壁纸ID:</view>
              <text selectable class="value">{{ currentInfo._id }}</text>
            </view>
            <view class="row">
              <view class="label">发布者:</view>
              <text selectable class="value">{{ currentInfo.nickname }}</text>
            </view>
            <view class="row">
              <text class="label">评分:</text>
              <text selectable class="value ratebox">
                <uni-rate readonly touchable :value="currentInfo.score" size="16" />
                <text class="score">{{ currentInfo.score }}</text>
              </text>
            </view>
            <view class="row">
              <view class="label">摘要:</view>
              <text selectable class="value">{{ currentInfo.description }}</text>
            </view>
            <view class="row">
              <view class="label">标签:</view>
              <view class="value tabs">
                <view v-for="tab in currentInfo.tabs" :key="tab" class="tab">{{ tab }}</view>
              </view>
            </view>

            <view class="copyright">
              声明：本图片来源于用户投稿，仅用于免费学习交流。如涉及侵权，请联系平台处理。
            </view>
          </view>
        </scroll-view>
      </view>
    </uni-popup>

    <uni-popup ref="scorepopup" :is-mask-click="false">
      <view class="scorepopup">
        <view class="popHeader">
          <view></view>
          <view class="title">{{ isScore ? "评分过了~" : "壁纸评分" }}</view>
          <view class="close" @click="clickscoreclose">
            <uni-icons type="closeempty" size="18" color="#999"></uni-icons>
          </view>
        </view>

        <view class="content">
          <uni-rate v-model="userScore" allowHalf :disabled="isScore" disabled-color="#FFCA3E" />
          <text class="text">{{ userScore }}分</text>
        </view>

        <view class="footer">
          <button
            plain
            type="default"
            size="mini"
            :disabled="!userScore || isScore"
            @click="submitscore"
          >
            确认评分
          </button>
        </view>
      </view>
    </uni-popup>
  </view>
</template>

<script setup>
import { ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import { apiGetSetupScore, apiWriteDownload } from "@/api/apis.js";
import { getStatusBarHeight } from "@/utils/system.js";

const maskState = ref(true);
const infopopup = ref(null);
const scorepopup = ref(null);
const userScore = ref(0);
const classList = ref([]);
const currentId = ref(null);
const currentIndex = ref(0);
const currentInfo = ref(null);
const isScore = ref(false);

const storageClassList = uni.getStorageSync("storageClassList") || [];
classList.value = storageClassList.map((item) => ({
  ...item,
  picurl: (item.smallPicurl || "").replace("_small.webp", ".jpg"),
}));

onLoad((e) => {
  currentId.value = e.id;
  currentIndex.value = classList.value.findIndex((item) => item._id === currentId.value);
  if (currentIndex.value < 0) {
    currentIndex.value = 0;
  }
  currentInfo.value = classList.value[currentIndex.value];
});

const swiperChange = (e) => {
  currentIndex.value = e.detail.current;
  currentInfo.value = classList.value[currentIndex.value];
};

const maskChange = () => {
  maskState.value = !maskState.value;
};

const clickinfo = () => {
  infopopup.value.open();
};

const clickinfoclose = () => {
  infopopup.value.close();
};

const clickscore = () => {
  if (currentInfo.value.userScore) {
    isScore.value = true;
    userScore.value = currentInfo.value.userScore;
  }
  scorepopup.value.open();
};

const clickscoreclose = () => {
  scorepopup.value.close();
  userScore.value = 0;
  isScore.value = false;
};

const submitscore = async () => {
  uni.showLoading({
    title: "加载中...",
  });

  const { classid, _id: wallId } = currentInfo.value;
  const res = await apiGetSetupScore({
    classid,
    wallId,
    userScore: userScore.value,
  });

  uni.hideLoading();
  if (res.errCode === 0) {
    uni.showToast({
      title: "评分成功",
      icon: "none",
    });
    classList.value[currentIndex.value].userScore = userScore.value;
    uni.setStorageSync("storageClassList", classList.value);
    clickscoreclose();
  }
};

const goback = () => {
  uni.navigateBack({
    fail: () => {
      uni.reLaunch({
        url: "/pages/index/index",
      });
    },
  });
};

const clickDownload = async () => {
  // #ifdef H5
  uni.showModal({
    content: "请长按保存壁纸",
    showCancel: false,
  });
  // #endif

  // #ifndef H5
  try {
    uni.showLoading({
      title: "下载中...",
      mask: true,
    });

    const { classid, _id: wallId } = currentInfo.value;
    const res = await apiWriteDownload({
      classid,
      wallId,
    });
    if (res.errCode !== 0) throw res;

    uni.getImageInfo({
      src: currentInfo.value.picurl,
      success: (imageRes) => {
        uni.saveImageToPhotosAlbum({
          filePath: imageRes.path,
          success: () => {
            uni.showToast({
              title: "保存成功，请到相册查看",
              icon: "none",
            });
          },
          fail: (err) => {
            if (err.errMsg === "saveImageToPhotosAlbum:fail cancel") {
              uni.showToast({
                title: "保存失败，请重新点击下载",
                icon: "none",
              });
              return;
            }
            uni.showModal({
              title: "授权提示",
              content: "需要授权保存相册",
              success: (res) => {
                if (res.confirm) {
                  uni.openSetting({
                    success: (setting) => {
                      if (setting.authSetting["scope.writePhotosAlbum"]) {
                        uni.showToast({
                          title: "获取授权成功",
                          icon: "none",
                        });
                      } else {
                        uni.showToast({
                          title: "获取权限失败",
                          icon: "none",
                        });
                      }
                    },
                  });
                }
              },
            });
          },
          complete: () => {
            uni.hideLoading();
          },
        });
      },
    });
  } catch (err) {
    uni.hideLoading();
  }
  // #endif
};
</script>

<style lang="scss" scoped>
.preview {
  width: 100%;
  height: 100vh;
  position: relative;

  swiper {
    width: 100%;
    height: 100%;

    image {
      width: 100%;
      height: 100%;
    }
  }

  .mask {
    & > view {
      width: fit-content;
      position: absolute;
      left: 0;
      right: 0;
      margin: auto;
      color: #fff;
    }

    .goBack {
      width: 38px;
      height: 38px;
      background: rgba(0, 0, 0, 0.5);
      left: 30rpx;
      margin-left: 0;
      border-radius: 100px;
      top: 0;
      backdrop-filter: blur(10rpx);
      border: 1rpx solid rgba(255, 255, 255, 0.3);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .count {
      top: 10vh;
      background: rgba(0, 0, 0, 0.3);
      font-size: 28rpx;
      border-radius: 40rpx;
      padding: 8rpx 28rpx;
      backdrop-filter: blur(10rpx);
    }

    .Time {
      top: calc(10vh + 50rpx);
      font-size: 140rpx;
      font-weight: 100;
      line-height: 1em;
      text-shadow: 0 4rpx rgba(0, 0, 0, 0.3);
    }

    .date {
      font-size: 34rpx;
      top: calc(10vh + 230rpx);
      text-shadow: 0 2rpx rgba(0, 0, 0, 0.3);
    }

    .footer {
      background: rgba(255, 255, 255, 0.8);
      bottom: 10vh;
      width: 65vw;
      height: 120rpx;
      border-radius: 120rpx;
      color: #000;
      display: flex;
      justify-content: space-around;
      align-items: center;
      box-shadow: 0 2rpx 0 rgba(0, 0, 0, 0.1);
      backdrop-filter: blur(20rpx);

      .box {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 2rpx 12rpx;

        .text {
          font-size: 26rpx;
          color: $text-font-color-2;
        }
      }
    }
  }

  .popHeader {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .title {
      color: $text-font-color-2;
      font-size: 26rpx;
    }

    .close {
      padding: 6rpx;
    }
  }

  .infopopup {
    background: #fff;
    padding: 30rpx;
    border-radius: 30rpx 30rpx 0 0;
    overflow: hidden;

    scroll-view {
      max-height: 60vh;

      .content {
        .row {
          display: flex;
          padding: 16rpx 0;
          font-size: 32rpx;
          line-height: 1.7em;

          .label {
            color: $text-font-color-3;
            width: 140rpx;
            text-align: right;
            font-size: 30rpx;
          }

          .value {
            flex: 1;
            width: 0;
          }

          .ratebox {
            display: flex;
            align-items: center;

            .score {
              font-size: 26rpx;
              color: $text-font-color-2;
              padding-left: 10rpx;
            }
          }

          .tabs {
            display: flex;
            flex-wrap: wrap;

            .tab {
              border: 1px solid $brand-theme-color;
              color: $brand-theme-color;
              font-size: 22rpx;
              padding: 10rpx 30rpx;
              border-radius: 40rpx;
              line-height: 1em;
              margin: 0 10rpx 10rpx 0;
            }
          }
        }

        .copyright {
          font-size: 28rpx;
          padding: 20rpx;
          background: #f6f6f6;
          color: #666;
          border-radius: 10rpx;
          margin: 20rpx 0;
          line-height: 1.6em;
        }
      }
    }
  }

  .scorepopup {
    background: #fff;
    padding: 30rpx;
    width: 70vw;
    border-radius: 30rpx;

    .content {
      padding: 30rpx 0;
      display: flex;
      justify-content: center;
      align-items: center;

      .text {
        color: #ffca3e;
        padding-left: 10rpx;
        width: 80rpx;
        line-height: 1em;
        text-align: right;
      }
    }

    .footer {
      padding: 10rpx 0;
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }
}
</style>
