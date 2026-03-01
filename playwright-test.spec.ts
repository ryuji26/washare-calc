import { test, expect } from '@playwright/test';

test('Supabase Registration Flow', async ({ page }) => {
    // ログを取得
    page.on('console', msg => console.log('PAGE LOG:', msg.type(), msg.text()));
    page.on('pageerror', err => console.error('PAGE ERROR:', err.message));
    page.on('response', async response => {
        const url = response.url();
        if (url.includes('supabase.co')) {
            console.log('SUPABASE API:', response.request().method(), url, response.status());
            if (response.status() >= 400 || url.includes('/profiles')) {
                try {
                    const body = await response.text();
                    console.log('SUPABASE API BODY:', body);
                } catch (e) { }
            }
        }
    });

    // アプリにアクセス
    await page.goto('http://localhost:3000/');

    // マイページタブをクリックしてログインモーダルを開く
    await page.click('button:has-text("マイページ")');

    // モーダルが表示されるのを待つ
    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible();

    // 新規登録タブをクリック
    await page.click('button[role="tab"]:has-text("新規登録")');

    // 新規登録フォームに入力
    const testEmail = `test_${Date.now()}@example.com`;
    await page.fill('input[placeholder="mail@example.com"]', testEmail);
    await page.fill('input[placeholder="8文字以上"]', 'password123');
    await page.fill('input[placeholder="例: 田中洗車サービス"]', 'テスト洗車店 (Playwright)');

    // selectの操作
    // Radix UIではlabelなどをクリックさせるか、直接Selectのトリガーをクリックする
    await page.getByRole('combobox').click();
    await page.getByRole('option', { name: "北海道" }).click();

    // 登録ボタンをクリック
    await page.click('button:has-text("無料で登録する")');

    // 登録完了後、モーダルが閉じるのを待つ
    await expect(modal).toBeHidden({ timeout: 10000 });

    // マイページでユーザー名が表示されているか確認
    // modalが閉じた後、少しアニメーション等でDOMの反映ラグがあるためgetByTextで待機
    const userNameLocator = page.getByText('テスト洗車店 (Playwright)');
    await expect(userNameLocator).toBeVisible({ timeout: 20000 });

    // ログアウト処理（クリーンアップ）
    await page.click('button:has-text("ログアウト")');

    // ホーム画面に戻ったことを確認
    await expect(page.locator('text=洗車メニューを選択')).toBeVisible();
});
