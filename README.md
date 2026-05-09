# 笃北科技 · 企业 AI 智能体数据平台

Vue 3 + TypeScript + Vite。本地开发：`npm install` → `npm run dev`。生产构建：`npm run build`（产物在 `dist/`）。

## GitHub Pages

本仓库面向 GitHub Pages 项目站部署，线上地址为：

**[https://mYummy1.github.io/doBell/](https://mYummy1.github.io/doBell/)**

构建时 `base` 为 `/doBell/`（与仓库名一致）；本地 `npm run dev` 仍使用 `/`。

### 首次推送到 GitHub

在本地项目根目录执行（需已安装 [Git](https://git-scm.com/) 并登录 GitHub）：

```bash
git init
git add .
git commit -m "Initial commit: Vue app for GitHub Pages"
git branch -M main
git remote add origin https://github.com/mYummy1/doBell.git
git push -u origin main
```

若远程仓库已有提交，请先 `git pull origin main --rebase` 再推送。

### 开启 Pages

1. 打开仓库 [mYummy1/doBell](https://github.com/mYummy1/doBell) → **Settings** → **Pages**。  
2. **Build and deployment** → **Source** 选择 **GitHub Actions**。  
3. 推送至 `main`（或 `master`）分支后，工作流 [.github/workflows/deploy-github-pages.yml](.github/workflows/deploy-github-pages.yml) 会自动构建并发布；完成后在 **Actions** 与 **Pages** 中可看到站点 URL。

工作流会在构建后复制 `index.html` 为 `404.html`，以便在 GitHub Pages 上刷新子路径（如 `/doBell/company`）时能回退到 SPA。
