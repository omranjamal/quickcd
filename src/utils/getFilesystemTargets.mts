import path from "path";
import { returnOf } from "scope-utilities";
import { loadConfig } from "./loadConfig.mjs";
import { addMatchedGitPaths } from "./addMatchedGitPaths.mjs";
import { getAllIncludeGlobs } from "./getAllIncludeGlobs.mjs";
import { addGlobMatchedPaths } from "./addGlobMatchedPaths.mjs";
import { ConfigSchemaType } from "../quickcdrcSchema.mjs";

export type TargetMapType = Record<
  string,
  {
    path: string;
    relativePath: string;
  }
>;

export async function getFilesystemTargets(
  root: string,
  config?: ConfigSchemaType
) {
  return (
    await returnOf(async () => {
      const targetMap: TargetMapType = {};

      function add(fullPath: string) {
        const resolvedPath = path.resolve(fullPath);

        targetMap[resolvedPath] = {
          path:
            resolvedPath === path.resolve(process.cwd()) ? "./" : resolvedPath,
          relativePath:
            resolvedPath === path.resolve(process.cwd())
              ? "."
              : path.relative(process.cwd(), resolvedPath),
        };
      }

      add(root);

      const excludeGlobs = [
        "**/node_modules/**",
        ...returnOf(() => {
          if (config?.exclude) {
            if (typeof config.exclude === "string") {
              return [config.exclude];
            }

            return config.exclude;
          }

          return [];
        }),
      ];

      await addMatchedGitPaths(root, add, excludeGlobs, config);

      await addGlobMatchedPaths(
        root,
        add,
        await getAllIncludeGlobs(root, config),
        excludeGlobs
      );

      return Object.values(targetMap);
    })
  ).sort((a, b) => {
    if (a.path > b.path) {
      return 1;
    } else if (a.path < b.path) {
      return -1;
    }

    return 0;
  });
}
