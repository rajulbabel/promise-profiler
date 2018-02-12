'use strict';

const Promise = require('bluebird');
const performanceNow = require('performance-now');
const sinon = require('sinon');

const methodCallDetails = {};
let spreadStub;
let thenStub;

const startProfiling = function startProfiling () {

	spreadStub = sinon.stub(Promise.prototype, 'spread', function spreadProfiler () {

		const promiseIndex = spreadStub.callCount - 1;
		const functionName = spreadStub.getCall(promiseIndex).args[0].name;

		const startTime = performanceNow();
		return this.all()._then((result) => {
			methodCallDetails[functionName] = performanceNow() - startTime;
			return spreadStub.getCall(promiseIndex).args[0](...result);
		});

	});

	thenStub = sinon.stub(Promise.prototype, 'then', function thenProfiler () {

		const promiseIndex = thenStub.callCount - 1;
		const functionName = thenStub.getCall(promiseIndex).args[0].name;

		const startTime = performanceNow();
		return this._then((result) => {
			methodCallDetails[functionName] = performanceNow() - startTime;
			return thenStub.getCall(promiseIndex).args[0](result);
		});

	});

};

const stopProfiling = function stopProfiling () {

	spreadStub.restore();
	thenStub.restore();
	const fs = require('fs');
	fs.writeFile("./results/output.json", JSON.stringify(methodCallDetails, null, 4), "utf8");

};

module.exports = {
	startProfiling: startProfiling,
	stopProfiling: stopProfiling
};