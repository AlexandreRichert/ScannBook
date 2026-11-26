# Contributing to ScannBook

The project follows **GitHub Flow**: a single long-lived branch, `main`, always working; one short-lived branch per issue; a pull request for every change; **squash** merges; the branch is deleted after merging.

There is no `dev` branch, no CI and no automatic protection on `main`. These rules are therefore enforced by hand, and the first one is simple: **never `git push origin main`**.

## Task lifecycle

1. Pick the issue and move it to **In progress** on the board (one card at a time).
2. Start from an up-to-date `main`:

   ```bash
   git switch main && git pull
   git switch -c feat/12-barcode-scanner
   ```

3. Commit small and often, using [Conventional Commits](#conventional-commits).

4. Before opening the PR, run `pnpm test`, `pnpm lint` and `pnpm typecheck`.
5. Get the PR reviewed (see [Reviews](#reviews)).
6. If `main` has moved:

   ```bash
   git fetch && git rebase origin/main
   git push --force-with-lease
   ```

7. Merge with **Squash and merge**, then delete the branch, or from the command line: `gh pr merge <n> --squash --delete-branch`. The issue is closed by `Closes #12`.

## Branches

Format: `<type>/<issue-number>-<short-description>`, in English and kebab-case.

| Type        | Usage                                  | Example                      |
| ----------- | -------------------------------------- | ---------------------------- |
| `feat/`     | New feature                            | `feat/12-barcode-scanner`    |
| `fix/`      | Bug fix                                | `fix/27-duplicate-scan`      |
| `docs/`     | README, ADRs, documentation            | `docs/3-adr-supabase`        |
| `chore/`    | Configuration, dependencies, tooling   | `chore/5-pr-template`        |
| `refactor/` | Restructuring without behavior change  | `refactor/8-move-app-to-src` |
| `test/`     | Tests only                             | `test/30-isbn-checksum`      |

A branch lives less than a day. If it grows, split it into two PRs.

## Conventional Commits

Format: `<type>(<scope>): <description>`. The description is imperative, in English, lowercase, with no trailing period, and the whole line is under 72 characters.

Types: `feat`, `fix`, `docs`, `chore`, `refactor`, `test`, `style`, `perf`.

| Scope         | Area                                          |
| ------------- | --------------------------------------------- |
| `scan`        | Camera, barcode reading                       |
| `api`         | Google Books client and adapter               |
| `auth`        | Sign up, sign in, session, route guards       |
| `db`          | Supabase: schema, RLS policies, repository    |
| `library`     | Library screen, shelves, statuses             |
| `book`        | Book details                                  |
| `search`      | Search                                        |
| `ui`          | Shared components                             |
| `nav`         | Routes, layouts                               |
| `deps`, `adr` | Dependencies, architecture decisions          |

Examples:

```text
feat(scan): lock scanner after first valid ISBN
feat(db): add books table with row level security
feat(auth): persist session with async storage
fix(api): force https on cover thumbnails
refactor(nav): split routes into auth and app groups
docs(adr): add 0004 supabase for auth and storage
test(lib): cover ISBN-10 to ISBN-13 conversion
feat(library)!: rename status "owned" to "to_read"
```

The `!` marks a breaking change (here, the data would need migrating). The commit body is optional; when present, it explains the _why_.

## Pull requests

- **One PR = one issue = one topic.** Aim for fewer than 300 changed lines.
- **The title follows Conventional Commits**: it becomes the commit on `main` after the squash. Check it before clicking _Squash and merge_.
- **Description**: what, why, how to test, and screenshots for anything that touches the UI.
- `Closes #<number>` in the description.
- **Labels**: `feature`, `bug`, `docs` or `chore`, plus priority and area.

## Conflicts

- `src/types/Book.ts` is the risky file. Only change it in a dedicated PR, merged quickly.
- `pnpm-lock.yaml`: don't resolve a conflict by hand. Take the version from `main`, then run `pnpm install` again.
- Rebase an open branch on `main` at least once every half day.

## Tests

Tests run with Jest (`jest-expo` preset) and React Native Testing Library.

```bash
pnpm test          # run every test once
pnpm test:watch    # re-run tests on file changes
```

- Put tests in a `__tests__/` folder next to the code they cover, named after the file: `src/lib/__tests__/Isbn.test.ts`, `src/components/ui/__tests__/Button.test.tsx`.
- **Never put a test in `src/app/`**: Expo Router treats every file there as a route.
- Import `describe`, `it`, `expect` and `jest` from `@jest/globals`. Jest globals are not typed project-wide, so app code can't use them by mistake.
- Test names (`describe`, `it`) are in English, like the rest of the code. UI strings stay in French: `getByRole('button', { name: 'Ajouter' })`.
- Unit tests cover pure functions in `src/lib/` and adapters in `src/data/`: one input, one expected output, no network.
- Component tests find elements the way a screen reader does, with `screen.getByRole('button', { name: '…' })`, and use `userEvent` to press or type. `render` is async: always `await render(...)`.
- Callbacks are `jest.fn()`. A component test never calls Supabase or Google Books.
- `test(<scope>): …` is the commit type for a change that only adds or updates tests.

## Code conventions

- Files and components in PascalCase (`BookCard.tsx`, `GoogleBooks.ts`). Route files in `src/app/` are the exception: they use kebab-case, following the [Expo Router notation](https://docs.expo.dev/router/basics/notation/) (`sign-in.tsx`, `book/[id].tsx`, `_layout.tsx`).
- No `any`: external data stays `unknown` until it goes through its adapter.
- UI text in French; code, variable names and commits in English.
- No SQL query or `fetch` in a component: always go through `src/data/` and a hook.
- Native modules are installed with `pnpm expo install <package>` to get SDK-compatible versions.
- Dev dependencies are the exception: install them with `pnpm add -D <package>@<version>`, using the version `pnpm expo install` would pick, then run `pnpm expo install --check`. Don't use `pnpm expo install <package> -- --dev`: with pnpm 12 it saves the package under `dependencies` and unlinks every runtime dependency from `node_modules`.
