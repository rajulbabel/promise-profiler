'use strict';

const errorMap = {

	PromiseTypeError: {
		errorType: TypeError,
		message: 'expecting a bluebird promise'
	},
	PromiseNotFound: {
		errorType: ReferenceError,
		message: 'no bluebird promise library found, make sure that you have bluebird dependency in package.json'
	}

};

const throwError = function throwError (error) {

	throw new error.errorType(error.message);
};

module.exports = {
	throwError: throwError,
	errorMap: errorMap
};
