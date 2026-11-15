/**
 * What this plugin needs from the workspace it is added to and from the machine (the manifest's `needs` and `suggests`).
 * The workspace reads them: github.com/webship/workspace, core/workspace-app/PLUGINS.md.
 */
import test from 'node:test';
import assert from 'node:assert';
import fs from 'fs';
import path from 'path';

// Compiled, this test runs from dist/tests, so the package root is one folder further up.
const PKG = fs.existsSync(path.join(__dirname, '..', 'package.json')) ? path.join(__dirname, '..') : path.join(__dirname, '..', '..');
const manifest = JSON.parse(fs.readFileSync(path.join(PKG, 'package.json'), 'utf8')).workspacePlugin;
const walk = (dir: string): string[] => fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]));

test("the manifest says what the plugin needs (the AI folder of each kind of item it ships) and what it goes with", () => {
  assert.deepStrictEqual(manifest.needs, ['ai-agents', 'ai-skills', 'ai-commands', 'ai-prompts']);
  for (const [kind, folder] of Object.entries({ agents: 'ai-agents', skills: 'ai-skills', commands: 'ai-commands', prompts: 'ai-prompts' })) assert.ok(manifest.ai[kind].length > 0 && manifest.needs.includes(folder), `it ships ${kind}, which is why it needs ${folder}`);
  assert.deepStrictEqual(manifest.suggests, {'commands': [{'command': 'composer', 'hint': 'https://getcomposer.org/download/'}]});
  const sources = ['commands', 'scripts', 'src'].flatMap((d) => (fs.existsSync(path.join(PKG, d)) ? walk(path.join(PKG, d)) : [])).map((f) => fs.readFileSync(f, 'utf8')).join('\n');
  for (const command of ['composer']) assert.match(sources, new RegExp(`(^|[^A-Za-z0-9_-])${command}([^A-Za-z0-9_-]|$)`, 'm'), `${command} is called by the plugin`);
  assert.match(fs.readFileSync(path.join(PKG, 'README.md'), 'utf8'), /^## What it goes with$/m, 'and the README says so');
});
