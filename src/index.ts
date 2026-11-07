/**
 * The Drupal themes workspace for Webship Workspace: the `themes/` folder as a plugin.
 *
 * What the package carries is placed by the installer from the manifest (the folder's settings file,
 * its commands and its docs) and listed by --activate; the dashboard draws the workspace from the
 * settings file like any other. Nothing to register at run time yet: this is where the folder's own
 * rail buttons, row menus or assistant context would go.
 */

import type { PluginApi } from '@webship/workspace-plugin-api';

export const WORKSPACE_KEY = 'themes';

export function register(api: PluginApi): void {
  api.addAssistantContext(() => `The themes/ workspace is the Drupal themes workspace (a plugin, @webship/workspace-drupal-themes); its commands are the cmd-*.sh scripts in that folder.`);
}
