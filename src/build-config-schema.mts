import { z } from "zod";
import { schema } from "./monotabrcSchema.mjs";
import { zodToJsonSchema } from "zod-to-json-schema";

console.log(
  JSON.stringify(
    zodToJsonSchema(
      schema.and(
        z.object({
          $schema: z.string().optional(),
        })
      )
    ),
    null,
    2
  )
);
