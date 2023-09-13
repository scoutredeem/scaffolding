# Scaffolding

Scripts and templates we use to enforce standards and get a running start. It uses
[dax][1] to make it easy to use. Which requires [deno][2] to be installed.

Install `deno`:

```
curl -fsSL https://deno.land/x/install/install.sh | sh
```

## Gallery

New Flutter project:

```
deno run -A https://raw.githubusercontent.com/OneSheep/scaffolding/main/flutter/init.js
```

Documentation site for project handbook:

```
svn export https://github.com/OneSheep/scaffolding.git/trunk/docs
```

Documentation folder for a single repo project:

```
svn export https://github.com/OneSheep/scaffolding.git/trunk/docs/docs
```

Prettier config for a project:

```
 curl https://raw.githubusercontent.com/OneSheep/scaffolding/main/.prettierrc > .prettierrc
```

Changelog version configuration for a project:

```
 curl https://raw.githubusercontent.com/OneSheep/scaffolding/main/.versionrc > .versionrc
```

Grab the commit lint configuration for a project:

```
 curl https://raw.githubusercontent.com/OneSheep/scaffolding/main/commitlint.config.js > commitlint.config.js
```

[1]: https://github.com/dsherret/dax
[2]: https://deno.land/
