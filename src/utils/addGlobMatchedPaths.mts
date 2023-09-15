import { globbySync } from "globby";
import path from "path";

export async function addGlobMatchedPaths(
  root: string,
  add: (path: string) => void,
  includeGlobs: string[],
  excludeGlobs: string[]
) {
  for (const pathGlob of includeGlobs) {
    const matchedPaths = globbySync(pathGlob, {
      cwd: root,
      onlyDirectories: true,
      expandDirectories: false,
      ignore: excludeGlobs,
      suppressErrors: true,
    });

    for (const matchedPath of matchedPaths) {
      const mactchedFullPath = path.resolve(path.join(root, matchedPath));
      add(mactchedFullPath);
    }
  }
}
