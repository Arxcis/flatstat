# Requires node version >= 14
all: 
	make apps;
	make metafiles;
	make count; 

apps:
	node cmd/apps.js --harmony-top-level-await;

count:
	node cmd/count.js --harmony-top-level-await;

metafiles:
	node cmd/metafiles.js --harmony-top-level-await;

server:
	python -m http.server

test:
	node cmd/query.test.js --harmony-top-level-await;

.PHONY: apps count metafiles server test all
