import z from 'zod';

export const schema = z.object({
    label: z.string().optional(),
    include: z.string().array().optional(),
    exclude: z.string().array().optional()
});
