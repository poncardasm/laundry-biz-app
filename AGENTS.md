# Agent Guidelines

## Git Commit Standards

Always use **Conventional Commits** format for all commit messages.

### Format
```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

- **feat**: New feature
  - Example: `feat(orders): add kanban board with drag-drop status`

- **fix**: Bug fix
  - Example: `fix(db): resolve OPFS write failure on pagehide`

- **docs**: Documentation changes
  - Example: `docs(readme): update installation instructions`

- **style**: Code style changes (formatting, missing semicolons, etc.)
  - Example: `style(css): fix indentation in tailwind tokens`

- **refactor**: Code restructuring without behavior change
  - Example: `refactor(db): extract connection logic to separate module`

- **perf**: Performance improvements
  - Example: `perf(board): virtualize order cards for large lists`

- **test**: Adding or fixing tests
  - Example: `test(db): add persistence unit tests`

- **chore**: Maintenance tasks, dependency updates
  - Example: `chore(deps): upgrade react to v19.0.1`

- **ci**: CI/CD changes
  - Example: `ci(github): add deploy workflow`

- **revert**: Reverting a previous commit
  - Example: `revert: feat(search): remove broken fuzzy matching`

### Rules

1. Use lowercase for type and scope
2. No period at end of description
3. Keep description under 72 characters
4. Use present tense ("add" not "added", "fix" not "fixed")
5. Be specific in scope — prefer `feat(orders):` over `feat:`
6. Body is optional but use it for explaining "why" not "what"
7. Breaking changes must include `BREAKING CHANGE:` in footer

### Examples

```
feat(ui): implement sidebar navigation with Linear styling

- Add four navigation items: Board, New Order, Search, Settings
- Apply design tokens for surface colors and borders
- Handle active state with visual indicator
```

```
fix(db): prevent data loss when browser closes unexpectedly

Add pagehide event listener to trigger immediate database
persistence before tab closes. Previously, rapid page close
could lose unsaved changes in the 3-second auto-save window.
```

## Development Notes

### Never Commit

- node_modules/
- .env files
- dist/ or build/
- OS temp files (.DS_Store, Thumbs.db)
- Log files
- Local database files (if any)

### Before Committing

1. Check git status: `git status`
2. Review changes: `git diff`
3. Stage files: `git add -p` (review each hunk)
4. Write conventional commit message
5. Verify: `git log --oneline -1`

### Branch Naming (if applicable)

- `feat/order-search`
- `fix/opfs-persistence`
- `docs/architecture-update`

Keep branches lowercase with hyphens.
