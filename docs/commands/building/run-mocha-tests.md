# run-mocha-tests

Run Mocha tests in TDD mode with the spec reporter.

## Usage

```bash
quack run-mocha-tests [options]
```

**Aliases:** `test`

## Options

| Option | Description |
|--------|-------------|
| `-g, --grep <expression>` | A grep search expression to filter which tests run |

## Behavior

1. Locates the Mocha binary using the standard executable resolution order (CWD, quackage package, git repo)
2. Runs Mocha with:
   - `-u tdd` -- TDD interface (suite/test)
   - `-R spec` -- spec reporter
   - `--exit` -- (only when using `--grep`) force exit after tests complete
3. If `--grep` is provided, only tests matching the expression are executed

## Example

```bash
# Run all tests
quack test

# Run only tests matching "User"
quack test --grep User
```

This is equivalent to the standard npm script added by `updatepackage`:

```bash
npm test
# runs: npx mocha -u tdd -R spec
```
