import fs from "fs";
import { args } from "../utils/args.mjs";
import path from "path";
import { _dirname } from "../paths.mjs";

export async function runAlias() {
  const aliasScript = fs
    .readFileSync(path.join(_dirname, "./cd-alias.sh"))
    .toString("utf-8");

  console.log(
    typeof args.alias === "string"
      ? aliasScript.replace("quickcd", args.alias)
      : aliasScript
  );

  return 0;
}
