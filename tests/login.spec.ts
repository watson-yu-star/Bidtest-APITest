import { test, expect } from '@playwright/test';

test.describe.serial('login', () => {

   const newUser = {
      name: 'Bid Test',
      email: `bid.test.${Date.now()}@gmail.com`,
      password: 'password123',
    };
    let token: string;

    test('sign up the account for login', async ({ request }) => {
        const response = await request.post('/auth/register', {
        data: newUser,
        }); 
        expect(response.status()).toBe(201);
        expect(response.ok()).toBeTruthy();
    });

    test('should login successfully', async ({ request }) => {
        const response = await request.post('/auth/login', {
        data: {
            email: newUser.email,
            password: newUser.password
        },
        }); 
        expect(response.status()).toBe(200);
        expect(response.ok()).toBeTruthy();
        const responseBody = await response.json();
        expect(responseBody.token).toBeDefined();
        token = responseBody.token;
    });
    test('its me', async ({ request }) => {
         const response = await request.get('/auth/me', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        expect(response.status()).toBe(200);
        expect(response.ok()).toBeTruthy();
        const responseBody = await response.json();
        expect(responseBody.name).toBe(newUser.name);
        expect(responseBody.email).toBe(newUser.email);
        expect(responseBody.id).toBeDefined();
    });

});

test('should login failure for invalid credentials', async ({ request }) => {
    const response = await request.post('/auth/login', {
        data: {
            email: 'bid.test@gmail.com',
            password: 'wrongpassword'
        }
    });
    expect(response.status()).toBe(401);
    expect(response.ok()).toBeFalsy();

    const responseBody = await response.json();
    expect(responseBody.error).toBe('Invalid email or password');

});


test('should login failure for missing credentials', async ({ request }) => {
    const response = await request.post('/auth/login', {
        data: {
            email: 'bid.test@gmail.com'
        }
    });
    expect(response.status()).toBe(400);
    expect(response.ok()).toBeFalsy();

    const responseBody = await response.json();
    expect(responseBody.error).toBe('email and password are required');

});

test('should login failure for missing email', async ({ request }) => {
    const response = await request.post('/auth/login', {
        data: {
            password: 'password123'
        }
    });
    expect(response.status()).toBe(400);
    expect(response.ok()).toBeFalsy();

    const responseBody = await response.json();
    expect(responseBody.error).toBe('email and password are required');

});

test('its me with wrong token', async ({ request }) => {
         const response = await request.get('/auth/me', {
            headers: {
                'Authorization': `Bearer ad9071bb81633f89f7f6f9925820dc3ee6e242c49db141a8576ad58eb3ac047d`
            }
        });
        expect(response.status()).toBe(401);
        expect(response.ok()).toBeFalsy();
        const responseBody = await response.json();
        expect(responseBody.error).toBe('Invalid or expired token');
       
});

test('its me without token', async ({ request }) => {
         const response = await request.get('/auth/me');
        expect(response.status()).toBe(401);
        expect(response.ok()).toBeFalsy();
        const responseBody = await response.json();
        expect(responseBody.error).toBe('Missing or invalid Authorization header');
       
});