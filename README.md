![npm](https://img.shields.io/npm/v/quickcd)
![NPM](https://img.shields.io/npm/l/quickcd)
![GitHub issues](https://img.shields.io/github/issues/omranjamal/quickcd)
![npm bundle size](https://img.shields.io/bundlephobia/min/quickcd)
![npm](https://img.shields.io/npm/dw/quickcd)
![GitHub forks](https://img.shields.io/github/forks/omranjamal/quickcd)
![GitHub Repo stars](https://img.shields.io/github/stars/omranjamal/quickcd)

# quickcd

A quick command to interactively filter and select a directory to cd into inside a
repo (or any folder with a `.quickcdrc.json` file).

![quickcd demo](https://github.com/omranjamal/quickcd/blob/static/monotab-demo.gif?raw=true)

> Note: `quickcd` was previously called `monotab`, feel free to replace `monotab` with `quickcd` in the
> demo above as the cli subcommands and behaviours are unchanged.

## Features

- Quickly `cd` into any subproject directory inside a (mono)repo.
- Interactive directory picker with filtering.
- Filter as first argument for faster filtering.
- Automatic repo root detection (allow you to run `quickcd` from any nested directory inside monorepo)
- Automatically duplicate tab and `cd` for:

  - Gnome Terminal (Linux)
  - Konsole (Linux)
  - Terminal (MacOS)

- Automatically picks up submodules and nested git repos.
- Automatically picks up [npm workspaces](https://docs.npmjs.com/cli/v7/using-npm/workspaces/), [yarn workspaces](https://classic.yarnpkg.com/lang/en/docs/workspaces/) and [pnpm workspaces](https://pnpm.io/pnpm-workspace_yaml).
- Include any directory (even if they aren't submodules) via glob patterns.
- Exclude any directory.
- Automatically `cd`s if there is only one match.

**Note:** `quickcd` works best with:

1. monorepos that utilize npm/yarn/pnpm workspaces
2. repositories with git submodules

## Installation

```bash
npm install -g quickcd

# or with pnpm
pnpm add -g quickcd
```

Install bash/zsh aliases.

```bash
quickcd --setup --alias=quickcd,qcd
```

## Supported On

`quickcd` uses [mklement0/ttab](https://github.com/mklement0/ttab)
under the hood to create terminal tabs. As such the following
terminals are currnently supported on Linux and MacOS.

1. Linux
   - Gnome Terminal
   - Konsole
2. MacOS
   - Terminal _(not tested)_
   - iTerm2 _(not tested)_

## Roadmap

- [ ] Windows Terminal Support
- [ ] Directory Labels

## Known Issues

[enquirer/enquirer](https://github.com/enquirer/enquirer) has a
hard time handling brackets as input.

## License

CC0-1.0 (public domain)
