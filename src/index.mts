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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ttabPath = path.join(__dirname, "../node_modules/.bin/ttab");

const rootPath =
  os.platform() === "win32" ? process.cwd().split(path.sep)[0] : "/";

const monoRepoRoot = returnOf(() => {
  let serachIn = process.cwd();

  while (serachIn > rootPath) {
    const gitRootPath = path.join(serachIn, "./.git");

    if (fs.existsSync(gitRootPath) && fs.lstatSync(gitRootPath).isDirectory()) {
      return serachIn;
    }

    serachIn = path.join(serachIn, "../");
  }

  return null;
});

if (!monoRepoRoot) {
  console.log(
    chalk.yellow(
      `⚠️ Could not find a git repository in any parent directory up the chain`
    )
  );
  console.log(chalk.white(`Using CWD ${process.cwd()}`));
}

const root = monoRepoRoot ?? process.cwd();

const targets = globbySync("./**/.{git,mtt}", {
  cwd: root,
  expandDirectories: true,
  onlyFiles: false,
}).map((filePath) => path.dirname(filePath));

const namedTargets = returnOf(() => {
  const labeledTargets = targets.sort().map((target) => {
    const label = returnOf(() => {
      if (target === ".") {
        return "CURRENT DIRECTORY";
      }

      const mttPath = path.join(target, "./.mtt");

      if (fs.existsSync(mttPath) && fs.lstatSync(mttPath).isFile()) {
        const contents = fs.readlinkSync(mttPath).toString();

        if (!contents || contents.trim().length === 0) {
          return null;
        }

        return contents;
      }

      return null;
    });

    return {
      label,
      path: target,
    };
  });

  const isCurrentDirectoryIncluded = labeledTargets.some(
    (target) => target.path === "."
  );

  return isCurrentDirectoryIncluded
    ? labeledTargets
    : [
        ...labeledTargets,
        {
          label: "CURRENT DIRECTORY",
          path: ".",
        },
      ];
});

const selectedPath = (
  (await enquirer.prompt({
    name: "path",
    message: "SELECT A PATH",
    type: "autocomplete",
    choices: namedTargets.map((target) => ({
      name: `(${target.label ?? ''}): ${target.path}`,
      value: target.path,
    })),
    multiple: false,
  })) as any
).path;

console.log(
  chalk.blue(`Opening terminal tab in ${path.resolve(selectedPath)}`)
);

execa(ttabPath, ["-d", selectedPath]);
