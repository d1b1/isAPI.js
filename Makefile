test:
	 npm test

coverage:
	 jscoverage --no-highlight lib lib-cov
	 ISAPI_LIBRARY_COV=1 mocha test/all.js -R html-cov > coverage.html
	 rm -rf lib-cov

.PHONY: test
