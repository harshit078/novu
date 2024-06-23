import { expect } from '@playwright/test';
import { test } from './utils/baseTest';
import { initializeSession } from './utils/browser';
import { Environment, SidebarPage } from './page-models/sidebarPage';

test.beforeEach(async ({ page }) => {
  await initializeSession(page);
});

test('should display the environment switcher', async ({ page }) => {
  const sidebarPage = await SidebarPage.goTo(page);
  const envSwitch = sidebarPage.getEnvironmentSwitch();

  expect(envSwitch.textContent).toBe(Environment.Development);
  await envSwitch.click();

  await expect(envSwitch.page().getByRole('option', { name: Environment.Development })).toBeVisible();
  await expect(envSwitch.page().getByRole('option', { name: Environment.Production })).toBeVisible();

  await sidebarPage.toggleToProduction();

  expect(envSwitch.textContent).toBe(Environment.Production);
});
