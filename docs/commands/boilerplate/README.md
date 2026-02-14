# Boilerplate

Commands for generating and managing file templates. Quackage uses a JSON-based template system that lets you scaffold common file structures from reusable filesets.

## Commands

- [boilerplate](boilerplate.md) -- Generate files from a template fileset
- [listtemplates](listtemplates.md) -- Show available template filesets
- [buildtemplates](buildtemplates.md) -- Create template filesets from a folder

## Overview

Template filesets are stored in `.quackage-templates.json` files. Quackage merges templates from three sources (in order):

1. Built-in -- shipped with the quackage package
2. Project -- `.quackage-templates.json` in your current working directory
3. Home -- `~/.quackage-templates.json` in your home directory

Later sources override earlier ones, so you can customize built-in templates at the project or user level.

## Template File Format

A `.quackage-templates.json` file is a JSON object where each key is a fileset name:

```json
{
  "my-fileset": {
    "Hash": "MyFileset",
    "Name": "My Fileset",
    "Description": "Creates a standard module scaffold.",
    "Files": [
      {
        "Hash": "IndexJs",
        "Path": "source/index.js",
        "Content": "module.exports = {};\n"
      }
    ],
    "Templates": {
      "CustomHelper": "some reusable template content"
    }
  }
}
```

File paths and content support the Pict template engine, so you can use expressions like `{~Data:Scope~}` to inject the scope name or other context.
