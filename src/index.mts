#!/usr/bin/env node

import { _dirname } from "./paths.mjs";
import chalk from "chalk";
import enquirer from "enquirer";
import { openTab } from "./openTab.mjs";
import { runHelp } from "./commands/help.mjs";
import { runVersion } from "./commands/version.mjs";
import { args } from "./utils/args.mjs";
import { runSetup } from "./commands/setup.mjs";
import { runAlias } from "./commands/alias.mjs";
import { validateArguments } from "./utils/validateArguments.mjs";
import { getRoot } from "./utils/getRoot.mjs";
import { getTargets } from "./utils/getTargets.mjs";
import { loadConfig } from "./utils/loadConfig.mjs";

async function main() {
  const argumentValidationResult = await validateArguments(Object.keys(args));

  if (!argumentValidationResult.success) {
    console.error(
      chalk.red(
        `cli argument "--${argumentValidationResult.unknown}" not recognized.`
      )
    );

    return process.exit(1);
  }

  if ("h" in args || "help" in args) {
    return process.exit(await runHelp());
  } else if ("setup" in args) {
    return process.exit(await runSetup());
  } else if ("version" in args || "v" in args) {
    return process.exit(await runVersion());
  } else if ("alias" in args) {
    return process.exit(await runAlias());
  }

  const quickRoot = await getRoot();
  const config = await loadConfig(quickRoot);

  console.info(`Using Root: ${quickRoot}`);

  const targets = await getTargets(quickRoot, config);

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

  if (("tab" in args && args.tab === true) || !("tab" in args)) {
    process.stdout.write(chalk.blue("Opening tab in "));
  }

  if ("path-to-stderr" in args) {
    process.stderr.write(`${selectedPath}\n`);
  } else {
    process.stdout.write(chalk.white(`${selectedPath}\n`));
  }

  if (("tab" in args && args.tab === true) || !("tab" in args)) {
    await openTab(selectedPath);
  }
}

try {
  await main();
} catch {}
