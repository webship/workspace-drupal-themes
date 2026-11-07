# @webship/workspace-drupal-themes

The **Drupal themes** workspace of the [Webship Workspace](https://github.com/webship/workspace) dashboard:
the `themes/` folder (type `code`), its settings file (`core/config/workspace.themes.settings.yml`),
its commands and its docs, as a plugin.

## Use it

```bash
cd ~/workspace
bash core/scripts/plugins.sh --require github:webship/workspace-drupal-themes
bash core/scripts/plugins.sh --activate drupal-themes     # puts `themes` on the workspaces list of settings.yml
bash core/scripts/plugins.sh --install drupal-themes      # the folder, its settings file (once), its commands, its docs (once)
```

The settings file and the docs are placed once and never overwritten: they hold what you put there.
`--deactivate` takes the workspace off the list; the folder and its content stay.

## The commands

| Command |
| --- |
| `cmd-all-back-end-build-themes.sh` |
| `cmd-all-back-end-install-themes.sh` |
| `cmd-all-front-end-build-themes.sh` |
| `cmd-all-front-end-install-themes.sh` |
| `cmd-backup-theme.sh` |
| `cmd-build-admin-theme.sh` |
| `cmd-build-drupal-template.sh` |
| `cmd-build-theme.sh` |
| `cmd-install-admin-theme.sh` |
| `cmd-install-theme.sh` |
| `cmd-tools-checks.sh` |
| `cmd-tools-gitlab-ci-local.sh` |
| `cmd-tools-graphify.sh` |
| `cmd-tools-obsidian.sh` |
| `cmd-tools-ragify.sh` |
| `cmd-tools-reclaim.sh` |
| `cmd-tools-remove.sh` |
| `cmd-tools-update-all.sh` |

The bash functions these commands call live in the dashboard's `core/scripts/functions`.
