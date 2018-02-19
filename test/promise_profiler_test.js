'use strict';

require('should');
const Promise = require('bluebird');
let PromiseProfiler;
const promiseProfiler = require('../src/promise_profiler');
const fs = require('fs');

describe('promise profiler tests', function() {

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

	const getPromise3 = function getPromise2 () {

		return new Promise (function promise3Functon (resolve, reject) {

			setTimeout(function promise1Timeout () {
				reject(new Error('3'));
			}, 2000);

		});

	};

	const getPromise4 = function getPromise2 () {

		return new Promise (function promise4Functon (resolve, reject) {

			setTimeout(function promise1Timeout () {
				reject(new Error('4'));
			}, 1000);

		});

	};

	before(function beforeAll () {
		PromiseProfiler = new promiseProfiler(Promise);
		PromiseProfiler.startProfiling();
	});

	after(function afterAll () {
		PromiseProfiler.stopProfiling();
	});

	afterEach(function afterEachFunction () {
		PromiseProfiler.resetProfiler();
	});

	it('for .then()', function(done) {

		getPromise1().then(function promise1Then (result) {
			result.should.equal(1);
		});

		getPromise2().then(function promise2Then (result) {
			result.should.equal(2);
		});

		setTimeout(function wait () {

			Object.keys(PromiseProfiler.getProfilerResult()).length.should.equal(2);
			PromiseProfiler.getProfilerResult().should.have.property('promise1Then');
			PromiseProfiler.getProfilerResult().should.have.property('promise2Then');
			done();

		}, 3000);

	});

	it('for .catch()', function (done) {

		getPromise3().catch(function promise3Catch (result) {
			result.message.should.equal('3');
		});

		getPromise4().catch(function promise4Catch (result) {
			result.message.should.equal('4');
		});

		setTimeout(function wait () {

			Object.keys(PromiseProfiler.getProfilerResult()).length.should.equal(2);
			PromiseProfiler.getProfilerResult().should.have.property('promise3Catch');
			PromiseProfiler.getProfilerResult().should.have.property('promise4Catch');
			done();

		}, 3000);

	});

	it('for .spread() on resolving promises', function(done) {

		Promise.join(getPromise1(), getPromise2()).spread(function spreadFunction (promise1Result, promise2Result) {

			promise1Result.should.equal(1);
			promise2Result.should.equal(2);
			Object.keys(PromiseProfiler.getProfilerResult()).length.should.equal(1);
			PromiseProfiler.getProfilerResult().should.have.property('spreadFunction');
			done();

		});

	});

	it('for .spread() on rejecting promises', function(done) {

		Promise.join(getPromise3(), getPromise4()).catch(function catchFunction (res) {
			Object.keys(PromiseProfiler.getProfilerResult()).length.should.equal(1);
			PromiseProfiler.getProfilerResult().should.have.property('catchFunction');
			done();
		});

	});

	it('for .then() and .spread() on resolving promises', function(done) {

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
			Object.keys(PromiseProfiler.getProfilerResult()).length.should.equal(3);
			PromiseProfiler.getProfilerResult().should.have.property('promise1Then');
			PromiseProfiler.getProfilerResult().should.have.property('promise2Then');
			PromiseProfiler.getProfilerResult().should.have.property('spreadFunction');
			done();

		});

	});

	it('for writing profiler results to file', function (done) {

		getPromise1().then(function promise1Then (result) {

			const fullFilePath = __dirname + '/output.json';
			const readFile = Promise.promisify(fs.readFile);
			PromiseProfiler.writeProfilerResultToFile(fullFilePath).then(function callback () {

				readFile(fullFilePath).then(function (result) {

					const output = JSON.parse(result);
					output.should.have.property('promise1Then');
					fs.unlink(fullFilePath, function callback () {
						done();
					});

				});

			});

		});

	});

});
