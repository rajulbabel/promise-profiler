'use strict';

const performanceNow = require('performance-now');
const fs = require('fs');

const stubber = require('./stubber');
const ErrorLib = require('./ErrorLib');

/**
 * @class
 */
class BluebirdPromiseProfiler {

	/**
	 * @constructor
	 */
	constructor () {

		// check for bluebird promise dependency
		let bluebirdPromiseUsed = null;
		try {
			bluebirdPromiseUsed = require(`../../bluebird`);
		}
		catch (e) {
			ErrorLib.throwError(ErrorLib.errorMap.PromiseNotFound);
		}

		if (!bluebirdPromiseUsed.version || typeof bluebirdPromiseUsed.resolve !== 'function' || !(bluebirdPromiseUsed.resolve() instanceof bluebirdPromiseUsed)) {
			ErrorLib.throwError(ErrorLib.errorMap.PromiseTypeError);
		}

		this._promise = bluebirdPromiseUsed;
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
		delete this._profilerResult[''];
		return this._profilerResult;
	}


	/**
	 * Starts profiling on bluebird promise.
	 */
	startProfiling () {

		const self = this;
		try {

			this._spreadStub = stubber.stub(self._promise.prototype, 'spread', function spreadProfiler () {

				const promiseIndex = self._spreadStub.callCount - 1;
				const functionName = self._spreadStub.callingArgs[promiseIndex].name;

				const startTime = performanceNow();
				return this.all()._then((result) => {
					self._profilerResult[functionName] = performanceNow() - startTime;
					return self._spreadStub.callingArgs[promiseIndex](...result);
				});
			});

			this._thenStub = stubber.stub(self._promise.prototype, 'then', function thenProfiler () {

				const promiseIndex = self._thenStub.callCount - 1;
				const functionName = self._thenStub.callingArgs[promiseIndex].name;

				const startTime = performanceNow();
				return this._then((result) => {
					self._profilerResult[functionName] = performanceNow() - startTime;
					return self._thenStub.callingArgs[promiseIndex](result);
				});
			});

			this._catchStub = stubber.stub(self._promise.prototype, 'catch', function catchProfiler () {

				const promiseIndex = self._catchStub.callCount - 1;
				const functionName = self._catchStub.callingArgs[promiseIndex].name;

				const startTime = performanceNow();
				return this._then(undefined, (result) => {
					self._profilerResult[functionName] = performanceNow() - startTime;
					return self._catchStub.callingArgs[promiseIndex](result);
				});
			});
		}
		catch (e) {}

	}


	/**
	 * Stops profiling on bluebird promise.
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
	 * @param {string} fullPath - Specify the full path with .json extension.
	 */
	writeProfilerResultToFile (fullPath = './output.json') {
		const writeFile = this._promise.promisify(fs.writeFile);
		return writeFile(fullPath, JSON.stringify(this._profilerResult, null, 4), 'utf8');
	};


	/**
	 * Resets profiler result, this does not stop further profiling.
	 */
	resetProfiler () {
		this._profilerResult = {};
	};

}

module.exports = new BluebirdPromiseProfiler();
