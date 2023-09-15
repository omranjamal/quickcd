import { globbySync } from "globby";
import { ConfigSchemaType } from "../quickcdrcSchema.mjs";
import path from "path";

export async function addMatchedGitPaths(
  root: string,
  add: (path: string) => void,
  excludeGlobs: string[],
  config?: ConfigSchemaType
) {
  const matchedGitPaths =
    config?.includeGitRepos ?? true
      ? globbySync("./**/.git", {
          cwd: root,
          gitignore: true,
          onlyFiles: false,
          expandDirectories: true,
          ignore: excludeGlobs,
          suppressErrors: true,
        })
      : [];

  for (const matchedPath of matchedGitPaths) {
    const mactchedFullPath = path.dirname(path.join(root, matchedPath));

    add(mactchedFullPath);
  }
}
