<p align="center">
  <img src="https://raw.githubusercontent.com/kirankotari/ossguard-app/main/assets/ossguard.png" width="120" height="120" alt="OSSGuard">
</p>

<h1 align="center">OSSGuard Dashboard</h1>

<p align="center">
  <strong>Bird's eye view of OpenSSF security posture across all your repositories</strong>
</p>

<p align="center">
  <a href="https://kirankotari.github.io/ossguard-dashboard/"><img src="https://img.shields.io/badge/Live-Dashboard-blue?logo=github" alt="Live"></a> <a href="LICENSE"><img src="https://img.shields.io/badge/License-Apache_2.0-blue.svg" alt="License"></a>
</p>

## What It Does

Sign in with your GitHub token and instantly see the OpenSSF Scorecard status of every repository you own or your organizations maintain.

- **Org & User views** — Switch between your personal repos and any org you belong to
- **Scorecard scores** — Real-time OpenSSF Scorecard for every public repo
- **Favorites** — Pin repos you want to track closely
- **Search & sort** — Filter by name, sort by score (worst first), activity, or name
- **Drill-down** — Click any repo to see individual Scorecard check results
- **Zero cost** — 100% client-side, hosted on GitHub Pages, no backend

## Architecture

```
GitHub Pages (static)     Browser (client-side)
┌─────────────────┐      ┌──────────────────────────┐
│  React SPA      │─────▶│  GitHub API (user token)  │
│  (Vite build)   │      │  Scorecard API (public)   │
└─────────────────┘      └──────────────────────────┘
                         Storage: localStorage
```

- **No backend, no database** — GitHub IS your backend
- **Your token stays local** — never sent to any server
- **Your API quota** — calls use your own GitHub rate limit (5,000/hr)

## Tech Stack

| Layer | Tech |
|-------|------|
| Framework | React 19, TypeScript, Vite |
| Styling | TailwindCSS 4 |
| Icons | Lucide React |
| State | Zustand (persisted to localStorage) |
| GitHub API | Octokit |
| Scorecard | api.scorecard.dev (public, no auth) |
| Deploy | GitHub Pages via Actions |

## Development

```bash
npm install
npm run dev      # http://localhost:5174
npm run build    # Production build → dist/
```

## Related

- [ossguard](https://github.com/kirankotari/ossguard) — Documentation and coordinated releases
- [ossguard-app](https://github.com/kirankotari/ossguard-app) — GitHub Action for PR security review
- [ossguard-python](https://github.com/kirankotari/ossguard-python) — Python CLI
- [ossguard-go](https://github.com/kirankotari/ossguard-go) — Go CLI
- [ossguard-npm](https://github.com/kirankotari/ossguard-npm) — Node.js CLI

## License

Apache-2.0
