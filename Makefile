help:
	sh ./cmd/help.sh

all:
	make install;
	make apps;
	make metafiles;
	make count;
	make changelog;

# make-apps.js - Generates 'apps.json' based on Github REST API
apps:
	node cmd/make-apps.js --harmony-top-level-await;

# make-metafiles.js - Generates 'metafiles.json' based on 'apps.json' and the Github Graphql API
metafiles:
	node cmd/make-metafiles.js --harmony-top-level-await;

# make-count.js - Generates 'count.json' based on 'metafiles.json'
count:
	node cmd/make-count.js --harmony-top-level-await;

# make-changelog.js - Generates 'changelog.json' based on 'metafiles.json'
changelog:
	node cmd/make-changelog.js --harmony-top-level-await;

install:
	npm i;

# Host 'index.html' at '0.0.0.0:8000'
server:
	python3 -m http.server

# Test things
test:
	node cmd/query.test.js --harmony-top-level-await;

.PHONY: apps count metafiles server test all changelog install
