/* global describe */
'use strict';

const should = require('should');
const BluebirdPromise = require('bluebird');
const fs = require('fs');
const mock = require('mock-require');


describe('Promise Profiler', function() {

	const testPaths = {
		src: "../src/",
		build: "../build/"
	};

	describe('tests for src', function() {
		profilerTests(testPaths.src);
	});

	describe('tests for build', function() {
		profilerTests(testPaths.build);
	});

	describe('publish test', function () {

		it('should publish and run correctly', function (done) {

			const exec = require('child_process').exec;

			exec('npm run-script examples', function (error, stdout, stderr) {

				stdout.should.not.equal('');
				stderr.should.equal('');
				should.not.exist(error);

				// extract JSON contents
				stdout = stdout.substring(stdout.indexOf('{'), stdout.lastIndexOf('}') + 1).split('\n').join('');
				// make proper JSON array
				stdout = '[' + stdout.replace(/ /g,'').split('{').join('{"').split(':').join('":').split(',').join(',"').split('}{').join('},{') + ']';

				const result = JSON.parse(stdout);

				result.length.should.equal(4);

				Object.keys(result[0]).length.should.equal(1);
				result[0].should.have.property('result');
				result[0].result.should.equal(25);

				Object.keys(result[1]).length.should.equal(2);
				result[1].should.have.property('multiplyPromise');
				result[1].should.have.property('squarePromise');
				result[1]['multiplyPromise'].should.be.greaterThan(999);
				result[1]['squarePromise'].should.be.greaterThan(1999);

				Object.keys(result[2]).length.should.equal(2);
				result[2].should.have.property('multiplyResult');
				result[2].should.have.property('squareResult');
				result[2].multiplyResult.should.equal(20);
				result[2].squareResult.should.equal(16);

				Object.keys(result[3]).length.should.equal(2);
				result[3].should.have.property('multiplyPromise');
				result[3].should.have.property('spreadFunction');
				result[3]['multiplyPromise'].should.be.greaterThan(999);
				result[3]['spreadFunction'].should.be.greaterThan(1999);

				fs.readdir('./examples/node_modules/bluebird-promise-profiler', function(err, items) {

					should.not.exist(err);
					items.length.should.equal(4);
					items.should.containDeep(['LICENSE', 'README.md', 'package.json', 'build']);
					done();
				});

			});

		});

	});

});


function profilerTests (testPath) {

	const ErrorLib = require(testPath + 'ErrorLib');

	describe('Stub test', function () {

		const stubber = require(testPath + 'stubber');

		const obj = {
			add: function (a, b) {
				return a + b;
			}
		};

		function multiply (a, b) {
			return a * b;
		}

		let addStub;
		beforeEach(function beforeEach () {
			addStub = stubber.stub(obj, 'add', multiply);
		});

		afterEach(function afterEach () {
			addStub.restore();
		});

		after(function afterAll () {
		});

		it('stubs correctly', function (done) {

			const result = obj.add(5, 2);
			result.should.equal(10);
			done();
		});

		it('restores correctly', function (done) {
			addStub.restore();
			const result = obj.add(5, 2);
			result.should.equal(7);
			done();
		});

		it('throws error for double stubbing the same object[methodName]', function (done) {
			try {
				const secondAddStub = stubber.stub(obj, 'add', multiply);
			}
			catch (error) {
				error.message.should.equal(ErrorLib.errorMap.ReStubFunctionError.message);
				done();
			}
		});

		it('stubs correctly for two different objects with same method name', function (done) {

			const obj2 = {
				add: function (a, b) {
					return a - b;
				}
			};

			const obj2AddStub = stubber.stub(obj2, 'add', multiply);
			const resultForObjAdd = obj.add(5, 2);
			const resultForObj2Add = obj2.add(5, 2);
			obj2AddStub.restore();
			resultForObjAdd.should.equal(10);
			resultForObj2Add.should.equal(10);
			done();
		});

		it('re stubs after restore', function (done) {

			let result = obj.add(5, 2);
			result.should.equal(10);

			addStub.restore();
			result = obj.add(5, 2);
			result.should.equal(7);

			addStub = stubber.stub(obj, 'add', multiply);
			result = obj.add(5, 2);
			result.should.equal(10);

			done();
		});

		it('outputs correctly for multiple calls on same object[methodName]', function (done) {

			let result = obj.add(5, 2);
			result.should.equal(10);

			result = obj.add(9, 2);
			result.should.equal(18);

			done();
		});

	});

	describe('should profile correctly for bluebird promises', function () {

		let bluebirdPromiseProfiler;
		before(function beforeAll () {
			mock('../../bluebird', BluebirdPromise);
			bluebirdPromiseProfiler = require(testPath + 'promise_profiler');
			bluebirdPromiseProfiler.startProfiling();
		});

		after(function afterAll () {
			mock.stopAll();
			bluebirdPromiseProfiler.stopProfiling();
		});

		afterEach(function afterEachFunction () {
			bluebirdPromiseProfiler.resetProfiler();
		});

		const getPromise1 = function getPromise1 () {

			return new BluebirdPromise (function promise1Functon (resolve, reject) {

				setTimeout(function promise1Timeout () {
					resolve(1);
				}, 2000);

			});

		};

		const getPromise2 = function getPromise2 () {

			return new BluebirdPromise (function promise2Functon (resolve, reject) {

				setTimeout(function promise1Timeout () {
					resolve(2);
				}, 1000);

			});

		};

		const getPromise3 = function getPromise2 () {

			return new BluebirdPromise (function promise3Functon (resolve, reject) {

				setTimeout(function promise1Timeout () {
					reject(new Error('3'));
				}, 2000);

			});

		};

		const getPromise4 = function getPromise2 () {

			return new BluebirdPromise (function promise4Functon (resolve, reject) {

				setTimeout(function promise1Timeout () {
					reject(new Error('4'));
				}, 1000);

			});

		};

		it('for .then()', function(done) {

			getPromise1().then(function promise1Then (result) {
				result.should.equal(1);
			});

			getPromise2().then(function promise2Then (result) {
				result.should.equal(2);
			});

			setTimeout(function wait () {

				const profilerResult = bluebirdPromiseProfiler.getProfilerResult();
				Object.keys(profilerResult).length.should.equal(2);
				profilerResult.should.have.property('promise1Then');
				profilerResult.should.have.property('promise2Then');
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

				const profilerResult = bluebirdPromiseProfiler.getProfilerResult();
				Object.keys(profilerResult).length.should.equal(2);
				profilerResult.should.have.property('promise3Catch');
				profilerResult.should.have.property('promise4Catch');
				done();

			}, 3000);

		});

		it('for .spread() on resolving promises', function(done) {

			BluebirdPromise.join(getPromise1(), getPromise2()).spread(function spreadFunction (promise1Result, promise2Result) {

				const profilerResult = bluebirdPromiseProfiler.getProfilerResult();
				promise1Result.should.equal(1);
				promise2Result.should.equal(2);
				Object.keys(profilerResult).length.should.equal(1);
				profilerResult.should.have.property('spreadFunction');
				done();

			});

		});

		it('for .spread() on rejecting promises', function(done) {

			BluebirdPromise.join(getPromise3(), getPromise4()).catch(function catchFunction (res) {

				const profilerResult = bluebirdPromiseProfiler.getProfilerResult();
				Object.keys(profilerResult).length.should.equal(1);
				profilerResult.should.have.property('catchFunction');
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

			BluebirdPromise.join(promise1, promise2).spread(function spreadFunction (promise1Result, promise2Result) {

				const profilerResult = bluebirdPromiseProfiler.getProfilerResult();
				promise1Result.should.equal(1);
				promise2Result.should.equal(2);
				Object.keys(profilerResult).length.should.equal(3);
				profilerResult.should.have.property('promise1Then');
				profilerResult.should.have.property('promise2Then');
				profilerResult.should.have.property('spreadFunction');
				done();

			});

		});

		it('for writing profiler results to file', function (done) {

			getPromise1().then(function promise1Then (result) {

				const fullFilePath = __dirname + '/output.json';
				const readFile = BluebirdPromise.promisify(fs.readFile);
				bluebirdPromiseProfiler.writeProfilerResultToFile(fullFilePath).then(function callback () {

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

		it('if startProfiling is called twice or more', function (done) {

			bluebirdPromiseProfiler.startProfiling();
			bluebirdPromiseProfiler.startProfiling();

			getPromise1().then(function promise1Then (result) {

				const profilerResult = bluebirdPromiseProfiler.getProfilerResult();
				result.should.equal(1);
				Object.keys(profilerResult).length.should.equal(1);
				profilerResult.should.have.property('promise1Then');
				done();

			});

		});
	});

	describe('should error out', function () {

		it('for bluebird promise not found', function (done) {

			try {
				const bluebirdPromiseProfiler = new (require(testPath + 'promise_profiler')).__proto__.constructor();
			}
			catch (err) {
				err.message.should.equal(ErrorLib.errorMap.PromiseNotFound.message);
				done();
			}
		});

		it('with promise type error', function (done) {

			mock('../../bluebird', Promise);

			try {
				const bluebirdPromiseProfiler = new (require(testPath + 'promise_profiler')).__proto__.constructor();
				mock.stopAll();
			}
			catch (err) {
				err.message.should.equal(ErrorLib.errorMap.PromiseTypeError.message);
				mock.stopAll();
				done();
			}
		});
	});
}
