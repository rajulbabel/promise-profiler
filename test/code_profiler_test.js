'use strict';

require('should');
const Promise = require('bluebird');
const CodeProfiler = require('../code_profiler');

describe('code profiler tests', function() {

	const getPromise1 = function getPromise1 () {

		return new Promise (function promise1Functon (resolve, reject) {

			setTimeout(function promise1Timeout () {
				resolve(1);
			}, 2000);

		});

	};

	const getPromise2 = function getPromise2 () {

		return new Promise (function promise2Functon (resolve, reject) {

			setTimeout(function promise1Timeout () {
				resolve(2);
			}, 1000);

		});

	};

	beforeEach(function beforeEachFunction () {

		CodeProfiler.startProfiling();

	});


	afterEach(function afterEachFunction () {

		CodeProfiler.stopProfiling();
		CodeProfiler.resetCodeProfilerResult();

	});

	it('test for then()', function(done) {

		getPromise1().then(function promise1Then (result) {
			result.should.equal(1);
		});

		getPromise2().then(function promise2Then (result) {
			result.should.equal(2);
		});

		setTimeout(function wait () {

			Object.keys(CodeProfiler.codeProfilerResult).length.should.equal(2);
			CodeProfiler.codeProfilerResult.should.have.property('promise1Then');
			CodeProfiler.codeProfilerResult.should.have.property('promise2Then');
			done();

		}, 3000);

	});

	it('test for .spread()', function(done) {

		Promise.join(getPromise1(), getPromise2()).spread(function spreadFunction (promise1Result, promise2Result) {

			promise1Result.should.equal(1);
			promise2Result.should.equal(2);
			Object.keys(CodeProfiler.codeProfilerResult).length.should.equal(1);
			CodeProfiler.codeProfilerResult.should.have.property('spreadFunction');
			done();

		});

	});

	it('test for .then() and .spread()', function(done) {

		const promise1 = getPromise1();
		const promise2 = getPromise2();

		promise1.then(function promise1Then (result) {
			result.should.equal(1);
		});

		promise2.then(function promise2Then (result) {
			result.should.equal(2);
		});

		Promise.join(promise1, promise2).spread(function spreadFunction (promise1Result, promise2Result) {

			promise1Result.should.equal(1);
			promise2Result.should.equal(2);
			Object.keys(CodeProfiler.codeProfilerResult).length.should.equal(3);
			CodeProfiler.codeProfilerResult.should.have.property('promise1Then');
			CodeProfiler.codeProfilerResult.should.have.property('promise2Then');
			CodeProfiler.codeProfilerResult.should.have.property('spreadFunction');
			done();

		});

	});

});
