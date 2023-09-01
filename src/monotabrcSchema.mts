import z from 'zod';

export const schema = z.object({
    npmWorkspaces: z.boolean().optional(),
    yarnWorkspaces: z.boolean().optional(),
    pnpmWorkspaces: z.boolean().optional(),
    include: z.string().array().optional(),
    exclude: z.string().array().optional()
}).strict();
