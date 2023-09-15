import { returnOf } from "scope-utilities";
import { ConfigSchemaType } from "../quickcdrcSchema.mjs";
import path from "path";
import fs from "fs";
import chalk from "chalk";
import { parse as parseYAML } from "yaml";

export async function loadPnpmWorkspaces(
  root: string,
  config?: ConfigSchemaType
) {
  return returnOf(() => {
    if (config?.pnpmWorkspaces === false) {
      return [];
    }

    const pnpmWorkspaceYAMLPath = path.join(root, "pnpm-workspace.yaml");
    const contents = fs.existsSync(pnpmWorkspaceYAMLPath)
      ? fs.readFileSync(pnpmWorkspaceYAMLPath).toString("utf-8")
      : "{}";

    try {
      const parsed = parseYAML(contents);

      if (!("packages" in parsed)) {
        return [];
      }

      return parsed.packages;
    } catch {
      console.error(
        chalk.yellow(`⚠️ ${pnpmWorkspaceYAMLPath} is not valid YAML.`)
      );
    }

    return [];
  });
}
