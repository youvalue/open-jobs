# OpenJobs

> Open job platform for everyone — built on GitHub Issues, zero server cost.

---

## 🇬🇧 English

**OpenJobs** is a completely free, open job and resume platform built entirely on the GitHub ecosystem. No server, no database, no cost.

### How it works

- **Data**: Every resume or job posting is a GitHub Issue in this repository.
- **Labels**: Standardized labels (`type-`, `country-`, `city-`, `role-`, `status-`) enable multi-dimensional filtering.
- **Auth**: Login via GitHub OAuth Device Flow — no password needed.
- **Frontend**: Pure static SPA hosted on GitHub Pages.
- **Automation**: GitHub Actions handles spam moderation and email notifications.

### Quick Start

1. **Browse**: Go to the [GitHub Pages site](https://youvalue.github.io/open-jobs) to browse resumes and jobs.
2. **Post**: Click "Post" to submit your resume or job listing. You'll need a GitHub account.
3. **Filter**: Use country, city, and role filters to narrow down results.
4. **Invite**: Click "Send Interview Invitation" on any listing to contact the poster.

### Setup (for contributors)

1. Fork this repo and enable GitHub Pages (root directory).
2. Create a GitHub OAuth App (Settings > Developer settings > OAuth Apps).
3. Set `clientId` in `app.js` to your OAuth App's Client ID.
4. (Optional) Add `EMAIL_API_KEY` to repo Secrets for email notifications.

---

## 🇨🇳 中文

**OpenJobs** 是一个完全免费、基于 GitHub Issues 的开放求职招聘平台，零服务器成本。

### 使用说明

1. **浏览**：访问 [GitHub Pages 站点](https://youvalue.github.io/open-jobs) 查看简历和招聘信息。
2. **发布**：点击"发布"按钮，用 GitHub 账号登录后即可提交简历或招聘信息。
3. **筛选**：按国家、城市、职业等多维度组合过滤。
4. **邀请**：在详情页点击"发送面试邀请"，对方会收到邮件通知。

### 技术原理

- 每条简历/招聘 = 一个 GitHub Issue
- 标签体系实现多维过滤（`type-`、`country-`、`city-`、`role-`、`status-`）
- GitHub OAuth Device Flow 登录，无需密码
- GitHub Actions 自动审核垃圾内容
- 纯静态前端，零服务器成本

---

## 🇯🇵 日本語

**OpenJobs** は GitHub Issues をデータベースとして使用する、完全無料のオープンな求人・履歴書プラットフォームです。

### 使い方

1. **閲覧**: [GitHub Pages サイト](https://youvalue.github.io/open-jobs) で履歴書や求人を閲覧できます。
2. **投稿**: 「投稿」ボタンから GitHub アカウントでログインし、履歴書または求人情報を投稿します。
3. **フィルター**: 国、都市、職種で検索結果を絞り込めます。
4. **招待**: 詳細ページから「面接を招待」ボタンで連絡できます。

### セットアップ（開発者向け）

1. GitHub OAuth App を作成（Settings > Developer settings > OAuth Apps）
2. `app.js` の `clientId` を設定
3. GitHub Pages を有効化（ルートディレクトリ）
4. （任意）`EMAIL_API_KEY` を Secrets に追加

---

## 🇨🇳 中文

**OpenJobs** 是一个完全基于 GitHub Issues 的开放求职招聘平台，零服务器成本。

### 使用说明

1. **浏览**：访问 [GitHub Pages 站点](https://youvalue.github.io/open-jobs) 查看简历和招聘信息。
2. **发布**：点击"发布"按钮，用 GitHub 账号登录后即可提交。
3. **筛选**：按国家、城市、职业等多维度组合过滤。
4. **邀请**：在详情页点击"发送面试邀请"，系统会通过邮件通知对方。

### 开发配置

1. 创建 GitHub OAuth App（Settings > Developer settings > OAuth Apps）
2. 将 `app.js` 中的 `clientId` 替换为你的 OAuth App Client ID
3. 启用 GitHub Pages（源选根目录）
4. （可选）在 Secrets 中添加 `EMAIL_API_KEY` 启用邮件通知

---

## 🇯🇵 日本語

**OpenJobs** は GitHub Issues をデータベースとして使用する、完全無料のオープンな求人・履歴書プラットフォームです。サーバー費用は一切かかりません。

### 使い方

1. **閲覧**: [GitHub Pages サイト](https://youvalue.github.io/open-jobs) で履歴書や求人情報を閲覧できます。
2. **投稿**: 「投稿」ボタンから GitHub アカウントでログインし、履歴書または求人を投稿します。
3. **フィルター**: 国、都市、職種で検索結果を絞り込めます。
4. **招待**: 詳細ページから「面接を招待」で連絡できます。

### セットアップ

1. GitHub OAuth App を作成（Settings > Developer settings > OAuth Apps）
2. `app.js` の `clientId` を設定
3. GitHub Pages を有効化（ルートディレクトリ）
4. （任意）`EMAIL_API_KEY` を Secrets に追加

---

## Architecture

```
[GitHub Pages Static SPA]
    |         ↑
    |   GitHub API (Issues CRUD, OAuth)
    ↓         |
[GitHub Issues Database] ←→ [GitHub Actions]
  - resumes / jobs            - spam moderation
  - label-based filtering     - email notifications
```

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Vanilla JS SPA, no framework |
| Auth | GitHub OAuth Device Flow |
| Data | GitHub Issues + Labels |
| Automation | GitHub Actions |
| Hosting | GitHub Pages |
| i18n | JSON locale files (en/zh/ja) |

### Label System

| Category | Prefix | Example |
|----------|--------|---------|
| Type | `type-` | `type-resume`, `type-job` |
| Country | `country-` | `country-CN`, `country-US` |
| City | `city-` | `city-Beijing`, `city-NewYork` |
| Role | `role-` | `role-frontend`, `role-backend` |
| Status | `status-` | `status-open`, `status-closed` |
| Review | — | `reviewed`, `spam` |

### License

MIT
