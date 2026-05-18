# 00wallpaper

基于 `uni-app + Vue 3 setup` 的壁纸项目，已经改造成：

- 前端通过 GitHub Actions 自动构建
- H5 自动部署到 GitHub Pages
- 通过独立 Node 代理解决浏览器跨域取数问题

## 在线访问

- 前端站点：
  `https://cc00mi.github.io/00wallpaper/`
- 代理服务：
  `https://00wallpaper-production.up.railway.app/api/bizhi`

你可以直接访问前端站点体验页面效果。

## 两种运行方式

## 方式一：直接访问已部署版本

适合只想体验，不想自己部署的人。

直接打开：

- `https://cc00mi.github.io/00wallpaper/`

## 方式二：自己完整部署

适合想复刻一套自己的 GitHub Pages + 代理服务的人。

完整流程分两部分：

1. 部署前端到 GitHub Pages
2. 部署代理到 Railway

---

## 前端部署到 GitHub Pages

### 1. 准备仓库

确保仓库里已经有：

- `src/`
- `package.json`
- `vite.config.js`
- `.github/workflows/deploy.yml`

### 2. 配置 GitHub Pages

进入：

```text
Settings -> Pages
```

把 Source 设为：

```text
GitHub Actions
```

### 3. 配置前端代理地址变量

进入：

```text
Settings -> Secrets and variables -> Actions -> Variables
```

新增变量：

```text
VITE_API_BASE_URL=https://你的代理域名/api/bizhi
```

例如当前项目使用的是：

```text
VITE_API_BASE_URL=https://00wallpaper-production.up.railway.app/api/bizhi
```

### 4. 触发构建

推送代码到 `main`，或者在 Actions 页面手动 `Re-run`。

构建完成后，GitHub Pages 会自动发布。

---

## 代理服务部署到 Railway

### 1. 选择仓库

在 Railway 里选择：

- `Deploy from GitHub repo`
- 选择仓库 `cc00mi/00wallpaper`

### 2. 设置 Root Directory

必须设置为：

```text
proxy-server
```

因为真正的代理服务不在仓库根目录，而在这个子目录下。

### 3. 配置 Railway 变量

建议至少配置这几个：

```text
ALLOWED_ORIGIN=https://cc00mi.github.io
UPSTREAM_ACCESS_KEY=1328433750wuli@
TARGET_ORIGIN=https://tea.qingnian8.com
TARGET_PREFIX=/api/bizhi
PROXY_PREFIX=/api/bizhi
```

### 4. 生成公网域名

Railway 部署成功后，生成一个公网域名，格式类似：

```text
https://xxxx.up.railway.app
```

注意：

- `railway.internal` 是内网地址
- 浏览器和 GitHub Pages 不能用它
- 必须使用 Railway 给的公网域名

---

## 本地运行

## 前端本地运行

你可以在仓库根目录准备一个 `.env`：

```env
VITE_API_BASE_URL=https://你的代理域名/api/bizhi
```

然后按 `uni-app` 的 H5 方式运行。

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

完整代理示例变量见：

- [proxy-server/.env.example](C:/Users/陈铃/Documents/Codex/2026-05-12/files-mentioned-by-the-user-f76aaebcc10b10007caea90579a2dfa5-4/target_repo/proxy-server/.env.example)

---

## 项目结构

- `src/`：前端源码
- `.github/workflows/deploy.yml`：GitHub Pages 自动部署 workflow
- `proxy-server/`：Node 代理服务
- `docs/uniapp-github-cicd-pages-sop.md`：完整部署 SOP 与底层原理博客

---

## 为什么不能只部署静态页面

这个项目虽然前端最终是静态产物，但运行时仍然依赖外部 API。

原接口：

- `https://tea.qingnian8.com/api/bizhi`

在浏览器环境下不返回可用的 CORS 允许头，所以：

- 页面壳子可以打开
- 但浏览器会拦截接口数据

这就是为什么项目最终需要：

- GitHub Pages 托管前端
- Railway 托管代理

如果你想看完整技术分析，请直接看：

- [docs/uniapp-github-cicd-pages-sop.md](C:/Users/陈铃/Documents/Codex/2026-05-12/files-mentioned-by-the-user-f76aaebcc10b10007caea90579a2dfa5-4/target_repo/docs/uniapp-github-cicd-pages-sop.md)

---

## 相关文件

- 前端请求入口：
  [src/utils/request.js](C:/Users/陈铃/Documents/Codex/2026-05-12/files-mentioned-by-the-user-f76aaebcc10b10007caea90579a2dfa5-4/target_repo/src/utils/request.js)
- GitHub Pages workflow：
  [.github/workflows/deploy.yml](C:/Users/陈铃/Documents/Codex/2026-05-12/files-mentioned-by-the-user-f76aaebcc10b10007caea90579a2dfa5-4/target_repo/.github/workflows/deploy.yml)
- 代理服务入口：
  [proxy-server/server.js](C:/Users/陈铃/Documents/Codex/2026-05-12/files-mentioned-by-the-user-f76aaebcc10b10007caea90579a2dfa5-4/target_repo/proxy-server/server.js)

