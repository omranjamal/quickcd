![npm](https://img.shields.io/npm/v/quickcd)
![NPM](https://img.shields.io/npm/l/quickcd)
![GitHub issues](https://img.shields.io/github/issues/omranjamal/quickcd)
![npm bundle size](https://img.shields.io/bundlephobia/min/quickcd)
![npm](https://img.shields.io/npm/dw/quickcd)
![GitHub forks](https://img.shields.io/github/forks/omranjamal/quickcd)
![GitHub Repo stars](https://img.shields.io/github/stars/omranjamal/quickcd)

# quickcd

A command to (really quickly) open a new terminal tab in any of the directories or submodules in your repo.

![quickcd demo](https://github.com/omranjamal/quickcd/blob/static/monotab-demo.gif?raw=true)

> Note: `quickcd` was previously called `monotab`, feel free to replace `monotab` with `quickcd` in the
> demo above as the cli subcommands and behaviours are unchanged.

## Features

- Duplicate terminal: `Ctrl` + `Shift` + `T` but in command form.
- Open tab from anywhere under a repo: Automatically detects the repo root.
- Support for `cd`-ing in current terminal (useful over ssh, or in IDE integrated terminal)
- Automatically picks up submodules and git repos.
- Automatically picks up [npm workspaces](https://docs.npmjs.com/cli/v7/using-npm/workspaces/), [yarn workspaces](https://classic.yarnpkg.com/lang/en/docs/workspaces/) and [pnpm workspaces](https://pnpm.io/pnpm-workspace_yaml).
- Include any directory (even if they aren't submodules) via glob patterns.
- Exclude any directory.
- Interactive directory picker with filtering.
- Filter as first argument for faster filtering.
- Automatically opens tab if there is only one match.

**Note:** `quickcd` works best with repositories that have multiple submodules, but true monorepos are supported via `.quickcdrc.json` or package manage workspace definitions.

See the [Configuration](#configuration) section for available
configuration options, and the example configuration on
how to setup monorepos.

## Installation

```bash
npm install -g quickcd
```

## Usage

### Basics

Just write `quickcd` or `qcd` under any repository that contains submodules, and it should start working.

```bash
# this starts an interactive directory selector
quickcd

# this one too, use them interchangably
qcd
```

### Tab Duplication

```bash
# this is just using the filter and relying on the
# assumption that this will only have one listing.

qcd .
```

Alternatively. Launch `qcd` press `.` and then press `Enter`

Alternatively to the alternative: Launch `qcd` and then press `Enter`

### Filter The List

Launch `qcd` then start typing.

Alternatively, pass in a second argument to pre-filter
the list.

```bash
# this will only show a list where the items all
# have "end" in them.

qcd end
```

## Configuration

You may create a `.quickcdrc.json` file the root
directory of your repository and `quickcd` will automatically
load it. This is especially useful for monorepos where
the subdirectiories are not necessarily git submodules.

The file should be a json file in the following format.

```typescript
interface quickcdConfigFileInterface {
  include: string | string[];
  exclude: string | string[];
}
```

Both `include` and `exclude` can be a string or an array of strings
that are glob patterns. quickcd uses [sindresorhus/globby](https://github.com/sindresorhus/globby) under the hood to support this.

### Example Monorepo Configuration

`.quickcdrc.json`

```json
{
  "include": ["packages/*", "infra/*"],
  "exclude": ["**/node_modules/**"]
}
```

## Setup `cd` In Current Terminal

If you don't want to open a new terminal tab, or if you are using a terminal over SSH or if you're using your IDE's integrated terminal
(like on WebStorm or VSCode), `cd`-ing is your best friend.

To this you will need to add an alias to your `.bashrc` or `.zshrc`

```bash
# Assuming you use bash

printf "\n# quickcd\neval \$(quick-change-directory --alias)\n" >> ~/.bashrc
```

Now you can use `quickcd` to get the familiar interactive CLI,
but instead of opening a new terminal tab, it will cd you
to the directory.

### Customizing the Alias

Just pass in a value to `--alias`

```bash
printf "\n# quickcd\neval \$(quick-change-directory --alias qcd)\n" >> ~/.bashrc
```

Open running this, your alias will be `qcd` instead of `quickcd`.

### Alias Performance

> ...but node.js' startup time is far too slow
> it's making my terminal slow.

We hear you, I hate slow terminal startups too.
Just go into your `.bashrc` or `.zshrc` and paste the following at the end.

```bash
function quickcd {
  if [[ "$@" == *"--tab"* ]]
  then
    quick-change-directory "$@";
  else
    DIR_PATH=$(quick-change-directory "$@" --path-to-stderr --no-tab 3>&1 1>&2 2>&3);

    if [[ ! -z "$DIR_PATH" ]]
    then
      cd "$DIR_PATH"
    fi
  fi
}

alias qcd="quickcd"
```

Replaced `quickcd`, and `qcd` with anything else if you want the command to be called anything other than `quickcd` and `qcd`.

## Behaviour

### Repo Root Detection

`quickcd` travels up the chain of directories from current working directory
and looks for the `.git` directory or the `quickcdrc.json` file. If there are multiple
along the parent directory chain, the directory that matches at the highest level
is used.

### Filter

Filter tries to match it with the entire path, but does not support matching brackets
of any kind.

### Singluar Match

If there is only a single match, `quickcd` automatically creates a tab in that
single matched path.

## Supported On

`quickcd` uses [mklement0/ttab](https://github.com/mklement0/ttab)
under the hood to create terminal tabs. As such the following
terminals are currnently supported on Linux and MacOS.

1. Linux
   - Gnome Terminal
2. MacOS
   - Terminal _(not tested)_
   - iTerm2 _(not tested)_

## Roadmap

- [x] `cd` assistance in current terminal
- [ ] Windows Terminal Support
- [ ] Directory Labels

## Known Issues

[enquirer/enquirer](https://github.com/enquirer/enquirer) has a
hard time handling brackets as input.

## License

CC0-1.0 (public domain)
