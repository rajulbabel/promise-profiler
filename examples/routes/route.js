'use strict';

const Promise = require('bluebird');
const Model = require('../models/Model');

/**
 * Route for calling square function in ../models/Model.js
 * @param num
 * @returns {Promise}
 */
const squareRoute = function squareRoute (num) {

	return Model.square(num)
		// the function name 'squarePromise' will be one of the key in output of the profiler whose value would be around 1000 milliseconds
		.then(function squarePromise (result) {

			return {result};

		});
};

const squareAndMultiplyRoute = function squareAndMultiply (num1, num2) {

	return Promise.join(Model.multiply(num1, num2), Model.square(num1))
		// the function name 'spreadFunction' will be one of the key in output of the profiler whose value would be around 2000 milliseconds
		.spread(function spreadFunction (multiplyResult, squareResult) {
			return {multiplyResult, squareResult};
		});

};

module.exports = {
	squareRoute: squareRoute,
	squareAndMultiplyRoute: squareAndMultiplyRoute
};
