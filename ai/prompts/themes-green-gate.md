Bring a Drupal theme to green before a push: the checks it declares, then its pipeline on this machine.

The launch line is for Claude Code, the default; the text between the triple quotes can be given to another AI CLI as it is.

```
claude --permission-mode bypassPermissions """
Bring the theme <theme> of the themes folder to green before it is pushed
# ~/workspace/themes/<theme> · a git checkout · container-based (DDEV by default)
# nothing is pushed, merged, reset, deleted or built in this session
# the build and install-all commands of the folder run composer and sudo on the host: do not run them

1. git -C <theme> status -sb
   tell me the branch and what is not committed
2. bash cmd-tools-checks.sh <theme> --list
   tell me which checks the theme declares
3. bash cmd-tools-checks.sh <theme>
   every declared check; tell me which are red, with the first lines of each
4. bash cmd-tools-gitlab-ci-local.sh <theme> --doctor
   stop and tell me if the runner or the container engine is missing
5. bash cmd-tools-gitlab-ci-local.sh <theme>
   if the whole pipeline cannot run here, say why and run: bash cmd-tools-gitlab-ci-local.sh <theme> --slim

Report: the checks (passed, failed, not declared), the pipeline (GREEN or RED, which jobs ran,
which could not run here). A red job is a result: do not hide it, do not allow it to fail.
Then ask me whether to fix what is red.
"""
```
