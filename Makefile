all: bundle.js

bundle.js: map.ts
	tsc *.ts --m es6
	rollup map.js > bundle.js
