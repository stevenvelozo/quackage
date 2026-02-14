# buildtemplates

Create template filesets from the contents of a folder. Each top-level subfolder becomes its own template fileset.

## Usage

```bash
quack buildtemplates <folder>
```

**Aliases:** `bt`

## Arguments

| Argument | Description |
|----------|-------------|
| `folder` | The folder path to scan for template content (required) |

## Behavior

1. Reads the target folder
2. Each top-level subdirectory becomes a named template fileset (the folder name is cleaned to alphanumeric characters)
3. Files within each subdirectory are read recursively and added to that fileset with their relative paths preserved
4. Top-level files (not in a subdirectory) become their own single-file filesets
5. If a `.quackage-templates.json` already exists in the working directory, the new filesets are merged into it
6. Writes the result to `.quackage-templates.json`

## Example

Given this folder structure:

```
templates/
  unit-test/
    test/test.js
    test/test-helper.js
  service/
    source/MyService.js
```

Running:

```bash
quack bt templates
```

Produces a `.quackage-templates.json` with two filesets: `unittest` and `service`, each containing the respective files with their content and relative paths.
