# Requires node version >= 14
repos:
	node src/repos.js --harmony-top-level-await;

count:
	node src/count.js --harmony-top-level-await;

metafiles:
	node src/metafiles.js --harmony-top-level-await;

server:
	python -m http.server

test:
	node src/query.test.js --harmony-top-level-await;

.PHONY: repos count metafiles server test
