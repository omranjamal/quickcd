import chalk from "chalk";

export async function validateArguments(args: string[]) {
  const namedArgsSet = new Set<string>(args);

  namedArgsSet.delete("_");
  namedArgsSet.delete("$0");

  namedArgsSet.delete("v");
  namedArgsSet.delete("version");
  namedArgsSet.delete("h");
  namedArgsSet.delete("help");
  namedArgsSet.delete("alias");

  namedArgsSet.delete("pathToStderr");
  namedArgsSet.delete("path-to-stderr");

  namedArgsSet.delete("tab");
  namedArgsSet.delete("t");

  namedArgsSet.delete("noTab");
  namedArgsSet.delete("no-tab");

  namedArgsSet.delete("fromAlias");
  namedArgsSet.delete("from-alias");

  if (namedArgsSet.has("setup")) {
    namedArgsSet.delete("efficient");
  }

  namedArgsSet.delete("setup");

  if (namedArgsSet.size > 0) {
    const arg = [...namedArgsSet][0];

    return {
      success: false,
      unknown: arg,
    };
  }

  return {
    success: true,
  };
}
