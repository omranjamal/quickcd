#!/usr/bin/env node

import { execa } from "execa";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import os from "os";
import { returnOf } from "scope-utilities";
import { globbySync } from "globby";
import chalk from "chalk";
import enquirer from "enquirer";
import { schema } from "./monotabrcSchema.mjs";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

const args = await yargs(hideBin(process.argv)).argv;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

type TargetMapType = Record<
  string,
  {
    label: string | null;
    path: string;
    relativePath: string;
  }
>;

async function main() {
  const ttabPath = path.join(__dirname, "../node_modules/.bin/ttab");

  const rootPath =
    os.platform() === "win32" ? process.cwd().split(path.sep)[0] : "/";

  const monoRepoRoot = returnOf(() => {
    let serachIn = process.cwd();

    while (serachIn > rootPath) {
      const gitRootPath = path.join(serachIn, "./.git");

      const gitFolderExists =
        fs.existsSync(gitRootPath) && fs.lstatSync(gitRootPath).isDirectory();

      if (gitFolderExists) {
        return {
          path: serachIn,
        };
      }

      serachIn = path.join(serachIn, "../");
    }

    return null;
  });

  if (!monoRepoRoot) {
    console.log(
      chalk.yellow(
        `⚠️ Could not find a git repository in any parent directory up the chain; will use cwd`
      )
    );
  }

  const monoRoot = monoRepoRoot?.path ?? process.cwd();

  console.info(`\nUsing: ${monoRoot}\n`);

  const targets = returnOf(() => {
    const targetMap: TargetMapType = {};

    function add(label: string | null, fullPath: string) {
      const resolvedPath = path.resolve(fullPath);

      targetMap[resolvedPath] = {
        label: label,
        path: resolvedPath === path.resolve(process.cwd()) ? "./" : resolvedPath,
        relativePath:
          resolvedPath === path.resolve(process.cwd())
            ? "."
            : path.relative(process.cwd(), resolvedPath),
      };
    }

    function traverse(root: string, map: TargetMapType) {
      const potentialMonotabrcPath = path.join(root, ".monotabrc.json");

      const config = returnOf(() => {
        if (
          fs.existsSync(potentialMonotabrcPath) &&
          fs.lstatSync(potentialMonotabrcPath).isFile()
        ) {
          const contents = fs
            .readFileSync(potentialMonotabrcPath)
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
                  `${potentialMonotabrcPath} is of the wrong format.`,
                  structuredContents.error
                )
              );

              return;
            }

            return structuredContents.data;
          } catch {
            console.error(
              chalk.yellow(`⚠️ ${potentialMonotabrcPath} is not valid JSON.`)
            );
          }
        }
      });

      add(null, root);

      const includeGlobs = returnOf(() => {
        if (config?.include) {
          if (typeof config.include === "string") {
            return [config.include];
          }

          return config.include;
        }

        return [];
      });

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

      const matchedPaths = globbySync("./**/.{git,monotabrc.json}", {
        cwd: root,
        gitignore: true,
        onlyFiles: false,
        expandDirectories: true,
        ignore: excludeGlobs,
        suppressErrors: true,
      });

      for (const matchedPath of matchedPaths) {
        const mactchedFullPath = path.dirname(path.join(root, matchedPath));
        add(null, mactchedFullPath);
      }

      for (const pathGlob of includeGlobs) {
        const matchedPaths = globbySync(pathGlob, {
          cwd: root,
          onlyDirectories: true,
          expandDirectories: true,
          ignore: excludeGlobs,
          suppressErrors: true,
        });

        for (const matchedPath of matchedPaths) {
          const mactchedFullPath = path.dirname(path.join(root, matchedPath));
          add(null, mactchedFullPath);
        }
      }
    }

    traverse(monoRoot, targetMap);

    return Object.values(targetMap);
  }).sort((a, b) => {
    if (a.path > b.path) {
      return 1;
    } else if (a.path < b.path) {
      return -1;
    }

    return 0;
  });

  const choices = args._[0]
    ? targets.filter((target) => {
        return target.path.includes(`${args._[0]}`);
      })
    : targets;

  const selectedPath =
    choices.length > 1
      ? (
          (await enquirer.prompt({
            name: "path",
            message: "SELECT A PATH",
            type: "autocomplete",
            choices: choices.map((choice) => ({
              name: `- ${choice.path.replace(process.env.HOME ?? '', '~')}`,
              value: choice.path,
            })),
            multiple: false,
          })) as any
        ).path
      : choices.length === 1
      ? choices[0].path
      : null;

  if (!selectedPath) {
    console.log(chalk.red(`no matching paths found. run with -h to see help.`));
    process.exit(1);
  }

  console.log(
    chalk.blue(`Opening terminal tab in ${path.resolve(selectedPath)}`)
  );

  execa(ttabPath, ["-d", selectedPath]);
}

try {
  await main();
} catch {}
