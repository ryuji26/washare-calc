import { defineConfig } from '@playwright/test';

export default defineConfig({
    use: {
        // 録画とトレースを常に有効化
        video: 'on',
        trace: 'on',
        screenshot: 'on',
    },
});
