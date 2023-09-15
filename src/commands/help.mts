import fs from "fs";
import path from "path";
import { loadPackageJSON } from "../utils/parsedPackageJSON.mjs";

export async function runHelp() {
  const packageJSON = await loadPackageJSON();

  const art = fs
    .readFileSync(path.join(__dirname, "./art.txt"))
    .toString("utf-8");

  const help = `
${art}
quickcd v${packageJSON.version}

${packageJSON.description}

Usage:

qcd [filter] [--no-tab] [--tab/-t] [--only-print-path]
      Renders an interactive list of directories that you potentially want to
      cd into.

      Note: if there is only one match, it will immediately cd into that
      directory or open a new tab in that directory if cli cliases are not setup.

      [filter]  allows you to pre-filter the list.

      --no-tab          prevent the opening of a tab

      --tab/-t          forces opening a new tab in to the selected directory when aliases are setup.
                        This is the default behaviour if you don't setup the aliases.

      --path-to-stderr  (Mainly used internally to facilicate aliases) prints the 
                        selected path to stderr instead of stdout.


qcd --alias [alias] 
      Prints a shell script that can be eval-ed to introduce
      a cli alias which allows you to cd in the current terminal
      instead of opening a new tab.

qcd --setup
      Adds aliases to ~/.zshrc or ~/.bashrc to allow cd-ing.

      Note: As cd is an internal command, if you don't run --setup
            quickcd will default to opening a new tab.

qcd -h, --help       Show this help menu
qcd -v, --version  Show installed version

Note: quickcd and qcd are aliased, you can use interchangably.
`;

  console.log(help);
  return 0;
}
