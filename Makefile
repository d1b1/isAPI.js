REPORTER = spec
test:
	 @NODE_ENV=test ./node_modules/.bin/mocha -b --reporter $(REPORTER)

coverage:
	 jscoverage --no-highlight lib lib-cov
	 ISAPI_LIBRARY_COV=1 mocha test/all.js -R html-cov > coverage.html
	 rm -rf lib-cov

lib-cov:
	 jscoverage lib lib-cov

test-coveralls:	lib-cov
	 echo TRAVIS_JOB_ID $(TRAVIS_JOB_ID)
	 @ISAPI_LIBRARY_COV=1 $(MAKE) test REPORTER=mocha-lcov-reporter | ./node_modules/coveralls/bin/coveralls.js
	 rm -rf lib-cov

.PHONY: test
