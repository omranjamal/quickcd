import yargs from "yargs";
import { hideBin } from "yargs/helpers";

export const args = await yargs(hideBin(process.argv)).help(false).argv;
