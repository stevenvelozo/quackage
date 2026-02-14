# indoctrinate

Generate a documentation catalog from module documentation folders using the Indoctrinate tool.

## Usage

```bash
quack indoctrinate <docs_folder> [options]
```

**Aliases:** `indoc`

## Arguments

| Argument | Description |
|----------|-------------|
| `docs_folder` | The documentation output folder for the generated catalog (required) |

## Options

| Option | Default | Description |
|--------|---------|-------------|
| `-d, --directory_root <path>` | CWD | Root directory to scan for modules |
| `-b, --branch <branch>` | `master` | Git branch for GitHub raw URLs |
| `-g, --github_org <org>` | `stevenvelozo` | GitHub organization for raw URLs |

## Behavior

1. Resolves the docs folder path, creating it if necessary
2. Locates the `indoctrinate` binary
3. Runs `indoctrinate generate_catalog` with the directory root, output file, branch and GitHub org parameters
4. Writes `retold-catalog.json` to the docs folder

## Output

The catalog file (`retold-catalog.json`) contains a structured listing of all modules found under the directory root, including their documentation paths and GitHub raw content URLs. This is consumed by the pict-docuserve web application for cross-module navigation.

## Example

```bash
# Generate catalog from ./modules into ./docs
quack indoc ./docs -d ./modules

# Different branch and org
quack indoc ./docs -d ./modules -b develop -g myorg
```
