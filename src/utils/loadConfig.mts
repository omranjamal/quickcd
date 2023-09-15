import path from "path";
import fs from "fs";
import { returnOf } from "scope-utilities";
import { schema } from "../quickcdrcSchema.mjs";
import chalk from "chalk";

export async function loadConfig(root: string) {
  const potentialQuickcdrcPath = path.join(root, ".quickcdrc.json");

  return returnOf(() => {
    if (
      fs.existsSync(potentialQuickcdrcPath) &&
      fs.lstatSync(potentialQuickcdrcPath).isFile()
    ) {
      const contents = fs
        .readFileSync(potentialQuickcdrcPath)
        .toString("utf-8");

      if (contents.trim().length === 0) {
        return;
      }

      try {
        const parsedContents = JSON.parse(contents);
        const structuredContents = schema.safeParse(parsedContents);

        if (!structuredContents.success) {
          console.warn(
            chalk.yellow(
              `${potentialQuickcdrcPath} is of the wrong format.`,
              structuredContents.error
            )
          );

          return;
        }

        return structuredContents.data;
      } catch {
        console.error(
          chalk.yellow(`⚠️ ${potentialQuickcdrcPath} is not valid JSON.`)
        );
      }
    }
  });
}
