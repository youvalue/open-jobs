# OpenJobs

> **The open hiring platform, built on the backbone of open source.**

Every resume is an Issue. Every job listing is an Issue. Every connection starts with a pull request to someone's career.

OpenJobs is a zero-cost, zero-infrastructure job marketplace built entirely on GitHub. No servers. No databases. No subscriptions. Just code, issues, and people finding each other.

---

## How It Works

```
You ──GitHub OAuth──▶ OpenJobs ──GitHub API──▶ GitHub Issues (your data)
                           │
                     GitHub Actions
                      ├── Spam detection
                      └── Email notifications
```

**Browse** resumes and jobs by country, city, and role.
**Post** your resume or open position — authenticated via GitHub, no passwords.
**Invite** candidates directly from any listing.

**→ [Try it now](https://youvalue.github.io/open-jobs)**

---

## Built Different

| | Traditional Platforms | OpenJobs |
|---|---|---|
| **Cost** | $200+/mo | $0 |
| **Infrastructure** | Servers, DBs, CDN | GitHub Pages |
| **Data** | Locked in their silo | Open Issues, your fork |
| **Auth** | Email/password | GitHub OAuth |
| **Moderation** | Black box | GitHub Actions + regex |
| **i18n** | Paid tier | 7 languages, JSON |

---

## 7 Languages

English · 中文 · 日本語 · Français · Русский · Deutsch · 한국어

Full i18n across UI, roles, countries, and cities. Switch language in one click.

---

## Architecture

Pure static SPA. Zero build step. Push to `main` → GitHub Pages deploys.

```
open-jobs/
├── app.js                    # SPA: routing, API, i18n, OAuth
├── index.html                # Shell
├── styles.css                # Design system
├── locales/{lang}.json       # 8 languages
├── config/
│   ├── country-language.json # Country → language mapping
│   ├── roles.json            # 26 job role tags
│   └── cities/{CODE}.json   # City data per country
└── .github/workflows/
    ├── moderate.yml          # Spam detection on issue open/edit
    └── send-email.yml        # Email dispatch
```

---

## License

MIT
