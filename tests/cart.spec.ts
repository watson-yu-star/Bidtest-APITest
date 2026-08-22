//import { test, expect } from '@playwright/test';
import { test, expect } from './fixtures';
import product from '../test-data/product.json';
//import {users} from '../test-data/users.json'

//let token: string;
// use the token from the fixture authToken instead of creating a new user and logging in for each test. This is more efficient and avoids potential issues with rate limiting or duplicate users.
/*
test.beforeAll(async ({ request },testInfo) => {

    const workerIndex = testInfo.parallelIndex;
    
    const newUser = {
      name: 'bidapitestuser',
      email: `bidapitest${workerIndex}@test.com`,
      password: 'password123',
    };
  

    const loginResponse = await request.post('/auth/login', {
        data: {
            email: newUser.email, 
            password: newUser.password
        }
    });
    expect(loginResponse.status()).toBe(200);
    const loginResponseBody = await loginResponse.json();
    token = loginResponseBody.token;    

});

*/

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
    test('should clear cart', async ({ request,authToken }) => {
          const response = await request.delete('/cart', {
          headers: {  'Authorization': `Bearer ${authToken}`} 
        });
       expect(response.status()).toBe(200);
       const responseBody = await response.json();
       expect(responseBody.items.length).toBe(0);
       expect(responseBody.subtotal).toBe(0);
       expect(responseBody.gst).toBe(0);
       expect(responseBody.total).toBe(0);
    });

    test('should add product to cart', async ({ request,authToken }) => {
        const response = await request.post('/cart/items', {
            headers: {  'Authorization': `Bearer ${authToken}`},
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

    test('should get cart items', async ({ request, authToken }) => {
        const response = await request.get('/cart', {
            headers: {  'Authorization': `Bearer ${authToken}`} 
        });
        expect(response.status()).toBe(200);
        const responseBody = await response.json();
        expect(responseBody.items).toBeInstanceOf(Array);
        expect(responseBody.items.length).toBeGreaterThan(0);

        console.log('Subtotal:', responseBody.subtotal, 'GST:', responseBody.gst, 'Total:', responseBody.total);

        expect(responseBody.subtotal).toBe(product.price * 1);
        const expectedGst = parseFloat((responseBody.subtotal * 3/23).toFixed(2)); 
        const isCorrectedGst = Math.abs(expectedGst - responseBody.gst) < 0.01 ;
        console.log('Calculated GST:', responseBody.subtotal * 3/23);
        test.fail(isCorrectedGst, `Expected GST: ${expectedGst}, but got: ${responseBody.gst}`);
        //expect.soft(responseBody.gst).toBeCloseTo(responseBody.subtotal * 0.15, 2);
     
        expect(responseBody.total).toBeCloseTo(responseBody.subtotal + responseBody.gst, 2);
        console.log('Calculated Total:', responseBody.subtotal + responseBody.gst);
    });

    test('should update product quantity in cart', async ({ request, authToken }) => {
        const response = await request.patch(`/cart/items/${product.id}`, { 
            headers: {  'Authorization': `Bearer ${authToken}`},
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
         const expectedGst = parseFloat((responseBody.subtotal * 0.15).toFixed(2)); 
        const isCorrectedGst = Math.abs(expectedGst - responseBody.gst) < 0.01 ;
        test.fail(isCorrectedGst, `Expected GST: ${expectedGst}, but got: ${responseBody.gst}`);
        //expect.soft(responseBody.gst).toBeCloseTo(responseBody.subtotal * 0.15, 2);
        console.log('Updated Subtotal:', responseBody.subtotal, 'GST:', responseBody.gst, 'Total:', responseBody.total);
        expect(responseBody.total).toBeCloseTo(responseBody.subtotal + responseBody.gst, 2)

    });

    test('should remove product from cart', async ({ request, authToken }) => {

        const response = await request.delete(`/cart/items/${product.id}`, {
            headers: {  'Authorization': `Bearer ${authToken}`} 
        });
        expect(response.status()).toBe(200);
        const responseBody = await response.json();
        const removedItem = responseBody.items.find((item: any) => item.productId === product.id);
        expect(removedItem).toBeUndefined();
    })

  

});

test.describe.serial('Cart API - Clear cart', () => {
  
     test('should add product2 to cart', async ({ request, authToken }) => {
          const response = await request.post('/cart/items', {
            headers: {  'Authorization': `Bearer ${authToken}`},
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

   test('should clear cart', async ({ request, authToken }) => {
          const response = await request.delete('/cart', {
          headers: {  'Authorization': `Bearer ${authToken}`} 
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

test('should not allow removing non-existent item from cart', async ({ request, authToken }) => {
    const response = await request.delete('/cart/items/p-003',{
        headers: {  'Authorization': `Bearer ${authToken}`}
    });
    expect(response.status()).toBe(404);
    const responseBody = await response.json();
    expect(responseBody.error).toBe('Item not in cart');
});

test('should not allow updating non-existent item in cart', async ({ request, authToken }) => {
    const response = await request.patch('/cart/items/p-003', {
        headers: {  'Authorization': `Bearer ${authToken}`},
        data: { quantity: 2 }
    });
    expect(response.status()).toBe(404);
    const responseBody = await response.json();
    expect(responseBody.error).toBe('Item not in cart');
});

test('should not allow adding non-existent product to cart', async ({ request, authToken }) => {
    const response = await request.post('/cart/items', {
        headers: {  'Authorization': `Bearer ${authToken}`},    
        data: {
            productId: 'p-999', 
            quantity: 1 
        }
    });
    expect(response.status()).toBe(404);
    const responseBody = await response.json();
    expect(responseBody.error).toBe('Product not found');
});

test('should not allow adding more than stock to cart', async ({ request, authToken }) => {
    const response = await request.post('/cart/items', {
        headers: {  'Authorization': `Bearer ${authToken}`},    
        data: {
            productId: 'p-004', 
            quantity: 20
        }
    });
    expect(response.status()).toBe(400);
    const responseBody = await response.json();
    expect(responseBody.error).toMatch(/^Only \d+ unit\(s\) available$/);
});
