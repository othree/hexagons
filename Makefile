all: hexmap.js example

map.js: map.ts
	tsc *.ts --m es6

hexmap.js: map.js
	rollup map.js > hexmap.js

example:
	cd test && $(MAKE)
