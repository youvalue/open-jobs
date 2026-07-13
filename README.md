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

## 🇫🇷 Français

**OpenJobs** est une plateforme d'emploi ouverte et gratuite, construite entièrement sur l'écosystème GitHub. Zéro serveur, zéro coût.

### Utilisation

1. **Parcourir** : Rendez-vous sur le [site GitHub Pages](https://youvalue.github.io/open-jobs) pour voir les CV et offres.
2. **Publier** : Cliquez sur "Publier" et connectez-vous avec GitHub pour soumettre votre CV ou offre.
3. **Filtrer** : Utilisez les filtres par pays, ville et rôle.
4. **Inviter** : Cliquez sur "Envoyer une invitation" pour contacter l'auteur.

### Configuration

1. Créer une OAuth App GitHub (Settings > Developer settings > OAuth Apps)
2. Définir `clientId` dans `app.js`
3. Activer GitHub Pages (racine du dépôt)
4. (Optionnel) Ajouter `EMAIL_API_KEY` dans les Secrets

---

## 🇷🇺 Русский

**OpenJobs** — это полностью бесплатная открытая платформа вакансий и резюме, построенная на экосистеме GitHub. Без сервера, без базы данных, без затрат.

### Использование

1. **Просмотр**: Перейдите на [GitHub Pages сайт](https://youvalue.github.io/open-jobs) для просмотра резюме и вакансий.
2. **Публикация**: Нажмите "Опубликовать" и войдите через GitHub, чтобы разместить резюме или вакансию.
3. **Фильтр**: Используйте фильтры по стране, городу и должности.
4. **Приглашение**: Нажмите "Пригласить на собеседование" на странице объявления.

### Настройка

1. Создайте GitHub OAuth App (Settings > Developer settings > OAuth Apps)
2. Укажите `clientId` в `app.js`
3. Включите GitHub Pages (корневая директория)
4. (Опционально) Добавьте `EMAIL_API_KEY` в Secrets

---

## 🇩🇪 Deutsch

**OpenJobs** ist eine völlig kostenlose, offene Job- und Lebenslauf-Plattform, die vollständig auf dem GitHub-Ökosystem basiert. Kein Server, keine Datenbank, keine Kosten.

### Verwendung

1. **Durchsuchen**: Besuchen Sie die [GitHub Pages Seite](https://youvalue.github.io/open-jobs) um Lebensläufe und Stellen zu durchsuchen.
2. **Veröffentlichen**: Klicken Sie auf "Veröffentlichen" und melden Sie sich mit GitHub an.
3. **Filtern**: Nutzen Sie die Filter nach Land, Stadt und Rolle.
4. **Einladen**: Klicken Sie auf "Einladung zum Vorstellungsgespräch" um den Autor zu kontaktieren.

### Einrichtung

1. GitHub OAuth App erstellen (Settings > Developer settings > OAuth Apps)
2. `clientId` in `app.js` setzen
3. GitHub Pages aktivieren (Root-Verzeichnis)
4. (Optional) `EMAIL_API_KEY` zu Secrets hinzufügen

---

## 🇰🇷 한국어

**OpenJobs**는 GitHub 생태계를 기반으로 구축된 완전 무료 오픈 채용 플랫폼입니다. 서버 비용이 전혀 들지 않습니다.

### 사용 방법

1. **둘러보기**: [GitHub Pages 사이트](https://youvalue.github.io/open-jobs)에서 이력서와 채용 공고를 확인하세요.
2. **게시**: "게시" 버튼을 클릭하고 GitHub 계정으로 로그인하여 이력서나 채용 공고를 올리세요.
3. **필터**: 국가, 도시, 직무별로 결과를 필터링할 수 있습니다.
4. **초대**: 상세 페이지에서 "면접 초대 보내기"를 클릭하여 게시자에게 연락하세요.

### 설정

1. GitHub OAuth App 생성 (Settings > Developer settings > OAuth Apps)
2. `app.js`에서 `clientId` 설정
3. GitHub Pages 활성화 (루트 디렉토리)
4. (선택) Secrets에 `EMAIL_API_KEY` 추가

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
| i18n | JSON locale files (en/zh/ja/fr/ru/de/ko) |

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
