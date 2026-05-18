const DIRECT_BASE_URL = "https://tea.qingnian8.com/api/bizhi";
const H5_PROXY_BASE_URL =
  (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_API_BASE_URL) || "";
const BASE_URL = H5_PROXY_BASE_URL || DIRECT_BASE_URL;
const SHOULD_SEND_ACCESS_KEY = !H5_PROXY_BASE_URL;

export function request(config = {}) {
  let { url, data = {}, method = "GET", header = {} } = config;

  url = BASE_URL + url;

  if (SHOULD_SEND_ACCESS_KEY) {
    header["access-key"] = "1328433750wuli@";
  }

  return new Promise((resolve, reject) => {
    uni.request({
      url,
      data,
      method,
      header,
      success: (res) => {
        if (res.data.errCode === 0) {
          resolve(res.data);
        } else if (res.data.errCode === 400) {
          uni.showModal({
            title: "错误提示",
            content: res.data.errMsg,
            showCancel: false,
          });
          reject(res.data);
        } else {
          uni.showToast({
            title: res.data.errMsg || "请求失败",
            icon: "none",
          });
          reject(res.data);
        }
      },
      fail: (err) => {
        reject(err);
      },
    });
  });
}
