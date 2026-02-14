# Package Management

Commands for keeping your `package.json` in sync with quackage conventions. These commands ensure every module in your ecosystem has consistent test, build, coverage and Docker scripts.

## Commands

- [updatepackage](updatepackage.md) -- Add standard scripts and configuration sections
- [luxuryupdatepackage](luxuryupdatepackage.md) -- Add Docker-based luxury dev environment scripts
- [lint](lint.md) -- Audit your package.json against quackage defaults

## Overview

Quackage defines a canonical set of `package.json` sections and npm scripts. The `updatepackage` command adds any missing entries, while `lint` reports on what matches and what doesn't -- without modifying anything.

Both `updatepackage` and `luxuryupdatepackage` create a backup at `.package.json.quackage.bak` before writing changes.

### Standard Scripts

The following scripts are managed by `updatepackage`:

| Script | Command |
|--------|---------|
| `start` | `node {main}` |
| `test` | `npx mocha -u tdd -R spec` |
| `tests` | `npx mocha -u tdd --exit -R spec --grep` |
| `coverage` | `npx nyc --reporter=lcov --reporter=text-lcov npx mocha -- -u tdd -R spec` |
| `build` | `npx quack build` |
| `docs` | `npx quack prepare-docs ./docs -d ./modules` |
| `docs-serve` | `npx quack docs-serve ./docs` |

### Luxury Scripts

The following scripts are managed by `luxuryupdatepackage`:

| Script | Command |
|--------|---------|
| `docker-dev-build` | `docker build ./ -f Dockerfile_LUXURYCode -t {name}-image:local` |
| `docker-dev-run` | `docker run -it -d --name {name}-dev ...` |
| `docker-dev-shell` | `docker exec -it {name}-dev /bin/bash` |
