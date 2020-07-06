# Satis generator

## Commands
```sh
satis-generator publish  # publish packages that have changed since the last release
satis-generator changed  # list changed packages since the last release
satis-generator zip      # build zips of released packages
```

## satis-generator.json
```json
{
  "zipsDistUrl": "https://cdn.example.com",
  "publishMessage": "chore(release): publish",
  "branch": "main",
  "satisFile": "satis.json",
  "plugins": [],
  "packages": [
    "plugins/*",
    "projects/*",
    "themes/*"
  ]
}
```

- `zipsDistUrl`: Public url to the zips.
- `publishMessage`: Message in commit.
- `branch`: Branch to do release from.
- `satisFile`: Location of your satis json file.
- `plugins`: Array of plugins to load.
- `packages`: Array of globs to use as package locations.

## satis file
The script need a satis json file to work. When initializing a new project create
a `satis.json` file and fill in the required keys.

__example json file__
```json
{
  "name": "example/packages",
  "homepage": "https://example.com",
  "description": "All my awesome packages",
  "repositories": []
}
```
