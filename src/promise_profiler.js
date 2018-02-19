'use strict';

const bluebird = require('bluebird');
const performanceNow = require('performance-now');
const sinon = require('sinon');
const fs = require('fs');
const writeFile = bluebird.promisify(fs.writeFile);

class BluebirdPromiseProfiler {

	constructor (promise) {
		// check if promise is a bluebird promise

		this.promise = promise;
		this.profilerResult = {};
		this.spreadStub = null;
		this.thenStub = null;
		this.catchStub = null;
	}

	startProfiling (self = this) {

		this.spreadStub = sinon.stub(self.promise.prototype, 'spread').callsFake(function spreadProfiler () {

			const promiseIndex = self.spreadStub.callCount - 1;
			const functionName = self.spreadStub.getCall(promiseIndex).args[0].name;

			const startTime = performanceNow();
			return this.all()._then((result) => {
				self.profilerResult[functionName] = performanceNow() - startTime;
				return self.spreadStub.getCall(promiseIndex).args[0](...result);
			});

		});

		this.thenStub = sinon.stub(self.promise.prototype, 'then').callsFake(function thenProfiler () {

			const promiseIndex = self.thenStub.callCount - 1;
			const functionName = self.thenStub.getCall(promiseIndex).args[0].name;

			const startTime = performanceNow();
			return this._then((result) => {
				self.profilerResult[functionName] = performanceNow() - startTime;
				return self.thenStub.getCall(promiseIndex).args[0](result);
			});

		});

		this.catchStub = sinon.stub(self.promise.prototype, 'catch').callsFake(function catchProfiler () {

			const promiseIndex = self.catchStub.callCount - 1;
			const functionName = self.catchStub.getCall(promiseIndex).args[0].name;

			const startTime = performanceNow();
			return this._then(undefined, (result) => {
				self.profilerResult[functionName] = performanceNow() - startTime;
				return self.catchStub.getCall(promiseIndex).args[0](result);
			});

		});

	}

	stopProfiling () {

		if (this.spreadStub !== null && this.thenStub !== null && this.catchStub !== null) {

			this.spreadStub.restore();
			this.thenStub.restore();
			this.catchStub.restore();

		}

	};

	writeCodeProfilerResultToFile (fullPath = './output.json') {

		return writeFile(fullPath, JSON.stringify(this.profilerResult, null, 4), 'utf8');

	};

	resetCodeProfilerResult () {
		this.profilerResult = {};
	};

}

module.exports = BluebirdPromiseProfiler;
