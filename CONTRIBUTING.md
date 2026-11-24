# Contribuer à ScannBook

Le projet suit le **GitHub Flow** : une seule branche longue, `main`, toujours fonctionnelle ; une branche courte par issue ; une pull request pour tout changement ; un merge en **squash** ; la branche supprimée après le merge.

Il n'y a ni branche `dev`, ni CI, ni protection automatique de `main`. Ces règles sont donc tenues à la main, et la première est simple : **jamais de `git push origin main`**.

## Le cycle d'une tâche

1. Prendre l'issue et la passer dans **En cours** sur le board (une seule carte à la fois).
2. Partir d'un `main` à jour :

   ```bash
   git switch main && git pull
   git switch -c feat/12-barcode-scanner
   ```

3. Committer petit et souvent, en [Conventional Commits](#conventional-commits).

4. Faire relire la PR (voir [Reviews](#reviews)).
5. Si `main` a bougé :

   ```bash
   git fetch && git rebase origin/main
   git push --force-with-lease
   ```

6. Merger avec **Squash and merge** puis supprimer la branche, ou en ligne de commande : `gh pr merge <n> --squash --delete-branch`. L'issue se ferme grâce à `Closes #12`.

## Branches

Format : `<type>/<numéro-issue>-<description-courte>`, en anglais et en kebab-case.

| Type        | Usage                                           | Exemple                      |
| ----------- | ----------------------------------------------- | ---------------------------- |
| `feat/`     | Nouvelle fonctionnalité                         | `feat/12-barcode-scanner`    |
| `fix/`      | Correction de bug                               | `fix/27-duplicate-scan`      |
| `docs/`     | README, ADR, documentation                      | `docs/3-adr-supabase`        |
| `chore/`    | Configuration, dépendances, outillage           | `chore/5-pr-template`        |
| `refactor/` | Restructuration sans changement de comportement | `refactor/8-move-app-to-src` |
| `test/`     | Ajout de tests seuls                            | `test/30-isbn-checksum`      |

Une branche vit moins d'une journée. Si elle grossit, coupez-la en deux PR.

## Conventional Commits

Format : `<type>(<scope>): <description>`. La description est à l'impératif, en anglais, en minuscules, sans point final, et le tout fait moins de 72 caractères.

Types : `feat`, `fix`, `docs`, `chore`, `refactor`, `test`, `style`, `perf`.

| Scope         | Périmètre                                         |
| ------------- | ------------------------------------------------- |
| `scan`        | Caméra, lecture des codes-barres                  |
| `api`         | Client et adapter Google Books                    |
| `auth`        | Inscription, connexion, session, garde des routes |
| `db`          | Supabase : schéma, politiques RLS, repository     |
| `library`     | Écran bibliothèque, piles, statuts                |
| `book`        | Fiche livre                                       |
| `search`      | Recherche                                         |
| `ui`          | Composants partagés                               |
| `nav`         | Routes, layouts                                   |
| `deps`, `adr` | Dépendances, décisions d'architecture             |

Exemples :

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

Le `!` signale un changement cassant (ici, il faudrait migrer les données). Le corps du commit est optionnel ; s'il est présent, il explique le _pourquoi_.

## Pull requests

- **Une PR = une issue = un sujet.** Visez moins de 300 lignes modifiées.
- **Le titre suit Conventional Commits** : c'est lui qui devient le commit sur `main` après le squash. Vérifiez-le avant de cliquer sur _Squash and merge_.
- **Description** : quoi, pourquoi, comment tester, et des captures d'écran pour tout ce qui touche l'interface.
- `Closes #<numéro>` dans la description.
- **Labels** : `feature`, `bug`, `docs` ou `chore`, plus la priorité et le domaine.

## Conflits

- `src/types/book.ts` est le fichier à risque. Ne le modifiez que dans une PR dédiée, mergée vite.
- `pnpm-lock.yaml` : ne résolvez pas un conflit à la main. Reprenez la version de `main`, puis relancez `pnpm install`.
- Rebasez une branche ouverte sur `main` au moins une fois par demi-journée.

## Conventions de code

- Fichiers en kebab-case (`use-book-lookup.ts`), composants en PascalCase.
- Pas de `any` : les données externes restent `unknown` jusqu'à leur adapter.
- Textes de l'interface en français ; code, noms de variables et commits en anglais.
- Pas de requête SQL ni de `fetch` dans un composant : on passe toujours par `src/data/` et un hook.
- Les modules natifs s'installent avec `pnpm expo install <package>` pour obtenir des versions compatibles avec le SDK.
