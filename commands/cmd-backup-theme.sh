#!/usr/bin/env bash

# Bootstrap.
# Find the workspace tooling from this script, so a fresh clone needs no setup.
WORKSPACE_SCRIPTS="${WORKSPACE_SCRIPTS:-$(cd "$(dirname "${BASH_SOURCE[0]}")/../core/scripts" && pwd)}";
source ${WORKSPACE_SCRIPTS}/bootstrap.sh || exit 1 ;

# Load workspace settings and extra lists.
eval $(parse_yaml ${WORKSPACE_CONFIG}/workspace.themes.settings.yml);

ARGPARSE_DESCRIPTION="Backup a theme"
argparse "$@" <<EOF || exit 1
parser.add_argument('PROJECT_NAME',
                    help='The name of the theme.')
EOF

shift $#;
trim_project_name ;   # "v11x00b1/" -> "v11x00b1" — see functions/fun-project-name.sh

backup_time=$( date '+%Y-%m-%d_%H-%M-%S' );
tar -cvzf ${backups}/${doc_name}/${doc_name}---${PROJECT_NAME}--${backup_time}.tar.gz ${PROJECT_NAME} ;

# The database goes beside the archive, the way the project keeps it. The core's export_project_db (core 1.0.42,
# webship/workspace#937) writes the dump of the platform whose plugin keeps the database, else DDEV's export, and
# nothing, which it says, for a theme that is not a project with a database.
base="${backups}/${doc_name}/${doc_name}---${PROJECT_NAME}--${backup_time}-db" ;
# A dump an export began and did not finish, empty or cut short, is not left behind for a restore to import; a file
# that was there before is not this backup's to remove.
dump_was_there='no' ;
[ -e "${base}.sql.gz" ] && dump_was_there='yes' ;
if declare -F export_project_db > /dev/null ; then
  if ! (cd ${PROJECT_NAME} && export_project_db "${base}") ; then
    [ "${dump_was_there}" = 'yes' ] || rm -f "${base}.sql.gz" ;
    echo "The database of ${PROJECT_NAME} could not be exported: only its files are backed up." ;
    exit 1 ;
  fi
  exit 0 ;
fi

# An older core: a theme that is not a DDEV project, or one that runs without a database (omit_containers with db,
# written inline or as a list), has only its files to back up; ddev export-db would fail on it and leave an empty
# dump behind.
runs_without_db() {
  local f ;
  [ -f "$1/.ddev/config.yaml" ] || return 0 ;
  for f in "$1"/.ddev/config.yaml "$1"/.ddev/config.*.yaml ; do
    [ -f "${f}" ] || continue ;
    grep -qE '^omit_containers:.*\bdb\b' "${f}" && return 0 ;
    awk '/^omit_containers:/ { inlist = 1 ; next }
      inlist && /^[[:space:]]*-[[:space:]]*["'"'"']?db["'"'"']?[[:space:]]*$/ { found = 1 }
      inlist && /^[^[:space:]-]/ { inlist = 0 }
      END { exit found ? 0 : 1 }' "${f}" && return 0 ;
  done
  return 1 ;
}
if runs_without_db "${PROJECT_NAME}" ; then
  echo "${PROJECT_NAME} has no database: its files are backed up, and there is no database to export." ;
  exit 0 ;
fi
if ! (cd ${PROJECT_NAME} && ddev export-db --file="${base}.sql.gz") ; then
  [ "${dump_was_there}" = 'yes' ] || rm -f "${base}.sql.gz" ;
  echo "The database of ${PROJECT_NAME} could not be exported: only its files are backed up." ;
  exit 1 ;
fi
