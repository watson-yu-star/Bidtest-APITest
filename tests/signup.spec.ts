import { test, expect } from '@playwright/test';

test.describe.serial('Signup', () => {

      const newUser = {
      name: 'Bid Test',
      email: `bid.test.${Date.now()}@gmail.com`,
      password: 'password123',
    };


  test('should sign up successfully', async ({ request }) => {
    
 
    const response = await request.post('/auth/register', {
      data: newUser,
    });

    // Assert that the request was successful (e.g., 201 Created)
    expect(response.status()).toBe(201);
    expect(response.ok()).toBeTruthy();

    // Assert that the response contains the created user's data
    const responseBody = await response.json();
    expect(responseBody.user.name).toBe(newUser.name);
    expect(responseBody.user.email).toBe(newUser.email);
    expect(responseBody.user.id).toBeDefined();

  });

  test('should sign up failure for existing user', async ({ request }) => {
    

    const response = await request.post('/auth/register', {
      data: newUser,
    });

    // Assert that the request was successful (e.g., 201 Created)
    expect(response.status()).toBe(409);

    // Assert that the response contains the created user's data
    const responseBody = await response.json();
    expect(responseBody.error).toBe('A user with that email already exists');
   
  });

});

test('should sign up failure for missing fields-name', async ({ request }) => {
    
    const response = await request.post('/auth/register', {
      data: {
        email: 'bid.test@gmail.com',
        password: 'password123'
      }
    });

    expect(response.status()).toBe(400);
    const responseBody = await response.json();
    expect(responseBody.error).toBe('email, password and name are required');
});

test('should sign up failure for missing fields-email', async ({ request }) => {
    
    const response = await request.post('/auth/register', {
      data: {
        name: 'bid.test',
        password: 'password123'
      }
    });

    expect(response.status()).toBe(400);
    const responseBody = await response.json();
    expect(responseBody.error).toBe('email, password and name are required');
});

test('should sign up failure for missing fields-password', async ({ request }) => {
    
    const response = await request.post('/auth/register', {
      data: {
        name: 'bid.test',
        email: 'bid.test@gmail.com'
      }
    });

    expect(response.status()).toBe(400);
    const responseBody = await response.json();
    expect(responseBody.error).toBe('email, password and name are required');
});

test('should sign up failure for wrong format-email', async ({ request }) => {
    
    const response = await request.post('/auth/register', {
      data: {
        name: 'bid.test',
        email: 'bid.testgmail.com',
        password: 'password123'
      }
    });

    expect(response.status()).toBe(400);
    const responseBody = await response.json();
    expect(responseBody.error).toBe('Invalid email address');
});


