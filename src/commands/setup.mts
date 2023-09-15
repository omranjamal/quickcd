import fs from "fs";
import { highlight } from "cli-highlight";
import { returnOf } from "scope-utilities";
import { _dirname } from "../paths.mjs";
import path from "path";
import chalk from "chalk";
import { args } from "../utils/args.mjs";
import enquirer from "enquirer";

export async function runSetup() {
  const aliasScriptString = fs
    .readFileSync(
      path.join(
        _dirname,
        "efficient" in args ? "./cd-alias.sh" : "./cd-alias-auto.sh"
      )
    )
    .toString("utf-8");

  const aliasScript =
    typeof args.alias === "string"
      ? aliasScriptString
          .replace("function quickcd", `function ${args.alias}`)
          .replace("--alias quickcd", `--alias ${args.alias}`)
      : aliasScriptString;

  const zshrcPath = path.join(process.env.HOME ?? "~/", ".zshrc");
  const bashrcPath = path.join(process.env.HOME ?? "~/", ".bashrc");

  async function setup(rcFilePath: string) {
    const rcFileContents = fs.readFileSync(rcFilePath).toString("utf-8");

    console.log(
      highlight(`\`\`\`\n${aliasScript}\`\`\``, { language: "bash" })
    );

    const isUpdate = returnOf(() => {
      if (
        rcFileContents.indexOf("# start: quickcd") >= 0 &&
        rcFileContents.indexOf("# end: quickcd") >= 0
      ) {
        return true;
      }

      return false;
    });

    try {
      const consent = (
        (await enquirer.prompt({
          name: "consent",
          message: isUpdate
            ? `Do you want to replace the current quickcd config in ${rcFilePath} with the code above?`
            : `Do you want to add above code to the end of ${rcFilePath}?`,
          type: "confirm",
          initial: true,
        })) as any
      ).consent;

      if (!consent) {
        console.log(
          chalk.green(
            `\n\nOKAY, you can run quickcd --setup anytime in the future to set up aliases.\n\n`
          )
        );
      } else {
        const backupPath = rcFilePath + ".quickcd-backup";
        fs.writeFileSync(backupPath, rcFileContents);

        if (isUpdate) {
          const updatedContents = rcFileContents.replace(
            /# start: quickcd.*# end: quickcd/gs,
            `${aliasScript.trim()}`
          );

          fs.writeFileSync(rcFilePath, updatedContents);
          console.log("\nUPDATED.");
        } else {
          console.log("\nADDED.");
          fs.appendFileSync(rcFilePath, `\n\n${aliasScript}\n\n`);
        }

        console.log(
          chalk.blue(
            `Note: A backup of ${rcFilePath} has been created at ${chalk.white(
              backupPath
            )}\n`
          )
        );
        console.log(
          chalk.blue("Run the following command to start using quickcd:")
        );
        console.log(`source ${rcFilePath}\n`);
        console.log(
          chalk.blue("... or just start a new terminal or terminal tab.")
        );
      }
    } catch {}
  }

  if (fs.existsSync(zshrcPath)) {
    console.log(`~/.zshrc file found.`);
    await setup(zshrcPath);
  } else if (fs.existsSync(bashrcPath)) {
    console.log(`~/.bashrc file found.`);
    await setup(bashrcPath);
  } else {
    console.error(`~/.zshrc nor ~/.bashrc file found.`);
  }

  return 0;
}
