import { returnOf } from "scope-utilities";
import { ConfigSchemaType } from "../quickcdrcSchema.mjs";
import path from "path";
import fs from "fs";
import chalk from "chalk";

export async function loadNpmWorkspaces(
  root: string,
  config?: ConfigSchemaType
) {
  return returnOf(() => {
    if (config?.npmWorkspaces === false || config?.yarnWorkspaces === false) {
      return [];
    }

    const packageJSONPath = path.join(root, "package.json");
    const contents = fs.existsSync(packageJSONPath)
      ? fs.readFileSync(packageJSONPath).toString("utf-8")
      : "{}";

    try {
      const parsed = JSON.parse(contents);

      if (!("workspaces" in parsed)) {
        return [];
      }

      return parsed.workspaces;
    } catch {
      console.error(chalk.yellow(`⚠️ ${packageJSONPath} is not valid JSON.`));
    }

    return [];
  });
}
