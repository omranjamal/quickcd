import { loadPackageJSON } from "../utils/parsedPackageJSON.mjs";

export async function runVersion() {
  const packageJSON = await loadPackageJSON();

  console.log(packageJSON.version);
  return 0;
}
