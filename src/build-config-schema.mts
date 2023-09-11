import { schema } from "./monotabrcSchema.mjs";
import { zodToJsonSchema } from "zod-to-json-schema";

console.log(JSON.stringify(zodToJsonSchema(schema), null, 2));
