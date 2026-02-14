# Documentation

Commands for generating and serving documentation. Quackage integrates three documentation tools:

- JSDoc -- extracts API documentation from source code comments
- Indoctrinate -- scans a module tree and generates a documentation catalog with cross-module navigation and keyword search
- pict-docuserve -- provides a web application shell (based on Docsify) for browsing documentation, either as injected static assets or via a local dev server

## Commands

- [generate-documentation](generate-documentation.md) -- Generate JSDoc documentation from source
- [indoctrinate](indoctrinate.md) -- Generate a module documentation catalog
- [indoctrinate-index](indoctrinate-index.md) -- Generate a keyword search index
- [docuserve-inject](docuserve-inject.md) -- Inject pict-docuserve assets for static hosting
- [prepare-docs](prepare-docs.md) -- All-in-one documentation preparation
- [prepare-local](prepare-local.md) -- Copy local JS bundles for offline use
- [docs-serve](docs-serve.md) -- Serve documentation locally

## Quick Start

For most projects, the all-in-one `prepare-docs` command is all you need:

```bash
# Prepare documentation (catalog + search index + web assets)
quack prepare-docs ./docs -d ./modules

# Serve it locally
quack docs-serve ./docs
```

Both commands default to `./docs` if no folder argument is provided.

## Documentation Pipeline

The `prepare-docs` command runs these three steps in sequence:

1. Indoctrinate catalog -- scans the module directory tree and generates `retold-catalog.json`
2. Keyword index -- generates `retold-keyword-index.json` for search
3. Docuserve inject -- copies the pict-docuserve web application assets and writes a `.nojekyll` file for GitHub Pages

You can also run each step individually for finer control.
