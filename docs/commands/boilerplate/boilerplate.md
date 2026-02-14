# boilerplate

Generate files from a named template fileset.

## Usage

```bash
quack boilerplate <fileset> [options]
```

Aliases: `boil`, `bp`

## Arguments

| Argument | Description |
|----------|-------------|
| `fileset` | The name of the template fileset to generate (required) |

## Options

| Option | Default | Description |
|--------|---------|-------------|
| `-s, --scope <scope>` | `Default` | A scope identifier passed into templates as a variable |
| `-f, --force` | | Force overwrite existing files |

## Behavior

1. Loads template filesets from all three sources (built-in, project `.quackage-templates.json`, home `~/.quackage-templates.json`) and merges them
2. Looks up the requested fileset by name
3. For each file in the fileset:
   - Resolves the file path through the Pict template engine (paths can contain template expressions)
   - Creates any necessary parent directories
   - If the file already exists and `--force` is not set: warns and suggests backup/delete commands
   - If the file does not exist (or `--force` is set): renders the content through the template engine and writes it
4. Templates have access to the scope, package.json data, and quackage configuration

## Template Variables

Templates can reference:

- `{~Data:Scope~}` -- the `--scope` value
- `{~Data:FileSetName~}` -- the fileset key
- Package.json data through `AppData.Package`
- `QUACKAGEPROJECTNAMECAP` -- the capitalized project name
- `QUACKAGESCOPE` -- the scope value (in file paths)

## Example

```bash
# Generate a unit test boilerplate scoped to "User"
quack boilerplate unit-test --scope User

# Overwrite existing files
quack bp unit-test --scope User --force
```
