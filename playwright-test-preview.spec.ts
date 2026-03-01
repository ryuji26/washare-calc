import { test, expect } from '@playwright/test';

test('Preview, Save, and Send Flow', async ({ page }) => {
    const logs: string[] = [];
    page.on('console', msg => {
        console.log('PAGE LOG:', msg.type(), msg.text());
        logs.push(msg.text());
    });
    page.on('pageerror', err => {
        console.error('PAGE ERROR:', err.message);
        logs.push(err.message);
    });

    await page.goto('http://localhost:3000/');

    // 項目の選択（見積書作成ボタンを有効にするため）
    const handWashLocator = page.locator('span.text-sm:has-text("手洗い洗車")').first();
    if (await handWashLocator.isVisible()) {
        await handWashLocator.click();
    } else {
        await page.click('text=手洗い洗車');
    }

    // Click to create quote
    await page.click('button:has-text("この内容で見積書を作成する")', { force: true });
    await page.waitForTimeout(1000);

    // Click to handle save image (Send)
    await page.click('button:has-text("画像を保存 / LINEで送る")');
    await page.waitForTimeout(2000);

    // Validate if any error was caught
    if (logs.some(l => l.includes('Error') || l.includes('Failed'))) {
        throw new Error('Caught an error in logs during execution');
    }
});
