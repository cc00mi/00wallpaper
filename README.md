# 00wallpaper

基于 `uni-app + Vue 3 setup` 的壁纸项目。

当前仓库已经支持：

- 原始 `HBuilderX` 开发运行方式
- 在线网站直接体验
- GitHub Actions 自动构建并部署到 GitHub Pages
- 通过独立 Node 代理解决 H5 浏览器跨域取数问题

## 运行方式

## 1. 在 HBuilderX 中运行

这是保留原项目习惯的运行方式，适合本地开发、调试和继续二次开发。

### 步骤

1. 用 `HBuilderX` 打开项目根目录
2. 安装依赖
3. 根据你的需要运行到：
   - 浏览器
   - 小程序模拟器
   - App

### 接口说明

原项目接口来自：

- `https://tea.qingnian8.com/api/bizhi`

原始请求入口在：

- [src/utils/request.js](C:/Users/陈铃/Documents/Codex/2026-05-12/files-mentioned-by-the-user-f76aaebcc10b10007caea90579a2dfa5-4/target_repo/src/utils/request.js)

如果不配置 H5 代理地址，项目会继续按原逻辑直连上游接口。

---

## 2. 直接在线网站体验

点击即可访问：

- [在线体验 00wallpaper](https://cc00mi.github.io/00wallpaper/)

当前线上版本通过：

- GitHub Pages 托管前端
- Railway 托管代理

代理地址是：

- `https://00wallpaper-production.up.railway.app/api/bizhi`

---

## 3. 自己部署一套

如果你想复刻自己的线上版本，需要两部分：

1. 前端部署到 GitHub Pages
2. 代理部署到 Railway

## 3.1 前端部署到 GitHub Pages

### GitHub Pages 设置

进入：

```text
Settings -> Pages
```

把 Source 设为：

```text
GitHub Actions
```

### 配置构建变量

进入：

```text
Settings -> Secrets and variables -> Actions -> Variables
```

新增：

```text
VITE_API_BASE_URL=https://你的代理域名/api/bizhi
```

例如当前项目使用的是：

```text
VITE_API_BASE_URL=https://00wallpaper-production.up.railway.app/api/bizhi
```

### 自动部署工作流

工作流文件在：

- [.github/workflows/deploy.yml](C:/Users/陈铃/Documents/Codex/2026-05-12/files-mentioned-by-the-user-f76aaebcc10b10007caea90579a2dfa5-4/target_repo/.github/workflows/deploy.yml)

推送到 `main` 后会自动触发构建和发布。

---

## 3.2 代理部署到 Railway

### 选择仓库

在 Railway 中：

1. 选择 `Deploy from GitHub repo`
2. 选择仓库 `cc00mi/00wallpaper`

### 设置 Root Directory

必须设置为：

```text
proxy-server
```

因为真正的代理服务在这个子目录下，不在仓库根目录。

### 配置 Railway 变量

至少配置：

```text
ALLOWED_ORIGIN=https://cc00mi.github.io
UPSTREAM_ACCESS_KEY=1328433750wuli@
TARGET_ORIGIN=https://tea.qingnian8.com
TARGET_PREFIX=/api/bizhi
PROXY_PREFIX=/api/bizhi
```

### 生成公网域名

Railway 部署成功后，生成一个公网地址，格式类似：

```text
https://xxxx.up.railway.app
```

注意：

- `railway.internal` 是内网地址
- 不能给浏览器和 GitHub Pages 使用
- 必须使用 Railway 分配的公网域名

代理代码入口在：

- [proxy-server/server.js](C:/Users/陈铃/Documents/Codex/2026-05-12/files-mentioned-by-the-user-f76aaebcc10b10007caea90579a2dfa5-4/target_repo/proxy-server/server.js)

---

## 本地运行补充

## 前端本地 H5 运行

你可以在仓库根目录准备一个 `.env`：

```env
VITE_API_BASE_URL=https://你的代理域名/api/bizhi
```

示例见：

- [.env.example](C:/Users/陈铃/Documents/Codex/2026-05-12/files-mentioned-by-the-user-f76aaebcc10b10007caea90579a2dfa5-4/target_repo/.env.example)

## 代理本地运行

进入代理目录：

```bash
cd proxy-server
node server.js
```

默认监听：

```text
http://localhost:8787
```

代理变量示例见：

- [proxy-server/.env.example](C:/Users/陈铃/Documents/Codex/2026-05-12/files-mentioned-by-the-user-f76aaebcc10b10007caea90579a2dfa5-4/target_repo/proxy-server/.env.example)

---

## 项目结构

- `src/`：前端源码
- `proxy-server/`：Node 代理服务
- `.github/workflows/deploy.yml`：GitHub Pages 自动部署工作流
- `docs/uniapp-github-cicd-pages-sop.md`：完整 SOP 与底层技术分析

---

## 为什么 H5 需要代理

这个项目虽然最终前端会构建成静态页面，但页面运行时仍然依赖外部 API。

上游接口：

- `https://tea.qingnian8.com/api/bizhi`

不对 GitHub Pages 浏览器环境返回可用的 CORS 允许头，所以：

- 页面外壳可以打开
- 但浏览器会拦截数据请求

因此线上版本最终采用的是：

- GitHub Pages 托管前端
- Railway 托管代理

如果你想看完整 SOP、底层原理、以及它和普通静态页面部署的本质差异，请看：

- [docs/uniapp-github-cicd-pages-sop.md](C:/Users/陈铃/Documents/Codex/2026-05-12/files-mentioned-by-the-user-f76aaebcc10b10007caea90579a2dfa5-4/target_repo/docs/uniapp-github-cicd-pages-sop.md)

