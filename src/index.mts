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

const ttabPath = path.join(__dirname, "../node_modules/.bin/ttab");

const rootPath =
  os.platform() === "win32" ? process.cwd().split(path.sep)[0] : "/";

const monoRepoRoot = returnOf(() => {
  let serachIn = process.cwd();

  while (serachIn > rootPath) {
    const gitRootPath = path.join(serachIn, "./.git");
    const monotabrcRootPath = path.join(serachIn, "./.monotabrc");

    const gitFolderExists =
      fs.existsSync(gitRootPath) && fs.lstatSync(gitRootPath).isDirectory();

    const monotabrcExists =
      fs.existsSync(monotabrcRootPath) &&
      fs.lstatSync(monotabrcRootPath).isFile();

    if (gitFolderExists || monotabrcExists) {
      return {
        path: serachIn,
        ...(monotabrcExists
          ? {
              monotabrcFileExists: true,
              monotabrcFilePath: monotabrcRootPath,
            }
          : null),
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

console.info(chalk.blue(`Using: ${monoRoot}`));

type TargetMapType = Record<
  string,
  {
    label: string | null;
    path: string;
  }
>;

const targets = returnOf(() => {
  const targetMap: TargetMapType = {};

  function traverse(
    root: string,
    map: TargetMapType,
    globalTraverse: boolean = false
  ) {
    const potentialMonotabrcPath = path.join(root, ".monotabrc");

    const config = returnOf(() => {
      if (
        fs.existsSync(potentialMonotabrcPath) &&
        fs.lstatSync(potentialMonotabrcPath).isFile()
      ) {
        const contents = fs
          .readFileSync(potentialMonotabrcPath)
          .toString("utf-8");

        try {
          const parsedContents = JSON.parse(contents);
          const structuredContents = schema.safeParse(parsedContents);

          if (!structuredContents.success) {
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

    map[root] = {
      label: config?.label ?? null,
      path: root === monoRoot ? "." : path.relative(monoRoot, root),
    };

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

    const matchedPaths = globalTraverse
      ? globbySync("./**/.{git,monotabrc}", {
          cwd: root,
          gitignore: true,
          onlyFiles: false,
          expandDirectories: true,
          ignore: excludeGlobs,
          suppressErrors: true,
        })
      : [];

    for (const matchedPath of matchedPaths) {
      traverse(path.dirname(path.join(root, matchedPath)), map);
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
        traverse(path.join(root, matchedPath), map, false);
      }
    }
  }

  traverse(monoRoot, targetMap, true);

  return Object.values(targetMap);
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
            name: `(${choice.label ?? ""}): ${choice.path}`,
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
