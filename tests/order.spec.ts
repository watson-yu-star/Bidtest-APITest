import { test, expect } from '@playwright/test';
import { z } from 'zod';
import { orderResponseSchema } from '../schemas/orderResponseSchema';
import product from '../test-data/product.json';
import customer from '../test-data/customer.json';

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


test.describe.serial('Order API', () => {

  
    let orderId: string;

    test('should return 400 for empty cart', async ({ request }) => {
    const response = await request.post('/orders', {
        headers: {  'Authorization': `Bearer ${token}`},    
        data: {
            "customer": customer
        }
    });
    expect(response.status()).toBe(400);

    });

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

    test('should create an order', async ({ request }) => {
        const response = await request.post('/orders', {
            headers: {  'Authorization': `Bearer ${token}`},
            data: {
                "customer": customer
            }
        });

        expect(response.status()).toBe(201);
        const responseBody = await response.json();
        expect(responseBody.id).toBeDefined();
        expect(responseBody.items).toBeInstanceOf(Array);
        let subtotal = 0;
        responseBody.items.forEach((item: any) => {
            expect(item.productId).toBe(product.id);
            expect(item.quantity).toBe(1);
            expect(item.unitPrice).toBe(product.price);
            subtotal += item.quantity * item.unitPrice;
        });
        expect(responseBody.subtotal).toBeCloseTo(subtotal);
        expect(responseBody.total).toBeCloseTo(subtotal+subtotal*0.15, 2); // Assuming no taxes or discounts for simplicity
        expect(responseBody.status).toBe('CONFIRMED');
        expect(responseBody.customer).toEqual(customer);
        expect(responseBody.createdAt).toBeDefined();
        orderId = responseBody.id;
        
    });


    test('should get order history', async ({ request }) => {
        const response = await request.get('/orders', {
            headers: {  'Authorization': `Bearer ${token}`}
        });
        expect(response.status()).toBe(200);
        const responseBody = await response.json();
        expect(responseBody.count).toBe(1);
        expect(responseBody.items).toBeInstanceOf(Array);
        const result = orderResponseSchema.safeParse(responseBody);
        expect.soft(result.success, 'API JSON Schema does not match').toBe(true);

    });

    test('should get order details by id', async ({ request }) => {
        const response = await request.get(`/orders/${orderId}`, {
            headers: {  'Authorization': `Bearer ${token}`}
        });
        expect(response.status()).toBe(200);
        const responseBody = await response.json();
        expect(responseBody.id).toBe(orderId);
        expect(responseBody.userId).toBeDefined();
         expect(responseBody.items).toBeInstanceOf(Array);
        let subtotal = 0;
        responseBody.items.forEach((item: any) => {
            expect(item.productId).toBe(product.id);
            expect(item.quantity).toBe(1);
            expect(item.unitPrice).toBe(product.price);
            subtotal += item.quantity * item.unitPrice;
        });
        expect(responseBody.subtotal).toBeCloseTo(subtotal);
        expect(responseBody.total).toBeCloseTo(subtotal+subtotal*0.15, 2); // Assuming no taxes or discounts for simplicity
        expect(responseBody.status).toBe('CONFIRMED');
        expect(responseBody.customer).toEqual(customer);
    });
});

test('should return 404 for non-existing order', async ({ request }) => {
    const response = await request.get('/orders/non-existing-order-id', {
        headers: {  'Authorization': `Bearer ${token}`}     
    });
    expect(response.status()).toBe(404);
    const responseBody = await response.json();
    expect(responseBody.error).toBe('Order not found');
});

test('should return 401 for unauthorized access to order id', async ({ request }) => {
    const response = await request.get('/orders/17293433-1234-5678-9101-123456789012');
    expect(response.status()).toBe(401);
    const responseBody = await response.json();
    expect(responseBody.error).toBe('Missing or invalid Authorization header');
});

test('should return 401 for unauthorized access to orders', async ({ request }) => {
    const response = await request.get('/orders');
    expect(response.status()).toBe(401);
    const responseBody = await response.json();
    expect(responseBody.error).toBe('Missing or invalid Authorization header');
});

test('should return 401 without authentication for creating orders', async ({ request }) => {
    const response = await request.post('/orders', {
        data: {
            "customer": customer
        }
    });
    expect(response.status()).toBe(401);
    const responseBody = await response.json();
    expect(responseBody.error).toBe('Missing or invalid Authorization header');
});
