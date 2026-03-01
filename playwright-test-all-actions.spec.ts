import { test, expect } from '@playwright/test';

test('Test All Preview Actions Detailed', async ({ page }) => {
    const logs: string[] = [];
    page.on('console', msg => {
        logs.push(`CONSOLE [${msg.type()}]: ${msg.text()}`);
    });
    page.on('pageerror', err => {
        logs.push(`PAGE_ERROR: ${err.message}`);
    });

    await page.goto('http://localhost:3000/');

    // Click "ボディ手洗い" to enable the button
    const processLocator = page.locator('text=ボディ手洗い').first();
    await processLocator.click();

    // Go to preview
    await page.click('button:has-text("この内容で見積書を作成する")');

    // Wait for the preview page to definitely render
    try {
        await page.waitForSelector('h2:has-text("御見積書")', { timeout: 5000 });
        console.log("On Preview Page - 御見積書 found!");
        logs.push("LOG: On Preview Page");
    } catch (e) {
        logs.push("LOG: Failed to find '御見積書'");
    }

    // Check Save button
    try {
        const saveButton = page.locator('button:has-text("この見積もりを保存する")');
        await saveButton.waitFor({ state: 'visible', timeout: 5000 });
        await saveButton.click();
        logs.push("LOG: Clicked Save Button");

        // Modal logic
        const closeBtn = page.locator('button[aria-label="Close"]').first();
        if (await closeBtn.isVisible()) {
            await closeBtn.click();
        }
    } catch (e) {
        logs.push(`LOG: Save Button error: ${(e as Error).message}`);
    }

    // Click "送付"
    try {
        const sendButton = page.locator('button:has-text("画像を保存 / LINEで送る")');
        await sendButton.waitFor({ state: 'visible', timeout: 5000 });
        await sendButton.click();
        logs.push("LOG: Clicked Send Button");
    } catch (e) {
        logs.push(`LOG: Send Button error: ${(e as Error).message}`);
    }

    await page.waitForTimeout(2000);

    console.log("--- TEST LOGS ---");
    logs.forEach(l => console.log(l));
    console.log("-----------------");
});
