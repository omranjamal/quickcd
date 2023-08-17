import z from 'zod';

export const schema = z.object({
    include: z.string().array().optional(),
    exclude: z.string().array().optional()
}).strict();
