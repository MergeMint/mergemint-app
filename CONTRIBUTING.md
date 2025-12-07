# Contributing to MergeMint

Thank you for your interest in contributing to MergeMint! We're excited to have you join our community.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Making Changes](#making-changes)
- [Pull Request Process](#pull-request-process)
- [Style Guidelines](#style-guidelines)
- [Community](#community)

## Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct. Please be respectful, inclusive, and considerate in all interactions.

## Getting Started

### Prerequisites

- Node.js 18.x or later
- Docker (for Supabase local development)
- PNPM package manager
- Git

### Finding Issues to Work On

1. Check [open issues](https://github.com/MergeMint/mergemint-app/issues) for bugs and feature requests
2. Look for issues labeled `good first issue` if you're new
3. Issues labeled `help wanted` are great for contributors
4. Feel free to ask questions on any issue before starting work

### Before You Start

1. **Check existing PRs** — Make sure no one else is already working on the issue
2. **Comment on the issue** — Let maintainers know you're interested
3. **Discuss approach** — For large changes, discuss your approach first

## Development Setup

### 1. Fork and Clone

```bash
# Fork on GitHub, then clone your fork
git clone https://github.com/YOUR_USERNAME/mergemint-app.git
cd mergemint-app

# Add upstream remote
git remote add upstream https://github.com/MergeMint/mergemint-app.git
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Start Supabase

```bash
pnpm run supabase:web:start
```

### 4. Configure Environment

```bash
cp apps/web/.env.example apps/web/.env.local
# Edit .env.local with your configuration
```

### 5. Start Development Server

```bash
pnpm run dev
```

### 6. Run Tests

```bash
# Type checking
pnpm run typecheck

# Linting
pnpm run lint

# E2E tests (requires server running)
pnpm run test:e2e
```

## Making Changes

### Branch Naming

Create a feature branch from `main`:

```bash
git checkout main
git pull upstream main
git checkout -b <type>/<description>
```

Branch types:
- `feat/` — New features
- `fix/` — Bug fixes
- `docs/` — Documentation changes
- `refactor/` — Code refactoring
- `test/` — Adding or updating tests

Examples:
- `feat/gitlab-integration`
- `fix/pr-comment-formatting`
- `docs/api-reference`

### Commit Messages

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Types:**
- `feat` — New feature
- `fix` — Bug fix
- `docs` — Documentation
- `style` — Formatting (no code change)
- `refactor` — Code restructuring
- `test` — Tests
- `chore` — Maintenance

**Examples:**
```bash
feat(dashboard): add weekly trend chart
fix(webhook): handle missing PR body
docs(readme): update installation steps
refactor(api): extract score calculation logic
```

### Code Quality Checklist

Before committing:

- [ ] Code compiles without errors (`pnpm run typecheck`)
- [ ] Linting passes (`pnpm run lint`)
- [ ] Code is formatted (`pnpm run format:fix`)
- [ ] Tests pass (if applicable)
- [ ] New features have tests (where appropriate)
- [ ] Documentation is updated (if needed)

## Pull Request Process

### 1. Update Your Branch

```bash
git fetch upstream
git rebase upstream/main
```

### 2. Push Your Changes

```bash
git push origin <your-branch>
```

### 3. Open a Pull Request

1. Go to GitHub and open a PR against `main`
2. Fill out the PR template completely
3. Link related issues (e.g., "Closes #123")
4. Add screenshots/videos for UI changes

### PR Title Format

Use the same format as commit messages:

```
feat(dashboard): add weekly trend chart
fix(webhook): handle missing PR body
```

### What to Expect

1. **Automated checks** — CI will run tests and linting
2. **Review** — Maintainers will review your code
3. **Feedback** — You may be asked to make changes
4. **Merge** — Once approved, your PR will be merged

### Tips for a Good PR

- Keep PRs focused and reasonably sized
- Write clear descriptions of what and why
- Include screenshots for UI changes
- Respond to feedback promptly
- Be patient — maintainers are volunteers

## Style Guidelines

### TypeScript

- Use strict TypeScript — no `any` types
- Prefer `interface` over `type` for objects
- Use descriptive variable names
- Add JSDoc comments for public APIs

### React

- Use functional components with hooks
- Prefer server components where possible
- Use `'use client'` directive only when needed
- Follow the existing component patterns

### CSS/Styling

- Use Tailwind CSS utility classes
- Follow existing color/spacing conventions
- Use CSS variables for theming
- Keep components responsive

### File Organization

```
# Components
components/
  my-component.tsx      # Component file
  my-component.test.tsx # Tests (if applicable)

# Naming
- Use kebab-case for files: `my-component.tsx`
- Use PascalCase for components: `MyComponent`
- Use camelCase for functions: `myFunction`
```

### Database

- Use meaningful table and column names
- Add appropriate indexes
- Write reversible migrations
- Document schema changes

## Project Structure

```
mergemint/
├── apps/
│   ├── web/                    # Main Next.js app
│   │   ├── app/                # App Router pages
│   │   ├── components/         # App-specific components
│   │   ├── lib/                # Utilities and helpers
│   │   └── supabase/           # Database migrations
│   └── e2e/                    # End-to-end tests
├── packages/
│   ├── ui/                     # Shared UI components
│   ├── features/               # Feature modules
│   ├── supabase/               # Supabase client utilities
│   └── shared/                 # Shared utilities
└── tooling/                    # Build tooling configs
```

## Common Tasks

### Adding a New Component

1. Create the component in `packages/ui/src/`
2. Export from the package's `index.ts`
3. Use in app with `import { MyComponent } from '@kit/ui'`

### Adding a New API Route

1. Create route in `apps/web/app/api/<path>/route.ts`
2. Use proper HTTP methods (GET, POST, etc.)
3. Add authentication checks if needed
4. Handle errors gracefully

### Adding a Database Migration

```bash
pnpm --filter web supabase migration new my_migration_name
# Edit the generated file in apps/web/supabase/migrations/
pnpm run supabase:web:reset
```

### Adding Tests

```bash
# E2E tests go in apps/e2e/tests/
# Follow existing patterns for page objects and utilities
```

## Community

### Getting Help

- 💬 [GitHub Discussions](https://github.com/MergeMint/mergemint-app/discussions) — Ask questions
- 🐛 [GitHub Issues](https://github.com/MergeMint/mergemint-app/issues) — Report bugs
- 🐦 [Twitter](https://twitter.com/mergemint) — Follow for updates

### Recognition

Contributors are recognized in:
- The project README
- Release notes
- Our website's contributors page

Thank you for contributing to MergeMint! 🎉

