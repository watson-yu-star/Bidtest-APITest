import { test, expect } from '@playwright/test';
import { z } from 'zod';
import { ProductSchema } from '../schemas/productSchema';


test('products should be listed', async ({ request }) => {
    
    const response = await request.get('/products');
    expect(response.status()).toBe(200);
    const responseBody = await response.json();
    expect(responseBody.count).toBeGreaterThan(0);
    expect(responseBody.items).toBeInstanceOf(Array);

    ProductSchema.parse(responseBody);
});

test('search products should return results', async ({ request }) => {
    
    const response = await request.get('/products?search=beef');
    
    expect(response.status()).toBe(200);
    const responseBody = await response.json();
    ProductSchema.parse(responseBody);

    expect(responseBody.count).toBeGreaterThan(0);
    expect(responseBody.items).toBeInstanceOf(Array);
    if (responseBody.count > 0) {
        responseBody.items.forEach((item: any) => {
            expect(item.name.toLowerCase()).toContain('beef');
        });     
    }
    else{
        console.warn('No products found for search term "beef".');
    }

});

test('search category should return results', async ({ request }) => {
    
    const response = await request.get('/products?category=Seafood');
    expect(response.status()).toBe(200);
    const responseBody = await response.json();
    ProductSchema.parse(responseBody);
    expect(responseBody.count).toBeGreaterThan(0);
    expect(responseBody.items).toBeInstanceOf(Array);
    if (responseBody.count > 0) {
        responseBody.items.forEach((item: any) => {
            expect(item.category.toLowerCase()).toBe('seafood');
        });     
    }
    else{
        console.warn('No products found for category "seafood".');
    }
});


test('search price range should return results', async ({ request }) => {
    
    const response = await request.get('/products?minPrice=10&maxPrice=20');
    expect(response.status()).toBe(200);
    const responseBody = await response.json();
    ProductSchema.parse(responseBody);
    expect(responseBody.count).toBeGreaterThan(0);
    expect(responseBody.items).toBeInstanceOf(Array);
    if (responseBody.count > 0) {
        responseBody.items.forEach((item: any) => {
            expect(item.price).toBeGreaterThanOrEqual(10);
            expect(item.price).toBeLessThanOrEqual(20);
        });
    }
    else{
        console.warn('No products found for the specified price range.');
    }
});


test('search in stock products should return results', async ({ request }) => {
    
    const response = await request.get('/products?inStock=tru');
    expect(response.status()).toBe(200);
    const responseBody = await response.json();
    ProductSchema.parse(responseBody);
    expect(responseBody.count).toBeGreaterThan(0);
    expect(responseBody.items).toBeInstanceOf(Array);
    if (responseBody.count > 0) {
        responseBody.items.forEach((item: any) => {
            expect(item.stock).toBeGreaterThan(0);
        });
    }
    else{
        console.warn('No products found for the specified price range.');
    }
});

test('search non in-stock products should return zero stock', async ({ request }) => {
     const response = await request.get('/products?inStock=false');
    expect(response.status()).toBe(200);
    const responseBody = await response.json();
    ProductSchema.parse(responseBody);
    expect(responseBody.count).toBeGreaterThan(0);
    expect(responseBody.items).toBeInstanceOf(Array);
    if (responseBody.count > 0) {
        responseBody.items.forEach((item: any) => {
            expect.soft(item.stock).toBeLessThanOrEqual(0);
        });
    }
    
});

test('search non existing category should return zero results', async ({ request }) => {
    
    const response = await request.get('/products?category=NonExistingCategory');   
    expect(response.status()).toBe(200);
    const responseBody = await response.json();
    ProductSchema.parse(responseBody);
    expect(responseBody.count).toBe(0);
    expect(responseBody.items).toBeInstanceOf(Array);
    expect(responseBody.items).toHaveLength(0);
});

test('search non existing product should return zero results', async ({ request }) => {
    
    const response = await request.get('/products?search=NonExistingProduct');     
    expect(response.status()).toBe(200);
    const responseBody = await response.json();
    ProductSchema.parse(responseBody);
    expect(responseBody.count).toBe(0);
    expect(responseBody.items).toBeInstanceOf(Array);
    expect(responseBody.items).toHaveLength(0); 
});

test('search with invalid price range should return zero results', async ({ request }) => { 
    const response = await request.get('/products?minPrice=100& maxPrice=200');
    expect(response.status()).toBe(200);
    const responseBody = await response.json();
    ProductSchema.parse(responseBody);      
    expect(responseBody.count).toBe(0);
    expect(responseBody.items).toBeInstanceOf(Array);
    expect(responseBody.items).toHaveLength(0); 
});

test('combination search should return results', async ({ request }) => {
    
    const response = await request.get('/products?search=salmon&category=Seafood&minPrice=10&maxPrice=50&inStock=true');    
    expect(response.status()).toBe(200);
    const responseBody = await response.json();
    ProductSchema.parse(responseBody);  
    expect(responseBody.count).toBeGreaterThan(0);
    expect(responseBody.items).toBeInstanceOf(Array);
    if (responseBody.count > 0) {
        responseBody.items.forEach((item: any) => {
            expect(item.name.toLowerCase()).toContain('salmon');
            expect(item.category).toBe('Seafood');
            expect(item.price).toBeGreaterThanOrEqual(10);
            expect(item.price).toBeLessThanOrEqual(50);
            expect(item.stock).toBeGreaterThan(0);
        });
    }
});