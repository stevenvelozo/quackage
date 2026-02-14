# stricture-compile

Compile Stricture DDL into a Meadow schema file.

## Usage

```bash
quack stricture-compile <output_folder> [options]
```

**Aliases:** `scomp`

## Arguments

| Argument | Description |
|----------|-------------|
| `output_folder` | The folder in which to generate the compiled schema (required) |

## Options

| Option | Default | Description |
|--------|---------|-------------|
| `-m, --markdown <folder>` | | Folder with markdown documentation; subfolders are okay |

## Status

> **Stub:** This command is currently a placeholder. It accepts arguments and options but does not yet perform compilation. The implementation will compile Stricture DDL definitions into the JSON schema format consumed by Meadow.

## Example

```bash
quack scomp ./schema
```
