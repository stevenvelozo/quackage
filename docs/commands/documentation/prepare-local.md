# prepare-local

Copy local JavaScript bundles into a documentation folder for offline use. Rewrites `index.html` to reference the local files instead of the jsDelivr CDN.

## Usage

```bash
quack prepare-local [docs_folder]
```

Aliases: `local-docs`, `stage-local`

## Arguments

| Argument | Default | Description |
|----------|---------|-------------|
| `docs_folder` | `./docs` | The documentation folder to prepare for offline use |

## Behavior

1. Resolves the docs folder path (defaults to `./docs` if not provided)
2. Locates the `pict-docuserve` binary
3. Runs `pict-docuserve prepare-local` which:
   - Copies `pict.min.js` and its source map from the pict-docuserve dist folder into a `js/` subfolder
   - Copies `pict-docuserve.min.js` and its source map into the docs folder root
   - Rewrites `index.html` to load JavaScript from local paths instead of jsDelivr CDN

## When to Use

By default, `docuserve-inject` and `prepare-docs` produce an `index.html` that loads `pict` and `pict-docuserve` from the jsDelivr CDN. This keeps the injected footprint small and ensures you always get the latest compatible version.

Use `prepare-local` when you need:

- Offline documentation browsing (no internet required)
- A fully self-contained docs folder for air-gapped environments
- Pinned JS versions that do not change between deploys

## Example

```bash
# Prepare docs normally (CDN mode)
quack prepare-docs ./docs -d ./modules

# Then copy local JS bundles for offline use
quack prepare-local ./docs

# Serve locally
quack docs-serve ./docs
```
