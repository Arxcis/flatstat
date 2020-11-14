# Requires node version >= 14
repos: tsc
	node src/repos.js --harmony-top-level-await;

count: tsc
	node src/count.js --harmony-top-level-await;

metadata: tsc
	node src/metadata.js --harmony-top-level-await;

tsc:
	tsc --build tsconfig.json

.PHONY: repos tsc count metadata