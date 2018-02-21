'use strict';

const bluebird = require('bluebird');
const performanceNow = require('performance-now');
const sinon = require('sinon');
const fs = require('fs');
const writeFile = bluebird.promisify(fs.writeFile);

/**
 * @class
 */
class BluebirdPromiseProfiler {

	/**
	 * @constructor
	 * @param {bluebird} promise - The bluebird promise instance used in your code.
	 */
	constructor (promise) {
		// @ todo check if promise is a bluebird promise

		this._promise = promise;
		this._profilerResult = {};
		this._spreadStub = null;
		this._thenStub = null;
		this._catchStub = null;
	}

	/**
	 * Returns back the profiler result as json.
	 * @returns {{}} Profiler Result is returned which a json with key as promise name and value as its execution time in milliseconds.
	 */
	getProfilerResult () {
		return this._profilerResult;
	}

	/**
	 * Starts profiling on the bluebird promise object given in the constructor.
	 * Do not call this method twice or more for the same object.
	 * @param {object} self - Never pass any parameter to this function, the self parameter is automatically assigned to the context of current object.
	 */
	startProfiling (self = this) {
		this._spreadStub = sinon.stub(self._promise.prototype, 'spread')
			.callsFake(function spreadProfiler () {

				const promiseIndex = self._spreadStub.callCount - 1;
				const functionName = self._spreadStub.getCall(promiseIndex).args[0].name;

				const startTime = performanceNow();
				return this.all()._then((result) => {
					self._profilerResult[functionName] = performanceNow() - startTime;
					delete self._profilerResult[''];
					return self._spreadStub.getCall(promiseIndex).args[0](...result);
				});
			});

		this._thenStub = sinon.stub(self._promise.prototype, 'then')
			.callsFake(function thenProfiler () {

				const promiseIndex = self._thenStub.callCount - 1;
				const functionName = self._thenStub.getCall(promiseIndex).args[0].name;

				const startTime = performanceNow();
				return this._then((result) => {
					self._profilerResult[functionName] = performanceNow() - startTime;
					delete self._profilerResult[''];
					return self._thenStub.getCall(promiseIndex).args[0](result);
				});
			});

		this._catchStub = sinon.stub(self._promise.prototype, 'catch')
			.callsFake(function catchProfiler () {

				const promiseIndex = self._catchStub.callCount - 1;
				const functionName = self._catchStub.getCall(promiseIndex).args[0].name;

				const startTime = performanceNow();
				return this._then(undefined, (result) => {
					self._profilerResult[functionName] = performanceNow() - startTime;
					delete self._profilerResult[''];
					return self._catchStub.getCall(promiseIndex).args[0](result);
				});
			});

	}

	/**
	 * Stops profiling on the bluebird promise object given in the constructor.
	 */
	stopProfiling () {

		if (this._spreadStub !== null && this._thenStub !== null && this._catchStub !== null) {

			this._spreadStub.restore();
			this._thenStub.restore();
			this._catchStub.restore();
		}
	};

	/**
	 * Writes the profiler result to a .json file.
	 * @param {string} fullPath - Specify the full path of with .json extension.
	 */
	writeProfilerResultToFile (fullPath = './output.json') {
		return writeFile(fullPath, JSON.stringify(this._profilerResult, null, 4), 'utf8');
	};

	/**
	 * Resets profiler result, this does not stop further profiling.
	 */
	resetProfiler () {
		this._profilerResult = {};
	};

}

module.exports = BluebirdPromiseProfiler;
