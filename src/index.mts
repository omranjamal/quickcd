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
import { schema } from "./quickcdrcSchema.mjs";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { parse as parseYAML } from "yaml";
import { openTab } from "./openTab.mjs";

const args = await yargs(hideBin(process.argv)).help(false).argv;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const art = fs
  .readFileSync(path.join(__dirname, "../art.txt"))
  .toString("utf-8");

const packageJSON = JSON.parse(
  fs.readFileSync(path.join(__dirname, "../package.json")).toString("utf-8")
);

const help = `
${art}
quickcd v${packageJSON.version}

${packageJSON.description}

Usage:

qcd [filter] [--notab]
      Renders an interactive list of directories that you potentially want to
      open a new tab in.

      Note: if there is only one match, it will immediately open a new tab in that
      directory or return if --no-tab is selected.

      [filter]  allows you to pre-filter the list.

      --notab   does not attempt to automatically open a new tab.
                Meant to be used with shell aliases to support
                cd-ing in the current terminal.


qcd --alias [alias] 
      Prints a bash script that can be eval-ed to introduce
      a cli alias which allows you to cd in the current terminal
      instead of opening a new tab.

qcd -h, --help       Show this help menu
qcd -v, --version  Show installed version

Note: quickcd and qcd are aliased, you can use interchangably.
`;

const namedArgsSet = new Set<string>(Object.keys(args));

if ("h" in args || "help" in args) {
  console.log(help);
  process.exit(0);
} else if ("version" in args || "v" in args) {
  console.log(packageJSON.version);
  process.exit(0);
} else if ("alias" in args) {
  const aliasScript = fs
    .readFileSync(path.join(__dirname, "../cd-alias.sh"))
    .toString("utf-8");

  console.log(
    typeof args.alias === "string"
      ? aliasScript.replace("quickcd", args.alias)
      : aliasScript
  );

  process.exit(0);
}

namedArgsSet.delete("_");
namedArgsSet.delete("$0");

namedArgsSet.delete("v");
namedArgsSet.delete("version");
namedArgsSet.delete("h");
namedArgsSet.delete("help");
namedArgsSet.delete("alias");
namedArgsSet.delete("notab");

if (namedArgsSet.size > 0) {
  const arg = [...namedArgsSet][0];

  console.error(chalk.red(`cli argument "${arg}" not recognized.`));

  process.exit(1);
}

type TargetMapType = Record<
  string,
  {
    label: string | null;
    path: string;
    relativePath: string;
  }
>;

async function main() {
  const rootPath =
    os.platform() === "win32" ? process.cwd().split(path.sep)[0] : "/";

  const monoRepoRoot = returnOf(() => {
    let serachIn = process.cwd();
    let foundIn: string | null = null;

    while (serachIn > rootPath) {
      const gitRootPath = path.join(serachIn, "./.git");
      const quickcdrcRootPath = path.join(serachIn, "./.quickcdrc.json");

      const gitFolderExists =
        fs.existsSync(gitRootPath) && fs.lstatSync(gitRootPath).isDirectory();

      const quickcdrcFileExists =
        fs.existsSync(quickcdrcRootPath) &&
        fs.lstatSync(quickcdrcRootPath).isFile();

      if (gitFolderExists || quickcdrcFileExists) {
        foundIn = serachIn;
      }

      serachIn = path.join(serachIn, "../");
    }

    return foundIn
      ? {
          path: foundIn,
        }
      : null;
  });

  if (!monoRepoRoot) {
    console.log(
      chalk.yellow(
        `⚠️ Could not find a git repository in any parent directory up the chain; will use cwd`
      )
    );
  }

  const quickRoot = monoRepoRoot?.path ?? process.cwd();

  console.info(`Using Root: ${quickRoot}`);

  const targets = returnOf(() => {
    const targetMap: TargetMapType = {};

    function add(label: string | null, fullPath: string) {
      const resolvedPath = path.resolve(fullPath);

      targetMap[resolvedPath] = {
        label: label,
        path:
          resolvedPath === path.resolve(process.cwd()) ? "./" : resolvedPath,
        relativePath:
          resolvedPath === path.resolve(process.cwd())
            ? "."
            : path.relative(process.cwd(), resolvedPath),
      };
    }

    function traverse(root: string, map: TargetMapType) {
      const potentialQuickcdrcPath = path.join(root, ".quickcdrc.json");

      const config = returnOf(() => {
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

      add(null, root);

      const quickcdrcIncludedGlobs = returnOf(() => {
        if (config?.include) {
          if (typeof config.include === "string") {
            return [config.include];
          }

          return config.include;
        }

        return [];
      });

      // For both npm and yarn
      const npmWorkspaces: string[] = returnOf(() => {
        if (
          config?.npmWorkspaces === false ||
          config?.yarnWorkspaces === false
        ) {
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
          console.error(
            chalk.yellow(`⚠️ ${packageJSONPath} is not valid JSON.`)
          );
        }

        return [];
      });

      const pnpmWorkspaces: string[] = returnOf(() => {
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

      const includeGlobs = [
        ...quickcdrcIncludedGlobs,
        ...npmWorkspaces,
        ...pnpmWorkspaces,
      ];

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

      const matchedPaths =
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

      for (const matchedPath of matchedPaths) {
        const mactchedFullPath = path.dirname(path.join(root, matchedPath));
        add(null, mactchedFullPath);
      }

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
          add(null, mactchedFullPath);
        }
      }
    }

    traverse(quickRoot, targetMap);

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
              name: `- ${choice.path.replace(process.env.HOME ?? "", "~")}`,
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

  if (!("notab" in args)) {
    process.stdout.write(chalk.blue(`Opening terminal tab in `));
  }

  process.stderr.write(`${path.resolve(selectedPath)}`);

  if (!("notab" in args)) {
    await openTab(selectedPath);
    process.stdout.write(`\n`);
  }
}

try {
  await main();
} catch {}
