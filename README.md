# monotab

![monotab demo](https://github.com/omranjamal/monotab/blob/static/demo.gif?raw=true)

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

## Usage

Just write `monotab` or `mt` under any repository that contains submodules, and it should start working.

## Supported On

`monotab` uses [mklement0/ttab](https://github.com/mklement0/ttab)
under the hood to create terminal tabs. As such the following
terminals are currnently supported on Linux and MacOS.

1. Linux
    - Gnome Terminal
2. MacOS
    - Terminal
    - iTerm2