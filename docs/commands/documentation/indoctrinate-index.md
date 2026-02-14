# indoctrinate-index

Generate a Lunr keyword search index from module documentation using Indoctrinate.

## Usage

```bash
quack indoctrinate-index <docs_folder> [options]
```

**Aliases:** `indoc-index`, `keyword-index`

## Arguments

| Argument | Description |
|----------|-------------|
| `docs_folder` | The documentation output folder for the generated keyword index (required) |

## Options

| Option | Default | Description |
|--------|---------|-------------|
| `-d, --directory_root <path>` | CWD | Root directory to scan for modules |

## Behavior

1. Resolves the docs folder path, creating it if necessary
2. Locates the `indoctrinate` binary
3. Runs `indoctrinate generate_keyword_index` with the directory root and output file
4. Writes `retold-keyword-index.json` to the docs folder

## Output

The keyword index (`retold-keyword-index.json`) is a pre-built Lunr search index that enables client-side full-text search across all module documentation. It is consumed by the pict-docuserve web application's search feature.

## Example

```bash
# Generate keyword index from ./modules into ./docs
quack keyword-index ./docs -d ./modules
```
