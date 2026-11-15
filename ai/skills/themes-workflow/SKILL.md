---
name: themes-workflow
description: How work is done in the `themes/` folder of the Webship Workspace — what a theme is there (a git checkout to work on, or a try-out build), how its code-quality checks and its GitLab CI pipeline are run before a push, how it is backed up, which commands of the folder still run `composer` and `sudo` on the host and are never run unasked, with the flags of each command and the settings keys of the folder. Use when asked to "run the checks of this theme", "run the pipeline locally", "build this theme", "which themes does the folder list", or when a command of `themes/` is about to be run.
argument-hint: '[what you are about to do in themes]'
---

# themes-workflow

`~/workspace/themes` is the Themes folder of a Webship Workspace (container-based, DDEV by default).
Themes are Drupal contrib and private themes, checked out to work on, and the try-out builds of the themes the folder's settings file lists. It comes with the Themes plugin (`@webship.co/workspace-drupal-themes`), which places the commands below in the folder. Every command finds the workspace from its own path; run it from the folder, and read `bash <command> --help` before quoting a flag.

## The order of work

1. **See what the theme declares**: `bash cmd-tools-checks.sh mytheme --list`. It runs nothing.
2. **Work on a branch** of the checkout, `~/workspace/themes/mytheme`.
3. **Run the checks**: `bash cmd-tools-checks.sh mytheme`, or some with `--only`.
4. **Run the pipeline on this machine**: `bash cmd-tools-gitlab-ci-local.sh mytheme --doctor`
   once, then `bash cmd-tools-gitlab-ci-local.sh mytheme` (or `--slim`).
5. **Push when it is green**, and gate on the remote pipeline what could not run here.

The build and install-all commands are not part of this order: they run on the host.

## Commands

| Command | What it does | Flags |
| --- | --- | --- |
| `cmd-all-back-end-build-themes.sh` | **On the host.** The same for the `admin_themes` list | none |
| `cmd-all-back-end-install-themes.sh` | **On the host.** The same for the `admin_themes` list | none |
| `cmd-all-front-end-build-themes.sh` | **On the host.** Deletes every theme on the `themes` list with `sudo`, then builds the template and each theme | none |
| `cmd-all-front-end-install-themes.sh` | **On the host.** Changes owners with `sudo`, then installs every theme on the `themes` list | none |
| `cmd-backup-theme.sh` | The folder of a theme as an archive, and the database of a built theme as a dump, into `backups/themes/`: `<theme>` | none |
| `cmd-build-admin-theme.sh` | **On the host.** The same for an administration theme: `<theme>` | none |
| `cmd-build-drupal-template.sh` | **On the host.** Removes the template project with `sudo` and creates it again with `composer` | none |
| `cmd-build-theme.sh` | **On the host.** Copies the template project to `themes/<name>` and requires the theme with `composer`: `<theme>` | none |
| `cmd-install-admin-theme.sh` | Installs the site of a built theme and makes the theme the administration one: `<theme>` | none |
| `cmd-install-theme.sh` | Installs the site of a built theme and makes the theme the default one: `<theme>` | none |
| `cmd-tools-checks.sh` | Runs the code-quality checks an item's `package.json` declares; `--list` prints the plan and runs nothing | `--browser` `--e2e` `--fail-fast` `--install` `--list` `--only` `--runner` `--skip` |
| `cmd-tools-gitlab-ci-local.sh` | Runs an item's GitLab CI pipeline on this machine, before a push | `--doctor` `--list` `--slim` `--variable` |
| `cmd-tools-reclaim.sh` | Disk held by projects whose folder is gone: a dry run unless `--apply` | `--apply` `--keep-days` `--list-protected` `--only` |
| `cmd-tools-remove.sh` | Containers, volumes and folder together; refuses work that is on no remote unless `--force` | `--force` `--orphans` |
| `cmd-tools-update-all.sh` | **On the host.** `composer update` in every folder. Do not run it unasked | none |

## Settings

| Key | File | What it says |
| --- | --- | --- |
| `doc.name` | `core/config/workspace.themes.settings.yml` | The folder under the workspace root: `themes` |
| `type` | `core/config/workspace.themes.settings.yml` | `code`: the rows of the page are packages and repositories, with the Build, Backup, Remove and Checks actions |
| `composer` | `core/config/workspace.themes.settings.yml` | `manifest`: the COMPOSER menu only adds to `composer.json` here, and never installs |
| `themes` | `core/config/workspace.themes.settings.yml` | The front-end themes the build-all and install-all commands go through, by project name |
| `admin_themes` | `core/config/workspace.themes.settings.yml` | The administration themes, for the back-end commands |
| `drupal.template_drupal_theme_name` | `core/config/workspace.themes.settings.yml` | The name of the template project the builds are copied from; the commands refuse to run when it is empty |
| `assistant.name`, `assistant.placeholder` | `core/config/workspace.themes.settings.yml` | What the assistant is called on this page; `default` takes the workspace's |
| `workspaces` | `core/config/settings.yml` | The active folders; `themes` is on it once the plugin is activated |

## Rules

- **The build and install-all commands still run on the host.** `cmd-build-drupal-template.sh`,
  `cmd-build-theme.sh`, `cmd-build-admin-theme.sh`, the four `cmd-all-…-themes.sh` and
  `cmd-tools-update-all.sh` call `composer` on the host, and several call `sudo` to remove folders
  and change owners: they are not yet moved into containers. Never run one unasked; say what it
  would do, and offer the container way: a site of a sites folder, with the theme required and
  enabled in that site's container.
- **The two build-all commands delete first**: every theme on the list, with `sudo`. Work in a
  theme folder that is not pushed is lost.
- **A theme checked out here is somebody's work.** Work on a branch; back it up before a risky
  change (`bash cmd-backup-theme.sh <name>`); `bash cmd-tools-remove.sh` only when asked.
- **Green before a push.** The checks the theme declares, then its pipeline on this machine.
- The workspace is container-based (DDEV by default): never `composer`, `drush`, `php` or `npm` on
  the host for a theme you work on.

The Themes plugin places these beside this one, each in the workspace folder of its kind: the agent `themes-maintainer` (`ai-agents/`), the command `/themes-check` (`ai-commands/`) and the prompt `themes-green-gate` (`ai-prompts/`).
