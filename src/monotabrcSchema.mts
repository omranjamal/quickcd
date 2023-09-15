import z from "zod";

export const schema = z
  .object({
    npmWorkspaces: z.boolean().default(true).optional(),
    yarnWorkspaces: z.boolean().default(true).optional(),
    pnpmWorkspaces: z.boolean().default(true).optional(),

    includeGitRepos: z.boolean().default(true).optional(),

    include: z.string().array().default([]).optional(),
    exclude: z.string().array().default([]).optional(),
  })
  .merge(
    z.object({
      $schema: z.string().optional(),
    })
  )
  .strict();
