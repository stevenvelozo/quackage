# docuserve-inject

Inject pict-docuserve web application assets into a documentation folder for static hosting.

## Usage

```bash
quack docuserve-inject <docs_folder>
```

**Aliases:** `docuserve`, `inject-docs`

## Arguments

| Argument | Description |
|----------|-------------|
| `docs_folder` | Target documentation folder to inject assets into (required) |

## Behavior

1. Resolves the docs folder path, creating it if necessary
2. Locates the `pict-docuserve` binary
3. Runs `pict-docuserve inject` to copy the web application assets (HTML, JavaScript, CSS) into the target folder
4. Writes an empty `.nojekyll` file for GitHub Pages compatibility (prevents Jekyll processing)

## What Gets Injected

The pict-docuserve inject command copies the Docsify-based documentation viewer into your docs folder. This includes:

- `index.html` -- the main documentation shell
- JavaScript and CSS assets for the viewer
- Plugin and theme files

After injection, the folder can be served as a static site (e.g. via GitHub Pages) or locally with `docs-serve`.

## Example

```bash
# Inject into ./docs
quack inject-docs ./docs

# Then serve locally to preview
quack docs-serve ./docs
```
