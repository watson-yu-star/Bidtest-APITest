import { test, expect } from '@playwright/test';

import product from '../test-data/product.json';
import { describe } from 'zod/v4/core';

let token: string;

test.beforeAll(async ({ request },testInfo) => {

    const workerIndex = testInfo.parallelIndex;
    const newUser = {
      name: 'Bid Test',
      email: `bid.test.${Date.now()}.${workerIndex}@gmail.com`,
      password: 'password123',
    };
  
    
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

    const loginResponse = await request.post('/auth/login', {
        data: {
            email: newUser.email, 
            password: newUser.password
        }
    });
    const loginResponseBody = await loginResponse.json();
    token = loginResponseBody.token;    
});

test.describe.serial('Cart API', () => {
    
    /*
    const product={
        id: 'p-001',
        name: "NZ Grass-Fed Beef Mince",
        price: 14.5,
        unit: "500g",
        stock: 39,
        category: "Meat & Poultry",
    }
    */

    test('should add product to cart', async ({ request }) => {
        const response = await request.post('/cart/items', {
            headers: {  'Authorization': `Bearer ${token}`},
            data: {
                productId: product.id, 
                quantity: 1
            }
        });
        expect(response.status()).toBe(201);
        const responseBody = await response.json();
        expect(responseBody.items.length).toBe(1);
        const addedItem = responseBody.items.find((item: any) => item.productId === product.id);
        expect(addedItem).toBeDefined();
        expect(addedItem.quantity).toBe(1);
        expect(addedItem.unitPrice).toBe(product.price);
    });

    test('should get cart items', async ({ request }) => {
        const response = await request.get('/cart', {
            headers: {  'Authorization': `Bearer ${token}`} 
        });
        expect(response.status()).toBe(200);
        const responseBody = await response.json();
        expect(responseBody.items).toBeInstanceOf(Array);
        expect(responseBody.items.length).toBeGreaterThan(0);

        console.log('Subtotal:', responseBody.subtotal, 'GST:', responseBody.gst, 'Total:', responseBody.total);

        expect(responseBody.subtotal).toBe(product.price * 1);
        expect.soft(responseBody.gst).toBeCloseTo(responseBody.subtotal * 0.15, 2);
        console.log('Calculated GST:', responseBody.subtotal * 0.15);
        expect.soft(responseBody.total).toBeCloseTo(responseBody.subtotal + responseBody.gst, 2);
        console.log('Calculated Total:', responseBody.subtotal + responseBody.gst);
    });

    test('should update product quantity in cart', async ({ request }) => {
        const response = await request.patch(`/cart/items/${product.id}`, { 
            headers: {  'Authorization': `Bearer ${token}`},
            data: {
                quantity: 2 
            }
        });
        expect(response.status()).toBe(200);
        const responseBody = await response.json();
        expect(responseBody.items.length).toBe(1);
        const updatedItem = responseBody.items.find((item: any) => item.productId === product.id);
        expect(updatedItem).toBeDefined();
        expect(updatedItem.quantity).toBe(2);   
        expect(responseBody.subtotal).toBe(product.price * 2);
        expect.soft(responseBody.gst).toBeCloseTo(responseBody.subtotal * 0.15, 2);
        console.log('Updated Subtotal:', responseBody.subtotal, 'GST:', responseBody.gst, 'Total:', responseBody.total);
        expect.soft(responseBody.total).toBeCloseTo(responseBody.subtotal + responseBody.gst, 2)

    });

    test('should remove product from cart', async ({ request }) => {

        const response = await request.delete(`/cart/items/${product.id}`, {
            headers: {  'Authorization': `Bearer ${token}`} 
        });
        expect(response.status()).toBe(200);
        const responseBody = await response.json();
        const removedItem = responseBody.items.find((item: any) => item.productId === product.id);
        expect(removedItem).toBeUndefined();
    })

  

});

test.describe.serial('Cart API - Clear cart', () => {
  
     test('should add product2 to cart', async ({ request }) => {
          const response = await request.post('/cart/items', {
            headers: {  'Authorization': `Bearer ${token}`},
            data: {
                productId: 'p-002', 
                quantity: 1
            }
        });
        expect(response.status()).toBe(201);
        const responseBody = await response.json();
        expect(responseBody.items.length).toBe(1);
        const addedItem = responseBody.items.find((item: any) => item.productId === 'p-002');
        expect(addedItem).toBeDefined();
        expect(addedItem.quantity).toBe(1);    
    });

   test('should clear cart', async ({ request }) => {
          const response = await request.delete('/cart', {
          headers: {  'Authorization': `Bearer ${token}`} 
        });
       expect(response.status()).toBe(200);
       const responseBody = await response.json();
       expect(responseBody.items.length).toBe(0);
       expect(responseBody.subtotal).toBe(0);
       expect(responseBody.gst).toBe(0);
       expect(responseBody.total).toBe(0);
    });
});

test('should not allow access to cart without authentication', async ({ request }) => {
    const response = await request.get('/cart');
    expect(response.status()).toBe(401);
    const responseBody = await response.json();
    expect(responseBody.error).toBe('Missing or invalid Authorization header');
});

test('should not allow adding to cart without authentication', async ({ request }) => {     
    const response = await request.post('/cart/items', {
        data: {
            productId: 'p-001', 
            quantity: 1
        }
    });
    expect(response.status()).toBe(401);
    const responseBody = await response.json();
    expect(responseBody.error).toBe('Missing or invalid Authorization header');
});
test('should not allow updating cart without authentication', async ({ request }) => {
    const response = await request.patch('/cart/items/p-001', {
        data: { quantity: 2 }
    });
    expect(response.status()).toBe(401);
    const responseBody = await response.json();
    expect(responseBody.error).toBe('Missing or invalid Authorization header');
});

test('should not allow removing from cart without authentication', async ({ request }) => {
    const response = await request.delete('/cart/items/p-001');
    expect(response.status()).toBe(401);
    const responseBody = await response.json();
    expect(responseBody.error).toBe('Missing or invalid Authorization header');
});

test('should not allow removing non-existent item from cart', async ({ request }) => {
    const response = await request.delete('/cart/items/p-003',{
        headers: {  'Authorization': `Bearer ${token}`}
    });
    expect(response.status()).toBe(404);
    const responseBody = await response.json();
    expect(responseBody.error).toBe('Item not in cart');
});

test('should not allow updating non-existent item in cart', async ({ request }) => {
    const response = await request.patch('/cart/items/p-003', {
        headers: {  'Authorization': `Bearer ${token}`},
        data: { quantity: 2 }
    });
    expect(response.status()).toBe(404);
    const responseBody = await response.json();
    expect(responseBody.error).toBe('Item not in cart');
});

test('should not allow adding non-existent product to cart', async ({ request }) => {
    const response = await request.post('/cart/items', {
        headers: {  'Authorization': `Bearer ${token}`},    
        data: {
            productId: 'p-999', 
            quantity: 1 
        }
    });
    expect(response.status()).toBe(404);
    const responseBody = await response.json();
    expect(responseBody.error).toBe('Product not found');
});

test('should not allow adding more than stock to cart', async ({ request }) => {
    const response = await request.post('/cart/items', {
        headers: {  'Authorization': `Bearer ${token}`},    
        data: {
            productId: 'p-004', 
            quantity: 20
        }
    });
    expect(response.status()).toBe(400);
    const responseBody = await response.json();
    expect(responseBody.error).toMatch(/^Only \d+ unit\(s\) available$/);
});
