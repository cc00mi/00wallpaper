# 00wallpaper

基于 `uni-app + Vue 3 setup` 的壁纸项目，已经补上 GitHub Pages 的前端部署流程。

## 当前结构
- `src/`：前端源码
- `.github/workflows/deploy.yml`：GitHub Pages 自动部署
- `proxy-server/`：给 H5 站点使用的后端代理

## 为什么需要代理
原始接口 `https://tea.qingnian8.com/api/bizhi` 不给 GitHub Pages 浏览器请求返回 CORS 允许头，所以前端上线后页面壳子能打开，但拿不到壁纸数据。

## 前端部署
前端仍然部署到 GitHub Pages。

在 GitHub 仓库里新增一个 Repository Variable：

- 名称：`VITE_API_BASE_URL`
- 值：`https://你的代理域名/api/bizhi`

然后重新运行 Pages workflow。

本地开发也可以新建 `.env`：

```env
VITE_API_BASE_URL=https://你的代理域名/api/bizhi
```

## 代理服务
`proxy-server/` 是一个最小 Node 18 代理，作用是：

- 接收浏览器请求
- 转发到 `https://tea.qingnian8.com/api/bizhi`
- 给前端补上 CORS 头

### 本地启动
```bash
cd proxy-server
node server.js
```

默认地址：

- `http://localhost:8787/api/bizhi`

### 代理环境变量
参考 [proxy-server/.env.example](C:/Users/陈铃/Documents/Codex/2026-05-12/files-mentioned-by-the-user-f76aaebcc10b10007caea90579a2dfa5-4/target_repo/proxy-server/.env.example)

关键变量：

- `ALLOWED_ORIGIN=https://cc00mi.github.io`
- `UPSTREAM_ACCESS_KEY=1328433750wuli@`
- `TARGET_ORIGIN=https://tea.qingnian8.com`
- `TARGET_PREFIX=/api/bizhi`

## 说明
- H5 如果配置了 `VITE_API_BASE_URL`，前端就会优先走代理
- 没配置时，前端仍会直连原接口
- 直连原接口在 GitHub Pages 浏览器环境下会被 CORS 拦截
