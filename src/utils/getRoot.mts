import chalk from "chalk";
import path from "path";
import os from "os";
import fs from "fs";
import { returnOf } from "scope-utilities";

export async function getRoot(initialSearchRoot: string = process.cwd()) {
  const systemRootPath =
    os.platform() === "win32" ? process.cwd().split(path.sep)[0] : "/";

  const root = returnOf(() => {
    let serachIn = initialSearchRoot;

    while (serachIn > systemRootPath) {
      const gitRootPath = path.join(serachIn, "./.git");
      const quickcdrcRootPath = path.join(serachIn, "./.quickcdrc.json");

      const gitFolderExists =
        fs.existsSync(gitRootPath) && fs.lstatSync(gitRootPath).isDirectory();

      const quickcdrcFileExists =
        fs.existsSync(quickcdrcRootPath) &&
        fs.lstatSync(quickcdrcRootPath).isFile();

      if (gitFolderExists || quickcdrcFileExists) {
        return serachIn;
      }

      serachIn = path.join(serachIn, "../");
    }

    return null;
  });

  if (!root) {
    console.log(
      chalk.yellow(
        `⚠️ Could not find a git repository in any parent directory up the chain; will use cwd`
      )
    );
  }

  return root ?? initialSearchRoot;
}
