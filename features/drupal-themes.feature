Feature: The Drupal themes workspace plugin
  Once the plugin is activated and installed, the themes workspace is on the dashboard, and the
  Plugins page lists the plugin with its four steps.

  Scenario: The workspace page is there
    Given I am on "/themes"
     Then the element "h1" should be displayed
      And "#webship-workspace-projects, .items-list, .workspace-page" should be attached

  # The Plugins page names each plugin; the package is on the plugin's own page (the row shows it on hover only).
  Scenario: The plugin is listed on the Plugins page, and its own page names its package
    Given I am on "/settings/plugins"
     Then I should see "Drupal themes"
     When I go to "/settings/plugin/drupal-themes"
     Then I should see "@webship.co/workspace-drupal-themes"

  # The AI folders are searched by name: with every plugin on, a folder lists more than one page of items.
  Scenario: The AI Agents folder lists the agent the plugin ships
    Given I am on "/ai-agents?q=themes-maintainer"
     Then I should see "themes-maintainer"

  Scenario: The AI Skills folder lists the skill the plugin ships
    Given I am on "/ai-skills?q=themes-workflow"
     Then I should see "themes-workflow"

  Scenario: The AI Commands folder lists the command the plugin ships
    Given I am on "/ai-commands?q=themes-check"
     Then I should see "themes-check"

  Scenario: The AI Prompts folder lists the prompt the plugin ships
    Given I am on "/ai-prompts?q=themes-green-gate"
     Then I should see "themes-green-gate"
