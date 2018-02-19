'use strict';

const bluebird = require('bluebird');
const performanceNow = require('performance-now');
const sinon = require('sinon');
const fs = require('fs');
const writeFile = bluebird.promisify(fs.writeFile);

// @todo add jsdoc

class BluebirdPromiseProfiler {

	constructor (promise) {
		// @ todo check if promise is a bluebird promise

		this._promise = promise;
		this._profilerResult = {};
		this._spreadStub = null;
		this._thenStub = null;
		this._catchStub = null;
	}

	getProfilerResult () {
		return this._profilerResult;
	}

	startProfiling (self = this) {
		this._spreadStub = sinon.stub(self._promise.prototype, 'spread')
			.callsFake(function spreadProfiler () {

				const promiseIndex = self._spreadStub.callCount - 1;
				const functionName = self._spreadStub.getCall(promiseIndex).args[0].name;

				const startTime = performanceNow();
				return this.all()._then((result) => {
					self._profilerResult[functionName] = performanceNow() - startTime;
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
					return self._catchStub.getCall(promiseIndex).args[0](result);
				});
			});

	}

	stopProfiling () {

		if (this._spreadStub !== null && this._thenStub !== null && this._catchStub !== null) {

			this._spreadStub.restore();
			this._thenStub.restore();
			this._catchStub.restore();
		}
	};

	writeProfilerResultToFile (fullPath = './output.json') {
		return writeFile(fullPath, JSON.stringify(this._profilerResult, null, 4), 'utf8');
	};

	resetProfiler () {
		this._profilerResult = {};
	};

}

module.exports = BluebirdPromiseProfiler;
