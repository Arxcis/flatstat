# Requires node version >= 14
repos:
	node cmd/repos.js --harmony-top-level-await;

count:
	node cmd/count.js --harmony-top-level-await;

metafiles:
	node cmd/metafiles.js --harmony-top-level-await;

server:
	python -m http.server

test:
	node cmd/query.test.js --harmony-top-level-await;

.PHONY: repos count metafiles server test
