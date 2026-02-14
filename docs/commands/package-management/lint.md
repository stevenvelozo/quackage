# lint

Audit your `package.json` against quackage's default configuration without modifying anything.

## Usage

```bash
quack lint
```

## Behavior

Performs a read-only comparison of your `package.json` against the quackage defaults:

1. Checks each quackage-managed section (e.g. `mocha`) for existence and value match
2. Checks each quackage-managed npm script for existence and value match
3. Reports `[OK]` or `[NOT OK]` for each item
4. For mismatched scripts, shows both the current and expected values

No files are modified. Use `updatepackage` to apply fixes.

## Example

```bash
quack lint
```

Output:

```
  --> mymodule:1.0.0/package.json SECTION { mocha:... }: [OK]
  --> mymodule:1.0.0/package.json SCRIPT { scripts.test }: [OK]
  --> mymodule:1.0.0/package.json SCRIPT { scripts.build }: [NOT OK]
    > Current Script:  [webpack --mode production]
    > Quackage Script: [npx quack build]
```
