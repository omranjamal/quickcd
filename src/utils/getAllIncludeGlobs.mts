import { returnOf } from "scope-utilities";
import { ConfigSchemaType } from "../quickcdrcSchema.mjs";
import { loadNpmWorkspaces } from "./loadNpmWorkspaces.mjs";
import { loadPnpmWorkspaces } from "./loadPnpmWorkspace.mjs";

export async function getAllIncludeGlobs(
  root: string,
  config?: ConfigSchemaType
) {
  const includedConfigGlobs = returnOf(() => {
    if (config?.include) {
      if (typeof config.include === "string") {
        return [config.include];
      }

      return config.include;
    }

    return [];
  });

  const npmWorkspaces: string[] = await loadNpmWorkspaces(root, config);
  const pnpmWorkspaces: string[] = await loadPnpmWorkspaces(root, config);

  return [
    ...new Set([...includedConfigGlobs, ...npmWorkspaces, ...pnpmWorkspaces]),
  ];
}
