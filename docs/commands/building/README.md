# Building

Commands for building, copying and testing your module. These are the core development workflow commands you'll use most frequently.

## Commands

- [build](build.md) -- Browserify and minify your module into `dist/`
- [copy-files-from-to](copy-files-from-to.md) -- Copy files to a staging location
- [run-mocha-tests](run-mocha-tests.md) -- Run Mocha tests in TDD mode

## Typical Workflow

```bash
# Run tests
quack test

# Build for distribution
quack build

# Copy static assets to staging
quack copy
```

The standard `npm run build` script added by `quack updatepackage` runs `npx quack build`. For pict applications, the typical build sequence is:

```bash
npx quack build && npx quack copy
```
