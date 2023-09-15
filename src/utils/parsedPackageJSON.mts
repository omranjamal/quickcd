import fs from "fs";
import path from "path";
import { _dirname } from "../paths.mjs";

export async function loadPackageJSON() {
  return JSON.parse(
    fs.readFileSync(path.join(_dirname, "./package.json")).toString("utf-8")
  );
}
