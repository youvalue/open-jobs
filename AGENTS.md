# OpenJobs — AGENTS.md

## Architecture

Pure static SPA, zero build step. Served via GitHub Pages (root directory).

| Layer | Tech |
|-------|------|
| Frontend | Vanilla JS, single `app.js` (~660 lines) |
| Data | GitHub Issues + Labels |
| Auth | GitHub OAuth Device Flow (`app.js:92`) |
| Hosting | GitHub Pages |
| Automation | GitHub Actions (2 workflows) |
| i18n | JSON files in `locales/` (8 languages) |

## Key Quirks & Gotchas

- **OAuth Device Flow** goes through a self-hosted Cloudflare Worker (`openjobs.631008982.workers.dev`) — GitHub's `github.com/login/device/code` endpoint rejects browser CORS. The proxy is the only workaround for a serverless static site.
- **City data** loads dynamically per country code (`config/cities/{CODE}.json`). Every country in `config/country-language.json` needs a matching city file, or it 404s.
- **No build/lint/test** — no `package.json`, no bundler, no typechecker. Edit directly, commit, push. GitHub Pages auto-deploys from `main`.
- **No test suite** exists. Validate changes by opening `index.html` locally or pushing to Pages.
- **Actions avoid trigger loops**: `moderate.yml` runs on `issues: [opened, edited]` but Actions-triggered events (closing issues, adding labels) do NOT re-trigger the workflow by default.
- **send-email.yml** only logs to console. Replace the `console.log` with an actual Resend/SendGrid API call after setting `EMAIL_API_KEY` in repo Secrets.
- **OAuth `clientId`** is in `app.js:6`. Must be a GitHub OAuth App (not a GitHub App).

## Project Structure

```
open-jobs/
├── app.js              # All JS: routing, API, i18n, OAuth, markdown renderer
├── index.html          # SPA shell
├── styles.css          # All CSS
├── locales/{lang}.json # 8 languages: en, zh, ja, fr, ru, de, ko
├── config/
│   ├── country-language.json   # country_code → language_code mapping
│   ├── roles.json              # job role tags
│   └── cities/{CODE}.json     # city list per country (must match country keys)
└── .github/workflows/
    ├── moderate.yml            # Spam detection on issue open/edit
    └── send-email.yml          # Email dispatch on `action/send-email` label
```

## Label System

Every Issue must carry these labels:

| Prefix | Example | Purpose |
|--------|---------|---------|
| `type-` | `type-resume`, `type-job` | Filters the main tabs |
| `country-` | `country-CN` | ISO 3166-1 alpha-2 |
| `city-` | `city-Beijing` | English name, no spaces |
| `role-` | `role-frontend` | From `config/roles.json` |
| `status-` | `status-open`, `status-closed` | Issue state |
| — | `reviewed`, `spam` | Moderation result |

Search example: `?labels=type-resume,country-CN,city-Beijing,role-frontend`

## Deployment

Push to `main`. GitHub Pages serves from root. No build step.

## Adding a language

1. Create `locales/{code}.json` with the same keys as `en.json`
2. Add to `app.js` language selector (around line 640) + allowed list (around line 634)
3. Create `config/cities/{CODE}.json` if adding a new country
4. Add to `config/country-language.json`

## Adding a country

1. Add entry to `config/country-language.json`
2. Create `config/cities/{CODE}.json` with 5-20 city names
3. City file is fetched dynamically — missing file = 404 console error (non-fatal, cities just won't populate)
