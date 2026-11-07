Feature: The Drupal themes workspace plugin
  Once the plugin is activated and installed, the themes workspace is on the dashboard, and the
  Plugins page lists the plugin with its four steps.

  Scenario: The workspace page is there
    Given I am on "/themes"
     Then I should see "Drupal themes"

  Scenario: The plugin is listed on the Plugins page
    Given I am on "/settings/plugins"
     Then I should see "Drupal themes"
      And I should see "@webship/workspace-drupal-themes"
