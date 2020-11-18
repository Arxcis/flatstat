#
# Generates 'apps.json' based on Github REST API
#
#  	makeApps(GithubREST) -> 'apps.json'
#
apps:
	node cmd/makeApps.js --harmony-top-level-await;

#
# Generates 'metafiles.json' based on 'apps.json' and the Github Graphql API
#
#  	makeMetafiles('app.json', GithubGraphQL) -> 'metafiles.json'
#
metafiles:
	node cmd/makeMetafiles.js --harmony-top-level-await;

#
# Generates 'count.json' based on 'metafiles.json'
#
#  	makeCount('metafiles.json') -> 'count.json'
#
count:
	node cmd/makeCount.js --harmony-top-level-await;

all:
	make apps;
	make metafiles;
	make count;

# Host 'index.html' at '0.0.0.0:8000'
server:
	python -m http.server

# Test things
test:
	node cmd/query.test.js --harmony-top-level-await;

.PHONY: apps count metafiles server test all
