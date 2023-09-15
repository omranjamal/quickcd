import fs from "fs";
import { args } from "../utils/args.mjs";
import path from "path";
import { _dirname } from "../paths.mjs";

export function embedAliases(
  aliasScript: string,
  alias: unknown,
  isEfficient?: boolean
) {
  const aliasSet = new Set(
    (typeof args.alias === "string" ? args.alias : "quickcd")
      .split(",")
      .map((alias) => (alias.trim() ? alias.trim() : null))
      .filter((alias): alias is string => !!alias)
  );

  aliasSet.delete("quickcd");

  const aliases = [...aliasSet];

  const aliasedScript = isEfficient
    ? aliasScript.replace(
        "# -- quickcd-shell-aliases --",
        aliases.map((alias) => `alias ${alias}="quickcd"`).join("\n") + "\n"
      )
    : aliasScript.replace(
        "--quickcd-aliases--",
        ["quickcd", ...aliases].join(",")
      );

  return aliasedScript;
}

export async function runAlias() {
  const aliasScript = fs
    .readFileSync(path.join(_dirname, "./cd-alias.sh"))
    .toString("utf-8");

  const embeddedAliases = embedAliases(aliasScript, args.alias, true);
  console.log(embeddedAliases);

  return 0;
}
