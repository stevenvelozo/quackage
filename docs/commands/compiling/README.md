# Compiling

Commands for compiling schema definitions and assembling view configurations. These commands transform source artifacts into JSON structures consumed by the Meadow ORM and Pict view system.

## Commands

- [stricture-compile](stricture-compile.md) -- Compile Stricture DDL into a Meadow schema
- [stricture-legaacy](stricture-legaacy.md) -- Run a legacy Stricture command
- [assemble_json_views](assemble_json_views.md) -- Assemble Pict JSON view configurations from HTML/template files

## Overview

### Stricture

Stricture is the schema definition language for Meadow (the Retold ORM layer). The `stricture-compile` and `stricture-legaacy` commands provide quackage integration points for compiling Stricture DDL files into the JSON schema format Meadow expects.

> **Note:** Both Stricture commands are currently placeholder stubs awaiting full implementation. They accept arguments and options but do not yet perform compilation.

### Pict View Assembly

The `assemble_json_views` command scans a folder of HTML or template files and generates the JSON view configuration objects that the Pict view system expects. This eliminates the need to hand-write view JSON for simple template-based views.
