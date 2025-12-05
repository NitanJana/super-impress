import { expect, test } from '@playwright/test';

test.describe('Change Password Page', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/password-change');
	});

	test('has change password form with all required fields', async ({ page }) => {
		await expect(page.getByRole('heading', { name: 'Change password', level: 1 })).toBeVisible();

		const form = page.getByRole('form', { name: 'Change your password' });
		await expect(form).toBeVisible();

		await expect(page.getByLabel('Current password')).toBeVisible();
		await expect(page.getByLabel('New password', { exact: true })).toBeVisible();
		await expect(page.getByLabel('Confirm new password', { exact: true })).toBeVisible();

		await expect(page.getByRole('button', { name: 'Change password' })).toBeVisible();
	});

	test('successfully changes password with valid credentials', async ({ page }) => {
		const uniqueEmail = `change-password-test-${Date.now()}@example.com`;
		const oldPassword = 'OldPassword@123';
		const newPassword = 'NewPassword@456';

		await page.goto('/register');
		await page.getByLabel('Email').fill(uniqueEmail);
		await page.getByLabel('Password', { exact: true }).fill(oldPassword);
		await page.getByLabel('Confirm password').fill(oldPassword);
		await page.getByRole('button', { name: 'Register' }).click();

		await expect(page).toHaveURL('/login');
		await page.getByLabel('Email').fill(uniqueEmail);
		await page.getByLabel('Password').fill(oldPassword);
		await page.getByRole('button', { name: 'Log in' }).click();

		await expect(page).toHaveURL('/');
		await page.goto('/password-change');
		await expect(page).toHaveURL('/password-change');

		await page.getByLabel('Current password').fill(oldPassword);
		await page.getByLabel('New password', { exact: true }).fill(newPassword);
		await page.getByLabel('Confirm new password').fill(newPassword);
		await page.getByRole('button', { name: 'Change password' }).click();

		await expect(page).toHaveURL('/login');
		await page.getByLabel('Email').fill(uniqueEmail);
		await page.getByLabel('Password').fill(newPassword);
		await page.getByRole('button', { name: 'Log in' }).click();

		await expect(page).toHaveURL('/');
	});
});
