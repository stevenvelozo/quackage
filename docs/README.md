# Quackage

> Building. Testing. Quacking. Reloading.

Quackage is a CLI toolkit for managing, building, testing and documenting JavaScript/Node.js modules. It wraps common tools (Gulp, Mocha, Babel, Browserify, JSDoc, Indoctrinate, pict-docuserve) behind a consistent command interface and manages `package.json` configuration so every module in your ecosystem follows the same conventions.

## Installation

```bash
npm install quackage
```

Or install globally:

```bash
npm install -g quackage
```

## Usage

Quackage provides two equivalent CLI entry points:

```bash
quack <command> [options]
qua <command> [options]
```

Run `quack --help` to see all available commands, or `quack <command> --help` for details on a specific command.

## Command Reference

Commands are organized into five categories:

### [Package Management](commands/package-management/README.md)

Commands for keeping your `package.json` in sync with quackage conventions.

| Command | Aliases | Description |
|---------|---------|-------------|
| `updatepackage` | `update_package` | Add standard test, build and coverage scripts |
| `luxuryupdatepackage` | `luxury_update_package`, `lux` | Add Docker-based luxury dev environment scripts |
| `lint` | | Audit your package.json against quackage defaults |

### [Boilerplate](commands/boilerplate/README.md)

Commands for generating and managing file templates.

| Command | Aliases | Description |
|---------|---------|-------------|
| `boilerplate` | `boil`, `bp` | Generate files from a template fileset |
| `listtemplates` | `list`, `ls`, `lt` | Show available template filesets |
| `buildtemplates` | `bt` | Create template filesets from a folder |

### [Compiling](commands/compiling/README.md)

Commands for compiling schemas and assembling view configurations.

| Command | Aliases | Description |
|---------|---------|-------------|
| `stricture-compile` | `scomp` | Compile Stricture DDL into a Meadow schema |
| `stricture-legaacy` | `str` | Run a legacy Stricture command |
| `assemble_json_views` | `ajv` | Assemble Pict JSON view configurations from HTML |

### [Building](commands/building/README.md)

Commands for building, copying and testing your module.

| Command | Aliases | Description |
|---------|---------|-------------|
| `build` | | Browserify and minify your module into `dist/` |
| `copy-files-from-to` | `copy`, `cp` | Copy files to a staging location |
| `run-mocha-tests` | `test` | Run Mocha tests in TDD mode |

### [Documentation](commands/documentation/README.md)

Commands for generating and serving documentation.

| Command | Aliases | Description |
|---------|---------|-------------|
| `generate-documentation` | `dgen` | Generate JSDoc documentation from source |
| `indoctrinate` | `indoc` | Generate a module documentation catalog |
| `indoctrinate-index` | `indoc-index`, `keyword-index` | Generate a keyword search index |
| `docuserve-inject` | `docuserve`, `inject-docs` | Inject pict-docuserve assets for static hosting |
| `prepare-docs` | `docs`, `prep-docs` | All-in-one documentation preparation |
| `docs-serve` | `serve-docs` | Serve documentation locally |

## Configuration

Quackage looks for a `.quackage.json` file in your project root for custom configuration. If none is found it uses sensible defaults defined in `Default-Quackage-Configuration.json`.

Key configuration sections:

- **GulpExecutions** -- Build targets (default and compatible)
- **GulpfileConfiguration** -- Entry point, output folder, file naming
- **DefaultBabelRC** -- Babel preset and source map settings
- **PackageScripts** -- Standard npm scripts quackage manages
- **LuxuryPackageScripts** -- Docker dev environment scripts
- **WatchSettings** -- Folders and commands for file watching

## Executable Resolution

Quackage resolves tool binaries (gulp, mocha, indoctrinate, pict-docuserve, copy-files-from-to) by searching three locations in order:

1. `{CWD}/node_modules/.bin/` -- your project's local install
2. `{quackage}/../.bin/` -- relative to the quackage package
3. `{quackage}/node_modules/.bin/` -- quackage's own dependencies

This means quackage works whether installed locally, globally or from a monorepo root.
