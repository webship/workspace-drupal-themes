# @webship.co/workspace-drupal-themes

The **Drupal themes** workspace of the [Webship Workspace](https://github.com/webship/workspace) dashboard:
the `themes/` folder (type `code`), its settings file (`core/config/workspace.themes.settings.yml`),
its commands and its docs, as a plugin.

## Use it

```bash
cd ~/workspace
bash core/scripts/plugins.sh --require github:webship/workspace-drupal-themes
bash core/scripts/plugins.sh --activate drupal-themes --with-needs     # puts `themes` on the workspaces list of settings.yml
bash core/scripts/plugins.sh --install drupal-themes      # the folder, its settings file (once), its commands, its docs (once)
```

The settings file and the docs are placed once and never overwritten: they hold what you put there.
`--deactivate` takes the workspace off the list; the folder and its content stay.

## What it goes with

The AI items land in the four AI folders, so the manifest needs them (`needs`): `ai-agents`, `ai-skills`, `ai-commands`, `ai-prompts`. `--activate drupal-themes` and `--install drupal-themes` stop while one is missing and name it; with `--with-needs` they are required, activated and installed first. One of its commands, `cmd-tools-update-all.sh`, still runs `composer` on the machine instead of in a project's container, so the manifest names it as a command a part of the plugin uses (`suggests.commands`): `bash core/scripts/plugins.sh --check drupal-themes` says whether it is there (https://getcomposer.org/download/), and nothing is installed for you. Everything else here runs through the container tool the workspace already needs.

## The AI items

The plugin carries its own AI items (`ai/` in the package, the manifest's `ai` block), written for the work this folder is for. `--install` places each one in the workspace folder of its kind, when that folder is an active workspace folder; `--uninstall` removes them, and keeps one that was edited in its folder.

| Item | Kind | Lands in | What it is for |
| --- | --- | --- | --- |
| `themes-maintainer` | Agent | `ai-agents/themes-maintainer.md` | Works on a Drupal theme in `themes/` and brings it to green before a push: its checks, its pipeline on this machine, a backup; knows which commands still run on the host and never runs one unasked |
| `themes-workflow` | Skill | `ai-skills/themes-workflow/` | How work is done in `themes/`: see what is declared, check, run the pipeline locally, push when green; every command with its flags, the ones that run on the host, the settings keys |
| `/themes-check` | Command | `ai-commands/themes-check.md` | `/themes-check <theme> [checks]`: prints the plan, runs the declared checks and says what is red and why |
| `themes-green-gate` | Prompt | `ai-prompts/themes-green-gate.md` | A new session that runs a theme's checks and its pipeline on this machine and reports green or red |

From its folder an item is installed into the AI CLI (Claude Code by default) like any other: the folder's page on the dashboard, or `bash cmd-tools-ai-items.sh <name> --install` in the AI folder (`--to dev/<project>` for one project). A prompt is not installed: the New screen form lists it as the start of a new session. The body of every item is plain Markdown any AI CLI can follow; Claude Code is the default shape (the frontmatter, the launch line of a prompt). Every command, flag, settings key and path an item names is checked by `tests/items.test.ts`; the shape of the items is the one of the reference, [`docs/plugin-items-pattern.md` of the WordPress plugin](https://github.com/webship/workspace-wordpress/blob/1.0.x/docs/plugin-items-pattern.md).

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
| `cmd-tools-reclaim.sh` |
| `cmd-tools-remove.sh` |
| `cmd-tools-update-all.sh` |

The bash functions these commands call live in the dashboard's `core/scripts/functions`.
