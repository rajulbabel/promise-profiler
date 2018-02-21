'use strict';

const Promise = require('bluebird');

/**
 * Makes a delay of one second and returns back a promise which multiplies the two numbers.
 * @param num1
 * @param num2
 * @returns {bluebird} Returns back a promise which multiplies the two numbers.
 */
const multiply = function multiply (num1, num2) {

	return new Promise (function (resolve, reject) {

		setTimeout(function promise1Timeout () {
			resolve(num1 * num2);
		}, 1000);

	});

};

/**
 * Makes delay of one second and then calls multiply which further makes a delay of one second, so total delay is two seconds.
 * @param num1
 * @returns {bluebird} Returns back a promise which multiplies the given number.
 */
const square = function square (num1) {

	return new Promise (function (resolve, reject) {

		setTimeout(function promise1Timeout () {

			multiply(num1, num1)
				// the function name 'multiplyPromise' will be one of the key in output of the profiler whose value would be around 1000 milliseconds
				.then(function multiplyPromise (result) {
					resolve(result);
				});

		}, 1000);

	});

};

module.exports = {
	square: square,
	multiply: multiply
};
