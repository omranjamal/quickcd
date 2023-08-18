# monotab

![monotab demo](https://github.com/omranjamal/monotab/blob/static/monotab-demo.gif?raw=true)

> A command to (really quickly) open a new terminal tab in any of the directories or submodules in your repo.

## Features

- Duplicate terminal: `Ctrl` + `Shift` + `T` but in command form.
- Open tab from anywhere under a repo: Automatically detects the repo root.
- Automatically picks up submodules and git repos.
- Include any directory (even if they aren't submodules) via glob patterns.
- Exclude any directory.
- Interactive directory picker with filtering.
- Filter as first argument for faster filtering.
- Automatically opens tab if there is only one match.

**Note:** `monotab` works best with repositories that have multiple submodules, but true monorepos are supported via `.monotabrc.json`.

See the [Configuration](#configuration) section for available
configuration options, and the example configuration on 
how to setup monorepos.

## Installation

```bash
npm install -g monotab
```

## Usage

### Basics

Just write `monotab` or `mtab` under any repository that contains submodules, and it should start working.

```bash
# this starts an interactive directory selector
monotab

# this one too, use them interchangably
mt
```

### Tab Duplication

```bash
# this is just using the filter and relying on the
# assumption that this will only have one listing.

mt .
```

Alternatively. Launch `mt` press `.` and then press `Enter`

Alternatively to the alternative: Launch `mt` and then press `Enter`

### Filter The List

Launch `mt` then start typing.

Alternatively, pass in a second argument to pre-filter
the list.

```bash
# this will only show a list where the items all
# have "end" in them.

mt end
```

## Configuration

You may create a `.monotabrc.json` file the root
directory of your repository and `monotab` will automatically
load it. This is especially useful for monorepos where
the subdirectiories are not necessarily git submodules.

The file should be a json file in the following format.

```typescript
interface MonotabConfigFileInterface {
    include: string | string[];
    exclude: string | string[];
}
```

Both `include` and `exclude` can be a string or an array of strings
that are glob patterns. Monotab uses [sindresorhus/globby](https://github.com/sindresorhus/globby) under the hood to support this.

### Example Monorepo Configuration

`.monotabrc.json`

```json
{
    "include": [
        "packages/*",
        "infra/*"
    ],
    "exclude": [
        "**/node_modules/**"
    ]
}
```

## Behaviour
### Repo Root Detection

`monotab` travels up the chain of directories from current working directory
and looks for the `.git` directory or the `monotabrc.json` file. If there are multiple
along the parent directory chain, the directory that matches at the highest level
is used.

### Filter

Filter tries to match it with the entire path, but does not support matching brackets
of any kind.

### Singluar Match

If there is only a single match, `monotab` automatically creates a tab in that
single matched path.

## Supported On

`monotab` uses [mklement0/ttab](https://github.com/mklement0/ttab)
under the hood to create terminal tabs. As such the following
terminals are currnently supported on Linux and MacOS.

1. Linux
    - Gnome Terminal
2. MacOS
    - Terminal _(not tested)_
    - iTerm2 _(not tested)_

## Features In Progress

- [ ] Windows Terminal Support
- [ ] Directory Labels

## Known Issues

[enquirer/enquirer](https://github.com/enquirer/enquirer) has a
hard time handling brackets as input.

## License

CC0-1.0 (public domain)