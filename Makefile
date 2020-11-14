# Requires node version >= 14
repos:
	node src/repos.js --harmony-top-level-await;

count:
	node src/count.js --harmony-top-level-await;

metadata:
	node src/metadata.js --harmony-top-level-await;

.PHONY: repos count metadata