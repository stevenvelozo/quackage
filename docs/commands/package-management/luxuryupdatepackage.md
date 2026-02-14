# luxuryupdatepackage

Add Docker-based luxury development environment scripts to your `package.json`.

## Usage

```bash
quack luxuryupdatepackage [options]
```

**Aliases:** `luxury_update_package`, `lux`

## Options

| Option | Description |
|--------|-------------|
| `-f, --force` | Force overwrite existing scripts and sections. |

## Behavior

Works identically to `updatepackage` but manages the luxury (Docker) script set instead of the standard scripts. It:

1. Reads the current `package.json`
2. Adds any missing quackage-managed sections (same as `updatepackage`)
3. Adds the Docker dev environment scripts (`docker-dev-build`, `docker-dev-run`, `docker-dev-shell`)
4. Backs up to `.package.json.quackage.bak` before writing

## Managed Scripts

| Script | Purpose |
|--------|---------|
| `docker-dev-build` | Build a Docker image from `Dockerfile_LUXURYCode` |
| `docker-dev-run` | Run the dev container with mounted volumes and random ports |
| `docker-dev-shell` | Open a bash shell in the running dev container |

## Example

```bash
# Add Docker scripts to your project
quack lux

# Force overwrite existing Docker scripts
quack lux --force
```
