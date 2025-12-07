<p align="center">
  <img src="mergemint logo.png" alt="MergeMint Logo" width="400">
</p>

<p align="center">
  <strong>AI-powered PR scoring for bug bounties and developer recognition</strong>
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#quick-start">Quick Start</a> •
  <a href="#how-it-works">How It Works</a> •
  <a href="#configuration">Configuration</a> •
  <a href="#contributing">Contributing</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/license-CC%20BY--NC%204.0-blue.svg" alt="License">
  <img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg" alt="PRs Welcome">
  <img src="https://img.shields.io/badge/node-%3E%3D18-brightgreen.svg" alt="Node Version">
</p>

---

## What is MergeMint?

MergeMint is an open-source platform that automatically evaluates and scores pull requests using AI. Connect your GitHub organization, and MergeMint will:

- 🤖 **Analyze every merged PR** using Claude AI
- 🎯 **Classify components and severity** based on your configuration
- 🏆 **Calculate scores** with customizable multipliers
- 📊 **Power leaderboards** for developer recognition
- 💬 **Post comments** with evaluation details directly on PRs

Perfect for running internal bug bounty programs, performance reviews, or recognizing open source contributors.

## Features

### Core Platform

- **AI-Powered Evaluation** — Claude analyzes PR diffs, linked issues, and commit messages
- **Configurable Scoring** — Define components, multipliers, and severity levels
- **Real-time Dashboards** — Track team velocity, quality metrics, and contributor trends
- **Leaderboards** — Weekly MVP, top PRs, cumulative scores with gamification
- **PR Comments** — Instant feedback posted directly on merged PRs
- **Developer Profiles** — Individual pages showing score history and contribution patterns

### GitHub Integration

- **Webhook-driven** — Instant processing when PRs are merged
- **Diff Analysis** — Full access to code changes and file lists
- **Issue Linking** — Detects linked issues from PR descriptions
- **Backfill Support** — Process historical PRs on demand

### Self-Hosting

- **Open Source** — CC BY-NC 4.0 licensed, free for non-commercial use
- **Supabase Backend** — PostgreSQL with Row Level Security
- **Docker Ready** — Easy deployment on any infrastructure
- **Your API Keys** — Use your own Anthropic credentials

## Quick Start

### Prerequisites

- Node.js 18.x or later (LTS recommended)
- Docker (for Supabase local development)
- PNPM package manager
- Anthropic API key (for Claude)

### 1. Clone the Repository

```bash
git clone https://github.com/MergeMint/mergemint-app.git
cd mergemint-app
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Start Supabase

Make sure Docker is running, then:

```bash
pnpm run supabase:web:start
```

Access the Supabase Dashboard at [http://localhost:54323](http://localhost:54323).

### 4. Configure Environment Variables

Copy the example environment file and configure your settings:

```bash
cp apps/web/.env.example apps/web/.env.local
```

Required variables:

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SITE_URL` | Your app URL (e.g., `http://localhost:3000`) |
| `NEXT_PUBLIC_PRODUCT_NAME` | `MergeMint` |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase URL (default: `http://127.0.0.1:54321`) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key (from console) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key |
| `ANTHROPIC_API_KEY` | Your Anthropic API key for Claude |
| `GITHUB_APP_ID` | GitHub App ID |
| `GITHUB_APP_PRIVATE_KEY` | GitHub App private key (base64 encoded) |

### 5. Start the Development Server

```bash
pnpm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see MergeMint.

### 6. Set Up GitHub App

1. Go to GitHub Settings → Developer settings → GitHub Apps
2. Create a new GitHub App with these permissions:
   - **Repository permissions:**
     - Contents: Read
     - Pull requests: Read & Write
     - Issues: Read & Write
   - **Subscribe to events:**
     - Pull request
3. Generate a private key and add it to your `.env.local`
4. Install the app on your organization

## How It Works

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   GitHub    │───▶│  Webhook    │───▶│   Claude    │───▶│  Database   │
│  PR Merged  │    │  Received   │    │  Analysis   │    │   + Score   │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
                                                                │
                   ┌─────────────┐    ┌─────────────┐           │
                   │ PR Comment  │◀───│ Leaderboard │◀──────────┘
                   │   Posted    │    │   Updated   │
                   └─────────────┘    └─────────────┘
```

1. **Developer merges a PR** — Business as usual
2. **GitHub sends webhook** — MergeMint receives PR details
3. **Fetch diff** — MergeMint retrieves the full code diff
4. **AI evaluation** — Claude analyzes changes, classifies component/severity
5. **Score calculation** — Base points × multiplier = final score
6. **Store & notify** — Save to database, post PR comment, update leaderboards

### Scoring Formula

```
Final Score = Severity Base Points × Component Multiplier
```

Example:
- P1 severity (High) = 50 base points
- Auth component = 1.5× multiplier
- **Final Score = 50 × 1.5 = 75 points**

### Eligibility Criteria

PRs must pass these checks to earn points:

| Check | Description |
|-------|-------------|
| Issue Linked | PR fixes a reported issue or bug |
| Implementation | Code changes align with PR description |
| Documentation | PR has meaningful description |
| Tests | Includes tests or change is trivial |

## Configuration

### Components

Define the components of your product with multipliers:

```sql
INSERT INTO repo_components (repo_id, key, name, multiplier, description)
VALUES
  (repo_id, 'AUTH', 'Authentication', 1.5, 'Login, sessions, tokens'),
  (repo_id, 'PAYMENTS', 'Payments', 2.0, 'Billing, subscriptions'),
  (repo_id, 'API', 'API', 1.2, 'REST endpoints, GraphQL'),
  (repo_id, 'UI', 'User Interface', 1.0, 'Frontend components');
```

### Severity Levels

Configure severity levels with base points:

```sql
INSERT INTO severity_levels (org_id, key, name, base_points, sort_order)
VALUES
  (org_id, 'P0', 'Critical', 100, 1),
  (org_id, 'P1', 'High', 50, 2),
  (org_id, 'P2', 'Medium', 25, 3),
  (org_id, 'P3', 'Low', 10, 4);
```

### AI Model

MergeMint uses Claude by default. Configure the model in `scoring_rule_sets`:

```sql
UPDATE scoring_rule_sets 
SET model_name = 'claude-haiku-4-5-20251001'
WHERE org_id = your_org_id AND is_default = true;
```

## Project Structure

```
mergemint/
├── apps/
│   ├── web/                    # Next.js application
│   │   ├── app/
│   │   │   ├── (marketing)/    # Public landing pages
│   │   │   ├── api/            # API routes (webhooks, etc.)
│   │   │   ├── auth/           # Authentication pages
│   │   │   └── home/           # Protected dashboard pages
│   │   ├── lib/mergemint/      # Core business logic
│   │   ├── supabase/           # Database migrations
│   │   └── config/             # App configuration
│   └── e2e/                    # Playwright tests
├── packages/
│   ├── ui/                     # Shared UI components (shadcn)
│   ├── features/               # Feature packages
│   │   ├── auth/               # Authentication logic
│   │   └── accounts/           # Account management
│   ├── supabase/               # Supabase utilities
│   └── shared/                 # Shared utilities
└── tooling/                    # ESLint, Prettier configs
```

## Contributing

We love contributions! MergeMint is built by the community, for the community.

### Ways to Contribute

- 🐛 **Report bugs** — Open an issue with reproduction steps
- 💡 **Suggest features** — Start a discussion with your idea
- 📖 **Improve docs** — Fix typos, add examples, clarify explanations
- 🔧 **Submit PRs** — Bug fixes, features, performance improvements

### Development Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Run tests: `pnpm run test`
5. Lint & format: `pnpm run lint && pnpm run format:fix`
6. Commit: `git commit -m 'feat: add amazing feature'`
7. Push: `git push origin feature/amazing-feature`
8. Open a Pull Request

### Commit Convention

We use [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` — New features
- `fix:` — Bug fixes
- `docs:` — Documentation changes
- `style:` — Code style (formatting, etc.)
- `refactor:` — Code refactoring
- `test:` — Adding or updating tests
- `chore:` — Maintenance tasks

### Code Quality

Before submitting a PR, ensure:

```bash
# Type checking
pnpm run typecheck

# Linting
pnpm run lint

# Formatting
pnpm run format:fix

# Tests (if applicable)
pnpm run test
```

### Local Development Tips

**Reset database:**
```bash
pnpm run supabase:web:reset
```

**Create a migration:**
```bash
pnpm --filter web supabase migration new <name>
```

**View Supabase logs:**
```bash
pnpm --filter web supabase logs
```

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | [Next.js 15](https://nextjs.org/) (App Router) |
| Database | [Supabase](https://supabase.com/) (PostgreSQL) |
| AI | [Anthropic Claude](https://anthropic.com/) |
| Styling | [Tailwind CSS v4](https://tailwindcss.com/) |
| UI Components | [shadcn/ui](https://ui.shadcn.com/) |
| Monorepo | [Turborepo](https://turbo.build/) |
| Package Manager | [PNPM](https://pnpm.io/) |
| Testing | [Playwright](https://playwright.dev/) |
| Validation | [Zod](https://zod.dev/) |
| Data Fetching | [React Query](https://tanstack.com/query) |

## Deployment

### Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/MergeMint/mergemint-app)

### Docker

```bash
docker build -t mergemint .
docker run -p 3000:3000 mergemint
```

### Self-Hosted Supabase

For production, we recommend using [Supabase Cloud](https://supabase.com/) or self-hosting Supabase with their [self-hosting guide](https://supabase.com/docs/guides/self-hosting).

## Roadmap

- [ ] GitLab integration
- [ ] Slack notifications
- [ ] Discord bot
- [ ] Custom AI prompts
- [ ] Team-level analytics
- [ ] Payout integrations
- [ ] Mobile app

See the [open issues](https://github.com/MergeMint/mergemint-app/issues) for a full list of proposed features.

## Support

- 📖 **Documentation** — [docs.mergemint.dev](https://docs.mergemint.dev)
- 💬 **Discussions** — [GitHub Discussions](https://github.com/MergeMint/mergemint-app/discussions)
- 🐛 **Bug Reports** — [GitHub Issues](https://github.com/MergeMint/mergemint-app/issues)
- 🐦 **Twitter** — [@mergemint](https://twitter.com/mergemint)

## License

MergeMint is licensed under [Creative Commons Attribution-NonCommercial 4.0 International (CC BY-NC 4.0)](LICENSE).

**You are free to:**
- Share — copy and redistribute the material
- Adapt — remix, transform, and build upon the material

**Under these terms:**
- **Attribution** — Give appropriate credit and link to the license
- **NonCommercial** — You may not use the material for commercial purposes

For commercial licensing, please contact: hello@mergemint.dev

---

<p align="center">
  <strong>Created by Jay Derinbogaz</strong>
</p>

<p align="center">
  <a href="https://github.com/cderinbogaz">GitHub</a> •
  <a href="https://linkedin.com/in/ceyhunderinbogaz">LinkedIn</a>
</p>

<p align="center">
  <a href="https://mergemint.dev">Website</a> •
  <a href="https://github.com/MergeMint/mergemint-app">GitHub</a> •
  <a href="https://twitter.com/mergemint">Twitter</a>
</p>
