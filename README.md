Hosted at https://arxcis.github.io/flatstat/


## How to generate the stats
```
GITHUB_PERSONAL_ACCESS_TOKEN=<token> make all
```

## Folder structure

```
# Run commands
Makefile

# Commands that generate data
cmd/
    make-apps.js
    make-changelog.js
    make-count.js
    make-metafiles.js

# Data-folder contains generated data
data/
    apps.json
    changelog.json
    count.json
    metafiles.json

# Shared javascript files
lib/

# HTML Pages
about/index.html
library/index.html
graphs/index.html
index.html
```
