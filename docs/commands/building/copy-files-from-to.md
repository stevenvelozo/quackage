# copy-files-from-to

Copy files to a staging location using the `copy-files-from-to` utility.

## Usage

```bash
quack copy-files-from-to
```

Aliases: `copy`, `cp`

## Behavior

Executes the `copy-files-from-to` npm package, which reads its own configuration from `copyFiles.json` or `copyFilesSettings` in your `package.json`. Quackage simply locates and runs the binary -- the copy rules themselves are defined in your project.

See the [copy-files-from-to documentation](https://github.com/nicedreams/copy-files-from-to) for configuration details.

## Common Use

This command is typically run after `build` to copy static assets (HTML, CSS, images) alongside the compiled JavaScript:

```bash
quack build && quack copy
```

The `WatchSettings` in the quackage default configuration monitors `./html`, `./css` and `./assets` folders and runs `npx quack copy` when files change.

## Example

```bash
# Copy files according to your copyFiles configuration
quack cp
```
