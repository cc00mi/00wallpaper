<template>
  <view class="searchLayout">
    <view class="search">
      <uni-search-bar
        v-model="queryParams.keyword"
        focus
        placeholder="搜索"
        @confirm="onSearch"
        @cancel="onClear"
        @clear="onClear"
      ></uni-search-bar>
    </view>

    <view v-if="!classList.length || noSearch">
      <view v-if="historySearch.length" class="history">
        <view class="topTitle">
          <view class="text">最近搜索</view>
          <view class="icon" @click="removeHistory">
            <uni-icons type="trash" size="25"></uni-icons>
          </view>
        </view>
        <view class="tabs">
          <view
            v-for="tab in historySearch"
            :key="tab"
            class="tab"
            @click="clickTab(tab)"
          >
            {{ tab }}
          </view>
        </view>
      </view>

      <view class="recommend">
        <view class="topTitle">
          <view class="text">热门搜索</view>
        </view>
        <view class="tabs">
          <view
            v-for="tab in recommendList"
            :key="tab"
            class="tab"
            @click="clickTab(tab)"
          >
            {{ tab }}
          </view>
        </view>
      </view>
    </view>

    <view v-if="noSearch" class="noSearch">
      <uv-empty mode="search" icon="http://cdn.uviewui.com/uview/empty/search.png"></uv-empty>
    </view>

    <view v-else>
      <view class="list">
        <navigator
          v-for="item in classList"
          :key="item._id"
          class="item"
          :url="`/pages/preview/preview?id=${item._id}`"
        >
          <image :src="item.smallPicurl" mode="aspectFill"></image>
        </navigator>
      </view>
      <view v-if="noData || classList.length" class="loadingLayout">
        <uni-load-more :status="noData ? 'noMore' : 'loading'"></uni-load-more>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from "vue";
import { onReachBottom, onUnload } from "@dcloudio/uni-app";
import { apiSearchData } from "@/api/apis.js";

const queryParams = ref({
  pageNum: 1,
  pageSize: 12,
  keyword: "",
});

const historySearch = ref(uni.getStorageSync("historySearch") || []);
const recommendList = ref(["美女", "帅哥", "宠物", "卡通"]);
const noData = ref(false);
const noSearch = ref(false);
const classList = ref([]);

const initParams = (value = "") => {
  classList.value = [];
  noData.value = false;
  noSearch.value = false;
  queryParams.value = {
    pageNum: 1,
    pageSize: 12,
    keyword: value,
  };
};

const searchData = async () => {
  try {
    const res = await apiSearchData(queryParams.value);
    classList.value = [...classList.value, ...res.data];
    uni.setStorageSync("storageClassList", classList.value);

    if (queryParams.value.pageSize > res.data.length) {
      noData.value = true;
    }

    if (res.data.length === 0 && classList.value.length === 0) {
      noSearch.value = true;
    }
  } finally {
    uni.hideLoading();
  }
};

const onSearch = () => {
  if (!queryParams.value.keyword) {
    initParams();
    return;
  }

  uni.showLoading({ title: "搜索中..." });
  historySearch.value = [...new Set([queryParams.value.keyword, ...historySearch.value])].slice(0, 10);
  uni.setStorageSync("historySearch", historySearch.value);
  initParams(queryParams.value.keyword);
  searchData();
};

const onClear = () => {
  initParams();
};

const clickTab = (value) => {
  queryParams.value.keyword = value;
  onSearch();
};

const removeHistory = () => {
  uni.showModal({
    title: "是否清空历史搜索？",
    success: (res) => {
      if (res.confirm) {
        uni.removeStorageSync("historySearch");
        historySearch.value = [];
      }
    },
  });
};

onReachBottom(() => {
  if (noData.value || !queryParams.value.keyword) {
    return;
  }

  queryParams.value.pageNum += 1;
  searchData();
});

onUnload(() => {
  uni.removeStorageSync("storageClassList");
});
</script>

<style lang="scss" scoped>
.searchLayout {
  .search {
    padding: 0 10rpx;
  }

  .topTitle {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 32rpx;
    color: #999;
  }

  .history {
    padding: 30rpx;
  }

  .recommend {
    padding: 30rpx;
  }

  .tabs {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    padding-top: 20rpx;

    .tab {
      background: #f4f4f4;
      font-size: 28rpx;
      color: #333;
      padding: 10rpx 28rpx;
      border-radius: 50rpx;
      margin-right: 20rpx;
      margin-top: 20rpx;
    }
  }

  .list {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 5rpx;
    padding: 20rpx 5rpx;

    .item {
      height: 440rpx;

      image {
        width: 100%;
        height: 100%;
        display: block;
      }
    }
  }
}
</style>
