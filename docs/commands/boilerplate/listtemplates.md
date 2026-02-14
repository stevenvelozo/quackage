# listtemplates

List all available boilerplate template filesets.

## Usage

```bash
quack listtemplates
```

Aliases: `list`, `ls`, `lt`

## Behavior

1. Loads the built-in template filesets from quackage
2. Merges in any project-level templates from `{CWD}/.quackage-templates.json`
3. Merges in any user-level templates from `~/.quackage-templates.json`
4. Prints each fileset name and the number of templated files it contains

## Example

```bash
quack ls
```

Output:

```
unit-test ______________________________ (2 templated files)
pict-view ______________________________ (4 templated files)
service ________________________________ (3 templated files)
```

Use the fileset name with the `boilerplate` command to generate files:

```bash
quack bp unit-test
```
