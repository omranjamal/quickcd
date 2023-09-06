import chalk from "chalk";
import { execa } from "execa";
import { returnOf } from "scope-utilities";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ttabPath = path.join(__dirname, "../node_modules/.bin/ttab");

export async function openTab(terminalPath: string) {
  const isWindows = process.platform === "win32";
  const isLinux = process.platform === "linux";

  if (isLinux) {
    const ppid = `${process.ppid}`;
    const { stdout: pppidRaw } = await execa("ps", ["-o", "ppid=", ppid]);
    const pppid = pppidRaw.trim();

    const { stdout: statOutput } = await execa("cat", [`/proc/${pppid}/stat`]);
    const terminalPID = statOutput.split(" ")[3];
    const { stdout: terinalProgramStringRaw } = await execa("ps", [
      "-o",
      "cmd",
      "-f",
      "-p",
      terminalPID,
    ]);

    const terminalProgramString =
      terinalProgramStringRaw.split("\n").pop() ?? "";

    const terminalProgram = returnOf(() => {
      if (terminalProgramString.indexOf("gnome-terminal") >= 0) {
        return "gnome-terminal";
      } else if (terminalProgramString.indexOf("konsole") >= 0) {
        return "konsole";
      } else {
        return null;
      }
    });

    if (terminalProgram === "gnome-terminal") {
      await execa("gnome-terminal", [
        "--tab",
        "--working-directory",
        terminalPath,
      ]);
    } else if (terminalProgram === "konsole") {
      await execa("konsole", ["--new-tab", "--workdir", terminalPath]);
    } else {
      console.error(
        chalk.red(
          "Possibly unsupported terminal program.",
          terminalProgramString
        )
      );
    }
  } else {
    execa(ttabPath, ["-d", terminalPath]);
  }
}
