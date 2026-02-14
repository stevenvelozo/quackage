# docs-serve

Serve a documentation folder locally using pict-docuserve.

## Usage

```bash
quack docs-serve [docs_folder] [options]
```

**Aliases:** `serve-docs`

## Arguments

| Argument | Default | Description |
|----------|---------|-------------|
| `docs_folder` | `./docs` | The documentation folder to serve |

## Options

| Option | Default | Description |
|--------|---------|-------------|
| `-p, --port <port>` | `3333` | Port to serve on |

## Behavior

1. Resolves the docs folder path (defaults to `./docs` if not provided)
2. Validates the folder exists
3. Locates the `pict-docuserve` binary
4. Runs `pict-docuserve serve` to start a local HTTP server

The server runs in the foreground until you stop it with Ctrl+C.

## Example

```bash
# Serve ./docs on the default port (3333)
quack docs-serve

# Serve on a custom port
quack serve-docs ./docs --port 8080

# Prepare and serve in one line
quack prepare-docs && quack docs-serve
```

Then open `http://localhost:3333` in your browser.

This is equivalent to the standard npm script added by `updatepackage`:

```bash
npm run docs-serve
# runs: npx quack docs-serve ./docs
```
