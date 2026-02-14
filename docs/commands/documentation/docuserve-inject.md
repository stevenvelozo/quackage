# docuserve-inject

Inject pict-docuserve web application assets into a documentation folder for static hosting.

## Usage

```bash
quack docuserve-inject <docs_folder>
```

Aliases: `docuserve`, `inject-docs`

## Arguments

| Argument | Description |
|----------|-------------|
| `docs_folder` | Target documentation folder to inject assets into (required) |

## Behavior

1. Resolves the docs folder path, creating it if necessary
2. Locates the `pict-docuserve` binary
3. Runs `pict-docuserve inject` to copy the web application shell into the target folder
4. Writes an empty `.nojekyll` file for GitHub Pages compatibility (prevents Jekyll processing)

## What Gets Injected

The inject command copies a lightweight set of files into your docs folder:

- `index.html` -- the documentation shell (loads JS dependencies from jsDelivr CDN)
- `css/` -- stylesheet assets for the viewer
- `.nojekyll` -- prevents GitHub Pages from processing files with Jekyll

JavaScript dependencies (`pict` and `pict-docuserve`) are loaded from the jsDelivr CDN by default, keeping the injected footprint small. For offline or local development, use `prepare-local` to copy local JS bundles instead.

After injection, the folder can be served as a static site (e.g. via GitHub Pages) or locally with `docs-serve`.

## Example

```bash
# Inject into ./docs
quack inject-docs ./docs

# Then serve locally to preview
quack docs-serve ./docs
```
