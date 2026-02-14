# generate-documentation

Generate JSDoc documentation from source files.

## Usage

```bash
quack generate-documentation <output_folder> [options]
```

**Aliases:** `dgen`

## Arguments

| Argument | Description |
|----------|-------------|
| `output_folder` | The folder in which to generate documentation output (required) |

## Options

| Option | Default | Description |
|--------|---------|-------------|
| `-m, --markdown <folder>` | | Folder with markdown documentation; subfolders are okay |
| `-s, --source <folder>` | | Folder with JavaScript source to parse JSDoc from |
| `-c, --config <file>` | | Path to a JSDoc config file |

## Behavior

1. Resolves the output folder path, creating it if necessary
2. If `--source` is provided, runs JSDoc with the `-X` flag to produce raw JSON output
3. JSDoc is resolved from your project's `node_modules` first; falls back to `npx jsdoc` if not found locally
4. Writes the raw JSDoc JSON to `JSDocOutput.json` in the output folder
5. Supports a 60-second timeout for JSDoc execution

## Output

The primary output is `JSDocOutput.json` -- the raw JSON doclet array produced by `jsdoc -X`. This can be consumed by other tools for further processing.

## Example

```bash
# Generate docs from source/ into docs/api/
quack dgen ./docs/api --source ./source

# With a custom JSDoc config
quack dgen ./docs/api --source ./source --config ./jsdoc.conf.json
```
