import { test, expect } from '@playwright/test';

const randomUsername = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
const randomPassword = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

test.setTimeout(100000);

test('User creates account, logs in, uploads video, waits for transcoding, and downloads video', async ({ page }) => {

    await page.goto('http://localhost:3000/register');

    // Fill in the registration form
    await page.fill('input[placeholder="Username"]', randomUsername);
    await page.fill('input[placeholder="Password"]', randomPassword);
    await page.click('button[type="submit"]');

    // Wait for navigation to the login page
    await page.waitForNavigation();

    // Fill in the login form
    await page.fill('input[placeholder="Username"]', randomUsername);
    await page.fill('input[placeholder="Password"]', randomPassword);
    await page.click('button[type="submit"]');

    // Wait for navigation to the video upload page
    await page.waitForNavigation();

    // Upload a video
    const [fileChooser] = await Promise.all([
        page.waitForEvent('filechooser'),
        page.click('input[type="file"]'),
    ]);
    await fileChooser.setFiles('tests/e2e/example.mp4');
    await page.click('button:has-text("Upload and Convert")');

    // Wait for the upload and conversion to finish
    await page.waitForSelector('p:has-text("Transcoding is finished")');

    await page.click('button:has-text("Download Video")');
});
