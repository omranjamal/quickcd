import chalk from "chalk";
import { execa } from "execa";
import { returnOf } from "scope-utilities";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ttabPath = path.join(__dirname, "../node_modules/.bin/ttab");

export async function findTerminalProgram(
  startingPID: number,
  depth: number = 3
): Promise<string | null> {
  if (depth < 1) {
    return null;
  }

  const pid = `${startingPID}`;
  const { stdout: ppidRaw } = await execa("ps", ["-o", "ppid=", pid]);
  const ppid = ppidRaw.trim();

  const { stdout: statOutput } = await execa("cat", [`/proc/${ppid}/stat`]);
  const terminalPID = statOutput.split(" ")[3];
  const { stdout: terinalProgramStringRaw } = await execa("ps", [
    "-o",
    "cmd",
    "-f",
    "-p",
    terminalPID,
  ]);

  const terminalProgramString = terinalProgramStringRaw.split("\n").pop() ?? "";

  if (terminalProgramString.indexOf("gnome-terminal") >= 0) {
    return "gnome-terminal";
  } else if (terminalProgramString.indexOf("konsole") >= 0) {
    return "konsole";
  } else {
    return await findTerminalProgram(parseInt(ppid), depth - 1);
  }
}

export async function openTab(terminalPath: string) {
  const isWindows = process.platform === "win32";
  const isLinux = process.platform === "linux";

  if (isLinux) {
    const terminalProgram = await findTerminalProgram(process.ppid);

    if (terminalProgram === "gnome-terminal") {
      await execa("gnome-terminal", [
        "--tab",
        "--working-directory",
        terminalPath,
      ]);
    } else if (terminalProgram === "konsole") {
      await execa("konsole", ["--new-tab", "--workdir", terminalPath]);
    } else {
      console.error(chalk.red("Possibly unsupported terminal program."));
    }
  } else {
    execa(ttabPath, ["-d", terminalPath]);
  }
}
