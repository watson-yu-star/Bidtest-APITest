import {z } from 'zod';


export const orderResponseSchema = z.object({
  count: z.number().int().nonnegative(),
  items: z.array(
    z.object({
      id: z.string(),
      userId: z.string(),
      items: z.array(
        z.object({
          productId: z.string(),
          name: z.string(),
          unitPrice: z.number(),
          quantity: z.number().int().positive(),
          lineTotal: z.number(),
        })
      ),
      subtotal: z.number(),
      gst: z.number(),
      total: z.number(),
      customer: z.object({
        name: z.string(),
        email: z.string().email(),
        address: z.string(),
        city: z.string(),
        postcode: z.string(),
      }),
      status: z.enum(['CONFIRMED', 'PENDING', 'SHIPPED', 'CANCELLED']),
      createdAt: z.string(),
    })
  ),
});
