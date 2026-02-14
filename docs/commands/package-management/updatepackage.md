# updatepackage

Add standard test, build, coverage and documentation scripts to your `package.json`.

## Usage

```bash
quack updatepackage [options]
```

Aliases: `update_package`

## Options

| Option | Description |
|--------|-------------|
| `-f, --force` | Force overwrite existing scripts and sections. Use at your own quacking peril. |

## Behavior

1. Reads the current `package.json` from the working directory
2. Compares each quackage-managed section (e.g. `mocha`) against the canonical defaults
3. Compares each quackage-managed npm script against the canonical scripts
4. Without `--force`: only adds sections and scripts that are missing; existing values are reported but not overwritten
5. With `--force`: overwrites all managed sections and scripts regardless of current values
6. Backs up the original `package.json` to `.package.json.quackage.bak`
7. Writes the updated `package.json`

## Managed Sections

- `mocha` -- Mocha test runner configuration (TDD UI, spec reporter, 5s timeout)

## Managed Scripts

- `start`, `test`, `tests`, `coverage`, `build`, `docs`, `docs-serve`

## Example

```bash
# See what would change (use lint first)
quack lint

# Add missing scripts
quack updatepackage

# Overwrite everything to match quackage defaults
quack updatepackage --force
```
