# assemble_json_views

Assemble Pict JSON view configurations from a folder of HTML or template files.

## Usage

```bash
quack assemble_json_views <folder> [options]
```

**Aliases:** `ajv`

## Arguments

| Argument | Description |
|----------|-------------|
| `folder` | The folder path to scan for view template files (required) |

## Options

| Option | Default | Description |
|--------|---------|-------------|
| `-p, --prefix <prefix>` | `Default` | A prefix for the generated view set identifiers |

## Behavior

1. Resolves the folder path relative to the current working directory
2. Recursively scans all files in the folder (and subfolders)
3. For each file, generates a Pict view JSON object containing:
   - `ViewIdentifier` -- `{Prefix}-{CleanFileName}-View`
   - `DefaultRenderable` -- `{Prefix}-{CleanFileName}-Renderable`
   - `DefaultDestinationAddress` -- `#{Prefix}-Content-Container`
   - `Templates` -- array with one entry containing the file content as the template
   - `Renderables` -- array linking the renderable hash to the template hash
   - `AutoRender` -- set to `false`
4. Writes the complete view set to `{Prefix}-View-Templates.json` in the working directory

## Output Format

Each generated view follows this structure:

```json
{
  "Prefix-FileName-View": {
    "ViewIdentifier": "Prefix-FileName-View",
    "DefaultRenderable": "Prefix-FileName-Renderable",
    "DefaultDestinationAddress": "#Prefix-Content-Container",
    "AutoRender": false,
    "Templates": [
      {
        "Hash": "Prefix-FileName-Content-Template",
        "Template": "...file contents..."
      }
    ],
    "Renderables": [
      {
        "RenderableHash": "Prefix-FileName-Renderable",
        "TemplateHash": "Prefix-FileName-Content-Template"
      }
    ]
  }
}
```

## Example

```bash
# Scan ./views and generate Default-View-Templates.json
quack ajv ./views

# Use a custom prefix
quack ajv ./views --prefix MyApp
# Produces MyApp-View-Templates.json
```
