# MergeMint MVP

This app now ships the MergeMint MVP flow:

- Supabase schema for organizations, memberships, GitHub sync, evaluations, scoring, and leaderboards.
- GitHub cron endpoints (`/api/mergemint/sync`, `/api/mergemint/evaluations/run`) guarded by `MERGEMINT_CRON_SECRET`.
- Admin UI (`/home/mergemint` → select org → `/[orgSlug]/admin`) to edit components, severities, prompt template, and trigger sync/eval runs.
- Developer views for my scores (`/[orgSlug]/me`), leaderboard (`/[orgSlug]/leaderboard`), and evaluated PRs (`/[orgSlug]/prs/...`).

Environment helpers:

- `GITHUB_TOKEN`, `GITHUB_TOKEN_<ORG_ID>` or `GITHUB_TOKEN_<ORG_SLUG>` for GitHub access (tokens stay in env, only hashes stored).
- `OPENAI_API_KEY` (or `MERGEMINT_LLM_API_KEY`) for the default OpenAI-compatible LLM client.
- `MERGEMINT_CRON_SECRET` for cron endpoints.

Known fixes applied:
- i18n resolver now unwraps JSON default export so translations render correctly on auth and other pages.
