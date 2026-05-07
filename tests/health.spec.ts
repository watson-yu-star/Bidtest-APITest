import { test, expect } from '@playwright/test';

test('should return 200 OK for health check', async ({ request }) => {
    const response = await request.get('/health');
    expect(response.status()).toBe(200);
    const responseBody = await response.json();
    expect(responseBody.status).toBe('ok');
});
