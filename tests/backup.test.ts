import test from 'node:test';
import assert from 'node:assert';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { spawnSync } from 'child_process';

const PKG = fs.existsSync(path.join(__dirname, '..', 'package.json')) ? path.join(__dirname, '..') : path.join(__dirname, '..', '..');
const SCRIPT = path.join(PKG, 'commands', 'cmd-backup-theme.sh');

/**
 * A workspace with the themes folder and one theme in it, and a bootstrap that stands in for the base's: `ddev` is a
 * function that writes down what it is asked and, for export-db, does what DDEV does (an empty file first). With
 * `hook`, the stand-in core has export_project_db (core 1.0.42, webship/workspace#937).
 */
function backup(ddevConfig: string | null, exportDb: 'ok' | 'fails', hook = '', configs: Record<string, string> = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'ws-theme-backup-'));
  const scripts = path.join(root, 'core', 'scripts');
  fs.mkdirSync(scripts, { recursive: true });
  fs.mkdirSync(path.join(root, 'core', 'config'), { recursive: true });
  fs.mkdirSync(path.join(root, 'backups', 'themes'), { recursive: true });
  fs.mkdirSync(path.join(root, 'themes', 'theme1'), { recursive: true });
  fs.writeFileSync(path.join(root, 'themes', 'theme1', 'theme1.info.yml'), 'name: Theme 1\n');
  if (ddevConfig !== null) {
    fs.mkdirSync(path.join(root, 'themes', 'theme1', '.ddev'), { recursive: true });
    fs.writeFileSync(path.join(root, 'themes', 'theme1', '.ddev', 'config.yaml'), ddevConfig);
    for (const [name, text] of Object.entries(configs)) fs.writeFileSync(path.join(root, 'themes', 'theme1', '.ddev', name), text);
  }
  fs.writeFileSync(path.join(scripts, 'bootstrap.sh'), [
    'WORKSPACE_ROOT="$(cd "${WORKSPACE_SCRIPTS}/../.." && pwd)"; WORKSPACE_CONFIG="${WORKSPACE_ROOT}/core/config";',
    'backups="${WORKSPACE_ROOT}/backups"; doc_name=themes;',
    'parse_yaml() { :; }',
    'argparse() { cat > /dev/null; PROJECT_NAME="$1"; }',
    'trim_project_name() { PROJECT_NAME="${PROJECT_NAME%/}"; }',
    'ddev() { echo "ddev $*" >> "${DDEV_LOG}"; if [ "$1" = export-db ]; then local f="${2#--file=}"; printf -- "-- part of a dump" > "${f}";',
    '  if [ "${DDEV_EXPORT}" = ok ]; then echo "-- dump" | gzip > "${f}"; return 0; fi;',
    '  echo "Error: failed to export database: service db does not exist"; return 1; fi; }',
    hook,
  ].join('\n'));
  const log = path.join(root, 'ddev.log');
  fs.writeFileSync(log, '');
  const r = spawnSync('bash', [SCRIPT, 'theme1'], { cwd: path.join(root, 'themes'), encoding: 'utf8',
    env: { ...process.env, WORKSPACE_SCRIPTS: scripts, DDEV_LOG: log, DDEV_EXPORT: exportDb } });
  const files = fs.readdirSync(path.join(root, 'backups', 'themes')).sort();
  return { r, calls: fs.readFileSync(log, 'utf8'), files };
}

const ARCHIVE = /^themes---theme1--\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}\.tar\.gz$/;

test('an older core, a theme that is a DDEV project with a database: the dump beside the archive', () => {
  const { r, calls, files } = backup('name: theme1\ntype: drupal\n', 'ok');
  assert.strictEqual(r.status, 0, r.stdout + r.stderr);
  assert.match(calls, /ddev export-db --file=.*\/backups\/themes\/themes---theme1--.*-db\.sql\.gz/);
  assert.strictEqual(files.length, 2, files.join(', '));
  assert.ok(files.some((f) => ARCHIVE.test(f)) && files.some((f) => /-db\.sql\.gz$/.test(f)));
});

test('an older core, a theme that is no DDEV project, or one with no database (inline or as a list): the archive alone', () => {
  for (const [config, configs] of [[null, {}], ['name: theme1\ntype: generic\nomit_containers: [db]\n', {}], ['name: theme1\ntype: generic\n', { 'config.x.yaml': 'omit_containers:\n  - db\n' }]] as const) {
    const { r, calls, files } = backup(config, 'fails', '', configs);
    assert.strictEqual(r.status, 0, r.stdout + r.stderr);
    assert.match(r.stdout, /theme1 has no database: its files are backed up/);
    assert.doesNotMatch(calls, /export-db/);
    assert.strictEqual(files.length, 1);
    assert.match(files[0], ARCHIVE);
  }
});

test('an older core, an export that fails: no empty dump left, and exit 1', () => {
  const { r, files } = backup('name: theme1\ntype: drupal\n', 'fails');
  assert.strictEqual(r.status, 1);
  assert.match(r.stdout, /The database of theme1 could not be exported: only its files are backed up\./);
  assert.strictEqual(files.length, 1);
});

test('with the core\'s export_project_db, the backup is its: the dump it writes, from the theme\'s folder', () => {
  const hook = 'export_project_db() { echo "export_project_db $1 in $(basename "$(pwd)")" >> "${DDEV_LOG}"; echo "This project has no database to back up: its folder is the whole of it."; return 0; }';
  const { r, calls, files } = backup(null, 'fails', hook);
  assert.strictEqual(r.status, 0, r.stdout + r.stderr);
  assert.match(calls, /^export_project_db .*\/backups\/themes\/themes---theme1--\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}-db in theme1$/m);
  assert.doesNotMatch(calls, /^ddev /m);
  assert.strictEqual(files.length, 1);
});
