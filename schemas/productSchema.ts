
 import { z } from 'zod';
 
 export const ProductSchema = z.object({
        count: z.number(),
        items: z.array(z.object({
            id: z.string(),
            name: z.string(),
            price: z.number(),
            stock: z.number(),
            category: z.string()
        }))
    });